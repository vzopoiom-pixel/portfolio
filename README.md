# 🤖 Quiz Funnel Telegram Bot

An asynchronous Telegram bot designed for lead generation through engaging quiz funnels, featuring built-in Telegram Mini App (Web App) support.

## 🚀 Key Features

- **Asynchronous Architecture**: Built with `aiogram 3.x` for high-performance and non-blocking I/O operations.
- **Database Management**: Integrated with `SQLAlchemy` and `aiosqlite` for asynchronous SQLite database interactions.
- **Task Scheduling**: Includes an automated background scheduler (`APScheduler`) for delayed messages and push notifications.
- **Referral System**: Built-in multi-level referral tracking to monitor user invitations.
- **Web App Support**: Seamless integration with Telegram Mini Apps for enhanced user experience.

## 📁 Project Structure

```text
├── database/         # Database models, connections, and async queries
├── handlers/         # Event handlers (commands, messages, callbacks)
├── services/         # Business logic (scheduler, analytical reports)
├── config.py         # Environment variables and bot configuration
├── requirements.txt  # Python package dependencies
└── README.md         # Project documentation


=============================================================================
git clone https://github.com/YOUR_USERNAME/quiz-funnel-telegram-bot.git
cd quiz-funnel-telegram-bot
=============================================================================
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
=============================================================================
pip install -r requirements.txt
=============================================================================
python main.py
=============================================================================
