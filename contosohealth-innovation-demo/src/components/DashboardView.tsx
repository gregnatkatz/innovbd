import { TrendingUp, Clock, CheckCircle2, DollarSign, ThumbsUp, ChevronRight, MessageSquare, Play, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Idea, Persona } from '../types'
import { getInitials, getAvatarUrl } from '../utils/helpers'
import { sampleComments } from '../data/constants'
import { useState, useEffect } from 'react'

interface DashboardViewProps {
  ideas: Idea[]
  persona: Persona
  onIdeaClick: (idea: Idea) => void
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function DashboardView({ ideas, persona, onIdeaClick }: DashboardViewProps) {
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null)
  const [ideaAnalyses, setIdeaAnalyses] = useState<Record<string, any>>({})
  
  const topIdeas = persona === 'executive'
    ? [...ideas].sort((a, b) => 
        (b.aiAnalysis.executiveAnalysis?.netValue3Year || 0) - 
        (a.aiAnalysis.executiveAnalysis?.netValue3Year || 0)
      ).slice(0, 5)
    : [...ideas].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5)

  useEffect(() => {
    const fetchAnalyses = async () => {
      for (const idea of topIdeas) {
        if (!ideaAnalyses[idea.id]) {
          try {
            const response = await fetch(`${API_URL}/api/ideas/${idea.id}/analysis`)
            if (response.ok) {
              const data = await response.json()
              setIdeaAnalyses(prev => ({ ...prev, [idea.id]: data }))
            }
          } catch (error) {
            console.error(`Error fetching analysis for ${idea.id}:`, error)
          }
        }
      }
    }
    if (topIdeas.length > 0) {
      fetchAnalyses()
    }
  }, [topIdeas.map(i => i.id).join(',')])

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
            {topIdeas.map((idea, index) => {
              const isExpanded = expandedIdea === idea.id
              const analysis = ideaAnalyses[idea.id]
              const comments = sampleComments[idea.id] || []
              
              return (
                <div
                  key={idea.id}
                  className="rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div
                    className="flex items-start gap-4 p-4 cursor-pointer"
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

                  <div className="px-4 pb-2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedIdea(isExpanded ? null : idea.id)
                      }}
                      className="text-xs"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {idea.commentCount} comments
                      {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                    </Button>
                    {analysis?.sora?.video?.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedIdea(isExpanded ? null : idea.id)
                        }}
                        className="text-xs text-blue-400"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Watch Demo
                      </Button>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                      <Separator className="bg-slate-700" />
                      
                      {analysis?.sora?.video?.url && (
                        <div>
                          <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Play className="w-4 h-4 text-blue-500" />
                            AI-Generated Demo Video
                          </h5>
                          <div className="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-700">
                            <video 
                              controls 
                              className="w-full h-auto"
                              poster={analysis?.sora?.video?.thumbnail}
                            >
                              <source src={analysis.sora.video.url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            This video was automatically generated by AI to visualize the proposed solution.
                          </p>
                        </div>
                      )}

                      {comments.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Discussion ({comments.length})
                          </h5>
                          <div className="space-y-3">
                            {comments.map(comment => (
                              <div key={comment.id} className="space-y-2">
                                <div className="flex gap-2">
                                  <Avatar className="w-7 h-7">
                                    <AvatarFallback className="bg-blue-500/10 text-blue-500 text-xs">
                                      {comment.author.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-xs">{comment.author}</span>
                                      <span className="text-xs text-slate-500">{comment.department}</span>
                                      <span className="text-xs text-slate-500">•</span>
                                      <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-300">{comment.content}</p>
                                    {comment.replies && comment.replies.length > 0 && (
                                      <div className="mt-2 ml-3 pl-3 border-l-2 border-slate-700 space-y-2">
                                        {comment.replies.map(reply => (
                                          <div key={reply.id} className="flex gap-2">
                                            <Avatar className="w-5 h-5">
                                              <AvatarFallback className="bg-green-500/10 text-green-500 text-xs">
                                                {reply.author.split(' ').map(n => n[0]).join('')}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-xs">{reply.author}</span>
                                                <span className="text-xs text-slate-500">{reply.department}</span>
                                              </div>
                                              <p className="text-xs text-slate-300">{reply.content}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
