FROM node:16.6-alpine

WORKDIR /usr/src/app

ADD . .

RUN yarn

CMD ["yarn", "start"]