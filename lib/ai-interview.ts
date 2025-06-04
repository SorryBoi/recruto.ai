import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface InterviewQuestion {
  id: number
  text: string
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  followUp?: string
}

export interface InterviewAnalysis {
  score: number
  strengths: string[]
  improvements: string[]
  feedback: string
  suggestedAnswer: string
}

export async function generateInterviewQuestions(
  jobRole: string,
  difficulty: string,
  count = 5,
): Promise<InterviewQuestion[]> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert interview coach. Generate ${count} interview questions for a ${jobRole} position at ${difficulty} level.

      Return the questions in this exact JSON format:
      [
        {
          "id": 1,
          "text": "Question text here",
          "category": "Technical|Behavioral|Situational|General",
          "difficulty": "Easy|Medium|Hard"
        }
      ]

      Guidelines:
      - For Easy: Basic questions suitable for entry-level candidates
      - For Medium: Questions for candidates with 2-5 years experience
      - For Hard: Advanced questions for senior-level candidates
      - Mix different categories (Technical, Behavioral, Situational, General)
      - Make questions specific to the ${jobRole} role
      - Ensure questions are realistic and commonly asked in interviews`,
      prompt: `Generate ${count} interview questions for a ${jobRole} position at ${difficulty} difficulty level.`,
    })

    const questions = JSON.parse(text)
    return questions.map((q: any, index: number) => ({
      ...q,
      id: index + 1,
    }))
  } catch (error) {
    console.error("Error generating questions:", error)
    // Fallback questions
    return [
      {
        id: 1,
        text: "Tell me about yourself and your background.",
        category: "General",
        difficulty: "Easy" as const,
      },
      {
        id: 2,
        text: `Why are you interested in the ${jobRole} position?`,
        category: "Motivation",
        difficulty: "Easy" as const,
      },
      {
        id: 3,
        text: "Describe a challenging project you worked on.",
        category: "Behavioral",
        difficulty: "Medium" as const,
      },
      {
        id: 4,
        text: "How do you handle working under pressure?",
        category: "Behavioral",
        difficulty: "Medium" as const,
      },
      {
        id: 5,
        text: "Where do you see yourself in 5 years?",
        category: "Career Goals",
        difficulty: "Easy" as const,
      },
    ]
  }
}

export async function analyzeAnswer(
  question: string,
  answer: string,
  jobRole: string,
  difficulty: string,
): Promise<InterviewAnalysis> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert interview coach analyzing candidate responses. Provide detailed feedback to help them improve.

      Return your analysis in this exact JSON format:
      {
        "score": 85,
        "strengths": ["Clear communication", "Good examples"],
        "improvements": ["Add more specific details", "Include metrics"],
        "feedback": "Detailed feedback paragraph",
        "suggestedAnswer": "A better way to answer this question would be..."
      }

      Scoring guidelines:
      - 90-100: Exceptional answer with specific examples, clear structure, and strong relevance
      - 80-89: Good answer with some examples and clear communication
      - 70-79: Average answer that addresses the question but lacks depth
      - 60-69: Below average answer with minimal examples or unclear communication
      - Below 60: Poor answer that doesn't adequately address the question

      Consider the job role (${jobRole}) and difficulty level (${difficulty}) in your evaluation.`,
      prompt: `Analyze this interview response:

      Question: "${question}"
      Answer: "${answer}"
      Job Role: ${jobRole}
      Difficulty: ${difficulty}

      Provide a comprehensive analysis with score, strengths, areas for improvement, detailed feedback, and a suggested better answer.`,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error analyzing answer:", error)
    // Fallback analysis
    return {
      score: 75,
      strengths: ["Attempted to answer the question"],
      improvements: ["Add more specific examples", "Provide more detail"],
      feedback: "Your answer addresses the question but could benefit from more specific examples and details.",
      suggestedAnswer:
        "Consider using the STAR method (Situation, Task, Action, Result) to structure your response with specific examples.",
    }
  }
}

export async function generateFollowUpQuestion(
  originalQuestion: string,
  answer: string,
  jobRole: string,
): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an experienced interviewer. Based on the candidate's answer, generate a natural follow-up question that would be asked in a real interview. The follow-up should dig deeper into their response or explore related aspects.`,
      prompt: `Original question: "${originalQuestion}"
      Candidate's answer: "${answer}"
      Job role: ${jobRole}

      Generate a natural follow-up question that an interviewer would ask to get more details or explore the topic further.`,
    })

    return text.trim()
  } catch (error) {
    console.error("Error generating follow-up:", error)
    return "Can you provide a specific example to illustrate your point?"
  }
}

export async function generateInterviewerResponse(
  question: string,
  answer: string,
  analysis: InterviewAnalysis,
): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a professional interviewer providing real-time feedback during an interview. Be encouraging but honest. Keep responses concise (2-3 sentences max) and professional.`,
      prompt: `The candidate just answered: "${question}"
      Their response: "${answer}"
      Analysis score: ${analysis.score}

      Provide a brief, encouraging interviewer response that acknowledges their answer and transitions naturally. Don't give away the full analysis yet.`,
    })

    return text.trim()
  } catch (error) {
    console.error("Error generating interviewer response:", error)
    return "Thank you for that response. Let's move on to the next question."
  }
}
