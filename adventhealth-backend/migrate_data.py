import json
import os
from azure.cosmos import CosmosClient
from dotenv import load_dotenv

load_dotenv()

COSMOS_CONNECTION_STRING = os.getenv("COSMOS_CONNECTION_STRING")
COSMOS_DATABASE_NAME = os.getenv("COSMOS_DATABASE_NAME")

client = CosmosClient.from_connection_string(COSMOS_CONNECTION_STRING)
database = client.get_database_client(COSMOS_DATABASE_NAME)
ideas_container = database.get_container_client("ideas")
comments_container = database.get_container_client("comments")

with open("../docs/50-Healthcare-Innovation-Ideas.json", "r") as f:
    ideas = json.load(f)

print(f"Migrating {len(ideas)} ideas to CosmosDB...")

for idea in ideas:
    try:
        ideas_container.create_item(body=idea)
        print(f"✓ Migrated {idea['id']}: {idea['title']}")
    except Exception as e:
        print(f"✗ Error migrating {idea['id']}: {str(e)}")

sample_comments = [
    {
        "id": "c1",
        "ideaId": "idea-001",
        "parentId": None,
        "author": "Dr. Sarah Mitchell",
        "department": "Emergency Medicine",
        "createdAt": "2025-11-01T14:30:00Z",
        "content": "This is exactly what we need! Our ED has been struggling with bed placement delays. Have you considered integrating with our current Epic system?"
    },
    {
        "id": "c1-r1",
        "ideaId": "idea-001",
        "parentId": "c1",
        "author": "Dr. Robert Kim",
        "department": "Emergency Department",
        "createdAt": "2025-11-01T15:45:00Z",
        "content": "Great question! Yes, the AI system would integrate directly with Epic through their APIs. We've seen similar implementations at other health systems with excellent results."
    },
    {
        "id": "c2",
        "ideaId": "idea-001",
        "parentId": None,
        "author": "Jennifer Walsh",
        "department": "Nursing Administration",
        "createdAt": "2025-11-02T09:15:00Z",
        "content": "I love this idea! We waste so much time calling around for beds. Would this also help with predicting discharge times?"
    },
    {
        "id": "c3",
        "ideaId": "idea-001",
        "parentId": None,
        "author": "Michael Chen",
        "department": "IT",
        "createdAt": "2025-11-02T16:20:00Z",
        "content": "From a technical perspective, this is very feasible. We already have the infrastructure for real-time data processing. I'd be happy to collaborate on the implementation."
    },
    {
        "id": "c3-r1",
        "ideaId": "idea-001",
        "parentId": "c3",
        "author": "Dr. Robert Kim",
        "department": "Emergency Department",
        "createdAt": "2025-11-02T17:00:00Z",
        "content": "That would be fantastic! Let's set up a meeting to discuss the technical requirements."
    }
]

sample_comments_003 = [
    {
        "id": "c4",
        "ideaId": "idea-003",
        "parentId": None,
        "author": "Amanda Foster",
        "department": "Pain Management",
        "createdAt": "2025-10-28T11:00:00Z",
        "content": "We piloted VR for pain management in our unit and saw amazing results! Patients loved it and we reduced opioid use significantly. Happy to share our experience."
    },
    {
        "id": "c5",
        "ideaId": "idea-003",
        "parentId": None,
        "author": "Dr. Patricia Anderson",
        "department": "Pharmacy",
        "createdAt": "2025-10-29T13:30:00Z",
        "content": "This aligns perfectly with our opioid reduction initiative. What age groups responded best to VR therapy?"
    },
    {
        "id": "c5-r1",
        "ideaId": "idea-003",
        "parentId": "c5",
        "author": "Dr. Lisa Rodriguez",
        "department": "Pain Management",
        "createdAt": "2025-10-29T14:15:00Z",
        "content": "We found it works well across all age groups, but particularly effective for patients 25-65. Older patients sometimes need more guidance with the technology."
    }
]

all_comments = sample_comments + sample_comments_003

print(f"\nMigrating {len(all_comments)} comments to CosmosDB...")

for comment in all_comments:
    try:
        comments_container.create_item(body=comment)
        print(f"✓ Migrated comment {comment['id']} for {comment['ideaId']}")
    except Exception as e:
        print(f"✗ Error migrating comment {comment['id']}: {str(e)}")

print("\nUpdating comment counts...")
for idea_id in ["idea-001", "idea-003"]:
    try:
        query = f"SELECT * FROM c WHERE c.id = '{idea_id}'"
        items = list(ideas_container.query_items(
            query=query,
            enable_cross_partition_query=True
        ))
        if items:
            idea = items[0]
            comment_count = len([c for c in all_comments if c["ideaId"] == idea_id and not c.get("parentId")])
            idea["commentCount"] = comment_count
            ideas_container.upsert_item(idea)
            print(f"✓ Updated comment count for {idea_id}: {comment_count}")
    except Exception as e:
        print(f"✗ Error updating comment count for {idea_id}: {str(e)}")

print("\n✅ Migration complete!")
