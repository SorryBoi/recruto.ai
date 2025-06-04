"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, LogOut, User, BookOpen, TrendingUp, Award, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { signOutUser } from "@/lib/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [firestoreError, setFirestoreError] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Check if we have a Firestore permissions error
  useEffect(() => {
    if (user && userProfile && !userProfile.email) {
      setFirestoreError(true)
    }
  }, [user, userProfile])

  const handleSignOut = async () => {
    try {
      await signOutUser()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Target className="w-5 h-5 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">recruto.ai</span>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800">
                Welcome,{" "}
                {userProfile?.firstName || user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "User"}!
              </Badge>
              <Button onClick={handleSignOut} variant="ghost" className="text-gray-600 hover:text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 lg:px-6 py-8">
        {firestoreError && (
          <Alert variant="warning" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Firestore Access Issue</AlertTitle>
            <AlertDescription>
              We're having trouble accessing your complete profile data. Some features may be limited.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to your Dashboard</h1>
          <p className="text-gray-600">Start your interview preparation journey with our AI-powered tools</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mock Interviews</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-600">Completed this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-gray-600">Overall improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-600">Badges earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Start Mock Interview</CardTitle>
              <CardDescription>Practice with our AI interviewer and get instant feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Start Interview</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Progress</CardTitle>
              <CardDescription>Track your improvement and see detailed analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Profile Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> {user.email || "Not available"}
              </p>
              {!firestoreError ? (
                <>
                  <p>
                    <strong>Name:</strong> {userProfile?.firstName} {userProfile?.lastName}
                  </p>
                  <p>
                    <strong>Member since:</strong>{" "}
                    {userProfile?.createdAt
                      ? new Date(
                          typeof userProfile.createdAt === "object" && "seconds" in userProfile.createdAt
                            ? userProfile.createdAt.seconds * 1000
                            : userProfile.createdAt,
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Last login:</strong>{" "}
                    {userProfile?.lastLoginAt
                      ? new Date(
                          typeof userProfile.lastLoginAt === "object" && "seconds" in userProfile.lastLoginAt
                            ? userProfile.lastLoginAt.seconds * 1000
                            : userProfile.lastLoginAt,
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </>
              ) : (
                <div className="py-2">
                  <p className="text-amber-600">
                    Additional profile information is not available due to database permissions.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Update Profile
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
