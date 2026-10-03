FROM node:22-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 8081
CMD ["npx", "expo", "start", "--web", "--port", "8081"]
