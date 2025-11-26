# Use a specific, non-latest base image
FROM node:18-bullseye

# Create and use app directory
WORKDIR /app

# Install only what we need
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of the application source
COPY src ./src

# Create non-root user and switch to it
RUN useradd -m appuser
USER appuser

# Expose application port
EXPOSE 3000

# Add a simple healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node /app/src/healthcheck.js || exit 1

CMD ["node", "src/server.js"]
