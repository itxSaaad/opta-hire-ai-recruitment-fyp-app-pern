FROM node:20-alpine
WORKDIR /usr/src/app

# Install deps first for better caching
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci --no-audit --no-fund

# Copy source
COPY . .

ENV NODE_ENV=development
EXPOSE 5000

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Use entrypoint to run migrations before starting server
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
