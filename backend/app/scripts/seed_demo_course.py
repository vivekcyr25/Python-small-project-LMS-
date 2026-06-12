"""
Seed a demo course with sections, lessons, and a quiz so the
LMS engine (Phase 2) can be exercised end-to-end immediately.

Usage:
    cd /app/backend && python -m app.scripts.seed_demo_course
"""
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.content import Section, Lesson
from app.models.assessment import Quiz, Question, AnswerOption
from app.core.security import get_password_hash


def seed_default_users() -> None:
    db = SessionLocal()
    try:
        instructor = db.query(User).filter(User.email == "instructor@aurora.lms").first()
        if instructor is None:
            instructor = User(
                email="instructor@aurora.lms",
                full_name="Vivek Kumar",
                hashed_password=get_password_hash("@Vivek50"),
                role=UserRole.INSTRUCTOR.value,
                is_active=True,
            )
            db.add(instructor)
        else:
            instructor.full_name = "Vivek Kumar"
            instructor.hashed_password = get_password_hash("@Vivek50")
            instructor.role = UserRole.INSTRUCTOR.value
            instructor.is_active = True

        admin = db.query(User).filter(User.email == "admin@aurora.lms").first()
        if admin is None:
            admin = User(
                email="admin@aurora.lms",
                full_name="Aurora Admin",
                hashed_password=get_password_hash("@Vivek60"),
                role=UserRole.ADMIN.value,
                is_active=True,
            )
            db.add(admin)
        else:
            admin.full_name = "Aurora Admin"
            admin.hashed_password = get_password_hash("@Vivek60")
            admin.role = UserRole.ADMIN.value
            admin.is_active = True

        db.commit()
    finally:
        db.close()


