# Portable alternative to render.yaml for any host that runs containers
# (Fly.io, Railway, Cloud Run). Vercel cannot run this — see render.yaml.
FROM node:24-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Host speech is optional; without these the web app falls back to browser voices.
# Uncomment for a server-rendered voice:
# RUN apt-get update && apt-get install -y --no-install-recommends libttspico-utils \
#     && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
EXPOSE 8000
CMD ["npm", "start"]
