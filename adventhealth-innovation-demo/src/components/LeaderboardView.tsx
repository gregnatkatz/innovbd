import { Trophy, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, getAvatarUrl } from '../utils/helpers'
import { pointsRubric, leaderboard } from '../data/constants'

export function LeaderboardView() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Innovation Champions</h2>
        <p className="text-slate-400">
          Top contributors making AdventHealth better every day
        </p>
      </div>

      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Points Rubric - How to Win
          </CardTitle>
          <CardDescription>
            Earn points for your contributions. Winning ideas get the most recognition!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(pointsRubric).map(([key, rubric]) => (
              <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50">
                <div className="text-2xl">{rubric.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{rubric.label}</span>
                    <Badge variant="outline" className={rubric.color}>
                      {rubric.points} pts
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">{rubric.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
          <CardDescription>
            Earn points by submitting ideas, collaborating, and engaging with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map(entry => (
              <div
                key={entry.rank}
                className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{entry.badge}</div>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getAvatarUrl(entry.name)} alt={entry.name} />
                    <AvatarFallback className="bg-blue-500/10 text-blue-500">
                      {getInitials(entry.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{entry.name}</div>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>{entry.ideas} ideas</span>
                    <span>•</span>
                    <span>{entry.collaborations} collaborations</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    {entry.winningIdeas > 0 && (
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        {entry.winningIdeas} winning
                      </span>
                    )}
                    {entry.partialCredit > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-blue-500" />
                        {entry.partialCredit} partial
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-500">{entry.points}</div>
                  <div className="text-xs text-slate-400">points</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Rewards Catalog</CardTitle>
          <CardDescription>
            Redeem your points for tangible rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-3xl mb-2">☕</div>
              <div className="font-semibold mb-1">$10 Starbucks Gift Card</div>
              <div className="text-sm text-slate-400 mb-3">150 points</div>
              <Button size="sm" className="w-full">Redeem</Button>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-3xl mb-2">☕</div>
              <div className="font-semibold mb-1">$25 Starbucks Gift Card</div>
              <div className="text-sm text-slate-400 mb-3">300 points</div>
              <Button size="sm" className="w-full">Redeem</Button>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-3xl mb-2">📦</div>
              <div className="font-semibold mb-1">$25 Amazon Gift Card</div>
              <div className="text-sm text-slate-400 mb-3">300 points</div>
              <Button size="sm" className="w-full">Redeem</Button>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-3xl mb-2">📦</div>
              <div className="font-semibold mb-1">$50 Amazon Gift Card</div>
              <div className="text-sm text-slate-400 mb-3">500 points</div>
              <Button size="sm" className="w-full">Redeem</Button>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-3xl mb-2">🎟️</div>
              <div className="font-semibold mb-1">Movie Tickets (2)</div>
              <div className="text-sm text-slate-400 mb-3">400 points</div>
              <Button size="sm" className="w-full">Redeem</Button>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-semibold mb-1">Premium Parking Spot (1 month)</div>
              <div className="text-sm text-slate-400 mb-3">600 points</div>
              <Button size="sm" className="w-full">Redeem</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
