import asyncio
import aiosqlite
import json
from datetime import datetime, timedelta
import random

DB_PATH = "contosohealth_ideas.db"

HIGH_ENGAGEMENT_COMMENTS = [
    {"author": "Dr. Emily Foster", "dept": "Emergency Department", "content": "This is exactly what we need! I've been saying this for years."},
    {"author": "Michael Chen", "dept": "IT - Clinical Systems", "content": "We actually have the infrastructure to support this. Let's pilot it."},
    {"author": "Sarah Johnson", "dept": "Nursing - ICU", "content": "I would volunteer my unit for the pilot program. This could save lives."},
    {"author": "Dr. Robert Kim", "dept": "Quality & Safety", "content": "This aligns perfectly with our strategic initiatives. Strong support."},
    {"author": "Amanda Foster", "dept": "Nursing - Pediatrics", "content": "We tried something similar at my previous hospital and it worked great."},
]

MEDIUM_ENGAGEMENT_COMMENTS = [
    {"author": "Linda Thompson", "dept": "Nursing - Telemetry", "content": "Good idea but we need to think about the cost."},
    {"author": "James Wilson", "dept": "Nursing - ICU", "content": "How would this work on night shift?"},
    {"author": "Maria Rodriguez", "dept": "Nursing - Oncology", "content": "I like this concept. Would need training though."},
]

LOW_ENGAGEMENT_COMMENTS = [
    {"author": "Robert Martinez", "dept": "Environmental Services", "content": "Makes sense to me."},
]

