"""phase 2 — sections, lessons, progress, quizzes (spec-compliant)

Replaces the legacy Phase 2/3 scaffold tables with the spec-defined ones:
- modules → sections (with description, order_index, is_published, updated_at)
- lessons (new fields: description, lesson_type, content_text, content_url,
  duration_seconds, order_index, is_preview, is_published, updated_at)
- progress → lesson_progress (with status, progress_percent,
  resume_position_seconds, created_at, updated_at, unique user_id+lesson_id)
- quizzes (lesson_id unique FK, passing_score, timestamps)
- questions (question_text, question_type, points, order_index)
- answer_options (option_text, is_correct, order_index)
- quiz_attempts (score, max_score, percentage, passed)
- quiz_attempt_answers (selected_option_ids JSON, answer_text, is_correct,
  points_awarded)

Strategy: destructive — drop legacy tables and recreate. The legacy tables
held only scaffold data; switching schemas in place would need many
incompatible ALTERs across both SQLite and PostgreSQL. This migration
targets PostgreSQL.

Revision ID: b7e1f0c2d3a4
Revises: 51a515000d30
Create Date: 2026-01-15
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "b7e1f0c2d3a4"
down_revision = "51a515000d30"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Drop legacy Phase 2/3 scaffold tables (data is non-production scaffold) ──
    # Order matters because of FK dependencies.
    for table in (
        "quiz_attempt_answers_dummy",
        "quiz_attempts_dummy",
        "answer_options_dummy",
        "progress",
        "questions",
        "quizzes",
        "lessons",
        "modules",
    ):
        op.execute(f"DROP TABLE IF EXISTS {table} CASCADE")

    # ── sections ──
    op.create_table(
        "sections",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("course_id", sa.Integer(), sa.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # ── lessons ──
    op.create_table(
        "lessons",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("section_id", sa.Integer(), sa.ForeignKey("sections.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("lesson_type", sa.String(), nullable=False, server_default="markdown"),
        sa.Column("content_text", sa.Text(), nullable=True),
        sa.Column("content_url", sa.String(), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_preview", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # ── lesson_progress ──
    op.create_table(
        "lesson_progress",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("lesson_id", sa.Integer(), sa.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("status", sa.String(), nullable=False, server_default="not_started"),
        sa.Column("progress_percent", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("resume_position_seconds", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "lesson_id", name="_user_lesson_uc"),
    )

    # ── quizzes ──
    op.create_table(
        "quizzes",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("lesson_id", sa.Integer(), sa.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, unique=True, index=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("passing_score", sa.Integer(), nullable=False, server_default="60"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # ── questions ──
    op.create_table(
        "questions",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("quiz_id", sa.Integer(), sa.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("question_type", sa.String(), nullable=False, server_default="mcq_single"),
        sa.Column("points", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
    )

    # ── answer_options ──
    op.create_table(
        "answer_options",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("question_id", sa.Integer(), sa.ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("option_text", sa.Text(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
    )

    # ── quiz_attempts ──
    op.create_table(
        "quiz_attempts",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("quiz_id", sa.Integer(), sa.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("max_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("percentage", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("passed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── quiz_attempt_answers ──
    op.create_table(
        "quiz_attempt_answers",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("attempt_id", sa.Integer(), sa.ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("question_id", sa.Integer(), sa.ForeignKey("questions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("selected_option_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("answer_text", sa.Text(), nullable=True),
        sa.Column("is_correct", sa.Boolean(), nullable=True),
        sa.Column("points_awarded", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    for table in (
        "quiz_attempt_answers",
        "quiz_attempts",
        "answer_options",
        "questions",
        "quizzes",
        "lesson_progress",
        "lessons",
        "sections",
    ):
        op.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
