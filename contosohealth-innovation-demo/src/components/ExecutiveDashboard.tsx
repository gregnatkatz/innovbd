import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, DollarSign, Users, Lightbulb, Target, Activity, CheckCircle, Clock, AlertTriangle, Brain, Heart, Briefcase, Star, Zap, Shield, ThumbsUp, GitBranch, ListChecks, Building2 } from 'lucide-react'
import { Idea } from '../types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts'
import { useEffect, useState } from 'react'

interface ExecutiveDashboardProps {
  ideas: Idea[]
}

interface RiskAssessment {
  ideas: Array<{
    id: number
    title: string
    category: string
    strategicRisk: number
    technicalRisk: number
    operationalRisk: number
    financialRisk: number
    overallRisk: number
    riskLevel: string
    mitigation: string
  }>
  summary: {
    highRisk: number
    mediumRisk: number
    lowRisk: number
    avgOverallRisk: number
  }
}

interface SentimentAnalysis {
  byDepartment: Array<{
    department: string
    ideaCount: number
    totalEngagement: number
    avgEngagement: number
    excitement: number
    sentiment: string
  }>
  byCategory: Array<{
    category: string
    ideaCount: number
    totalEngagement: number
    avgEngagement: number
    excitement: number
    sentiment: string
  }>
  overall: {
    avgExcitement: number
    topDepartment: string
    topCategory: string
  }
}

interface MaturityPipeline {
  pipeline: {
    realized: Array<any>
    piloting: Array<any>
    developing: Array<any>
    planning: Array<any>
    evaluating: Array<any>
    refining: Array<any>
  }
  summary: {
    realized: number
    piloting: number
    developing: number
    planning: number
    evaluating: number
    refining: number
    totalValue: number
  }
}

interface ActionItem {
  priority: string
  action: string
  description: string
  ideaCount: number
  estimatedValue: number
  dueDate: string
  owner: string
}

interface ActionItems {
  actionItems: ActionItem[]
  summary: {
    critical: number
    high: number
    medium: number
    totalValue: number
  }
}

