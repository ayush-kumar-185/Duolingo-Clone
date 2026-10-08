import pytest
from sqlmodel import Session, select
from database import engine
from models import User, Unit, Skill, Lesson, Exercise

def test_database_is_seeded():
    with Session(engine) as session:
        # Check if the user exists
        user = session.exec(select(User).where(User.username == "duo_learner")).first()
        assert user is not None, "Mock user should exist"
        assert user.xp == 150, "User should have 150 XP"
        
        # Check if unit and skill relationships are correct
        unit = session.exec(select(Unit).where(Unit.order == 1)).first()
        assert unit is not None, "Unit 1 should exist"
        
        # There should be 2 skills in unit 1
        skills = session.exec(select(Skill).where(Skill.unit_id == unit.id)).all()
        assert len(skills) == 2, "Unit 1 should have 2 skills"
        
        # Check lesson and exercises
        lesson = session.exec(select(Lesson).where(Lesson.skill_id == skills[0].id)).first()
        assert lesson is not None, "There should be a lesson for the first skill"
        
        exercises = session.exec(select(Exercise).where(Exercise.lesson_id == lesson.id)).all()
        assert len(exercises) == 3, "Lesson 1 should have 3 exercises"
        assert exercises[0].exercise_type == "multiple_choice"
