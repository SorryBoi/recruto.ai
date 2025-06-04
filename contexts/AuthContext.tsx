"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getUserProfile, type UserProfile } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshProfile: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid)
        setUserProfile(profile)
      } catch (error) {
        console.error("Error refreshing user profile:", error)
      }
    }
  }

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user)

        if (user) {
          try {
            const profile = await getUserProfile(user.uid)
            if (profile) {
              setUserProfile(profile)
            } else {
              // Create a profile from auth user data if none exists
              const fallbackProfile: UserProfile = {
                uid: user.uid,
                email: user.email || "",
                firstName: user.displayName?.split(" ")[0] || "",
                lastName: user.displayName?.split(" ")[1] || "",
                createdAt: new Date(),
                lastLoginAt: new Date(),
              }
              setUserProfile(fallbackProfile)
            }
          } catch (error) {
            console.error("Error fetching user profile:", error)
            // Create a minimal profile from the auth user object
            const fallbackProfile: UserProfile = {
              uid: user.uid,
              email: user.email || "",
              firstName: user.displayName?.split(" ")[0] || "",
              lastName: user.displayName?.split(" ")[1] || "",
              createdAt: new Date(),
              lastLoginAt: new Date(),
            }
            setUserProfile(fallbackProfile)
          }
        } else {
          setUserProfile(null)
        }

        setLoading(false)
      })

      return unsubscribe
    } catch (error) {
      console.error("Error in auth state change:", error)
      setLoading(false)
      return () => {}
    }
  }, [])

  return <AuthContext.Provider value={{ user, userProfile, loading, refreshProfile }}>{children}</AuthContext.Provider>
}
