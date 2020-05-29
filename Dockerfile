FROM node:14-alpine

ENV TZ="Europe\Berlin"

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY . .
RUN npm install && chown -R node:node /app

VOLUME /app
EXPOSE 3000/tcp

ENTRYPOINT []

CMD ["npm", "start"]


