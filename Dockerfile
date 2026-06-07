# Use a stable lightweight Python image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy dependency file
COPY requirements.txt .

# Install dependencies without saving cache to minimize image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files into the container
COPY . .

# Create a dedicated directory for the SQLite database
RUN mkdir -p /app/data

# Run the bot application
CMD ["python", "botTelegram.py"]

