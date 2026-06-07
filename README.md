# 🤖 Quiz Funnel Telegram Bot

An asynchronous Telegram bot designed for lead generation through engaging quiz funnels, featuring built-in Telegram Mini App (Web App) support.

## 🚀 Key Features

* **Asynchronous Architecture**: Built with `aiogram 3.x` for high-performance and non-blocking I/O operations.
* **Database Management**: Integrated with `SQLAlchemy` and `aiosqlite` for asynchronous SQLite database interactions.
* **Task Scheduling**: Includes an automated background scheduler (`APScheduler`) for delayed messages and push notifications.
* **Referral System**: Built-in multi-level referral tracking to monitor user invitations.
* **Web App Support**: Seamless integration with Telegram Mini Apps for enhanced user experience.

---

## 📁 Project Structure

```text
├── database/         # Database models, connections, and async queries
├── handlers/         # Event handlers (commands, messages, callbacks)
├── services/         # Business logic (scheduler, analytical reports)
├── config.py         # Environment variables and bot configuration
├── requirements.txt  # Python package dependencies
└── README.md         # Project documentation
```

---

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd portfolio
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   BOT_TOKEN=your_telegram_bot_token
   DATABASE_URL=sqlite+aiosqlite:///./quiz_funnel.db
   ```

5. **Run the Bot:**
   ```bash
   python main.py
   ```

---

## 🛡️ Security Note

The `.env` file containing sensitive bot tokens and database credentials is listed in `.gitignore` and is **never** pushed to the public repository.


