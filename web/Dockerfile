# Use an official Node.js runtime as the base image
FROM node:16-alpine

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the Docker container
COPY package*.json ./

# Install application dependencies in the Docker container
RUN npm install

# Copy the rest of the application to the Docker container
COPY . .

# Build the Next.js application
RUN npm run build

# The command that starts the application and applies migrations
CMD npx prisma db push && npx prisma generate && npm start
# CMD ["npx", "prisma", "generate", "&&", "npx", "prisma", "db", "push", "&&", "npm", "start" ]
