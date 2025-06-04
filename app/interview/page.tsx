"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Target,
  ArrowLeft,
  Play,
  Mic,
  MicOff,
  Clock,
  MessageSquare,
  Lightbulb,
  CheckCircle,
  Bot,
  User,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import {
  generateInterviewQuestions,
  analyzeAnswer,
  generateInterviewerResponse,
  type InterviewQuestion,
  type InterviewAnalysis,
} from "@/lib/ai-interview"

interface InterviewData {
  jobRole: string
  difficulty: string
  questions: InterviewQuestion[]
  answers: string[]
  analyses: InterviewAnalysis[]
  timeElapsed: number
  completedAt: string
  overallScore: number
}

export default function InterviewPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [answer, setAnswer] = useState("")
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [selectedJobRole, setSelectedJobRole] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [analyses, setAnalyses] = useState<InterviewAnalysis[]>([])
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [interviewerResponse, setInterviewerResponse] = useState("")
  const [showInterviewerResponse, setShowInterviewerResponse] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (interviewStarted) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [interviewStarted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartInterview = async () => {
    if (!selectedJobRole || !selectedDifficulty) {
      alert("Please select job role and difficulty level")
      return
    }

    setIsGeneratingQuestions(true)
    try {
      const generatedQuestions = await generateInterviewQuestions(selectedJobRole, selectedDifficulty, 5)
      setQuestions(generatedQuestions)
      setInterviewStarted(true)
      setTimeElapsed(0)
    } catch (error) {
      console.error("Error starting interview:", error)
      alert("Failed to generate questions. Please try again.")
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  const handleNextQuestion = async () => {
    if (!answer.trim()) {
      alert("Please provide an answer before proceeding.")
      return
    }

    setIsAnalyzing(true)
    setShowInterviewerResponse(false)

    try {
      // Analyze the current answer
      const analysis = await analyzeAnswer(questions[currentQuestion].text, answer, selectedJobRole, selectedDifficulty)

      // Generate interviewer response
      const response = await generateInterviewerResponse(questions[currentQuestion].text, answer, analysis)

      setAnswers([...answers, answer])
      setAnalyses([...analyses, analysis])
      setInterviewerResponse(response)
      setShowInterviewerResponse(true)
      setAnswer("")

      // Auto-advance after showing response
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1)
          setShowInterviewerResponse(false)
        } else {
          handleCompleteInterview()
        }
      }, 3000)
    } catch (error) {
      console.error("Error analyzing answer:", error)
      // Continue without analysis if there's an error
      setAnswers([...answers, answer])
      setAnswer("")

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        handleCompleteInterview()
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCompleteInterview = () => {
    const finalAnswers = [...answers, answer]
    const finalAnalyses = [...analyses]

    // Calculate overall score
    const overallScore =
      finalAnalyses.length > 0
        ? Math.round(finalAnalyses.reduce((acc, analysis) => acc + analysis.score, 0) / finalAnalyses.length)
        : 75

    const interviewData: InterviewData = {
      jobRole: selectedJobRole,
      difficulty: selectedDifficulty,
      questions,
      answers: finalAnswers,
      analyses: finalAnalyses,
      timeElapsed,
      completedAt: new Date().toISOString(),
      overallScore,
    }

    // Save to localStorage and update user's interview history
    const existingInterviews = JSON.parse(localStorage.getItem("userInterviews") || "[]")
    const updatedInterviews = [...existingInterviews, interviewData]
    localStorage.setItem("userInterviews", JSON.stringify(updatedInterviews))
    localStorage.setItem("lastInterview", JSON.stringify(interviewData))

    router.push("/interview/results")
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Here you would implement actual voice recording functionality
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
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/dashboard")} className="text-gray-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">AI Mock Interview</span>
              </div>
            </div>

            {interviewStarted && (
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(timeElapsed)}</span>
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  Question {currentQuestion + 1} of {questions.length}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-6 py-8">
        {!interviewStarted ? (
          // Interview Setup
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span>Setup Your AI Mock Interview</span>
                </CardTitle>
                <CardDescription>
                  Our AI will generate personalized questions and provide real-time feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
                  <Select value={selectedJobRole} onValueChange={setSelectedJobRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                      <SelectItem value="Product Manager">Product Manager</SelectItem>
                      <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                      <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                      <SelectItem value="Sales Representative">Sales Representative</SelectItem>
                      <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                      <SelectItem value="UX Designer">UX Designer</SelectItem>
                      <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                      <SelectItem value="Financial Analyst">Financial Analyst</SelectItem>
                      <SelectItem value="HR Manager">HR Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entry Level">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="Mid Level">Mid Level (2-5 years)</SelectItem>
                      <SelectItem value="Senior Level">Senior Level (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <Bot className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI-Powered Features:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Personalized questions based on your role and experience</li>
                      <li>• Real-time answer analysis and scoring</li>
                      <li>• Intelligent follow-up questions</li>
                      <li>• Detailed feedback and improvement suggestions</li>
                      <li>• Suggested optimal answers for each question</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleStartInterview}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!selectedJobRole || !selectedDifficulty || isGeneratingQuestions}
                >
                  {isGeneratingQuestions ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start AI Interview
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Interview in Progress
          <div className="max-w-4xl mx-auto">
            {showInterviewerResponse && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">AI Interviewer</p>
                      <p className="text-blue-800 mt-1">{interviewerResponse}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Interview Area */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <span>Question {currentQuestion + 1}</span>
                      </CardTitle>
                      <Badge
                        variant={
                          questions[currentQuestion]?.difficulty === "Easy"
                            ? "secondary"
                            : questions[currentQuestion]?.difficulty === "Medium"
                              ? "default"
                              : "destructive"
                        }
                      >
                        {questions[currentQuestion]?.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{questions[currentQuestion]?.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-2">AI Interviewer asks:</p>
                          <p className="text-lg text-gray-800">{questions[currentQuestion]?.text}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Your Answer</span>
                        </label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleRecording}
                          className={isRecording ? "text-red-600 border-red-600" : ""}
                        >
                          {isRecording ? <MicOff className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
                          {isRecording ? "Stop Recording" : "Start Recording"}
                        </Button>
                      </div>

                      <Textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here or use voice recording..."
                        className="min-h-[150px]"
                        disabled={isAnalyzing || showInterviewerResponse}
                      />

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                          disabled={currentQuestion === 0 || isAnalyzing || showInterviewerResponse}
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={handleNextQuestion}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={!answer.trim() || isAnalyzing || showInterviewerResponse}
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : currentQuestion === questions.length - 1 ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete Interview
                            </>
                          ) : (
                            "Submit Answer"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      <span>AI Tips</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• Use the STAR method (Situation, Task, Action, Result)</li>
                      <li>• Provide specific examples from your experience</li>
                      <li>• Keep answers concise but comprehensive</li>
                      <li>• Show enthusiasm and confidence</li>
                      <li>• Ask clarifying questions if needed</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {questions.map((_, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-2 p-2 rounded ${
                            index === currentQuestion
                              ? "bg-blue-100 text-blue-800"
                              : index < currentQuestion
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              index === currentQuestion
                                ? "bg-blue-600 text-white"
                                : index < currentQuestion
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-300 text-gray-600"
                            }`}
                          >
                            {index < currentQuestion ? "✓" : index + 1}
                          </div>
                          <span className="text-sm">Question {index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interview Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Role:</span>
                      <span className="ml-2 font-medium">{selectedJobRole}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Level:</span>
                      <span className="ml-2 font-medium">{selectedDifficulty}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium">{formatTime(timeElapsed)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
