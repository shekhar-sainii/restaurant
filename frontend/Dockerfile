# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copy package definitions
COPY package*.json ./

# Install dependencies
RUN npm ci || npm install

# Copy application source code and configuration
COPY . .

# Build static production bundle
RUN npm run build

# Stage 2: Serve application with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration supporting SPA routing and API/WebSocket proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to Nginx web root
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose standard web port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
