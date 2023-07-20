# Dockerfile
# Pull the base image
FROM node:14-bullseye-slim

# Check if we are in production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Copy the appropriate .env file
COPY ./.env.production ./.env

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN apt-get update && apt-get install -y openssl
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Generate Prisma client for multiple platforms
RUN npx prisma generate

# Build the app
RUN npm run build

# Expose the port
EXPOSE 3000

# Run the app
CMD [ "npm", "start" ]