def main() -> None:
    # Ensure schema exists when running against SQLite dev DB
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # ── 1. Instructor account ──
        instructor = db.query(User).filter(User.email == "instructor@aurora.lms").first()
        if not instructor:
            instructor = User(
                email="instructor@aurora.lms",
                full_name="Vivek Kumar",
                hashed_password=get_password_hash("@Vivek50"),
                role=UserRole.INSTRUCTOR.value,
                is_active=True,
            )
            db.add(instructor)
            db.commit()
            db.refresh(instructor)
            print(f"[+] Created instructor (id={instructor.id}, email=instructor@aurora.lms, password=@Vivek50)")
        else:
            instructor.hashed_password = get_password_hash("@Vivek50")
            db.commit()
            print(f"[=] Instructor already exists (id={instructor.id}), password updated")

        # ── 2. Admin account ──
        admin = db.query(User).filter(User.email == "admin@aurora.lms").first()
        if not admin:
            admin = User(
                email="admin@aurora.lms",
                full_name="Aurora Admin",
                hashed_password=get_password_hash("@Vivek60"),
                role=UserRole.ADMIN.value,
                is_active=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"[+] Created admin (id={admin.id}, email=admin@aurora.lms, password=@Vivek60)")
        else:
            admin.hashed_password = get_password_hash("@Vivek60")
            db.commit()
            print(f"[=] Admin already exists (id={admin.id}), password updated")

        # ── 3. Student account ──
        student = db.query(User).filter(User.email == "student@aurora.lms").first()
        if not student:
            student = User(
                email="student@aurora.lms",
                full_name="Demo Student",
                hashed_password=get_password_hash("student123"),
                role=UserRole.STUDENT.value,
                is_active=True,
            )
            db.add(student)
            db.commit()
            db.refresh(student)
            print(f"[+] Created student  (id={student.id}, password=student123)")
        else:
            print(f"[=] Student already exists (id={student.id})")

        # ── 3. Course ──
        course = db.query(Course).filter(Course.slug == "aurora-react-foundations").first()
        if not course:
            course = Course(
                title="React Foundations with Aurora",
                slug="aurora-react-foundations",
                description=(
                    "A hands-on introduction to modern React: hooks, "
                    "components, state, and routing. Built to ship real apps."
                ),
                level="beginner",
                price=0,
                is_published=True,
                instructor_id=instructor.id,
            )
            db.add(course)
            db.commit()
            db.refresh(course)
            print(f"[+] Created course (id={course.id})")
        else:
            print(f"[=] Course already exists (id={course.id})")

        # Skip seeding sections/lessons if any already exist on this course
        if db.query(Section).filter(Section.course_id == course.id).first():
            print("[=] Course already has sections — skipping content seed.")
            return

        # ── 4. Section 1: Getting Started ──
        sec1 = Section(
            course_id=course.id,
            title="Getting Started",
            description="Set up your environment and write your first component.",
            order_index=1,
            is_published=True,
        )
        db.add(sec1)
        db.flush()

        db.add(
            Lesson(
                section_id=sec1.id,
                title="Welcome & Setup",
                description="Install Node, Vite, and create your first project.",
                lesson_type="markdown",
                content_text=(
                    "# Welcome\n\n"
                    "Hey! In this lesson we'll set up your dev environment.\n\n"
                    "## What you'll need\n\n"
                    "- **Node.js 20+**\n"
                    "- A code editor like **VS Code**\n"
                    "- A terminal\n\n"
                    "## Create the project\n\n"
                    "Run the following command:\n\n"
                    "```\nnpm create vite@latest my-app -- --template react-ts\n```\n\n"
                    "Then `cd my-app && npm install && npm run dev`."
                ),
                order_index=1,
                is_preview=True,
                is_published=True,
            )
        )
        db.add(
            Lesson(
                section_id=sec1.id,
                title="Your First Component",
                description="Build a 'Hello, world' React component.",
                lesson_type="markdown",
                content_text=(
                    "# Components\n\n"
                    "A component is just a function that returns JSX.\n\n"
                    "```\nexport default function Hello() {\n  "
                    "return <h1>Hello, world!</h1>;\n}\n```\n\n"
                    "Render it in `App.tsx` and you're off to the races."
                ),
                order_index=2,
                is_published=True,
            )
        )

        # ── 5. Section 2: State & Hooks ──
        sec2 = Section(
            course_id=course.id,
            title="State & Hooks",
            description="Manage component state with useState and useEffect.",
            order_index=2,
            is_published=True,
        )
        db.add(sec2)
        db.flush()

        db.add(
            Lesson(
                section_id=sec2.id,
                title="useState Basics",
                lesson_type="markdown",
                content_text=(
                    "# useState\n\n"
                    "`useState` returns a value and a setter:\n\n"
                    "```\nconst [count, setCount] = useState(0);\n```\n\n"
                    "Click a button → call `setCount(count + 1)` → React re-renders."
                ),
                order_index=1,
                is_published=True,
            )
        )

        quiz_lesson = Lesson(
            section_id=sec2.id,
            title="Quiz: Hooks Knowledge Check",
            description="Test what you've learned about React hooks.",
            lesson_type="quiz",
            order_index=2,
            is_published=True,
        )
        db.add(quiz_lesson)
        db.flush()

        # ── 6. Quiz with 3 questions ──
        quiz = Quiz(
            lesson_id=quiz_lesson.id,
            title="Hooks Knowledge Check",
            description="Three quick questions to confirm you've got the basics.",
            passing_score=60,
        )
        db.add(quiz)
        db.flush()

        # Q1 — single choice
        q1 = Question(
            quiz_id=quiz.id,
            question_text="What does useState return?",
            question_type="mcq_single",
            points=1,
            order_index=1,
        )
        db.add(q1)
        db.flush()
        db.add_all([
            AnswerOption(question_id=q1.id, option_text="A function", is_correct=False, order_index=1),
            AnswerOption(question_id=q1.id, option_text="A pair: [value, setter]", is_correct=True, order_index=2),
            AnswerOption(question_id=q1.id, option_text="A Promise", is_correct=False, order_index=3),
            AnswerOption(question_id=q1.id, option_text="Nothing", is_correct=False, order_index=4),
        ])

        # Q2 — multiple choice
        q2 = Question(
            quiz_id=quiz.id,
            question_text="Which of these are React hooks? (select all)",
            question_type="mcq_multiple",
            points=2,
            order_index=2,
        )
        db.add(q2)
        db.flush()
        db.add_all([
            AnswerOption(question_id=q2.id, option_text="useState", is_correct=True, order_index=1),
            AnswerOption(question_id=q2.id, option_text="useEffect", is_correct=True, order_index=2),
            AnswerOption(question_id=q2.id, option_text="useRouter", is_correct=False, order_index=3),
            AnswerOption(question_id=q2.id, option_text="useMemo", is_correct=True, order_index=4),
        ])

        # Q3 — short answer
        q3 = Question(
            quiz_id=quiz.id,
            question_text="What hook do you use to run side-effects?",
            question_type="short_answer",
            points=1,
            order_index=3,
        )
        db.add(q3)
        db.flush()
        db.add(AnswerOption(question_id=q3.id, option_text="useEffect", is_correct=True, order_index=1))

        db.commit()
        print(f"[+] Seeded 2 sections, 4 lessons, 1 quiz (3 questions).")
        print()
        print("====================================")
        print(" Demo logins:")
        print("   instructor@aurora.lms / @Vivek50  (instructor)")
        print("   admin@aurora.lms      / @Vivek60  (admin)")
        print("   student@aurora.lms    / student123")
        print(" Course: React Foundations with Aurora")
        print("====================================")
    finally:
        db.close()


if __name__ == "__main__":
    main()
main()
