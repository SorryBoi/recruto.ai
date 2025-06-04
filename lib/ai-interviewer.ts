import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

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

export class AIInterviewer {
  private context: InterviewContext

  constructor(context: InterviewContext) {
    this.context = context
  }

  async generateNextQuestion(): Promise<AIResponse> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: `You are an expert technical interviewer conducting a ${this.context.difficulty} level interview for a ${this.context.jobRole} position. 

        Your role is to:
        1. Ask relevant, challenging questions that assess the candidate's skills
        2. Adapt question difficulty based on previous performance
        3. Ensure questions are realistic and commonly asked in actual interviews
        4. Vary question types (technical, behavioral, situational, problem-solving)
        5. Create follow-up questions based on candidate responses
        6. Make the interview feel conversational and natural

        Interview Context:
        - Job Role: ${this.context.jobRole}
        - Difficulty: ${this.context.difficulty}
        - Question Number: ${this.context.currentQuestionNumber}
        - Previous Questions: ${this.context.previousQuestions.join("; ")}
        - Previous Scores: ${this.context.previousScores.join(", ")}

        Guidelines for question difficulty:
        - Easy (Entry Level): Basic concepts, simple scenarios, foundational knowledge
        - Medium (Mid Level): Complex scenarios, system design basics, leadership situations
        - Hard (Senior Level): Advanced concepts, complex system design, strategic thinking

        Return your response in this exact JSON format:
        {
          "question": "Your interview question here",
          "questionType": "main|followup|clarification|deep-dive",
          "category": "Technical|Behavioral|Situational|Problem-Solving|System-Design",
          "expectedDuration": 3,
          "difficulty": "Easy|Medium|Hard",
          "context": "Brief explanation of why you chose this question"
        }`,
        prompt: this.generateQuestionPrompt(),
      })

      return JSON.parse(text)
    } catch (error) {
      console.error("Error generating question:", error)
      // Return fallback question without error context
      return this.getFallbackQuestion()
    }
  }

  private generateQuestionPrompt(): string {
    const avgScore =
      this.context.previousScores.length > 0
        ? this.context.previousScores.reduce((a, b) => a + b, 0) / this.context.previousScores.length
        : 75

    let prompt = `Generate the next interview question for a ${this.context.jobRole} candidate.`

    if (this.context.currentQuestionNumber === 1) {
      prompt += ` This is the opening question - start with something that helps assess their background and sets the tone.`
    } else {
      prompt += ` This is question ${this.context.currentQuestionNumber}.`

      if (avgScore > 80) {
        prompt += ` The candidate is performing well (avg score: ${avgScore.toFixed(0)}). Increase difficulty or explore advanced topics.`
      } else if (avgScore < 60) {
        prompt += ` The candidate is struggling (avg score: ${avgScore.toFixed(0)}). Ask more foundational questions or provide easier scenarios.`
      } else {
        prompt += ` The candidate is performing adequately (avg score: ${avgScore.toFixed(0)}). Maintain current difficulty level.`
      }
    }

    // Add role-specific guidance
    if (this.context.jobRole.toLowerCase().includes("engineer")) {
      prompt += ` Focus on technical skills, coding concepts, system design, and problem-solving.`
    } else if (this.context.jobRole.toLowerCase().includes("manager")) {
      prompt += ` Focus on leadership, strategy, team management, and decision-making scenarios.`
    } else if (this.context.jobRole.toLowerCase().includes("data")) {
      prompt += ` Focus on data analysis, statistics, machine learning, and data-driven decision making.`
    }

    return prompt
  }

  async analyzeAnswer(question: string, answer: string): Promise<AnswerAnalysis> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: `You are an expert interview assessor analyzing candidate responses. Provide detailed, constructive feedback that helps candidates improve.

        Scoring Guidelines:
        - 90-100: Exceptional answer - comprehensive, well-structured, demonstrates deep understanding
        - 80-89: Strong answer - good examples, clear communication, shows competence
        - 70-79: Adequate answer - addresses question but lacks depth or examples
        - 60-69: Weak answer - minimal examples, unclear communication, basic understanding
        - Below 60: Poor answer - doesn't address question, lacks understanding

        Consider:
        - Relevance to the question
        - Depth of knowledge demonstrated
        - Use of specific examples
        - Communication clarity
        - Problem-solving approach
        - Leadership/teamwork aspects (if applicable)

        Return analysis in this exact JSON format:
        {
          "score": 85,
          "detailedFeedback": "Comprehensive feedback paragraph",
          "strengths": ["Specific strength 1", "Specific strength 2"],
          "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
          "improvementSuggestions": ["Specific suggestion 1", "Specific suggestion 2"],
          "idealAnswer": "A better way to answer would be...",
          "nextQuestionDirection": "easier|harder|same|different-topic",
          "followUpNeeded": true,
          "followUpReason": "Reason for follow-up if needed"
        }`,
        prompt: `Analyze this interview response:

        Job Role: ${this.context.jobRole}
        Difficulty Level: ${this.context.difficulty}
        Question: "${question}"
        Candidate's Answer: "${answer}"

        Provide a comprehensive analysis with specific, actionable feedback.`,
      })

      return JSON.parse(text)
    } catch (error) {
      console.error("Error analyzing answer:", error)
      return this.getFallbackAnalysis()
    }
  }

  async generateFollowUpQuestion(
    originalQuestion: string,
    answer: string,
    analysis: AnswerAnalysis,
  ): Promise<AIResponse> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: `You are an experienced interviewer generating a natural follow-up question based on the candidate's response. The follow-up should feel conversational and dig deeper into their answer.`,
        prompt: `Original question: "${originalQuestion}"
        Candidate's answer: "${answer}"
        Analysis score: ${analysis.score}
        Follow-up reason: ${analysis.followUpReason}

        Generate a natural follow-up question that explores their answer further. Return in the same JSON format as before.`,
      })

      return JSON.parse(text)
    } catch (error) {
      console.error("Error generating follow-up:", error)
      return this.getFallbackQuestion()
    }
  }

  async generateInterviewerComment(analysis: AnswerAnalysis): Promise<string> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: `You are a professional interviewer providing brief, encouraging feedback during an interview. Keep responses natural, professional, and 1-2 sentences max. Don't reveal the full analysis.`,
        prompt: `The candidate just gave an answer that scored ${analysis.score}/100. 
        Strengths: ${analysis.strengths.join(", ")}
        
        Provide a brief, encouraging interviewer response that acknowledges their answer naturally.`,
      })

      return text.trim()
    } catch (error) {
      console.error("Error generating comment:", error)
      return "Thank you for that response. Let's continue with the next question."
    }
  }

  updateContext(newAnswer: string, newScore: number, newQuestion: string) {
    this.context.previousAnswers.push(newAnswer)
    this.context.previousScores.push(newScore)
    this.context.previousQuestions.push(newQuestion)
    this.context.currentQuestionNumber++
  }

  private getFallbackQuestion(): AIResponse {
    const fallbackQuestions = {
      "Software Engineer":
        "Can you walk me through how you would approach debugging a performance issue in a web application?",
      "Product Manager": "How would you prioritize features when you have limited development resources?",
      "Data Scientist": "Explain how you would approach a machine learning problem from start to finish.",
      "Marketing Manager": "How would you measure the success of a marketing campaign?",
      "Sales Representative": "Tell me about a time when you had to overcome a difficult objection from a client.",
      "Business Analyst": "How would you gather requirements for a new system implementation?",
    }

    const question =
      fallbackQuestions[this.context.jobRole] || "Tell me about a challenging project you worked on recently."

    return {
      question,
      questionType: "main",
      category: "General",
      expectedDuration: 3,
      difficulty: this.context.difficulty as "Easy" | "Medium" | "Hard",
      context: "", // Remove the error message from context
    }
  }

  private getFallbackAnalysis(): AnswerAnalysis {
    return {
      score: 75,
      detailedFeedback:
        "Your answer addresses the question and shows understanding of the topic. Consider adding more specific examples to strengthen your response.",
      strengths: ["Clear communication", "Relevant response"],
      weaknesses: ["Could use more specific examples", "Could elaborate on technical details"],
      improvementSuggestions: ["Add concrete examples from your experience", "Provide more technical depth"],
      idealAnswer:
        "A stronger answer would include specific examples, metrics, and detailed explanations of your approach.",
      nextQuestionDirection: "same",
      followUpNeeded: false,
    }
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
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert career coach providing a comprehensive interview performance summary. Analyze the entire interview and provide actionable insights.`,
      prompt: `Interview Summary Analysis:

      Job Role: ${jobRole}
      Difficulty: ${difficulty}
      Number of Questions: ${questions.length}
      Average Score: ${analyses.reduce((acc, a) => acc + a.score, 0) / analyses.length}

      Questions and Scores:
      ${questions.map((q, i) => `Q${i + 1}: ${q} (Score: ${analyses[i]?.score || 0})`).join("\n")}

      All Strengths: ${analyses.flatMap((a) => a.strengths).join(", ")}
      All Weaknesses: ${analyses.flatMap((a) => a.weaknesses).join(", ")}

      Provide a comprehensive summary in this JSON format:
      {
        "overallFeedback": "Comprehensive paragraph about overall performance",
        "keyStrengths": ["Top 3-5 strengths across the interview"],
        "criticalImprovements": ["Top 3-5 areas needing improvement"],
        "readinessScore": 85,
        "nextSteps": ["Specific actionable steps for improvement"]
      }`,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error generating summary:", error)
    return {
      overallFeedback: "You demonstrated good communication skills and relevant knowledge throughout the interview.",
      keyStrengths: ["Clear communication", "Relevant experience", "Professional demeanor"],
      criticalImprovements: ["Add more specific examples", "Provide deeper technical details", "Practice storytelling"],
      readinessScore: 75,
      nextSteps: [
        "Practice with more technical questions",
        "Prepare specific examples using STAR method",
        "Research company-specific scenarios",
      ],
    }
  }
}
