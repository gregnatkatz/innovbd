export const successStories = [
  {
    id: 'story-1',
    originalIdeaId: 'idea-003',
    title: 'Real-Time Medication Tracking System',
    submitter: 'Sarah Chen, RN',
    submittedDate: '2024-03-15',
    implementedDate: '2025-09-01',
    image: '💊',
    videoUrl: '/sora-icu-monitoring.mp4',
    journey: {
      submission: 'Sarah Chen, a Medical/Surgical nurse, submitted a simple idea: "Help me not miss giving patients their meds on time." She described how getting pulled away for emergencies caused medication delays, affecting patient safety.',
      growth: 'The idea gained 47 upvotes and sparked 12 comments from nurses across 5 units. Dr. Emily Foster from Pharmacy suggested integrating with Epic MAR. Michael Chen from IT confirmed existing infrastructure could support it. The community refined it into a comprehensive solution.',
      action: 'ContosoHealth launched "Project MedSync" in January 2025. A cross-functional team piloted the system on 3 units, integrating Pyxis dispensing data with Epic Rover mobile carts. Real-time alerts notified charge nurses when medications weren\'t administered within 30 minutes.',
      timeline: '6 months from submission to pilot launch, 3 months pilot, full rollout in September 2025'
    },
    staffImpact: {
      quality: 'Nurses no longer worry about missing medication times. Patients receive medications on schedule, improving safety and outcomes. Documentation is automatic, saving 5 minutes per medication pass.',
      endUserBenefit: 'Patients get their pain medications and antibiotics on time, leading to better pain control and faster recovery. Families notice improved care quality.',
      satisfaction: 'Nurse satisfaction scores increased 23 points. Patients report feeling more confident in their care.'
    },
    executiveImpact: {
      costSavings: '$450K annually from reduced medication errors and adverse events',
      revenueImpact: 'Improved patient satisfaction scores increased Medicare reimbursement by $180K',
      efficiency: 'Reduced nurse documentation time by 2,400 hours annually across pilot units',
      roi: '340% ROI over 3 years, 8-month payback period',
      strategicValue: 'Supports Vision 2030 goals for patient connectivity and staff retention. Reduced medication error rate from 3.2% to 0.4%.',
      implementation: 'Initial investment: $125K. Scaling to all 55 hospitals projected to save $8.5M annually.'
    }
  },
  {
    id: 'story-2',
    originalIdeaId: 'idea-008',
    title: 'Smart Wheelchair Tracking System',
    submitter: 'Mike Johnson, Transport Services',
    submittedDate: '2024-06-20',
    implementedDate: '2025-08-15',
    image: '♿',
    videoUrl: '/sora-idea-018.mp4',
    journey: {
      submission: 'Mike Johnson submitted a spark idea: "Faster way to find wheelchairs - we waste so much time looking for them. Can we put trackers on them?" Just two sentences, but it captured a real pain point.',
      growth: 'The idea received 23 upvotes and 8 comments. Transport staff from other hospitals chimed in with similar frustrations. Amanda Foster from Pediatrics noted they also lose IV poles and patient lifts. The scope expanded to track all mobile equipment.',
      action: 'ContosoHealth partnered with a medical equipment vendor to pilot Bluetooth tracking tags on 200 wheelchairs at Orlando campus. A mobile app shows real-time locations. After 2-month pilot showed 70% time savings, the program expanded hospital-wide.',
      timeline: '4 months from submission to pilot, 2 months pilot, full rollout in August 2025'
    },
    staffImpact: {
      quality: 'Transport staff find wheelchairs in seconds instead of searching for 10-15 minutes. Less frustration and more time helping patients. Reduced physical strain from walking miles searching.',
      endUserBenefit: 'Patients wait less time for transport to procedures and discharge. Families appreciate faster service.',
      satisfaction: 'Transport staff satisfaction improved 31 points. Patient discharge delays reduced by 45 minutes on average.'
    },
    executiveImpact: {
      costSavings: '$280K annually from improved transport efficiency and reduced equipment loss',
      revenueImpact: 'Faster patient throughput increased bed availability, generating $420K additional revenue',
      efficiency: 'Reduced average equipment search time from 12 minutes to 90 seconds. Eliminated need to purchase 40 replacement wheelchairs annually.',
      roi: '580% ROI over 3 years, 5-month payback period',
      strategicValue: 'Improved patient flow supports ambulatory care expansion goals. Reduced equipment capital expenses by $85K annually.',
      implementation: 'Initial investment: $45K for tags and software. Scaling to all hospitals projected to save $4.2M annually.'
    }
  },
  {
    id: 'story-3',
    originalIdeaId: 'idea-020',
    title: 'Automated Discharge Prescription System',
    submitter: 'Dr. Christopher Lee, Hospital Medicine',
    submittedDate: '2024-05-10',
    implementedDate: '2025-07-01',
    image: '💊',
    videoUrl: '/sora-idea-047.mp4',
    journey: {
      submission: 'Dr. Lee submitted: "Discharge prescriptions get lost - we send them to pharmacy but patients say they never got them. Communication breakdown." He described how 30% of prescriptions had issues, leading to readmissions.',
      growth: 'The idea gained 39 upvotes and 15 comments. Pharmacists, case managers, and nurses all contributed. Dr. Susan Miller suggested checking insurance formulary before prescribing. Jennifer Adams from IT proposed text notifications. The community built a comprehensive solution.',
      action: 'ContosoHealth IT developed an integrated system checking insurance coverage, showing out-of-pocket costs, and sending text alerts when prescriptions are ready. Pharmacists review high-risk medications before discharge. Pilot launched on 4 medical units in March 2025.',
      timeline: '8 months from submission to pilot, 4 months pilot, full rollout in July 2025'
    },
    staffImpact: {
      quality: 'Physicians know prescriptions reach patients. Pharmacists catch insurance issues before discharge. Nurses spend less time fielding calls about missing prescriptions. Patients leave hospital with medications in hand.',
      endUserBenefit: 'Patients get their medications without hassle. No surprise costs at pharmacy. Text alerts provide peace of mind. Fewer return trips to hospital.',
      satisfaction: 'Physician satisfaction with discharge process increased 28 points. Patient complaints about prescriptions dropped 85%.'
    },
    executiveImpact: {
      costSavings: '$1.2M annually from reduced readmissions due to medication non-adherence',
      revenueImpact: 'Avoided $380K in CMS readmission penalties. Improved patient satisfaction scores increased reimbursement.',
      efficiency: 'Reduced pharmacy calls by 60%. Decreased ED visits for medication issues by 40%.',
      roi: '420% ROI over 3 years, 6-month payback period',
      strategicValue: 'Directly supports Vision 2030 patient connectivity goals. Improved 30-day readmission rate from 18% to 14.2% for medication-related causes.',
      implementation: 'Initial investment: $95K for system integration. Scaling to all hospitals projected to save $18M annually in readmission costs.'
    }
  }
]

