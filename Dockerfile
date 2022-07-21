FROM node:18-alpine

WORKDIR /usr/src/app

ADD . .

RUN yarn

CMD ["yarn", "start"]