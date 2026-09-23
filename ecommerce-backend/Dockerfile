# 1. Start FROM an official Node 20 image (small Linux with Node preinstalled).
FROM node:20-slim

# 2. Do everything inside /app in the container.
WORKDIR /app

# 3. Copy ONLY the dependency manifests first (so Docker can cache the install).
COPY package*.json ./

# 4. Install deps exactly as the lockfile says (reproducible, like CI).
RUN npm ci

# 5. Copy the rest of the source code in.
COPY . .

# 6. Compile TypeScript -> JavaScript (dist/).
RUN npm run build

# 7. Note the port the app listens on.
EXPOSE 4000

# 8. The command that runs when a container starts.
CMD ["node", "dist/index.js"]
