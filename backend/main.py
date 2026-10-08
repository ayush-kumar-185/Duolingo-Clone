from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from pydantic import BaseModel

from database import engine, get_session
from models import User, Unit, Skill, Lesson, Exercise, UserProgress

app = FastAPI(title="Duolingo Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is running"}

def get_current_user(x_username: Optional[str] = Header(None), session: Session = Depends(get_session)):
    username = x_username or "duo_learner"
    user = session.exec(select(User).where(User.username == username)).first()
    return user

@app.get("/api/user")
def get_user(user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/api/users")
def get_all_users(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return users

@app.get("/api/leaderboard")
def get_leaderboard(session: Session = Depends(get_session)):
    users = session.exec(select(User).order_by(User.xp.desc())).all()
    return users

@app.get("/api/path")
def get_path(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    units = session.exec(select(Unit).order_by(Unit.order)).all()
    path_data = []
    
    if not user:
        return []
        
    progress_records = session.exec(select(UserProgress).where(UserProgress.user_id == user.id)).all()
    progress_map = {p.skill_id: p for p in progress_records}
    
    for unit in units:
        skills = session.exec(select(Skill).where(Skill.unit_id == unit.id).order_by(Skill.order)).all()
        skill_data = []
        for skill in skills:
            prog = progress_map.get(skill.id)
            skill_data.append({
                "id": skill.id,
                "title": skill.title,
                "description": skill.description,
                "order": skill.order,
                "is_completed": prog.is_completed if prog else False,
                "completed_lessons": prog.completed_lessons if prog else 0,
                "total_lessons": len(session.exec(select(Lesson).where(Lesson.skill_id == skill.id)).all()) or 1
            })
        
        path_data.append({
            "id": unit.id,
            "title": unit.title,
            "order": unit.order,
            "skills": skill_data
        })
        
    return path_data

@app.get("/api/skills/{skill_id}/lesson")
def get_lesson(skill_id: int, session: Session = Depends(get_session)):
    lesson = session.exec(select(Lesson).where(Lesson.skill_id == skill_id).order_by(Lesson.order)).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    exercises = session.exec(select(Exercise).where(Exercise.lesson_id == lesson.id)).all()
    return {
        "lesson_id": lesson.id,
        "title": lesson.title,
        "exercises": exercises
    }

class ProgressUpdate(BaseModel):
    xp_gained: int
    hearts_lost: int
    skill_id: Optional[int] = None
    lesson_completed: bool = False

@app.post("/api/progress")
def update_progress(update: ProgressUpdate, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.xp += update.xp_gained
    user.hearts = max(0, user.hearts - update.hearts_lost)
    
    if update.skill_id and update.lesson_completed:
        progress = session.exec(select(UserProgress).where(
            (UserProgress.user_id == user.id) & (UserProgress.skill_id == update.skill_id)
        )).first()
        
        if not progress:
            total = len(session.exec(select(Lesson).where(Lesson.skill_id == update.skill_id)).all()) or 1
            progress = UserProgress(user_id=user.id, skill_id=update.skill_id, completed_lessons=1, is_completed=(1 >= total))
            session.add(progress)
        elif not progress.is_completed:
            progress.completed_lessons += 1
            total = len(session.exec(select(Lesson).where(Lesson.skill_id == update.skill_id)).all()) or 1
            if progress.completed_lessons >= total:
                progress.is_completed = True
            
    session.commit()
    session.refresh(user)
    return {"user": user, "message": "Progress updated successfully"}
