# ContosoHealth Innovation Platform

A comprehensive healthcare innovation management platform that empowers staff to submit ideas, collaborate with colleagues, and see their innovations transform into real projects that improve patient care.

## Overview

The ContosoHealth Innovation Platform is a modern, AI-powered solution designed to capture, analyze, and implement healthcare innovations from frontline staff across all 55 ContosoHealth hospitals. The platform features dual-persona views (Staff and Executive), social collaboration tools, gamification, and comprehensive success tracking.

## Key Features

### 🎯 Dual-Persona Experience

The platform provides tailored experiences for different user types:

- **Staff View**: Focuses on quality improvements, patient benefits, and practical impact in layman's terms
- **Executive View**: Displays financial metrics, ROI calculations, cost savings, and strategic alignment

Users can seamlessly toggle between views using the persona dropdown in the header.

### 💡 50 Diverse Healthcare Ideas

The platform includes 50 realistic healthcare innovation ideas submitted by hospital staff across various categories:

- **Process Improvement**: Streamlining workflows and reducing inefficiencies
- **Clinical Excellence/Quality**: Enhancing patient safety and care quality
- **Patient Experience Enhancement**: Improving patient and family satisfaction
- **Technology/Digital Innovation**: Leveraging technology for better outcomes
- **Workforce/Culture**: Supporting staff wellbeing and retention
- **Facilities/Infrastructure**: Optimizing physical environments
- **Cost Reduction/Revenue Optimization**: Financial sustainability
- **Regulatory/Compliance**: Meeting standards and requirements

Each idea includes:
- Realistic problem statements in layman's terms
- Proposed solutions from frontline staff perspective
- Expected benefits and impact
- AI-powered analysis and recommendations
- Community engagement (upvotes, comments, threaded discussions)
- Profile photos for professional appearance

### 🤝 Social Collaboration Features

The platform encourages community engagement and collaboration:

- **Voting System**: Upvote/downvote ideas to help prioritize
- **Comments & Discussions**: Threaded conversations with profile photos
- **"Add to This Idea" Button**: Quick collaboration on existing ideas
- **Similar Idea Detection**: AI suggests related ideas for collaboration
- **Multi-Nurse Collaboration**: Multiple staff members can contribute to refining ideas

### 🎮 Gamification & Rewards

Motivate participation through a comprehensive points and rewards system:

**Points Rubric:**
- 🏆 Winning Idea (Fully Implemented): 100 points
- ⭐ Partial Credit (Contributed to Solution): 50 points
- 💡 Idea Submission: 10 points
- 🤝 Collaboration: 5 points
- 👍 Engagement (Voting): 1 point

**Badges:**
- Innovator (submit ideas)
- Collaborator (engage with community)
- Additional badges unlock as users contribute

**Tangible Rewards:**
- $10 Starbucks Gift Card (150 points)
- $25 Starbucks Gift Card (300 points)
- $25 Amazon Gift Card (350 points)
- $50 Amazon Gift Card (500 points)
- Movie Tickets (400 points)
- $100 Restaurant Gift Card (750 points)

### 📊 Success Stories

Showcase implemented ideas with complete journey narratives:

**Journey Timeline:**
1. **How It Started**: Original submission from staff member
2. **How It Grew**: Community engagement and refinement
3. **ContosoHealth Took Action**: Project launch and implementation
4. **Timeline**: Detailed timeline from submission to rollout

**Dual-Persona Impact Metrics:**

**Staff View:**
- Quality improvements in layman's terms
- Patient and family benefits
- Staff satisfaction improvements

**Executive View:**
- Cost savings and revenue impact
- Efficiency gains and ROI calculations
- Strategic value and alignment to Vision 2030
- Implementation costs and scale projections

### 🏆 Leaderboard

Track top contributors with:
- Points rankings
- Idea submission counts
- Collaboration metrics
- Winning and partial credit ideas
- Profile photos for professional appearance
- Badge displays

### 🔍 Browse & Search

