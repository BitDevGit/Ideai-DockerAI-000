# Stage 1: Install dependencies and build the Next.js application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG NEXT_PUBLIC_RUST_COMPUTE_URL=http://localhost:8080

# Set as environment variables for Next.js build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_RUST_COMPUTE_URL=$NEXT_PUBLIC_RUST_COMPUTE_URL

# Copy package.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production environment, run the app
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy the production dependencies and built assets from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js* ./
COPY --from=builder /app/tsconfig.json* ./

# Expose the port Next.js runs on
EXPOSE 3000

# Set the production environment variable
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Command to run the Next.js server
CMD ["npm", "start"]

