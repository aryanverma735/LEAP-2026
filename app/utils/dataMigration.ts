import { collection, getDocs, doc, updateDoc, query } from "firebase/firestore"
import { db } from "../firebase/config"

// Function mappings for standardization
const FUNCTION_MAPPINGS: { [key: string]: string } = {
  "DDO - Sanction": "DDO",
  "DDO - Carelon BH": "DDO",
  "DDO-Sanction": "DDO",
  "PDS - Rework": "Re-work",
  Rework: "Re-work",
  "Entire CA, Terms/Re-work": "Re-work",
  "PCM Medicare": "PCM",
  "L&D": "L&D Offshore",
}

// Functional Manager mappings for standardization
const FUNCTIONAL_MANAGER_MAPPINGS: { [key: string]: string } = {
  "Arun Raj": "Ravindran, Arun Raj",
  "Arun Raj Ravindran": "Ravindran, Arun Raj",
  "Deepa K v s": "K v s, Deepa",
  "Deepa KVS": "K v s, Deepa",
  "Anupam Chatterjee": "Chatterjee, Anupam",
  "Kandaswamy Krishnakumar": "Kandasamy, Krishnakumar",
  "Aparna BN": "Bn, Aparna",
}

interface IdeaDocument {
  id: string
  function?: string
  functionalManager?: string
  [key: string]: any
}

export async function migrateCollectionData(collectionName: string): Promise<{
  success: boolean
  updatedCount: number
  errors: string[]
}> {
  const errors: string[] = []
  let updatedCount = 0

  try {
    console.log(`Starting migration for collection: ${collectionName}`)

    const q = query(collection(db, collectionName))
    const querySnapshot = await getDocs(q)

    console.log(`Found ${querySnapshot.docs.length} documents in ${collectionName}`)

    for (const docSnapshot of querySnapshot.docs) {
      try {
        const data = docSnapshot.data() as IdeaDocument
        const updates: { [key: string]: string } = {}
        let needsUpdate = false

        // Check if function needs updating
        if (data.function && FUNCTION_MAPPINGS[data.function]) {
          updates.function = FUNCTION_MAPPINGS[data.function]
          needsUpdate = true
          console.log(`Updating function: "${data.function}" -> "${updates.function}"`)
        }

        // Check if functionalManager needs updating
        if (data.functionalManager && FUNCTIONAL_MANAGER_MAPPINGS[data.functionalManager]) {
          updates.functionalManager = FUNCTIONAL_MANAGER_MAPPINGS[data.functionalManager]
          needsUpdate = true
          console.log(`Updating functionalManager: "${data.functionalManager}" -> "${updates.functionalManager}"`)
        }

        // Apply updates if needed
        if (needsUpdate) {
          const docRef = doc(db, collectionName, docSnapshot.id)
          await updateDoc(docRef, updates)
          updatedCount++
          console.log(`Updated document ${docSnapshot.id} in ${collectionName}`)
        }
      } catch (error) {
        const errorMsg = `Error updating document ${docSnapshot.id}: ${error.message}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    console.log(`Migration completed for ${collectionName}. Updated ${updatedCount} documents.`)
    return { success: true, updatedCount, errors }
  } catch (error) {
    const errorMsg = `Error migrating collection ${collectionName}: ${error.message}`
    console.error(errorMsg)
    return { success: false, updatedCount, errors: [errorMsg, ...errors] }
  }
}

export async function migrateAllCollections(): Promise<{
  success: boolean
  results: { [collectionName: string]: { updatedCount: number; errors: string[] } }
}> {
  const collections = ["pendingIdeas", "approvedIdeas", "rejectedIdeas"]
  const results: { [collectionName: string]: { updatedCount: number; errors: string[] } } = {}
  let overallSuccess = true

  console.log("Starting data migration for all collections...")

  for (const collectionName of collections) {
    try {
      const result = await migrateCollectionData(collectionName)
      results[collectionName] = {
        updatedCount: result.updatedCount,
        errors: result.errors,
      }

      if (!result.success) {
        overallSuccess = false
      }
    } catch (error) {
      console.error(`Failed to migrate collection ${collectionName}:`, error)
      results[collectionName] = {
        updatedCount: 0,
        errors: [`Failed to migrate: ${error.message}`],
      }
      overallSuccess = false
    }
  }

  console.log("Data migration completed for all collections.")
  return { success: overallSuccess, results }
}

// Function to preview what changes would be made without actually updating
export async function previewMigrationChanges(): Promise<{
  collections: {
    [collectionName: string]: {
      totalDocs: number
      changesPreview: Array<{
        docId: string
        currentFunction?: string
        newFunction?: string
        currentFunctionalManager?: string
        newFunctionalManager?: string
      }>
    }
  }
}> {
  const collections = ["pendingIdeas", "approvedIdeas", "rejectedIdeas"]
  const result: any = { collections: {} }

  for (const collectionName of collections) {
    try {
      const q = query(collection(db, collectionName))
      const querySnapshot = await getDocs(q)

      const changesPreview: Array<{
        docId: string
        currentFunction?: string
        newFunction?: string
        currentFunctionalManager?: string
        newFunctionalManager?: string
      }> = []

      querySnapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data() as IdeaDocument
        const change: any = { docId: docSnapshot.id }
        let hasChanges = false

        if (data.function && FUNCTION_MAPPINGS[data.function]) {
          change.currentFunction = data.function
          change.newFunction = FUNCTION_MAPPINGS[data.function]
          hasChanges = true
        }

        if (data.functionalManager && FUNCTIONAL_MANAGER_MAPPINGS[data.functionalManager]) {
          change.currentFunctionalManager = data.functionalManager
          change.newFunctionalManager = FUNCTIONAL_MANAGER_MAPPINGS[data.functionalManager]
          hasChanges = true
        }

        if (hasChanges) {
          changesPreview.push(change)
        }
      })

      result.collections[collectionName] = {
        totalDocs: querySnapshot.docs.length,
        changesPreview,
      }
    } catch (error) {
      console.error(`Error previewing changes for ${collectionName}:`, error)
      result.collections[collectionName] = {
        totalDocs: 0,
        changesPreview: [],
        error: error.message,
      }
    }
  }

  return result
}
