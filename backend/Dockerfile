FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci || npm install

# Copy all source files
COPY . .

# Ensure uploads directory exists for persistent volume storage
RUN mkdir -p uploads

# Expose backend port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
