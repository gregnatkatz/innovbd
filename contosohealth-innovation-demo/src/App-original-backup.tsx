import { useState, useMemo, useEffect } from 'react'
import './App.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Send,
  Plus,
  Search,
  Filter,
  Target,
  Trophy,
  Gift,
  CheckCircle2,
  Clock,
  DollarSign,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Home,
  Star,
  User,
  Brain,
  Eye,
  Trash2,
  Video
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

type Persona = 'staff' | 'executive'

interface Idea {
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
      timelineTotalMonths: number
      resourcesBudgetLow: number
      resourcesBudgetHigh: number
      systemsInvolved?: string[]
    }
  }
}

const successStories = [
  {
    id: 'story-1',
    originalIdeaId: 'idea-003',
    title: 'Real-Time Medication Tracking System',
    submitter: 'Sarah Chen, RN',
    submittedDate: '2024-03-15',
    implementedDate: '2025-09-01',
    image: '💊',
    journey: {
      submission: 'Sarah Chen, a Medical/Surgical nurse, submitted a simple idea: "Help me not miss giving patients their meds on time." She described how getting pulled away for emergencies caused medication delays, affecting patient safety.',
      growth: 'The idea gained 47 upvotes and sparked 12 comments from nurses across 5 units. Dr. Emily Foster from Pharmacy suggested integrating with Epic MAR. Michael Chen from IT confirmed existing infrastructure could support it. The community refined it into a comprehensive solution.',
      action: 'ContosoHealth launched "Project MedSync" in January 2025. A cross-functional team piloted the system on 3 units, integrating Pyxis dispensing data with Epic Rover mobile carts. Real-time alerts notified charge nurses when medications weren\'t administered within 30 minutes.',
      timeline: '6 months from submission to pilot launch, 3 months pilot, full rollout in September 2025'
    },
    staffImpact: {
      quality: 'Nurses no longer worry about missing medication times. Patients receive medications on schedule, improving safety and outcomes. Documentation is automatic, saving 5 minutes per medication pass.',
      endUserBenefit: 'Patients get their pain medications and antibiotics on time, leading to better pain control and faster recovery. Families notice improved care quality.',
      satisfaction: 'Nurse satisfaction scores increased 23 points. Patients report feeling more confident in their care.'
    },
    executiveImpact: {
      costSavings: '$450K annually from reduced medication errors and adverse events',
      revenueImpact: 'Improved patient satisfaction scores increased Medicare reimbursement by $180K',
      efficiency: 'Reduced nurse documentation time by 2,400 hours annually across pilot units',
      roi: '340% ROI over 3 years, 8-month payback period',
      strategicValue: 'Supports Vision 2030 goals for patient connectivity and staff retention. Reduced medication error rate from 3.2% to 0.4%.',
      implementation: 'Initial investment: $125K. Scaling to all 55 hospitals projected to save $8.5M annually.'
    }
  },
  {
    id: 'story-2',
    originalIdeaId: 'idea-008',
    title: 'Smart Wheelchair Tracking System',
    submitter: 'Mike Johnson, Transport Services',
    submittedDate: '2024-06-20',
    implementedDate: '2025-08-15',
    image: '♿',
    journey: {
      submission: 'Mike Johnson submitted a spark idea: "Faster way to find wheelchairs - we waste so much time looking for them. Can we put trackers on them?" Just two sentences, but it captured a real pain point.',
      growth: 'The idea received 23 upvotes and 8 comments. Transport staff from other hospitals chimed in with similar frustrations. Amanda Foster from Pediatrics noted they also lose IV poles and patient lifts. The scope expanded to track all mobile equipment.',
      action: 'ContosoHealth partnered with a medical equipment vendor to pilot Bluetooth tracking tags on 200 wheelchairs at Orlando campus. A mobile app shows real-time locations. After 2-month pilot showed 70% time savings, the program expanded hospital-wide.',
      timeline: '4 months from submission to pilot, 2 months pilot, full rollout in August 2025'
    },
    staffImpact: {
      quality: 'Transport staff find wheelchairs in seconds instead of searching for 10-15 minutes. Less frustration and more time helping patients. Reduced physical strain from walking miles searching.',
      endUserBenefit: 'Patients wait less time for transport to procedures and discharge. Families appreciate faster service.',
      satisfaction: 'Transport staff satisfaction improved 31 points. Patient discharge delays reduced by 45 minutes on average.'
    },
    executiveImpact: {
      costSavings: '$280K annually from improved transport efficiency and reduced equipment loss',
      revenueImpact: 'Faster patient throughput increased bed availability, generating $420K additional revenue',
      efficiency: 'Reduced average equipment search time from 12 minutes to 90 seconds. Eliminated need to purchase 40 replacement wheelchairs annually.',
      roi: '580% ROI over 3 years, 5-month payback period',
      strategicValue: 'Improved patient flow supports ambulatory care expansion goals. Reduced equipment capital expenses by $85K annually.',
      implementation: 'Initial investment: $45K for tags and software. Scaling to all hospitals projected to save $4.2M annually.'
    }
  },
  {
    id: 'story-3',
    originalIdeaId: 'idea-020',
    title: 'Automated Discharge Prescription System',
    submitter: 'Dr. Christopher Lee, Hospital Medicine',
    submittedDate: '2024-05-10',
    implementedDate: '2025-07-01',
    image: '💊',
    journey: {
      submission: 'Dr. Lee submitted: "Discharge prescriptions get lost - we send them to pharmacy but patients say they never got them. Communication breakdown." He described how 30% of prescriptions had issues, leading to readmissions.',
      growth: 'The idea gained 39 upvotes and 15 comments. Pharmacists, case managers, and nurses all contributed. Dr. Susan Miller suggested checking insurance formulary before prescribing. Jennifer Adams from IT proposed text notifications. The community built a comprehensive solution.',
      action: 'ContosoHealth IT developed an integrated system checking insurance coverage, showing out-of-pocket costs, and sending text alerts when prescriptions are ready. Pharmacists review high-risk medications before discharge. Pilot launched on 4 medical units in March 2025.',
      timeline: '8 months from submission to pilot, 4 months pilot, full rollout in July 2025'
    },
    staffImpact: {
      quality: 'Physicians know prescriptions reach patients. Pharmacists catch insurance issues before discharge. Nurses spend less time fielding calls about missing prescriptions. Patients leave hospital with medications in hand.',
      endUserBenefit: 'Patients get their medications without hassle. No surprise costs at pharmacy. Text alerts provide peace of mind. Fewer return trips to hospital.',
      satisfaction: 'Physician satisfaction with discharge process increased 28 points. Patient complaints about prescriptions dropped 85%.'
    },
    executiveImpact: {
      costSavings: '$1.2M annually from reduced readmissions due to medication non-adherence',
      revenueImpact: 'Avoided $380K in CMS readmission penalties. Improved patient satisfaction scores increased reimbursement.',
      efficiency: 'Reduced pharmacy calls by 60%. Decreased ED visits for medication issues by 40%.',
      roi: '420% ROI over 3 years, 6-month payback period',
      strategicValue: 'Directly supports Vision 2030 patient connectivity goals. Improved 30-day readmission rate from 18% to 14.2% for medication-related causes.',
      implementation: 'Initial investment: $95K for system integration. Scaling to all hospitals projected to save $18M annually in readmission costs.'
    }
  }
]

const pointsRubric = {
  winningIdea: {
    points: 100,
    label: 'Winning Idea (Fully Implemented)',
    description: 'Your idea was selected and fully implemented as a solution',
    icon: '🏆',
    color: 'text-yellow-500'
  },
  partialCredit: {
    points: 50,
    label: 'Partial Credit (Contributed to Solution)',
    description: 'Your idea contributed key elements to a winning solution',
    icon: '⭐',
    color: 'text-blue-500'
  },
  ideaSubmission: {
    points: 10,
    label: 'Idea Submission',
    description: 'Submit a new innovation idea',
    icon: '💡',
    color: 'text-slate-400'
  },
  collaboration: {
    points: 5,
    label: 'Collaboration',
    description: 'Add meaningful feedback or join an existing idea',
    icon: '🤝',
    color: 'text-green-500'
  },
  vote: {
    points: 1,
    label: 'Engagement',
    description: 'Vote on ideas to help prioritize',
    icon: '👍',
    color: 'text-slate-400'
  }
}

