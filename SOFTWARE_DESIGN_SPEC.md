# ContosoHealth Innovation Platform - Software Design Specification

## Executive Summary

The ContosoHealth Innovation Platform is an AI-powered innovation management system designed to capture, analyze, prioritize, and track healthcare innovation ideas across ContosoHealth's 55 hospitals. The platform replaces the existing SharePoint-based form with an intelligent system that provides real-time AI analysis, social collaboration features, gamification, and executive dashboards for portfolio management.

## 1. System Overview

### 1.1 Purpose
Transform ContosoHealth's innovation submission process from a static SharePoint form into an intelligent platform that:
- Captures innovation ideas from 5,000+ healthcare staff
- Provides AI-powered analysis and recommendations
- Enables social collaboration and idea refinement
- Gamifies engagement to drive participation
- Delivers executive dashboards for strategic decision-making
- Tracks ideas from submission through implementation

### 1.2 Key Stakeholders
- **Submitters**: Clinical and administrative staff (nurses, doctors, technicians, administrators)
- **Reviewers**: Department managers and innovation champions
- **Executives**: Senior leadership making investment decisions
- **IT Team**: Platform administrators and maintainers

### 1.3 Success Metrics
- 3x increase in idea submissions (from ~700/year to 2,100/year)
- 80% of ideas receive AI analysis within 5 seconds
- 60% engagement rate (votes, comments, collaboration)
- 40% reduction in time-to-decision for high-value ideas
- $10M+ in identified ROI opportunities within first year

## 2. Architecture

### 2.1 Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Vite build system
- Tailwind CSS for styling (dark theme)
- Lucide React for icons
- Deployed on Cloudflare Pages

**Backend:**
- FastAPI (Python 3.11+)
- Azure Cosmos DB (NoSQL, serverless)
- Poetry for dependency management
- Deployed on Fly.io

**AI Services:**
- Azure OpenAI Service (GPT-4o, O3 models)
- Azure OpenAI Sora (video generation)
- Custom AI agents for analysis

**Infrastructure:**
- Azure Cosmos DB (West US 2)
- Azure OpenAI endpoints (Sweden Central, pharma-agents-jnj)
- Cloudflare CDN and edge network