export function ExecutiveDashboard({ ideas }: ExecutiveDashboardProps) {
  const [riskData, setRiskData] = useState<RiskAssessment | null>(null)
  const [sentimentData, setSentimentData] = useState<SentimentAnalysis | null>(null)
  const [maturityData, setMaturityData] = useState<MaturityPipeline | null>(null)
  const [actionItemsData, setActionItemsData] = useState<ActionItems | null>(null)
  const [solutions, setSolutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExecutiveData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        
        const [riskRes, sentimentRes, maturityRes, actionRes, solutionsRes] = await Promise.all([
          fetch(`${apiUrl}/api/executive/risk-assessment`),
          fetch(`${apiUrl}/api/executive/sentiment-analysis`),
          fetch(`${apiUrl}/api/executive/maturity-pipeline`),
          fetch(`${apiUrl}/api/executive/action-items`),
          fetch(`${apiUrl}/api/solutions`)
        ])

        const [risk, sentiment, maturity, actions, solutionsList] = await Promise.all([
          riskRes.json(),
          sentimentRes.json(),
          maturityRes.json(),
          actionRes.json(),
          solutionsRes.json()
        ])

        setRiskData(risk)
        setSentimentData(sentiment)
        setMaturityData(maturity)
        setActionItemsData(actions)
        setSolutions(solutionsList)
      } catch (error) {
        console.error('Error fetching executive data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExecutiveData()
  }, [])

  const totalIdeas = ideas.length
  const approvedIdeas = ideas.filter(i => i.status === 'Approved').length
  const inReviewIdeas = ideas.filter(i => i.status === 'In Review').length
  const submittedIdeas = ideas.filter(i => i.status === 'Submitted').length

  const totalROI = ideas.reduce((sum, idea) => {
    const roi = idea.aiAnalysis?.executiveAnalysis?.netValue3Year || 0
    return sum + roi
  }, 0)

  const totalEngagement = ideas.reduce((sum, idea) => {
    return sum + (idea.upvotes || 0) + (idea.commentCount || 0)
  }, 0)

  const avgEngagementPerIdea = totalIdeas > 0 ? (totalEngagement / totalIdeas).toFixed(1) : '0'

  const categoryDistribution = ideas.reduce((acc, idea) => {
    const cat = idea.categoryType || 'Uncategorized'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const departmentDistribution = ideas.reduce((acc, idea) => {
    const dept = idea.submitterDepartment || 'Unknown'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topDepartments = Object.entries(departmentDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const highEngagementIdeas = ideas
    .map(idea => ({
      ...idea,
      engagement: (idea.upvotes || 0) + (idea.commentCount || 0) * 2
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 5)

  const highROIIdeas = ideas
    .filter(idea => idea.aiAnalysis?.executiveAnalysis?.netValue3Year)
    .sort((a, b) => {
      const roiA = a.aiAnalysis?.executiveAnalysis?.netValue3Year || 0
      const roiB = b.aiAnalysis?.executiveAnalysis?.netValue3Year || 0
      return roiB - roiA
    })
    .slice(0, 5)

  const quickWins = ideas.filter(idea => {
    const timeline = idea.aiAnalysis?.timelineEstimateGeneral || ''
    const roi = idea.aiAnalysis?.executiveAnalysis?.netValue3Year || 0
    const isQuick = timeline.includes('3') || timeline.includes('4') || timeline.includes('6')
    return isQuick && roi > 100000
  }).slice(0, 5)

  const correlatedProjects = [
    { name: 'Epic EHR Upgrade', correlatedIdeas: ideas.filter(i => i.description.toLowerCase().includes('epic')).length },
    { name: 'Azure AI Initiative', correlatedIdeas: ideas.filter(i => i.description.toLowerCase().includes('ai') || i.description.toLowerCase().includes('azure')).length },
    { name: 'Patient Experience Program', correlatedIdeas: ideas.filter(i => i.categoryType === 'Patient Experience').length },
    { name: 'Cost Reduction Initiative', correlatedIdeas: ideas.filter(i => i.categoryType === 'Cost Reduction').length },
    { name: 'Digital Transformation', correlatedIdeas: ideas.filter(i => i.categoryType === 'Technology/Digital Innovation').length }
  ].filter(p => p.correlatedIdeas > 0)

  const platformTraction = {
    weeklySubmissions: Math.floor(totalIdeas / 4),
    activeContributors: new Set(ideas.map(i => i.submitterName)).size,
    avgTimeToReview: '3.2 days',
    implementationRate: totalIdeas > 0 ? ((approvedIdeas / totalIdeas) * 100).toFixed(1) : '0'
  }

  const aiExecutiveSummary = {
    topPriorityIdeas: ideas
      .filter(idea => {
        const roi = idea.aiAnalysis?.executiveAnalysis?.netValue3Year || 0
        const engagement = (idea.upvotes || 0) + (idea.commentCount || 0)
        const strategicAlignment = idea.aiAnalysis?.strategicAlignmentScore || 0
        return roi > 200000 && engagement > 5 && strategicAlignment >= 4
      })
      .slice(0, 3),
    
    vision2030Alignment: ideas.map(idea => {
      const title = idea.title.toLowerCase()
      const desc = idea.description.toLowerCase()
      let score = 0
      let alignedAreas: string[] = []
      
      if (title.includes('ai') || desc.includes('artificial intelligence') || desc.includes('machine learning')) {
        score += 5
        alignedAreas.push('AI/ML Innovation')
      }
      if (title.includes('patient') || desc.includes('patient experience') || desc.includes('patient satisfaction')) {
        score += 5
        alignedAreas.push('Patient Experience')
      }
      if (title.includes('cost') || desc.includes('efficiency') || desc.includes('reduce')) {
        score += 4
        alignedAreas.push('Operational Excellence')
      }
      if (title.includes('staff') || title.includes('workforce') || desc.includes('retention') || desc.includes('burnout')) {
        score += 4
        alignedAreas.push('Workforce Wellbeing')
      }
      if (title.includes('quality') || desc.includes('clinical outcomes') || desc.includes('safety')) {
        score += 5
        alignedAreas.push('Clinical Excellence')
      }
      
      return {
        ...idea,
        vision2030Score: Math.min(score, 5),
        alignedAreas
      }
    }).filter(i => i.vision2030Score >= 3).sort((a, b) => b.vision2030Score - a.vision2030Score),

    workforceImpact: ideas.filter(idea => {
      const impactStaff = idea.aiAnalysis?.impactStaff || 'Low'
      return impactStaff === 'High' || impactStaff === 'Medium'
    }).slice(0, 5),

    patientImpact: ideas.filter(idea => {
      const impactPatient = idea.aiAnalysis?.impactPatient || 'Low'
      return impactPatient === 'High'
    }).slice(0, 5)
  }

  const categoryChartData = topCategories.map(([name, value]) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    value,
    fullName: name
  }))

  const roiByCategory = Object.entries(
    ideas.reduce((acc, idea) => {
      const cat = idea.categoryType || 'Other'
      const roi = idea.aiAnalysis?.executiveAnalysis?.netValue3Year || 0
      acc[cat] = (acc[cat] || 0) + roi
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    value: Math.round(value / 1000),
    fullName: name
  })).sort((a, b) => b.value - a.value).slice(0, 6)

  const engagementTrendData = [
    { week: 'Week 1', submissions: Math.floor(totalIdeas * 0.15), engagement: Math.floor(totalEngagement * 0.12) },
    { week: 'Week 2', submissions: Math.floor(totalIdeas * 0.20), engagement: Math.floor(totalEngagement * 0.18) },
    { week: 'Week 3', submissions: Math.floor(totalIdeas * 0.25), engagement: Math.floor(totalEngagement * 0.28) },
    { week: 'Week 4', submissions: Math.floor(totalIdeas * 0.40), engagement: Math.floor(totalEngagement * 0.42) }
  ]

  return (
    <div className="space-y-6">
      {/* AI Executive Summary */}
      <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="w-6 h-6 text-blue-400" />
            AI Executive Summary
          </CardTitle>
          <CardDescription className="text-slate-300">
            Intelligent analysis of innovation portfolio with strategic recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Top Priority Recommendations */}
          <div>
            <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Top Priority Ideas for Investigation
            </h3>
            <div className="space-y-2">
              {aiExecutiveSummary.topPriorityIdeas.length > 0 ? (
                aiExecutiveSummary.topPriorityIdeas.map((idea, idx) => (
                  <div key={idea.id} className="p-3 bg-slate-950/50 rounded-lg border border-blue-800/30">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{idea.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span className="text-green-500">
                            ${((idea.aiAnalysis?.executiveAnalysis?.netValue3Year || 0) / 1000).toFixed(0)}K ROI
                          </span>
                          <span>•</span>
                          <span>{idea.upvotes || 0} votes</span>
                          <span>•</span>
                          <span>Strategic Score: {idea.aiAnalysis?.strategicAlignmentScore || 0}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No high-priority ideas identified yet. Submit more ideas to see recommendations.</p>
              )}
            </div>
          </div>

          {/* Vision 2030 Alignment */}
          <div>
            <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Vision 2030 Strategic Alignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiExecutiveSummary.vision2030Alignment.slice(0, 4).map((idea) => (
                <div key={idea.id} className="p-3 bg-slate-950/50 rounded-lg border border-purple-800/30">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-medium text-sm flex-1">{idea.title}</p>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                      {idea.vision2030Score}/5
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {idea.alignedAreas.map((area) => (
                      <Badge key={area} variant="secondary" className="text-xs bg-purple-500/5 text-purple-300">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workforce & Patient Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Workforce Outcome Predictions
              </h3>
              <div className="space-y-2">
                {aiExecutiveSummary.workforceImpact.slice(0, 3).map((idea) => (
                  <div key={idea.id} className="p-2 bg-slate-950/50 rounded border border-green-800/30">
                    <p className="text-xs font-medium truncate">{idea.title}</p>
                    <p className="text-xs text-green-400 mt-1">
                      Impact: {idea.aiAnalysis?.impactStaff || 'Medium'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-pink-400 mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Patient Satisfaction Impact
              </h3>
              <div className="space-y-2">
                {aiExecutiveSummary.patientImpact.slice(0, 3).map((idea) => (
                  <div key={idea.id} className="p-2 bg-slate-950/50 rounded border border-pink-800/30">
                    <p className="text-xs font-medium truncate">{idea.title}</p>
                    <p className="text-xs text-pink-400 mt-1">
                      Impact: {idea.aiAnalysis?.impactPatient || 'High'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="p-3 bg-blue-950/30 rounded-lg border border-blue-800/30">
            <h3 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Key Insights
            </h3>
            <ul className="space-y-1 text-xs text-slate-300">
              <li>• <strong>{aiExecutiveSummary.vision2030Alignment.length}</strong> ideas strongly align with Vision 2030 strategic pillars</li>
              <li>• <strong>{aiExecutiveSummary.workforceImpact.length}</strong> ideas predicted to improve workforce satisfaction and retention</li>
              <li>• <strong>{aiExecutiveSummary.patientImpact.length}</strong> ideas have high potential for patient outcome improvements</li>
              <li>• Top ROI opportunity: <strong>${(totalROI / 1000000).toFixed(1)}M</strong> in 3-year value across portfolio</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-purple-500" />
              Ideas by Category
            </CardTitle>
            <CardDescription>Distribution of innovation ideas across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              ROI by Category (3-Year Value)
            </CardTitle>
            <CardDescription>Potential return on investment by category ($K)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roiByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="value" fill="#eab308" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Platform Engagement Trend
          </CardTitle>
          <CardDescription>Weekly submissions and engagement over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="submissions" stroke="#3b82f6" strokeWidth={2} name="Submissions" />
              <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} name="Engagement" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Total Ideas</CardDescription>
            <CardTitle className="text-3xl">{totalIdeas}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-500">+{platformTraction.weeklySubmissions}/week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Total ROI Potential</CardDescription>
            <CardTitle className="text-3xl">${(totalROI / 1000000).toFixed(1)}M</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-yellow-500" />
              <span className="text-slate-400">3-year value</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Engagement Rate</CardDescription>
            <CardTitle className="text-3xl">{avgEngagementPerIdea}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-slate-400">interactions/idea</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Active Contributors</CardDescription>
            <CardTitle className="text-3xl">{platformTraction.activeContributors}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-slate-400">unique submitters</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              High Energy Ideas
            </CardTitle>
            <CardDescription>Ideas with highest engagement (votes + comments)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highEngagementIdeas.map((idea, idx) => (
                <div key={idea.id} className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-500">#{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{idea.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{idea.submitterDepartment}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {idea.engagement} interactions
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              Highest ROI Opportunities
            </CardTitle>
            <CardDescription>Ideas with greatest 3-year value potential</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highROIIdeas.map((idea, idx) => (
                <div key={idea.id} className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-yellow-500">#{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{idea.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{idea.categoryType}</span>
                      <span>•</span>
                      <span className="text-yellow-500 font-medium">
                        ${((idea.aiAnalysis?.executiveAnalysis?.netValue3Year || 0) / 1000).toFixed(0)}K ROI
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Project Correlation
            </CardTitle>
            <CardDescription>How ideas align with existing initiatives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {correlatedProjects.map((project) => (
                <div key={project.name} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">{project.name}</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                    {project.correlatedIdeas} ideas
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Quick Wins
            </CardTitle>
            <CardDescription>High-value ideas with short timelines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickWins.length > 0 ? (
                quickWins.map((idea) => (
                  <div key={idea.id} className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{idea.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>{idea.aiAnalysis?.timelineEstimateGeneral || 'TBD'}</span>
                        <span>•</span>
                        <span className="text-green-500">
                          ${((idea.aiAnalysis?.executiveAnalysis?.netValue3Year || 0) / 1000).toFixed(0)}K value
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No quick wins identified yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-purple-500" />
              Top Categories
            </CardTitle>
            <CardDescription>Ideas by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topCategories.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 truncate">{category}</span>
                  <Badge variant="outline" className="ml-2">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Top Departments
            </CardTitle>
            <CardDescription>Most active departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topDepartments.map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 truncate">{dept}</span>
                  <Badge variant="outline" className="ml-2">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Platform Traction
            </CardTitle>
            <CardDescription>Adoption metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Weekly Submissions</span>
                <span className="text-sm font-medium text-green-500">+{platformTraction.weeklySubmissions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Avg Review Time</span>
                <span className="text-sm font-medium">{platformTraction.avgTimeToReview}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Implementation Rate</span>
                <span className="text-sm font-medium text-green-500">{platformTraction.implementationRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Active Contributors</span>
                <span className="text-sm font-medium">{platformTraction.activeContributors}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Pipeline Status
          </CardTitle>
          <CardDescription>Ideas by stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Submitted</span>
                <Badge variant="outline">{submittedIdeas}</Badge>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${totalIdeas > 0 ? (submittedIdeas / totalIdeas) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">In Review</span>
                <Badge variant="outline">{inReviewIdeas}</Badge>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${totalIdeas > 0 ? (inReviewIdeas / totalIdeas) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Approved</span>
                <Badge variant="outline">{approvedIdeas}</Badge>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${totalIdeas > 0 ? (approvedIdeas / totalIdeas) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment Section */}
      {!loading && riskData && (
        <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-400" />
              Risk Assessment & Mitigation
            </CardTitle>
            <CardDescription className="text-slate-300">
              Comprehensive risk analysis across strategic, technical, operational, and financial dimensions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/50 rounded-lg border border-red-800/30">
                <div className="text-sm text-slate-400 mb-1">High Risk</div>
                <div className="text-2xl font-bold text-red-400">{riskData.summary.highRisk}</div>
                <div className="text-xs text-slate-500 mt-1">ideas need attention</div>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-lg border border-yellow-800/30">
                <div className="text-sm text-slate-400 mb-1">Medium Risk</div>
                <div className="text-2xl font-bold text-yellow-400">{riskData.summary.mediumRisk}</div>
                <div className="text-xs text-slate-500 mt-1">ideas to monitor</div>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-lg border border-green-800/30">
                <div className="text-sm text-slate-400 mb-1">Low Risk</div>
                <div className="text-2xl font-bold text-green-400">{riskData.summary.lowRisk}</div>
                <div className="text-xs text-slate-500 mt-1">ideas ready to proceed</div>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-lg border border-blue-800/30">
                <div className="text-sm text-slate-400 mb-1">Avg Risk Score</div>
                <div className="text-2xl font-bold text-blue-400">{riskData.summary.avgOverallRisk}/10</div>
                <div className="text-xs text-slate-500 mt-1">portfolio average</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-red-300 mb-2">Top Risk Areas</h3>
              {riskData.ideas.slice(0, 5).map((idea) => (
                <div key={idea.id} className="p-3 bg-slate-950/50 rounded-lg border border-red-800/30">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-medium text-sm flex-1">{idea.title}</p>
                    <Badge 
                      variant="outline" 
                      className={`${
                        idea.riskLevel === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        idea.riskLevel === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                        'bg-green-500/10 text-green-400 border-green-500/30'
                      }`}
                    >
                      {idea.riskLevel}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Strategic:</span>
                      <span className="ml-1 text-slate-300">{idea.strategicRisk}/10</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Technical:</span>
                      <span className="ml-1 text-slate-300">{idea.technicalRisk}/10</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Operational:</span>
                      <span className="ml-1 text-slate-300">{idea.operationalRisk}/10</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Financial:</span>
                      <span className="ml-1 text-slate-300">{idea.financialRisk}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sentiment & Excitement Analysis */}
      {!loading && sentimentData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="w-6 h-6 text-purple-400" />
                Department Sentiment & Excitement
              </CardTitle>
              <CardDescription className="text-slate-300">
                Engagement and enthusiasm levels across departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sentimentData.byDepartment.slice(0, 5).map((dept) => (
                  <div key={dept.department} className="p-3 bg-slate-950/50 rounded-lg border border-purple-800/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{dept.department}</span>
                      <Badge 
                        variant="outline" 
                        className={`${
                          dept.sentiment === 'Very Positive' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                          dept.sentiment === 'Positive' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                          dept.sentiment === 'Neutral' ? 'bg-slate-500/10 text-slate-400 border-slate-500/30' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}
                      >
                        {dept.sentiment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>{dept.ideaCount} ideas</span>
                      <span>•</span>
                      <span>Excitement: {dept.excitement}/100</span>
                      <span>•</span>
                      <span>Avg Engagement: {dept.avgEngagement}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-purple-950/30 rounded-lg border border-purple-800/30">
                <div className="text-xs text-purple-300 space-y-1">
                  <div>Overall Excitement: <strong>{sentimentData.overall.avgExcitement}/100</strong></div>
                  <div>Top Department: <strong>{sentimentData.overall.topDepartment}</strong></div>
                  <div>Top Category: <strong>{sentimentData.overall.topCategory}</strong></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="w-6 h-6 text-indigo-400" />
                Category Sentiment Analysis
              </CardTitle>
              <CardDescription className="text-slate-300">
                Innovation excitement by category type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sentimentData.byCategory.slice(0, 5).map((cat) => (
                  <div key={cat.category} className="p-3 bg-slate-950/50 rounded-lg border border-indigo-800/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{cat.category}</span>
                      <Badge 
                        variant="outline" 
                        className={`${
                          cat.sentiment === 'Very Positive' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                          cat.sentiment === 'Positive' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                          cat.sentiment === 'Neutral' ? 'bg-slate-500/10 text-slate-400 border-slate-500/30' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}
                      >
                        {cat.sentiment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>{cat.ideaCount} ideas</span>
                      <span>•</span>
                      <span>Excitement: {cat.excitement}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maturity Pipeline */}
      {!loading && maturityData && (
        <Card className="bg-gradient-to-br from-cyan-900/30 to-teal-900/30 border-cyan-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-cyan-400" />
              Innovation Maturity Pipeline
            </CardTitle>
            <CardDescription className="text-slate-300">
              Ideas categorized by development stage - from concept to realization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-slate-950/50 rounded-lg border border-green-800/30">
                <div className="text-xs text-slate-400 mb-1">Realized</div>
                <div className="text-2xl font-bold text-green-400">{maturityData.summary.realized}</div>
                <div className="text-xs text-slate-500 mt-1">implemented</div>
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-blue-800/30">
                <div className="text-xs text-slate-400 mb-1">Piloting</div>
                <div className="text-2xl font-bold text-blue-400">{maturityData.summary.piloting}</div>
                <div className="text-xs text-slate-500 mt-1">in testing</div>
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-cyan-800/30">
                <div className="text-xs text-slate-400 mb-1">Developing</div>
                <div className="text-2xl font-bold text-cyan-400">{maturityData.summary.developing}</div>
                <div className="text-xs text-slate-500 mt-1">in progress</div>
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-800/30">
                <div className="text-xs text-slate-400 mb-1">Planning</div>
                <div className="text-2xl font-bold text-purple-400">{maturityData.summary.planning}</div>
                <div className="text-xs text-slate-500 mt-1">approved</div>
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-yellow-800/30">
                <div className="text-xs text-slate-400 mb-1">Evaluating</div>
                <div className="text-2xl font-bold text-yellow-400">{maturityData.summary.evaluating}</div>
                <div className="text-xs text-slate-500 mt-1">under review</div>
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Refining</div>
                <div className="text-2xl font-bold text-slate-400">{maturityData.summary.refining}</div>
                <div className="text-xs text-slate-500 mt-1">needs work</div>
              </div>
            </div>

            <div className="p-4 bg-cyan-950/30 rounded-lg border border-cyan-800/30">
              <div className="text-sm font-semibold text-cyan-300 mb-2">Pipeline Value</div>
              <div className="text-2xl font-bold text-cyan-400">
                ${(maturityData.summary.totalValue / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-slate-400 mt-1">Total 3-year value across all pipeline stages</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive Action Items */}
      {!loading && actionItemsData && (
        <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="w-6 h-6 text-orange-400" />
              Executive Action Items
            </CardTitle>
            <CardDescription className="text-slate-300">
              Prioritized recommendations for leadership review and decision
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/50 rounded-lg border border-red-800/30">
                <div className="text-sm text-slate-400 mb-1">Critical</div>
                <div className="text-2xl font-bold text-red-400">{actionItemsData.summary.critical}</div>
                <div className="text-xs text-slate-500 mt-1">immediate action</div>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-lg border border-orange-800/30">
                <div className="text-sm text-slate-400 mb-1">High Priority</div>
                <div className="text-2xl font-bold text-orange-400">{actionItemsData.summary.high}</div>
                <div className="text-xs text-slate-500 mt-1">within 2 weeks</div>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-lg border border-yellow-800/30">
                <div className="text-sm text-slate-400 mb-1">Medium Priority</div>
                <div className="text-2xl font-bold text-yellow-400">{actionItemsData.summary.medium}</div>
                <div className="text-xs text-slate-500 mt-1">within 1 month</div>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-lg border border-green-800/30">
                <div className="text-sm text-slate-400 mb-1">Total Value</div>
                <div className="text-2xl font-bold text-green-400">${(actionItemsData.summary.totalValue / 1000000).toFixed(1)}M</div>
                <div className="text-xs text-slate-500 mt-1">at stake</div>
              </div>
            </div>

            <div className="space-y-3">
              {actionItemsData.actionItems.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-950/50 rounded-lg border border-orange-800/30">
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      item.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                      item.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{item.action}</h4>
                        <Badge 
                          variant="outline" 
                          className={`${
                            item.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                            item.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          }`}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{item.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400">
                        <div>
                          <span className="text-slate-500">Ideas:</span>
                          <span className="ml-1 font-medium">{item.ideaCount}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Value:</span>
                          <span className="ml-1 font-medium text-green-400">${(item.estimatedValue / 1000000).toFixed(1)}M</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Due:</span>
                          <span className="ml-1 font-medium">{item.dueDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Owner:</span>
                          <span className="ml-1 font-medium">{item.owner}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Solutions from Other Hospitals */}
      {!loading && solutions && solutions.length > 0 && (
        <Card className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-emerald-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-400" />
              Historical Solutions from ContosoHealth Network
            </CardTitle>
            <CardDescription className="text-slate-300">
              Proven innovations deployed at other ContosoHealth hospitals - learn from success stories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {solutions.slice(0, 6).map((solution) => (
                <div key={solution.id} className="p-4 bg-slate-950/50 rounded-lg border border-emerald-800/30">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{solution.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                          {solution.hospital_name}
                        </Badge>
                        <span>•</span>
                        <span>{solution.category}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">{solution.description}</p>
                  <div className="p-2 bg-emerald-950/30 rounded border border-emerald-800/20 mb-2">
                    <div className="text-xs text-emerald-300">
                      <strong>Results:</strong> {solution.results}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-500">Contact:</span>
                      <span className="ml-1 font-medium">{solution.contact_name}</span>
                    </div>
                    <span>•</span>
                    <div>
                      <span className="text-slate-500">Email:</span>
                      <span className="ml-1 font-medium text-emerald-400">{solution.contact_email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/30">
              <div className="text-xs text-emerald-300">
                <strong>Network Advantage:</strong> {solutions.length} proven solutions available for adaptation across ContosoHealth hospitals. Contact solution owners to learn implementation best practices and avoid common pitfalls.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
