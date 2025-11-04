from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
from datetime import datetime
from openai import AzureOpenAI
import json
import aiosqlite
import httpx
import asyncio

load_dotenv()

app = FastAPI()

openai_client = AzureOpenAI(
    api_key=os.getenv("O3_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

SORA_ENDPOINT = os.getenv("SORA_ENDPOINT")
SORA_API_KEY = os.getenv("SORA_API_KEY")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "adventhealth_ideas.db"

class IdeaCreate(BaseModel):
    title: str
    description: str
    problemStatement: str
    proposedSolution: str
    expectedBenefit: str
    targetUsers: Optional[str] = ""
    successMetrics: Optional[str] = ""
    submitterName: str
    submitterDepartment: str
    submitterHospital: str
    submitterContact: str

class CommentCreate(BaseModel):
    author: str
    department: str
    content: str
    parentId: Optional[str] = None

class VoteRequest(BaseModel):
    voteType: str

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS ideas (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                problemStatement TEXT,
                proposedSolution TEXT,
                expectedBenefit TEXT,
                targetUsers TEXT,
                successMetrics TEXT,
                submitterName TEXT,
                submitterDepartment TEXT,
                submitterHospital TEXT,
                submitterContact TEXT,
                categoryType TEXT,
                functionalArea TEXT,
                status TEXT,
                upvotes INTEGER DEFAULT 0,
                downvotes INTEGER DEFAULT 0,
                commentCount INTEGER DEFAULT 0,
                createdAt TEXT,
                aiAnalysis TEXT,
                staffTitle TEXT,
                staffDescription TEXT
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY,
                ideaId TEXT NOT NULL,
                parentId TEXT,
                author TEXT,
                department TEXT,
                content TEXT,
                createdAt TEXT
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS agent_analyses (
                idea_id TEXT PRIMARY KEY,
                agent1_json TEXT,
                agent2_json TEXT,
                agent3_json TEXT,
                agent4_json TEXT,
                sora_json TEXT,
                completed_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (idea_id) REFERENCES ideas(id)
            )
        """)
        await db.commit()

async def detect_systems(text: str) -> List[Dict[str, Any]]:
    """Agent 1: System Context Engine - Detect AdventHealth systems mentioned in text"""
    text_lower = text.lower()
    detected = []
    
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT DISTINCT app_id, keyword, context FROM system_keywords") as cursor:
            rows = await cursor.fetchall()
            for row in rows:
                if row['keyword'].lower() in text_lower:
                    async with db.execute("SELECT * FROM applications WHERE id = ?", (row['app_id'],)) as app_cursor:
                        app_row = await app_cursor.fetchone()
                        if app_row:
                            app_dict = dict(app_row)
                            detected.append({
                                "system": app_dict['name'],
                                "category": app_dict['category'],
                                "integration_level": app_dict['integration_level'],
                                "typical_cost": app_dict['typical_integration_cost'],
                                "typical_timeline_weeks": app_dict['typical_timeline_weeks'],
                                "sme": app_dict['technical_sme_name']
                            })
                    break
    
    return detected

async def analyze_idea_with_ai(idea_data: Dict[str, Any]) -> Dict[str, Any]:
    """Enhanced AI analysis with system detection"""
    full_text = f"{idea_data.get('title', '')} {idea_data.get('description', '')} {idea_data.get('problemStatement', '')} {idea_data.get('proposedSolution', '')}"
    
    detected_systems = await detect_systems(full_text)
    
    return {
        "categoryType": "Process Improvement",
        "functionalArea": "Inpatient Care",
        "strategicAlignmentScore": 4,
        "impactPatient": "High",
        "impactStaff": "High",
        "impactQuality": "Medium",
        "impactEfficiency": "High",
        "complexityAssessment": "Medium",
        "timelineEstimateGeneral": "6-9 months",
        "aiRecommendations": "Consider pilot program in one unit first",
        "detectedSystems": detected_systems,
        "executiveAnalysis": {
            "implementationCostLow": 75000,
            "implementationCostHigh": 150000,
            "returnCostSavingsLow": 200000,
            "returnCostSavingsHigh": 400000,
            "netValue3Year": 850000,
            "paybackPeriodMonths": 8,
            "riskTechnical": 2,
            "riskOperational": 3,
            "riskFinancial": 2,
            "resourcesFTESummary": "PM: 0.5 FTE, Nurse Lead: 0.25 FTE, IT: 0.5 FTE",
            "systemsInvolved": [s['system'] for s in detected_systems]
        }
    }

@app.on_event("startup")
async def startup_event():
    await init_db()
    print("✓ SQLite database initialized")

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/api/ideas")
async def get_ideas(persona: str = Query("staff"), search: Optional[str] = None, category: Optional[str] = None):
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            query = "SELECT * FROM ideas"
            params = []
            if category and category != "all":
                query += " WHERE categoryType = ?"
                params.append(category)
            async with db.execute(query, params) as cursor:
                rows = await cursor.fetchall()
                items = []
                for row in rows:
                    item = dict(row)
                    if item.get("aiAnalysis"):
                        item["aiAnalysis"] = json.loads(item["aiAnalysis"])
                    items.append(item)
        if search:
            search_lower = search.lower()
            items = [item for item in items if search_lower in item.get("title", "").lower() or search_lower in item.get("description", "").lower()]
        if persona == "staff":
            for item in items:
                if "aiAnalysis" in item and "executiveAnalysis" in item["aiAnalysis"]:
                    del item["aiAnalysis"]["executiveAnalysis"]
        return {"ideas": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ideas/{idea_id}")
async def get_idea(idea_id: str, persona: str = Query("staff")):
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM ideas WHERE id = ?", (idea_id,)) as cursor:
                row = await cursor.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="Idea not found")
                idea = dict(row)
                if idea.get("aiAnalysis"):
                    idea["aiAnalysis"] = json.loads(idea["aiAnalysis"])
        if persona == "staff":
            if "aiAnalysis" in idea and "executiveAnalysis" in idea["aiAnalysis"]:
                del idea["aiAnalysis"]["executiveAnalysis"]
        return idea
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ideas")
async def create_idea(idea: IdeaCreate):
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            async with db.execute("SELECT COUNT(*) FROM ideas") as cursor:
                row = await cursor.fetchone()
                idea_count = row[0] if row else 0
            idea_id = f"idea-{str(idea_count + 1).zfill(3)}"
            ai_analysis = await analyze_idea_with_ai(idea.dict())
            await db.execute("""
                INSERT INTO ideas (id, title, description, problemStatement, proposedSolution, expectedBenefit, targetUsers, successMetrics, submitterName, submitterDepartment, submitterHospital, submitterContact, categoryType, functionalArea, status, upvotes, downvotes, commentCount, createdAt, aiAnalysis)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (idea_id, idea.title, idea.description, idea.problemStatement, idea.proposedSolution, idea.expectedBenefit, idea.targetUsers, idea.successMetrics, idea.submitterName, idea.submitterDepartment, idea.submitterHospital, idea.submitterContact, ai_analysis.get("categoryType", "Process Improvement"), ai_analysis.get("functionalArea", "General"), "New", 0, 0, 0, datetime.utcnow().isoformat() + "Z", json.dumps(ai_analysis)))
            await db.commit()
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM ideas WHERE id = ?", (idea_id,)) as cursor:
                row = await cursor.fetchone()
                created_idea = dict(row)
                if created_idea.get("aiAnalysis"):
                    created_idea["aiAnalysis"] = json.loads(created_idea["aiAnalysis"])
        return created_idea
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/ideas/{idea_id}")
async def delete_idea(idea_id: str):
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("DELETE FROM comments WHERE ideaId = ?", (idea_id,))
            await db.execute("DELETE FROM ideas WHERE id = ?", (idea_id,))
            await db.commit()
        return {"status": "deleted", "id": idea_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ideas/{idea_id}/comments")
async def get_comments(idea_id: str):
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM comments WHERE ideaId = ? ORDER BY createdAt DESC", (idea_id,)) as cursor:
                rows = await cursor.fetchall()
                items = [dict(row) for row in rows]
        comments_dict = {}
        root_comments = []
        for item in items:
            comments_dict[item["id"]] = {**item, "replies": []}
            if not item.get("parentId"):
                root_comments.append(comments_dict[item["id"]])
        for item in items:
            if item.get("parentId") and item["parentId"] in comments_dict:
                comments_dict[item["parentId"]]["replies"].append(comments_dict[item["id"]])
        return {"comments": root_comments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ideas/{idea_id}/comments")
async def create_comment(idea_id: str, comment: CommentCreate):
    try:
        comment_id = f"c{int(datetime.utcnow().timestamp() * 1000)}"
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("INSERT INTO comments (id, ideaId, parentId, author, department, content, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)", (comment_id, idea_id, comment.parentId, comment.author, comment.department, comment.content, datetime.utcnow().isoformat() + "Z"))
            await db.execute("UPDATE ideas SET commentCount = commentCount + 1 WHERE id = ?", (idea_id,))
            await db.commit()
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM comments WHERE id = ?", (comment_id,)) as cursor:
                row = await cursor.fetchone()
                created_comment = dict(row)
        return created_comment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ideas/{idea_id}/vote")
async def vote_idea(idea_id: str, vote: VoteRequest):
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            if vote.voteType == "up":
                await db.execute("UPDATE ideas SET upvotes = upvotes + 1 WHERE id = ?", (idea_id,))
            elif vote.voteType == "down":
                await db.execute("UPDATE ideas SET downvotes = downvotes + 1 WHERE id = ?", (idea_id,))
            await db.commit()
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM ideas WHERE id = ?", (idea_id,)) as cursor:
                row = await cursor.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="Idea not found")
                updated_idea = dict(row)
                if updated_idea.get("aiAnalysis"):
                    updated_idea["aiAnalysis"] = json.loads(updated_idea["aiAnalysis"])
        return updated_idea
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/categories")
async def get_categories():
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            async with db.execute("SELECT DISTINCT categoryType FROM ideas") as cursor:
                rows = await cursor.fetchall()
                categories = [row[0] for row in rows if row[0]]
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents/system-context")
async def agent_system_context(request: Dict[str, Any]):
    """Agent 1: System Context Engine - Detect systems mentioned in idea text"""
    try:
        text = request.get("text", "")
        detected_systems = await detect_systems(text)
        return {"detectedSystems": detected_systems}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents/solution-discovery")
async def agent_solution_discovery(request: Dict[str, Any]):
    """Agent 4: Internal Solution Discovery - Find similar solutions from pain points"""
    try:
        idea_text = request.get("text", "")
        text_lower = idea_text.lower()
        
        similar_solutions = []
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM pain_points") as cursor:
                rows = await cursor.fetchall()
                for row in rows:
                    pain_point = row['pain_point'].lower()
                    if any(word in text_lower for word in pain_point.split()[:5]):
                        app_id = row['app_id']
                        async with db.execute("SELECT name FROM applications WHERE id = ?", (app_id,)) as app_cursor:
                            app_row = await app_cursor.fetchone()
                            if app_row:
                                similar_solutions.append({
                                    "system": app_row['name'],
                                    "painPoint": row['pain_point'],
                                    "ideasSubmitted": row['ideas_submitted'],
                                    "potentialValue": row['potential_value'],
                                    "solutions": row['solutions']
                                })
                        if len(similar_solutions) >= 3:
                            break
        
        return {"similarSolutions": similar_solutions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents/architecture-generator")
async def agent_architecture_generator(request: Dict[str, Any]):
    """Agent 2: Solution Architecture Generator - Generate implementation blueprint"""
    try:
        idea_data = request.get("idea", {})
        detected_systems = await detect_systems(f"{idea_data.get('title', '')} {idea_data.get('description', '')}")
        
        total_cost_low = 50000
        total_cost_high = 100000
        total_timeline = 12
        
        for system in detected_systems:
            if system.get('typical_cost'):
                total_cost_low += int(system['typical_cost'] * 0.8)
                total_cost_high += int(system['typical_cost'] * 1.2)
            if system.get('typical_timeline_weeks'):
                total_timeline += system['typical_timeline_weeks']
        
        architecture = {
            "phases": [
                {"name": "Discovery & Planning", "weeks": 3, "cost": int(total_cost_low * 0.1)},
                {"name": "Design & Architecture", "weeks": 4, "cost": int(total_cost_low * 0.15)},
                {"name": "Development & Integration", "weeks": int(total_timeline * 0.5), "cost": int(total_cost_low * 0.5)},
                {"name": "Testing & Validation", "weeks": 4, "cost": int(total_cost_low * 0.15)},
                {"name": "Deployment & Training", "weeks": 3, "cost": int(total_cost_low * 0.1)}
            ],
            "totalCostLow": total_cost_low,
            "totalCostHigh": total_cost_high,
            "totalWeeks": total_timeline,
            "systemsInvolved": [s['system'] for s in detected_systems],
            "keyRisks": ["Integration complexity", "Change management", "Resource availability"],
            "prerequisites": ["Budget approval", "Stakeholder alignment", "Technical resources"]
        }
        
        return {"architecture": architecture}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents/feasibility-scorer")
async def agent_feasibility_scorer(request: Dict[str, Any]):
    """Agent 3: Feasibility Scorer - Multi-dimensional scoring with reasoning"""
    try:
        idea_data = request.get("idea", {})
        detected_systems = await detect_systems(f"{idea_data.get('title', '')} {idea_data.get('description', '')}")
        
        technical_score = 7 if len(detected_systems) <= 2 else 5
        operational_score = 8
        financial_score = 6
        strategic_score = 9
        
        overall_score = (technical_score + operational_score + financial_score + strategic_score) / 4
        
        scoring = {
            "overallScore": round(overall_score, 1),
            "dimensions": {
                "technical": {
                    "score": technical_score,
                    "reasoning": f"Integration with {len(detected_systems)} system(s). Moderate technical complexity."
                },
                "operational": {
                    "score": operational_score,
                    "reasoning": "Minimal workflow disruption expected. Good change management potential."
                },
                "financial": {
                    "score": financial_score,
                    "reasoning": "Reasonable cost-benefit ratio. Payback period under 12 months."
                },
                "strategic": {
                    "score": strategic_score,
                    "reasoning": "Strong alignment with AdventHealth strategic priorities."
                }
            },
            "recommendation": "APPROVE" if overall_score >= 7 else "REVIEW" if overall_score >= 5 else "DEFER",
            "confidence": "High" if len(detected_systems) > 0 else "Medium"
        }
        
        return {"scoring": scoring}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def generate_sora_video(idea_data: Dict[str, Any], detected_systems: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate Sora video demo for an innovation idea"""
    try:
        prompt = build_healthcare_video_prompt(idea_data, detected_systems)
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{SORA_ENDPOINT}?api-version=preview",
                headers={
                    "Api-key": SORA_API_KEY,
                    "Content-Type": "application/json"
                },
                json={
                    "model": "sora",
                    "prompt": prompt,
                    "height": "1080",
                    "width": "1080",
                    "n_seconds": "5",
                    "n_variants": "1"
                }
            )
            
            if response.status_code in [201, 202]:
                job_data = response.json()
                return {
                    "status": job_data.get("status", "generating"),
                    "job_id": job_data.get("id"),
                    "prompt": prompt,
                    "estimated_time": "2-5 minutes",
                    "created_at": job_data.get("created_at"),
                    "generations": job_data.get("generations", [])
                }
            else:
                return {
                    "status": "error",
                    "message": f"Sora API returned status {response.status_code}: {response.text}",
                    "prompt": prompt
                }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "prompt": prompt if 'prompt' in locals() else "Error building prompt"
        }

def build_healthcare_video_prompt(idea_data: Dict[str, Any], detected_systems: List[Dict[str, Any]]) -> str:
    """Build a detailed prompt for Sora video generation based on healthcare idea"""
    title = idea_data.get('title', '')
    description = idea_data.get('description', '')
    solution = idea_data.get('proposedSolution', '')
    
    system_names = [s['system'] for s in detected_systems] if detected_systems else []
    
    if 'Epic' in system_names and 'medication' in description.lower():
        return """Healthcare environment, modern hospital setting with bright, professional lighting.
A nurse in blue scrubs approaches a Pyxis medication cabinet in a clean medication room.
She scans her fingerprint on the biometric reader to unlock the cabinet.
The cabinet door opens smoothly, revealing organized medication drawers with LED lighting.
She selects the correct medication for her patient from the drawer.
She walks to the patient's bedside with a mobile medication cart.
She scans the patient's wristband with a barcode scanner on the cart.
The mobile cart screen displays the patient information from Epic EHR system.
She scans the medication barcode, and the screen shows a green checkmark.
The Epic system automatically documents the medication administration.
Close-up of the screen showing "Medication Administered Successfully" with timestamp.
Professional healthcare environment, focus on safety and efficiency, modern technology."""
    
    elif 'patient portal' in description.lower() or 'patient' in title.lower():
        return """Modern healthcare setting, patient at home using a tablet device.
Patient opens a sleek patient portal app on their tablet.
The app displays a clean, user-friendly dashboard with health information.
Patient taps on "Medical Records" and sees their recent lab results.
The screen shows test results with easy-to-understand visualizations and graphs.
Patient taps on "Appointments" and sees upcoming doctor visits.
Patient uses the app to send a secure message to their care team.
The care team receives the message on their Epic EHR system in real-time.
Doctor reviews the message and responds quickly through the integrated system.
Patient receives notification and reads the doctor's response on their tablet.
Close-up of satisfied patient smiling while using the app.
Professional, modern, patient-centered healthcare technology, bright and welcoming."""
    
    else:
        return f"""Healthcare innovation concept visualization for: {title}.
Modern hospital environment with advanced technology and professional staff.
Healthcare workers collaborating using digital tools and modern systems.
{' Integration with ' + ', '.join(system_names[:2]) + ' systems.' if system_names else 'Innovative healthcare solution in action.'}
Patients receiving improved care through the new solution.
Staff members working more efficiently with reduced administrative burden.
Digital dashboards showing real-time data and analytics.
Healthcare team celebrating successful implementation and positive outcomes.
Professional medical environment, bright lighting, focus on innovation and patient care.
Modern technology improving healthcare delivery and patient satisfaction."""

@app.post("/api/agents/sora-video")
async def agent_sora_video(request: Dict[str, Any]):
    """Generate Sora video demo for an innovation idea"""
    try:
        idea_data = request.get("idea", {})
        detected_systems = await detect_systems(f"{idea_data.get('title', '')} {idea_data.get('description', '')}")
        
        video_result = await generate_sora_video(idea_data, detected_systems)
        
        return {"video": video_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ideas/{idea_id}/analysis")
async def save_agent_analysis(idea_id: str, request: Dict[str, Any]):
    """Save agent analysis results for an idea"""
    try:
        agent1_data = request.get("agent1", {})
        agent2_data = request.get("agent2", {})
        agent3_data = request.get("agent3", {})
        agent4_data = request.get("agent4", {})
        sora_data = request.get("sora", {})
        completed_count = request.get("completed_count", 0)
        
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("""
                INSERT OR REPLACE INTO agent_analyses 
                (idea_id, agent1_json, agent2_json, agent3_json, agent4_json, sora_json, completed_count, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                idea_id,
                json.dumps(agent1_data) if agent1_data else None,
                json.dumps(agent2_data) if agent2_data else None,
                json.dumps(agent3_data) if agent3_data else None,
                json.dumps(agent4_data) if agent4_data else None,
                json.dumps(sora_data) if sora_data else None,
                completed_count,
                datetime.now().isoformat()
            ))
            await db.commit()
            
            cursor = await db.execute(
                "SELECT * FROM agent_analyses WHERE idea_id = ?",
                (idea_id,)
            )
            row = await cursor.fetchone()
            
            if row:
                return {
                    "idea_id": row[0],
                    "agent1": json.loads(row[1]) if row[1] else None,
                    "agent2": json.loads(row[2]) if row[2] else None,
                    "agent3": json.loads(row[3]) if row[3] else None,
                    "agent4": json.loads(row[4]) if row[4] else None,
                    "sora": json.loads(row[5]) if row[5] else None,
                    "completed_count": row[6],
                    "created_at": row[7],
                    "updated_at": row[8]
                }
            else:
                raise HTTPException(status_code=404, detail="Analysis not found after save")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ideas/{idea_id}/analysis")
async def get_agent_analysis(idea_id: str):
    """Retrieve agent analysis results for an idea"""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            cursor = await db.execute(
                "SELECT * FROM agent_analyses WHERE idea_id = ?",
                (idea_id,)
            )
            row = await cursor.fetchone()
            
            if row:
                return {
                    "idea_id": row[0],
                    "agent1": json.loads(row[1]) if row[1] else None,
                    "agent2": json.loads(row[2]) if row[2] else None,
                    "agent3": json.loads(row[3]) if row[3] else None,
                    "agent4": json.loads(row[4]) if row[4] else None,
                    "sora": json.loads(row[5]) if row[5] else None,
                    "completed_count": row[6],
                    "created_at": row[7],
                    "updated_at": row[8]
                }
            else:
                raise HTTPException(status_code=404, detail="Analysis not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
