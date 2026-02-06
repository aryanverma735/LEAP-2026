import { collection, getDocs, query, where, FirestoreError } from "firebase/firestore"
import { db } from "../firebase/config"

/**
 * Safely executes a Firestore query with error handling
 */
export async function safeFirestoreQuery<T>(
  collectionName: string,
  queryFn: (collectionRef: any) => any,
): Promise<{ data: T[] | null; error: string | null }> {
  try {
    const collectionRef = collection(db, collectionName)
    const q = queryFn(collectionRef)
    const querySnapshot = await getDocs(q)

    const data: T[] = []
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as unknown as T)
    })

    return { data, error: null }
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error)
    return {
      data: null,
      error:
        error instanceof FirestoreError
          ? `Firebase error (${error.code}): ${error.message}`
          : `Unexpected error: ${error.message}`,
    }
  }
}

/**
 * Checks if Firebase connection is working
 */
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    // Try to fetch a single document from any collection
    const { data, error } = await safeFirestoreQuery("pendingIdeas", (ref) => query(ref, where("__name__", "!=", "")))

    return error === null
  } catch (error) {
    console.error("Firebase connection check failed:", error)
    return false
  }
}
