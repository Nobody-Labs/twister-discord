FROM node:16.6.1-alpine3.13
ENV NODE_ENV production
WORKDIR /app
COPY . .
RUN yarn
ENTRYPOINT ["yarn"]