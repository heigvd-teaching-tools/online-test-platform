# Pull the base image
FROM node:20-bullseye-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg2 \
    software-properties-common \
    openssl

# Install Docker
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - && \
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" && \
    apt-get update && apt-get install -y docker-ce-cli


# Set the working directory
WORKDIR /app

# Copy the app's source code
COPY . .

# Install Node.js dependencies
RUN npm ci --loglevel verbose

# Generate Prisma client for multiple platforms
# If NODE_ENV is production then devDependencies are not installed and this will silently
# works while pulling/resolving the dependency withtout pinpoint to a version
RUN npx prisma generate

# Check if we are in production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

RUN echo $NODE_ENV

# Build the app
RUN npm run build

# Expose the port
EXPOSE 3000

# Run the app
CMD [ "npm", "run", "start:migration" ]
