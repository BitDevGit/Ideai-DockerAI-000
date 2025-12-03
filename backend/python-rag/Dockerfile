# Use a Python base image suitable for scientific computing
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Install necessary system dependencies for NumPy/SciPy compilation
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    libgfortran5 \
    musl-dev \
    build-essential && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose the port for the FastAPI application
EXPOSE 8000

# Command to run the FastAPI application with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


