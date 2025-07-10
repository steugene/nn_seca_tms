FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

RUN npm ci

COPY shared/ ./shared/
COPY server/ ./server/

RUN npm run build --workspace=shared
RUN npm run build --workspace=server

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=server"] 