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
  Bot,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface InterviewData {
  jobRole: string
  difficulty: string
  questions: Array<{ text: string; category: string; difficulty: string }>
  answers: string[]
  analyses: Array<{
    score: number
    strengths: string[]
    improvements: string[]
    feedback: string
    suggestedAnswer: string
  }>
  timeElapsed: number
  completedAt: string
  overallScore: number
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d")
  const [userInterviews, setUserInterviews] = useState<InterviewData[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Load user's interview history
    const interviews = JSON.parse(localStorage.getItem("userInterviews") || "[]")
    setUserInterviews(interviews)
  }, [])

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

  // Calculate analytics from user's actual interview data
  const performanceData = userInterviews.map((interview, index) => ({
    date: new Date(interview.completedAt).toLocaleDateString(),
    score: interview.overallScore,
    interview: index + 1,
  }))

  // Calculate category performance
  const categoryScores: { [key: string]: number[] } = {}
  userInterviews.forEach((interview) => {
    interview.questions.forEach((question, qIndex) => {
      const category = question.category
      const score = interview.analyses[qIndex]?.score || 0
      if (!categoryScores[category]) {
        categoryScores[category] = []
      }
      categoryScores[category].push(score)
    })
  })

  const categoryData = Object.entries(categoryScores).map(([category, scores]) => ({
    category,
    score: Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length),
    count: scores.length,
  }))

  // Job role distribution
  const jobRoleData = userInterviews.reduce((acc: { [key: string]: number }, interview) => {
    acc[interview.jobRole] = (acc[interview.jobRole] || 0) + 1
    return acc
  }, {})

  const jobRoleChartData = Object.entries(jobRoleData).map(([role, count]) => ({
    role,
    count,
  }))

  const averageScore =
    userInterviews.length > 0
      ? Math.round(userInterviews.reduce((acc, interview) => acc + interview.overallScore, 0) / userInterviews.length)
      : 0

  const latestScore = userInterviews.length > 0 ? userInterviews[userInterviews.length - 1].overallScore : 0
  const previousScore = userInterviews.length > 1 ? userInterviews[userInterviews.length - 2].overallScore : latestScore
  const scoreChange = latestScore - previousScore

  const totalPracticeTime = userInterviews.reduce((acc, interview) => acc + interview.timeElapsed, 0)
  const totalPracticeHours = Math.round((totalPracticeTime / 3600) * 10) / 10

  // All strengths and improvements
  const allStrengths = userInterviews.flatMap((interview) =>
    interview.analyses.flatMap((analysis) => analysis.strengths),
  )
  const allImprovements = userInterviews.flatMap((interview) =>
    interview.analyses.flatMap((analysis) => analysis.improvements),
  )

  const strengthCounts = allStrengths.reduce((acc: { [key: string]: number }, strength) => {
    acc[strength] = (acc[strength] || 0) + 1
    return acc
  }, {})

  const improvementCounts = allImprovements.reduce((acc: { [key: string]: number }, improvement) => {
    acc[improvement] = (acc[improvement] || 0) + 1
    return acc
  }, {})

  const topStrengths = Object.entries(strengthCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([strength]) => strength)

  const topImprovements = Object.entries(improvementCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([improvement]) => improvement)

  const COLORS = ["#2563eb", "#7c3aed", "#dc2626", "#ea580c", "#16a34a", "#ca8a04"]

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
                <span className="text-xl font-bold text-gray-900">AI Analytics Dashboard</span>
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
        {userInterviews.length === 0 ? (
          // No interviews yet
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Interview Data Yet</h2>
            <p className="text-gray-600 mb-8">
              Take your first AI mock interview to start seeing detailed analytics and performance insights.
            </p>
            <Button onClick={() => router.push("/interview")} className="bg-blue-600 hover:bg-blue-700">
              <Bot className="w-4 h-4 mr-2" />
              Start Your First AI Interview
            </Button>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average AI Score</CardTitle>
                  <Star className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageScore}</div>
                  <p className="text-xs text-gray-600">Based on AI analysis</p>
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
                  <CardTitle className="text-sm font-medium">AI Interviews</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userInterviews.length}</div>
                  <p className="text-xs text-gray-600">Total completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
                  <Clock className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPracticeHours}h</div>
                  <p className="text-xs text-gray-600">Total practice time</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Performance Charts */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span>AI Score Progression</span>
                    </CardTitle>
                    <CardDescription>Track your improvement with AI-powered analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="interview" tickFormatter={(value) => `Interview ${value}`} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                          labelFormatter={(value) => `Interview ${value}`}
                          formatter={(value) => [`${value}%`, "AI Score"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{ fill: "#2563eb" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <span>Skills Performance</span>
                    </CardTitle>
                    <CardDescription>AI analysis of your performance across different skill categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, "Average Score"]} />
                        <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {jobRoleChartData.length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Interview Distribution by Role</CardTitle>
                      <CardDescription>Breakdown of interviews by job role</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={jobRoleChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ role, count }) => `${role}: ${count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {jobRoleChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <span>Recent AI Interviews</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userInterviews
                        .slice(-5)
                        .reverse()
                        .map((interview, index) => (
                          <div key={index} className="border-l-4 border-blue-200 pl-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm">{interview.jobRole}</p>
                              <Badge
                                variant={
                                  interview.overallScore >= 80
                                    ? "default"
                                    : interview.overallScore >= 60
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {interview.overallScore}%
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>{new Date(interview.completedAt).toLocaleDateString()}</span>
                              <span>{Math.round(interview.timeElapsed / 60)}m</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI-Identified Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {topStrengths.slice(0, 5).map((strength, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                          <span className="text-sm text-gray-700">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Improvement Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {topImprovements.slice(0, 5).map((improvement, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                          <span className="text-sm text-gray-700">{improvement}</span>
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
                          <p className="text-xs text-gray-500 mt-1">{category.count} questions analyzed</p>
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
                          <p className="text-sm font-medium">First AI Interview</p>
                          <p className="text-xs text-gray-600">Completed your first AI-powered interview</p>
                        </div>
                      </div>
                      {userInterviews.length >= 5 && (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Interview Veteran</p>
                            <p className="text-xs text-gray-600">Completed 5+ AI interviews</p>
                          </div>
                        </div>
                      )}
                      {scoreChange > 0 && (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Improving</p>
                            <p className="text-xs text-gray-600">AI score increased from last interview</p>
                          </div>
                        </div>
                      )}
                      {averageScore >= 80 && (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Star className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">High Performer</p>
                            <p className="text-xs text-gray-600">Average AI score above 80%</p>
                          </div>
                        </div>
                      )}
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
                        <Bot className="w-4 h-4 mr-2" />
                        Start New AI Interview
                      </Button>
                      <Button variant="outline" className="w-full">
                        Export AI Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
