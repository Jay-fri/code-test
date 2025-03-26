FROM node:20

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3

# Copy package files first
COPY package*.json ./

# Clean npm cache and install with legacy peer deps
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# Install platform-specific Rollup package
RUN npm install @rollup/rollup-linux-x64-gnu

# Copy the rest of the application
COPY . .

# Rebuild native packages
RUN npm rebuild

EXPOSE 5173

# Use host 0.0.0.0 to make it accessible outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]