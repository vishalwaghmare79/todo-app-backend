FROM node:20-alpine

WORKDIR /app

# Install dependencies first so Docker layer caching is effective across code-only changes.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the runtime sources and models used by the auth service.
COPY src ./src

ENV NODE_ENV=production
EXPOSE 4001

# Use the production entrypoint defined in package.json.
CMD ["npm", "start"]