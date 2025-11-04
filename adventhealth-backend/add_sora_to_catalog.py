import sqlite3
import json

DB_PATH = "adventhealth_ideas.db"

sora_data = {
    "id": "APP-008",
    "name": "Azure OpenAI Sora",
    "category": "AI - Video Generation",
    "vendor": "Microsoft Corporation",
    "status": "Production",
    "criticality": "High",
    "description": "Video generation AI model for creating demonstrations, training materials, and visualizations of proposed healthcare solutions",
    "version": "Sora Preview",
    "go_live_date": "2025-11-04",
    "hospitals_deployed": "All 55 hospitals",
    "total_users": 1200,
    "active_daily_users": 50,
    "architecture": "Cloud-native AI service",
    "hosting": "Azure Cognitive Services",
    "api_capabilities": "REST API, Video generation, Custom prompts",
    "integration_level": "Low",
    "typical_integration_cost": 5000,
    "typical_timeline_weeks": 2,
    "integration_prerequisites": json.dumps(["Azure OpenAI access", "API key", "Video storage solution"]),
    "hipaa_compliant": True,
    "requires_baa": True,
    "phi_storage": False,
    "audit_logging": "Full audit trail in Azure Monitor",
    "contract_owner": "Greg Katz",
    "contract_expiry": "2028-11-04",
    "annual_cost": 10000,
    "cost_model": "Pay per video generated",
    "technical_sme_name": "Greg Katz",
    "technical_sme_email": "gregory.katz@microsoft.com",
    "technical_sme_expertise": "Azure OpenAI, AI/ML platforms, video generation",
    "clinical_sme_name": None,
    "clinical_sme_email": None,
    "clinical_sme_expertise": None,
    "high_volume_pain_points": json.dumps([
        "Stakeholders need to see visual demos before approving $100K+ projects",
        "Training material creation takes weeks for each solution rollout",
        "Success stories are hard to communicate without visual evidence"
    ]),
    "strategic_initiatives": json.dumps([
        "AI/ML adoption across healthcare operations",
        "Faster innovation approval cycles",
        "Improved stakeholder communication"
    ]),
    "known_limitations": json.dumps([
        "Video generation takes 2-5 minutes per video",
        "Healthcare-specific scenarios may need prompt engineering",
        "Preview model - features subject to change"
    ]),
    "full_data": json.dumps({
        "endpoint": "https://grego-m5vgi1oz-swedencentral.cognitiveservices.azure.com",
        "region": "Sweden Central",
        "model": "sora",
        "rate_limit": "60 requests/minute",
        "cost_per_video": 0.50
    })
}

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("""
    INSERT OR REPLACE INTO applications VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
""", (
    sora_data["id"], sora_data["name"], sora_data["category"], sora_data["vendor"],
    sora_data["status"], sora_data["criticality"], sora_data["description"],
    sora_data["version"], sora_data["go_live_date"], sora_data["hospitals_deployed"],
    sora_data["total_users"], sora_data["active_daily_users"],
    sora_data["architecture"], sora_data["hosting"], sora_data["api_capabilities"],
    sora_data["integration_level"], sora_data["typical_integration_cost"],
    sora_data["typical_timeline_weeks"], sora_data["integration_prerequisites"],
    sora_data["hipaa_compliant"], sora_data["requires_baa"], sora_data["phi_storage"],
    sora_data["audit_logging"], sora_data["contract_owner"], sora_data["contract_expiry"],
    sora_data["annual_cost"], sora_data["cost_model"],
    sora_data["technical_sme_name"], sora_data["technical_sme_email"],
    sora_data["technical_sme_expertise"], sora_data["clinical_sme_name"],
    sora_data["clinical_sme_email"], sora_data["clinical_sme_expertise"],
    sora_data["high_volume_pain_points"], sora_data["strategic_initiatives"],
    sora_data["known_limitations"], sora_data["full_data"]
))

cursor.execute("""
    INSERT OR REPLACE INTO system_keywords (app_id, keyword, context) VALUES
    ('APP-008', 'video', 'Video generation and demonstrations'),
    ('APP-008', 'sora', 'Azure OpenAI Sora model'),
    ('APP-008', 'demo', 'Demo video generation'),
    ('APP-008', 'training', 'Training video creation'),
    ('APP-008', 'visualization', 'Visual demonstrations')
""")

conn.commit()
conn.close()

print("✓ Sora (APP-008) added to application catalog")
print("✓ 5 keywords added for Sora detection")
