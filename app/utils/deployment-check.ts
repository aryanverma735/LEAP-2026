/**
 * Utility to check for common deployment issues
 * This can be imported and run during development to identify potential problems
 */

import { db } from "../firebase/config"
import { collection, getDocs, limit, query } from "firebase/firestore"

export async function checkDeploymentIssues() {
  const issues: string[] = []

  // Check Firebase connection
  try {
    const testQuery = query(collection(db, "pendingIdeas"), limit(1))
    await getDocs(testQuery)
    console.log("✅ Firebase connection successful")
  } catch (error) {
    console.error("❌ Firebase connection failed:", error)
    issues.push(`Firebase connection error: ${error.message}`)
  }

  // Check for required environment variables
  const requiredEnvVars = [
    // Add any required environment variables here
  ]

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing environment variable: ${envVar}`)
      issues.push(`Missing environment variable: ${envVar}`)
    }
  }

  return {
    hasIssues: issues.length > 0,
    issues,
    timestamp: new Date().toISOString(),
  }
}
