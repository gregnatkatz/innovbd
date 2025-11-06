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
from azure.identity import ClientSecretCredential

load_dotenv()

app = FastAPI()

openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

SORA_ENDPOINT = os.getenv("SORA_ENDPOINT")
SORA_API_KEY = os.getenv("SORA_API_KEY")

AZURE_TENANT_ID = os.getenv("AZURE_TENANT_ID")
AZURE_CLIENT_ID = os.getenv("AZURE_CLIENT_ID")
AZURE_CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET")
AZURE_AI_PROJECT_ENDPOINT = os.getenv("AZURE_AI_PROJECT_ENDPOINT", "").rstrip("/")
AZURE_AI_PROJECT_NAME = os.getenv("AZURE_AI_PROJECT_NAME")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "contosohealth_ideas.db"

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

async def seed_existing_solutions(db):
    """Seed database with realistic existing solutions from other ContosoHealth hospitals"""
    import uuid
    from datetime import datetime, timedelta
    
    solutions = [
        {
            "id": str(uuid.uuid4()),
            "title": "Mobile Medication Scanning System",
            "description": "Implemented barcode scanning on mobile devices for medication administration, reducing medication errors by 45% and improving nurse workflow efficiency.",
            "hospital_name": "ContosoHealth Orlando",
            "department": "Nursing",
            "implemented_date": (datetime.now() - timedelta(days=180)).isoformat(),
            "contact_name": "Rachel Thompson, RN",
            "contact_email": "rachel.thompson@contosohealth.com",
            "tags": json.dumps(["Medication Safety", "Mobile Technology", "Nursing Workflow", "Patient Safety"]),
            "results": "45% reduction in medication errors, 20 minutes saved per nurse per shift, 98% nurse satisfaction",
            "lessons_learned": "Key success factors: extensive nurse training, phased rollout by unit, integration with Epic EHR. Challenge: WiFi coverage in older buildings required infrastructure upgrades."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Real-Time Bed Status Dashboard",
            "description": "Digital dashboard showing real-time bed availability across all units, integrated with housekeeping and transport systems to reduce patient wait times.",
            "hospital_name": "ContosoHealth Tampa",
            "department": "Emergency Department",
            "implemented_date": (datetime.now() - timedelta(days=240)).isoformat(),
            "contact_name": "Dr. Michael Chen",
            "contact_email": "michael.chen@contosohealth.com",
            "tags": json.dumps(["Patient Flow", "Bed Management", "ED Efficiency", "Dashboard"]),
            "results": "30% reduction in ED boarding time, 15% increase in patient throughput, $1.2M annual revenue impact",
            "lessons_learned": "Critical to integrate housekeeping and transport workflows. Required change management across multiple departments. Real-time data accuracy was key to adoption."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Automated Patient Discharge Instructions",
            "description": "System that generates personalized discharge instructions in patient's preferred language with medication reconciliation and follow-up appointment scheduling.",
            "hospital_name": "ContosoHealth Celebration",
            "department": "Inpatient Care",
            "implemented_date": (datetime.now() - timedelta(days=150)).isoformat(),
            "contact_name": "Sarah Martinez, RN",
            "contact_email": "sarah.martinez@contosohealth.com",
            "tags": json.dumps(["Discharge Planning", "Patient Education", "Readmission Prevention", "Epic Integration"]),
            "results": "25% reduction in 30-day readmissions, 95% patient comprehension scores, 40 minutes saved per discharge",
            "lessons_learned": "Translation accuracy was critical. Pilot with Spanish and Creole first. Nurse champions in each unit drove adoption. Integration with Epic discharge module was essential."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Nurse Shift Handoff Tool",
            "description": "Structured digital handoff tool replacing paper reports, ensuring consistent communication of patient status, pending tasks, and safety concerns between shifts.",
            "hospital_name": "ContosoHealth Altamonte Springs",
            "department": "Nursing",
            "implemented_date": (datetime.now() - timedelta(days=200)).isoformat(),
            "contact_name": "Jennifer Lee, CNO",
            "contact_email": "jennifer.lee@contosohealth.com",
            "tags": json.dumps(["Nursing Communication", "Patient Safety", "Shift Handoff", "Standardization"]),
            "results": "60% reduction in handoff-related incidents, 15 minutes saved per handoff, improved nurse satisfaction scores",
            "lessons_learned": "Standardized format was key. Mobile access essential for bedside handoffs. Required cultural shift from informal to structured communication."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Predictive Staffing Model",
            "description": "Machine learning model that predicts patient volume and acuity 48 hours in advance, enabling proactive staffing adjustments and reducing overtime costs.",
            "hospital_name": "ContosoHealth Kissimmee",
            "department": "Nursing",
            "implemented_date": (datetime.now() - timedelta(days=300)).isoformat(),
            "contact_name": "David Park",
            "contact_email": "david.park@contosohealth.com",
            "tags": json.dumps(["Workforce Management", "AI/ML", "Staffing", "Cost Reduction"]),
            "results": "20% reduction in overtime costs, 85% forecast accuracy, improved staff satisfaction and work-life balance",
            "lessons_learned": "Historical data quality was critical. Required 2 years of clean data. Nurse managers needed training on interpreting predictions. Built trust through transparent accuracy reporting."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Rapid Response Team Alert System",
            "description": "Automated early warning system that monitors vital signs and triggers rapid response team alerts based on deterioration criteria, improving patient outcomes.",
            "hospital_name": "ContosoHealth Daytona Beach",
            "department": "ICU",
            "implemented_date": (datetime.now() - timedelta(days=365)).isoformat(),
            "contact_name": "Dr. Amanda Foster",
            "contact_email": "amanda.foster@contosohealth.com",
            "tags": json.dumps(["Patient Safety", "Early Warning", "Rapid Response", "Clinical Excellence"]),
            "results": "35% reduction in code blue events, 20% improvement in mortality for deteriorating patients, faster response times",
            "lessons_learned": "Alert fatigue was a challenge - required careful tuning of thresholds. Integration with Epic flowsheets essential. RRT team buy-in critical for success."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Patient Portal Video Visits",
            "description": "Integrated telehealth video visits directly into patient portal, enabling convenient virtual appointments for follow-ups and routine consultations.",
            "hospital_name": "ContosoHealth Winter Park",
            "department": "Ambulatory Care",
            "implemented_date": (datetime.now() - timedelta(days=280)).isoformat(),
            "contact_name": "Dr. Robert Kim",
            "contact_email": "robert.kim@contosohealth.com",
            "tags": json.dumps(["Telehealth", "Patient Portal", "Virtual Visits", "Patient Experience"]),
            "results": "15,000 virtual visits in first year, 92% patient satisfaction, 40% reduction in no-show rates",
            "lessons_learned": "Patient education on technology was key. Provided tech support hotline. Started with tech-savvy patient populations. Reimbursement policies needed clarification."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "OR Supply Preference Cards",
            "description": "Digital surgeon preference cards with automated supply picking and case cart preparation, reducing OR setup time and supply waste.",
            "hospital_name": "ContosoHealth Wesley Chapel",
            "department": "Operating Room",
            "implemented_date": (datetime.now() - timedelta(days=220)).isoformat(),
            "contact_name": "Dr. James Wilson",
            "contact_email": "james.wilson@contosohealth.com",
            "tags": json.dumps(["OR Efficiency", "Supply Chain", "Surgeon Preferences", "Waste Reduction"]),
            "results": "25% reduction in OR setup time, $500K annual supply cost savings, 30% reduction in supply waste",
            "lessons_learned": "Surgeon engagement was critical. Required individual meetings to build preference cards. Supply chain integration took longer than expected. ROI was compelling."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Patient Experience Text Surveys",
            "description": "Real-time text message surveys sent to patients post-discharge to capture immediate feedback and identify service recovery opportunities.",
            "hospital_name": "ContosoHealth Apopka",
            "department": "Patient Experience",
            "implemented_date": (datetime.now() - timedelta(days=190)).isoformat(),
            "contact_name": "Lisa Anderson",
            "contact_email": "lisa.anderson@contosohealth.com",
            "tags": json.dumps(["Patient Experience", "Surveys", "Real-Time Feedback", "Service Recovery"]),
            "results": "65% response rate (vs 15% for traditional surveys), 48-hour service recovery window, 12-point HCAHPS improvement",
            "lessons_learned": "Timing was critical - send within 24 hours of discharge. Keep surveys short (3-5 questions). Text opt-in compliance required careful implementation."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Clinical Documentation AI Assistant",
            "description": "AI-powered tool that listens to patient encounters and generates draft clinical notes, reducing documentation burden on physicians.",
            "hospital_name": "ContosoHealth Lake Wales",
            "department": "Ambulatory Care",
            "implemented_date": (datetime.now() - timedelta(days=120)).isoformat(),
            "contact_name": "Dr. Patricia Lee",
            "contact_email": "patricia.lee@contosohealth.com",
            "tags": json.dumps(["AI/ML", "Clinical Documentation", "Physician Efficiency", "Ambient Listening"]),
            "results": "2 hours saved per physician per day, 40% reduction in after-hours charting, improved physician satisfaction",
            "lessons_learned": "Privacy concerns required careful patient consent process. Accuracy improved with specialty-specific training. Physicians still reviewed and edited all notes."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Pharmacy Automated Dispensing Cabinets",
            "description": "Upgraded automated dispensing cabinets with biometric access, real-time inventory tracking, and integration with medication administration records.",
            "hospital_name": "ContosoHealth Ocala",
            "department": "Pharmacy",
            "implemented_date": (datetime.now() - timedelta(days=320)).isoformat(),
            "contact_name": "Thomas Garcia, PharmD",
            "contact_email": "thomas.garcia@contosohealth.com",
            "tags": json.dumps(["Pharmacy", "Medication Safety", "Inventory Management", "Automation"]),
            "results": "50% reduction in medication diversion incidents, 98% inventory accuracy, $300K annual cost savings",
            "lessons_learned": "Biometric access initially met resistance but improved security. Real-time inventory prevented stockouts. Integration with Epic was complex but valuable."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Employee Wellness App",
            "description": "Mobile app providing personalized wellness challenges, mental health resources, fitness tracking, and peer support for staff wellbeing.",
            "hospital_name": "ContosoHealth Palm Coast",
            "department": "HR",
            "implemented_date": (datetime.now() - timedelta(days=160)).isoformat(),
            "contact_name": "Karen White",
            "contact_email": "karen.white@contosohealth.com",
            "tags": json.dumps(["Workforce Wellbeing", "Mental Health", "Employee Engagement", "Mobile App"]),
            "results": "3,500 active users, 25% reduction in reported burnout, improved retention rates, positive culture impact",
            "lessons_learned": "Gamification drove engagement. Privacy protections were essential. Leadership participation was key. Integrated with existing benefits programs."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Radiology AI Triage System",
            "description": "AI algorithm that analyzes chest X-rays and CT scans to flag critical findings and prioritize radiologist worklist, improving turnaround time.",
            "hospital_name": "ContosoHealth Sebring",
            "department": "Radiology",
            "implemented_date": (datetime.now() - timedelta(days=400)).isoformat(),
            "contact_name": "Dr. Maria Rodriguez",
            "contact_email": "maria.rodriguez@contosohealth.com",
            "tags": json.dumps(["AI/ML", "Radiology", "Clinical Excellence", "Triage"]),
            "results": "50% reduction in critical finding notification time, 99.2% sensitivity for critical findings, improved patient outcomes",
            "lessons_learned": "FDA clearance process was lengthy. Radiologist trust built through transparent accuracy reporting. Integration with PACS required vendor collaboration."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Supply Chain Demand Forecasting",
            "description": "Predictive analytics system that forecasts supply needs based on historical usage, seasonal trends, and patient volume, optimizing inventory levels.",
            "hospital_name": "ContosoHealth Waterman",
            "department": "Supply Chain",
            "implemented_date": (datetime.now() - timedelta(days=350)).isoformat(),
            "contact_name": "David Chen",
            "contact_email": "david.chen@contosohealth.com",
            "tags": json.dumps(["Supply Chain", "AI/ML", "Inventory Management", "Cost Reduction"]),
            "results": "$800K annual cost savings, 30% reduction in stockouts, 25% reduction in excess inventory",
            "lessons_learned": "Data quality from multiple systems was challenging. Required cross-functional team. Buyer adoption required demonstrating accuracy over time."
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Patient Transport Tracking System",
            "description": "Real-time GPS tracking of patient transport staff with automated dispatch and status updates, reducing wait times and improving coordination.",
            "hospital_name": "ContosoHealth Zephyrhills",
            "department": "Patient Transport",
            "implemented_date": (datetime.now() - timedelta(days=210)).isoformat(),
            "contact_name": "Michael Brown",
            "contact_email": "michael.brown@contosohealth.com",
            "tags": json.dumps(["Patient Flow", "Transport", "GPS Tracking", "Operational Excellence"]),
            "results": "40% reduction in transport wait times, 25% improvement in staff productivity, better patient experience scores",
            "lessons_learned": "Staff initially concerned about tracking - transparent communication about purpose was key. Mobile devices needed to be durable. Integration with bed management system enhanced value."
        }
    ]
    
    for solution in solutions:
        await db.execute("""
            INSERT INTO solutions (id, title, description, hospital_name, department, implemented_date, contact_name, contact_email, tags, results, lessons_learned)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            solution["id"],
            solution["title"],
            solution["description"],
            solution["hospital_name"],
            solution["department"],
            solution["implemented_date"],
            solution["contact_name"],
            solution["contact_email"],
            solution["tags"],
            solution["results"],
            solution["lessons_learned"]
        ))
    
    await db.commit()
    print(f"Seeded {len(solutions)} existing solutions into database")

async def seed_existing_projects(db):
    """Seed database with realistic existing ContosoHealth projects"""
    import uuid
    from datetime import datetime, timedelta
    
    projects = [
        {
            "id": str(uuid.uuid4()),
            "name": "AI-Powered Bed Management Optimization",
            "description": "Real-time bed availability tracking and predictive analytics to optimize patient placement and reduce wait times in ED and for admissions.",
            "departments": json.dumps(["Emergency Department", "Inpatient Care", "IT"]),
            "owner_name": "Dr. Sarah Chen",
            "owner_email": "sarah.chen@contosohealth.com",
            "tags": json.dumps(["AI/ML", "Patient Flow", "Capacity Management", "Azure"]),
            "current_phase": "Pilot Testing",
            "start_date": (datetime.now() - timedelta(days=120)).isoformat(),
            "strategic_pillars": json.dumps(["AI/ML Innovation", "Operational Excellence", "Patient Experience"]),
            "notes": "Currently piloting at 3 hospitals. Using Azure ML for predictive models. 15% reduction in ED wait times observed."
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Virtual Sitter Program Expansion",
            "description": "Remote patient monitoring using AI-powered video analytics to detect falls and patient distress, reducing need for 1:1 sitters.",
            "departments": json.dumps(["Inpatient Care", "Nursing", "IT"]),
            "owner_name": "Jennifer Martinez, RN",
            "owner_email": "jennifer.martinez@contosohealth.com",
            "tags": json.dumps(["AI/ML", "Patient Safety", "Workforce Efficiency", "Computer Vision"]),
            "current_phase": "Scaling",
            "start_date": (datetime.now() - timedelta(days=240)).isoformat(),
            "strategic_pillars": json.dumps(["AI/ML Innovation", "Workforce Wellbeing", "Patient Experience"]),
            "notes": "Deployed at 12 hospitals. Reduced sitter costs by $2.3M annually. Expanding to 25 more units in Q2."
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Automated Discharge Planning Assistant",
            "description": "AI-powered tool that analyzes patient records and suggests optimal discharge timing, transportation needs, and follow-up care coordination.",
            "departments": json.dumps(["Case Management", "Inpatient Care", "IT"]),
            "owner_name": "Michael Thompson",
            "owner_email": "michael.thompson@contosohealth.com",
            "tags": json.dumps(["AI/ML", "Discharge Planning", "Length of Stay", "Epic Integration"]),
            "current_phase": "Development",
            "start_date": (datetime.now() - timedelta(days=90)).isoformat(),
            "strategic_pillars": json.dumps(["AI/ML Innovation", "Operational Excellence", "Patient Experience"]),
            "notes": "Integrating with Epic EHR. Expected to reduce average length of stay by 0.5 days. Launch planned for Q3."
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Radiology AI Worklist Prioritization",
            "description": "Machine learning model that analyzes imaging orders and prioritizes critical cases for radiologist review, improving turnaround time for urgent findings.",
            "departments": json.dumps(["Radiology", "IT", "Emergency Department"]),
            "owner_name": "Dr. Robert Kim",
            "owner_email": "robert.kim@contosohealth.com",
            "tags": json.dumps(["AI/ML", "Radiology", "Clinical Excellence", "PACS Integration"]),
            "current_phase": "Production",
            "start_date": (datetime.now() - timedelta(days=365)).isoformat(),
            "strategic_pillars": json.dumps(["AI/ML Innovation", "Clinical Excellence", "Patient Experience"]),
            "notes": "Live at all hospitals. Reduced critical finding notification time by 40%. Processing 50K+ studies monthly."
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Predictive Sepsis Early Warning System",
            "description": "Real-time monitoring system using ML to detect early signs of sepsis in hospitalized patients, enabling faster intervention.",
            "departments": json.dumps(["Inpatient Care", "ICU", "Quality & Safety", "IT"]),
            "owner_name": "Dr. Amanda Foster",
            "owner_email": "amanda.foster@contosohealth.com",
            "tags": json.dumps(["AI/ML", "Clinical Excellence", "Patient Safety", "Epic Integration"]),
            "current_phase": "Production",
            "start_date": (datetime.now() - timedelta(days=450)).isoformat(),
            "strategic_pillars": json.dumps(["AI/ML Innovation", "Clinical Excellence", "Patient Experience"]),
            "notes": "Deployed system-wide. 25% improvement in sepsis mortality. Integrated with Epic Sepsis Model."
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Staff Scheduling Optimization Platform",
            "description": "AI-driven scheduling system that balances staff preferences, patient acuity, and regulatory requirements to create optimal nursing schedules.",
            "departments": json.dumps(["Nursing", "HR", "IT"]),
            "owner_name": "Lisa Anderson, CNO",
            "owner_email": "lisa.anderson@contosohealth.com",
            "tags": json.dumps(["AI/ML", "Workforce Management", "Scheduling", "Staff Satisfaction"]),
            "current_phase": "Pilot Testing",
            "start_date": (datetime.now() - timedelta(days=150)).isoformat(),
            "strategic_pillars": json.dumps(["AI/ML Innovation", "Workforce Wellbeing", "Operational Excellence"]),
            "notes": "Piloting in 5 units. Early results show 30% reduction in scheduling conflicts and improved staff satisfaction."
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Patient Portal Enhancement with Chatbot",
            "description": "AI-powered chatbot integrated into patient portal to answer common questions, schedule appointments, and provide pre-visit instructions.",
            "departments": json.dumps(["IT", "Patient Experience", "Ambulatory Care"]),
            "owner_name": "David Park",
            "owner_email": "david.park@contosohealth.com",
            "tags": json.dumps(["AI/ML", "Patient Portal", "Chatbot", "Azure Bot Service"]),
            "current_phase": "Development",
            "start_date": (datetime.now() - timedelta(days=60)).isoformat(),
            "strategic_pillars": json.dumps(["AI/ML Innovation", "Patient Experience", "Operational Excellence"]),
            "notes": "Using Azure OpenAI for natural language processing. Expected to handle 40% of routine inquiries. Launch Q2."
        },
        {
            "id": str(uuid.uuid4()),
            "name": "OR Turnover Time Reduction Initiative",
            "description": "Process improvement and technology integration to reduce operating room turnover time through better coordination and predictive scheduling.",
            "departments": json.dumps(["Operating Room", "Surgery", "Supply Chain", "IT"]),
            "owner_name": "Dr. James Wilson",
            "owner_email": "james.wilson@contosohealth.com",
            "tags": json.dumps(["Process Improvement", "OR Efficiency", "Scheduling", "IoT Sensors"]),
            "current_phase": "Implementation",
            "start_date": (datetime.now() - timedelta(days=180)).isoformat(),
            "strategic_pillars": json.dumps(["Operational Excellence", "Clinical Excellence"]),
            "notes": "Implementing IoT sensors and real-time dashboards. Target: reduce turnover from 45 to 30 minutes."
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Remote Patient Monitoring for Chronic Conditions",
            "description": "Home monitoring program using connected devices to track vitals for patients with CHF, COPD, and diabetes, reducing readmissions.",
            "departments": json.dumps(["Ambulatory Care", "Cardiology", "Pulmonology", "IT"]),
            "owner_name": "Dr. Maria Rodriguez",
            "owner_email": "maria.rodriguez@contosohealth.com",
            "tags": json.dumps(["Telehealth", "Remote Monitoring", "Chronic Care", "IoT"]),
            "current_phase": "Scaling",
            "start_date": (datetime.now() - timedelta(days=300)).isoformat(),
            "strategic_pillars": json.dumps(["Patient Experience", "Clinical Excellence", "Operational Excellence"]),
            "notes": "1,200 patients enrolled. 35% reduction in 30-day readmissions. Expanding to 5,000 patients by year-end."
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Clinical Documentation Improvement with AI",
            "description": "Natural language processing tool that analyzes physician notes and suggests documentation improvements for coding accuracy and completeness.",
            "departments": json.dumps(["Health Information Management", "Revenue Cycle", "IT"]),
            "owner_name": "Patricia Lee",
            "owner_email": "patricia.lee@contosohealth.com",
            "tags": json.dumps(["AI/ML", "Clinical Documentation", "Revenue Cycle", "NLP"]),
            "current_phase": "Pilot Testing",
            "start_date": (datetime.now() - timedelta(days=75)).isoformat(),
            "strategic_pillars": json.dumps(["AI/ML Innovation", "Operational Excellence"]),
            "notes": "Testing with 50 physicians. Early results show 20% improvement in documentation specificity. Azure OpenAI integration."
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Supply Chain Demand Forecasting System",
            "description": "Machine learning model that predicts supply needs based on historical usage, seasonal trends, and patient volume forecasts.",
            "departments": json.dumps(["Supply Chain", "IT", "Finance"]),
            "owner_name": "Thomas Garcia",
            "owner_email": "thomas.garcia@contosohealth.com",
            "tags": json.dumps(["AI/ML", "Supply Chain", "Inventory Management", "Cost Reduction"]),
            "current_phase": "Production",
            "start_date": (datetime.now() - timedelta(days=400)).isoformat(),
            "strategic_pillars": json.dumps(["AI/ML Innovation", "Operational Excellence"]),
            "notes": "Deployed system-wide. Reduced inventory costs by $4.5M annually. 98% forecast accuracy achieved."
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Employee Wellness and Burnout Prevention Program",
            "description": "Digital platform with AI-driven personalized wellness recommendations, mental health resources, and burnout risk detection for staff.",
            "departments": json.dumps(["HR", "Employee Health", "IT"]),
            "owner_name": "Karen White",
            "owner_email": "karen.white@contosohealth.com",
            "tags": json.dumps(["Workforce Wellbeing", "Mental Health", "AI/ML", "Employee Engagement"]),
            "current_phase": "Implementation",
            "start_date": (datetime.now() - timedelta(days=100)).isoformat(),
            "strategic_pillars": json.dumps(["Workforce Wellbeing", "AI/ML Innovation"]),
            "notes": "Launching to 5,000 employees in Q2. Includes stress monitoring, resilience training, and peer support matching."
        }
    ]
    
    for project in projects:
        await db.execute("""
            INSERT INTO projects (id, name, description, departments, owner_name, owner_email, tags, current_phase, start_date, strategic_pillars, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            project["id"],
            project["name"],
            project["description"],
            project["departments"],
            project["owner_name"],
            project["owner_email"],
            project["tags"],
            project["current_phase"],
            project["start_date"],
            project["strategic_pillars"],
            project["notes"]
        ))
    
    await db.commit()
    print(f"Seeded {len(projects)} existing projects into database")

