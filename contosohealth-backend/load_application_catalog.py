#!/usr/bin/env python3
"""
Load ContosoHealth Application Catalog into SQLite database
This provides the system knowledge for AI agents to understand integrations,
costs, timelines, and opportunities.
"""

import json
import sqlite3
import sys

def create_tables(conn):
    """Create database schema for application catalog"""
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT,
            vendor TEXT,
            status TEXT,
            criticality TEXT,
            description TEXT,
            
            -- Deployment info
            version TEXT,
            go_live_date TEXT,
            hospitals_deployed TEXT,
            total_users INTEGER,
            active_daily_users INTEGER,
            
            -- Technical details
            architecture TEXT,
            hosting TEXT,
            api_capabilities TEXT, -- JSON
            
            -- Integration complexity
            integration_level TEXT,
            typical_integration_cost INTEGER,
            typical_timeline_weeks INTEGER,
            integration_prerequisites TEXT, -- JSON array
            
            -- Compliance & Security
            hipaa_compliant BOOLEAN,
            requires_baa BOOLEAN,
            phi_storage BOOLEAN,
            audit_logging TEXT,
            
            -- Financial
            contract_owner TEXT,
            contract_expiry TEXT,
            annual_cost INTEGER,
            cost_model TEXT,
            
            -- SMEs
            technical_sme_name TEXT,
            technical_sme_email TEXT,
            technical_sme_expertise TEXT,
            clinical_sme_name TEXT,
            clinical_sme_email TEXT,
            clinical_sme_expertise TEXT,
            
            -- Innovation opportunities
            high_volume_pain_points TEXT, -- JSON
            strategic_initiatives TEXT, -- JSON
            known_limitations TEXT, -- JSON
            
            -- Full JSON for detailed queries
            full_data TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS existing_integrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_id TEXT,
            system_name TEXT,
            integration_type TEXT,
            direction TEXT,
            description TEXT,
            limitation TEXT,
            FOREIGN KEY (app_id) REFERENCES applications(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS planned_integrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_id TEXT,
            system_name TEXT,
            purpose TEXT,
            estimated_cost INTEGER,
            timeline TEXT,
            benefit TEXT,
            FOREIGN KEY (app_id) REFERENCES applications(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pain_points (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_id TEXT,
            pain_point TEXT,
            ideas_submitted INTEGER,
            potential_value TEXT,
            solutions TEXT, -- JSON array
            FOREIGN KEY (app_id) REFERENCES applications(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_keywords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_id TEXT,
            keyword TEXT,
            context TEXT,
            FOREIGN KEY (app_id) REFERENCES applications(id)
        )
    """)
    
    conn.commit()
    print("✓ Database schema created")

def load_application_data(conn, catalog_data):
    """Load application catalog data into database"""
    cursor = conn.cursor()
    
    applications = catalog_data.get('applications', [])
    
    for app in applications:
        app_id = app.get('id')
        name = app.get('name')
        category = app.get('category')
        vendor = app.get('vendor')
        status = app.get('status')
        criticality = app.get('criticality')
        description = app.get('description')
        
        deployment = app.get('deployment', {})
        version = deployment.get('version')
        go_live_date = deployment.get('go_live_date')
        hospitals_deployed = deployment.get('hospitals_deployed', '')
        if isinstance(hospitals_deployed, list):
            hospitals_deployed = ', '.join(hospitals_deployed)
        total_users = deployment.get('total_users', 0)
        active_daily_users = deployment.get('active_daily_users', 0)
        
        technical = app.get('technical_details', {})
        architecture = technical.get('architecture', '')
        hosting = technical.get('hosting', '')
        api_capabilities = json.dumps(technical.get('api_capabilities', {}))
        
        integration = app.get('integration_complexity', {})
        integration_level = integration.get('level', '')
        
        cost_value = integration.get('typical_integration_cost', 0)
        if isinstance(cost_value, dict):
            typical_integration_cost = list(cost_value.values())[0] if cost_value else 0
        else:
            typical_integration_cost = cost_value if cost_value else 0
        
        timeline_value = integration.get('typical_timeline_weeks', 0)
        if isinstance(timeline_value, dict):
            typical_timeline_weeks = list(timeline_value.values())[0] if timeline_value else 0
        else:
            typical_timeline_weeks = timeline_value if timeline_value else 0
        
        integration_prerequisites = json.dumps(integration.get('prerequisites', []))
        
        compliance = app.get('compliance_security', {})
        hipaa_compliant = compliance.get('hipaa_compliant', False)
        requires_baa = compliance.get('requires_baa', False)
        phi_storage = compliance.get('phi_storage', False)
        audit_logging = compliance.get('audit_logging', '')
        
        financial = app.get('financial', {})
        contract_owner = financial.get('contract_owner', '')
        contract_expiry = financial.get('contract_expiry', '')
        annual_cost = financial.get('annual_cost', 0)
        cost_model = financial.get('cost_model', '')
        
        smes = app.get('subject_matter_experts', {})
        tech_sme = smes.get('technical_sme', {})
        clinical_sme = smes.get('clinical_sme', {})
        
        technical_sme_name = tech_sme.get('name', '')
        technical_sme_email = tech_sme.get('email', '')
        technical_sme_expertise = tech_sme.get('expertise', '')
        
        clinical_sme_name = clinical_sme.get('name', '')
        clinical_sme_email = clinical_sme.get('email', '')
        clinical_sme_expertise = clinical_sme.get('expertise', '')
        
        innovation = app.get('innovation_opportunities', {})
        high_volume_pain_points = json.dumps(innovation.get('high_volume_pain_points', []))
        strategic_initiatives = json.dumps(innovation.get('strategic_initiatives', []))
        known_limitations = json.dumps(app.get('known_limitations', []))
        
        full_data = json.dumps(app)
        
        cursor.execute("""
            INSERT OR REPLACE INTO applications VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        """, (
            app_id, name, category, vendor, status, criticality, description,
            version, go_live_date, hospitals_deployed, total_users, active_daily_users,
            architecture, hosting, api_capabilities,
            integration_level, typical_integration_cost, typical_timeline_weeks, integration_prerequisites,
            hipaa_compliant, requires_baa, phi_storage, audit_logging,
            contract_owner, contract_expiry, annual_cost, cost_model,
            technical_sme_name, technical_sme_email, technical_sme_expertise,
            clinical_sme_name, clinical_sme_email, clinical_sme_expertise,
            high_volume_pain_points, strategic_initiatives, known_limitations,
            full_data
        ))
        
        for integration in app.get('existing_integrations', []):
            cursor.execute("""
                INSERT INTO existing_integrations (app_id, system_name, integration_type, direction, description, limitation)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                app_id,
                integration.get('system'),
                integration.get('type'),
                integration.get('direction'),
                integration.get('description', ''),
                integration.get('limitation', '')
            ))
        
        for planned in app.get('planned_integrations', []):
            cursor.execute("""
                INSERT INTO planned_integrations (app_id, system_name, purpose, estimated_cost, timeline, benefit)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                app_id,
                planned.get('system'),
                planned.get('purpose'),
                planned.get('estimated_cost', 0),
                planned.get('timeline', ''),
                planned.get('benefit', '')
            ))
        
        for pain_point in innovation.get('high_volume_pain_points', []):
            cursor.execute("""
                INSERT INTO pain_points (app_id, pain_point, ideas_submitted, potential_value, solutions)
                VALUES (?, ?, ?, ?, ?)
            """, (
                app_id,
                pain_point.get('pain_point'),
                pain_point.get('ideas_submitted', 0),
                pain_point.get('potential_value', ''),
                json.dumps(pain_point.get('solutions', []))
            ))
        
        keywords = []
        if name.lower() == 'epic':
            keywords = ['epic', 'ehr', 'electronic health record', 'patient record', 'chart', 'mar', 'medication administration', 'rover', 'mychart', 'cadence', 'beaker', 'optime', 'willow', 'stork']
        elif name.lower() == 'pyxis medstation':
            keywords = ['pyxis', 'medication cabinet', 'med cabinet', 'dispensing', 'narcotic', 'controlled substance']
        elif name.lower() == 'snowflake data cloud':
            keywords = ['snowflake', 'data warehouse', 'analytics', 'reporting', 'dashboard', 'data']
        elif name.lower() == 'workday':
            keywords = ['workday', 'schedule', 'scheduling', 'time off', 'pto', 'payroll', 'shift', 'hr', 'human resources']
        elif name.lower() == 'servicenow':
            keywords = ['servicenow', 'ticket', 'it help', 'help desk', 'incident', 'service request']
        elif name.lower() == 'microsoft azure':
            keywords = ['azure', 'cloud', 'ai', 'machine learning', 'gpu', 'h100']
        elif name.lower() == 'microsoft power platform':
            keywords = ['power apps', 'power automate', 'power bi', 'low code', 'no code', 'automation']
        
        for keyword in keywords:
            cursor.execute("""
                INSERT INTO system_keywords (app_id, keyword, context)
                VALUES (?, ?, ?)
            """, (app_id, keyword, name))
    
    conn.commit()
    print(f"✓ Loaded {len(applications)} applications")

def main():
    json_path = '/home/ubuntu/attachments/ced457a7-cfcd-49e9-a9fc-c3f62d4596fc/contosohealth_application_catalog.json'
    
    try:
        with open(json_path, 'r') as f:
            catalog_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find {json_path}")
        sys.exit(1)
    
    db_path = 'contosohealth_ideas.db'
    conn = sqlite3.connect(db_path)
    
    try:
        create_tables(conn)
        
        load_application_data(conn, catalog_data)
        
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM applications")
        app_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM existing_integrations")
        integration_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM pain_points")
        pain_point_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM system_keywords")
        keyword_count = cursor.fetchone()[0]
        
        print(f"\n✓ Database loaded successfully!")
        print(f"  - {app_count} applications")
        print(f"  - {integration_count} existing integrations")
        print(f"  - {pain_point_count} pain points")
        print(f"  - {keyword_count} system keywords")
        
        print(f"\nSample applications:")
        cursor.execute("SELECT id, name, category FROM applications LIMIT 5")
        for row in cursor.fetchall():
            print(f"  - {row[0]}: {row[1]} ({row[2]})")
        
    finally:
        conn.close()

if __name__ == '__main__':
    main()
