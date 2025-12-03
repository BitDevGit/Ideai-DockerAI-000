# Stage 1: Builder stage using the official Rust image
FROM rust:1.83-slim-bullseye AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy Rust project files
COPY Cargo.toml Cargo.lock* ./
COPY src ./src

# Build the application in release mode
RUN cargo build --release

# Stage 2: Final minimal image
FROM debian:bullseye-slim

# Set working directory
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl1.1 && \
    rm -rf /var/lib/apt/lists/*

# Copy the compiled binary from the builder stage
COPY --from=builder /app/target/release/rust-wasm-compute .

# Expose the application port
EXPOSE 8080

# Command to run the Rust executable
CMD ["./rust-wasm-compute"]

