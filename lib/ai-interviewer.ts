import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export interface InterviewContext {
  jobRole: string
  difficulty: string
  currentQuestionNumber: number
  previousQuestions: string[]
  previousAnswers: string[]
  previousScores: number[]
  interviewStyle: "technical" | "behavioral" | "mixed"
  companyType?: string
}

export interface AIResponse {
  question: string
  questionType: "main" | "followup" | "clarification" | "deep-dive"
  category: string
  expectedDuration: number // in minutes
  difficulty: "Easy" | "Medium" | "Hard"
  context: string // Why this question was chosen
}

export interface AnswerAnalysis {
  score: number
  detailedFeedback: string
  strengths: string[]
  weaknesses: string[]
  improvementSuggestions: string[]
  idealAnswer: string
  nextQuestionDirection: "easier" | "harder" | "same" | "different-topic"
  followUpNeeded: boolean
  followUpReason?: string
}

// Smart local question generator as backup
class SmartQuestionGenerator {
  private questionBank: { [key: string]: { [key: string]: string[] } } = {
    "Software Engineer": {
      "Entry Level": [
        "Tell me about your programming background and what languages you're most comfortable with.",
        "How would you explain the difference between a stack and a queue to someone non-technical?",
        "Describe a coding project you're proud of and the challenges you faced.",
        "How do you approach debugging when your code isn't working as expected?",
        "What's the difference between frontend and backend development?",
      ],
      "Mid Level": [
        "Walk me through how you would design a simple web application from scratch.",
        "Explain the concept of object-oriented programming and give me an example.",
        "How would you optimize a slow-running database query?",
        "Describe your experience with version control systems like Git.",
        "Tell me about a time you had to learn a new technology quickly for a project.",
      ],
      "Senior Level": [
        "How would you architect a system to handle millions of concurrent users?",
        "Explain the trade-offs between microservices and monolithic architecture.",
        "Describe your approach to code reviews and mentoring junior developers.",
        "How do you ensure code quality and maintainability in a large codebase?",
        "Tell me about a complex technical decision you made and its impact.",
      ],
    },
    "Product Manager": {
      "Entry Level": [
        "What interests you about product management and why do you want to pursue this career?",
        "How would you prioritize features for a mobile app with limited development resources?",
        "Describe a product you use daily and what you would improve about it.",
        "How would you gather user feedback for a new feature?",
        "What metrics would you track for a social media application?",
      ],
      "Mid Level": [
        "Walk me through how you would launch a new product feature from concept to release.",
        "How do you balance user needs with business requirements when they conflict?",
        "Describe your experience working with engineering and design teams.",
        "How would you conduct market research for a new product idea?",
        "Tell me about a time you had to make a difficult product decision with limited data.",
      ],
      "Senior Level": [
        "How would you develop a product strategy for entering a new market?",
        "Describe your approach to building and managing a product roadmap.",
        "How do you measure product success and communicate it to stakeholders?",
        "Tell me about a time you had to pivot a product strategy based on market feedback.",
        "How do you foster innovation while maintaining product stability?",
      ],
    },
    "Data Scientist": {
      "Entry Level": [
        "Explain the difference between supervised and unsupervised machine learning.",
        "How would you handle missing data in a dataset?",
        "Describe a data analysis project you've worked on and your approach.",
        "What's the difference between correlation and causation?",
        "How would you explain a complex data finding to a non-technical stakeholder?",
      ],
      "Mid Level": [
        "Walk me through your process for building a machine learning model from start to finish.",
        "How would you evaluate the performance of a classification model?",
        "Describe your experience with data visualization and which tools you prefer.",
        "How do you ensure data quality and handle outliers in your analysis?",
        "Tell me about a time when your analysis led to a significant business decision.",
      ],
      "Senior Level": [
        "How would you design an A/B testing framework for a large-scale application?",
        "Describe your approach to building data pipelines and ensuring data governance.",
        "How do you communicate complex statistical concepts to business leaders?",
        "Tell me about a time you had to challenge business assumptions with data.",
        "How do you stay current with new developments in machine learning and AI?",
      ],
    },
  }

  generateQuestion(context: InterviewContext): AIResponse {
    const roleQuestions = this.questionBank[context.jobRole] || this.questionBank["Software Engineer"]
    const difficultyQuestions = roleQuestions[context.difficulty] || roleQuestions["Entry Level"]

    // Select a question that hasn't been asked yet
    const availableQuestions = difficultyQuestions.filter(
      (q) => !context.previousQuestions.some((prev) => prev.includes(q.substring(0, 20))),
    )

    const question =
      availableQuestions.length > 0
        ? availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
        : difficultyQuestions[Math.floor(Math.random() * difficultyQuestions.length)]

    return {
      question,
      questionType: "main",
      category: this.getCategoryForQuestion(question),
      expectedDuration: 3,
      difficulty: context.difficulty as "Easy" | "Medium" | "Hard",
      context: `Smart-generated question for ${context.jobRole} at ${context.difficulty} level`,
    }
  }

