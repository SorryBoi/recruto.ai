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
  sessionId: string
  questionCategory?: string // Add category selection
  usedQuestionIds: Set<string> // Track used questions in this interview
}

export interface AIResponse {
  question: string
  questionType: "main" | "followup" | "clarification" | "deep-dive"
  category: string
  expectedDuration: number
  difficulty: "Easy" | "Medium" | "Hard" | "Expert"
  context: string
  actualDifficulty: string // One level higher than selected
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
  realityCheck?: string // Harsh but honest feedback
  industryStandard: string // What industry expects
}

// Massive question bank with variants
class AdvancedQuestionGenerator {
  private questionBank: {
    [key: string]: { [key: string]: { [key: string]: Array<{ id: string; question: string; type: string }> } }
  } = {
    "Software Engineer": {
      "Entry Level": {
        Technical: [
          {
            id: "se_entry_tech_1",
            question: "Explain the difference between synchronous and asynchronous programming with real examples.",
            type: "concept",
          },
          {
            id: "se_entry_tech_2",
            question: "How would you handle concurrent operations in a web application?",
            type: "implementation",
          },
          {
            id: "se_entry_tech_3",
            question: "Describe a scenario where you'd choose asynchronous processing over synchronous.",
            type: "decision",
          },
          {
            id: "se_entry_tech_4",
            question: "Explain how you'd implement a rate-limiting system for an API.",
            type: "system-design",
          },
          {
            id: "se_entry_tech_5",
            question: "How would you design a system to handle thousands of simultaneous user requests?",
            type: "scalability",
          },
          {
            id: "se_entry_tech_6",
            question: "What's the difference between SQL and NoSQL databases? When would you use each?",
            type: "concept",
          },
          {
            id: "se_entry_tech_7",
            question: "Explain how REST APIs work and what makes them RESTful.",
            type: "concept",
          },
          { id: "se_entry_tech_8", question: "How would you optimize a slow database query?", type: "optimization" },
        ],
        "Problem Solving": [
          {
            id: "se_entry_prob_1",
            question: "Walk me through your approach to debugging a piece of code that's not working as expected.",
            type: "methodology",
          },
          {
            id: "se_entry_prob_2",
            question: "Describe your debugging methodology when faced with a complex bug in production.",
            type: "crisis",
          },
          {
            id: "se_entry_prob_3",
            question: "How do you systematically troubleshoot code that's failing in ways you don't understand?",
            type: "systematic",
          },
          {
            id: "se_entry_prob_4",
            question: "Explain your process for identifying and fixing performance bottlenecks in code.",
            type: "performance",
          },
          {
            id: "se_entry_prob_5",
            question: "What's your strategy when debugging code written by someone else that you've never seen before?",
            type: "legacy",
          },
          {
            id: "se_entry_prob_6",
            question: "How would you approach solving a problem you've never encountered before?",
            type: "unknown",
          },
          {
            id: "se_entry_prob_7",
            question: "Describe how you break down complex problems into smaller, manageable pieces.",
            type: "decomposition",
          },
        ],
        Behavioral: [
          {
            id: "se_entry_beh_1",
            question: "Tell me about a time you had to optimize code for better performance.",
            type: "achievement",
          },
          {
            id: "se_entry_beh_2",
            question: "Describe a challenging technical problem you solved and your approach.",
            type: "challenge",
          },
          {
            id: "se_entry_beh_3",
            question: "How do you stay updated with new technologies and programming trends?",
            type: "learning",
          },
          {
            id: "se_entry_beh_4",
            question: "Explain a situation where you had to learn a new framework quickly.",
            type: "adaptability",
          },
          {
            id: "se_entry_beh_5",
            question: "Describe your experience with code reviews and how you handle feedback.",
            type: "collaboration",
          },
          {
            id: "se_entry_beh_6",
            question: "Tell me about a time you made a mistake in your code. How did you handle it?",
            type: "failure",
          },
          {
            id: "se_entry_beh_7",
            question: "Describe a situation where you had to work with a difficult team member.",
            type: "conflict",
          },
        ],
        "System Design": [
          {
            id: "se_entry_sys_1",
            question: "Design a simple caching system and explain your design decisions.",
            type: "basic-design",
          },
          {
            id: "se_entry_sys_2",
            question: "How would you implement a basic load balancer from scratch?",
            type: "infrastructure",
          },
          {
            id: "se_entry_sys_3",
            question: "Describe how you'd build a real-time notification system.",
            type: "real-time",
          },
          {
            id: "se_entry_sys_4",
            question: "Design a URL shortening service like bit.ly - what are the key components?",
            type: "service-design",
          },
          {
            id: "se_entry_sys_5",
            question: "How would you architect a simple chat application to handle 1000 concurrent users?",
            type: "scalability",
          },
        ],
        Communication: [
          {
            id: "se_entry_comm_1",
            question: "How would you explain APIs to a non-technical person?",
            type: "explanation",
          },
          {
            id: "se_entry_comm_2",
            question: "What's your approach to writing maintainable, clean code?",
            type: "best-practices",
          },
          {
            id: "se_entry_comm_3",
            question: "How do you ensure your code is secure and follows best practices?",
            type: "security",
          },
          { id: "se_entry_comm_4", question: "Describe your testing strategy for a new feature.", type: "testing" },
          {
            id: "se_entry_comm_5",
            question: "How would you handle a situation where your code caused a production outage?",
            type: "crisis-communication",
          },
        ],
      },
      // Add similar structure for Mid Level and Senior Level...
    },
    // Add similar structure for Product Manager and Data Scientist...
  }