const leaderboard = [
  { rank: 1, name: 'Dr. Robert Kim', points: 450, badge: '🏆', ideas: 8, collaborations: 12, winningIdeas: 2, partialCredit: 3 },
  { rank: 2, name: 'Sarah Johnson', points: 380, badge: '🥈', ideas: 6, collaborations: 15, winningIdeas: 1, partialCredit: 4 },
  { rank: 3, name: 'Dr. Lisa Rodriguez', points: 350, badge: '🥉', ideas: 5, collaborations: 10, winningIdeas: 1, partialCredit: 2 },
  { rank: 4, name: 'Michael Chen', points: 320, badge: '⭐', ideas: 7, collaborations: 8, winningIdeas: 0, partialCredit: 5 },
  { rank: 5, name: 'Amanda Foster', points: 290, badge: '⭐', ideas: 4, collaborations: 14, winningIdeas: 0, partialCredit: 3 }
]

interface Comment {
  id: string
  author: string
  department: string
  createdAt: string
  content: string
  replies: Comment[]
}

const sampleComments: Record<string, Comment[]> = {
  'idea-001': [
    {
      id: 'c1',
      author: 'Dr. Sarah Mitchell',
      department: 'Emergency Medicine',
      createdAt: '2025-11-01T14:30:00Z',
      content: 'This is exactly what we need! Our ED has been struggling with bed placement delays. Have you considered integrating with our current Epic system?',
      replies: [
        {
          id: 'c1-r1',
          author: 'Dr. Robert Kim',
          department: 'Emergency Department',
          createdAt: '2025-11-01T15:45:00Z',
          content: 'Great question! Yes, the AI system would integrate directly with Epic through their APIs. We\'ve seen similar implementations at other health systems with excellent results.',
          replies: []
        }
      ]
    },
    {
      id: 'c2',
      author: 'Jennifer Walsh',
      department: 'Nursing Administration',
      createdAt: '2025-11-02T09:15:00Z',
      content: 'I love this idea! We waste so much time calling around for beds. Would this also help with predicting discharge times?',
      replies: []
    },
    {
      id: 'c3',
      author: 'Michael Chen',
      department: 'IT',
      createdAt: '2025-11-02T16:20:00Z',
      content: 'From a technical perspective, this is very feasible. We already have the infrastructure for real-time data processing. I\'d be happy to collaborate on the implementation.',
      replies: [
        {
          id: 'c3-r1',
          author: 'Dr. Robert Kim',
          department: 'Emergency Department',
          createdAt: '2025-11-02T17:00:00Z',
          content: 'That would be fantastic! Let\'s set up a meeting to discuss the technical requirements.',
          replies: []
        }
      ]
    }
  ],
  'idea-003': [
    {
      id: 'c4',
      author: 'Amanda Foster',
      department: 'Pain Management',
      createdAt: '2025-10-28T11:00:00Z',
      content: 'We piloted VR for pain management in our unit and saw amazing results! Patients loved it and we reduced opioid use significantly. Happy to share our experience.',
      replies: []
    },
    {
      id: 'c5',
      author: 'Dr. Patricia Anderson',
      department: 'Pharmacy',
      createdAt: '2025-10-29T13:30:00Z',
      content: 'This aligns perfectly with our opioid reduction initiative. What age groups responded best to VR therapy?',
      replies: [
        {
          id: 'c5-r1',
          author: 'Dr. Lisa Rodriguez',
          department: 'Pain Management',
          createdAt: '2025-10-29T14:15:00Z',
          content: 'We found it works well across all age groups, but particularly effective for patients 25-65. Older patients sometimes need more guidance with the technology.',
          replies: []
        }
      ]
    }
  ]
}

