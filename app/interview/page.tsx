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
  Mic,
  MicOff,
  Clock,
  MessageSquare,
  Lightbulb,
  CheckCircle,
  Bot,
  User,
  Loader2,
  Brain,
  Zap,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import {
  AIInterviewer,
  type InterviewContext,
  type AIResponse,
  type AnswerAnalysis,
  generateInterviewSummary,
} from "@/lib/ai-interviewer"

interface InterviewData {
  jobRole: string
  difficulty: string
  questions: AIResponse[]
  answers: string[]
  analyses: AnswerAnalysis[]
  timeElapsed: number
  completedAt: string
  overallScore: number
  interviewSummary?: any
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
  const [selectedCompanyType, setSelectedCompanyType] = useState("")
  const [questions, setQuestions] = useState<AIResponse[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [analyses, setAnalyses] = useState<AnswerAnalysis[]>([])
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [interviewerComment, setInterviewerComment] = useState("")
  const [showInterviewerComment, setShowInterviewerComment] = useState(false)
  const [aiInterviewer, setAiInterviewer] = useState<AIInterviewer | null>(null)
  const [isThinking, setIsThinking] = useState(false)

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

    setIsGeneratingQuestion(true)
    try {
      // Initialize AI Interviewer
      const context: InterviewContext = {
        jobRole: selectedJobRole,
        difficulty: selectedDifficulty,
        currentQuestionNumber: 1,
        previousQuestions: [],
        previousAnswers: [],
        previousScores: [],
        interviewStyle: "mixed",
        companyType: selectedCompanyType,
      }

      const interviewer = new AIInterviewer(context)
      setAiInterviewer(interviewer)

      // Generate first question
      const firstQuestion = await interviewer.generateNextQuestion()
      setQuestions([firstQuestion])
      setInterviewStarted(true)
      setTimeElapsed(0)
    } catch (error) {
      console.error("Error starting interview:", error)
      alert("Failed to start AI interview. Please try again.")
    } finally {
      setIsGeneratingQuestion(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !aiInterviewer) {
      alert("Please provide an answer before proceeding.")
      return
    }

    setIsAnalyzing(true)
    setShowInterviewerComment(false)
    setIsThinking(true)

    try {
      // Analyze the current answer
      const analysis = await aiInterviewer.analyzeAnswer(questions[currentQuestion].question, answer)

      // Generate interviewer comment
      const comment = await aiInterviewer.generateInterviewerComment(analysis)

      // Update context
      aiInterviewer.updateContext(answer, analysis.score, questions[currentQuestion].question)

      setAnswers([...answers, answer])
      setAnalyses([...analyses, analysis])
      setInterviewerComment(comment)
      setShowInterviewerComment(true)
      setIsThinking(false)

      // Determine next action
      setTimeout(async () => {
        if (currentQuestion < 4) {
          // Generate next question or follow-up
          setIsGeneratingQuestion(true)
          let nextQuestion: AIResponse

          if (analysis.followUpNeeded && Math.random() > 0.3) {
            // 70% chance to ask follow-up if needed
            nextQuestion = await aiInterviewer.generateFollowUpQuestion(
              questions[currentQuestion].question,
              answer,
              analysis,
            )
          } else {
            // Generate new question
            nextQuestion = await aiInterviewer.generateNextQuestion()
          }

          setQuestions([...questions, nextQuestion])
          setCurrentQuestion(currentQuestion + 1)
          setAnswer("")
          setShowInterviewerComment(false)
          setIsGeneratingQuestion(false)
        } else {
          // Interview completed
          handleCompleteInterview()
        }
      }, 2500)
    } catch (error) {
      console.error("Error processing answer:", error)
      setIsThinking(false)
      // Continue without analysis if there's an error
      setAnswers([...answers, answer])
      setAnswer("")

      if (currentQuestion < 4) {
        setCurrentQuestion(currentQuestion + 1)
        setShowInterviewerComment(false)
      } else {
        handleCompleteInterview()
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCompleteInterview = async () => {
    try {
      const finalAnswers = [...answers, answer]
      const finalAnalyses = [...analyses]

      // Calculate overall score
      const overallScore =
        finalAnalyses.length > 0
          ? Math.round(finalAnalyses.reduce((acc, analysis) => acc + analysis.score, 0) / finalAnalyses.length)
          : 75

      // Generate comprehensive interview summary
      let interviewSummary = null
      try {
        interviewSummary = await generateInterviewSummary(
          selectedJobRole,
          selectedDifficulty,
          questions.map((q) => q.question),
          finalAnswers,
          finalAnalyses,
        )
      } catch (error) {
        console.error("Error generating summary:", error)
        // Provide fallback summary if generation fails
        interviewSummary = {
          overallFeedback: "You demonstrated good communication skills throughout the interview.",
          keyStrengths: ["Communication", "Relevant knowledge"],
          criticalImprovements: ["Add more specific examples", "Provide more detailed answers"],
          readinessScore: overallScore,
          nextSteps: ["Practice with more questions", "Review technical concepts"],
        }
      }

      const interviewData = {
        jobRole: selectedJobRole,
        difficulty: selectedDifficulty,
        questions,
        answers: finalAnswers,
        analyses: finalAnalyses,
        timeElapsed,
        completedAt: new Date().toISOString(),
        overallScore,
        interviewSummary,
      }

      // Save to localStorage with error handling
      try {
        // First check if we can stringify the data
        const interviewDataString = JSON.stringify(interviewData)

        // Then save to localStorage
        const existingInterviews = JSON.parse(localStorage.getItem("userInterviews") || "[]")
        const updatedInterviews = [...existingInterviews, interviewData]
        localStorage.setItem("userInterviews", JSON.stringify(updatedInterviews))
        localStorage.setItem("lastInterview", interviewDataString)
      } catch (error) {
        console.error("Error saving interview data:", error)
        // Create a simplified version of the data if there's a JSON error
        const simplifiedData = {
          jobRole: selectedJobRole,
          difficulty: selectedDifficulty,
          questions: questions.map((q) => ({ question: q.question, category: q.category, difficulty: q.difficulty })),
          answers: finalAnswers,
          analyses: finalAnalyses.map((a) => ({ score: a.score, strengths: a.strengths, weaknesses: a.weaknesses })),
          timeElapsed,
          completedAt: new Date().toISOString(),
          overallScore,
        }

        try {
          localStorage.setItem("lastInterview", JSON.stringify(simplifiedData))
        } catch (e) {
          console.error("Failed to save even simplified data:", e)
        }
      }

      // Navigate to results page
      router.push("/interview/results")
    } catch (error) {
      console.error("Error in handleCompleteInterview:", error)
      alert("There was an error completing your interview. Please try again.")
    }
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
                <span className="text-xl font-bold text-gray-900">AI Interviewer</span>
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  <Brain className="w-3 h-3 mr-1" />
                  Powered by GPT-4
                </Badge>
              </div>
            </div>

            {interviewStarted && (
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(timeElapsed)}</span>
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">Question {currentQuestion + 1} of 5</Badge>
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
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>AI Interviewer Setup</span>
                </CardTitle>
                <CardDescription>
                  Configure your personalized AI interview experience. Our AI will adapt questions based on your
                  responses and provide real-time feedback.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
                  <Select value={selectedJobRole} onValueChange={setSelectedJobRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your target job role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                      <SelectItem value="Senior Software Engineer">Senior Software Engineer</SelectItem>
                      <SelectItem value="Product Manager">Product Manager</SelectItem>
                      <SelectItem value="Senior Product Manager">Senior Product Manager</SelectItem>
                      <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                      <SelectItem value="Senior Data Scientist">Senior Data Scientist</SelectItem>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Type (Optional)</label>
                  <Select value={selectedCompanyType} onValueChange={setSelectedCompanyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company type for targeted questions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Startup">Startup</SelectItem>
                      <SelectItem value="Big Tech">Big Tech (FAANG)</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Advanced AI Features:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Dynamic question generation based on your responses</li>
                      <li>• Adaptive difficulty that adjusts to your performance</li>
                      <li>• Intelligent follow-up questions for deeper assessment</li>
                      <li>• Real-time analysis with detailed improvement suggestions</li>
                      <li>• Conversational interview experience with natural flow</li>
                      <li>• Comprehensive performance summary and readiness score</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleStartInterview}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  disabled={!selectedJobRole || !selectedDifficulty || isGeneratingQuestion}
                >
                  {isGeneratingQuestion ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI is preparing your interview...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
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
            {/* AI Thinking Indicator */}
            {isThinking && (
              <Card className="mb-6 border-purple-200 bg-purple-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-900">AI is analyzing your response...</p>
                      <p className="text-purple-700 text-sm">Evaluating content, structure, and relevance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interviewer Comment */}
            {showInterviewerComment && !isThinking && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">AI Interviewer</p>
                      <p className="text-blue-800 mt-1">{interviewerComment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Generation Indicator */}
            {isGeneratingQuestion && (
              <Card className="mb-6 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">AI is preparing your next question...</p>
                      <p className="text-green-700 text-sm">Adapting based on your previous responses</p>
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
                      <div className="flex items-center space-x-2">
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
                        <Badge variant="outline">{questions[currentQuestion]?.questionType}</Badge>
                      </div>
                    </div>
                    <CardDescription>
                      {questions[currentQuestion]?.category} • Expected duration:{" "}
                      {questions[currentQuestion]?.expectedDuration} min
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-2">AI Interviewer asks:</p>
                          <p className="text-lg text-gray-800">{questions[currentQuestion]?.question}</p>
                          {questions[currentQuestion]?.context &&
                            !questions[currentQuestion].context.includes("Fallback question") && (
                              <p className="text-sm text-gray-600 mt-2 italic">
                                Context: {questions[currentQuestion].context}
                              </p>
                            )}
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
                        disabled={isAnalyzing || showInterviewerComment || isGeneratingQuestion}
                      />

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                          disabled={
                            currentQuestion === 0 || isAnalyzing || showInterviewerComment || isGeneratingQuestion
                          }
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={handleSubmitAnswer}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={!answer.trim() || isAnalyzing || showInterviewerComment || isGeneratingQuestion}
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              AI Analyzing...
                            </>
                          ) : currentQuestion === 4 ? (
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
                      <li>• Be concise but comprehensive</li>
                      <li>• Show enthusiasm and confidence</li>
                      <li>• Ask clarifying questions if needed</li>
                      <li>• The AI adapts to your responses</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interview Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Array.from({ length: 5 }, (_, index) => (
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
                          <span className="text-sm">
                            {questions[index] ? questions[index].category : `Question ${index + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Interview Info</CardTitle>
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
                    {selectedCompanyType && (
                      <div>
                        <span className="text-gray-600">Company:</span>
                        <span className="ml-2 font-medium">{selectedCompanyType}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium">{formatTime(timeElapsed)}</span>
                    </div>
                    {analyses.length > 0 && (
                      <div>
                        <span className="text-gray-600">Avg Score:</span>
                        <span className="ml-2 font-medium">
                          {Math.round(analyses.reduce((acc, a) => acc + a.score, 0) / analyses.length)}%
                        </span>
                      </div>
                    )}
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
