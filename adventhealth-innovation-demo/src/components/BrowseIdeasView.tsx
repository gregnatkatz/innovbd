import { Search, Filter, ThumbsUp, ThumbsDown, MessageSquare, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Idea, Persona } from '../types'
import { getInitials, getAvatarUrl, getIdeaTitle, getIdeaDescription } from '../utils/helpers'

interface BrowseIdeasViewProps {
  ideas: Idea[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterCategory: string
  setFilterCategory: (category: string) => void
  categories: string[]
  onIdeaClick: (idea: Idea) => void
  onVote: (ideaId: string, voteType: 'up' | 'down') => void
  onDelete: (ideaId: string) => void
  persona: Persona
}

export function BrowseIdeasView({
  ideas,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  categories,
  onIdeaClick,
  onVote,
  onDelete,
  persona
}: BrowseIdeasViewProps) {
  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || idea.categoryType === filterCategory
    return matchesSearch && matchesCategory
  })

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
