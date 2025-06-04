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
    console.log("🤖 Generating AI question for:", this.context.jobRole, this.context.difficulty)

    try {
      const prompt = this.generateQuestionPrompt()
      console.log("📝 Question prompt:", prompt)

      const result = await generateText({
        model: openai("gpt-4o-mini"), // Using gpt-4o-mini for better reliability
        messages: [
          {
            role: "system",
            content: `You are an expert technical interviewer conducting a ${this.context.difficulty} level interview for a ${this.context.jobRole} position. 

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
- Entry Level: Basic concepts, simple scenarios, foundational knowledge
- Mid Level: Complex scenarios, system design basics, leadership situations  
- Senior Level: Advanced concepts, complex system design, strategic thinking

You MUST respond with valid JSON in this exact format:
{
  "question": "Your interview question here",
  "questionType": "main",
  "category": "Technical",
  "expectedDuration": 3,
  "difficulty": "${this.context.difficulty}",
  "context": "Brief explanation of why you chose this question"
}`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        maxTokens: 500,
      })

      console.log("🎯 AI Response received:", result.text)

      // Clean the response text to ensure it's valid JSON
      let cleanedText = result.text.trim()

      // Remove any markdown code blocks if present
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      const aiResponse = JSON.parse(cleanedText)

      // Validate the response structure
      if (!aiResponse.question || !aiResponse.category) {
        throw new Error("Invalid AI response structure")
      }

      console.log("✅ Successfully parsed AI response:", aiResponse)
      return aiResponse
    } catch (error) {
      console.error("❌ Error generating AI question:", error)
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        context: this.context,
      })

      // Return fallback question with clear indication it's a fallback
      console.log("🔄 Using fallback question")
      return this.getFallbackQuestion()
    }
  }

  private generateQuestionPrompt(): string {
    const avgScore =
      this.context.previousScores.length > 0
        ? this.context.previousScores.reduce((a, b) => a + b, 0) / this.context.previousScores.length
        : 75

    let prompt = `Generate an interview question for a ${this.context.jobRole} candidate at ${this.context.difficulty} level.`

    if (this.context.currentQuestionNumber === 1) {
      prompt += ` This is the opening question - start with something that helps assess their background and sets the tone for a ${this.context.jobRole} interview.`
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
    if (
      this.context.jobRole.toLowerCase().includes("engineer") ||
      this.context.jobRole.toLowerCase().includes("developer")
    ) {
      prompt += ` Focus on technical skills, coding concepts, system design, and problem-solving approaches.`
    } else if (this.context.jobRole.toLowerCase().includes("manager")) {
      prompt += ` Focus on leadership, strategy, team management, and decision-making scenarios.`
    } else if (this.context.jobRole.toLowerCase().includes("data")) {
      prompt += ` Focus on data analysis, statistics, machine learning, and data-driven decision making.`
    } else if (this.context.jobRole.toLowerCase().includes("product")) {
      prompt += ` Focus on product strategy, user experience, market analysis, and product development lifecycle.`
    }

    if (this.context.companyType) {
      prompt += ` Tailor the question for a ${this.context.companyType} company environment.`
    }

    prompt += ` Make the question realistic and commonly asked in actual ${this.context.jobRole} interviews.`

    return prompt
  }

  async analyzeAnswer(question: string, answer: string): Promise<AnswerAnalysis> {
    console.log("🔍 Analyzing answer for question:", question.substring(0, 50) + "...")

    try {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "system",
            content: `You are an expert interview assessor analyzing candidate responses. Provide detailed, constructive feedback that helps candidates improve.

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

You MUST respond with valid JSON in this exact format:
{
  "score": 85,
  "detailedFeedback": "Comprehensive feedback paragraph",
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
  "improvementSuggestions": ["Specific suggestion 1", "Specific suggestion 2"],
  "idealAnswer": "A better way to answer would be...",
  "nextQuestionDirection": "same",
  "followUpNeeded": false,
  "followUpReason": "Optional reason for follow-up"
}`,
          },
          {
            role: "user",
            content: `Analyze this interview response:

Job Role: ${this.context.jobRole}
Difficulty Level: ${this.context.difficulty}
Question: "${question}"
Candidate's Answer: "${answer}"

Provide a comprehensive analysis with specific, actionable feedback.`,
          },
        ],
        temperature: 0.3,
        maxTokens: 800,
      })

      console.log("📊 AI Analysis received:", result.text)

      // Clean the response text
      let cleanedText = result.text.trim()
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      const analysis = JSON.parse(cleanedText)

      // Validate the analysis structure
      if (typeof analysis.score !== "number" || !analysis.detailedFeedback) {
        throw new Error("Invalid analysis response structure")
      }

      console.log("✅ Successfully parsed AI analysis:", analysis)
      return analysis
    } catch (error) {
      console.error("❌ Error analyzing answer:", error)
      console.log("🔄 Using fallback analysis")
      return this.getFallbackAnalysis()
    }
  }

  async generateFollowUpQuestion(
    originalQuestion: string,
    answer: string,
    analysis: AnswerAnalysis,
  ): Promise<AIResponse> {
    console.log("🔄 Generating follow-up question...")

    try {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "system",
            content: `You are an experienced interviewer generating a natural follow-up question based on the candidate's response. The follow-up should feel conversational and dig deeper into their answer.

You MUST respond with valid JSON in this exact format:
{
  "question": "Your follow-up question here",
  "questionType": "followup",
  "category": "Follow-up",
  "expectedDuration": 2,
  "difficulty": "${this.context.difficulty}",
  "context": "Why this follow-up was chosen"
}`,
          },
          {
            role: "user",
            content: `Original question: "${originalQuestion}"
Candidate's answer: "${answer}"
Analysis score: ${analysis.score}
Follow-up reason: ${analysis.followUpReason || "Explore answer further"}

Generate a natural follow-up question that explores their answer further.`,
          },
        ],
        temperature: 0.7,
        maxTokens: 300,
      })

      let cleanedText = result.text.trim()
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      const followUp = JSON.parse(cleanedText)
      console.log("✅ Successfully generated follow-up:", followUp)
      return followUp
    } catch (error) {
      console.error("❌ Error generating follow-up:", error)
      console.log("🔄 Using fallback follow-up")
      return this.getFallbackQuestion()
    }
  }

  async generateInterviewerComment(analysis: AnswerAnalysis): Promise<string> {
    console.log("💬 Generating interviewer comment...")

    try {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "system",
            content: `You are a professional interviewer providing brief, encouraging feedback during an interview. Keep responses natural, professional, and 1-2 sentences max. Don't reveal the full analysis score.`,
          },
          {
            role: "user",
            content: `The candidate just gave an answer that scored ${analysis.score}/100. 
Strengths: ${analysis.strengths.join(", ")}

Provide a brief, encouraging interviewer response that acknowledges their answer naturally.`,
          },
        ],
        temperature: 0.8,
        maxTokens: 100,
      })

      const comment = result.text.trim()
      console.log("✅ Generated interviewer comment:", comment)
      return comment
    } catch (error) {
      console.error("❌ Error generating comment:", error)
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
    console.log("🔄 Using fallback question for:", this.context.jobRole)

    const fallbackQuestions = {
      "Software Engineer":
        "Can you walk me through how you would approach debugging a performance issue in a web application?",
      "Senior Software Engineer": "Describe how you would design a scalable system to handle millions of users.",
      "Product Manager": "How would you prioritize features when you have limited development resources?",
      "Senior Product Manager":
        "Tell me about a time you had to make a difficult product decision with incomplete data.",
      "Data Scientist": "Explain how you would approach a machine learning problem from start to finish.",
      "Senior Data Scientist": "How would you design an A/B testing framework for a large-scale application?",
      "Marketing Manager": "How would you measure the success of a marketing campaign?",
      "Sales Representative": "Tell me about a time when you had to overcome a difficult objection from a client.",
      "Business Analyst": "How would you gather requirements for a new system implementation?",
      "UX Designer": "Walk me through your design process for a new feature.",
      "DevOps Engineer": "How would you implement a CI/CD pipeline for a microservices architecture?",
      "Financial Analyst": "How would you analyze the financial impact of a new business initiative?",
      "HR Manager": "How would you handle a conflict between team members?",
    }

    const question =
      fallbackQuestions[this.context.jobRole] ||
      "Tell me about a challenging project you worked on recently and how you approached it."

    return {
      question,
      questionType: "main",
      category: "General",
      expectedDuration: 3,
      difficulty: this.context.difficulty as "Easy" | "Medium" | "Hard",
      context: `Tailored question for ${this.context.jobRole} at ${this.context.difficulty} level`,
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
  console.log("📋 Generating interview summary...")

  try {
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: `You are an expert career coach providing a comprehensive interview performance summary. Analyze the entire interview and provide actionable insights.

You MUST respond with valid JSON in this exact format:
{
  "overallFeedback": "Comprehensive paragraph about overall performance",
  "keyStrengths": ["Top 3-5 strengths across the interview"],
  "criticalImprovements": ["Top 3-5 areas needing improvement"],
  "readinessScore": 85,
  "nextSteps": ["Specific actionable steps for improvement"]
}`,
        },
        {
          role: "user",
          content: `Interview Summary Analysis:

Job Role: ${jobRole}
Difficulty: ${difficulty}
Number of Questions: ${questions.length}
Average Score: ${analyses.reduce((acc, a) => acc + a.score, 0) / analyses.length}

Questions and Scores:
${questions.map((q, i) => `Q${i + 1}: ${q} (Score: ${analyses[i]?.score || 0})`).join("\n")}

All Strengths: ${analyses.flatMap((a) => a.strengths).join(", ")}
All Weaknesses: ${analyses.flatMap((a) => a.weaknesses).join(", ")}

Provide a comprehensive summary with actionable insights.`,
        },
      ],
      temperature: 0.3,
      maxTokens: 800,
    })

    let cleanedText = result.text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    const summary = JSON.parse(cleanedText)
    console.log("✅ Generated interview summary:", summary)
    return summary
  } catch (error) {
    console.error("❌ Error generating summary:", error)
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
