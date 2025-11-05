import { Search, Filter, ThumbsUp, ThumbsDown, MessageSquare, Plus, Trash2, Play, TrendingUp, Clock, DollarSign, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Idea, Persona } from '../types'
import { getInitials, getAvatarUrl, getIdeaTitle, getIdeaDescription } from '../utils/helpers'
import { useState, useEffect } from 'react'

interface BrowseIdeasViewProps {
  ideas: Idea[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterCategory: string
  setFilterCategory: (category: string) => void
  filterDepartment: string
  setFilterDepartment: (department: string) => void
  categories: string[]
  onIdeaClick: (idea: Idea) => void
  onVote: (ideaId: string, voteType: 'up' | 'down') => void
  onDelete: (ideaId: string) => void
  persona: Persona
}

interface AgentAnalysis {
  agent1?: any
  agent2?: any
  agent3?: any
  agent4?: any
  sora?: any
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const departments = [
  'All Departments',
  'Nursing',
  'Emergency Department',
  'Surgery/Operating Room',
  'Pharmacy',
  'Laboratory',
  'Radiology',
  'IT/Digital',
  'Administration',
  'Patient Services',
  'Supply Chain'
]

export function BrowseIdeasView({
  ideas,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterDepartment,
  setFilterDepartment,
  categories,
  onIdeaClick,
  onVote,
  onDelete,
  persona
}: BrowseIdeasViewProps) {
  const [analysisData, setAnalysisData] = useState<Record<string, AgentAnalysis>>({})
  const [videoStatuses, setVideoStatuses] = useState<Record<string, string>>({})

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || idea.categoryType === filterCategory
    const matchesDepartment = filterDepartment === 'All Departments' || 
      idea.submitterDepartment === filterDepartment ||
      idea.functionalArea === filterDepartment
    return matchesSearch && matchesCategory && matchesDepartment
  })

  useEffect(() => {
    const fetchAnalyses = async () => {
      for (const idea of filteredIdeas) {
        if (!analysisData[idea.id]) {
          try {
            const response = await fetch(`${API_URL}/api/ideas/${idea.id}/analysis`)
            if (response.ok) {
              const data = await response.json()
              setAnalysisData(prev => ({ ...prev, [idea.id]: data }))
              
              if (data.sora?.video?.job_id) {
                checkVideoStatus(idea.id, data.sora.video.job_id)
              }
            }
          } catch (error) {
            console.error(`Error fetching analysis for idea ${idea.id}:`, error)
          }
        }
      }
    }
    
    if (filteredIdeas.length > 0) {
      fetchAnalyses()
    }
  }, [filteredIdeas.map(i => i.id).join(',')])

