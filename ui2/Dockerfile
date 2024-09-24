FROM node:18.17.1-alpine

WORKDIR /app

COPY . .

RUN npm i --force
RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]