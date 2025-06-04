"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  ArrowLeft,
  CheckCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  Star,
  RefreshCw,
  Download,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface InterviewResult {
  jobRole: string
  difficulty: string
  questions: Array<{ text: string; category: string }>
  answers: string[]
  timeElapsed: number
  completedAt: string
}

export default function InterviewResultsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [interviewData, setInterviewData] = useState<InterviewResult | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const savedInterview = localStorage.getItem("lastInterview")
    if (savedInterview) {
      setInterviewData(JSON.parse(savedInterview))
    } else {
      router.push("/interview")
    }
  }, [router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const calculateScore = () => {
    if (!interviewData) return 0
    // Simple scoring based on answer length and completion
    const avgAnswerLength =
      interviewData.answers.reduce((acc, answer) => acc + answer.length, 0) / interviewData.answers.length
    const completionBonus = interviewData.answers.length === interviewData.questions.length ? 20 : 0
    const lengthScore = Math.min(avgAnswerLength / 10, 60) // Max 60 points for length
    return Math.round(lengthScore + completionBonus)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: "Excellent", color: "bg-green-100 text-green-800" }
    if (score >= 60) return { text: "Good", color: "bg-yellow-100 text-yellow-800" }
    return { text: "Needs Improvement", color: "bg-red-100 text-red-800" }
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

  if (!user || !interviewData) {
    return null
  }

  const score = calculateScore()
  const scoreBadge = getScoreBadge(score)

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
                <span className="text-xl font-bold text-gray-900">Interview Results</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => router.push("/interview")}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Take Another Interview
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Success Message */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-green-900">Interview Completed Successfully!</h2>
                  <p className="text-green-700">
                    Great job completing your mock interview. Here's your detailed feedback.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span>Overall Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>{score}</div>
                  <div className="text-gray-600 mb-4">out of 100</div>
                  <Badge className={scoreBadge.color}>{scoreBadge.text}</Badge>
                </div>
                <Progress value={score} className="h-3" />
              </CardContent>
            </Card>

            {/* Question by Question Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Question Analysis</span>
                </CardTitle>
                <CardDescription>Review your answers and get personalized feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {interviewData.questions.map((question, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                        <Badge variant="outline">{question.category}</Badge>
                      </div>
                      <p className="text-gray-700 mb-3">{question.text}</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Your Answer:</p>
                        <p className="text-gray-800">{interviewData.answers[index] || "No answer provided"}</p>
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>AI Feedback:</strong> Good structure in your response. Consider adding more specific
                          examples to strengthen your answer.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Job Role</p>
                  <p className="font-medium capitalize">{interviewData.jobRole.replace("-", " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="font-medium capitalize">{interviewData.difficulty}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(interviewData.timeElapsed)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Questions Answered</p>
                  <p className="font-medium">
                    {interviewData.answers.length} of {interviewData.questions.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="font-medium">{new Date(interviewData.completedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Improvement Areas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Add more specific examples to your answers</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Practice the STAR method for behavioral questions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Work on concise yet comprehensive responses</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline" onClick={() => router.push("/interview")}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Practice Again
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => router.push("/analytics")}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
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
