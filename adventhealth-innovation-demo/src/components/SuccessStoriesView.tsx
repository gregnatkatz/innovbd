import { Lightbulb, TrendingUp, Eye } from 'lucide-react'
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
                      <div className="text-sm font-semibold text-purple-400 mb-1">3. AdventHealth Took Action</div>
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
                  onClick={() => onViewOriginalIdea(story.originalIdeaId)}
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
  )
}