  private getCategoryForQuestion(question: string): string {
    if (
      question.toLowerCase().includes("technical") ||
      question.toLowerCase().includes("code") ||
      question.toLowerCase().includes("system")
    ) {
      return "Technical"
    }
    if (
      question.toLowerCase().includes("team") ||
      question.toLowerCase().includes("time") ||
      question.toLowerCase().includes("challenge")
    ) {
      return "Behavioral"
    }
    if (
      question.toLowerCase().includes("design") ||
      question.toLowerCase().includes("approach") ||
      question.toLowerCase().includes("how would you")
    ) {
      return "Problem-Solving"
    }
    return "General"
  }
}

export class AIInterviewer {
  private context: InterviewContext
  private smartGenerator: SmartQuestionGenerator
  private useAI = true

  constructor(context: InterviewContext) {
    this.context = context
    this.smartGenerator = new SmartQuestionGenerator()
  }

  async generateNextQuestion(): Promise<AIResponse> {
    console.log("🤖 Generating question for:", this.context.jobRole, this.context.difficulty)

    // Try AI first, then fall back to smart generator
    if (this.useAI) {
      try {
        return await this.generateAIQuestion()
      } catch (error) {
        console.error("❌ AI generation failed, using smart generator:", error)
        this.useAI = false // Disable AI for this session
      }
    }

    // Use smart local generator
    console.log("🧠 Using smart question generator")
    return this.smartGenerator.generateQuestion(this.context)
  }

