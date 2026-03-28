FROM node:22-bookworm-slim

WORKDIR /workspace

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