### 2.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Staff View   │  │ Manager View │  │ Executive    │      │
│  │ - Submit     │  │ - Review     │  │ Dashboard    │      │
│  │ - Browse     │  │ - Approve    │  │ - Analytics  │      │
│  │ - Collaborate│  │ - Assign     │  │ - Portfolio  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│                    FastAPI Backend                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ REST API Endpoints                                    │   │
│  │ - /api/ideas (CRUD)                                  │   │
│  │ - /api/comments (threads)                            │   │
│  │ - /api/agents/* (AI analysis)                        │   │
│  │ - /api/categories (taxonomy)                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ AI Agents    │  │ Gamification │  │ Workflow     │      │
│  │ - Analysis   │  │ - Points     │  │ - Approval   │      │
│  │ - Detection  │  │ - Badges     │  │ - Routing    │      │
│  │ - Video Gen  │  │ - Rewards    │  │ - Tracking   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Cosmos DB    │  │ Azure OpenAI │  │ Azure Sora   │      │
│  │ - Ideas      │  │ - GPT-4o     │  │ - Video Gen  │      │
│  │ - Comments   │  │ - O3 Model   │  │              │      │
│  │ - Users      │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 3. Data Model

### 3.1 Cosmos DB Containers

**Container: ideas**
- Partition Key: `/categoryType`
- Schema:
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "problemStatement": "string",
  "proposedSolution": "string",
  "expectedBenefit": "string",
  "submitterId": "string",
  "submitterName": "string",
  "submitterDepartment": "string",
  "submitterRole": "string",
  "categoryType": "string",
  "categoryArea": "string",
  "strategicAlignment": "number (1-5)",
  "impactPatient": "string (High/Medium/Low)",
  "impactStaff": "string (High/Medium/Low)",
  "impactEfficiency": "string (High/Medium/Low)",
  "impactQuality": "string (High/Medium/Low)",
  "complexityAssessment": "string (High/Medium/Low)",
  "timelineEstimate": "string",
  "aiRecommendations": "string[]",
  "similarIdeaIds": "string[]",
  "status": "string (submitted/under_review/approved/in_progress/implemented/declined)",
  "votes": "number",
  "commentCount": "number",
  "collaboratorIds": "string[]",
  "tags": "string[]",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "executiveData": {
    "costSavingsLow": "number",
    "costSavingsHigh": "number",
    "revenueOpportunityLow": "number",
    "revenueOpportunityHigh": "number",
    "implementationCostLow": "number",
    "implementationCostHigh": "number",
    "roi3Year": "number",
    "paybackMonths": "number",
    "riskTechnical": "number (1-5)",
    "riskOperational": "number (1-5)",
    "riskFinancial": "number (1-5)",
    "resourcesFTE": "string",
    "confidenceLevel": "string (Low/Medium/High)"
  }
}
```

**Container: comments**
- Partition Key: `/ideaId`
- Schema:
```json
{
  "id": "uuid",
  "ideaId": "string",
  "userId": "string",
  "userName": "string",
  "userRole": "string",
  "content": "string",
  "parentCommentId": "string | null",
  "threadDepth": "number",
  "votes": "number",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Container: users**
- Partition Key: `/department`
- Schema:
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "department": "string",
  "role": "string",
  "hospital": "string",
  "points": "number",
  "badges": "string[]",
  "ideasSubmitted": "number",
  "ideasCollaborated": "number",
  "commentsPosted": "number",
  "votesGiven": "number",
  "rewardsEarned": "object[]",
  "createdAt": "timestamp",
  "lastActiveAt": "timestamp"
}
```

**Container: agent_analyses**
- Partition Key: `/ideaId`
- Schema:
```json
{
  "id": "uuid",
  "ideaId": "string",
  "agent1_system_context": "object",
  "agent2_solution_discovery": "object",
  "agent3_architecture": "object",
  "agent4_feasibility": "object",
  "agent5_video_prompt": "string",
  "sora_job_id": "string",
  "sora_status": "string",
  "sora_video_url": "string",
  "completedCount": "number",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 4. AI Agents

### 4.1 Agent 1: System Context Analyzer
**Purpose**: Detect healthcare systems and technologies mentioned in the idea

**Input**: Idea title + description

**Output**:
```json
{
  "systems": [
    {"system": "Epic EHR", "confidence": 0.95},
    {"system": "Azure AI", "confidence": 0.88}
  ]
}
```

**Model**: GPT-4o (fast, cost-effective)

### 4.2 Agent 2: Solution Discovery
**Purpose**: Identify existing solutions and best practices

**Input**: Idea details + detected systems

**Output**:
```json
{
  "existingSolutions": ["Solution A", "Solution B"],
  "bestPractices": ["Practice 1", "Practice 2"],
  "vendors": ["Vendor X", "Vendor Y"]
}
```

**Model**: GPT-4o with web search capability

### 4.3 Agent 3: Architecture Generator
**Purpose**: Propose technical architecture for implementation

**Input**: Idea details + systems + solutions

**Output**:
```json
{
  "architecture": "Detailed architecture description",
  "components": ["Component 1", "Component 2"],
  "integrations": ["Epic API", "Azure Services"]
}
```

**Model**: O3 (reasoning model for complex technical design)

### 4.4 Agent 4: Feasibility Scorer
**Purpose**: Assess feasibility and generate risk/return analysis

**Input**: All previous agent outputs + idea details

**Output**:
```json
{
  "feasibilityScore": 85,
  "strategicAlignment": 4,
  "impactScores": {
    "patient": "High",
    "staff": "Medium",
    "efficiency": "High",
    "quality": "High"
  },
  "complexityAssessment": "Medium",
  "timelineEstimate": "6-9 months",
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "executiveAnalysis": {
    "costSavingsLow": 150000,
    "costSavingsHigh": 300000,
    "implementationCostLow": 75000,
    "implementationCostHigh": 125000,
    "roi3Year": 650000,
    "paybackMonths": 5,
    "riskTechnical": 3,
    "riskOperational": 2,
    "riskFinancial": 2,
    "confidenceLevel": "Medium"
  }
}
```

**Model**: O3 (reasoning model for complex analysis)

### 4.5 Agent 5: Video Prompt Generator
**Purpose**: Create compelling Sora video prompts for idea visualization

**Input**: Idea details + systems + analysis

**Output**: Detailed scene-by-scene video prompt (500-1000 words)

**Model**: O3 (creative reasoning for visual storytelling)

**Integration**: Output sent to Azure OpenAI Sora API for video generation

## 5. User Interfaces

### 5.1 Staff View (Submitters)

**Dashboard**
- Personal stats (ideas submitted, points earned, badges)
- Top ideas by engagement (filtered by department by default)
- Success stories (ideas that became projects)
- Quick submit button

**Browse Ideas**
- Search and filter by category, department, status
- Sort by votes, date, strategic alignment
- Card view with key metrics (votes, comments, impact)
- "Add to This Idea" collaboration button
- Threaded comments and discussions

**Submit Idea Form**
- Simple, guided form (5-7 fields)
- Real-time AI suggestions as user types
- Duplicate detection with collaboration prompts
- Submit triggers immediate AI analysis (5-10 seconds)

**Idea Detail View**
- Full idea description
- AI analysis results (public fields only):
  - Strategic alignment score
  - Impact ratings (patient, staff, efficiency, quality)
  - Complexity assessment
  - Timeline estimate (general)
  - AI recommendations
  - Similar ideas for collaboration
- Threaded comments
- Vote buttons
- "Add to This Idea" collaboration request

**Leaderboard**
- Top contributors by points
- Badge showcase
- Reward redemption (Starbucks/Amazon gift cards)

**Success Stories**
- Feed of ideas that became projects
- Before/after metrics
- Recognition for submitters and collaborators

### 5.2 Executive View

**Portfolio Dashboard**
- Key metrics:
  - Total ideas submitted (trend)
  - Ideas by category (distribution)
  - Engagement rate (votes, comments)
  - Total identified ROI ($XXM)
  - Ideas by status (funnel)
  - Department participation rates

**Value-Based Prioritization**
- Bubble chart: ROI (Y) vs Implementation Time (X), size = Investment
- Filters: Category, Risk Level, FY Quarter, Strategic Priority
- Table: Top 20 ideas by Net 3-Year Value

**Resource Planning**
- Capacity heatmap: FTE availability by department/quarter
- Budget tracker: Committed vs Available by cost bucket
- Pipeline value: $XXM in potential savings by stage

**Risk & Feasibility Matrix**
- 2x2 grid: Risk vs Return with idea clustering
- Dependency tracker: Ideas blocked by budget/resources/technology
- Quick wins: <3 month timeline, >$100K return, low risk

**Strategic Alignment**
- Portfolio balance: % of ideas by category vs strategic priorities
- Innovation themes: Word cloud of trending topics
- Correlation to existing projects
- Energy/traction indicators (where engagement is high)

**Idea Detail View (Executive)**
- All staff view fields PLUS:
  - Financial analysis:
    - Annual cost savings range
    - Implementation cost range
    - Net 3-year value
    - Payback period
    - Confidence level
  - Risk profile:
    - Technical risk score (1-5)
    - Operational risk score (1-5)
    - Financial risk score (1-5)
    - Risk factors and mitigation
  - Resource requirements:
    - Budget range
    - FTE breakdown by role
    - Technology dependencies
    - Vendor requirements
  - Capacity check:
    - IT bandwidth availability
    - Azure budget availability
    - Infrastructure capacity

## 6. Gamification System

### 6.1 Points System
- Submit idea: 100 points
- Idea receives 10+ votes: 50 points
- Comment on idea: 10 points
- Collaborate on idea: 25 points
- Idea moves to "In Progress": 200 points
- Idea implemented: 500 points

### 6.2 Badges
- **Visionary** (100 points): First badge
- **Innovator** (500 points): Active contributor
- **Collaborator** (50 comments/collaborations): Team player
- **Trailblazer** (1,000 points): Top contributor
- **Game Changer** (Idea implemented): Real impact
- **Department Champion** (Most points in department): Leader

### 6.3 Tangible Rewards
- **Bronze Tier** (500 points): $10 Starbucks gift card
- **Silver Tier** (1,000 points): $25 Amazon gift card
- **Gold Tier** (2,500 points): $50 Amazon gift card
- **Platinum Tier** (5,000 points): $100 Amazon gift card + recognition

### 6.4 Leaderboard
- Overall top 10 contributors
- Department-specific leaderboards
- Monthly and all-time rankings
- Badge showcase

## 7. Social Features

### 7.1 Voting
- Upvote/downvote on ideas
- Vote count displayed prominently
- Sorting by vote count

### 7.2 Threaded Comments
- Multi-level comment threads
- Reply to specific comments
- Vote on comments
- @mentions for notifications

### 7.3 Collaboration
- "Add to This Idea" button on similar ideas
- Collaboration requests sent to original submitter
- Co-creator recognition and shared points
- Merged idea tracking

### 7.4 Similar Idea Detection
- AI-powered similarity matching
- Displayed during submission
- Encourages collaboration over duplication

## 8. Security & Privacy

### 8.1 Role-Based Access Control (RBAC)

**Staff Role:**
- Read: All ideas, comments, public analysis fields
- Create: Ideas, comments, votes
- Update: Own ideas (before review), own comments
- Cannot see: Financial data, executive analysis fields

**Manager Role:**
- All Staff permissions PLUS:
- Read: Risk assessments (qualitative)
- Update: Idea status, assign reviewers
- Cannot see: Financial data, budget estimates

**Executive Role:**
- Full read access to all fields including financial data
- Approve/reject decisions
- Portfolio prioritization controls

### 8.2 Data Protection
- Field-level security in Cosmos DB
- Executive data fields restricted by role
- API endpoints enforce role-based filtering
- Audit logging for sensitive operations

### 8.3 Authentication
- Azure AD integration (future)
- For demo: Persona dropdown (no auth)
- Session management
- Secure token handling

## 9. Integration Points

### 9.1 Azure OpenAI Service
- Endpoint: pharma-agents-jnj-resource
- Models: GPT-4o, O3
- API Version: 2024-12-01-preview
- Rate limiting: 10 requests/second
- Error handling: Fallback to rule-based analysis

### 9.2 Azure OpenAI Sora
- Endpoint: Sweden Central
- Video generation: 5-second clips
- Async job model with polling
- Status tracking: submitted → processing → succeeded
- Video URL resolution via AI Foundry API

### 9.3 Cosmos DB
- Connection: Serverless, West US 2
- Consistency: Session (default)
- Partitioning: By category, ideaId, department
- Indexing: All fields for flexible queries
- Backup: Continuous (7-day retention)

## 10. API Endpoints

### 10.1 Ideas
- `GET /api/ideas` - List all ideas (with filters)
- `GET /api/ideas/{id}` - Get idea details
- `POST /api/ideas` - Create new idea
- `PUT /api/ideas/{id}` - Update idea
- `DELETE /api/ideas/{id}` - Delete idea
- `POST /api/ideas/{id}/vote` - Vote on idea

### 10.2 Comments
- `GET /api/ideas/{id}/comments` - Get comments for idea
- `POST /api/ideas/{id}/comments` - Add comment
- `POST /api/comments/{id}/reply` - Reply to comment
- `POST /api/comments/{id}/vote` - Vote on comment

### 10.3 AI Agents
- `POST /api/agents/system-context` - Detect systems
- `POST /api/agents/solution-discovery` - Find solutions
- `POST /api/agents/architecture` - Generate architecture
- `POST /api/agents/feasibility` - Score feasibility
- `POST /api/agents/sora-video` - Generate video
- `GET /api/agents/sora-status/{job_id}` - Check video status

### 10.4 Categories & Taxonomy
- `GET /api/categories` - Get all categories
- `GET /api/departments` - Get all departments
- `GET /api/tags` - Get popular tags

### 10.5 Users & Gamification
- `GET /api/users/{id}` - Get user profile
- `GET /api/users/{id}/points` - Get user points
- `GET /api/users/{id}/badges` - Get user badges
- `GET /api/leaderboard` - Get leaderboard
- `POST /api/rewards/redeem` - Redeem reward

### 10.6 Analytics (Executive)
- `GET /api/analytics/portfolio` - Portfolio metrics
- `GET /api/analytics/roi` - ROI analysis
- `GET /api/analytics/engagement` - Engagement metrics
- `GET /api/analytics/departments` - Department breakdown

## 11. Deployment Architecture

### 11.1 Frontend Deployment
- Platform: Cloudflare Pages
- Build: Vite production build
- CDN: Global edge network
- URL: https://innovation-idea-platform-j3ud0429.devinapps.com
- Auto-deploy: On git push to main

### 11.2 Backend Deployment
- Platform: Fly.io
- Runtime: Python 3.11 + FastAPI
- Regions: US East (primary)
- Scaling: Auto-scale 1-10 instances
- Health checks: /healthz endpoint

### 11.3 Database
- Azure Cosmos DB (Serverless)
- Region: West US 2
- Backup: Continuous (7-day retention)
- Monitoring: Azure Monitor

### 11.4 Environment Variables
**Backend (.env):**
```
COSMOS_ENDPOINT=https://cosmosah.documents.azure.com:443/
COSMOS_KEY=<redacted>
COSMOS_DATABASE=ahidea
AZURE_OPENAI_ENDPOINT=https://pharma-agents-jnj-resource.cognitiveservices.azure.com
AZURE_OPENAI_API_KEY=<redacted>
AZURE_OPENAI_DEPLOYMENT_O3=o3
AZURE_OPENAI_DEPLOYMENT_GPT4O=gpt-4o
AZURE_OPENAI_API_VERSION=2024-12-01-preview
SORA_ENDPOINT=https://grego-m5vgi1oz-swedencentral.cognitiveservices.azure.com/openai/v1/video/generations/jobs
SORA_API_KEY=<redacted>
```

**Frontend (.env.production):**
```
VITE_API_URL=https://contosohealth-backend.fly.dev
```

## 12. Performance Requirements

### 12.1 Response Times
- Page load: < 2 seconds
- AI analysis: < 10 seconds
- API calls: < 500ms (p95)
- Video generation: < 60 seconds

### 12.2 Scalability
- Support 5,000 concurrent users
- Handle 100 ideas/day
- Process 1,000 AI analyses/day
- Store 10,000+ ideas

### 12.3 Availability
- Uptime: 99.5% (excluding maintenance)
- Planned maintenance: Monthly, off-hours
- Disaster recovery: 24-hour RTO

## 13. Testing Strategy

### 13.1 Unit Tests
- Backend: pytest for API endpoints
- Frontend: Vitest for components
- Coverage target: 70%

### 13.2 Integration Tests
- API integration tests
- Database integration tests
- AI agent integration tests

### 13.3 End-to-End Tests
- User flows (submit, browse, comment)
- AI analysis pipeline
- Video generation workflow

### 13.4 Performance Tests
- Load testing: 1,000 concurrent users
- Stress testing: Peak load scenarios
- AI response time benchmarks

## 14. Monitoring & Observability

### 14.1 Application Monitoring
- Backend logs: Fly.io logs
- Frontend errors: Browser console
- API metrics: Request count, latency, errors

### 14.2 AI Monitoring
- Azure OpenAI usage metrics
- Token consumption tracking
- Model performance (latency, quality)
- Fallback trigger rate

### 14.3 Business Metrics
- Daily active users
- Ideas submitted per day
- Engagement rate (votes, comments)
- AI analysis success rate
- Video generation success rate

## 15. Future Enhancements

### 15.1 Phase 2 (Q2 2026)
- Microsoft Teams integration
- Email notifications
- Mobile app (iOS/Android)
- Advanced search with filters
- Idea templates by category

### 15.2 Phase 3 (Q3 2026)
- Workflow automation (approval routing)
- Project management integration
- Advanced analytics dashboard
- Predictive idea success modeling
- Natural language query interface (Copilot)

### 15.3 Phase 4 (Q4 2026)
- Integration with Epic EHR
- Integration with Workday
- API for external systems
- White-label for other health systems
- Multi-language support

## 16. Success Criteria

### 16.1 Adoption Metrics
- 60% of staff submit at least one idea in first year
- 80% engagement rate (votes/comments on ideas)
- 50% of ideas receive collaboration requests

### 16.2 Quality Metrics
- 90% of ideas receive AI analysis successfully
- 70% of submitters rate AI recommendations as helpful
- 80% of executives use dashboard for decision-making

### 16.3 Business Impact
- $10M+ in identified ROI opportunities
- 40% reduction in time-to-decision
- 25% of ideas move to implementation (vs 10% baseline)
- 5+ success stories showcased per quarter

## 17. Risks & Mitigation

### 17.1 Technical Risks
- **Risk**: Azure OpenAI rate limits
  - **Mitigation**: Implement queuing, caching, fallback logic
- **Risk**: Cosmos DB cost overruns
  - **Mitigation**: Monitor RU consumption, optimize queries
- **Risk**: Sora video generation failures
  - **Mitigation**: Graceful degradation, retry logic

### 17.2 Adoption Risks
- **Risk**: Low user engagement
  - **Mitigation**: Gamification, tangible rewards, success stories
- **Risk**: Poor idea quality
  - **Mitigation**: AI guidance, templates, examples

### 17.3 Security Risks
- **Risk**: Unauthorized access to financial data
  - **Mitigation**: Field-level security, RBAC, audit logging
- **Risk**: Data breach
  - **Mitigation**: Encryption at rest/transit, Azure security

## 18. Glossary

- **Idea**: A submitted innovation proposal
- **Agent**: AI-powered analysis component
- **Executive Data**: Financial and resource fields restricted to leadership
- **Collaboration**: Multiple users working on the same idea
- **Success Story**: Implemented idea showcased to drive engagement
- **Strategic Alignment**: Score (1-5) indicating fit with organizational priorities
- **ROI**: Return on Investment (3-year net value)
- **Payback Period**: Months to recover implementation cost
- **Risk Score**: Technical, operational, or financial risk rating (1-5)

---

**Document Version**: 1.0  
**Last Updated**: November 5, 2025  
**Author**: Devin AI  
**Reviewers**: Gregory Katz (Microsoft), ContosoHealth Leadership
