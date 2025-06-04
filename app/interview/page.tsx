"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, ArrowLeft, Play, Mic, MicOff, Clock, MessageSquare, Lightbulb, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface Question {
  id: number
  text: string
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
}

const mockQuestions: Question[] = [
  {
    id: 1,
    text: "Tell me about yourself and your background.",
    category: "General",
    difficulty: "Easy",
  },
  {
    id: 2,
    text: "Why are you interested in this position?",
    category: "Motivation",
    difficulty: "Easy",
  },
  {
    id: 3,
    text: "Describe a challenging project you worked on and how you overcame obstacles.",
    category: "Behavioral",
    difficulty: "Medium",
  },
  {
    id: 4,
    text: "How do you handle working under pressure and tight deadlines?",
    category: "Behavioral",
    difficulty: "Medium",
  },
  {
    id: 5,
    text: "Where do you see yourself in 5 years?",
    category: "Career Goals",
    difficulty: "Easy",
  },
]

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
  const [answers, setAnswers] = useState<string[]>([])

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

  const handleStartInterview = () => {
    if (!selectedJobRole || !selectedDifficulty) {
      alert("Please select job role and difficulty level")
      return
    }
    setInterviewStarted(true)
    setTimeElapsed(0)
  }

  const handleNextQuestion = () => {
    setAnswers([...answers, answer])
    setAnswer("")
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Interview completed
      handleCompleteInterview()
    }
  }

  const handleCompleteInterview = () => {
    // Save interview results and redirect to results
    const finalAnswers = [...answers, answer]
    localStorage.setItem(
      "lastInterview",
      JSON.stringify({
        jobRole: selectedJobRole,
        difficulty: selectedDifficulty,
        questions: mockQuestions,
        answers: finalAnswers,
        timeElapsed,
        completedAt: new Date().toISOString(),
      }),
    )
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
                <span className="text-xl font-bold text-gray-900">Mock Interview</span>
              </div>
            </div>

            {interviewStarted && (
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(timeElapsed)}</span>
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  Question {currentQuestion + 1} of {mockQuestions.length}
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
                  <Play className="w-5 h-5 text-blue-600" />
                  <span>Setup Your Mock Interview</span>
                </CardTitle>
                <CardDescription>Configure your interview preferences to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
                  <Select value={selectedJobRole} onValueChange={setSelectedJobRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software-engineer">Software Engineer</SelectItem>
                      <SelectItem value="product-manager">Product Manager</SelectItem>
                      <SelectItem value="data-scientist">Data Scientist</SelectItem>
                      <SelectItem value="marketing-manager">Marketing Manager</SelectItem>
                      <SelectItem value="sales-representative">Sales Representative</SelectItem>
                      <SelectItem value="business-analyst">Business Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (Entry Level)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">What to expect:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 5 carefully selected questions based on your preferences</li>
                    <li>• Voice recording capability (optional)</li>
                    <li>• Real-time feedback and suggestions</li>
                    <li>• Detailed analysis after completion</li>
                  </ul>
                </div>

                <Button
                  onClick={handleStartInterview}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!selectedJobRole || !selectedDifficulty}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Interview
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Interview in Progress
          <div className="max-w-4xl mx-auto">
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
                          mockQuestions[currentQuestion].difficulty === "Easy"
                            ? "secondary"
                            : mockQuestions[currentQuestion].difficulty === "Medium"
                              ? "default"
                              : "destructive"
                        }
                      >
                        {mockQuestions[currentQuestion].difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{mockQuestions[currentQuestion].category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <p className="text-lg font-medium text-gray-900">{mockQuestions[currentQuestion].text}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">Your Answer</label>
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
                      />

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                          disabled={currentQuestion === 0}
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={handleNextQuestion}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={!answer.trim()}
                        >
                          {currentQuestion === mockQuestions.length - 1 ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete Interview
                            </>
                          ) : (
                            "Next Question"
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
                      <span>Tips</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• Be specific with examples</li>
                      <li>• Use the STAR method (Situation, Task, Action, Result)</li>
                      <li>• Keep answers concise but detailed</li>
                      <li>• Show enthusiasm and confidence</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mockQuestions.map((_, index) => (
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
