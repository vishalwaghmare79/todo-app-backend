FROM node:20-alpine

WORKDIR /app

# Install dependencies first so Docker layer caching is effective across code-only changes.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy only the application sources needed at runtime.
COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000

# Use the production entrypoint defined in package.json.
CMD ["npm", "start"]