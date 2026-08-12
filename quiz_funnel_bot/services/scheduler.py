"""
Scheduler service — wraps APScheduler to send delayed funnel messages.

Uses AsyncIOScheduler (no extra broker needed for a single-process bot).
For multi-process / Redis-backed scheduling replace with APScheduler + RedisJobStore
or use Celery / dramatiq.
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.date import DateTrigger
from datetime import datetime, timedelta, timezone

from aiogram import Bot

scheduler = AsyncIOScheduler(timezone="UTC")


def start_scheduler() -> None:
    if not scheduler.running:
        scheduler.start()


async def _send_step_job(bot: Bot, user_id: int, step: int) -> None:
    """Actual job executed by APScheduler — imports lazily to avoid circular deps."""
    from database.connection import AsyncSessionLocal
    from handlers.funnel import send_step

    async with AsyncSessionLocal() as session:
        await send_step(bot=bot, user_id=user_id, step=step, session=session)


async def schedule_next_step(
    bot: Bot, user_id: int, step: int, delay_seconds: int
) -> None:
    """
    Schedule delivery of `step` for `user_id` after `delay_seconds`.
    If delay is 0, fires within the next second (near-immediate).
    """
    run_at = datetime.now(tz=timezone.utc) + timedelta(seconds=max(delay_seconds, 1))
    job_id = f"step_{user_id}_{step}"

    # Remove any existing job for the same user+step (idempotent)
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)

    scheduler.add_job(
        _send_step_job,
        trigger=DateTrigger(run_date=run_at),
        id=job_id,
        kwargs={"bot": bot, "user_id": user_id, "step": step},
        misfire_grace_time=300,
    )