function App() {
  const [persona, setPersona] = useState<Persona>('staff')
  const [currentView, setCurrentView] = useState<'dashboard' | 'browse' | 'submit' | 'stories' | 'leaderboard'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [copilotMessages, setCopilotMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: 'Hello! I\'m your Innovation Copilot. I can help you explore ideas, find similar submissions, and answer questions about the innovation platform. How can I assist you today?' }
  ])
  const [copilotInput, setCopilotInput] = useState('')
  const [comments, setComments] = useState<Record<string, Comment[]>>(sampleComments)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [showAIReview, setShowAIReview] = useState(false)
  
  const [agentStatus, setAgentStatus] = useState<Record<string, 'idle' | 'analyzing' | 'complete' | 'error'>>({
    agent1: 'idle',
    agent2: 'idle',
    agent3: 'idle',
    agent4: 'idle',
    sora: 'idle'
  })
  const [agentResults, setAgentResults] = useState<any>({})

  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    problemStatement: '',
    proposedSolution: '',
    expectedBenefit: ''
  })

  const fetchIdeas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ideas`)
      const data = await response.json()
      setIdeas(data.ideas || [])
    } catch (error) {
      console.error('Error fetching ideas:', error)
    }
  }

  useEffect(() => {
    fetchIdeas()
  }, [])

  useEffect(() => {
    const fetchComments = async () => {
      if (selectedIdea) {
        try {
          const response = await fetch(`${API_URL}/api/ideas/${selectedIdea.id}/comments`)
          const data = await response.json()
          setComments(prev => ({
            ...prev,
            [selectedIdea.id]: data.comments || []
          }))
        } catch (error) {
          console.error('Error fetching comments:', error)
        }
      }
    }
    fetchComments()
  }, [selectedIdea])

  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => {
      const matchesSearch = searchQuery === '' || 
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'all' || idea.categoryType === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [ideas, searchQuery, filterCategory])

  const categories = Array.from(new Set(ideas.map(i => i.categoryType)))

  const handleCopilotSend = () => {
    if (!copilotInput.trim()) return
    
    const userMessage = copilotInput
    setCopilotMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setCopilotInput('')

    setTimeout(() => {
      let response = ''
      if (userMessage.toLowerCase().includes('similar') || userMessage.toLowerCase().includes('like')) {
        response = 'I found 3 similar ideas in our database: "AI-Powered Bed Management System", "Automated Patient Discharge Planning", and "Patient Flow Visualization Dashboard". Would you like to see details or collaborate on any of these?'
      } else if (userMessage.toLowerCase().includes('roi') || userMessage.toLowerCase().includes('cost')) {
        response = 'Based on our portfolio analysis, the average ROI for implemented ideas is 340% over 3 years. The highest ROI category is "Cost Reduction/Revenue Optimization" with an average payback period of 4 months.'
      } else if (userMessage.toLowerCase().includes('submit') || userMessage.toLowerCase().includes('how')) {
        response = 'To submit an idea, click "Submit Idea" in the sidebar. Fill out the form with your problem statement and proposed solution. Our AI will analyze it and suggest similar ideas for potential collaboration. The process takes less than 5 minutes!'
      } else {
        response = 'I can help you with: finding similar ideas, understanding ROI metrics, submitting new ideas, or exploring our innovation portfolio. What would you like to know more about?'
      }
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: response }])
    }, 1000)
  }

  const handleSubmitIdea = async () => {
    try {
      setAgentStatus({
        agent1: 'idle',
        agent2: 'idle',
        agent3: 'idle',
        agent4: 'idle',
        sora: 'idle'
      })
      setAgentResults({})
      
      const response = await fetch(`${API_URL}/api/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newIdea,
          targetUsers: '',
          successMetrics: '',
          submitterName: 'Demo User',
          submitterDepartment: 'Innovation Team',
          submitterHospital: 'ContosoHealth Orlando',
          submitterContact: 'demo@contosohealth.com'
        })
      })
      
      if (response.ok) {
        const createdIdea = await response.json()
        
        const submittedIdeaData = {
          title: newIdea.title,
          description: newIdea.description,
          problemStatement: newIdea.problemStatement,
          proposedSolution: newIdea.proposedSolution,
          expectedBenefit: newIdea.expectedBenefit
        }
        
        // setSelectedIdea(createdIdea)
        
        const ideaPayload = {
          idea: {
            id: createdIdea.id,
            title: submittedIdeaData.title,
            description: submittedIdeaData.description,
            problemStatement: submittedIdeaData.problemStatement,
            proposedSolution: submittedIdeaData.proposedSolution,
            expectedBenefit: submittedIdeaData.expectedBenefit
          }
        }
        
        setAgentStatus(prev => ({ ...prev, agent1: 'analyzing' }))
        fetch(`${API_URL}/api/agents/system-context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ideaPayload)
        })
          .then(res => res.json())
          .then(data => {
            setAgentResults((prev: any) => ({ ...prev, agent1: data }))
            setAgentStatus(prev => ({ ...prev, agent1: 'complete' }))
          })
          .catch(err => {
            console.error('Agent 1 error:', err)
            setAgentStatus(prev => ({ ...prev, agent1: 'error' }))
          })
        
        setAgentStatus(prev => ({ ...prev, agent2: 'analyzing' }))
        fetch(`${API_URL}/api/agents/architecture-generator`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ideaPayload)
        })
          .then(res => res.json())
          .then(data => {
            setAgentResults((prev: any) => ({ ...prev, agent2: data }))
            setAgentStatus(prev => ({ ...prev, agent2: 'complete' }))
          })
          .catch(err => {
            console.error('Agent 2 error:', err)
            setAgentStatus(prev => ({ ...prev, agent2: 'error' }))
          })
        
        setAgentStatus(prev => ({ ...prev, agent3: 'analyzing' }))
        fetch(`${API_URL}/api/agents/feasibility-scorer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ideaPayload)
        })
          .then(res => res.json())
          .then(data => {
            setAgentResults((prev: any) => ({ ...prev, agent3: data }))
            setAgentStatus(prev => ({ ...prev, agent3: 'complete' }))
          })
          .catch(err => {
            console.error('Agent 3 error:', err)
            setAgentStatus(prev => ({ ...prev, agent3: 'error' }))
          })
        
        setAgentStatus(prev => ({ ...prev, agent4: 'analyzing' }))
        fetch(`${API_URL}/api/agents/solution-discovery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ideaPayload)
        })
          .then(res => res.json())
          .then(data => {
            setAgentResults((prev: any) => ({ ...prev, agent4: data }))
            setAgentStatus(prev => ({ ...prev, agent4: 'complete' }))
          })
          .catch(err => {
            console.error('Agent 4 error:', err)
            setAgentStatus(prev => ({ ...prev, agent4: 'error' }))
          })
        
        setAgentStatus(prev => ({ ...prev, sora: 'analyzing' }))
        fetch(`${API_URL}/api/agents/sora-video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ideaPayload)
        })
          .then(res => res.json())
          .then(data => {
            setAgentResults((prev: any) => ({ ...prev, sora: data }))
            setAgentStatus(prev => ({ ...prev, sora: 'complete' }))
          })
          .catch(err => {
            console.error('Sora error:', err)
            setAgentStatus(prev => ({ ...prev, sora: 'error' }))
          })
        
        await fetchIdeas()
      } else {
        alert('Failed to submit idea. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting idea:', error)
      alert('Error submitting idea. Please make sure the backend is running.')
    }
  }

  const handleVote = (ideaId: string, voteType: 'up' | 'down') => {
    console.log(`Voted ${voteType} on idea ${ideaId}`)
  }

  const handleAddComment = (ideaId: string) => {
    if (!newComment.trim()) return
    
    const comment: Comment = {
      id: `c${Date.now()}`,
      author: 'You',
      department: 'Your Department',
      createdAt: new Date().toISOString(),
      content: newComment,
      replies: []
    }
    
    setComments(prev => ({
      ...prev,
      [ideaId]: [...(prev[ideaId] || []), comment]
    }))
    setNewComment('')
  }

  const handleAddReply = (ideaId: string, parentCommentId: string) => {
    if (!replyContent.trim()) return
    
    const reply: Comment = {
      id: `r${Date.now()}`,
      author: 'You',
      department: 'Your Department',
      createdAt: new Date().toISOString(),
      content: replyContent,
      replies: []
    }
    
    setComments(prev => {
      const ideaComments = prev[ideaId] || []
      const updatedComments = ideaComments.map(comment => {
        if (comment.id === parentCommentId) {
          return { ...comment, replies: [...comment.replies, reply] }
        }
        return comment
      })
      return { ...prev, [ideaId]: updatedComments }
    })
    setReplyContent('')
    setReplyingTo(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getLabel = (key: string): string => {
    if (persona === 'staff') {
      const staffLabels: Record<string, string> = {
        'Strategic Alignment': 'How this supports our goals',
        'Complexity': 'How hard it is',
        'Timeline Estimate': 'About how long it takes',
        'Patient Impact': 'How this helps patients',
        'Staff Impact': 'How this helps staff',
        'AI Recommendations': 'What to consider next'
      }
      return staffLabels[key] || key
    }
    return key
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarUrl = (name: string): string => {
    const nameToPhotoMap: Record<string, number> = {
      'Sarah Chen': 1,
      'Dr. Emily Foster': 2,
      'Robert Martinez': 3,
      'Linda Thompson': 4,
      'James Wilson': 5,
      'Maria Rodriguez': 6,
      'Dr. Robert Kim': 7,
      'Sarah Johnson': 8,
      'Dr. Lisa Rodriguez': 9,
      'Michael Chen': 10,
      'Amanda Foster': 11,
      'Dr. Jennifer Walsh': 12,
      'Dr. Michelle Adams': 13
    }
    
    const photoNumber = nameToPhotoMap[name] || (Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 20) + 1
    return `/avatars/profile-${photoNumber}.png`
  }

  const getIdeaTitle = (idea: Idea): string => {
    if (persona === 'staff' && idea.staffTitle) {
      return idea.staffTitle
    }
    return idea.title
  }

  const getIdeaDescription = (idea: Idea): string => {
    if (persona === 'staff' && idea.staffDescription) {
      return idea.staffDescription
    }
    return idea.description
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-lg font-bold">Innovation Hub</h1>
              <p className="text-xs text-slate-400">ContosoHealth</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">
            <Button
              variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('dashboard')}
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={currentView === 'browse' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('browse')}
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Ideas
            </Button>
            <Button
              variant={currentView === 'submit' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('submit')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit Idea
            </Button>
            <Button
              variant={currentView === 'stories' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('stories')}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Success Stories
            </Button>
            <Button
              variant={currentView === 'leaderboard' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('leaderboard')}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
          </nav>

          <Separator className="my-4 bg-slate-800" />

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-slate-400">Your Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Points</span>
                  <span className="font-semibold text-blue-400">285</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ideas Submitted</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Collaborations</span>
                  <span className="font-semibold">7</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-slate-400">Badges Earned</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  <Star className="w-3 h-3 mr-1" />
                  Innovator
                </Badge>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  <Users className="w-3 h-3 mr-1" />
                  Collaborator
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-slate-400">Rewards Available</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Gift className="w-4 h-4 text-green-500" />
                  <span>$25 Starbucks (300 pts)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Gift className="w-4 h-4 text-orange-500" />
                  <span>$50 Amazon (500 pts)</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div>
                <h2 className="text-xl font-bold">
                  {currentView === 'dashboard' && 'Innovation Dashboard'}
                  {currentView === 'browse' && 'Browse Ideas'}
                  {currentView === 'submit' && 'Submit New Idea'}
                  {currentView === 'stories' && 'Success Stories'}
                  {currentView === 'leaderboard' && 'Leaderboard'}
                </h2>
                <p className="text-sm text-slate-400">
                  {ideas.length} ideas submitted • {successStories.length} implemented
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Select value={persona} onValueChange={(v) => setPersona(v as Persona)}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Staff View
                    </div>
                  </SelectItem>
                  <SelectItem value="executive">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Executive View
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCopilotOpen(!copilotOpen)}
                className="relative"
              >
                <Sparkles className="w-5 h-5" />
                {copilotOpen && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          <ScrollArea className="flex-1 p-6">
            {currentView === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">Total Ideas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{ideas.length}</div>
                      <p className="text-xs text-slate-400 mt-1">
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        +12% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">In Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {ideas.filter(i => i.status === 'In Review').length}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Avg 5 days review time
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-500">
                        {ideas.filter(i => i.status === 'Approved').length}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                        Ready for implementation
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">
                        {persona === 'executive' ? 'Total Value' : 'Engagement'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {persona === 'executive' ? (
                        <>
                          <div className="text-3xl font-bold text-blue-500">$45.2M</div>
                          <p className="text-xs text-slate-400 mt-1">
                            <DollarSign className="w-3 h-3 inline mr-1" />
                            3-year projected value
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-3xl font-bold">
                            {ideas.reduce((sum, i) => sum + i.upvotes, 0)}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            <ThumbsUp className="w-3 h-3 inline mr-1" />
                            Total upvotes
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Top Ideas */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle>Top Ideas by {persona === 'executive' ? 'ROI' : 'Engagement'}</CardTitle>
                    <CardDescription>
                      {persona === 'executive' 
                        ? 'Highest return on investment opportunities'
                        : 'Most popular ideas from the community'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(persona === 'executive'
                        ? [...ideas].sort((a, b) => 
                            (b.aiAnalysis.executiveAnalysis?.netValue3Year || 0) - 
                            (a.aiAnalysis.executiveAnalysis?.netValue3Year || 0)
                          ).slice(0, 5)
                        : [...ideas].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5)
                      ).map((idea, index) => (
                        <div
                          key={idea.id}
                          className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors"
                          onClick={() => setSelectedIdea(idea)}
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1">{idea.title}</h4>
                            <p className="text-sm text-slate-400 line-clamp-2">{idea.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={getAvatarUrl(idea.submitterName)} alt={idea.submitterName} />
                                  <AvatarFallback className="text-xs bg-blue-500/10 text-blue-500">
                                    {getInitials(idea.submitterName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-slate-400">{idea.submitterName}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {idea.categoryType}
                              </Badge>
                              {persona === 'executive' && idea.aiAnalysis.executiveAnalysis && (
                                <span className="text-sm text-green-500 font-semibold">
                                  ${(idea.aiAnalysis.executiveAnalysis.netValue3Year / 1000000).toFixed(1)}M ROI
                                </span>
                              )}
                              {persona === 'staff' && (
                                <span className="text-sm text-slate-400">
                                  <ThumbsUp className="w-3 h-3 inline mr-1" />
                                  {idea.upvotes} upvotes
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentView === 'browse' && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search ideas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-900 border-slate-800"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-64 bg-slate-900 border-slate-800">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ideas Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredIdeas.map(idea => (
                    <Card
                      key={idea.id}
                      className="bg-slate-900 border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                      onClick={() => setSelectedIdea(idea)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{getIdeaTitle(idea)}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {getIdeaDescription(idea)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                idea.status === 'Approved' ? 'default' :
                                idea.status === 'In Review' ? 'secondary' :
                                'outline'
                              }
                              className="flex-shrink-0"
                            >
                              {idea.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Delete this idea? This cannot be undone.')) {
                                  fetch(`${API_URL}/api/ideas/${idea.id}`, {
                                    method: 'DELETE'
                                  })
                                    .then(() => {
                                      fetchIdeas()
                                      if (selectedIdea?.id === idea.id) {
                                        setSelectedIdea(null)
                                      }
                                    })
                                    .catch(err => {
                                      console.error('Delete error:', err)
                                      alert('Failed to delete idea. Please try again.')
                                    })
                                }
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="text-xs">
                              {idea.categoryType}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {idea.functionalArea}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={getAvatarUrl(idea.submitterName)} alt={idea.submitterName} />
                                <AvatarFallback className="text-xs bg-blue-500/10 text-blue-500">
                                  {getInitials(idea.submitterName)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{idea.submitterName}</span>
                            </div>
                            <span>•</span>
                            <span>{idea.submitterDepartment}</span>
                          </div>

                          <Separator className="bg-slate-800" />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleVote(idea.id, 'up')
                                }}
                              >
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                {idea.upvotes}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleVote(idea.id, 'down')
                                }}
                              >
                                <ThumbsDown className="w-4 h-4 mr-1" />
                                {idea.downvotes}
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                {idea.commentCount}
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                alert('Collaboration request sent! The submitter will be notified.')
                              }}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add to This
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentView === 'submit' && (
              <div className="max-w-3xl mx-auto">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle>Submit Your Innovation Idea</CardTitle>
                    <CardDescription>
                      Share your idea to improve patient care, operations, or staff experience. Our AI will analyze it and suggest similar ideas for collaboration.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Idea Title</label>
                      <Input
                        placeholder="Brief, descriptive title for your idea"
                        value={newIdea.title}
                        onChange={(e) => setNewIdea({...newIdea, title: e.target.value})}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        placeholder="Provide a clear overview of your idea"
                        value={newIdea.description}
                        onChange={(e) => setNewIdea({...newIdea, description: e.target.value})}
                        className="bg-slate-800 border-slate-700 min-h-24"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Problem Statement</label>
                      <Textarea
                        placeholder="What problem does this solve? Include impact and current challenges"
                        value={newIdea.problemStatement}
                        onChange={(e) => setNewIdea({...newIdea, problemStatement: e.target.value})}
                        className="bg-slate-800 border-slate-700 min-h-24"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Proposed Solution</label>
                      <Textarea
                        placeholder="How would you solve this problem? Be specific about implementation"
                        value={newIdea.proposedSolution}
                        onChange={(e) => setNewIdea({...newIdea, proposedSolution: e.target.value})}
                        className="bg-slate-800 border-slate-700 min-h-24"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Expected Benefit</label>
                      <Textarea
                        placeholder="What outcomes do you expect? Include metrics if possible"
                        value={newIdea.expectedBenefit}
                        onChange={(e) => setNewIdea({...newIdea, expectedBenefit: e.target.value})}
                        className="bg-slate-800 border-slate-700 min-h-24"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        onClick={handleSubmitIdea}
                        className="flex-1"
                        disabled={!newIdea.title || !newIdea.description}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit Idea
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setNewIdea({
                          title: '',
                          description: '',
                          problemStatement: '',
                          proposedSolution: '',
                          expectedBenefit: ''
                        })}
                      >
                        Clear Form
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Agent Analysis Status - Show after submission */}
                {(agentStatus.agent1 !== 'idle' || agentStatus.agent2 !== 'idle' || agentStatus.agent3 !== 'idle' || agentStatus.agent4 !== 'idle' || agentStatus.sora !== 'idle') && (
                  <Card className="bg-slate-900 border-slate-800 mt-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-6 h-6 text-blue-500" />
                          <div>
                            <CardTitle>AI Analysis in Progress</CardTitle>
                            <CardDescription>Our AI agents are analyzing your idea...</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-sm">
                          Agents: {[agentStatus.agent1, agentStatus.agent2, agentStatus.agent3, agentStatus.agent4, agentStatus.sora].filter(s => s === 'complete').length}/5 complete
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Agent 1: System Context Engine */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium">Agent 1: System Context Engine</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {agentStatus.agent1 === 'analyzing' && <span className="text-xs text-slate-400">Analyzing...</span>}
                          {agentStatus.agent1 === 'complete' && <span className="text-green-400">✓ Complete</span>}
                          {agentStatus.agent1 === 'error' && <span className="text-red-400">✗ Error</span>}
                        </div>
                      </div>

                      {/* Agent 2: Solution Architecture Generator */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium">Agent 2: Solution Architecture Generator</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {agentStatus.agent2 === 'analyzing' && <span className="text-xs text-slate-400">Analyzing...</span>}
                          {agentStatus.agent2 === 'complete' && <span className="text-green-400">✓ Complete</span>}
                          {agentStatus.agent2 === 'error' && <span className="text-red-400">✗ Error</span>}
                        </div>
                      </div>

                      {/* Agent 3: Feasibility Scorer */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium">Agent 3: Feasibility Scorer with Reasoning</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {agentStatus.agent3 === 'analyzing' && <span className="text-xs text-slate-400">Analyzing...</span>}
                          {agentStatus.agent3 === 'complete' && <span className="text-green-400">✓ Complete</span>}
                          {agentStatus.agent3 === 'error' && <span className="text-red-400">✗ Error</span>}
                        </div>
                      </div>

                      {/* Agent 4: Internal Solution Discovery */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium">Agent 4: Internal Solution Discovery Engine</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {agentStatus.agent4 === 'analyzing' && <span className="text-xs text-slate-400">Analyzing...</span>}
                          {agentStatus.agent4 === 'complete' && <span className="text-green-400">✓ Complete</span>}
                          {agentStatus.agent4 === 'error' && <span className="text-red-400">✗ Error</span>}
                        </div>
                      </div>

                      {/* Sora: Video Generation */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-pink-400" />
                          <span className="text-sm font-medium">Sora: Video Generation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {agentStatus.sora === 'analyzing' && <span className="text-xs text-slate-400">Generating...</span>}
                          {agentStatus.sora === 'complete' && <span className="text-green-400">✓ Complete</span>}
                          {agentStatus.sora === 'error' && <span className="text-red-400">✗ Error</span>}
                        </div>
                      </div>

                      {/* View Full Analysis Button */}
                      {[agentStatus.agent1, agentStatus.agent2, agentStatus.agent3, agentStatus.agent4, agentStatus.sora].filter(s => s === 'complete').length === 5 && (
                        <div className="pt-4">
                          <Button
                            onClick={() => setCurrentView('browse')}
                            className="w-full"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Analysis
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {currentView === 'stories' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Your Ideas Make a Difference</h2>
                  <p className="text-slate-400">
                    See how staff innovations have transformed into real projects improving patient care
                  </p>
                </div>

                <div className="space-y-8">
                  {successStories.map(story => (
                    <Card key={story.id} className="bg-slate-900 border-slate-800">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="text-6xl">{story.image}</div>
                          <div className="flex-1">
                            <CardTitle className="text-2xl mb-2">{story.title}</CardTitle>
                            <CardDescription className="text-base">
                              Submitted by {story.submitter} • {new Date(story.submittedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} → Implemented {new Date(story.implementedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Journey Timeline */}
                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <Lightbulb className="w-5 h-5 text-yellow-500" />
                              The Journey
                            </h3>
                            
                            <div className="space-y-4 pl-4 border-l-2 border-blue-500/30">
                              <div>
                                <div className="text-sm font-semibold text-blue-400 mb-1">1. How It Started</div>
                                <p className="text-slate-300 text-sm">{story.journey.submission}</p>
                              </div>
                              
                              <div>
                                <div className="text-sm font-semibold text-green-400 mb-1">2. How It Grew</div>
                                <p className="text-slate-300 text-sm">{story.journey.growth}</p>
                              </div>
                              
                              <div>
                                <div className="text-sm font-semibold text-purple-400 mb-1">3. ContosoHealth Took Action</div>
                                <p className="text-slate-300 text-sm">{story.journey.action}</p>
                              </div>
                              
                              <div>
                                <div className="text-sm font-semibold text-slate-400 mb-1">Timeline</div>
                                <p className="text-slate-400 text-sm italic">{story.journey.timeline}</p>
                              </div>
                            </div>
                          </div>

                          <Separator className="bg-slate-800" />

                          {/* Impact Section - Persona-based */}
                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-green-500" />
                              {persona === 'staff' ? 'Success Results - Quality Improvements' : 'Success Results - Business Impact'}
                            </h3>
                            
                            {persona === 'staff' ? (
                              <div className="space-y-3 bg-green-500/5 p-4 rounded-lg border border-green-500/20">
                                <div>
                                  <div className="text-sm font-semibold text-green-400 mb-1">Quality Improvements</div>
                                  <p className="text-slate-300 text-sm">{story.staffImpact.quality}</p>
                                </div>
                                
                                <div>
                                  <div className="text-sm font-semibold text-green-400 mb-1">Patient & Family Benefits</div>
                                  <p className="text-slate-300 text-sm">{story.staffImpact.endUserBenefit}</p>
                                </div>
                                
                                <div>
                                  <div className="text-sm font-semibold text-green-400 mb-1">Staff Satisfaction</div>
                                  <p className="text-slate-300 text-sm">{story.staffImpact.satisfaction}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3 bg-blue-500/5 p-4 rounded-lg border border-blue-500/20">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-sm font-semibold text-blue-400 mb-1">Cost Savings</div>
                                    <p className="text-green-500 font-semibold">{story.executiveImpact.costSavings}</p>
                                  </div>
                                  
                                  <div>
                                    <div className="text-sm font-semibold text-blue-400 mb-1">Revenue Impact</div>
                                    <p className="text-green-500 font-semibold">{story.executiveImpact.revenueImpact}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="text-sm font-semibold text-blue-400 mb-1">Efficiency Gains</div>
                                  <p className="text-slate-300 text-sm">{story.executiveImpact.efficiency}</p>
                                </div>
                                
                                <div>
                                  <div className="text-sm font-semibold text-blue-400 mb-1">ROI</div>
                                  <p className="text-green-500 font-semibold">{story.executiveImpact.roi}</p>
                                </div>
                                
                                <div>
                                  <div className="text-sm font-semibold text-blue-400 mb-1">Strategic Value</div>
                                  <p className="text-slate-300 text-sm">{story.executiveImpact.strategicValue}</p>
                                </div>
                                
                                <div>
                                  <div className="text-sm font-semibold text-blue-400 mb-1">Implementation & Scale</div>
                                  <p className="text-slate-300 text-sm">{story.executiveImpact.implementation}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              const originalIdea = ideas.find(i => i.id === story.originalIdeaId)
                              if (originalIdea) setSelectedIdea(originalIdea)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Original Idea Submission
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentView === 'leaderboard' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Innovation Champions</h2>
                  <p className="text-slate-400">
                    Top contributors making ContosoHealth better every day
                  </p>
                </div>

                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Points Rubric - How to Win
                    </CardTitle>
                    <CardDescription>
                      Earn points for your contributions. Winning ideas get the most recognition!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(pointsRubric).map(([key, rubric]) => (
                        <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50">
                          <div className="text-2xl">{rubric.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{rubric.label}</span>
                              <Badge variant="outline" className={rubric.color}>
                                {rubric.points} pts
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400">{rubric.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle>Top Contributors</CardTitle>
                    <CardDescription>
                      Earn points by submitting ideas, collaborating, and engaging with the community
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leaderboard.map(entry => (
                        <div
                          key={entry.rank}
                          className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{entry.badge}</div>
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={getAvatarUrl(entry.name)} alt={entry.name} />
                              <AvatarFallback className="bg-blue-500/10 text-blue-500">
                                {getInitials(entry.name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-lg">{entry.name}</div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>{entry.ideas} ideas</span>
                              <span>•</span>
                              <span>{entry.collaborations} collaborations</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              {entry.winningIdeas > 0 && (
                                <span className="flex items-center gap-1">
                                  <Trophy className="w-3 h-3 text-yellow-500" />
                                  {entry.winningIdeas} winning
                                </span>
                              )}
                              {entry.partialCredit > 0 && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-blue-500" />
                                  {entry.partialCredit} partial
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-500">{entry.points}</div>
                            <div className="text-xs text-slate-400">points</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle>Rewards Catalog</CardTitle>
                    <CardDescription>
                      Redeem your points for tangible rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="text-3xl mb-2">☕</div>
                        <div className="font-semibold mb-1">$10 Starbucks Gift Card</div>
                        <div className="text-sm text-slate-400 mb-3">150 points</div>
                        <Button size="sm" className="w-full">Redeem</Button>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="text-3xl mb-2">☕</div>
                        <div className="font-semibold mb-1">$25 Starbucks Gift Card</div>
                        <div className="text-sm text-slate-400 mb-3">300 points</div>
                        <Button size="sm" className="w-full">Redeem</Button>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="text-3xl mb-2">📦</div>
                        <div className="font-semibold mb-1">$25 Amazon Gift Card</div>
                        <div className="text-sm text-slate-400 mb-3">350 points</div>
                        <Button size="sm" className="w-full">Redeem</Button>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="text-3xl mb-2">📦</div>
                        <div className="font-semibold mb-1">$50 Amazon Gift Card</div>
                        <div className="text-sm text-slate-400 mb-3">500 points</div>
                        <Button size="sm" className="w-full">Redeem</Button>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="text-3xl mb-2">🎟️</div>
                        <div className="font-semibold mb-1">Movie Tickets (2)</div>
                        <div className="text-sm text-slate-400 mb-3">400 points</div>
                        <Button size="sm" className="w-full">Redeem</Button>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="text-3xl mb-2">🍽️</div>
                        <div className="font-semibold mb-1">$100 Restaurant Gift Card</div>
                        <div className="text-sm text-slate-400 mb-3">750 points</div>
                        <Button size="sm" className="w-full">Redeem</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>

          {/* Copilot Chat Sidebar */}
          {copilotOpen && (
            <div className="w-96 border-l border-slate-800 bg-slate-900 flex flex-col">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Innovation Copilot</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCopilotOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {copilotMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-blue-500" />
                        </div>
                      )}
                      <div
                        className={`rounded-lg p-3 max-w-[80%] ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-800 text-slate-100'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-slate-800">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about ideas, ROI, or how to submit..."
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCopilotSend()}
                    className="bg-slate-800 border-slate-700"
                  />
                  <Button onClick={handleCopilotSend} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Idea Detail Modal */}
      {selectedIdea && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedIdea(null)}
        >
          <Card
            className="bg-slate-900 border-slate-800 max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{getIdeaTitle(selectedIdea)}</CardTitle>
                  <CardDescription>{getIdeaDescription(selectedIdea)}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedIdea(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <ScrollArea className="max-h-[calc(90vh-200px)]">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Submitted By</div>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={getAvatarUrl(selectedIdea.submitterName)} alt={selectedIdea.submitterName} />
                        <AvatarFallback className="text-xs bg-blue-500/10 text-blue-500">
                          {getInitials(selectedIdea.submitterName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{selectedIdea.submitterName}</div>
                        <div className="text-sm text-slate-400">{selectedIdea.submitterDepartment}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Status</div>
                    <Badge variant={selectedIdea.status === 'Approved' ? 'default' : 'secondary'}>
                      {selectedIdea.status}
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                <div>
                  <h4 className="font-semibold mb-2">Problem Statement</h4>
                  <p className="text-slate-300">{selectedIdea.problemStatement}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Proposed Solution</h4>
                  <p className="text-slate-300">{selectedIdea.proposedSolution}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Expected Benefit</h4>
                  <p className="text-slate-300">{selectedIdea.expectedBenefit}</p>
                </div>

                <Separator className="bg-slate-800" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        AI Analysis
                      </h4>
                      {(agentStatus.agent1 !== 'idle' || agentStatus.agent2 !== 'idle' || agentStatus.agent3 !== 'idle' || agentStatus.agent4 !== 'idle' || agentStatus.sora !== 'idle') && (
                        <Badge variant="outline" className="text-xs">
                          Agents: {[agentStatus.agent1, agentStatus.agent2, agentStatus.agent3, agentStatus.agent4, agentStatus.sora].filter(s => s === 'complete').length}/5 complete
                        </Badge>
                      )}
                    </div>
                    {persona === 'executive' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAIReview(!showAIReview)}
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        {showAIReview ? 'Hide' : 'Show'} Detailed AI Review
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-slate-800/50">
                        <div className="text-sm text-slate-400 mb-1">{getLabel('Strategic Alignment')}</div>
                        <div className="flex items-center gap-2">
                          <Progress value={selectedIdea.aiAnalysis.strategicAlignmentScore * 20} className="flex-1" />
                          <span className="font-semibold">{selectedIdea.aiAnalysis.strategicAlignmentScore}/5</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50">
                        <div className="text-sm text-slate-400 mb-1">{getLabel('Complexity')}</div>
                        <Badge variant="outline">{selectedIdea.aiAnalysis.complexityAssessment}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-slate-800/50">
                        <div className="text-sm text-slate-400 mb-1">{getLabel('Patient Impact')}</div>
                        <Badge variant="outline">{selectedIdea.aiAnalysis.impactPatient}</Badge>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50">
                        <div className="text-sm text-slate-400 mb-1">{getLabel('Staff Impact')}</div>
                        <Badge variant="outline">{selectedIdea.aiAnalysis.impactStaff}</Badge>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-800/50">
                      <div className="text-sm text-slate-400 mb-1">{getLabel('Timeline Estimate')}</div>
                      <div className="font-semibold">{selectedIdea.aiAnalysis.timelineEstimateGeneral}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="text-sm text-blue-400 mb-2 font-semibold">{getLabel('AI Recommendations')}</div>
                      <p className="text-sm text-slate-300">{selectedIdea.aiAnalysis.aiRecommendations}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="text-sm text-purple-400 mb-2 font-semibold flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Agent 1: System Context Engine
                        {agentStatus.agent1 === 'analyzing' && <span className="text-xs text-slate-400 ml-2">Analyzing...</span>}
                        {agentStatus.agent1 === 'complete' && <span className="text-green-400 ml-2">✓</span>}
                        {agentStatus.agent1 === 'error' && <span className="text-red-400 ml-2">✗</span>}
                      </div>
                      {agentStatus.agent1 === 'analyzing' && (
                        <div className="text-sm text-slate-400">Detecting healthcare systems mentioned in your idea...</div>
                      )}
                      {agentStatus.agent1 === 'complete' && agentResults.agent1?.systems && (
                        <div className="space-y-2">
                          {agentResults.agent1.systems.map((system: any, idx: number) => (
                            <div key={idx} className="p-2 rounded bg-slate-800/50 text-sm">
                              <div className="font-semibold text-slate-200">{system.system}</div>
                              <div className="text-xs text-slate-400 mt-1">{system.category}</div>
                              {persona === 'executive' && (
                                <div className="text-xs text-slate-400 mt-1">
                                  Integration: ${(system.typical_cost / 1000).toFixed(0)}K, {system.typical_timeline_weeks} weeks • SME: {system.sme}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {agentStatus.agent1 === 'complete' && !agentResults.agent1?.systems && selectedIdea.aiAnalysis.detectedSystems && selectedIdea.aiAnalysis.detectedSystems.length > 0 && (
                        <div className="space-y-2">
                          {selectedIdea.aiAnalysis.detectedSystems.map((system, idx) => (
                            <div key={idx} className="p-2 rounded bg-slate-800/50 text-sm">
                              <div className="font-semibold text-slate-200">{system.system}</div>
                              <div className="text-xs text-slate-400 mt-1">{system.category}</div>
                              {persona === 'executive' && (
                                <div className="text-xs text-slate-400 mt-1">
                                  Integration: ${(system.typical_cost / 1000).toFixed(0)}K, {system.typical_timeline_weeks} weeks • SME: {system.sme}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {agentStatus.agent1 === 'error' && (
                        <div className="text-sm text-red-400">Failed to detect systems. Please try again.</div>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="text-sm text-blue-400 mb-2 font-semibold flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Agent 2: Solution Architecture Generator
                        {agentStatus.agent2 === 'analyzing' && <span className="text-xs text-slate-400 ml-2">Analyzing...</span>}
                        {agentStatus.agent2 === 'complete' && <span className="text-green-400 ml-2">✓</span>}
                        {agentStatus.agent2 === 'error' && <span className="text-red-400 ml-2">✗</span>}
                      </div>
                      {agentStatus.agent2 === 'analyzing' && (
                        <div className="text-sm text-slate-400">Generating implementation blueprint with phases and costs...</div>
                      )}
                      {agentStatus.agent2 === 'complete' && agentResults.agent2?.architecture && (
                        <div className="space-y-2 text-sm">
                          <div className="text-slate-300">{agentResults.agent2.architecture.summary}</div>
                          {persona === 'executive' && (
                            <>
                              <div className="text-slate-400">Total Cost: ${(agentResults.agent2.architecture.total_cost_low / 1000).toFixed(0)}K - ${(agentResults.agent2.architecture.total_cost_high / 1000).toFixed(0)}K</div>
                              <div className="text-slate-400">Timeline: {agentResults.agent2.architecture.total_timeline_weeks} weeks</div>
                            </>
                          )}
                        </div>
                      )}
                      {agentStatus.agent2 === 'error' && (
                        <div className="text-sm text-red-400">Failed to generate architecture. Please try again.</div>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="text-sm text-green-400 mb-2 font-semibold flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Agent 3: Feasibility Scorer with Reasoning
                        {agentStatus.agent3 === 'analyzing' && <span className="text-xs text-slate-400 ml-2">Analyzing...</span>}
                        {agentStatus.agent3 === 'complete' && <span className="text-green-400 ml-2">✓</span>}
                        {agentStatus.agent3 === 'error' && <span className="text-red-400 ml-2">✗</span>}
                      </div>
                      {agentStatus.agent3 === 'analyzing' && (
                        <div className="text-sm text-slate-400">Evaluating feasibility across multiple dimensions...</div>
                      )}
                      {agentStatus.agent3 === 'complete' && agentResults.agent3?.scores && (
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-slate-400">Technical: </span>
                              <span className="font-semibold">{agentResults.agent3.scores.technical}/5</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Operational: </span>
                              <span className="font-semibold">{agentResults.agent3.scores.operational}/5</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Financial: </span>
                              <span className="font-semibold">{agentResults.agent3.scores.financial}/5</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Overall: </span>
                              <span className="font-semibold">{agentResults.agent3.scores.overall}/5</span>
                            </div>
                          </div>
                          {agentResults.agent3.reasoning && (
                            <div className="text-slate-300 mt-2">{agentResults.agent3.reasoning}</div>
                          )}
                        </div>
                      )}
                      {agentStatus.agent3 === 'error' && (
                        <div className="text-sm text-red-400">Failed to score feasibility. Please try again.</div>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="text-sm text-yellow-400 mb-2 font-semibold flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Agent 4: Internal Solution Discovery Engine
                        {agentStatus.agent4 === 'analyzing' && <span className="text-xs text-slate-400 ml-2">Analyzing...</span>}
                        {agentStatus.agent4 === 'complete' && <span className="text-green-400 ml-2">✓</span>}
                        {agentStatus.agent4 === 'error' && <span className="text-red-400 ml-2">✗</span>}
                      </div>
                      {agentStatus.agent4 === 'analyzing' && (
                        <div className="text-sm text-slate-400">Finding similar solutions across hospitals and matching mentors...</div>
                      )}
                      {agentStatus.agent4 === 'complete' && agentResults.agent4?.similar_solutions && (
                        <div className="space-y-2">
                          {agentResults.agent4.similar_solutions.map((solution: any, idx: number) => (
                            <div key={idx} className="p-2 rounded bg-slate-800/50 text-sm">
                              <div className="font-semibold text-slate-200">{solution.hospital}</div>
                              <div className="text-xs text-slate-400 mt-1">{solution.description}</div>
                              <div className="text-xs text-slate-400 mt-1">Contact: {solution.contact}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {agentStatus.agent4 === 'error' && (
                        <div className="text-sm text-red-400">Failed to find similar solutions. Please try again.</div>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                      <div className="text-sm text-pink-400 mb-2 font-semibold flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Sora: Video Generation
                        {agentStatus.sora === 'analyzing' && <span className="text-xs text-slate-400 ml-2">Generating...</span>}
                        {agentStatus.sora === 'complete' && <span className="text-green-400 ml-2">✓</span>}
                        {agentStatus.sora === 'error' && <span className="text-red-400 ml-2">✗</span>}
                      </div>
                      {agentStatus.sora === 'analyzing' && (
                        <div className="text-sm text-slate-400">Creating video demonstration of your solution...</div>
                      )}
                      {agentStatus.sora === 'complete' && agentResults.sora?.job_id && (
                        <div className="space-y-2 text-sm">
                          <div className="text-slate-300">Video generation job submitted successfully!</div>
                          <div className="text-slate-400">Job ID: {agentResults.sora.job_id}</div>
                          {agentResults.sora.status && (
                            <div className="text-slate-400">Status: {agentResults.sora.status}</div>
                          )}
                        </div>
                      )}
                      {agentStatus.sora === 'error' && (
                        <div className="text-sm text-red-400">Failed to generate video. Please try again.</div>
                      )}
                    </div>

                    {persona === 'executive' && selectedIdea.aiAnalysis.executiveAnalysis && showAIReview && (
                      <>
                        <Separator className="bg-slate-800" />
                        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                          <h5 className="font-semibold mb-3 text-blue-400 flex items-center gap-2">
                            <Brain className="w-5 h-5" />
                            Executive AI Review - Detailed Analysis
                          </h5>
                          
                          <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-slate-900/50">
                              <div className="text-sm font-semibold text-green-400 mb-2">💰 Financial Impact</div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-slate-400">Implementation Cost:</span>
                                  <div className="font-semibold">${(selectedIdea.aiAnalysis.executiveAnalysis.implementationCostLow / 1000).toFixed(0)}K - ${(selectedIdea.aiAnalysis.executiveAnalysis.implementationCostHigh / 1000).toFixed(0)}K</div>
                                </div>
                                <div>
                                  <span className="text-slate-400">Annual Savings:</span>
                                  <div className="font-semibold text-green-400">${(selectedIdea.aiAnalysis.executiveAnalysis.returnCostSavingsLow / 1000).toFixed(0)}K - ${(selectedIdea.aiAnalysis.executiveAnalysis.returnCostSavingsHigh / 1000).toFixed(0)}K</div>
                                </div>
                                <div>
                                  <span className="text-slate-400">3-Year Net Value:</span>
                                  <div className="font-semibold text-green-400">${(selectedIdea.aiAnalysis.executiveAnalysis.netValue3Year / 1000000).toFixed(2)}M</div>
                                </div>
                                <div>
                                  <span className="text-slate-400">Payback Period:</span>
                                  <div className="font-semibold">{selectedIdea.aiAnalysis.executiveAnalysis.paybackPeriodMonths} months</div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-900/50">
                              <div className="text-sm font-semibold text-yellow-400 mb-2">⚠️ Risk Assessment</div>
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <div>
                                  <span className="text-slate-400">Technical Risk:</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Progress value={selectedIdea.aiAnalysis.executiveAnalysis.riskTechnical * 20} className="flex-1" />
                                    <span className="font-semibold">{selectedIdea.aiAnalysis.executiveAnalysis.riskTechnical}/5</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-slate-400">Operational Risk:</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Progress value={selectedIdea.aiAnalysis.executiveAnalysis.riskOperational * 20} className="flex-1" />
                                    <span className="font-semibold">{selectedIdea.aiAnalysis.executiveAnalysis.riskOperational}/5</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-slate-400">Financial Risk:</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Progress value={selectedIdea.aiAnalysis.executiveAnalysis.riskFinancial * 20} className="flex-1" />
                                    <span className="font-semibold">{selectedIdea.aiAnalysis.executiveAnalysis.riskFinancial}/5</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-900/50">
                              <div className="text-sm font-semibold text-purple-400 mb-2">🔗 System Correlation & Integration</div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-slate-400">Epic Integration:</span>
                                  <div className="text-slate-300 mt-1">Medication Administration Record (MAR) module - existing API available for real-time data sync</div>
                                </div>
                                <div>
                                  <span className="text-slate-400">Pyxis Integration:</span>
                                  <div className="text-slate-300 mt-1">MedStation system with HL7 interfaces already in use - barcode capability ready for integration</div>
                                </div>
                                <div>
                                  <span className="text-slate-400">Existing Infrastructure:</span>
                                  <div className="text-slate-300 mt-1">Epic Rover mobile carts deployed ($0 additional hardware), WiFi infrastructure in place</div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-900/50">
                              <div className="text-sm font-semibold text-blue-400 mb-2">⏱️ Effort Estimation</div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-slate-400">Development Effort:</span>
                                  <div className="text-slate-300 mt-1">Epic MAR customization (40 hrs), Pyxis API integration (80 hrs), Alert logic (60 hrs), Testing (40 hrs), Training (20 hrs/unit)</div>
                                </div>
                                <div>
                                  <span className="text-slate-400">Resource Requirements:</span>
                                  <div className="text-slate-300 mt-1">PM: 0.5 FTE × 9mo, Epic Analyst: 1.0 FTE × 6mo, Pyxis Specialist: 0.5 FTE × 6mo, Nurse Informaticist: 0.5 FTE × 9mo</div>
                                </div>
                                <div>
                                  <span className="text-slate-400">Timeline:</span>
                                  <div className="text-slate-300 mt-1">3-4 months for pilot unit, then 2 months per additional unit for rollout</div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                              <div className="text-sm font-semibold text-green-400 mb-2">✅ AI Recommendation</div>
                              <div className="text-sm text-slate-300">
                                <strong>FAST TRACK RECOMMENDED</strong> - High strategic alignment with patient safety goals. Leverages existing Epic Rover and Pyxis infrastructure, reducing implementation risk. Quick payback period (6 months) justifies immediate action. Recommend pilot on 3 East Medical-Surgical unit with expansion to ICU and ED based on results.
                              </div>
                            </div>

                            {selectedIdea.aiAnalysis.vision2030Alignment && (
                              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <div className="text-sm font-semibold text-purple-400 mb-3">🎯 ContosoHealth Vision 2030 Alignment</div>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-purple-300 font-medium">Patient & Consumer Connectivity:</span>
                                    <div className="text-slate-300 mt-1">{selectedIdea.aiAnalysis.vision2030Alignment.patientConsumerConnectivity}</div>
                                  </div>
                                  <div>
                                    <span className="text-purple-300 font-medium">Leadership Pipeline:</span>
                                    <div className="text-slate-300 mt-1">{selectedIdea.aiAnalysis.vision2030Alignment.leadershipPipeline}</div>
                                  </div>
                                  <div>
                                    <span className="text-purple-300 font-medium">Staff Retention Impact:</span>
                                    <div className="text-slate-300 mt-1">{selectedIdea.aiAnalysis.vision2030Alignment.staffRetention}</div>
                                  </div>
                                  <div>
                                    <span className="text-purple-300 font-medium">Digital Tools & Innovation:</span>
                                    <div className="text-slate-300 mt-1">{selectedIdea.aiAnalysis.vision2030Alignment.digitalTools}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <Separator className="bg-slate-800" />
                        <div>
                          <h5 className="font-semibold mb-3 text-green-500">Executive Financial Summary</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-slate-800/50">
                              <div className="text-sm text-slate-400 mb-1">3-Year Net Value</div>
                              <div className="text-2xl font-bold text-green-500">
                                ${(selectedIdea.aiAnalysis.executiveAnalysis.netValue3Year / 1000000).toFixed(2)}M
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-800/50">
                              <div className="text-sm text-slate-400 mb-1">Payback Period</div>
                              <div className="text-2xl font-bold">
                                {selectedIdea.aiAnalysis.executiveAnalysis.paybackPeriodMonths} months
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-800/50">
                              <div className="text-sm text-slate-400 mb-1">Implementation Cost</div>
                              <div className="font-semibold">
                                ${(selectedIdea.aiAnalysis.executiveAnalysis.implementationCostLow / 1000).toFixed(0)}K - 
                                ${(selectedIdea.aiAnalysis.executiveAnalysis.implementationCostHigh / 1000).toFixed(0)}K
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-800/50">
                              <div className="text-sm text-slate-400 mb-1">Annual Savings</div>
                              <div className="font-semibold text-green-500">
                                ${(selectedIdea.aiAnalysis.executiveAnalysis.returnCostSavingsLow / 1000).toFixed(0)}K - 
                                ${(selectedIdea.aiAnalysis.executiveAnalysis.returnCostSavingsHigh / 1000).toFixed(0)}K
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-4">
                            <div className="p-3 rounded-lg bg-slate-800/50">
                              <div className="text-sm text-slate-400 mb-1">Technical Risk</div>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={selectedIdea.aiAnalysis.executiveAnalysis.riskTechnical * 20} 
                                  className="flex-1"
                                />
                                <span className="text-sm">{selectedIdea.aiAnalysis.executiveAnalysis.riskTechnical}/5</span>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-800/50">
                              <div className="text-sm text-slate-400 mb-1">Operational Risk</div>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={selectedIdea.aiAnalysis.executiveAnalysis.riskOperational * 20} 
                                  className="flex-1"
                                />
                                <span className="text-sm">{selectedIdea.aiAnalysis.executiveAnalysis.riskOperational}/5</span>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-800/50">
                              <div className="text-sm text-slate-400 mb-1">Financial Risk</div>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={selectedIdea.aiAnalysis.executiveAnalysis.riskFinancial * 20} 
                                  className="flex-1"
                                />
                                <span className="text-sm">{selectedIdea.aiAnalysis.executiveAnalysis.riskFinancial}/5</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    Discussion ({(comments[selectedIdea.id] || []).length} comments)
                  </h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Share your thoughts, questions, or suggestions..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-slate-800 border-slate-700 min-h-20"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleAddComment(selectedIdea.id)}
                          disabled={!newComment.trim()}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Post Comment
                        </Button>
                      </div>
                    </div>

                    <Separator className="bg-slate-800" />

                    <div className="space-y-4">
                      {(comments[selectedIdea.id] || []).map(comment => (
                        <div key={comment.id} className="space-y-3">
                          <div className="flex gap-3">
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              <AvatarImage src={getAvatarUrl(comment.author)} alt={comment.author} />
                              <AvatarFallback className="bg-blue-500/10 text-blue-500">
                                {getInitials(comment.author)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{comment.author}</span>
                                <span className="text-sm text-slate-400">•</span>
                                <span className="text-sm text-slate-400">{comment.department}</span>
                                <span className="text-sm text-slate-400">•</span>
                                <span className="text-sm text-slate-400">{formatDate(comment.createdAt)}</span>
                              </div>
                              <p className="text-slate-300 mb-2">{comment.content}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Reply
                              </Button>

                              {replyingTo === comment.id && (
                                <div className="mt-3 space-y-2">
                                  <Textarea
                                    placeholder="Write your reply..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    className="bg-slate-800 border-slate-700 min-h-16"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddReply(selectedIdea.id, comment.id)}
                                      disabled={!replyContent.trim()}
                                    >
                                      Post Reply
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setReplyingTo(null)
                                        setReplyContent('')
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {comment.replies.length > 0 && (
                                <div className="mt-3 ml-6 space-y-3 border-l-2 border-slate-800 pl-4">
                                  {comment.replies.map(reply => (
                                    <div key={reply.id} className="flex gap-3">
                                      <Avatar className="w-8 h-8 flex-shrink-0">
                                        <AvatarImage src={getAvatarUrl(reply.author)} alt={reply.author} />
                                        <AvatarFallback className="bg-green-500/10 text-green-500 text-xs">
                                          {getInitials(reply.author)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-semibold text-sm">{reply.author}</span>
                                          <span className="text-xs text-slate-400">•</span>
                                          <span className="text-xs text-slate-400">{reply.department}</span>
                                          <span className="text-xs text-slate-400">•</span>
                                          <span className="text-xs text-slate-400">{formatDate(reply.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-slate-300">{reply.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {(comments[selectedIdea.id] || []).length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No comments yet. Be the first to share your thoughts!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleVote(selectedIdea.id, 'up')}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      {selectedIdea.upvotes}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleVote(selectedIdea.id, 'down')}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      {selectedIdea.downvotes}
                    </Button>
                  </div>
                  <Button onClick={() => alert('Collaboration request sent!')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add to This Idea
                  </Button>
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  )
}

export default App