Powerful discovery features:
- Search across all 50 ideas
- Filter by category (8 categories)
- Sort by engagement, date, or relevance
- View idea cards with key metrics
- Click to view detailed idea with full discussion

### 📝 Simple Idea Submission

Quick and easy submission form:
- Title and description
- Problem statement
- Proposed solution
- Expected benefits
- Category selection
- Minimal time investment (2-3 minutes)

### 🤖 AI-Powered Analysis - 4 Intelligent Agents

The platform features 4 AI agents that automatically analyze every submitted idea:

#### Agent 1: System Context Engine
**Purpose:** Real-time detection of ContosoHealth systems mentioned in ideas

**Capabilities:**
- Detects systems from keywords (Epic, Pyxis, Snowflake, Workday, ServiceNow, Azure, Power Platform, Sora)
- Provides integration cost estimates ($5K-$50K per system)
- Identifies timeline requirements (2-12 weeks typical)
- Connects to subject matter experts (SMEs)
- Enriches ideas with system profiles

**Example:** Detects "Epic EHR" from idea text → Returns integration cost ($50K), timeline (12 weeks), SME (Sarah Chen)

#### Agent 2: Solution Architecture Generator
**Purpose:** Creates implementation blueprints with cost/timeline estimates

**Capabilities:**
- Generates phased implementation plans (Discovery, Design, Development, Testing, Deployment)
- Calculates total costs based on detected systems
- Estimates timeline with phase breakdown
- Identifies key risks and prerequisites
- **[Sora Enhancement]** Generates 10-30 second demo videos of proposed solutions

**Output:** Complete architecture with phases, costs ($50K-$200K), timeline (12-40 weeks), systems involved, risks

#### Agent 3: Feasibility Scorer
**Purpose:** Multi-dimensional scoring with transparent reasoning

**Scoring Dimensions:**
- **Technical (1-10):** Integration complexity, API availability
- **Operational (1-10):** Change management, workflow disruption
- **Financial (1-10):** ROI, payback period, budget fit
- **Strategic (1-10):** Alignment with ContosoHealth priorities

**Output:** Overall score (1-10), dimension breakdown with reasoning, recommendation (APPROVE/REVIEW/DEFER), confidence level

#### Agent 4: Internal Solution Discovery
**Purpose:** Find similar solutions already implemented at other ContosoHealth hospitals

**Capabilities:**
- Searches pain points database for similar problems
- Identifies existing solutions at Orlando, Tampa, Celebration hospitals
- Calculates replication cost vs building new
- Connects submitters with mentors who built similar solutions
- Provides proven results and ROI data

**Example:** Finds 94% match for medication tracking → Shows $125K savings by replicating vs building new

#### Sora Video Generation (APP-008)
**Purpose:** Auto-generate visual demos of proposed healthcare solutions

**Use Cases:**
- **Idea Visualization:** 10-30 second demo videos showing proposed solution in action
- **Training Materials:** Auto-generate training videos for solution rollouts
- **Success Stories:** Create before/after comparison videos
- **Executive Presentations:** Video montages of top ideas

**Implementation:**
- Azure OpenAI Sora endpoint: Sweden Central region
- Healthcare-specific prompt templates (medication tracking, patient portal, generic)
- Cost: ~$0.50 per 10-second video (~$1,250/year for 500 ideas)
- Context-aware prompts based on detected systems

**Dual-Persona AI Analysis:**
- **Staff View**: Strategic alignment, impact ratings, complexity, recommendations, detected systems
- **Executive View**: All staff view data PLUS financial estimates, ROI projections, resource requirements, risk scores, systems involved

## Screenshots

### End-to-End Testing Workflow

The ContosoHealth Innovation Platform was tested end-to-end by submitting a patient intake idea and verifying all 5 AI agents executed successfully with Azure OpenAI integration.

#### 1. Staff Dashboard with Expandable Comments and Inline Video
![Dashboard with Comments](./screenshots/dashboard-expandable-comments.png)
*Dashboard showing top ideas by engagement with expandable comment threads and inline Sora video players*