async def generate_ai_analysis(idea, quality):
    """Generate AI analysis based on idea quality"""
    if quality == "high":
        return {
            "categoryType": idea["categoryType"],
            "functionalArea": idea["functionalArea"],
            "strategicAlignmentScore": random.randint(4, 5),
            "impactPatient": random.choice(["High", "Medium"]),
            "impactStaff": random.choice(["High", "Medium"]),
            "impactQuality": random.choice(["High", "Medium"]),
            "impactEfficiency": random.choice(["High", "Medium"]),
            "complexityAssessment": random.choice(["Medium", "High"]),
            "timelineEstimateGeneral": random.choice(["6-9 months", "9-12 months"]),
            "aiRecommendations": "Start with pilot program in one unit. This aligns with Vision 2030 strategic priorities.",
            "vision2030Alignment": {
                "patientConsumerConnectivity": random.choice(["High", "Medium"]),
                "leadershipPipeline": random.choice(["Medium", "Low"]),
                "staffRetention": random.choice(["High", "Medium"]),
                "digitalTools": random.choice(["High", "Medium"])
            },
            "executiveAnalysis": {
                "implementationCostLow": random.randint(50, 150) * 1000,
                "implementationCostHigh": random.randint(150, 300) * 1000,
                "returnCostSavingsLow": random.randint(100, 300) * 1000,
                "returnCostSavingsHigh": random.randint(300, 600) * 1000,
                "netValue3Year": random.randint(500, 1500) * 1000,
                "paybackPeriodMonths": random.randint(6, 18),
                "riskTechnical": random.randint(2, 4),
                "riskOperational": random.randint(2, 3),
                "riskFinancial": random.randint(1, 3),
                "resourcesFTESummary": "PM: 0.5 FTE, Clinical Lead: 0.25 FTE, IT: 0.5 FTE"
            }
        }
    elif quality == "medium":
        return {
            "categoryType": idea["categoryType"],
            "functionalArea": idea["functionalArea"],
            "strategicAlignmentScore": random.randint(3, 4),
            "impactPatient": random.choice(["Medium", "High"]),
            "impactStaff": random.choice(["Medium", "High"]),
            "impactQuality": random.choice(["Medium", "Low"]),
            "impactEfficiency": random.choice(["Medium", "High"]),
            "complexityAssessment": random.choice(["Low", "Medium"]),
            "timelineEstimateGeneral": random.choice(["3-6 months", "6-9 months"]),
            "aiRecommendations": "Consider adding more detail to problem statement. Identify specific success metrics.",
            "vision2030Alignment": {
                "patientConsumerConnectivity": random.choice(["Medium", "Low"]),
                "leadershipPipeline": random.choice(["Low", "Medium"]),
                "staffRetention": random.choice(["Medium", "High"]),
                "digitalTools": random.choice(["Medium", "Low"])
            },
            "executiveAnalysis": {
                "implementationCostLow": random.randint(25, 75) * 1000,
                "implementationCostHigh": random.randint(75, 150) * 1000,
                "returnCostSavingsLow": random.randint(50, 150) * 1000,
                "returnCostSavingsHigh": random.randint(150, 300) * 1000,
                "netValue3Year": random.randint(200, 600) * 1000,
                "paybackPeriodMonths": random.randint(8, 24),
                "riskTechnical": random.randint(1, 3),
                "riskOperational": random.randint(2, 3),
                "riskFinancial": random.randint(1, 2),
                "resourcesFTESummary": "PM: 0.25 FTE, Staff Lead: 0.25 FTE"
            }
        }
    else:  # spark
        return {
            "categoryType": idea["categoryType"],
            "functionalArea": idea["functionalArea"],
            "strategicAlignmentScore": random.randint(2, 3),
            "impactPatient": random.choice(["Low", "Medium"]),
            "impactStaff": random.choice(["Low", "Medium"]),
            "impactQuality": random.choice(["Low", "Medium"]),
            "impactEfficiency": random.choice(["Low", "Medium"]),
            "complexityAssessment": random.choice(["Low", "Medium"]),
            "timelineEstimateGeneral": random.choice(["1-3 months", "3-6 months"]),
            "aiRecommendations": "Needs more detail. Please provide problem statement, proposed solution, and expected benefits. Consider what specific problem this solves.",
            "vision2030Alignment": {
                "patientConsumerConnectivity": "Low",
                "leadershipPipeline": "Low",
                "staffRetention": random.choice(["Low", "Medium"]),
                "digitalTools": "Low"
            },
            "executiveAnalysis": {
                "implementationCostLow": random.randint(10, 30) * 1000,
                "implementationCostHigh": random.randint(30, 75) * 1000,
                "returnCostSavingsLow": random.randint(20, 60) * 1000,
                "returnCostSavingsHigh": random.randint(60, 150) * 1000,
                "netValue3Year": random.randint(50, 250) * 1000,
                "paybackPeriodMonths": random.randint(12, 36),
                "riskTechnical": random.randint(1, 2),
                "riskOperational": random.randint(1, 2),
                "riskFinancial": random.randint(1, 2),
                "resourcesFTESummary": "Staff Lead: 0.1 FTE"
            }
        }