export const pointsRubric = {
  winningIdea: {
    points: 100,
    label: 'Winning Idea (Fully Implemented)',
    description: 'Your idea was selected and fully implemented as a solution',
    icon: '🏆',
    color: 'text-yellow-500'
  },
  partialCredit: {
    points: 50,
    label: 'Partial Credit (Contributed to Solution)',
    description: 'Your idea contributed key elements to a winning solution',
    icon: '⭐',
    color: 'text-blue-500'
  },
  ideaSubmission: {
    points: 10,
    label: 'Idea Submission',
    description: 'Submit a new innovation idea',
    icon: '💡',
    color: 'text-slate-400'
  },
  collaboration: {
    points: 5,
    label: 'Collaboration',
    description: 'Add meaningful feedback or join an existing idea',
    icon: '🤝',
    color: 'text-green-500'
  },
  vote: {
    points: 1,
    label: 'Engagement',
    description: 'Vote on ideas to help prioritize',
    icon: '👍',
    color: 'text-slate-400'
  }
}

export const leaderboard = [
  { rank: 1, name: 'Dr. Robert Kim', points: 450, badge: '🏆', ideas: 8, collaborations: 12, winningIdeas: 2, partialCredit: 3 },
  { rank: 2, name: 'Sarah Johnson', points: 380, badge: '🥈', ideas: 6, collaborations: 15, winningIdeas: 1, partialCredit: 4 },
  { rank: 3, name: 'Dr. Lisa Rodriguez', points: 350, badge: '🥉', ideas: 5, collaborations: 10, winningIdeas: 1, partialCredit: 2 },
  { rank: 4, name: 'Michael Chen', points: 320, badge: '⭐', ideas: 7, collaborations: 8, winningIdeas: 0, partialCredit: 5 },
  { rank: 5, name: 'Amanda Foster', points: 290, badge: '⭐', ideas: 4, collaborations: 14, winningIdeas: 0, partialCredit: 3 }
]

