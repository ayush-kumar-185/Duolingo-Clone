import json
from sqlmodel import Session
from sqlalchemy import text
from database import engine, create_db_and_tables
from models import User, Unit, Skill, Lesson, Exercise, UserProgress

def seed_data():
    create_db_and_tables()
    
    with open('temp.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    with Session(engine) as session:
        session.execute(text("DELETE FROM userprogress"))
        session.execute(text("DELETE FROM exercise"))
        session.execute(text("DELETE FROM lesson"))
        session.execute(text("DELETE FROM skill"))
        session.execute(text("DELETE FROM unit"))
        session.execute(text("DELETE FROM user"))
        session.commit()

        user1 = User(username="duo_learner", xp=150, streak=3, hearts=5)
        user2 = User(username="john_doe", xp=340, streak=12, hearts=5)
        user3 = User(username="jane_smith", xp=250, streak=5, hearts=5)
        session.add(user1)
        session.add(user2)
        session.add(user3)
        session.commit()
        
        user = user1

        unit1 = Unit(title="Unit 1: Hiragana Basics", order=1)
        session.add(unit1)
        session.commit()
        session.refresh(unit1)

        # 1. Restore the EXACT basic lessons from last time!
        skill_intro = Skill(title="Hiragana 1", description="Learn basic vowels: a, i, u, e, o", order=1, unit_id=unit1.id)
        session.add(skill_intro)
        session.commit()
        session.refresh(skill_intro)

        lesson1 = Lesson(title="Lesson 1", order=1, skill_id=skill_intro.id)
        session.add(lesson1)
        session.commit()
        session.refresh(lesson1)

        ex1 = Exercise(
            exercise_type="image_choice",
            question="Which of these is 'sushi'?",
            options=json.dumps([
                {"text": "すし (su shi)", "image": "🍣"},
                {"text": "みず (mi zu)", "image": "💧"},
                {"text": "おちゃ (o cha)", "image": "🍵"}
            ], ensure_ascii=False),
            correct_answer="すし (sushi)",
            lesson_id=lesson1.id
        )
        ex2 = Exercise(
            exercise_type="image_choice",
            question="Which of these is 'water'?",
            options=json.dumps([
                {"text": "すし (su shi)", "image": "🍣"},
                {"text": "みず (mi zu)", "image": "💧"},
                {"text": "おちゃ (o cha)", "image": "🍵"}
            ], ensure_ascii=False),
            correct_answer="みず (mizu)",
            lesson_id=lesson1.id
        )
        ex3 = Exercise(
            exercise_type="tap_words",
            question="Translate 'I drink'",
            options=json.dumps(["私 (wa ta shi)", "飲みます (no mi ma su)", "パン (pa n)", "水 (mi zu)"], ensure_ascii=False),
            correct_answer="私 飲みます",
            lesson_id=lesson1.id
        )
        session.add(ex1)
        session.add(ex2)
        session.add(ex3)
        
        progress = UserProgress(user_id=user.id, skill_id=skill_intro.id, completed_lessons=0, is_completed=False)
        session.add(progress)

        glossary = data.get('glossary', {})
        def get_with_romaji(word):
            return f"{word} ({glossary[word]})" if word in glossary else word

        eng_to_jap = {
            "apple": "りんご", "bread": "パン", "milk": "ぎゅうにゅう", "water": "みず",
            "sushi": "すし", "tea": "おちゃ", "rice": "ごはん", "fish": "さかな",
            "egg": "たまご", "coffee": "コーヒー"
        }

        # 2. Now append the temp.json lessons after the basic ones (only 3 more to make 4 total)
        for idx, lesson_data in enumerate(data['lessons'][:3]):
            skill = Skill(
                title=lesson_data['title'],
                description=lesson_data.get('description', ''),
                order=idx + 2, # Start after Hiragana 1
                unit_id=unit1.id
            )
            session.add(skill)
            session.commit()
            session.refresh(skill)

            lesson = Lesson(
                title="Lesson 1",
                order=1,
                skill_id=skill.id
            )
            session.add(lesson)
            session.commit()
            session.refresh(lesson)

            for q_idx, q in enumerate(lesson_data['questions']):
                q_type = q['type']
                exercise_type = "multiple_choice"
                question_text = q.get('prompt', 'Question')
                options_json = "[]"
                correct_answer = q.get('answer', '')

                if q_type == "select_image":
                    exercise_type = "image_choice"
                    question_text = f"Which of these is '{q['answer']}'?"
                    opts = []
                    for o in q['options']:
                        jap = eng_to_jap.get(o['label'], o['label'])
                        opts.append({"text": get_with_romaji(jap), "image": o['emoji']})
                    options_json = json.dumps(opts, ensure_ascii=False)
                    correct_answer = get_with_romaji(eng_to_jap.get(q['answer'], q['answer']))
                elif q_type == "select_meaning":
                    exercise_type = "multiple_choice"
                    options_json = json.dumps(q['options'], ensure_ascii=False)
                elif q_type == "match_pairs":
                    exercise_type = "multiple_choice"
                    pair = q['pairs'][0]
                    question_text = f"What is the meaning of '{pair['left']}'?"
                    opts = [p['right'] for p in q['pairs']]
                    options_json = json.dumps(opts, ensure_ascii=False)
                    correct_answer = pair['right']
                elif q_type == "translate_wordbank":
                    exercise_type = "tap_words"
                    question_text = f"Translate: {q['source']}"
                    opts_with_romaji = [get_with_romaji(w) for w in q['wordBank']]
                    options_json = json.dumps(opts_with_romaji, ensure_ascii=False)
                elif q_type == "listen_type":
                    continue
                elif q_type == "fill_blank":
                    exercise_type = "multiple_choice"
                    question_text = f"Fill in the blank: {q['sentence']}"
                    options_json = json.dumps(q['options'], ensure_ascii=False)
                elif q_type == "type_answer":
                    continue

                ex = Exercise(
                    exercise_type=exercise_type,
                    question=question_text,
                    options=options_json,
                    correct_answer=correct_answer,
                    lesson_id=lesson.id
                )
                session.add(ex)
            
            progress = UserProgress(user_id=user.id, skill_id=skill.id, completed_lessons=0, is_completed=False)
            session.add(progress)

        session.commit()
        print("Successfully seeded the database from temp.json!")

if __name__ == "__main__":
    seed_data()
