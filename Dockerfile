FROM node:16.6.1-alpine3.13
ENV NODE_ENV production
WORKDIR /app
COPY package.json .
RUN yarn
COPY . .
CMD node src/index.js