  // Frequently asked interview questions from top companies
  private frequentlyAskedQuestions: {
    [key: string]: { [key: string]: Array<{ id: string; question: string; company: string; type: string }> }
  } = {
    "Software Engineer": {
      Technical: [
        {
          id: "faq_tech_1",
          question: "Reverse a linked list iteratively and recursively.",
          company: "Google",
          type: "coding",
        },
        {
          id: "faq_tech_2",
          question: "Find the longest substring without repeating characters.",
          company: "Facebook",
          type: "coding",
        },
        {
          id: "faq_tech_3",
          question: "Implement a LRU cache with O(1) operations.",
          company: "Amazon",
          type: "coding",
        },
        { id: "faq_tech_4", question: "Design a parking lot system.", company: "Microsoft", type: "system-design" },
        {
          id: "faq_tech_5",
          question: "How would you detect a cycle in a linked list?",
          company: "Apple",
          type: "coding",
        },
        {
          id: "faq_tech_6",
          question: "Explain the difference between processes and threads.",
          company: "Netflix",
          type: "concept",
        },
        {
          id: "faq_tech_7",
          question: "How does garbage collection work in your preferred language?",
          company: "Uber",
          type: "concept",
        },
        { id: "faq_tech_8", question: "Design a distributed cache system.", company: "Airbnb", type: "system-design" },
      ],
      Behavioral: [
        {
          id: "faq_beh_1",
          question: "Tell me about a time you disagreed with your manager.",
          company: "Amazon",
          type: "conflict",
        },
        {
          id: "faq_beh_2",
          question: "Describe a time you failed and what you learned from it.",
          company: "Google",
          type: "failure",
        },
        {
          id: "faq_beh_3",
          question: "Tell me about your most challenging project.",
          company: "Facebook",
          type: "challenge",
        },
        {
          id: "faq_beh_4",
          question: "How do you handle tight deadlines and pressure?",
          company: "Microsoft",
          type: "pressure",
        },
        {
          id: "faq_beh_5",
          question: "Describe a time you had to learn something completely new.",
          company: "Apple",
          type: "learning",
        },
      ],
    },
  }

  private usedQuestions: Set<string> = new Set()

