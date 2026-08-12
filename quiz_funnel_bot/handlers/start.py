from aiogram import Bot, Router
from aiogram.filters import CommandStart
from aiogram.types import Message
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Referral, User
from services.scheduler import schedule_next_step

router = Router()


@router.message(CommandStart())
async def cmd_start(message: Message, bot: Bot, session: AsyncSession) -> None:
    user_id = message.from_user.id
    args = message.text.split(maxsplit=1)[1] if " " in message.text else ""

    # Upsert user
    user = await session.get(User, user_id)
    if not user:
        user = User(
            id=user_id,
            username=message.from_user.username,
            full_name=message.from_user.full_name,
        )
        session.add(user)

        # Handle referral link  ?start=ref_<referrer_id>
        if args.startswith("ref_"):
            try:
                referrer_id = int(args.removeprefix("ref_"))
                if referrer_id != user_id:
                    referral = Referral(referrer_id=referrer_id, referred_id=user_id)
                    session.add(referral)
            except ValueError:
                pass

        await session.commit()

    await message.answer(
        f"👋 Привет, {message.from_user.first_name}!\n\n"
        "Добро пожаловать в квиз-воронку. Сейчас я задам тебе несколько вопросов 🎯"
    )

    # Kick off step 1 immediately
    await schedule_next_step(bot=bot, user_id=user_id, step=1, delay_seconds=0)
