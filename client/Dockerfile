FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY client/package*.json ./client/

RUN npm ci

COPY shared/ ./shared/
COPY client/ ./client/

RUN npm run build --workspace=shared

EXPOSE 4200

CMD ["npm", "run", "dev", "--workspace=client"] 