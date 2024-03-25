# Use an official Node.js runtime as a base image
FROM node:16.20.2


# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy the rest of the application code

COPY . .

# Install dependencies
RUN npm install

# Expose the port your Node.js application will run on
EXPOSE 8002

# Command to start your Node.js application

CMD ["node", "--tls-min-v1.0", "server.js"]