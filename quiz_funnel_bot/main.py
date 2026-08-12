import asyncio
import logging
from typing import Callable, Dict, Any, Awaitable

from aiogram import Bot, Dispatcher, BaseMiddleware, Router, F
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart, Command
from aiogram.types import TelegramObject, BotCommand, Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database.connection import init_db, AsyncSessionLocal
from handlers import funnel, webapp
from services.scheduler import start_scheduler

# ==========================================
# 1. PRIVATE CHANNEL & ADMIN CONFIGURATION
# ==========================================
# Your clean invite link for the NextStep Hub private channel
PRIVATE_CHANNEL_LINK = ""

# Verified ID of your channel from JSON dump
CHANNEL_ID = -1004317482281

# Your personal Telegram ID for receiving quiz reports
ADMIN_ID = 5525847783

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# Router for handling the onboarding quiz
start_router = Router()


# ==========================================
# 2. FINITE STATE MACHINE (FSM) FOR QUIZ
# ==========================================
class QuizStates(StatesGroup):
    waiting_for_step_1 = State()  # State: bot waits for Step 1 answer
    waiting_for_step_2 = State()  # State: bot waits for Step 2 answer


# ==========================================
# 3. ENGLISH QUIZ HANDLERS
# ==========================================

# Handler for /start command
@start_router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext, session: AsyncSession):
    await state.clear()  # Clear any previous quiz memory for this user
    
    welcome_text = (
        "👋 Welcome!\n\n"
        "Welcome to our smart assessment assistant. I am going to ask you a few questions to get started! 🎯"
    )
    await message.answer(welcome_text)
    
    await message.answer(
        "🔷 <b>Step 1: What is your primary goal?</b>\n\n"
        "Please reply in free form or click /skip to bypass this question."
    )
    await state.set_state(QuizStates.waiting_for_step_1)


# Handler for Step 1
@start_router.message(QuizStates.waiting_for_step_1)
async def process_step_1(message: Message, state: FSMContext, session: AsyncSession):
    answer = message.text if message.text != "/skip" else "Skipped"
    await state.update_data(goal=answer)
    
    await message.answer(
        "🔷 <b>Step 2: How much time per day are you ready to dedicate to training?</b>\n\n"
        "Please reply in free form or click /skip to bypass this question."
    )
    await state.set_state(QuizStates.waiting_for_step_2)


# Handler for Step 2 (Quiz Completion + Send Admin Report)
@start_router.message(QuizStates.waiting_for_step_2)
async def process_step_2(message: Message, state: FSMContext, session: AsyncSession):
    answer = message.text if message.text != "/skip" else "Skipped"
    await state.update_data(time_dedication=answer)
    
    # Retrieve all saved answers from FSM state
    user_data = await state.get_data()
    
    # Send final completion message to the user
    await message.answer(
        "🎉 <b>Thank you!</b>\n\n"
        "Your answers have been successfully saved. Let's move on to the next stage!"
    )
    
    # BUILD REPORT FOR THE ADMIN
    username = message.from_user.username or "No username"
    report_text = (
        "📥 <b>New Quiz Completed!</b>\n\n"
        "👤 <b>User:</b> @{username} (ID: {user_id})\n"
        "🔷 <b>Goal:</b> {goal}\n"
        "🔷 <b>Time:</b> {time}\n"
    ).format(
        username=username,
        user_id=message.from_user.id,
        goal=user_data.get("goal"),
        time=user_data.get("time_dedication")
    )
    
    try:
        # Bot sends the report directly to your Admin DM
        await message.bot.send_message(chat_id=ADMIN_ID, text=report_text)
    except Exception as e:
        logger.error(f"Failed to send report to admin: {e}")
        
    # Clear FSM state completely to finalize the quiz flow
    await state.clear()


# Handle /skip command
@start_router.message(Command("skip"))
async def cmd_skip(message: Message, state: FSMContext, session: AsyncSession):
    current_state = await state.get_state()
    if current_state == QuizStates.waiting_for_step_1.state:
        await process_step_1(message, state, session)
    elif current_state == QuizStates.waiting_for_step_2.state:
        await process_step_2(message, state, session)
    else:
        await message.answer("There is no active question to skip right now.")


# ==========================================
# 4. DATABASE SESSION MIDDLEWARE
# ==========================================
class BuiltInDbSessionMiddleware(BaseMiddleware):
    def __init__(self, session_maker: Any):
        self.session_maker = session_maker

    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        try:
            async with self.session_maker() as session:
                data["session"] = session
                return await handler(event, data)
        except TypeError:
            async with self.session_maker as session:
                data["session"] = session
                return await handler(event, data)


# ==========================================
# 5. SUBSCRIPTION CHECK MIDDLEWARE
# ==========================================
class EnglishCheckSubscriptionMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        if isinstance(event, Message) and event.text == "/start":
            bot: Bot = data["bot"]
            user_id = event.from_user.id
            
            try:
                member = await bot.get_chat_member(chat_id=CHANNEL_ID, user_id=user_id)
                if member.status in ["member", "administrator", "creator"]:
                    return await handler(event, data)
            except Exception as e:
                logger.error(f"Subscription check error: {e}")

            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="📢 Join Private Channel", url=PRIVATE_CHANNEL_LINK)],
                [InlineKeyboardButton(text="🔄 I have subscribed", callback_data="verify_subscription")]
            ])
            
            await event.answer(
                "⚠️ <b>Access Denied!</b>\n\n"
                "To unlock the assistant and start the initialization quiz, please join our private channel first.",
                reply_markup=keyboard
            )
            return
            
        return await handler(event, data)


# Handle "I have subscribed" button click
@start_router.callback_query(F.data == "verify_subscription")
async def check_callback(callback: CallbackQuery, state: FSMContext, session: AsyncSession):
    bot = callback.bot
    try:
        member = await bot.get_chat_member(chat_id=CHANNEL_ID, user_id=callback.from_user.id)
        if member.status in ["member", "administrator", "creator"]:
            await callback.answer("✅ Success! Welcome to the club.", show_alert=True)
            await callback.message.delete()
            await cmd_start(callback.message, state, session)
        else:
            await callback.answer("❌ You are still not a member of the private channel!", show_alert=True)
    except Exception as e:
        logger.error(f"Callback verification error: {e}")
        await callback.answer("❌ Verification error. Make sure the bot is an admin in the channel.", show_alert=True)


# ==========================================
# 6. MAIN APPLICATION ENTRY POINT
# ==========================================
async def main() -> None:
    await init_db()
    logger.info("Database initialised")

    start_scheduler()
    logger.info("Scheduler started")

    bot = Bot(
        token=settings.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()

    dp.update.middleware.register(BuiltInDbSessionMiddleware(AsyncSessionLocal))
    dp.message.middleware(EnglishCheckSubscriptionMiddleware())

    dp.include_router(start_router)
    dp.include_router(funnel.router)
    dp.include_router(webapp.router)

    await bot.set_my_commands([
        BotCommand(command="start", description="Start setup assistant")
    ])
    logger.info("Menu commands registered")

    logger.info("Bot is starting…")
    await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())


if __name__ == "__main__":
    asyncio.run(main())