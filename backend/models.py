from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    xp: int = Field(default=0)
    streak: int = Field(default=0)
    hearts: int = Field(default=5)

class Unit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    order: int
    
    skills: List["Skill"] = Relationship(back_populates="unit")

class Skill(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    order: int
    unit_id: Optional[int] = Field(default=None, foreign_key="unit.id")
    
    unit: Optional[Unit] = Relationship(back_populates="skills")
    lessons: List["Lesson"] = Relationship(back_populates="skill")

class Lesson(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    order: int
    skill_id: Optional[int] = Field(default=None, foreign_key="skill.id")
    
    skill: Optional[Skill] = Relationship(back_populates="lessons")
    exercises: List["Exercise"] = Relationship(back_populates="lesson")

class Exercise(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    exercise_type: str # 'multiple_choice', 'translation', 'tap_words'
    question: str
    options: Optional[str] = None # JSON string list e.g., '["el hombre", "la mujer", "el niño"]'
    correct_answer: str
    lesson_id: Optional[int] = Field(default=None, foreign_key="lesson.id")
    
    lesson: Optional[Lesson] = Relationship(back_populates="exercises")

class UserProgress(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    skill_id: Optional[int] = Field(default=None, foreign_key="skill.id")
    completed_lessons: int = Field(default=0)
    is_completed: bool = Field(default=False)
