# Use a Python base image suitable for scientific computing
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Install necessary system dependencies for NumPy/SciPy compilation
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    gfortran \
    libgfortran5 \
    build-essential \
    libblas-dev \
    liblapack-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements file and install script
COPY requirements.txt .
COPY install-deps.sh .
RUN chmod +x install-deps.sh && \
    pip install --no-cache-dir --upgrade pip setuptools wheel && \
    ./install-deps.sh

# Copy the application code (all files needed)
# Previously only copied main.py and evaluation/, but all files are needed
COPY . .

# Expose the port for the FastAPI application
EXPOSE 8000

# Command to run the FastAPI application with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
