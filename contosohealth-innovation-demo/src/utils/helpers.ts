import { Idea, Persona } from '../types'

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const getLabel = (key: string, persona: Persona): string => {
  if (persona === 'staff') {
    const staffLabels: Record<string, string> = {
      'Strategic Alignment': 'How this supports our goals',
      'Complexity': 'How hard it is',
      'Timeline Estimate': 'About how long it takes',
      'Patient Impact': 'How this helps patients',
      'Staff Impact': 'How this helps staff',
      'AI Recommendations': 'What to consider next'
    }
    return staffLabels[key] || key
  }
  return key
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const getAvatarUrl = (name: string): string => {
  const nameToPhotoMap: Record<string, number> = {
    'Sarah Chen': 1,
    'Dr. Emily Foster': 2,
    'Robert Martinez': 3,
    'Linda Thompson': 4,
    'James Wilson': 5,
    'Maria Rodriguez': 6,
    'Dr. Robert Kim': 7,
    'Sarah Johnson': 8,
    'Dr. Lisa Rodriguez': 9,
    'Michael Chen': 10,
    'Amanda Foster': 11,
    'Dr. Jennifer Walsh': 12,
    'Dr. Michelle Adams': 13
  }
  
  const photoNumber = nameToPhotoMap[name] || (Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 20) + 1
  return `/avatars/profile-${photoNumber}.png`
}

export const getIdeaTitle = (idea: Idea, persona: Persona): string => {
  if (persona === 'staff' && idea.staffTitle) {
    return idea.staffTitle
  }
  return idea.title
}

export const getIdeaDescription = (idea: Idea, persona: Persona): string => {
  if (persona === 'staff' && idea.staffDescription) {
    return idea.staffDescription
  }
  return idea.description
}
