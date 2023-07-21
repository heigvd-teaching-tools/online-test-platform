# Dockerfile
# Pull the base image
FROM node:14-bullseye-slim

# Check if we are in production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Set the working directory
WORKDIR /app

# Copy the app's source code
COPY . .

# Install dependencies
RUN apt-get update && apt-get install -y openssl
RUN npm cache clean --force
RUN npm install -g npm@latest
RUN rm -rf node_modules package-lock.json
RUN npm install --loglevel verbose

# debug install
RUN ls -la

# Generate Prisma client for multiple platforms
RUN npx prisma generate

# Build the app
RUN npm run build

# Expose the port
EXPOSE 3000

# Run the app
CMD [ "npm", "start" ]
