"""
Funnel handler — processes quiz answers and advances the user through steps.

Each STEP_CONTENT entry defines:
  - text  : message to send at this step
  - delay : seconds to wait before sending the NEXT step (0 = immediate)
"""

from aiogram import Bot, F, Router
from aiogram.types import CallbackQuery, Message
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import User, UserStep
from services.scheduler import schedule_next_step

router = Router()

# ── Funnel content map ─────────────────────────────────────────────────────────
STEP_CONTENT: dict[int, dict] = {
    1: {
        "text": "🔹 Шаг 1: Какова твоя главная цель?\n\nОтветь в свободной форме или нажми /skip",
        "delay": 0,
    },
    2: {
        "text": "🔹 Шаг 2: Сколько времени в день ты готов уделять обучению?",
        "delay": 3600,  # 1 hour after step 1
    },
    3: {
        "text": "🔹 Шаг 3: Какой у тебя текущий уровень?",
        "delay": 86400,  # 24 hours after step 2
    },
    4: {
        "text": "🎉 Отлично! Ты прошёл квиз. Вот твой персональный план:\n\n"
                "📌 [здесь будет контент на основе ответов]\n\n"
                "Поделись ботом с другом и получи бонус: t.me/YourBot?start=ref_{user_id}",
        "delay": 0,
    },
}

LAST_STEP = max(STEP_CONTENT.keys())


async def send_step(bot: Bot, user_id: int, step: int, session: AsyncSession) -> None:
    """Send step content and schedule the next one."""
    content = STEP_CONTENT.get(step)
    if not content:
        return

    text = content["text"].format(user_id=user_id)
    await bot.send_message(chat_id=user_id, text=text)

    # Persist progress
    user = await session.get(User, user_id)
    if user:
        user.current_step = step
        session.add(UserStep(user_id=user_id, step_number=step))
        await session.commit()

    # Schedule the next step unless we're done
    next_step = step + 1
    if next_step <= LAST_STEP:
        await schedule_next_step(
            bot=bot,
            user_id=user_id,
            step=next_step,
            delay_seconds=content["delay"],
        )


# ── Message handler (free-text answers advance the funnel) ────────────────────
@router.message(F.text & ~F.text.startswith("/"))
async def handle_answer(message: Message, bot: Bot, session: AsyncSession) -> None:
    user = await session.get(User, message.from_user.id)
    if not user:
        return

    next_step = user.current_step + 1
    if next_step > LAST_STEP:
        await message.answer("Ты уже завершил квиз 🏁")
        return

    await send_step(bot=bot, user_id=user.id, step=next_step, session=session)
