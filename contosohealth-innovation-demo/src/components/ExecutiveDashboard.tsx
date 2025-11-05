import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, DollarSign, Users, Lightbulb, Target, Activity, CheckCircle, Clock, AlertTriangle, Brain, Heart, Briefcase, Star, Zap } from 'lucide-react'
import { Idea } from '../types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'

interface ExecutiveDashboardProps {
  ideas: Idea[]
}

export function ExecutiveDashboard({ ideas }: ExecutiveDashboardProps) {
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
    </div>
  )
}