#### 2. Success Stories with Inline Video Players
![Success Stories with Videos](./screenshots/success-stories-videos.png)
*Success Stories showcasing 3 implemented ideas with inline Sora-generated demo videos*

#### 3. Executive View with Strategic Analytics
![Executive View](./screenshots/executive-view-analytics.png)
*Executive Dashboard showing risk assessment, sentiment analysis, maturity pipeline, and action items*

#### 4. Browse Ideas
![Browse Ideas](./screenshots/browse-ideas.png)
*Browse all 55 healthcare innovation ideas with search, filters, and engagement metrics*

#### 5. AI Agent Analysis Results
![AI Analysis](./screenshots/ai-agent-analysis.png)
*Complete AI analysis showing all 5 agents: System Context, Architecture Generator, Feasibility Scorer, Solution Discovery, and Sora Video Generation*

### Key Features Demonstrated

**Social Collaboration:**
- Expandable comment threads with nested replies
- Upvote functionality on idea cards
- Discussion threads showing author, department, and timestamps
- "Watch Demo" buttons for ideas with Sora videos

**AI-Powered Analysis:**
- All 5 AI agents working in real-time with Azure OpenAI
- System Context Engine detecting ContosoHealth systems (Epic, Pyxis, Azure, etc.)
- Solution Architecture Generator creating implementation blueprints
- Feasibility Scorer providing multi-dimensional scoring
- Internal Solution Discovery finding similar solutions at other hospitals
- Sora Video Generation creating AI-generated demo videos

**Executive View Enhancements:**
- Risk Assessment & Mitigation (50 medium-risk ideas analyzed)
- Department Sentiment & Excitement (86.8/100 overall excitement)
- Category Sentiment Analysis (all categories "Very Positive")
- Innovation Maturity Pipeline ($27.7M total value across 6 stages)
- Executive Action Items (4 prioritized actions worth $72.5M)
- Historical Solutions from ContosoHealth Network (6 proven solutions)
- Enhanced AI Executive Summary with Vision 2030 alignment

**Sora Video Integration:**
- 3 Sora-generated videos added to top ideas (idea-014, idea-018, idea-047)
- Inline video players in both Dashboard and Success Stories
- Videos demonstrate proposed solutions in action
- Integration with Azure AI Foundry for video generation and tracking

## Technology Stack

### Frontend
- **React 18+** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern dark theme styling
- **shadcn/ui** for accessible UI components
- **Lucide React** for icons

### Backend
- **FastAPI** (Python) for REST API
- **aiosqlite** for async SQLite database operations
- **CORS** enabled for local development and deployment

### AI Integration
- **Azure OpenAI** (o3 model) for intelligent analysis
- Dual-output prompts for persona-aware content
- Real-time idea analysis and recommendations

### Database
- **SQLite** for local development
- Structured schema for ideas, users, comments, votes
- Field-level security for executive-only data

### Deployment
- Frontend: Static web hosting (Vercel, Netlify, Azure Static Web Apps)
- Backend: FastAPI server on cloud platform
- Database: SQLite (can migrate to PostgreSQL/Azure SQL for production)

## Project Structure

