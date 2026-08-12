"""
Telegram Web App handler.

The Mini App sends data via sendData() → arrives as message.web_app_data.data (JSON string).
"""

import json

from aiogram import Router
from aiogram.types import Message
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import User

router = Router()


@router.message(lambda m: m.web_app_data is not None)
async def handle_webapp_data(message: Message, session: AsyncSession) -> None:
    raw = message.web_app_data.data
    try:
        payload: dict = json.loads(raw)
    except json.JSONDecodeError:
        await message.answer("⚠️ Получены некорректные данные от Web App.")
        return

    user = await session.get(User, message.from_user.id)
    if not user:
        return

    # Example: store quiz answers passed from the Mini App
    action = payload.get("action")

    if action == "quiz_result":
        score = payload.get("score", 0)
        await message.answer(f"✅ Результат квиза получен! Твой счёт: {score} 🎯")
        # TODO: persist score / trigger CRM webhook here

    elif action == "purchase":
        product_id = payload.get("product_id")
        await message.answer(f"💳 Запрос на покупку товара {product_id} принят.")
        # TODO: integrate payment provider

    else:
        await message.answer("Данные получены, обрабатываем...")