  generateQuestion(context: InterviewContext): AIResponse {
    const roleQuestions = this.questionBank[context.jobRole] || this.questionBank["Software Engineer"]
    const actualDifficulty = this.getHigherDifficulty(context.difficulty)
    const difficultyQuestions =
      roleQuestions[actualDifficulty] || roleQuestions[context.difficulty] || roleQuestions["Entry Level"]

    let availableQuestions: Array<{ id: string; question: string; type: string }> = []

    // Get questions based on category selection
    if (context.questionCategory && context.questionCategory !== "Mixed") {
      const categoryQuestions = difficultyQuestions[context.questionCategory] || []
      availableQuestions = [...categoryQuestions]

      // Add frequently asked questions for this category
      const faqCategory = this.frequentlyAskedQuestions[context.jobRole]?.[context.questionCategory] || []
      availableQuestions = [...availableQuestions, ...faqCategory]
    } else {
      // Mixed questions - get from all categories
      Object.values(difficultyQuestions).forEach((categoryQuestions) => {
        availableQuestions = [...availableQuestions, ...categoryQuestions]
      })

      // Add all FAQ questions for mixed mode
      Object.values(this.frequentlyAskedQuestions[context.jobRole] || {}).forEach((faqQuestions) => {
        availableQuestions = [...availableQuestions, ...faqQuestions]
      })
    }

    // Filter out already used questions in this interview
    const unusedQuestions = availableQuestions.filter((q) => !context.usedQuestionIds.has(q.id))

    // If all questions used, reset and start over (shouldn't happen with enough questions)
    if (unusedQuestions.length === 0) {
      context.usedQuestionIds.clear()
      console.warn("All questions used, resetting question pool")
    }

    const questionsToUse = unusedQuestions.length > 0 ? unusedQuestions : availableQuestions
    const selectedQuestion = questionsToUse[Math.floor(Math.random() * questionsToUse.length)]

    // Mark question as used
    context.usedQuestionIds.add(selectedQuestion.id)

    return {
      question: selectedQuestion.question,
      questionType: "main",
      category: this.getCategoryForQuestion(selectedQuestion.question),
      expectedDuration: 4,
      difficulty: context.difficulty as "Easy" | "Medium" | "Hard",
      actualDifficulty: `${actualDifficulty} (One level above ${context.difficulty})`,
      context: `${selectedQuestion.company ? `${selectedQuestion.company} style` : "Advanced"} ${actualDifficulty} question - ${selectedQuestion.type}`,
    }
  }

  private getHigherDifficulty(selectedDifficulty: string): string {
    const difficultyMap: { [key: string]: string } = {
      "Entry Level": "Mid Level",
      "Mid Level": "Senior Level",
      "Senior Level": "Senior Level", // Keep at senior for highest level
    }
    return difficultyMap[selectedDifficulty] || "Mid Level"
  }

  private getCategoryForQuestion(question: string): string {
    const lowerQuestion = question.toLowerCase()

    if (lowerQuestion.includes("design") || lowerQuestion.includes("architect") || lowerQuestion.includes("system")) {
      return "System Design"
    }
    if (
      lowerQuestion.includes("team") ||
      lowerQuestion.includes("time") ||
      lowerQuestion.includes("challenge") ||
      lowerQuestion.includes("tell me about")
    ) {
      return "Behavioral"
    }
    if (lowerQuestion.includes("technical") || lowerQuestion.includes("code") || lowerQuestion.includes("algorithm")) {
      return "Technical"
    }
    if (lowerQuestion.includes("strategy") || lowerQuestion.includes("business") || lowerQuestion.includes("market")) {
      return "Strategic"
    }
    if (lowerQuestion.includes("data") || lowerQuestion.includes("model") || lowerQuestion.includes("analysis")) {
      return "Analytical"
    }
    return "Problem-Solving"
  }
}

export class AIInterviewer {
  private context: InterviewContext
  private advancedGenerator: AdvancedQuestionGenerator
  private useAI = true
  private followUpSequence: string[] = [] // Track follow-up sequence

  constructor(context: InterviewContext) {
    this.context = context
    this.advancedGenerator = new AdvancedQuestionGenerator()
  }

  async generateNextQuestion(): Promise<AIResponse> {
    console.log("🤖 Generating advanced question for:", this.context.jobRole, this.context.difficulty)

    // Try AI first, then fall back to advanced generator
    if (this.useAI) {
      try {
        return await this.generateAIQuestion()
      } catch (error) {
        console.error("❌ AI generation failed, using advanced generator:", error)
        this.useAI = false
      }
    }

    // Use advanced local generator
    console.log("🧠 Using advanced question generator")
    return this.advancedGenerator.generateQuestion(this.context)
  }

