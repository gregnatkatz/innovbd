import { TrendingUp, Clock, CheckCircle2, DollarSign, ThumbsUp, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Idea, Persona } from '../types'
import { getInitials, getAvatarUrl } from '../utils/helpers'

interface DashboardViewProps {
  ideas: Idea[]
  persona: Persona
  onIdeaClick: (idea: Idea) => void
}

export function DashboardView({ ideas, persona, onIdeaClick }: DashboardViewProps) {
  const topIdeas = persona === 'executive'
    ? [...ideas].sort((a, b) => 
        (b.aiAnalysis.executiveAnalysis?.netValue3Year || 0) - 
        (a.aiAnalysis.executiveAnalysis?.netValue3Year || 0)
      ).slice(0, 5)
    : [...ideas].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5)

  return (
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
            {topIdeas.map((idea, index) => (
              <div
                key={idea.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors"
                onClick={() => onIdeaClick(idea)}
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
  )
}
