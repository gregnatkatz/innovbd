import { Send } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AgentAnalysisPanel } from './AgentAnalysisPanel'
import { AgentStatusState } from '../types'

interface SubmitIdeaFormProps {
  newIdea: {
    title: string
    description: string
    problemStatement: string
    proposedSolution: string
    expectedBenefit: string
  }
  setNewIdea: (idea: any) => void
  onSubmit: () => void
  agentStatus: AgentStatusState
  onViewFullAnalysis: () => void
}

export function SubmitIdeaForm({ 
  newIdea, 
  setNewIdea, 
  onSubmit, 
  agentStatus,
  onViewFullAnalysis 
}: SubmitIdeaFormProps) {
  const handleClearForm = () => {
    setNewIdea({
      title: '',
      description: '',
      problemStatement: '',
      proposedSolution: '',
      expectedBenefit: ''
    })
  }

  return (
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
              type="button"
              onClick={onSubmit}
              className="flex-1"
              disabled={!newIdea.title || !newIdea.description}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Idea
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClearForm}
            >
              Clear Form
            </Button>
          </div>
        </CardContent>
      </Card>

      <AgentAnalysisPanel 
        agentStatus={agentStatus}
        onViewFullAnalysis={onViewFullAnalysis}
      />
    </div>
  )
}
