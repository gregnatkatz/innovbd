import { Lightbulb, TrendingUp, Eye, Play } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Persona } from '../types'
import { successStories } from '../data/constants'

interface SuccessStoriesViewProps {
  persona: Persona
  onViewOriginalIdea: (ideaId: string) => void
}

export function SuccessStoriesView({ persona, onViewOriginalIdea }: SuccessStoriesViewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Ideas Make a Difference</h2>
        <p className="text-slate-400">
          See how staff innovations have transformed into real projects improving patient care
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {successStories.slice(0, 3).map(story => (
          <Card key={story.id} className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-3xl">{story.image}</div>
                <CardTitle className="text-lg">{story.title}</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {story.submitter} • {new Date(story.submittedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} → {new Date(story.implementedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* AI-Generated Demo Video */}
              {story.videoUrl && (
                <div>
                  <h5 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <Play className="w-3 h-3 text-blue-500" />
                    AI-Generated Demo Video
                  </h5>
                  <div className="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-700 mb-3">
                    <video 
                      controls 
                      className="w-full h-auto"
                    >
                      <source src={story.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {/* Problem Statement */}
              <div>
                <h4 className="text-xs font-semibold text-blue-400 mb-1">Problem Statement</h4>
                <p className="text-xs text-slate-300 line-clamp-3">{story.journey.submission}</p>
              </div>

              {/* Proposed Solution */}
              <div>
                <h4 className="text-xs font-semibold text-green-400 mb-1">Proposed Solution</h4>
                <p className="text-xs text-slate-300 line-clamp-3">{story.journey.action}</p>
              </div>

              {/* Expected Benefit */}
              <div>
                <h4 className="text-xs font-semibold text-purple-400 mb-1">Expected Benefit</h4>
                <p className="text-xs text-slate-300 line-clamp-2">{story.journey.growth}</p>
              </div>

              <Separator className="bg-slate-800 my-2" />

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
                  onClick={() => onViewOriginalIdea(story.originalIdeaId)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Original Idea Submission
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
