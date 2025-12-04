FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including timeout utility
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    coreutils \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install script
COPY requirements.txt .
COPY install-deepeval.sh .
RUN chmod +x install-deepeval.sh

# Install Python dependencies using script with timeout handling
RUN pip install --no-cache-dir --upgrade pip && \
    ./install-deepeval.sh

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

