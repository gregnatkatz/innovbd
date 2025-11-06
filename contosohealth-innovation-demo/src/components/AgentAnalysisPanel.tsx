import { Brain, Video, Sparkles, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AgentStatusState } from '../types'

interface AgentAnalysisPanelProps {
  agentStatus: AgentStatusState
  onViewFullAnalysis: () => void
}

export function AgentAnalysisPanel({ agentStatus, onViewFullAnalysis }: AgentAnalysisPanelProps) {
  const isAnyAgentActive = agentStatus.agent1 !== 'idle' || agentStatus.agent2 !== 'idle' || 
    agentStatus.agent3 !== 'idle' || agentStatus.agent4 !== 'idle' || agentStatus.sora !== 'idle'
  
  const completedCount = [agentStatus.agent1, agentStatus.agent2, agentStatus.agent3, agentStatus.agent4, agentStatus.sora]
    .filter(s => s === 'complete').length
  
  const allComplete = completedCount === 5

  if (!isAnyAgentActive) {
    return null
  }

  return (
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
            Agents: {completedCount}/5 complete
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
        {allComplete && (
          <div className="pt-4">
            <Button
              onClick={onViewFullAnalysis}
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Full Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
