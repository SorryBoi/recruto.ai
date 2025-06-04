"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function FirebaseInitializer() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // This will trigger Firebase initialization
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isInitialized) {
        setIsInitialized(true)
      }
    })

    return () => unsubscribe()
  }, [isInitialized])

  return null
}