  private async generateAIQuestion(): Promise<AIResponse> {
    const actualDifficulty = this.getHigherDifficulty(this.context.difficulty)
    const prompt = this.generateAdvancedQuestionPrompt(actualDifficulty)

    try {
      const result = await generateText({
        model: google("gemini-1.5-flash-latest"), // Use latest version
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
"actualDifficulty": "${actualDifficulty}",
"context": "Brief explanation"
}

Guidelines:
- ${actualDifficulty} level questions for ${this.context.jobRole}
- Make questions realistic and commonly asked
- Avoid repeating previous questions: ${this.context.previousQuestions.slice(-3).join(", ")}`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        maxTokens: 400,
      })

      console.log("🎯 AI Response:", result.text)

      // Clean and parse response with better error handling
      let cleanedText = result.text.trim()

      // Remove markdown formatting
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      // Try to parse JSON
      let aiResponse
      try {
        aiResponse = JSON.parse(cleanedText)
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError)
        console.error("Raw response:", cleanedText)
        throw new Error("Invalid JSON response from AI")
      }

      // Validate required fields
      if (!aiResponse.question || !aiResponse.category) {
        console.error("Missing required fields:", aiResponse)
        throw new Error("Invalid AI response structure - missing required fields")
      }

      // Ensure all required fields are present
      const validatedResponse = {
        question: aiResponse.question,
        questionType: aiResponse.questionType || "main",
        category: aiResponse.category,
        expectedDuration: aiResponse.expectedDuration || 3,
        difficulty: this.context.difficulty as "Easy" | "Medium" | "Hard",
        actualDifficulty: aiResponse.actualDifficulty || actualDifficulty,
        context: aiResponse.context || `Generated question for ${this.context.jobRole}`,
      }

      console.log("✅ AI question generated successfully")
      return validatedResponse
    } catch (error) {
      console.error("❌ AI generation error:", error)
      throw error
    }
  }

  private generateAdvancedQuestionPrompt(actualDifficulty: string): string {
    const avgScore =
      this.context.previousScores.length > 0
        ? this.context.previousScores.reduce((a, b) => a + b, 0) / this.context.previousScores.length
        : 75

    let prompt = `Generate a challenging ${actualDifficulty} interview question for ${this.context.jobRole}.`

    if (this.context.currentQuestionNumber === 1) {
      prompt += ` Start with a complex opening question that immediately tests their depth of knowledge.`
    } else {
      if (avgScore > 80) {
        prompt += ` Candidate is doing well - make this question significantly harder to really test their limits.`
      } else if (avgScore < 60) {
        prompt += ` Candidate is struggling - but maintain the challenging level to see if they can rise to the occasion.`
      } else {
        prompt += ` Candidate is average - push them with a question that separates good from great.`
      }
    }

    // Add role-specific advanced guidance
    if (this.context.jobRole.toLowerCase().includes("engineer")) {
      prompt += ` Focus on complex system design, scalability challenges, or advanced technical concepts that senior engineers face.`
    } else if (this.context.jobRole.toLowerCase().includes("product")) {
      prompt += ` Focus on strategic product decisions, complex trade-offs, or scenarios with ambiguous requirements.`
    } else if (this.context.jobRole.toLowerCase().includes("data")) {
      prompt += ` Focus on advanced statistical concepts, complex data problems, or real-world ML challenges.`
    }

    prompt += ` Make it a question that would be asked at top-tier companies like Google, Amazon, or Netflix.`
    return prompt
  }

  private getHigherDifficulty(selectedDifficulty: string): string {
    const difficultyMap: { [key: string]: string } = {
      "Entry Level": "Mid Level",
      "Mid Level": "Senior Level",
      "Senior Level": "Senior Level",
    }
    return difficultyMap[selectedDifficulty] || "Mid Level"
  }

  async analyzeAnswer(question: string, answer: string): Promise<AnswerAnalysis> {
    console.log("🔍 Performing strict analysis...")

    if (this.useAI) {
      try {
        return await this.generateStrictAIAnalysis(question, answer)
      } catch (error) {
        console.error("❌ AI analysis failed, using strict local analysis:", error)
      }
    }

    return this.generateStrictAnalysis(question, answer)
  }

  private async generateStrictAIAnalysis(question: string, answer: string): Promise<AnswerAnalysis> {
    try {
      const result = await generateText({
        model: google("gemini-1.5-flash-latest"),
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
"followUpNeeded": false,
"realityCheck": "Honest assessment",
"industryStandard": "Industry expectations"
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
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      const analysis = JSON.parse(cleanedText)

      // Validate and provide defaults for missing fields
      return {
        score: analysis.score || 70,
        detailedFeedback: analysis.detailedFeedback || "Analysis completed",
        strengths: analysis.strengths || ["Attempted to answer"],
        weaknesses: analysis.weaknesses || ["Could provide more detail"],
        improvementSuggestions: analysis.improvementSuggestions || ["Practice more examples"],
        idealAnswer: analysis.idealAnswer || "A stronger answer would include specific examples",
        nextQuestionDirection: analysis.nextQuestionDirection || "same",
        followUpNeeded: analysis.followUpNeeded || false,
        realityCheck: analysis.realityCheck || "Continue practicing to improve",
        industryStandard: analysis.industryStandard || "Industry expects clear, detailed responses",
      }
    } catch (error) {
      console.error("❌ AI analysis error:", error)
      throw error
    }
  }

  private generateStrictAnalysis(question: string, answer: string): AnswerAnalysis {
    const answerLength = answer.trim().length
    const hasExamples = answer.toLowerCase().includes("example") || answer.toLowerCase().includes("experience")
    const hasSpecifics = /\d/.test(answer) || answer.includes("%") || answer.includes("$")
    const hasMethodology =
      answer.toLowerCase().includes("approach") ||
      answer.toLowerCase().includes("process") ||
      answer.toLowerCase().includes("method")
    const showsDepth = answer.split(".").length > 3 // Multiple sentences showing depth
    const usesIndustryTerms = this.checkIndustryTerms(answer, this.context.jobRole)

    let score = 50 // Start lower for strict scoring

    // Strict scoring criteria
    if (answerLength > 300) score += 15
    else if (answerLength > 150) score += 10
    else if (answerLength < 50) score -= 20

    if (hasExamples) score += 15
    if (hasSpecifics) score += 10
    if (hasMethodology) score += 10
    if (showsDepth) score += 10
    if (usesIndustryTerms) score += 10

    // Penalty for generic answers
    if (answer.toLowerCase().includes("it depends") && answerLength < 100) score -= 10
    if (answer.toLowerCase().includes("i think") && !hasExamples) score -= 5

    score = Math.max(30, Math.min(95, score))

    const realityCheck = this.generateRealityCheck(score, answer, this.context.jobRole)
    const industryStandard = this.getIndustryStandard(this.context.jobRole, this.context.difficulty)

    return {
      score,
      detailedFeedback: this.generateStrictFeedback(score, answer, hasExamples, hasSpecifics, showsDepth),
      strengths: this.identifyStrengths(answer, hasExamples, hasSpecifics, hasMethodology, usesIndustryTerms),
      weaknesses: this.identifyWeaknesses(answer, score, hasExamples, hasSpecifics, showsDepth),
      improvementSuggestions: this.generateImprovementSuggestions(score, answer, this.context.jobRole),
      idealAnswer: this.generateIdealAnswer(question, this.context.jobRole),
      nextQuestionDirection: score >= 80 ? "harder" : score < 60 ? "easier" : "same",
      followUpNeeded: score < 75,
      followUpReason: score < 75 ? "Need to probe deeper to assess true understanding" : undefined,
      realityCheck,
      industryStandard,
    }
  }

  private checkIndustryTerms(answer: string, jobRole: string): boolean {
    const lowerAnswer = answer.toLowerCase()

    if (jobRole.includes("Engineer")) {
      return (
        lowerAnswer.includes("scalability") ||
        lowerAnswer.includes("architecture") ||
        lowerAnswer.includes("performance") ||
        lowerAnswer.includes("optimization") ||
        lowerAnswer.includes("microservices") ||
        lowerAnswer.includes("api")
      )
    } else if (jobRole.includes("Product")) {
      return (
        lowerAnswer.includes("metrics") ||
        lowerAnswer.includes("kpi") ||
        lowerAnswer.includes("user experience") ||
        lowerAnswer.includes("roadmap") ||
        lowerAnswer.includes("stakeholder") ||
        lowerAnswer.includes("mvp")
      )
    } else if (jobRole.includes("Data")) {
      return (
        lowerAnswer.includes("model") ||
        lowerAnswer.includes("algorithm") ||
        lowerAnswer.includes("statistical") ||
        lowerAnswer.includes("hypothesis") ||
        lowerAnswer.includes("correlation") ||
        lowerAnswer.includes("regression")
      )
    }
    return false
  }

  private generateRealityCheck(score: number, answer: string, jobRole: string): string {
    if (score >= 85) {
      return "Strong performance - you're demonstrating the depth expected for this role."
    } else if (score >= 75) {
      return "Decent answer, but top companies will expect more depth and specific examples."
    } else if (score >= 65) {
      return "Your answer shows basic understanding, but lacks the sophistication needed for competitive roles."
    } else if (score >= 50) {
      return "Significant gaps evident. You'll need substantial preparation before interviewing at target companies."
    } else {
      return "This response suggests you may not be ready for this level of role. Consider focusing on fundamentals first."
    }
  }

  private getIndustryStandard(jobRole: string, difficulty: string): string {
    const standards = {
      "Software Engineer": {
        "Entry Level":
          "Entry-level engineers should demonstrate solid coding fundamentals, basic system design understanding, and ability to learn quickly.",
        "Mid Level":
          "Mid-level engineers must show system design skills, leadership potential, and ability to handle complex technical challenges independently.",
        "Senior Level":
          "Senior engineers need to demonstrate architectural thinking, mentorship capabilities, and ability to drive technical strategy.",
      },
      "Product Manager": {
        "Entry Level":
          "Entry-level PMs should show analytical thinking, user empathy, and basic understanding of product development lifecycle.",
        "Mid Level":
          "Mid-level PMs must demonstrate strategic thinking, stakeholder management, and ability to drive product decisions with data.",
        "Senior Level":
          "Senior PMs need to show vision-setting abilities, cross-functional leadership, and deep market understanding.",
      },
      "Data Scientist": {
        "Entry Level":
          "Entry-level data scientists should demonstrate statistical knowledge, programming skills, and ability to derive insights from data.",
        "Mid Level":
          "Mid-level data scientists must show advanced modeling skills, business acumen, and ability to deploy production systems.",
        "Senior Level":
          "Senior data scientists need to demonstrate strategic thinking, team leadership, and ability to drive data strategy.",
      },
    }

    return (
      standards[jobRole]?.[difficulty] ||
      "Industry expects strong technical skills, clear communication, and proven ability to deliver results."
    )
  }

  private generateStrictFeedback(
    score: number,
    answer: string,
    hasExamples: boolean,
    hasSpecifics: boolean,
    showsDepth: boolean,
  ): string {
    let feedback = ""

    if (score >= 85) {
      feedback = "Strong response that demonstrates good understanding. "
    } else if (score >= 75) {
      feedback = "Adequate response that covers the basics. "
    } else if (score >= 65) {
      feedback = "Weak response with significant gaps. "
    } else {
      feedback = "Poor response that doesn't meet expectations. "
    }

    if (!hasExamples) {
      feedback += "Your answer lacks concrete examples, which makes it difficult to assess your actual experience. "
    }

    if (!hasSpecifics) {
      feedback += "You need to include specific metrics, numbers, or technical details to demonstrate depth. "
    }

    if (!showsDepth) {
      feedback += "Your response is too surface-level for this type of question. "
    }

    if (answer.length < 100) {
      feedback += "Your answer is too brief - interviewers expect more comprehensive responses. "
    }

    return feedback.trim()
  }

  private identifyStrengths(
    answer: string,
    hasExamples: boolean,
    hasSpecifics: boolean,
    hasMethodology: boolean,
    usesIndustryTerms: boolean,
  ): string[] {
    const strengths: string[] = []

    if (hasExamples) strengths.push("Provided concrete examples")
    if (hasSpecifics) strengths.push("Included specific details and metrics")
    if (hasMethodology) strengths.push("Described systematic approach")
    if (usesIndustryTerms) strengths.push("Used appropriate technical terminology")
    if (answer.length > 200) strengths.push("Comprehensive response")

    if (strengths.length === 0) {
      strengths.push("Attempted to answer the question")
    }

    return strengths
  }

  private identifyWeaknesses(
    answer: string,
    score: number,
    hasExamples: boolean,
    hasSpecifics: boolean,
    showsDepth: boolean,
  ): string[] {
    const weaknesses: string[] = []

    if (!hasExamples) weaknesses.push("No concrete examples provided")
    if (!hasSpecifics) weaknesses.push("Lacks specific metrics or details")
    if (!showsDepth) weaknesses.push("Response too surface-level")
    if (answer.length < 100) weaknesses.push("Answer too brief for the question complexity")
    if (score < 70) weaknesses.push("Doesn't demonstrate required depth of knowledge")

    const genericPhrases = ["it depends", "i think", "maybe", "probably"]
    if (genericPhrases.some((phrase) => answer.toLowerCase().includes(phrase))) {
      weaknesses.push("Too many vague or uncertain statements")
    }

    return weaknesses
  }

  private generateImprovementSuggestions(score: number, answer: string, jobRole: string): string[] {
    const suggestions: string[] = []

    if (score < 70) {
      suggestions.push("Study fundamental concepts more deeply before interviewing")
    }

    if (!answer.toLowerCase().includes("example")) {
      suggestions.push("Prepare 3-5 detailed STAR method examples for different scenarios")
    }

    if (answer.length < 150) {
      suggestions.push("Practice giving more comprehensive answers (2-3 minutes speaking time)")
    }

    if (jobRole.includes("Engineer")) {
      suggestions.push("Practice system design problems and architectural thinking")
      suggestions.push("Prepare examples of complex technical challenges you've solved")
    } else if (jobRole.includes("Product")) {
      suggestions.push("Prepare examples of data-driven product decisions")
      suggestions.push("Practice explaining complex trade-offs and prioritization frameworks")
    } else if (jobRole.includes("Data")) {
      suggestions.push("Prepare examples of end-to-end data science projects")
      suggestions.push("Practice explaining technical concepts to non-technical audiences")
    }

    suggestions.push("Research the company and role-specific challenges")
    suggestions.push("Practice with mock interviews to improve confidence and delivery")

    return suggestions
  }

  private generateIdealAnswer(question: string, jobRole: string): string {
    return `A strong answer would include: (1) A clear framework or approach, (2) Specific examples from your experience with measurable outcomes, (3) Discussion of trade-offs and alternatives considered, (4) Lessons learned and how you'd apply them differently, (5) Connection to business impact or user value. The response should be 2-3 minutes long and demonstrate both technical depth and strategic thinking appropriate for a ${jobRole} role.`
  }

  async generateFollowUpQuestion(
    originalQuestion: string,
    answer: string,
    analysis: AnswerAnalysis,
  ): Promise<AIResponse> {
    // Determine follow-up type based on analysis and sequence
    const followUpTypes = this.getFollowUpSequence(analysis, originalQuestion)
    const currentFollowUpType = followUpTypes[this.followUpSequence.length] || "clarification"

    this.followUpSequence.push(currentFollowUpType)

    const followUpQuestions = {
      example: [
        "Can you walk me through a specific example where you implemented this approach?",
        "Tell me about a real situation where you used this solution.",
        "Give me a concrete example from your experience with this.",
      ],
      metrics: [
        "What metrics would you use to measure success in this scenario?",
        "How would you quantify the impact of this solution?",
        "What KPIs would you track to ensure this approach is working?",
      ],
      constraints: [
        "How would you handle this situation if you had half the resources?",
        "What if you had a much tighter deadline for this?",
        "How would this change if you had budget constraints?",
      ],
      alternatives: [
        "What alternative approaches did you consider and why did you choose this one?",
        "What are the trade-offs of your chosen approach?",
        "How would you modify this solution for a different context?",
      ],
      scale: [
        "How does this scale when dealing with 10x the volume/complexity?",
        "What challenges would arise if this system grew significantly?",
        "How would you architect this for global scale?",
      ],
      risks: [
        "What are the potential risks or downsides of this approach?",
        "What could go wrong with this solution?",
        "How would you mitigate the main risks?",
      ],
      clarification: [
        "Can you clarify what you meant by that specific point?",
        "I'd like to understand your thinking process better on this.",
        "Could you elaborate on that particular aspect?",
      ],
    }

    const questions = followUpQuestions[currentFollowUpType] || followUpQuestions["clarification"]
    const selectedQuestion = questions[Math.floor(Math.random() * questions.length)]

    return {
      question: selectedQuestion,
      questionType: "followup",
      category: "Deep-dive",
      expectedDuration: 2,
      difficulty: this.context.difficulty as "Easy" | "Medium" | "Hard",
      actualDifficulty: `Follow-up: ${currentFollowUpType}`,
      context: `Structured follow-up to assess ${currentFollowUpType} understanding`,
    }
  }

  private getFollowUpSequence(analysis: AnswerAnalysis, originalQuestion: string): string[] {
    // Determine logical follow-up sequence based on answer quality and question type
    if (analysis.score < 60) {
      return ["clarification", "example"] // Need basic clarification first
    } else if (analysis.score < 75) {
      return ["example", "metrics"] // Need concrete examples
    } else {
      // Good answer, probe deeper
      if (originalQuestion.toLowerCase().includes("design") || originalQuestion.toLowerCase().includes("system")) {
        return ["scale", "risks", "alternatives"]
      } else if (
        originalQuestion.toLowerCase().includes("time") ||
        originalQuestion.toLowerCase().includes("challenge")
      ) {
        return ["metrics", "alternatives", "constraints"]
      } else {
        return ["example", "scale", "risks"]
      }
    }
  }

  async generateInterviewerComment(analysis: AnswerAnalysis): Promise<string> {
    const comments = [
      "I see. Let me dig deeper into that.",
      "Interesting approach. Tell me more about the implementation.",
      "That's one way to handle it. Let's explore this further.",
      "I'd like to understand your thinking process better.",
      "Good start. Can you be more specific about the details?",
      "Let's dive deeper into the technical aspects.",
      "I want to understand how you'd handle the edge cases.",
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
  realityCheck: string
  industryComparison: string
}> {
  console.log("📋 Generating strict interview summary...")

  try {
    const result = await generateText({
      model: google("gemini-1.5-flash"),
      messages: [
        {
          role: "system",
          content: `Provide honest, comprehensive interview performance summary. Be direct about readiness.

IMPORTANT: Respond ONLY with valid JSON:
{
  "overallFeedback": "Honest comprehensive feedback",
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "criticalImprovements": ["critical improvement1", "critical improvement2"],
  "readinessScore": 75,
  "nextSteps": ["specific actionable step1", "specific actionable step2"],
  "realityCheck": "Honest assessment of interview readiness",
  "industryComparison": "How they compare to industry standards"
}

Be honest about gaps and provide realistic timeline for improvement.`,
        },
        {
          role: "user",
          content: `Provide strict summary for ${jobRole} interview:
Average Score: ${analyses.reduce((acc, a) => acc + a.score, 0) / analyses.length}
Questions: ${questions.length}
All Strengths: ${analyses.flatMap((a) => a.strengths).join(", ")}
All Weaknesses: ${analyses.flatMap((a) => a.weaknesses).join("; ")}
Reality Checks: ${analyses.map((a) => a.realityCheck).join("; ")}

Be honest about readiness and provide realistic improvement timeline.`,
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
  } catch (error) {
    console.error("❌ Summary generation failed:", error)

    const avgScore = analyses.reduce((acc, a) => acc + a.score, 0) / analyses.length

    return {
      overallFeedback: `Your ${jobRole} interview performance averaged ${avgScore.toFixed(0)}%. While you demonstrated some relevant knowledge, there are significant areas that need improvement before you'll be competitive for top-tier positions.`,
      keyStrengths: ["Basic understanding of concepts", "Willingness to attempt difficult questions"],
      criticalImprovements: [
        "Add specific examples with metrics",
        "Demonstrate deeper technical knowledge",
        "Practice structured problem-solving",
      ],
      readinessScore: Math.round(avgScore),
      nextSteps: [
        "Spend 2-3 months practicing with real interview questions",
        "Build portfolio of concrete examples with measurable outcomes",
        "Study advanced concepts specific to your target role",
        "Practice mock interviews with experienced professionals",
      ],
      realityCheck:
        avgScore >= 80
          ? "You're on the right track but need more practice"
          : "Significant preparation needed before interviewing at competitive companies",
      industryComparison:
        avgScore >= 80 ? "Above average but room for improvement" : "Below industry standards for competitive roles",
    }
  }
}
