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
  sessionId: string // Track unique sessions
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
  private questionBank: { [key: string]: { [key: string]: string[][] } } = {
    "Software Engineer": {
      "Entry Level": [
        [
          "Walk me through your approach to debugging a piece of code that's not working as expected.",
          "Describe your debugging methodology when faced with a complex bug in production.",
          "How do you systematically troubleshoot code that's failing in ways you don't understand?",
          "Explain your process for identifying and fixing performance bottlenecks in code.",
          "What's your strategy when debugging code written by someone else that you've never seen before?",
        ],
        [
          "Explain the difference between synchronous and asynchronous programming with real examples.",
          "How would you handle concurrent operations in a web application?",
          "Describe a scenario where you'd choose asynchronous processing over synchronous.",
          "Explain how you'd implement a rate-limiting system for an API.",
          "How would you design a system to handle thousands of simultaneous user requests?",
        ],
        [
          "Design a simple caching system and explain your design decisions.",
          "How would you implement a basic load balancer from scratch?",
          "Describe how you'd build a real-time notification system.",
          "Design a URL shortening service like bit.ly - what are the key components?",
          "How would you architect a simple chat application to handle 1000 concurrent users?",
        ],
        [
          "Tell me about a time you had to optimize code for better performance.",
          "Describe a challenging technical problem you solved and your approach.",
          "How do you stay updated with new technologies and programming trends?",
          "Explain a situation where you had to learn a new framework quickly.",
          "Describe your experience with code reviews and how you handle feedback.",
        ],
        [
          "How would you explain APIs to a non-technical person?",
          "What's your approach to writing maintainable, clean code?",
          "How do you ensure your code is secure and follows best practices?",
          "Describe your testing strategy for a new feature.",
          "How would you handle a situation where your code caused a production outage?",
        ],
      ],
      "Mid Level": [
        [
          "Design a distributed system to handle millions of transactions per day.",
          "How would you architect a microservices system for an e-commerce platform?",
          "Explain your approach to database sharding for a social media application.",
          "Design a real-time analytics system that can process billions of events.",
          "How would you build a fault-tolerant system that can handle server failures gracefully?",
        ],
        [
          "Explain the CAP theorem and how it applies to real-world system design.",
          "How would you implement eventual consistency in a distributed database?",
          "Describe your approach to handling data consistency across multiple services.",
          "Explain how you'd design a system to handle both ACID and BASE transactions.",
          "How would you implement a distributed lock mechanism?",
        ],
        [
          "How do you approach technical debt in a large codebase?",
          "Describe your strategy for refactoring legacy systems without breaking functionality.",
          "How would you migrate a monolithic application to microservices?",
          "Explain your approach to maintaining backward compatibility during major updates.",
          "How do you balance feature development with technical improvements?",
        ],
        [
          "Tell me about a time you had to make a critical architectural decision under pressure.",
          "Describe how you've mentored junior developers and helped them grow.",
          "How do you handle disagreements with senior engineers about technical approaches?",
          "Explain a situation where you had to convince management to invest in technical improvements.",
          "Describe your experience leading a complex technical project from start to finish.",
        ],
        [
          "How do you ensure code quality across a team of 10+ developers?",
          "Describe your approach to implementing CI/CD pipelines for multiple services.",
          "How would you handle a security vulnerability discovered in production?",
          "Explain your strategy for monitoring and alerting in a distributed system.",
          "How do you approach performance testing and capacity planning?",
        ],
      ],
      "Senior Level": [
        [
          "Design the architecture for a global-scale social media platform like Twitter.",
          "How would you build a system to handle real-time financial transactions with zero downtime?",
          "Design a content delivery network that can serve content to users worldwide.",
          "Architect a machine learning platform that can train and deploy models at scale.",
          "How would you design a system like Netflix that can stream video to millions of users?",
        ],
        [
          "Explain how you'd implement a consensus algorithm in a distributed system.",
          "How would you design a time-series database optimized for IoT data?",
          "Describe your approach to implementing multi-region disaster recovery.",
          "How would you build a system that can automatically scale based on traffic patterns?",
          "Explain your strategy for implementing zero-downtime deployments across multiple data centers.",
        ],
        [
          "How do you drive technical strategy and roadmap planning for an engineering organization?",
          "Describe your approach to building and scaling engineering teams.",
          "How do you evaluate and introduce new technologies in a large organization?",
          "Explain your strategy for managing technical debt across multiple product lines.",
          "How do you ensure engineering excellence while maintaining rapid development velocity?",
        ],
        [
          "Tell me about a time you had to make a bet-the-company technical decision.",
          "Describe how you've influenced engineering culture and practices across an organization.",
          "How do you handle situations where business requirements conflict with technical best practices?",
          "Explain a time you had to rebuild a critical system while it was still serving users.",
          "Describe your experience with post-mortem processes and learning from failures.",
        ],
        [
          "How do you approach hiring and building diverse, high-performing engineering teams?",
          "Describe your strategy for knowledge sharing and documentation in large organizations.",
          "How do you balance innovation with reliability in mission-critical systems?",
          "Explain your approach to vendor evaluation and build-vs-buy decisions.",
          "How do you measure and improve engineering productivity and developer experience?",
        ],
      ],
    },
    "Product Manager": {
      "Entry Level": [
        [
          "How would you prioritize features when you have limited engineering resources?",
          "Describe your framework for deciding what to build next when everything seems important.",
          "How do you balance user requests with business objectives when making product decisions?",
          "Explain your approach to feature prioritization when stakeholders have conflicting demands.",
          "How would you decide between building new features vs. improving existing ones?",
        ],
        [
          "How would you measure the success of a new feature launch?",
          "Describe the key metrics you'd track for a mobile app's user engagement.",
          "How do you determine if a product change is actually improving user experience?",
          "Explain your approach to A/B testing and interpreting results.",
          "How would you measure product-market fit for a new product?",
        ],
        [
          "Walk me through how you'd conduct user research for a new product idea.",
          "How do you gather and validate user feedback effectively?",
          "Describe your process for understanding user pain points and needs.",
          "How would you research a market you're completely unfamiliar with?",
          "Explain your approach to competitive analysis and market positioning.",
        ],
        [
          "Tell me about a time you had to pivot a product strategy based on user feedback.",
          "Describe a situation where you had to say no to a feature request from an important customer.",
          "How do you handle disagreements between engineering and design teams?",
          "Explain a time when you had to make a product decision with incomplete information.",
          "Describe your experience working with cross-functional teams to deliver a product.",
        ],
        [
          "How do you communicate product vision and strategy to different stakeholders?",
          "Describe your approach to writing clear and actionable product requirements.",
          "How do you ensure alignment between product, engineering, and business teams?",
          "Explain your process for getting buy-in from leadership on product initiatives.",
          "How do you handle scope creep and changing requirements during development?",
        ],
      ],
      "Mid Level": [
        [
          "How would you develop a go-to-market strategy for a completely new product category?",
          "Describe your approach to entering a competitive market with an established player.",
          "How do you identify and evaluate new market opportunities for product expansion?",
          "Explain your strategy for international product expansion and localization.",
          "How would you approach launching a product in a regulated industry like healthcare or finance?",
        ],
        [
          "How do you build and manage a product roadmap for multiple stakeholder groups?",
          "Describe your approach to long-term strategic planning while maintaining flexibility.",
          "How do you balance short-term revenue goals with long-term product vision?",
          "Explain your process for making build-vs-buy-vs-partner decisions.",
          "How do you manage product portfolio decisions and resource allocation?",
        ],
        [
          "Tell me about a time you had to kill a product or feature that wasn't working.",
          "Describe how you've managed a product through a major crisis or setback.",
          "How do you handle situations where your product strategy conflicts with company strategy?",
          "Explain a time you had to convince leadership to invest in a risky product bet.",
          "Describe your experience managing products through different lifecycle stages.",
        ],
        [
          "How do you scale product management processes as a company grows?",
          "Describe your approach to building and mentoring a product management team.",
          "How do you establish product culture and best practices across an organization?",
          "Explain your strategy for cross-team collaboration in a matrix organization.",
          "How do you ensure product quality and user experience at scale?",
        ],
        [
          "How do you approach pricing strategy and monetization for digital products?",
          "Describe your experience with subscription models, freemium, or marketplace dynamics.",
          "How do you optimize conversion funnels and reduce churn?",
          "Explain your approach to customer segmentation and personalization.",
          "How do you balance user growth with revenue optimization?",
        ],
      ],
      "Senior Level": [
        [
          "How would you develop a 5-year product strategy for a company entering AI/ML?",
          "Describe your approach to building platform products that other teams can build on.",
          "How do you identify and capitalize on emerging technology trends for product innovation?",
          "Explain your strategy for product innovation while maintaining core business stability.",
          "How would you approach building an ecosystem of products and partnerships?",
        ],
        [
          "How do you influence company strategy and direction through product insights?",
          "Describe your approach to board-level communication about product performance.",
          "How do you balance stakeholder demands from customers, investors, and internal teams?",
          "Explain your strategy for managing product in a public company environment.",
          "How do you approach product decisions that could impact company valuation?",
        ],
        [
          "Tell me about a time you had to completely reimagine a product strategy.",
          "Describe how you've led product through a major company transformation or acquisition.",
          "How do you handle product decisions during economic downturns or market volatility?",
          "Explain a situation where you had to rebuild trust with customers after a product failure.",
          "Describe your experience with product strategy during rapid scaling or hypergrowth.",
        ],
        [
          "How do you build and scale product organizations across multiple business units?",
          "Describe your approach to developing product leaders and succession planning.",
          "How do you establish product excellence and innovation culture company-wide?",
          "Explain your strategy for product operations and process optimization at scale.",
          "How do you ensure product strategy alignment across global teams and markets?",
        ],
        [
          "How do you approach product strategy for emerging markets or new business models?",
          "Describe your experience with product-led growth and self-service adoption.",
          "How do you balance platform thinking with specific customer needs?",
          "Explain your approach to product strategy in highly regulated or compliance-heavy industries.",
          "How do you drive product innovation while managing technical debt and legacy systems?",
        ],
      ],
    },
    "Data Scientist": {
      "Entry Level": [
        [
          "Explain how you would approach a machine learning problem from data collection to model deployment.",
          "Walk me through your process for cleaning and preparing messy real-world data.",
          "How do you handle missing data, outliers, and data quality issues in practice?",
          "Describe your approach to feature engineering for a predictive model.",
          "How would you validate that your data is representative and unbiased?",
        ],
        [
          "How do you choose between different machine learning algorithms for a given problem?",
          "Explain the bias-variance tradeoff and how it affects model selection.",
          "How would you handle overfitting in a machine learning model?",
          "Describe your approach to hyperparameter tuning and model optimization.",
          "How do you evaluate model performance beyond just accuracy metrics?",
        ],
        [
          "How would you explain a complex statistical finding to a non-technical business stakeholder?",
          "Describe your approach to creating actionable insights from data analysis.",
          "How do you ensure your analysis actually drives business decisions?",
          "Explain how you would present uncertainty and confidence intervals to executives.",
          "How do you handle situations where data contradicts business intuition?",
        ],
        [
          "Tell me about a time your analysis led to a significant business decision or change.",
          "Describe a challenging data problem you solved and your methodology.",
          "How do you handle situations where you don't have enough data to answer a question?",
          "Explain a time when you had to quickly learn a new statistical method or tool.",
          "Describe your experience with A/B testing and experimental design.",
        ],
        [
          "How do you ensure reproducibility and version control in your data science work?",
          "Describe your approach to documenting and sharing your analysis methodology.",
          "How do you collaborate with engineers to deploy models into production?",
          "Explain your process for monitoring model performance over time.",
          "How do you handle ethical considerations in data science and machine learning?",
        ],
      ],
      "Mid Level": [
        [
          "How would you design an end-to-end machine learning pipeline for a real-time recommendation system?",
          "Describe your approach to building scalable data processing systems for big data.",
          "How do you handle concept drift and model degradation in production systems?",
          "Explain your strategy for feature stores and data versioning in ML systems.",
          "How would you implement automated model retraining and deployment?",
        ],
        [
          "How do you approach causal inference and establishing causality from observational data?",
          "Describe your experience with advanced statistical methods like Bayesian analysis.",
          "How would you design and analyze a complex multi-armed bandit experiment?",
          "Explain your approach to time series forecasting for business planning.",
          "How do you handle high-dimensional data and curse of dimensionality?",
        ],
        [
          "Tell me about a time you had to challenge business assumptions using data.",
          "Describe how you've influenced product strategy through data-driven insights.",
          "How do you handle situations where stakeholders want to ignore unfavorable data?",
          "Explain a time you had to make recommendations with incomplete or uncertain data.",
          "Describe your experience building data science capabilities within an organization.",
        ],
        [
          "How do you approach building and mentoring a team of data scientists?",
          "Describe your strategy for establishing data science best practices and standards.",
          "How do you balance research and exploration with delivering business value?",
          "Explain your approach to cross-functional collaboration with product and engineering.",
          "How do you prioritize data science projects and allocate team resources?",
        ],
        [
          "How do you approach model interpretability and explainable AI for business stakeholders?",
          "Describe your experience with MLOps and production machine learning systems.",
          "How do you handle bias, fairness, and ethical considerations in ML models?",
          "Explain your approach to data governance and privacy in analytics.",
          "How do you measure and improve the business impact of data science initiatives?",
        ],
      ],
      "Senior Level": [
        [
          "How would you build a company-wide data strategy and analytics platform?",
          "Describe your approach to establishing data science as a competitive advantage.",
          "How do you evaluate and implement emerging AI/ML technologies at scale?",
          "Explain your strategy for data monetization and creating data products.",
          "How would you approach building AI capabilities across multiple business units?",
        ],
        [
          "How do you influence C-level strategy through advanced analytics and modeling?",
          "Describe your approach to communicating complex AI/ML concepts to board members.",
          "How do you balance innovation in AI/ML with risk management and compliance?",
          "Explain your strategy for AI ethics and responsible machine learning at scale.",
          "How do you approach ROI measurement and business case development for AI initiatives?",
        ],
        [
          "Tell me about a time you led a transformational AI/ML initiative across an organization.",
          "Describe how you've built data science capabilities from scratch in a company.",
          "How do you handle situations where AI/ML projects fail to deliver expected value?",
          "Explain a time you had to make strategic decisions about data science technology stack.",
          "Describe your experience with AI/ML in regulated industries or high-stakes environments.",
        ],
        [
          "How do you build and scale data science organizations across global teams?",
          "Describe your approach to developing data science talent and career progression.",
          "How do you establish centers of excellence and knowledge sharing in data science?",
          "Explain your strategy for academic partnerships and research collaboration.",
          "How do you balance centralized vs. embedded data science team structures?",
        ],
        [
          "How do you approach AI strategy in the context of digital transformation?",
          "Describe your experience with AI governance, model risk management, and compliance.",
          "How do you evaluate build-vs-buy decisions for AI/ML platforms and tools?",
          "Explain your approach to data partnerships and external data acquisition.",
          "How do you drive AI adoption and change management across traditional organizations?",
        ],
      ],
    },
  }

  private usedQuestions: Set<string> = new Set()

  generateQuestion(context: InterviewContext): AIResponse {
    const roleQuestions = this.questionBank[context.jobRole] || this.questionBank["Software Engineer"]

    // Get one level higher difficulty
    const actualDifficulty = this.getHigherDifficulty(context.difficulty)
    const difficultyQuestions =
      roleQuestions[actualDifficulty] || roleQuestions[context.difficulty] || roleQuestions["Entry Level"]

    // Get session-specific used questions
    const sessionKey = `${context.sessionId}_${context.jobRole}_${actualDifficulty}`
    const sessionUsedQuestions = JSON.parse(localStorage.getItem(sessionKey) || "[]")

    // Find available question categories
    const availableCategories = difficultyQuestions.filter((category, index) => {
      return !sessionUsedQuestions.includes(index)
    })

    let selectedCategory: string[]
    let categoryIndex: number

    if (availableCategories.length > 0) {
      // Select from available categories
      categoryIndex = difficultyQuestions.findIndex((cat) => availableCategories.includes(cat))
      selectedCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)]
    } else {
      // All categories used, reset and start over
      localStorage.removeItem(sessionKey)
      categoryIndex = Math.floor(Math.random() * difficultyQuestions.length)
      selectedCategory = difficultyQuestions[categoryIndex]
    }

    // Select random question from category
    const question = selectedCategory[Math.floor(Math.random() * selectedCategory.length)]

    // Mark category as used
    sessionUsedQuestions.push(categoryIndex)
    localStorage.setItem(sessionKey, JSON.stringify(sessionUsedQuestions))

    return {
      question,
      questionType: "main",
      category: this.getCategoryForQuestion(question),
      expectedDuration: 4, // Longer for harder questions
      difficulty: context.difficulty as "Easy" | "Medium" | "Hard",
      actualDifficulty: `${actualDifficulty} (One level above ${context.difficulty})`,
      context: `Advanced ${actualDifficulty} question for ${context.jobRole} - designed to challenge beyond your selected level`,
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
    const followUps = [
      "Can you walk me through a specific example where you implemented this approach?",
      "What metrics would you use to measure success in this scenario?",
      "How would you handle this situation if you had half the resources?",
      "What would you do differently if you encountered this problem again?",
      "How would you explain this solution to a non-technical stakeholder?",
      "What are the potential risks or downsides of this approach?",
      "How does this scale when dealing with 10x the volume/complexity?",
      "What alternative approaches did you consider and why did you choose this one?",
    ]

    const followUp = followUps[Math.floor(Math.random() * followUps.length)]

    return {
      question: followUp,
      questionType: "followup",
      category: "Deep-dive",
      expectedDuration: 3,
      difficulty: this.context.difficulty as "Easy" | "Medium" | "Hard",
      actualDifficulty: "Probing for depth",
      context: "Follow-up to assess depth of understanding and real experience",
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