export const sampleComments: Record<string, any[]> = {
  'idea-001': [
    {
      id: 'c1',
      author: 'Dr. Sarah Mitchell',
      department: 'Emergency Medicine',
      createdAt: '2025-11-01T14:30:00Z',
      content: 'This is exactly what we need! Our ED has been struggling with bed placement delays. Have you considered integrating with our current Epic system?',
      replies: [
        {
          id: 'c1-r1',
          author: 'Dr. Robert Kim',
          department: 'Emergency Department',
          createdAt: '2025-11-01T15:45:00Z',
          content: 'Great question! Yes, the AI system would integrate directly with Epic through their APIs. We\'ve seen similar implementations at other health systems with excellent results.',
          replies: []
        }
      ]
    },
    {
      id: 'c2',
      author: 'Jennifer Walsh',
      department: 'Nursing Administration',
      createdAt: '2025-11-02T09:15:00Z',
      content: 'I love this idea! We waste so much time calling around for beds. Would this also help with predicting discharge times?',
      replies: []
    },
    {
      id: 'c3',
      author: 'Michael Chen',
      department: 'IT',
      createdAt: '2025-11-02T16:20:00Z',
      content: 'From a technical perspective, this is very feasible. We already have the infrastructure for real-time data processing. I\'d be happy to collaborate on the implementation.',
      replies: [
        {
          id: 'c3-r1',
          author: 'Dr. Robert Kim',
          department: 'Emergency Department',
          createdAt: '2025-11-02T17:00:00Z',
          content: 'That would be fantastic! Let\'s set up a meeting to discuss the technical requirements.',
          replies: []
        }
      ]
    }
  ],
  'idea-003': [
    {
      id: 'c4',
      author: 'Amanda Foster',
      department: 'Pain Management',
      createdAt: '2025-10-28T11:00:00Z',
      content: 'We piloted VR for pain management in our unit and saw amazing results! Patients loved it and we reduced opioid use significantly. Happy to share our experience.',
      replies: []
    },
    {
      id: 'c5',
      author: 'Dr. Patricia Anderson',
      department: 'Pharmacy',
      createdAt: '2025-10-29T13:30:00Z',
      content: 'This aligns perfectly with our opioid reduction initiative. What age groups responded best to VR therapy?',
      replies: [
        {
          id: 'c5-r1',
          author: 'Dr. Lisa Rodriguez',
          department: 'Pain Management',
          createdAt: '2025-10-29T14:15:00Z',
          content: 'We found it works well across all age groups, but particularly effective for patients 25-65. Older patients sometimes need more guidance with the technology.',
          replies: []
        }
      ]
    }
  ],
  'idea-014': [
    {
      id: 'c14-1',
      author: 'Michael Chen',
      department: 'IT',
      createdAt: '2025-11-03T10:30:00Z',
      content: 'I completely agree! Epic is painfully slow. We need better hardware or optimization. This affects patient care when we can\'t access records quickly.',
      replies: [
        {
          id: 'c14-1-r1',
          author: 'Patricia Davis',
          department: 'Technology/Digital Innovation',
          createdAt: '2025-11-03T11:15:00Z',
          content: 'Thanks for the support! IT has been saying we need upgrades for months. Maybe if enough staff speak up, leadership will prioritize this.',
          replies: []
        }
      ]
    },
    {
      id: 'c14-2',
      author: 'Dr. Jennifer Lee',
      department: 'Internal Medicine',
      createdAt: '2025-11-03T14:20:00Z',
      content: 'The freezing is the worst part. I lose my work and have to start over. We need a solution ASAP.',
      replies: []
    }
  ],
  'idea-018': [
    {
      id: 'c18-1',
      author: 'Dr. Sarah Mitchell',
      department: 'Emergency Medicine',
      createdAt: '2025-11-04T09:00:00Z',
      content: 'The scheduling system is a nightmare! I can never get my shifts swapped when I need to. We need a better interface.',
      replies: [
        {
          id: 'c18-1-r1',
          author: 'Karen White',
          department: 'Workforce/Culture',
          createdAt: '2025-11-04T09:45:00Z',
          content: 'Exactly! And when it crashes, we lose all our requests. I\'ve been pushing for an upgrade for months.',
          replies: []
        }
      ]
    },
    {
      id: 'c18-2',
      author: 'Amanda Foster',
      department: 'Nursing Administration',
      createdAt: '2025-11-04T13:30:00Z',
      content: 'We should look at what other hospitals are using. There must be better scheduling software out there.',
      replies: []
    }
  ],
  'idea-008': [
    {
      id: 'c8-1',
      author: 'Dr. Lisa Rodriguez',
      department: 'Cardiology',
      createdAt: '2025-11-02T08:15:00Z',
      content: 'Parking is a huge issue! I arrive 30 minutes early just to find a spot. We need more staff parking or a shuttle system.',
      replies: [
        {
          id: 'c8-1-r1',
          author: 'Robert Martinez',
          department: 'Facilities/Infrastructure',
          createdAt: '2025-11-02T09:00:00Z',
          content: 'I\'ve proposed a multi-level parking structure to leadership. With enough support from staff, we might get approval.',
          replies: []
        }
      ]
    },
    {
      id: 'c8-2',
      author: 'Jennifer Walsh',
      department: 'Patient Services',
      createdAt: '2025-11-02T11:45:00Z',
      content: 'Patients complain about parking costs too. Maybe we could validate parking for patients with financial hardship?',
      replies: []
    }
  ],
  'idea-015': [
    {
      id: 'c15-1',
      author: 'Sarah Johnson',
      department: 'Nursing - Medical/Surgical',
      createdAt: '2025-11-01T16:20:00Z',
      content: 'Fall prevention is critical! We need better bed alarms and patient monitoring. I\'ve seen too many preventable falls.',
      replies: [
        {
          id: 'c15-1-r1',
          author: 'Dr. Michelle Adams',
          department: 'Clinical Excellence/Quality',
          createdAt: '2025-11-01T17:00:00Z',
          content: 'Thank you! I\'m working with Quality to pilot new fall prevention protocols. Your input would be valuable.',
          replies: []
        }
      ]
    },
    {
      id: 'c15-2',
      author: 'Michael Chen',
      department: 'IT',
      createdAt: '2025-11-02T10:30:00Z',
      content: 'Could we use wearable sensors to predict falls? I\'ve read about hospitals using this technology successfully.',
      replies: []
    }
  ],
  'idea-047': [
    {
      id: 'c47-1',
      author: 'Dr. Robert Kim',
      department: 'Emergency Department',
      createdAt: '2025-11-05T11:00:00Z',
      content: 'Clinic wait times are unacceptable! We need better scheduling algorithms or more providers. Patients are frustrated and so are we.',
      replies: [
        {
          id: 'c47-1-r1',
          author: 'Dr. Jennifer Lee',
          department: 'Process Improvement',
          createdAt: '2025-11-05T11:45:00Z',
          content: 'I\'ve been analyzing our scheduling data. We could reduce wait times by 40% with better appointment spacing and buffer times.',
          replies: []
        }
      ]
    },
    {
      id: 'c47-2',
      author: 'Amanda Foster',
      department: 'Patient Experience',
      createdAt: '2025-11-05T14:20:00Z',
      content: 'Patient satisfaction scores are dropping because of wait times. This needs to be a priority for leadership.',
      replies: []
    }
  ]
}
