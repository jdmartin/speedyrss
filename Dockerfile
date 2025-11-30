FROM docker.io/library/node:lts-slim
ENV NODE_ENV=production

# Built 30 Nov 2025

WORKDIR /app

COPY . .

RUN npm ci --omit-dev

RUN mkdir -p /app/data

CMD ["node", "index.js"]