```
contosohealth-innovation-platform/
├── contosohealth-innovation-demo/          # Frontend React application
│   ├── public/
│   │   └── avatars/                       # Profile photos (20 images)
│   ├── src/
│   │   ├── App.tsx                        # Main application component
│   │   ├── App.css                        # Styles
│   │   └── main.tsx                       # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── contosohealth-backend/                  # Backend FastAPI application
│   ├── app/
│   │   └── main.py                        # FastAPI server
│   ├── .env                               # Environment variables (Azure OpenAI)
│   ├── load_50_ideas.py                   # Script to load 50 ideas into database
│   ├── migrate_data.py                    # Database migration script
│   └── contosohealth_ideas.db              # SQLite database
├── docs/                                  # Documentation
│   ├── Software-Design-Specification.md
│   ├── Team-Roles-Summary.md
│   └── ContosoHealth-Innovation-Platform-Software-Description.md
├── 50-diverse-healthcare-ideas.json       # 50 realistic healthcare ideas
└── README.md                              # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Azure OpenAI API access (for AI features)

### Frontend Setup

```bash
cd contosohealth-innovation-demo
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd contosohealth-backend
pip install fastapi uvicorn aiosqlite python-dotenv openai
python -m uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`

### Load Demo Data

```bash
cd contosohealth-backend
python load_50_ideas.py
```

This will populate the database with 50 diverse healthcare innovation ideas.

### Environment Variables

Create a `.env` file in `contosohealth-backend/` with:

```
AZURE_OPENAI_ENDPOINT=your-endpoint-here
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=o3
AZURE_OPENAI_API_VERSION=2025-01-01-preview
```

## Key Design Decisions

### 1. Dual-Persona Architecture

The platform uses a single codebase with persona-aware rendering:
- Staff users see quality and impact in layman's terms
- Executives see financial metrics and ROI
- Backend enforces field-level security
- Frontend conditionally renders based on persona state

### 2. Realistic Healthcare Scenarios

All 50 ideas are written from the perspective of real hospital staff:
- Nurses, doctors, transport staff, environmental services
- Real pain points in layman's terms (not technical jargon)
- Varying quality levels (high/medium/spark) for realistic AI processing
- Varying engagement levels (0-89 upvotes, 0-31 comments)

### 3. Social Features First

The platform prioritizes community engagement:
- Visible voting and comment counts
- Profile photos throughout for personal connection
- "Add to This Idea" button for easy collaboration
- Threaded discussions for detailed conversations

### 4. Gamification for Motivation

Points and rewards drive participation:
- Clear rubric showing how to earn points
- Tangible rewards (gift cards) not just badges
- Leaderboard showcasing top contributors
- Progress tracking in sidebar

### 5. Success Stories as Feedback Loop

Implemented ideas are showcased to demonstrate impact:
- Complete journey from submission to implementation
- Dual-persona impact metrics
- Links back to original idea submissions
- Proof that "we are listening and acting"

## Demo Features

This is a fully functional demo with:
- ✅ 50 realistic healthcare innovation ideas
- ✅ Dual-persona views (Staff/Executive)
- ✅ Social features (voting, comments, collaboration)
- ✅ Gamification (points, badges, rewards)
- ✅ Success stories with complete journey narratives
- ✅ AI-powered analysis (Azure OpenAI integration)
- ✅ Profile photos throughout (20 real images)
- ✅ Dark theme modern UI
- ✅ Responsive design
- ✅ Search and filtering
- ✅ Leaderboard and stats

## Future Enhancements

### Phase 2 (Pilot)
- Authentication with Entra ID
- Role-based access control
- Email notifications
- Mobile app (React Native)

### Phase 3 (Scale)
- Deploy to all 55 hospitals
- Integration with Epic EHR
- Advanced analytics dashboard
- Workflow automation (approval routing)

### Phase 4 (Enterprise)
- Project management integration
- Budget tracking
- Resource allocation
- Executive reporting suite

## Azure Consumption Impact

**Demo/Pilot Phase:**
- Azure OpenAI API calls: ~$500/month
- Static Web App hosting: ~$10/month
- Azure SQL/Dataverse: ~$200/month

**At Scale (55 hospitals, 5,000 active users):**
- Azure OpenAI: ~$5K-8K/month
- Dataverse capacity: ~$2K/month
- App Service/hosting: ~$500/month
- **Annual run rate: ~$90K-120K Azure consumption**

This aligns with ContosoHealth's Apps & AI bucket for FY26 planning.

## Support & Documentation

- **Software Design Specification**: See `docs/Software-Design-Specification.md`
- **Team Roles Summary**: See `docs/Team-Roles-Summary.md`
- **Software Description**: See `docs/ContosoHealth-Innovation-Platform-Software-Description.md`

## License

This is a demo application built for ContosoHealth innovation platform evaluation.

## Contact

For questions or feedback, contact:
- Gregory Katz (gregory.katz@microsoft.com)
- GitHub: @gregorykatz_microsoft

---

**Built with ❤️ for ContosoHealth to transform healthcare innovation**
