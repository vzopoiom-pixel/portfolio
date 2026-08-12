"""
Middleware that checks channel subscription before processing any update.

Skip list: /start is always allowed so users can join via referral links.
"""

from typing import Any, Awaitable, Callable

from aiogram import BaseMiddleware, Bot
from aiogram.types import Message, TelegramObject

from config import settings
from database.models import User
from database.connection import AsyncSessionLocal


class CheckSubscriptionMiddleware(BaseMiddleware):
    SKIP_COMMANDS = {"/start"}

    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        if not isinstance(event, Message):
            return await handler(event, data)

        # Always allow /start
        if event.text and any(event.text.startswith(cmd) for cmd in self.SKIP_COMMANDS):
            return await handler(event, data)

        # Skip check if no channel configured
        if not settings.CHANNEL_ID:
            return await handler(event, data)

        bot: Bot = data["bot"]
        user_id = event.from_user.id

        try:
            member = await bot.get_chat_member(settings.CHANNEL_ID, user_id)
            is_member = member.status not in ("left", "kicked", "banned")
        except Exception:
            is_member = False

        if not is_member:
            await event.answer(
                f"❗ Чтобы пользоваться ботом, подпишись на канал: {settings.CHANNEL_ID}\n\n"
                "После подписки нажми /start"
            )
            return  # Stop propagation

        # Sync subscription flag to DB (best-effort)
        async with AsyncSessionLocal() as session:
            user = await session.get(User, user_id)
            if user and not user.is_subscribed:
                user.is_subscribed = True
                await session.commit()

        return await handler(event, data)
