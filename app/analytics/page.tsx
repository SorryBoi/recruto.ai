"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Clock,
  Award,
  BookOpen,
  Star,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

// Mock data for analytics
const performanceData = [
  { date: "2024-01-01", score: 65 },
  { date: "2024-01-08", score: 72 },
  { date: "2024-01-15", score: 68 },
  { date: "2024-01-22", score: 78 },
  { date: "2024-01-29", score: 82 },
]

const categoryData = [
  { category: "Technical", score: 85 },
  { category: "Behavioral", score: 78 },
  { category: "Communication", score: 82 },
  { category: "Problem Solving", score: 75 },
  { category: "Leadership", score: 70 },
]

const recentInterviews = [
  {
    id: 1,
    jobRole: "Software Engineer",
    score: 82,
    date: "2024-01-29",
    duration: "25m",
    status: "completed",
  },
  {
    id: 2,
    jobRole: "Product Manager",
    score: 78,
    date: "2024-01-22",
    duration: "30m",
    status: "completed",
  },
  {
    id: 3,
    jobRole: "Data Scientist",
    score: 68,
    date: "2024-01-15",
    duration: "22m",
    status: "completed",
  },
]

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

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

  const averageScore = performanceData.reduce((acc, item) => acc + item.score, 0) / performanceData.length
  const latestScore = performanceData[performanceData.length - 1]?.score || 0
  const previousScore = performanceData[performanceData.length - 2]?.score || 0
  const scoreChange = latestScore - previousScore

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/dashboard")} className="text-gray-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Analytics Dashboard</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={selectedTimeframe === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe("7d")}
              >
                7 Days
              </Button>
              <Button
                variant={selectedTimeframe === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe("30d")}
              >
                30 Days
              </Button>
              <Button
                variant={selectedTimeframe === "90d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe("90d")}
              >
                90 Days
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(averageScore)}</div>
              <p className="text-xs text-gray-600">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score Trend</CardTitle>
              {scoreChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${scoreChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {scoreChange >= 0 ? "+" : ""}
                {scoreChange}
              </div>
              <p className="text-xs text-gray-600">From last interview</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews Taken</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentInterviews.length}</div>
              <p className="text-xs text-gray-600">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.5h</div>
              <p className="text-xs text-gray-600">Total this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Performance Over Time</span>
                </CardTitle>
                <CardDescription>Track your interview scores and improvement trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value) => [`${value}%`, "Score"]}
                    />
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#2563eb" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span>Skills Breakdown</span>
                </CardTitle>
                <CardDescription>Your performance across different skill categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                    <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>Recent Interviews</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInterviews.map((interview) => (
                    <div key={interview.id} className="border-l-4 border-blue-200 pl-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{interview.jobRole}</p>
                        <Badge
                          variant={
                            interview.score >= 80 ? "default" : interview.score >= 60 ? "secondary" : "destructive"
                          }
                        >
                          {interview.score}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{new Date(interview.date).toLocaleDateString()}</span>
                        <span>{interview.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skill Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category) => (
                    <div key={category.category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm text-gray-600">{category.score}%</span>
                      </div>
                      <Progress value={category.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">First Interview</p>
                      <p className="text-xs text-gray-600">Completed your first mock interview</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Improving</p>
                      <p className="text-xs text-gray-600">Score increased by 10+ points</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" onClick={() => router.push("/interview")}>
                    Start New Interview
                  </Button>
                  <Button variant="outline" className="w-full">
                    Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
