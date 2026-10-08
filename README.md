# Duolingo Clone - Interactive Learning Platform

An immersive, fully functional clone of the Duolingo web application, meticulously crafted for the SDE Fullstack Assignment. It replicates Duolingo's vibrant design, engaging user experience, and core gamification loops while providing evaluator tools for easy testing.

## ✨ Key Features
* **Interactive Learning Path:** A scrollable, dynamic node-based path where lessons unlock sequentially. 
* **Gamified Mechanics:** Live-tracking of Hearts, XP, and Streaks. Incorrect answers cost hearts; correct answers grant XP upon lesson completion.
* **Diverse Exercise Types:** Supports Image Choice (with emojis/images), Multiple Choice, and Tap-Word Translation exercises—specifically omitting typing-only questions for a seamless click-based experience.
* **Multi-User System (Evaluator Controls):** A built-in Profile page designed explicitly for evaluators. It allows instantaneous switching between three pre-seeded users (`duo_learner`, `john_doe`, `jane_smith`) to test isolated progression states.
* **Global Leaderboard:** A fully interactive, responsive leaderboard ranking all seeded users by their accumulated XP, featuring custom medal UI for top ranks.
* **Pixel-Perfect Aesthetics:** Features Duolingo's signature bouncy micro-animations, color palettes, responsive sidebars, and sticky feedback footers.

---

## 🛠 Tech Stack
* **Frontend:** Next.js 14+ (App Router), React, TypeScript, TailwindCSS, Zustand (Global State Management), Lucide Icons.
* **Backend:** Python 3.10+, FastAPI, SQLModel (SQLAlchemy + Pydantic).
* **Database:** SQLite (Relational structure mapping Users, Progress, Units, and Lessons).

---

## 🏗 System Architecture
The application follows a decoupled client-server architecture:
1. **Backend (FastAPI):** Exposes a set of RESTful APIs to serve dynamic course content (Units, Skills, Lessons, Exercises) and manage user state. State isolation is achieved via the `x-username` HTTP header, seamlessly determining the active user.
2. **Frontend (Next.js):** Uses the App Router for blazing-fast navigation. Zustand globally manages the active user session and top-bar UI states without prop-drilling. The UI is strictly styled with TailwindCSS to meticulously recreate Duolingo's playful aesthetic.

---

## 🗄 Database Schema
The SQLite database (`database.db`) consists of the following strictly relational tables:
* **User:** Tracks global user state (`id`, `username`, `xp`, `streak`, `hearts`).
* **Unit:** Represents a broad section of the learning path (e.g., "Unit 1: Learn Hiragana").
* **Skill:** Represents an individual circular node on the path (`id`, `unit_id`, `title`, `order`).
* **Lesson:** Contains the actual learning loop, linked to a Skill.
* **Exercise:** Individual questions within a lesson (`exercise_type`, `question`, `options`, `correct_answer`).
* **UserProgress:** Tracks each user's isolated progression through specific skills (`completed_lessons`, `is_completed`).

---

## 🚀 Setup Instructions

### Prerequisites
* Node.js (v18+)
* Python (3.10+)

### 1. Backend Setup
Open a terminal, navigate to the project root, and run:
```bash
cd backend
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install fastapi "uvicorn[standard]" sqlmodel pydantic-settings

# Seed the database (Creates database.db and inserts Japanese course data & multiple users)
python seed.py

# Run the API server
uvicorn main:app --reload --port 8000
```
*The backend will now be running on `http://localhost:8000`.*

### 2. Frontend Setup
Open a second terminal, navigate to the project root, and run:
```bash
cd frontend

# Install dependencies
npm install

# Run the frontend development server
npm run dev
```
*The frontend will now be running on `http://localhost:3000`.*

---

## 🧪 Evaluator Testing Guide (How to test)
To thoroughly evaluate the application's capabilities, follow this flow:
1. **The Learning Path (`/learn`):** Observe the locked/unlocked state of nodes. Click the first active node and begin a lesson.
2. **Take a Lesson (`/lesson/[id]`):** Answer questions correctly and incorrectly. Observe the bouncy bottom-bar animations, dynamic UI colors, and real-time heart deduction.
3. **Check the Leaderboard (`/leaderboard`):** After finishing a lesson and gaining XP, navigate to the Leaderboard. See your score immediately reflected in the global standings.
4. **Switch Users (`/profile`):** Navigate to the Profile page (Evaluator Controls). Click on `john_doe`. You will see the UI immediately switch context. Navigate back to the Learn path, and you will see that `john_doe` has his own isolated progression path, completely separate from your previous session!

---

## 📌 Assumptions & Simplifications
* **Authentication:** A full JWT/OAuth auth flow is omitted. Instead, we implemented a robust "User Switcher" via the `x-username` header to demonstrate multi-user data isolation effectively for the assignment.
* **Audio:** Text-to-speech and speech recognition are omitted per the constraints. The focus is placed entirely on interactive UI/UX exercises (tapping and selecting).
* **Content Limits:** The learning path strictly uses a seeded Japanese course to demonstrate core functionality. All dynamic content is fetched strictly from the SQLite database.