  private async generateAIQuestion(): Promise<AIResponse> {
    const prompt = this.generateQuestionPrompt()
    console.log("📝 AI Question prompt:", prompt)

    const result = await generateText({
      model: google("gemini-1.5-flash"), // Free Google Gemini model
      messages: [
        {
          role: "system",
          content: `You are an expert interviewer for ${this.context.jobRole} positions. Generate realistic interview questions.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "question": "Your interview question here",
  "questionType": "main",
  "category": "Technical",
  "expectedDuration": 3,
  "difficulty": "${this.context.difficulty}",
  "context": "Brief explanation"
}

Guidelines:
- ${this.context.difficulty} level questions for ${this.context.jobRole}
- Make questions realistic and commonly asked
- Avoid repeating previous questions: ${this.context.previousQuestions.join(", ")}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      maxTokens: 400,
    })

    console.log("🎯 AI Response:", result.text)

    // Clean and parse response
    let cleanedText = result.text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    const aiResponse = JSON.parse(cleanedText)

    if (!aiResponse.question || !aiResponse.category) {
      throw new Error("Invalid AI response structure")
    }

    console.log("✅ AI question generated successfully")
    return aiResponse
  }

  private generateQuestionPrompt(): string {
    const avgScore =
      this.context.previousScores.length > 0
        ? this.context.previousScores.reduce((a, b) => a + b, 0) / this.context.previousScores.length
        : 75

    let prompt = `Generate interview question ${this.context.currentQuestionNumber} for ${this.context.jobRole} at ${this.context.difficulty} level.`

    if (this.context.currentQuestionNumber === 1) {
      prompt += " Start with an opening question that assesses background and sets the tone."
    } else {
      if (avgScore > 80) {
        prompt += " Candidate performing well - increase difficulty."
      } else if (avgScore < 60) {
        prompt += " Candidate struggling - use foundational questions."
      }
    }

    return prompt
  }

  async analyzeAnswer(question: string, answer: string): Promise<AnswerAnalysis> {
    console.log("🔍 Analyzing answer...")

    if (this.useAI) {
      try {
        return await this.generateAIAnalysis(question, answer)
      } catch (error) {
        console.error("❌ AI analysis failed, using smart analysis:", error)
      }
    }

    // Smart local analysis
    return this.generateSmartAnalysis(question, answer)
  }

  private async generateAIAnalysis(question: string, answer: string): Promise<AnswerAnalysis> {
    const result = await generateText({
      model: google("gemini-1.5-flash"),
      messages: [
        {
          role: "system",
          content: `Analyze interview responses and provide constructive feedback.

IMPORTANT: Respond ONLY with valid JSON:
{
  "score": 85,
  "detailedFeedback": "Detailed feedback paragraph",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvementSuggestions": ["suggestion1", "suggestion2"],
  "idealAnswer": "Better answer example",
  "nextQuestionDirection": "same",
  "followUpNeeded": false
}

Scoring: 90-100 excellent, 80-89 good, 70-79 adequate, 60-69 weak, <60 poor`,
        },
        {
          role: "user",
          content: `Analyze this ${this.context.jobRole} interview response:
Question: "${question}"
Answer: "${answer}"
Difficulty: ${this.context.difficulty}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 600,
    })

    let cleanedText = result.text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    }

    return JSON.parse(cleanedText)
  }

  private generateSmartAnalysis(question: string, answer: string): AnswerAnalysis {
    const answerLength = answer.trim().length
    const hasExamples = answer.toLowerCase().includes("example") || answer.toLowerCase().includes("experience")
    const hasSpecifics = /\d/.test(answer) || answer.includes("%") || answer.includes("$")

    let score = 70 // Base score

    // Adjust score based on answer quality
    if (answerLength > 200) score += 10
    if (hasExamples) score += 10
    if (hasSpecifics) score += 5
    if (answerLength < 50) score -= 20

    score = Math.max(40, Math.min(95, score))

    return {
      score,
      detailedFeedback: `Your answer ${score >= 80 ? "demonstrates good understanding" : "addresses the question but could be stronger"}. ${hasExamples ? "Good use of examples." : "Consider adding specific examples."} ${hasSpecifics ? "Nice inclusion of specific details." : "Adding metrics or specific details would strengthen your response."}`,
      strengths: [
        answerLength > 100 ? "Comprehensive response" : "Clear communication",
        hasExamples ? "Good use of examples" : "Relevant content",
      ],
      weaknesses: [
        answerLength < 100 ? "Could provide more detail" : "Could be more concise",
        !hasExamples ? "Add specific examples" : "Could include more metrics",
      ],
      improvementSuggestions: [
        "Use the STAR method (Situation, Task, Action, Result)",
        "Include specific metrics and outcomes",
        "Provide concrete examples from your experience",
      ],
      idealAnswer:
        "A stronger answer would include specific examples, quantifiable results, and demonstrate clear problem-solving skills using the STAR method.",
      nextQuestionDirection: score >= 80 ? "harder" : score < 60 ? "easier" : "same",
      followUpNeeded: Math.random() > 0.6,
      followUpReason: "To explore your answer in more depth",
    }
  }

  async generateFollowUpQuestion(
    originalQuestion: string,
    answer: string,
    analysis: AnswerAnalysis,
  ): Promise<AIResponse> {
    // Generate smart follow-up questions
    const followUps = [
      "Can you give me a specific example of that?",
      "How did you measure the success of that approach?",
      "What would you do differently if you faced that situation again?",
      "How did you handle any challenges that came up?",
      "What was the impact of your decision on the team or project?",
    ]

    const followUp = followUps[Math.floor(Math.random() * followUps.length)]

    return {
      question: followUp,
      questionType: "followup",
      category: "Follow-up",
      expectedDuration: 2,
      difficulty: this.context.difficulty as "Easy" | "Medium" | "Hard",
      context: "Follow-up to explore your previous answer in more detail",
    }
  }

  async generateInterviewerComment(analysis: AnswerAnalysis): Promise<string> {
    const comments = [
      "Thank you for that detailed response.",
      "I appreciate the specific examples you provided.",
      "That's an interesting approach to the problem.",
      "Good, let's explore that further.",
      "I can see you've thought about this carefully.",
      "That demonstrates good problem-solving skills.",
    ]

    return comments[Math.floor(Math.random() * comments.length)]
  }

  updateContext(newAnswer: string, newScore: number, newQuestion: string) {
    this.context.previousAnswers.push(newAnswer)
    this.context.previousScores.push(newScore)
    this.context.previousQuestions.push(newQuestion)
    this.context.currentQuestionNumber++
  }
}

export async function generateInterviewSummary(
  jobRole: string,
  difficulty: string,
  questions: string[],
  answers: string[],
  analyses: AnswerAnalysis[],
): Promise<{
  overallFeedback: string
  keyStrengths: string[]
  criticalImprovements: string[]
  readinessScore: number
  nextSteps: string[]
}> {
  console.log("📋 Generating interview summary...")

  try {
    const result = await generateText({
      model: google("gemini-1.5-flash"),
      messages: [
        {
          role: "system",
          content: `Provide comprehensive interview performance summary.

IMPORTANT: Respond ONLY with valid JSON:
{
  "overallFeedback": "Comprehensive feedback paragraph",
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "criticalImprovements": ["improvement1", "improvement2", "improvement3"],
  "readinessScore": 85,
  "nextSteps": ["step1", "step2", "step3"]
}`,
        },
        {
          role: "user",
          content: `Summarize this ${jobRole} interview performance:
Average Score: ${analyses.reduce((acc, a) => acc + a.score, 0) / analyses.length}
Questions: ${questions.length}
Strengths: ${analyses.flatMap((a) => a.strengths).join(", ")}
Weaknesses: ${analyses.flatMap((a) => a.weaknesses).join(", ")}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 500,
    })

    let cleanedText = result.text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    }

    return JSON.parse(cleanedText)
  } catch (error) {
    console.error("❌ Summary generation failed:", error)

    const avgScore = analyses.reduce((acc, a) => acc + a.score, 0) / analyses.length

    return {
      overallFeedback: `You completed the ${jobRole} interview with an average score of ${avgScore.toFixed(0)}%. Your responses showed good understanding of the role requirements and demonstrated relevant experience.`,
      keyStrengths: ["Clear communication", "Relevant experience", "Professional demeanor"],
      criticalImprovements: ["Add more specific examples", "Include quantifiable results", "Practice technical depth"],
      readinessScore: Math.round(avgScore),
      nextSteps: [
        "Practice more technical questions",
        "Prepare STAR method examples",
        "Research company-specific scenarios",
      ],
    }
  }
}
