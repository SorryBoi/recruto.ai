import admin from "firebase-admin"

// Check if Firebase Admin is already initialized
let firebaseAdmin: admin.app.App

try {
  firebaseAdmin = admin.app()
} catch (error) {
  // Initialize Firebase Admin with service account if not already initialized
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }

  // Only initialize if we have the required credentials
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    })
  } else {
    // Create a placeholder app for development
    firebaseAdmin = admin.initializeApp({
      projectId: "placeholder-project",
    })
    console.warn("Firebase Admin initialized with placeholder. Some server-side features may not work.")
  }
}

export const adminAuth = firebaseAdmin.auth()
export const adminFirestore = firebaseAdmin.firestore()

export default firebaseAdmin
