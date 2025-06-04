"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Target,
  ArrowLeft,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  RefreshCw,
  Download,
  Bot,
  User,
  Lightbulb,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface InterviewResult {
  jobRole: string
  difficulty: string
  questions: Array<{ question?: string; text?: string; category: string; difficulty: string }>
  answers: string[]
  analyses: Array<{
    score: number
    strengths: string[]
    weaknesses?: string[]
    improvements?: string[]
    feedback?: string
    detailedFeedback?: string
    suggestedAnswer?: string
    idealAnswer?: string
  }>
  timeElapsed: number
  completedAt: string
  overallScore: number
  interviewSummary?: {
    overallFeedback: string
    keyStrengths: string[]
    criticalImprovements: string[]
    readinessScore: number
    nextSteps: string[]
  }
}

export default function InterviewResultsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [interviewData, setInterviewData] = useState<InterviewResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const savedInterview = localStorage.getItem("lastInterview")
      if (savedInterview) {
        const parsedData = JSON.parse(savedInterview)

        // Validate and normalize the data structure
        const normalizedData: InterviewResult = {
          jobRole: parsedData.jobRole || "Unknown Role",
          difficulty: parsedData.difficulty || "Unknown",
          questions: (parsedData.questions || []).map((q: any) => ({
            question: q.question || q.text || "Question not available",
            text: q.question || q.text || "Question not available",
            category: q.category || "General",
            difficulty: q.difficulty || parsedData.difficulty || "Unknown",
          })),
          answers: parsedData.answers || [],
          analyses: (parsedData.analyses || []).map((a: any) => ({
            score: a.score || 0,
            strengths: a.strengths || [],
            weaknesses: a.weaknesses || a.improvements || [],
            improvements: a.improvements || a.weaknesses || [],
            feedback: a.feedback || a.detailedFeedback || "No feedback available",
            detailedFeedback: a.detailedFeedback || a.feedback || "No feedback available",
            suggestedAnswer: a.suggestedAnswer || a.idealAnswer || "No suggested answer available",
            idealAnswer: a.idealAnswer || a.suggestedAnswer || "No ideal answer available",
          })),
          timeElapsed: parsedData.timeElapsed || 0,
          completedAt: parsedData.completedAt || new Date().toISOString(),
          overallScore: parsedData.overallScore || 0,
          interviewSummary: parsedData.interviewSummary || {
            overallFeedback: "Interview completed successfully.",
            keyStrengths: ["Communication", "Relevant experience"],
            criticalImprovements: ["Add more examples", "Provide more detail"],
            readinessScore: parsedData.overallScore || 75,
            nextSteps: ["Practice more questions", "Prepare specific examples"],
          },
        }

        setInterviewData(normalizedData)
      } else {
        setError("No interview data found")
        setTimeout(() => router.push("/interview"), 2000)
      }
    } catch (error) {
      console.error("Error loading interview data:", error)
      setError("Error loading interview results")
      setTimeout(() => router.push("/dashboard"), 3000)
    }
  }, [router])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: "Excellent", color: "bg-green-100 text-green-800" }
    if (score >= 80) return { text: "Very Good", color: "bg-blue-100 text-blue-800" }
    if (score >= 70) return { text: "Good", color: "bg-yellow-100 text-yellow-800" }
    if (score >= 60) return { text: "Fair", color: "bg-orange-100 text-orange-800" }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (!user || !interviewData) {
    return null
  }

  const scoreBadge = getScoreBadge(interviewData.overallScore)
  const allStrengths = interviewData.analyses?.flatMap((a) => a.strengths || []) || []
  const allImprovements = interviewData.analyses?.flatMap((a) => a.improvements || a.weaknesses || []) || []
  const uniqueStrengths = [...new Set(allStrengths)]
  const uniqueImprovements = [...new Set(allImprovements)]

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
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-green-900">Interview Analysis Complete!</h2>
                  <p className="text-green-700">
                    Your interview has been analyzed and detailed feedback is ready for review.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-6">
          {/* Main Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span>Overall Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getScoreColor(interviewData.overallScore)} mb-2`}>
                      {interviewData.overallScore}
                    </div>
                    <div className="text-gray-600 mb-4">out of 100</div>
                    <Badge className={scoreBadge.color}>{scoreBadge.text}</Badge>
                  </div>
                  <div className="md:col-span-2">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Overall Score</span>
                          <span className="text-sm text-gray-600">{interviewData.overallScore}%</span>
                        </div>
                        <Progress value={interviewData.overallScore} className="h-3" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Questions Answered:</span>
                          <span className="ml-2 font-medium">{interviewData.answers.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="ml-2 font-medium">{formatTime(interviewData.timeElapsed)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interview Summary */}
            {interviewData.interviewSummary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <span>Interview Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Overall Feedback</h4>
                      <p className="text-blue-800">{interviewData.interviewSummary.overallFeedback}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Key Strengths
                        </h4>
                        <ul className="space-y-1">
                          {interviewData.interviewSummary.keyStrengths.map((strength, index) => (
                            <li key={index} className="text-green-800 text-sm flex items-start">
                              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-1">
                          {interviewData.interviewSummary.criticalImprovements.map((improvement, index) => (
                            <li key={index} className="text-orange-800 text-sm flex items-start">
                              <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Next Steps
                      </h4>
                      <ul className="space-y-1">
                        {interviewData.interviewSummary.nextSteps.map((step, index) => (
                          <li key={index} className="text-purple-800 text-sm flex items-start">
                            <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span>Question-by-Question Analysis</span>
                </CardTitle>
                <CardDescription>Detailed feedback for each interview question</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="questions" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="questions">Question Analysis</TabsTrigger>
                    <TabsTrigger value="strengths">Strengths</TabsTrigger>
                    <TabsTrigger value="improvements">Improvements</TabsTrigger>
                  </TabsList>

                  <TabsContent value="questions" className="space-y-6 mt-6">
                    {interviewData.questions.map((question, index) => (
                      <div key={index} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-lg">Question {index + 1}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{question.category}</Badge>
                            <Badge
                              className={`${getScoreColor(interviewData.analyses[index]?.score || 0)} bg-opacity-10`}
                            >
                              {interviewData.analyses[index]?.score || 0}/100
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <Bot className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-900 mb-1">Question:</p>
                                <p className="text-blue-800">{question.question || question.text}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <User className="w-5 h-5 text-gray-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900 mb-1">Your Answer:</p>
                                <p className="text-gray-800">{interviewData.answers[index] || "No answer provided"}</p>
                              </div>
                            </div>
                          </div>

                          {interviewData.analyses[index] && (
                            <>
                              <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-start space-x-3">
                                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-green-900 mb-2">Feedback:</p>
                                    <p className="text-green-800 mb-3">{interviewData.analyses[index].feedback}</p>
                                    {interviewData.analyses[index].strengths.length > 0 && (
                                      <div>
                                        <p className="font-medium text-green-900 mb-1">Strengths:</p>
                                        <ul className="list-disc list-inside text-green-800 text-sm">
                                          {interviewData.analyses[index].strengths.map((strength, i) => (
                                            <li key={i}>{strength}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="flex items-start space-x-3">
                                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-yellow-900 mb-2">Suggested Better Answer:</p>
                                    <p className="text-yellow-800">{interviewData.analyses[index].suggestedAnswer}</p>
                                  </div>
                                </div>
                              </div>

                              {interviewData.analyses[index].improvements &&
                                interviewData.analyses[index].improvements.length > 0 && (
                                  <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                                      <div>
                                        <p className="font-medium text-orange-900 mb-1">Areas for Improvement:</p>
                                        <ul className="list-disc list-inside text-orange-800 text-sm">
                                          {interviewData.analyses[index].improvements.map((improvement, i) => (
                                            <li key={i}>{improvement}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="strengths" className="mt-6">
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Your Key Strengths
                      </h3>
                      <ul className="space-y-2">
                        {uniqueStrengths.map((strength, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                            <span className="text-green-800">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="improvements" className="mt-6">
                    <div className="bg-orange-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-orange-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {uniqueImprovements.map((improvement, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                            <span className="text-orange-800">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
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
                  <p className="font-medium">{interviewData.jobRole}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Experience Level</p>
                  <p className="font-medium">{interviewData.difficulty}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(interviewData.timeElapsed)}
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
                <CardTitle>Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interviewData.analyses.map((analysis, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">Q{index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={analysis.score} className="w-16 h-2" />
                        <span className="text-sm font-medium w-8">{analysis.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