async def load_ideas():
    """Load all 50 diverse healthcare ideas into the database"""
    
    with open("/home/ubuntu/contosohealth-innovation-platform/50-diverse-healthcare-ideas.json", "r") as f:
        ideas = json.load(f)
    
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM comments")
        await db.execute("DELETE FROM ideas")
        await db.commit()
        
        print(f"Loading {len(ideas)} ideas into database...")
        
        for idx, idea in enumerate(ideas, 1):
            idea_id = f"idea-{str(idx).zfill(3)}"
            quality = idea.get("quality", "medium")
            
            ai_analysis = await generate_ai_analysis(idea, quality)
            
            if quality == "high":
                upvotes = idea.get("upvotes", random.randint(35, 70))
                comment_count = idea.get("commentCount", random.randint(5, 18))
            elif quality == "medium":
                upvotes = idea.get("upvotes", random.randint(20, 45))
                comment_count = idea.get("commentCount", random.randint(3, 10))
            else:  # spark
                upvotes = idea.get("upvotes", random.randint(0, 30))
                comment_count = idea.get("commentCount", random.randint(0, 5))
            
            days_ago = random.randint(1, 60)
            created_at = (datetime.utcnow() - timedelta(days=days_ago)).isoformat() + "Z"
            
            await db.execute("""
                INSERT INTO ideas (
                    id, title, description, problemStatement, proposedSolution, 
                    expectedBenefit, targetUsers, successMetrics, submitterName, 
                    submitterDepartment, submitterHospital, submitterContact, 
                    categoryType, functionalArea, status, upvotes, downvotes, 
                    commentCount, createdAt, aiAnalysis, staffTitle, staffDescription
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                idea_id,
                idea.get("title", ""),
                idea.get("description", ""),
                idea.get("problemStatement", ""),
                idea.get("proposedSolution", ""),
                idea.get("expectedBenefit", ""),
                idea.get("targetUsers", ""),
                idea.get("successMetrics", ""),
                idea.get("submitterName", "Anonymous"),
                idea.get("submitterDepartment", "General"),
                "ContosoHealth Orlando",
                f"{idea.get('submitterName', 'user').lower().replace(' ', '.')}@contosohealth.com",
                idea.get("categoryType", "Process Improvement"),
                idea.get("functionalArea", "Enterprise-wide"),
                "New",
                upvotes,
                0,
                comment_count,
                created_at,
                json.dumps(ai_analysis),
                idea.get("title", ""),  # staffTitle same as title for now
                idea.get("description", "")  # staffDescription same as description
            ))
            
            if comment_count > 0:
                if quality == "high" and comment_count >= 5:
                    comments_to_add = HIGH_ENGAGEMENT_COMMENTS[:comment_count]
                elif quality == "medium" and comment_count >= 3:
                    comments_to_add = MEDIUM_ENGAGEMENT_COMMENTS[:min(comment_count, 3)]
                    if comment_count > 3:
                        comments_to_add += HIGH_ENGAGEMENT_COMMENTS[:comment_count-3]
                else:
                    comments_to_add = LOW_ENGAGEMENT_COMMENTS[:min(comment_count, 1)]
                    if comment_count > 1:
                        comments_to_add += MEDIUM_ENGAGEMENT_COMMENTS[:min(comment_count-1, 2)]
                
                for comment_idx, comment in enumerate(comments_to_add[:comment_count]):
                    comment_id = f"c{idea_id}-{comment_idx+1}"
                    comment_created = (datetime.fromisoformat(created_at.replace('Z', '')) + timedelta(hours=random.randint(1, 48))).isoformat() + "Z"
                    
                    await db.execute("""
                        INSERT INTO comments (id, ideaId, parentId, author, department, content, createdAt)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        comment_id,
                        idea_id,
                        None,
                        comment["author"],
                        comment["dept"],
                        comment["content"],
                        comment_created
                    ))
                    
                    if quality == "high" and comment_idx < 2 and random.random() > 0.5:
                        reply_id = f"c{idea_id}-{comment_idx+1}-r1"
                        reply_created = (datetime.fromisoformat(comment_created.replace('Z', '')) + timedelta(hours=random.randint(1, 24))).isoformat() + "Z"
                        reply_author = random.choice([idea.get("submitterName", "Anonymous"), "Dr. Michelle Adams", "Karen White"])
                        reply_content = random.choice([
                            "Great point! I hadn't thought of that.",
                            "Yes, we should definitely consider this approach.",
                            "I agree completely. Let's move forward with this.",
                            "Thanks for the feedback. I'll add that to the proposal."
                        ])
                        
                        await db.execute("""
                            INSERT INTO comments (id, ideaId, parentId, author, department, content, createdAt)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        """, (
                            reply_id,
                            idea_id,
                            comment_id,
                            reply_author,
                            idea.get("submitterDepartment", "General"),
                            reply_content,
                            reply_created
                        ))
            
            print(f"  ✓ Loaded idea {idx}/50: {idea['title'][:50]}... ({quality} quality, {upvotes} upvotes, {comment_count} comments)")
        
        await db.commit()
        print(f"\n✓ Successfully loaded all {len(ideas)} ideas with varying engagement levels!")

if __name__ == "__main__":
    asyncio.run(load_ideas())
