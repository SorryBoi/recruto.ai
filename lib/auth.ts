import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

export interface UserProfile {
  uid: string
  email: string
  firstName: string
  lastName: string
  createdAt: Date
  lastLoginAt: Date
}

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      firstName,
      lastName,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    }

    await setDoc(doc(db, "users", user.uid), userProfile)

    return user
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update last login time
    await setDoc(
      doc(db, "users", user.uid),
      {
        lastLoginAt: new Date(),
      },
      { merge: true },
    )

    return user
  } catch (error: any) {
    // Handle specific error codes
    if (error.code === "auth/user-not-found") {
      throw new Error("An account using this email is not created. Please sign up to create an account.")
    } else if (error.code === "auth/wrong-password") {
      throw new Error("Incorrect password. Please try again.")
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email address.")
    } else if (error.code === "auth/user-disabled") {
      throw new Error("This account has been disabled.")
    } else if (error.code === "auth/too-many-requests") {
      throw new Error("Too many failed login attempts. Please try again later.")
    } else if (error.code === "auth/invalid-credential") {
      throw new Error("Invalid email or password. Please check your credentials.")
    }
    throw new Error(error.message)
  }
}

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider()
    // Add custom parameters to ensure we get a fresh login
    provider.setCustomParameters({
      prompt: "select_account",
    })

    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user

    // Check if user profile exists, if not create one
    const userDoc = await getDoc(doc(db, "users", user.uid))

    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        createdAt: new Date(),
        lastLoginAt: new Date(),
      }
      await setDoc(doc(db, "users", user.uid), userProfile)
    } else {
      // Update last login time
      await setDoc(
        doc(db, "users", user.uid),
        {
          lastLoginAt: new Date(),
        },
        { merge: true },
      )
    }

    return user
  } catch (error: any) {
    // Handle specific Google auth errors
    if (error.code === "auth/unauthorized-domain") {
      throw new Error("This domain is not authorized for Google sign-in. Please contact support.")
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in was cancelled. Please try again.")
    } else if (error.code === "auth/popup-blocked") {
      throw new Error("Pop-up was blocked by your browser. Please allow pop-ups and try again.")
    }
    throw new Error(error.message)
  }
}

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error: any) {
    console.error("Error fetching user profile:", error)
    // Return a minimal profile with just the UID when permissions fail
    return {
      uid,
      email: "",
      firstName: "",
      lastName: "",
      createdAt: new Date(),
      lastLoginAt: new Date(),
    }
  }
}
