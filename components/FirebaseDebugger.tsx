"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAuth, signInAnonymously } from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function FirebaseDebugger() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({})
  const [showDebugger, setShowDebugger] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({})
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    // Collect environment variables (only public ones)
    setEnvVars({
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    })
  }, [])

  const runTests = async () => {
    setIsTesting(true)
    const results: Record<string, { success: boolean; message: string }> = {}

    // Test 1: Firebase Auth Initialization
    try {
      const authInstance = getAuth()
      results["authInit"] = {
        success: true,
        message: "Firebase Auth initialized successfully",
      }
    } catch (error) {
      results["authInit"] = {
        success: false,
        message: `Firebase Auth initialization failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }

    // Test 2: Firestore Initialization
    try {
      const firestoreInstance = getFirestore()
      results["firestoreInit"] = {
        success: true,
        message: "Firestore initialized successfully",
      }
    } catch (error) {
      results["firestoreInit"] = {
        success: false,
        message: `Firestore initialization failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }

    // Test 3: Anonymous Auth
    try {
      const userCredential = await signInAnonymously(auth)
      results["anonAuth"] = {
        success: true,
        message: `Anonymous auth successful: ${userCredential.user.uid.substring(0, 6)}...`,
      }
    } catch (error) {
      results["anonAuth"] = {
        success: false,
        message: `Anonymous auth failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }

    // Test 4: Firestore Read
    try {
      const testDocRef = doc(db, "test", "test-doc")
      const testDoc = await getDoc(testDocRef)
      results["firestoreRead"] = {
        success: true,
        message: testDoc.exists() ? "Firestore read successful with data" : "Firestore read successful (no data)",
      }
    } catch (error) {
      results["firestoreRead"] = {
        success: false,
        message: `Firestore read failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }

    // Test 5: Firestore Write
    try {
      const testDocRef = doc(db, "test", "test-doc")
      await setDoc(testDocRef, { timestamp: new Date().toISOString() }, { merge: true })
      results["firestoreWrite"] = {
        success: true,
        message: "Firestore write successful",
      }
    } catch (error) {
      results["firestoreWrite"] = {
        success: false,
        message: `Firestore write failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }

    setTestResults(results)
    setIsTesting(false)
  }

  if (!showDebugger) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setShowDebugger(true)} variant="outline" size="sm">
          Debug Firebase
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Firebase Configuration Debug</CardTitle>
          <Button onClick={() => setShowDebugger(false)} variant="ghost" size="sm">
            Close
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <p className="font-semibold">Environment Variables:</p>
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span className="font-mono">
                  {value ? `${value.substring(0, 4)}...` : <span className="text-red-500">Not set</span>}
                </span>
              </div>
            ))}

            <div className="mt-4">
              <Button onClick={runTests} disabled={isTesting} size="sm" className="w-full" variant="outline">
                {isTesting ? "Running Tests..." : "Test Firebase Connection"}
              </Button>
            </div>

            {Object.keys(testResults).length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="font-semibold">Test Results:</p>
                {Object.entries(testResults).map(([test, result]) => (
                  <div key={test} className="text-xs">
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${result.success ? "bg-green-500" : "bg-red-500"}`}
                      ></div>
                      <span className="font-medium">{test}:</span>
                    </div>
                    <p className={`ml-4 ${result.success ? "text-green-600" : "text-red-600"}`}>{result.message}</p>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-4 text-sm text-gray-500">
              If any values show "Not set", you need to add them to your .env.local file or environment variables.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