async def seed_applications(db):
    """Seed database with healthcare applications/systems"""
    import uuid
    
    applications = [
        {
            "id": "epic",
            "name": "Epic EHR",
            "description": "Electronic Health Record system",
            "vendor": "Epic Systems",
            "typical_cost": 50000,
            "typical_timeline_weeks": 12,
            "sme_name": "Sarah Chen",
            "sme_email": "sarah.chen@contosohealth.com"
        },
        {
            "id": "pyxis",
            "name": "Pyxis MedStation",
            "description": "Automated medication dispensing system",
            "vendor": "BD",
            "typical_cost": 25000,
            "typical_timeline_weeks": 8,
            "sme_name": "Michael Chen",
            "sme_email": "michael.chen@contosohealth.com"
        },
        {
            "id": "rtls",
            "name": "Bluetooth RTLS",
            "description": "Real-time location tracking system",
            "vendor": "Various",
            "typical_cost": 30000,
            "typical_timeline_weeks": 10,
            "sme_name": "Jennifer Walsh",
            "sme_email": "jennifer.walsh@contosohealth.com"
        },
        {
            "id": "azure",
            "name": "Microsoft Azure",
            "description": "Cloud platform and AI services",
            "vendor": "Microsoft",
            "typical_cost": 20000,
            "typical_timeline_weeks": 6,
            "sme_name": "Robert Kim",
            "sme_email": "robert.kim@contosohealth.com"
        },
        {
            "id": "workday",
            "name": "Workday",
            "description": "HR and scheduling system",
            "vendor": "Workday",
            "typical_cost": 40000,
            "typical_timeline_weeks": 16,
            "sme_name": "Amanda Foster",
            "sme_email": "amanda.foster@contosohealth.com"
        },
        {
            "id": "servicenow",
            "name": "ServiceNow",
            "description": "IT service management platform",
            "vendor": "ServiceNow",
            "typical_cost": 35000,
            "typical_timeline_weeks": 12,
            "sme_name": "Lisa Rodriguez",
            "sme_email": "lisa.rodriguez@contosohealth.com"
        },
        {
            "id": "power-platform",
            "name": "Power Platform",
            "description": "Low-code development platform",
            "vendor": "Microsoft",
            "typical_cost": 15000,
            "typical_timeline_weeks": 4,
            "sme_name": "Emily Foster",
            "sme_email": "emily.foster@contosohealth.com"
        }
    ]
    
    for app in applications:
        await db.execute("""
            INSERT INTO applications (id, name, description, vendor, typical_cost, typical_timeline_weeks, sme_name, sme_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (app["id"], app["name"], app["description"], app["vendor"], app["typical_cost"], 
              app["typical_timeline_weeks"], app["sme_name"], app["sme_email"]))
    
    await db.commit()

async def seed_pain_points(db):
    """Seed database with common healthcare pain points and solutions"""
    import uuid
    
    pain_points = [
        {
            "id": str(uuid.uuid4()),
            "pain_point": "medication administration delays and tracking",
            "app_id": "epic",
            "ideas_submitted": 47,
            "potential_value": "$350K/year",
            "solutions": json.dumps(["MedSync pilot at Orlando", "Rover barcode enhancements", "Real-time medication tracking"])
        },
        {
            "id": str(uuid.uuid4()),
            "pain_point": "equipment tracking for wheelchairs and mobile assets",
            "app_id": "rtls",
            "ideas_submitted": 23,
            "potential_value": "$180K/year",
            "solutions": json.dumps(["RTLS tags pilot at Tampa", "Asset map dashboard", "Bluetooth tracking system"])
        },
        {
            "id": str(uuid.uuid4()),
            "pain_point": "discharge prescriptions lost or missed",
            "app_id": "epic",
            "ideas_submitted": 39,
            "potential_value": "$250K/year",
            "solutions": json.dumps(["Automated discharge prescription workflow", "Pharmacy integration", "Text notifications"])
        },
        {
            "id": str(uuid.uuid4()),
            "pain_point": "ED lab turnaround time too long",
            "app_id": "epic",
            "ideas_submitted": 52,
            "potential_value": "$400K/year",
            "solutions": json.dumps(["Point-of-care testing expansion", "Rapid lab protocols", "Lab workflow optimization"])
        },
        {
            "id": str(uuid.uuid4()),
            "pain_point": "sepsis alert fatigue and false positives",
            "app_id": "epic",
            "ideas_submitted": 45,
            "potential_value": "$500K/year",
            "solutions": json.dumps(["ML-based sepsis prediction", "Alert triage system", "Clinical context integration"])
        },
        {
            "id": str(uuid.uuid4()),
            "pain_point": "wound photo documentation inconsistency",
            "app_id": "azure",
            "ideas_submitted": 29,
            "potential_value": "$120K/year",
            "solutions": json.dumps(["Standardized photo app", "AI wound measurement", "Epic integration"])
        },
        {
            "id": str(uuid.uuid4()),
            "pain_point": "scheduling system confusion and inefficiency",
            "app_id": "workday",
            "ideas_submitted": 72,
            "potential_value": "$300K/year",
            "solutions": json.dumps(["Mobile scheduling app", "Self-service shift swaps", "AI-optimized schedules"])
        },
        {
            "id": str(uuid.uuid4()),
            "pain_point": "interpreter availability and wait times",
            "app_id": "power-platform",
            "ideas_submitted": 38,
            "potential_value": "$90K/year",
            "solutions": json.dumps(["On-call interpreter pool", "AI translation assist", "Video interpretation expansion"])
        },
        {
            "id": str(uuid.uuid4()),
            "pain_point": "bed status visibility and patient flow",
            "app_id": "servicenow",
            "ideas_submitted": 30,
            "potential_value": "$1.2M/year",
            "solutions": json.dumps(["Real-time bed dashboard", "Housekeeping integration", "Transport workflow"])
        },
        {
            "id": str(uuid.uuid4()),
            "pain_point": "patient belongings tracking and loss prevention",
            "app_id": "epic",
            "ideas_submitted": 41,
            "potential_value": "$75K/year",
            "solutions": json.dumps(["Barcode tracking system", "Photo documentation", "Transfer alerts"])
        },
        {
            "id": str(uuid.uuid4()),
            "pain_point": "fall prevention and patient safety monitoring",
            "app_id": "azure",
            "ideas_submitted": 61,
            "potential_value": "$450K/year",
            "solutions": json.dumps(["AI fall risk assessment", "Smart bed sensors", "Video monitoring"])
        },
        {
            "id": str(uuid.uuid4()),
            "pain_point": "new nurse orientation and retention",
            "app_id": "power-platform",
            "ideas_submitted": 44,
            "potential_value": "$200K/year",
            "solutions": json.dumps(["Extended orientation program", "Mentor matching system", "Simulation training"])
        }
    ]
    
    for pp in pain_points:
        await db.execute("""
            INSERT INTO pain_points (id, pain_point, app_id, ideas_submitted, potential_value, solutions)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (pp["id"], pp["pain_point"], pp["app_id"], pp["ideas_submitted"], pp["potential_value"], pp["solutions"]))
    
    await db.commit()

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
        await db.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                departments TEXT,
                owner_name TEXT,
                owner_email TEXT,
                tags TEXT,
                current_phase TEXT,
                start_date TEXT,
                strategic_pillars TEXT,
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS solutions (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                hospital_name TEXT,
                department TEXT,
                implemented_date TEXT,
                contact_name TEXT,
                contact_email TEXT,
                tags TEXT,
                results TEXT,
                lessons_learned TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                vendor TEXT,
                typical_cost INTEGER,
                typical_timeline_weeks INTEGER,
                sme_name TEXT,
                sme_email TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS pain_points (
                id TEXT PRIMARY KEY,
                pain_point TEXT NOT NULL,
                app_id TEXT NOT NULL,
                ideas_submitted INTEGER DEFAULT 0,
                potential_value TEXT,
                solutions TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (app_id) REFERENCES applications(id)
            )
        """)
        await db.commit()
        
        async with db.execute("SELECT COUNT(*) FROM projects") as cursor:
            row = await cursor.fetchone()
            if row[0] == 0:
                await seed_existing_projects(db)
        
        async with db.execute("SELECT COUNT(*) FROM solutions") as cursor:
            row = await cursor.fetchone()
            if row[0] == 0:
                await seed_existing_solutions(db)
        
        async with db.execute("SELECT COUNT(*) FROM applications") as cursor:
            row = await cursor.fetchone()
            if row[0] == 0:
                await seed_applications(db)
        
        async with db.execute("SELECT COUNT(*) FROM pain_points") as cursor:
            row = await cursor.fetchone()
            if row[0] == 0:
                await seed_pain_points(db)

async def detect_systems(text: str) -> List[Dict[str, Any]]:
    """Agent 1: System Context Analyzer - Use GPT-4o to detect healthcare systems and technologies"""
    try:
        prompt = f"""You are a healthcare IT systems expert. Analyze the following text and identify any healthcare systems, technologies, or platforms mentioned.

TEXT TO ANALYZE:
{text}

COMMON HEALTHCARE SYSTEMS TO LOOK FOR:
- Epic EHR (Electronic Health Records)
- Cerner/Oracle Health
- Azure AI/ML services
- Microsoft Teams
- Patient portals
- Medication management systems (Pyxis, Omnicell)
- PACS (Picture Archiving and Communication System)
- Laboratory Information Systems (LIS)
- Pharmacy systems
- Telehealth platforms
- Mobile health apps
- IoT medical devices
- Cloud infrastructure (Azure, AWS)

For each system detected, provide:
1. System name
2. Category (EHR, AI/ML, Communication, Medication, Imaging, Lab, Pharmacy, Telehealth, Mobile, IoT, Cloud)
3. Integration complexity (Low/Medium/High)
4. Estimated integration cost range
5. Typical timeline in weeks

OUTPUT FORMAT (JSON):
{{
  "detectedSystems": [
    {{
      "system": "Epic EHR",
      "category": "EHR",
      "confidence": 0.95,
      "integrationComplexity": "High",
      "estimatedCostLow": 50000,
      "estimatedCostHigh": 150000,
      "typicalTimelineWeeks": 12,
      "technicalSME": "Epic Integration Team"
    }}
  ]
}}

If no systems are detected, return {{"detectedSystems": []}}"""

        model = os.getenv("AZURE_OPENAI_DEPLOYMENT_GPT4", "gpt-4o")
        
        response = openai_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a healthcare IT systems expert specializing in system integration and technology detection."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        detected_systems = result.get("detectedSystems", [])
        
        return detected_systems
        
    except Exception as e:
        print(f"Error in detect_systems with GPT-4o: {e}")
        return []

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
                    "reasoning": "Strong alignment with ContosoHealth strategic priorities."
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
        if not SORA_ENDPOINT or not SORA_API_KEY:
            return {
                "status": "error",
                "message": "Sora API not configured - missing SORA_ENDPOINT or SORA_API_KEY"
            }
        
        prompt = await generate_video_prompt_with_ai(idea_data, detected_systems)
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{SORA_ENDPOINT}?api-version=preview",
                headers={
                    "api-key": SORA_API_KEY,
                    "Content-Type": "application/json"
                },
                json={
                    "model": "sora",
                    "prompt": prompt,
                    "height": 480,
                    "width": 480,
                    "n_seconds": 5,
                    "n_variants": 1
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

async def generate_video_prompt_with_ai(idea_data: Dict[str, Any], detected_systems: List[Dict[str, Any]]) -> str:
    """Agent 5: Video Prompt Generator - Use AI to create compelling Sora video prompts"""
    try:
        title = idea_data.get('title', '')
        description = idea_data.get('description', '')
        problem = idea_data.get('problemStatement', '')
        solution = idea_data.get('proposedSolution', '')
        benefit = idea_data.get('expectedBenefit', '')
        
        system_names = [s['system'] for s in detected_systems] if detected_systems else []
        systems_text = f"Systems involved: {', '.join(system_names)}" if system_names else "No specific systems detected"
        
        prompt = f"""You are a healthcare video production expert creating prompts for Sora video generation. 
Your goal is to create a compelling 5-second video that demonstrates a healthcare innovation idea.

INNOVATION IDEA:
Title: {title}
Problem: {problem}
Solution: {solution}
Expected Benefit: {benefit}
{systems_text}

REQUIREMENTS:
1. Create a visual story that shows BEFORE and AFTER scenarios
2. Include specific healthcare settings (hospital room, nurse station, patient home, etc.)
3. Show real people (nurses, doctors, patients) using the solution
4. Demonstrate clear ROI or patient impact visually
5. Keep it realistic and professional
6. Focus on the human element and positive outcomes
7. Make it suitable for executive presentations

OUTPUT FORMAT:
Provide a detailed scene-by-scene description for a 5-second video. Each scene should be 1-2 sentences describing exactly what happens visually. Include:
- Setting and lighting
- People and their actions
- Technology/systems being used
- Visual indicators of success (green checkmarks, happy faces, efficiency metrics)
- Professional healthcare environment details

Write the prompt as a continuous narrative, not bullet points. Be specific about what appears on screens, facial expressions, and environmental details."""

        model = os.getenv("AZURE_OPENAI_DEPLOYMENT_O3", "o3")
        
        response = openai_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a healthcare video production expert specializing in creating compelling visual narratives for Sora video generation."},
                {"role": "user", "content": prompt}
            ]
        )
        
        video_prompt = response.choices[0].message.content
        if video_prompt:
            video_prompt = video_prompt.strip()
        
        print(f"AI-generated video prompt using {model}: {video_prompt[:100] if video_prompt else 'EMPTY'}...")
        print(f"Response finish_reason: {response.choices[0].finish_reason}")
        
        if not video_prompt:
            print(f"Warning: AI returned empty prompt. Full response: {response}")
            return build_healthcare_video_prompt_fallback(idea_data, detected_systems)
        
        return video_prompt
        
    except Exception as e:
        print(f"Error generating video prompt with AI: {e}")
        return build_healthcare_video_prompt_fallback(idea_data, detected_systems)

def build_healthcare_video_prompt_fallback(idea_data: Dict[str, Any], detected_systems: List[Dict[str, Any]]) -> str:
    """Fallback prompt builder if AI generation fails"""
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

@app.post("/api/agents/sora")
async def agent_sora(idea_id: str = Query(...)):
    """Generate Sora video for an idea (called by frontend retry button)"""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM ideas WHERE id = ?", (idea_id,)) as cursor:
                row = await cursor.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="Idea not found")
                idea = dict(row)
        
        detected_systems = await detect_systems(f"{idea.get('title', '')} {idea.get('description', '')}")
        video_result = await generate_sora_video(idea, detected_systems)
        
        sora_data = {"video": video_result}
        async with aiosqlite.connect(DB_PATH) as db:
            cursor = await db.execute(
                "SELECT sora_json FROM agent_analyses WHERE idea_id = ?",
                (idea_id,)
            )
            row = await cursor.fetchone()
            
            if row:
                await db.execute(
                    "UPDATE agent_analyses SET sora_json = ?, updated_at = ? WHERE idea_id = ?",
                    (json.dumps(sora_data), datetime.now().isoformat(), idea_id)
                )
            else:
                await db.execute(
                    "INSERT INTO agent_analyses (idea_id, sora_json, completed_count, updated_at) VALUES (?, ?, ?, ?)",
                    (idea_id, json.dumps(sora_data), 0, datetime.now().isoformat())
                )
            await db.commit()
        
        return {
            "job_id": video_result.get("job_id"),
            "status": video_result.get("status")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_azure_ai_token() -> str:
    """Get Azure AD bearer token for AI Foundry access"""
    if not AZURE_TENANT_ID or not AZURE_CLIENT_ID or not AZURE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Azure AD credentials not configured")
    
    credential = ClientSecretCredential(
        tenant_id=AZURE_TENANT_ID,
        client_id=AZURE_CLIENT_ID,
        client_secret=AZURE_CLIENT_SECRET
    )
    scope = "https://ai.azure.com/.default"
    token = credential.get_token(scope)
    return token.token

async def get_sora_video_assets(generation_id: str) -> Optional[str]:
    """Get video download URL from AI Foundry for a specific generation"""
    try:
        if not AZURE_AI_PROJECT_ENDPOINT or not AZURE_AI_PROJECT_NAME:
            return None
        
        token = await asyncio.to_thread(get_azure_ai_token)
        headers = {"Authorization": f"Bearer {token}"}
        
        assets_url = f"{AZURE_AI_PROJECT_ENDPOINT}/projects/{AZURE_AI_PROJECT_NAME}/generations/{generation_id}/assets"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(assets_url, headers=headers)
            
            if response.status_code == 200:
                assets_data = response.json()
                assets = assets_data.get("value", [])
                
                for asset in assets:
                    video_url = asset.get("download_url") or asset.get("sasUrl") or asset.get("uri")
                    if video_url and asset.get("mime_type", "").startswith("video/"):
                        return video_url
        
        return None
    except Exception as e:
        print(f"Error getting video assets: {e}")
        return None

@app.get("/api/agents/sora-status/{job_id}")
async def get_sora_status(job_id: str):
    """Check the status of a Sora video generation job and resolve video URLs"""
    try:
        if not SORA_ENDPOINT or not SORA_API_KEY:
            raise HTTPException(status_code=500, detail="Sora API not configured")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{SORA_ENDPOINT}/{job_id}?api-version=preview",
                headers={
                    "api-key": SORA_API_KEY
                }
            )
            
            if response.status_code == 200:
                job_data = response.json()
                status = job_data.get("status", "unknown")
                generations = job_data.get("generations", [])
                
                if status == "succeeded" and generations:
                    for gen in generations:
                        gen_id = gen.get("id")
                        if gen_id and not gen.get("url"):
                            video_url = await get_sora_video_assets(gen_id)
                            if video_url:
                                gen["url"] = video_url
                
                return {
                    "status": status,
                    "job_id": job_data.get("id"),
                    "created_at": job_data.get("created_at"),
                    "generations": generations,
                    "error": job_data.get("error")
                }
            else:
                return {
                    "status": "error",
                    "message": f"Failed to check status: {response.status_code}",
                    "job_id": job_id
                }
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

@app.post("/api/seed-ideas")
async def seed_ideas():
    """Seed database with 50 realistic healthcare innovation ideas"""
    import uuid
    from datetime import datetime, timedelta
    
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT COUNT(*) FROM ideas") as cursor:
            row = await cursor.fetchone()
            if row[0] > 0:
                return {"message": f"Database already has {row[0]} ideas. Skipping seed."}
    
    ideas = [
        {"title": "AI-Powered Bed Management", "dept": "Emergency Department", "cat": "Technology/Digital Innovation"},
        {"title": "Mobile Medication Scanning", "dept": "Nursing", "cat": "Patient Experience Enhancement"},
        {"title": "Virtual Reality Pain Management", "dept": "Pain Management", "cat": "Clinical Excellence/Quality"},
        {"title": "Automated Discharge Instructions", "dept": "Nursing", "cat": "Patient Experience Enhancement"},
        {"title": "Smart Wheelchair Tracking", "dept": "Patient Transport", "cat": "Process Improvement"},
        {"title": "Predictive Staffing Model", "dept": "Nursing", "cat": "Workforce/Culture"},
        {"title": "Patient Portal Video Visits", "dept": "Ambulatory Care", "cat": "Technology/Digital Innovation"},
        {"title": "OR Turnover Time Reduction", "dept": "Operating Room", "cat": "Process Improvement"},
        {"title": "Remote Patient Monitoring", "dept": "Cardiology", "cat": "Technology/Digital Innovation"},
        {"title": "Clinical Documentation AI", "dept": "Health Information Management", "cat": "Technology/Digital Innovation"},
        {"title": "Supply Chain Forecasting", "dept": "Supply Chain", "cat": "Cost Reduction/Revenue Optimization"},
        {"title": "Employee Wellness Program", "dept": "HR", "cat": "Workforce/Culture"},
        {"title": "Sepsis Early Warning System", "dept": "ICU", "cat": "Clinical Excellence/Quality"},
        {"title": "Radiology AI Triage", "dept": "Radiology", "cat": "Technology/Digital Innovation"},
        {"title": "Pharmacy Automated Dispensing", "dept": "Pharmacy", "cat": "Patient Experience Enhancement"},
        {"title": "Patient Experience Surveys", "dept": "Patient Experience", "cat": "Patient Experience Enhancement"},
        {"title": "Nurse Shift Handoff Tool", "dept": "Nursing", "cat": "Clinical Excellence/Quality"},
        {"title": "Rapid Response Alerts", "dept": "ICU", "cat": "Clinical Excellence/Quality"},
        {"title": "OR Supply Preference Cards", "dept": "Operating Room", "cat": "Process Improvement"},
        {"title": "Telehealth Expansion", "dept": "Ambulatory Care", "cat": "Technology/Digital Innovation"},
        {"title": "Patient Transport Tracking", "dept": "Patient Transport", "cat": "Process Improvement"},
        {"title": "Fall Prevention Program", "dept": "Nursing", "cat": "Clinical Excellence/Quality"},
        {"title": "Lab Results Notification", "dept": "Laboratory", "cat": "Technology/Digital Innovation"},
        {"title": "Visitor Management System", "dept": "Security", "cat": "Technology/Digital Innovation"},
        {"title": "Staff Scheduling Optimization", "dept": "Nursing", "cat": "Workforce/Culture"},
        {"title": "Patient Education Videos", "dept": "Patient Experience", "cat": "Patient Experience Enhancement"},
        {"title": "Infection Control Monitoring", "dept": "Quality & Safety", "cat": "Clinical Excellence/Quality"},
        {"title": "Revenue Cycle Automation", "dept": "Revenue Cycle", "cat": "Cost Reduction/Revenue Optimization"},
        {"title": "Physician Burnout Prevention", "dept": "HR", "cat": "Workforce/Culture"},
        {"title": "Emergency Preparedness", "dept": "Emergency Management", "cat": "Regulatory/Compliance"},
        {"title": "Patient Meal Ordering App", "dept": "Food Services", "cat": "Patient Experience Enhancement"},
        {"title": "Environmental Services Tracking", "dept": "Environmental Services", "cat": "Process Improvement"},
        {"title": "Interpreter Services", "dept": "Patient Experience", "cat": "Patient Experience Enhancement"},
        {"title": "Cardiac Monitoring Alerts", "dept": "Cardiology", "cat": "Clinical Excellence/Quality"},
        {"title": "Pediatric Play Therapy", "dept": "Pediatrics", "cat": "Patient Experience Enhancement"},
        {"title": "Wound Care Documentation", "dept": "Nursing", "cat": "Clinical Excellence/Quality"},
        {"title": "Pharmacy Delivery Drones", "dept": "Pharmacy", "cat": "Technology/Digital Innovation"},
        {"title": "Patient Belongings Tracking", "dept": "Security", "cat": "Process Improvement"},
        {"title": "Chaplain Services", "dept": "Spiritual Care", "cat": "Patient Experience Enhancement"},
        {"title": "Equipment Maintenance", "dept": "Biomedical Engineering", "cat": "Process Improvement"},
        {"title": "Staff Recognition Program", "dept": "HR", "cat": "Workforce/Culture"},
        {"title": "Patient Rounding Software", "dept": "Nursing", "cat": "Technology/Digital Innovation"},
        {"title": "Surgical Site Prevention", "dept": "Operating Room", "cat": "Clinical Excellence/Quality"},
        {"title": "Ambulance Diversion Reduction", "dept": "Emergency Department", "cat": "Process Improvement"},
        {"title": "Palliative Care Consultation", "dept": "Palliative Care", "cat": "Clinical Excellence/Quality"},
        {"title": "Patient Wayfinding App", "dept": "Facilities", "cat": "Patient Experience Enhancement"},
        {"title": "Clinical Trial Recruitment", "dept": "Research", "cat": "Clinical Excellence/Quality"},
        {"title": "Vendor Credentialing", "dept": "Supply Chain", "cat": "Process Improvement"},
        {"title": "Patient Satisfaction Rounding", "dept": "Patient Experience", "cat": "Patient Experience Enhancement"},
        {"title": "Code Blue Response Time", "dept": "Emergency Response", "cat": "Clinical Excellence/Quality"}
    ]
    
    ideas_to_seed = []
    for idx, t in enumerate(ideas, start=1):
        ideas_to_seed.append({
            "id": str(uuid.uuid4()),
            "title": t["title"],
            "description": f"Innovation to improve {t['title'].lower()}.",
            "problemStatement": f"Current process needs improvement.",
            "proposedSolution": f"Implement {t['title'].lower()} improvements.",
            "expectedBenefit": "Improve efficiency and patient care.",
            "targetUsers": f"{t['dept']} staff",
            "successMetrics": "Efficiency, satisfaction scores",
            "submitterName": f"Staff {idx}",
            "submitterDepartment": t["dept"],
            "submitterHospital": "ContosoHealth",
            "submitterContact": f"staff{idx}@contosohealth.com",
            "categoryType": t["cat"],
            "functionalArea": t["dept"],
            "status": "Under Review",
            "upvotes": 10 + (idx % 20),
            "downvotes": idx % 5,
            "commentCount": idx % 8,
            "createdAt": (datetime.now() - timedelta(days=idx * 2)).isoformat()
        })
    
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            for idea in ideas_to_seed:
                await db.execute("""
                    INSERT INTO ideas (id, title, description, problemStatement, proposedSolution, expectedBenefit, 
                                     targetUsers, successMetrics, submitterName, submitterDepartment, submitterHospital,
                                     submitterContact, categoryType, functionalArea, status, upvotes, downvotes, 
                                     commentCount, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    idea["id"], idea["title"], idea["description"], idea["problemStatement"],
                    idea["proposedSolution"], idea["expectedBenefit"], idea["targetUsers"],
                    idea["successMetrics"], idea["submitterName"], idea["submitterDepartment"],
                    idea["submitterHospital"], idea["submitterContact"], idea["categoryType"],
                    idea["functionalArea"], idea["status"], idea["upvotes"], idea["downvotes"],
                    idea["commentCount"], idea["createdAt"]
                ))
            await db.commit()
        
        return {"message": f"Successfully seeded {len(ideas_to_seed)} ideas"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects")
async def get_projects():
    """Get all existing projects"""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM projects ORDER BY start_date DESC") as cursor:
                rows = await cursor.fetchall()
                projects = []
                for row in rows:
                    project_dict = dict(row)
                    project_dict['departments'] = json.loads(project_dict['departments'])
                    project_dict['tags'] = json.loads(project_dict['tags'])
                    project_dict['strategic_pillars'] = json.loads(project_dict['strategic_pillars'])
                    projects.append(project_dict)
                return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/solutions")
async def get_solutions():
    """Get all existing solutions from other hospitals"""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM solutions ORDER BY implemented_date DESC") as cursor:
                rows = await cursor.fetchall()
                solutions = []
                for row in rows:
                    solution_dict = dict(row)
                    solution_dict['tags'] = json.loads(solution_dict['tags'])
                    solutions.append(solution_dict)
                return solutions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/matches/{idea_id}")
async def get_matches(idea_id: str):
    """Get matching projects and solutions for an idea using GPT-4o"""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM ideas WHERE id = ?", (idea_id,)) as cursor:
                idea_row = await cursor.fetchone()
                if not idea_row:
                    raise HTTPException(status_code=404, detail="Idea not found")
                idea = dict(idea_row)
            
            async with db.execute("SELECT * FROM projects") as cursor:
                project_rows = await cursor.fetchall()
                projects = []
                for row in project_rows:
                    p = dict(row)
                    p['departments'] = json.loads(p['departments'])
                    p['tags'] = json.loads(p['tags'])
                    p['strategic_pillars'] = json.loads(p['strategic_pillars'])
                    projects.append(p)
            
            async with db.execute("SELECT * FROM solutions") as cursor:
                solution_rows = await cursor.fetchall()
                solutions = []
                for row in solution_rows:
                    s = dict(row)
                    s['tags'] = json.loads(s['tags'])
                    solutions.append(s)
        
        try:
            prompt = f"""You are a healthcare innovation matching expert. Analyze this new idea and find the top 3 most relevant matches from existing projects and solutions.

NEW IDEA:
Title: {idea['title']}
Description: {idea['description']}
Problem: {idea['problemStatement']}
Solution: {idea['proposedSolution']}
Department: {idea['submitterDepartment']}
Category: {idea['categoryType']}

EXISTING PROJECTS:
{json.dumps([{'id': p['id'], 'title': p['title'], 'description': p['description'], 'departments': p['departments'], 'tags': p['tags']} for p in projects], indent=2)}

EXISTING SOLUTIONS FROM OTHER HOSPITALS:
{json.dumps([{'id': s['id'], 'title': s['title'], 'description': s['description'], 'hospital': s['hospital_name'], 'department': s['department'], 'tags': s['tags']} for s in solutions], indent=2)}

Return the top 3 matches (can be projects or solutions) with:
1. Match score (0-100)
2. Match rationale (why it's relevant)
3. Overlap areas (specific commonalities)
4. Recommendation (how to leverage the existing work)

OUTPUT FORMAT (JSON):
{{
  "matches": [
    {{
      "type": "project" or "solution",
      "id": "...",
      "title": "...",
      "matchScore": 85,
      "rationale": "...",
      "overlapAreas": ["area1", "area2"],
      "recommendation": "..."
    }}
  ]
}}"""

            model = os.getenv("AZURE_OPENAI_DEPLOYMENT_GPT4", "gpt-4o")
            
            response = openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a healthcare innovation matching expert specializing in identifying synergies between new ideas and existing projects."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            matches = result.get("matches", [])
            
            enriched_matches = []
            for match in matches[:3]:  # Top 3
                if match['type'] == 'project':
                    full_item = next((p for p in projects if p['id'] == match['id']), None)
                else:
                    full_item = next((s for s in solutions if s['id'] == match['id']), None)
                
                if full_item:
                    enriched_matches.append({
                        **match,
                        "details": full_item
                    })
            
            return {"idea_id": idea_id, "matches": enriched_matches}
            
        except Exception as e:
            print(f"Error using GPT-4o for matching: {e}")
            fallback_matches = []
            
            idea_keywords = set(idea['title'].lower().split() + idea['description'].lower().split())
            
            for p in projects:
                p_keywords = set(p['title'].lower().split() + p['description'].lower().split())
                overlap = len(idea_keywords & p_keywords)
                if overlap > 2:
                    fallback_matches.append({
                        "type": "project",
                        "id": p['id'],
                        "title": p['title'],
                        "matchScore": min(overlap * 10, 100),
                        "rationale": f"Shares {overlap} common keywords",
                        "overlapAreas": list(idea_keywords & p_keywords)[:3],
                        "recommendation": "Review project details for potential collaboration",
                        "details": p
                    })
            
            for s in solutions:
                s_keywords = set(s['title'].lower().split() + s['description'].lower().split())
                overlap = len(idea_keywords & s_keywords)
                if overlap > 2:
                    fallback_matches.append({
                        "type": "solution",
                        "id": s['id'],
                        "title": s['title'],
                        "matchScore": min(overlap * 10, 100),
                        "rationale": f"Shares {overlap} common keywords",
                        "overlapAreas": list(idea_keywords & s_keywords)[:3],
                        "recommendation": f"Contact {s['contact_name']} at {s['hospital_name']}",
                        "details": s
                    })
            
            fallback_matches.sort(key=lambda x: x['matchScore'], reverse=True)
            return {"idea_id": idea_id, "matches": fallback_matches[:3]}
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/email/compose")
async def compose_email(request: dict):
    """Compose email for executive to connect requester with existing project/solution"""
    try:
        idea_id = request.get("idea_id")
        match_id = request.get("match_id")
        match_type = request.get("match_type")  # "project" or "solution"
        exec_name = request.get("exec_name", "Executive")
        
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM ideas WHERE id = ?", (idea_id,)) as cursor:
                idea_row = await cursor.fetchone()
                if not idea_row:
                    raise HTTPException(status_code=404, detail="Idea not found")
                idea = dict(idea_row)
            
            if match_type == "project":
                async with db.execute("SELECT * FROM projects WHERE id = ?", (match_id,)) as cursor:
                    match_row = await cursor.fetchone()
                    if not match_row:
                        raise HTTPException(status_code=404, detail="Project not found")
                    match = dict(match_row)
                    match['departments'] = json.loads(match['departments'])
                    match['tags'] = json.loads(match['tags'])
            else:
                async with db.execute("SELECT * FROM solutions WHERE id = ?", (match_id,)) as cursor:
                    match_row = await cursor.fetchone()
                    if not match_row:
                        raise HTTPException(status_code=404, detail="Solution not found")
                    match = dict(match_row)
                    match['tags'] = json.loads(match['tags'])
        
        try:
            if match_type == "project":
                context = f"""EXISTING PROJECT:
Title: {match['title']}
Description: {match['description']}
Status: {match['status']}
Lead: {match['project_lead']}
Contact: {match['contact_email']}"""
            else:
                context = f"""EXISTING SOLUTION (from {match['hospital_name']}):
Title: {match['title']}
Description: {match['description']}
Results: {match['results']}
Contact: {match['contact_name']} ({match['contact_email']})
Lessons Learned: {match['lessons_learned']}"""
            
            prompt = f"""You are composing an email from a healthcare executive to connect an innovation requester with an existing project/solution that meets their needs.

REQUESTER'S IDEA:
Title: {idea['title']}
Submitted by: {idea['submitterName']} ({idea['submitterDepartment']})
Contact: {idea['submitterContact']}
Problem: {idea['problemStatement']}
Proposed Solution: {idea['proposedSolution']}

{context}

Compose a professional, warm email (150-220 words) that:
1. Acknowledges the requester's innovative thinking
2. Explains that a similar project/solution already exists
3. Highlights how it addresses their needs
4. Provides contact information for collaboration
5. Encourages them to connect and learn from the existing work
6. Maintains an encouraging tone about continuing to submit ideas

OUTPUT FORMAT (JSON):
{{
  "subject": "...",
  "greeting": "Hi {idea['submitterName'].split()[0]},",
  "body_paragraphs": ["paragraph1", "paragraph2", "paragraph3"],
  "call_to_action": "...",
  "signature": "{exec_name}"
}}"""

            model = os.getenv("AZURE_OPENAI_DEPLOYMENT_GPT4", "gpt-4o")
            
            response = openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a healthcare executive composing emails to connect innovators with existing solutions."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            email = json.loads(response.choices[0].message.content)
            return email
            
        except Exception as e:
            print(f"Error using GPT-4o for email composition: {e}")
            if match_type == "project":
                return {
                    "subject": f"Great news about your idea: {idea['title']}",
                    "greeting": f"Hi {idea['submitterName'].split()[0]},",
                    "body_paragraphs": [
                        f"Thank you for submitting your innovative idea about {idea['title']}. Your thinking aligns perfectly with our strategic priorities!",
                        f"I wanted to let you know that we already have a project underway that addresses this need: '{match['title']}' led by {match['project_lead']}. This project is currently {match['status'].lower()} and has made significant progress.",
                        f"I'd encourage you to connect with {match['project_lead']} at {match['contact_email']} to learn more and see how you might contribute your insights to this effort."
                    ],
                    "call_to_action": "Please keep the great ideas coming - your engagement is exactly what drives innovation at ContosoHealth!",
                    "signature": exec_name
                }
            else:
                return {
                    "subject": f"Existing solution for your idea: {idea['title']}",
                    "greeting": f"Hi {idea['submitterName'].split()[0]},",
                    "body_paragraphs": [
                        f"Thank you for your innovative idea about {idea['title']}. I'm excited to share that {match['hospital_name']} has already implemented a similar solution!",
                        f"Their '{match['title']}' initiative achieved impressive results: {match['results']}. {match['contact_name']} would be an excellent resource to learn from their experience.",
                        f"I'd encourage you to reach out to {match['contact_name']} at {match['contact_email']} to discuss how we might adapt their approach for our needs."
                    ],
                    "call_to_action": "Your innovative thinking is valuable - please continue sharing ideas!",
                    "signature": exec_name
                }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/executive/risk-assessment")
async def get_risk_assessment():
    """Get comprehensive risk assessment for all ideas"""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM ideas") as cursor:
                rows = await cursor.fetchall()
                ideas = []
                for row in rows:
                    idea_dict = dict(row)
                    if idea_dict.get('aiAnalysis'):
                        idea_dict['aiAnalysis'] = json.loads(idea_dict['aiAnalysis'])
                    ideas.append(idea_dict)
        
        risk_data = []
        for idea in ideas:
            strategic_risk = 10 - (idea.get('aiAnalysis', {}).get('strategicAlignmentScore', 3))
            
            systems_count = len(idea.get('aiAnalysis', {}).get('systemsDetected', []))
            technical_risk = min(10, 3 + systems_count)
            
            impact_staff = idea.get('aiAnalysis', {}).get('impactStaff', 'Low')
            operational_risk = {'Low': 3, 'Medium': 6, 'High': 9}.get(impact_staff, 5)
            
            roi = idea.get('aiAnalysis', {}).get('executiveAnalysis', {}).get('netValue3Year', 0)
            financial_risk = 8 if roi < 50000 else (5 if roi < 200000 else 3)
            
            overall_risk = (strategic_risk * 0.3 + technical_risk * 0.25 + 
                          operational_risk * 0.25 + financial_risk * 0.2)
            
            risk_level = 'Low' if overall_risk < 4 else ('Medium' if overall_risk < 7 else 'High')
            
            risk_data.append({
                'id': idea['id'],
                'title': idea['title'],
                'category': idea.get('categoryType', 'Unknown'),
                'strategicRisk': round(strategic_risk, 1),
                'technicalRisk': round(technical_risk, 1),
                'operationalRisk': round(operational_risk, 1),
                'financialRisk': round(financial_risk, 1),
                'overallRisk': round(overall_risk, 1),
                'riskLevel': risk_level,
                'mitigation': f"Monitor {risk_level.lower()} risk areas closely"
            })
        
        high_risk = [r for r in risk_data if r['riskLevel'] == 'High']
        medium_risk = [r for r in risk_data if r['riskLevel'] == 'Medium']
        low_risk = [r for r in risk_data if r['riskLevel'] == 'Low']
        
        return {
            'ideas': risk_data,
            'summary': {
                'highRisk': len(high_risk),
                'mediumRisk': len(medium_risk),
                'lowRisk': len(low_risk),
                'avgOverallRisk': round(sum(r['overallRisk'] for r in risk_data) / len(risk_data), 1) if risk_data else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/executive/sentiment-analysis")
async def get_sentiment_analysis():
    """Get sentiment and excitement analysis by department and category"""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM ideas") as cursor:
                rows = await cursor.fetchall()
                ideas = []
                for row in rows:
                    idea_dict = dict(row)
                    if idea_dict.get('aiAnalysis'):
                        idea_dict['aiAnalysis'] = json.loads(idea_dict['aiAnalysis'])
                    ideas.append(idea_dict)
        
        dept_sentiment = {}
        for idea in ideas:
            dept = idea.get('submitterDepartment', 'Unknown')
            if dept not in dept_sentiment:
                dept_sentiment[dept] = {
                    'department': dept,
                    'ideaCount': 0,
                    'totalEngagement': 0,
                    'avgEngagement': 0,
                    'excitement': 0,
                    'sentiment': 'Neutral'
                }
            
            engagement = (idea.get('upvotes', 0) + idea.get('commentCount', 0) * 2)
            dept_sentiment[dept]['ideaCount'] += 1
            dept_sentiment[dept]['totalEngagement'] += engagement
        
        for dept_data in dept_sentiment.values():
            if dept_data['ideaCount'] > 0:
                dept_data['avgEngagement'] = round(dept_data['totalEngagement'] / dept_data['ideaCount'], 1)
                dept_data['excitement'] = min(100, round((dept_data['avgEngagement'] * 2 + dept_data['ideaCount'] * 5)))
                if dept_data['excitement'] > 70:
                    dept_data['sentiment'] = 'Very Positive'
                elif dept_data['excitement'] > 50:
                    dept_data['sentiment'] = 'Positive'
                elif dept_data['excitement'] > 30:
                    dept_data['sentiment'] = 'Neutral'
                else:
                    dept_data['sentiment'] = 'Needs Attention'
        
        category_sentiment = {}
        for idea in ideas:
            cat = idea.get('categoryType', 'Unknown')
            if cat not in category_sentiment:
                category_sentiment[cat] = {
                    'category': cat,
                    'ideaCount': 0,
                    'totalEngagement': 0,
                    'avgEngagement': 0,
                    'excitement': 0,
                    'sentiment': 'Neutral'
                }
            
            engagement = (idea.get('upvotes', 0) + idea.get('commentCount', 0) * 2)
            category_sentiment[cat]['ideaCount'] += 1
            category_sentiment[cat]['totalEngagement'] += engagement
        
        for cat_data in category_sentiment.values():
            if cat_data['ideaCount'] > 0:
                cat_data['avgEngagement'] = round(cat_data['totalEngagement'] / cat_data['ideaCount'], 1)
                cat_data['excitement'] = min(100, round((cat_data['avgEngagement'] * 2 + cat_data['ideaCount'] * 5)))
                if cat_data['excitement'] > 70:
                    cat_data['sentiment'] = 'Very Positive'
                elif cat_data['excitement'] > 50:
                    cat_data['sentiment'] = 'Positive'
                elif cat_data['excitement'] > 30:
                    cat_data['sentiment'] = 'Neutral'
                else:
                    cat_data['sentiment'] = 'Needs Attention'
        
        return {
            'byDepartment': sorted(list(dept_sentiment.values()), key=lambda x: x['excitement'], reverse=True),
            'byCategory': sorted(list(category_sentiment.values()), key=lambda x: x['excitement'], reverse=True),
            'overall': {
                'avgExcitement': round(sum(d['excitement'] for d in dept_sentiment.values()) / len(dept_sentiment), 1) if dept_sentiment else 0,
                'topDepartment': max(dept_sentiment.values(), key=lambda x: x['excitement'])['department'] if dept_sentiment else 'N/A',
                'topCategory': max(category_sentiment.values(), key=lambda x: x['excitement'])['category'] if category_sentiment else 'N/A'
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/executive/maturity-pipeline")
async def get_maturity_pipeline():
    """Get maturity pipeline showing realized vs needs development"""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM ideas") as cursor:
                rows = await cursor.fetchall()
                ideas = []
                for row in rows:
                    idea_dict = dict(row)
                    if idea_dict.get('aiAnalysis'):
                        idea_dict['aiAnalysis'] = json.loads(idea_dict['aiAnalysis'])
                    ideas.append(idea_dict)
        
        pipeline = {
            'realized': [],  # Approved/Implemented
            'piloting': [],  # In pilot/testing
            'developing': [],  # In development
            'planning': [],  # Approved, planning phase
            'evaluating': [],  # In review, high feasibility
            'refining': []  # Submitted, needs refinement
        }
        
        for idea in ideas:
            status = idea.get('status', 'Submitted')
            feasibility = idea.get('aiAnalysis', {}).get('overallScore', 5)
            engagement = idea.get('upvotes', 0) + idea.get('commentCount', 0)
            
            idea_summary = {
                'id': idea['id'],
                'title': idea['title'],
                'category': idea.get('categoryType', 'Unknown'),
                'status': status,
                'feasibility': feasibility,
                'engagement': engagement,
                'roi': idea.get('aiAnalysis', {}).get('executiveAnalysis', {}).get('netValue3Year', 0)
            }
            
            if status == 'Approved' and feasibility >= 8:
                pipeline['realized'].append(idea_summary)
            elif status == 'Approved' and feasibility >= 6:
                pipeline['piloting'].append(idea_summary)
            elif status == 'In Review' and feasibility >= 7:
                pipeline['developing'].append(idea_summary)
            elif status == 'In Review' and feasibility >= 5:
                pipeline['planning'].append(idea_summary)
            elif engagement > 20 or feasibility >= 6:
                pipeline['evaluating'].append(idea_summary)
            else:
                pipeline['refining'].append(idea_summary)
        
        return {
            'pipeline': pipeline,
            'summary': {
                'realized': len(pipeline['realized']),
                'piloting': len(pipeline['piloting']),
                'developing': len(pipeline['developing']),
                'planning': len(pipeline['planning']),
                'evaluating': len(pipeline['evaluating']),
                'refining': len(pipeline['refining']),
                'totalValue': sum(i['roi'] for stage in pipeline.values() for i in stage)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/executive/action-items")
async def get_executive_action_items():
    """Get prioritized executive action items"""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM ideas") as cursor:
                rows = await cursor.fetchall()
                ideas = []
                for row in rows:
                    idea_dict = dict(row)
                    if idea_dict.get('aiAnalysis'):
                        idea_dict['aiAnalysis'] = json.loads(idea_dict['aiAnalysis'])
                    ideas.append(idea_dict)
        
        action_items = []
        
        high_priority = [i for i in ideas if 
                        i.get('aiAnalysis', {}).get('executiveAnalysis', {}).get('netValue3Year', 0) > 200000 and
                        (i.get('upvotes', 0) + i.get('commentCount', 0)) > 20 and
                        i.get('status') != 'Approved']
        
        if high_priority:
            action_items.append({
                'priority': 'Critical',
                'action': 'Review High-Value Ideas for Approval',
                'description': f'{len(high_priority)} ideas with >$200K ROI and strong community support need executive review',
                'ideaCount': len(high_priority),
                'estimatedValue': sum(i.get('aiAnalysis', {}).get('executiveAnalysis', {}).get('netValue3Year', 0) for i in high_priority),
                'dueDate': 'Within 1 week',
                'owner': 'Chief Innovation Officer'
            })
        
        quick_wins = [i for i in ideas if 
                     i.get('aiAnalysis', {}).get('overallScore', 0) >= 7 and
                     i.get('aiAnalysis', {}).get('executiveAnalysis', {}).get('netValue3Year', 0) > 100000 and
                     ('3' in str(i.get('aiAnalysis', {}).get('timelineEstimateGeneral', '')) or
                     '4' in str(i.get('aiAnalysis', {}).get('timelineEstimateGeneral', '')))]
        
        if quick_wins:
            action_items.append({
                'priority': 'High',
                'action': 'Fast-Track Quick Win Projects',
                'description': f'{len(quick_wins)} ideas with high feasibility and short timelines ready for immediate implementation',
                'ideaCount': len(quick_wins),
                'estimatedValue': sum(i.get('aiAnalysis', {}).get('executiveAnalysis', {}).get('netValue3Year', 0) for i in quick_wins),
                'dueDate': 'Within 2 weeks',
                'owner': 'Project Management Office'
            })
        
        vision_aligned = [i for i in ideas if 
                         i.get('aiAnalysis', {}).get('strategicAlignmentScore', 0) >= 4]
        
        if vision_aligned:
            action_items.append({
                'priority': 'High',
                'action': 'Align Innovation Portfolio with Vision 2030',
                'description': f'{len(vision_aligned)} ideas strongly align with strategic pillars - prioritize for funding',
                'ideaCount': len(vision_aligned),
                'estimatedValue': sum(i.get('aiAnalysis', {}).get('executiveAnalysis', {}).get('netValue3Year', 0) for i in vision_aligned),
                'dueDate': 'Within 1 month',
                'owner': 'Strategy Team'
            })
        
        dept_counts = {}
        for idea in ideas:
            dept = idea.get('submitterDepartment', 'Unknown')
            dept_counts[dept] = dept_counts.get(dept, 0) + 1
        
        low_participation = [dept for dept, count in dept_counts.items() if count < 3]
        if low_participation:
            action_items.append({
                'priority': 'Medium',
                'action': 'Boost Engagement in Underrepresented Departments',
                'description': f'{len(low_participation)} departments have low participation - conduct outreach and training',
                'ideaCount': len(low_participation),
                'estimatedValue': 0,
                'dueDate': 'Ongoing',
                'owner': 'HR & Communications'
            })
        
        high_risk_value = [i for i in ideas if 
                          i.get('aiAnalysis', {}).get('executiveAnalysis', {}).get('netValue3Year', 0) > 300000]
        
        if high_risk_value:
            action_items.append({
                'priority': 'Medium',
                'action': 'Conduct Risk Assessment for High-Value Projects',
                'description': f'{len(high_risk_value)} high-value ideas need detailed risk analysis and mitigation planning',
                'ideaCount': len(high_risk_value),
                'estimatedValue': sum(i.get('aiAnalysis', {}).get('executiveAnalysis', {}).get('netValue3Year', 0) for i in high_risk_value),
                'dueDate': 'Within 3 weeks',
                'owner': 'Risk Management'
            })
        
        return {
            'actionItems': sorted(action_items, key=lambda x: {'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3}.get(x['priority'], 4)),
            'summary': {
                'critical': len([a for a in action_items if a['priority'] == 'Critical']),
                'high': len([a for a in action_items if a['priority'] == 'High']),
                'medium': len([a for a in action_items if a['priority'] == 'Medium']),
                'totalValue': sum(a.get('estimatedValue', 0) for a in action_items)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
