export type Persona = 'staff' | 'executive'

export interface Idea {
  id: string
  title: string
  description: string
  problemStatement: string
  proposedSolution: string
  expectedBenefit: string
  targetUsers: string
  successMetrics: string
  submitterName: string
  submitterDepartment: string
  submitterHospital: string
  submitterContact: string
  categoryType: string
  functionalArea: string
  status: string
  upvotes: number
  downvotes: number
  commentCount: number
  createdAt: string
  staffTitle?: string
  staffDescription?: string
  aiAnalysis: {
    strategicAlignmentScore: number
    impactPatient: string
    impactStaff: string
    impactQuality: string
    impactEfficiency: string
    complexityAssessment: string
    timelineEstimateGeneral: string
    aiRecommendations: string
    detectedSystems?: Array<{
      system: string
      category: string
      integration_level: string
      typical_cost: number
      typical_timeline_weeks: number
      sme: string
    }>
    vision2030Alignment?: {
      patientConsumerConnectivity: string
      leadershipPipeline: string
      staffRetention: string
      digitalTools: string
    }
    executiveAnalysis?: {
      returnCostSavingsLow: number
      returnCostSavingsHigh: number
      implementationCostLow: number
      implementationCostHigh: number
      netValue3Year: number
      paybackPeriodMonths: number
      confidenceLevel: string
      riskTechnical: number
      riskOperational: number
      riskFinancial: number
      resourcesBudgetLow: number
      resourcesBudgetHigh: number
      resourcesFTESummary: string
    }
  }
}

export interface Comment {
  id: string
  author: string
  department: string
  createdAt: string
  content: string
  replies: Comment[]
}

export interface SuccessStory {
  id: string
  title: string
  description: string
  submitter: string
  department: string
  implementedDate: string
  impact: string
  roi: string
  category: string
}

export interface LeaderboardEntry {
  rank: number
  name: string
  department: string
  points: number
  ideasSubmitted: number
  collaborations: number
  badges: string[]
}

export interface CopilotMessage {
  role: 'user' | 'assistant'
  content: string
}

export type AgentStatus = 'idle' | 'analyzing' | 'complete' | 'error'

export interface AgentStatusState {
  agent1: AgentStatus
  agent2: AgentStatus
  agent3: AgentStatus
  agent4: AgentStatus
  sora: AgentStatus
}

export interface Agent1Result {
  detectedSystems?: Array<{
    system: string
    category: string
    integration_level: string
    typical_cost: number
    typical_timeline_weeks: number
    sme: string
  }>
  [key: string]: any
}

export interface Agent2Result {
  architecture?: {
    components?: string[]
    integrations?: string[]
    timeline?: string
    [key: string]: any
  }
  [key: string]: any
}

export interface Agent3Result {
  scoring?: {
    feasibility_score?: number
    technical_complexity?: string
    resource_requirements?: string
    risk_assessment?: string
    [key: string]: any
  }
  [key: string]: any
}

export interface Agent4Result {
  similarSolutions?: Array<{
    title: string
    similarity_score: number
    description: string
    [key: string]: any
  }>
  [key: string]: any
}

export interface SoraResult {
  video?: {
    url?: string
    thumbnail?: string
    status?: string
    [key: string]: any
  }
  [key: string]: any
}

export interface AgentResults {
  agent1?: Agent1Result
  agent2?: Agent2Result
  agent3?: Agent3Result
  agent4?: Agent4Result
  sora?: SoraResult
}
