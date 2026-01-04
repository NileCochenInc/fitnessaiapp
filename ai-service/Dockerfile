# Use official Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /usr/src/app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Run your AI service
CMD ["python", "-u", "main.py"]