  const checkVideoStatus = async (ideaId: string, jobId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/agents/sora-status/${jobId}`)
      if (response.ok) {
        const data = await response.json()
        setVideoStatuses(prev => ({ ...prev, [ideaId]: data.status }))
        
        if (data.status === 'completed' && data.generations && data.generations.length > 0) {
          setAnalysisData(prev => ({
            ...prev,
            [ideaId]: {
              ...prev[ideaId],
              sora: {
                ...prev[ideaId]?.sora,
                video: {
                  ...prev[ideaId]?.sora?.video,
                  status: 'completed',
                  url: data.generations[0].url,
                  generations: data.generations
                }
              }
            }
          }))
        }
      }
    } catch (error) {
      console.error(`Error checking video status for idea ${ideaId}:`, error)
    }
  }

  const retryVideoGeneration = async (ideaId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      setVideoStatuses(prev => ({ ...prev, [ideaId]: 'retrying' }))
      
      const response = await fetch(`${API_URL}/api/agents/sora?idea_id=${ideaId}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        
        setAnalysisData(prev => ({
          ...prev,
          [ideaId]: {
            ...prev[ideaId],
            sora: {
              ...prev[ideaId]?.sora,
              video: {
                job_id: data.job_id,
                status: 'preprocessing',
                generations: []
              }
            }
          }
        }))
        
        setVideoStatuses(prev => ({ ...prev, [ideaId]: 'preprocessing' }))
        
        if (data.job_id) {
          checkVideoStatus(ideaId, data.job_id)
        }
      } else {
        console.error('Failed to retry video generation')
        setVideoStatuses(prev => ({ ...prev, [ideaId]: 'error' }))
      }
    } catch (error) {
      console.error('Error retrying video generation:', error)
      setVideoStatuses(prev => ({ ...prev, [ideaId]: 'error' }))
    }
  }

  const getAnalysisSummary = (ideaId: string) => {
    const analysis = analysisData[ideaId]
    if (!analysis) return null

    const feasibilityScore = analysis.agent3?.scoring?.overallScore
    const timeline = analysis.agent2?.architecture?.totalWeeks
    const costLow = analysis.agent2?.architecture?.totalCostLow
    const costHigh = analysis.agent2?.architecture?.totalCostHigh
    const recommendation = analysis.agent3?.scoring?.recommendation

    return { feasibilityScore, timeline, costLow, costHigh, recommendation }
  }

  const getVideoUrl = (ideaId: string) => {
    const analysis = analysisData[ideaId]
    if (!analysis?.sora?.video) return null
    
    const status = videoStatuses[ideaId] || analysis.sora.video.status
    if (status === 'completed' && analysis.sora.video.generations && analysis.sora.video.generations.length > 0) {
      return analysis.sora.video.generations[0].url
    }
    return null
  }

  return (
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
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-56 bg-slate-900 border-slate-800">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            onClick={() => onIdeaClick(idea)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{getIdeaTitle(idea, persona)}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {getIdeaDescription(idea, persona)}
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
                        onDelete(idea.id)
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

                {(() => {
                  const summary = getAnalysisSummary(idea.id)
                  if (summary && (summary.feasibilityScore || summary.timeline || (persona === 'executive' && summary.costLow))) {
                    return (
                      <>
                        <Separator className="bg-slate-800" />
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {summary.feasibilityScore && (
                            <div className="flex items-center gap-1 text-slate-300">
                              <TrendingUp className="w-3 h-3 text-green-500" />
                              <span>Score: {summary.feasibilityScore}/10</span>
                            </div>
                          )}
                          {summary.timeline && (
                            <div className="flex items-center gap-1 text-slate-300">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span>{summary.timeline} weeks</span>
                            </div>
                          )}
                          {persona === 'executive' && summary.costLow && summary.costHigh && (
                            <div className="flex items-center gap-1 text-slate-300 col-span-2">
                              <DollarSign className="w-3 h-3 text-yellow-500" />
                              <span>${(summary.costLow / 1000).toFixed(0)}K - ${(summary.costHigh / 1000).toFixed(0)}K</span>
                            </div>
                          )}
                          {summary.recommendation && (
                            <div className="flex items-center gap-1 col-span-2">
                              <CheckCircle className={`w-3 h-3 ${summary.recommendation === 'APPROVE' ? 'text-green-500' : 'text-yellow-500'}`} />
                              <span className={summary.recommendation === 'APPROVE' ? 'text-green-500' : 'text-yellow-500'}>
                                {summary.recommendation}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )
                  }
                  return <Separator className="bg-slate-800" />
                })()}

                {(() => {
                  const videoUrl = getVideoUrl(idea.id)
                  const videoStatus = videoStatuses[idea.id] || analysisData[idea.id]?.sora?.video?.status
                  
                  if (videoUrl) {
                    return (
                      <>
                        <Separator className="bg-slate-800" />
                        <div className="relative rounded-lg overflow-hidden bg-slate-950">
                          <video 
                            controls 
                            className="w-full h-48 object-cover"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <source src={videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Play className="w-3 h-3 mr-1" />
                              Video Ready
                            </Badge>
                          </div>
                        </div>
                      </>
                    )
                  } else if (videoStatus === 'error' || videoStatus === 'failed') {
                    return (
                      <>
                        <Separator className="bg-slate-800" />
                        <div className="flex items-center justify-between gap-2 text-xs p-2 bg-slate-950 rounded-lg border border-red-500/20">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-red-400" />
                            <span className="text-red-400">Video generation failed</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => retryVideoGeneration(idea.id, e)}
                            className="h-6 text-xs text-blue-400 hover:text-blue-300"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Retry
                          </Button>
                        </div>
                      </>
                    )
                  } else if (videoStatus && videoStatus !== 'idle') {
                    return (
                      <>
                        <Separator className="bg-slate-800" />
                        <div className="flex items-center gap-2 text-xs text-slate-400 p-2 bg-slate-950 rounded-lg">
                          <Play className="w-3 h-3 animate-pulse" />
                          <span>Video {videoStatus === 'retrying' ? 'retrying' : videoStatus === 'preprocessing' ? 'generating' : videoStatus}...</span>
                        </div>
                      </>
                    )
                  }
                  return null
                })()}

                <Separator className="bg-slate-800" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onVote(idea.id, 'up')
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
                        onVote(idea.id, 'down')
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
  )
}
