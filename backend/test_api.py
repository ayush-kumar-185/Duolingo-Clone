from fastapi.testclient import TestClient
from main import app
from sqlmodel import Session, select
from database import engine
from models import User

client = TestClient(app)

def test_get_user():
    response = client.get("/api/user")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "duo_learner"

def test_get_path():
    response = client.get("/api/path")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "skills" in data[0]

def test_get_lesson():
    # First, get the path to find a skill_id
    path_res = client.get("/api/path")
    skill_id = path_res.json()[0]["skills"][0]["id"]
    
    response = client.get(f"/api/skills/{skill_id}/lesson")
    assert response.status_code == 200
    data = response.json()
    assert "exercises" in data
    assert len(data["exercises"]) > 0

def test_update_progress():
    # Check current xp
    user_res = client.get("/api/user")
    initial_xp = user_res.json()["xp"]
    
    # Update progress
    payload = {
        "xp_gained": 10,
        "hearts_lost": 1,
        "lesson_completed": False
    }
    response = client.post("/api/progress", json=payload)
    assert response.status_code == 200
    
    # Verify updated xp
    updated_user = client.get("/api/user").json()
    assert updated_user["xp"] == initial_xp + 10
