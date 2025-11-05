import { useState, useEffect } from 'react'
import './App.css'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Lightbulb, 
  Users, 
  Send,
  Plus,
  Sparkles,
  Menu,
  X,
  Home,
  Star,
  User,
  Target,
  Trophy,
  Gift
} from 'lucide-react'

import { Idea, Persona, CopilotMessage, AgentStatusState, AgentResults } from './types'
import { successStories } from './data/constants'
import { DashboardView } from './components/DashboardView'
import { BrowseIdeasView } from './components/BrowseIdeasView'
import { SubmitIdeaForm } from './components/SubmitIdeaForm'
import { SuccessStoriesView } from './components/SuccessStoriesView'
import { LeaderboardView } from './components/LeaderboardView'
import { AnalysisDialog } from './components/AnalysisDialog'
import { ExecutiveDashboard } from './components/ExecutiveDashboard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const categories = [
  'Process Improvement',
  'Technology/Digital Innovation',
  'Patient Experience',
  'Clinical Excellence',
  'Cost Reduction',
  'Workforce/Culture',
  'Facilities',
  'Regulatory/Compliance'
]

function App() {
  const [persona, setPersona] = useState<Persona>('staff')
  const [currentView, setCurrentView] = useState<'dashboard' | 'browse' | 'submit' | 'stories' | 'leaderboard'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('Nursing')
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    { role: 'assistant', content: 'Hi! I can help you find ideas, answer questions about the innovation process, or provide insights. What would you like to know?' }
  ])
  const [copilotInput, setCopilotInput] = useState('')

  const [agentStatus, setAgentStatus] = useState<AgentStatusState>({
    agent1: 'idle',
    agent2: 'idle',
    agent3: 'idle',
    agent4: 'idle',
    sora: 'idle'
  })

  const [agentResults, setAgentResults] = useState<AgentResults>({})
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
  const [submittedIdeaId, setSubmittedIdeaId] = useState<string | null>(null)

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
      setIdeas([])
    }
  }

  useEffect(() => {
    fetchIdeas()
  }, [])

  const handleCopilotSend = () => {
    if (!copilotInput.trim()) return
    
    setCopilotMessages(prev => [...prev, 
      { role: 'user', content: copilotInput },
      { role: 'assistant', content: `I understand you're asking about "${copilotInput}". Based on our innovation database, I can help you with that. Here are some relevant insights...` }
    ])
    setCopilotInput('')
  }

  const handleSubmitIdea = async () => {
    if (!newIdea.title || !newIdea.description) return

    setCurrentView('submit')

    try {
      console.log('Submitting idea to backend...')
      const response = await fetch(`${API_URL}/api/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newIdea.title,
          description: newIdea.description,
          problemStatement: newIdea.problemStatement,
          proposedSolution: newIdea.proposedSolution,
          expectedBenefit: newIdea.expectedBenefit,
          submitterName: 'Demo User',
          submitterDepartment: 'Innovation Team',
          submitterHospital: 'AdventHealth Orlando',
          submitterContact: 'demo@adventhealth.com'
        })
      })

      if (!response.ok) throw new Error('Failed to submit idea')
      
      const createdIdea = await response.json()
      console.log('Idea created:', createdIdea)

      const submittedIdeaData = {
        id: createdIdea.id,
        title: newIdea.title,
        description: newIdea.description,
        problemStatement: newIdea.problemStatement,
        proposedSolution: newIdea.proposedSolution,
        expectedBenefit: newIdea.expectedBenefit
      }

      const ideaPayload = {
        title: submittedIdeaData.title,
        description: submittedIdeaData.description,
        problem_statement: submittedIdeaData.problemStatement,
        proposed_solution: submittedIdeaData.proposedSolution,
        expected_benefit: submittedIdeaData.expectedBenefit
      }

      console.log('Starting agent analysis...')
      setSubmittedIdeaId(createdIdea.id)
      setAgentStatus({ agent1: 'analyzing', agent2: 'analyzing', agent3: 'analyzing', agent4: 'analyzing', sora: 'analyzing' })
      setAgentResults({})
      console.log('All agents set to analyzing')

      fetch(`${API_URL}/api/agents/system-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ideaPayload)
      })
        .then(res => res.json())
        .then(data => {
          console.log('Agent 1 complete:', data)
          setAgentStatus(prev => ({ ...prev, agent1: 'complete' }))
          setAgentResults(prev => ({ ...prev, agent1: data }))
        })
        .catch(err => {
          console.error('Agent 1 error:', err)
          setAgentStatus(prev => ({ ...prev, agent1: 'error' }))
        })

      fetch(`${API_URL}/api/agents/architecture-generator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ideaPayload)
      })
        .then(res => res.json())
        .then(data => {
          console.log('Agent 2 complete:', data)
          setAgentStatus(prev => ({ ...prev, agent2: 'complete' }))
          setAgentResults(prev => ({ ...prev, agent2: data }))
        })
        .catch(err => {
          console.error('Agent 2 error:', err)
          setAgentStatus(prev => ({ ...prev, agent2: 'error' }))
        })

      fetch(`${API_URL}/api/agents/feasibility-scorer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ideaPayload)
      })
        .then(res => res.json())
        .then(data => {
          console.log('Agent 3 complete:', data)
          setAgentStatus(prev => ({ ...prev, agent3: 'complete' }))
          setAgentResults(prev => ({ ...prev, agent3: data }))
        })
        .catch(err => {
          console.error('Agent 3 error:', err)
          setAgentStatus(prev => ({ ...prev, agent3: 'error' }))
        })

      fetch(`${API_URL}/api/agents/solution-discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ideaPayload)
      })
        .then(res => res.json())
        .then(data => {
          console.log('Agent 4 complete:', data)
          setAgentStatus(prev => ({ ...prev, agent4: 'complete' }))
          setAgentResults(prev => ({ ...prev, agent4: data }))
        })
        .catch(err => {
          console.error('Agent 4 error:', err)
          setAgentStatus(prev => ({ ...prev, agent4: 'error' }))
        })

      fetch(`${API_URL}/api/agents/sora-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ideaPayload)
      })
        .then(res => res.json())
        .then(data => {
          console.log('Sora complete:', data)
          setAgentStatus(prev => ({ ...prev, sora: 'complete' }))
          setAgentResults(prev => ({ ...prev, sora: data }))
        })
        .catch(err => {
          console.error('Sora error:', err)
          setAgentStatus(prev => ({ ...prev, sora: 'error' }))
        })

      setNewIdea({
        title: '',
        description: '',
        problemStatement: '',
        proposedSolution: '',
        expectedBenefit: ''
      })
    } catch (error) {
      console.error('Error submitting idea:', error)
      alert('Failed to submit idea. Please try again.')
    }
  }

  const handleVote = async (ideaId: string, voteType: 'up' | 'down') => {
    console.log(`Voting ${voteType} on idea ${ideaId}`)
  }

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      await fetch(`${API_URL}/api/ideas/${ideaId}`, {
        method: 'DELETE'
      })
      fetchIdeas()
      if (selectedIdea?.id === ideaId) {
        setSelectedIdea(null)
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete idea. Please try again.')
    }
  }

  const handleViewOriginalIdea = (ideaId: string) => {
    const originalIdea = ideas.find(i => i.id === ideaId)
    if (originalIdea) setSelectedIdea(originalIdea)
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
              <p className="text-xs text-slate-400">AdventHealth</p>
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
              <Lightbulb className="w-4 h-4 mr-2" />
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
              <Star className="w-4 h-4 mr-2" />
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
              <h3 className="text-sm font-semibold mb-2 text-slate-400">Your Progress</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Points</span>
                  <span className="font-semibold text-blue-500">125</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Ideas Submitted</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Collaborations</span>
                  <span className="font-semibold">7</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-slate-400">Badges Earned</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Innovator
                </Badge>
                <Badge variant="outline" className="text-xs">
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
              persona === 'executive' ? (
                <ExecutiveDashboard ideas={ideas} />
              ) : (
                <DashboardView 
                  ideas={ideas} 
                  persona={persona} 
                  onIdeaClick={setSelectedIdea} 
                />
              )
            )}

            {currentView === 'browse' && (
              <BrowseIdeasView
                ideas={ideas}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                filterDepartment={filterDepartment}
                setFilterDepartment={setFilterDepartment}
                categories={categories}
                onIdeaClick={setSelectedIdea}
                onVote={handleVote}
                onDelete={handleDeleteIdea}
                persona={persona}
              />
            )}

            {currentView === 'submit' && (
              <SubmitIdeaForm
                newIdea={newIdea}
                setNewIdea={setNewIdea}
                onSubmit={handleSubmitIdea}
                agentStatus={agentStatus}
                onViewFullAnalysis={() => setIsAnalysisOpen(true)}
              />
            )}

            {currentView === 'stories' && (
              <SuccessStoriesView
                persona={persona}
                onViewOriginalIdea={handleViewOriginalIdea}
              />
            )}

            {currentView === 'leaderboard' && (
              <LeaderboardView />
            )}
          </ScrollArea>

          {/* Copilot Sidebar */}
          {copilotOpen && (
            <div className="w-96 border-l border-slate-800 bg-slate-900 flex flex-col">
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">AI Copilot</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCopilotOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {copilotMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
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
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-slate-800">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything..."
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

      {/* Idea Detail Modal - Placeholder for future implementation */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-900 border-slate-800 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{selectedIdea.title}</CardTitle>
                  <CardDescription>{selectedIdea.description}</CardDescription>
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
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Problem Statement</h3>
                  <p className="text-slate-300">{selectedIdea.problemStatement}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Proposed Solution</h3>
                  <p className="text-slate-300">{selectedIdea.proposedSolution}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Expected Benefit</h3>
                  <p className="text-slate-300">{selectedIdea.expectedBenefit}</p>
                </div>
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}

      <AnalysisDialog
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        agentResults={agentResults}
        ideaId={submittedIdeaId}
        apiUrl={API_URL}
      />
    </div>
  )
}

export default App
