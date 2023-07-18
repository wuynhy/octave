# The base image
FROM node:lts-bullseye

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json before other files
# Utilize Docker cache to save re-installing dependencies if unchanged
COPY package*.json ./

# Install dependencies
RUN npm install

# Install the ESLint plugin
RUN npm install eslint-plugin-react-hooks --save-dev

# Copy all files
COPY . .

# Run the application
CMD ["npm", "start"]
