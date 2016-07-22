FROM node:4.3.2
COPY . /app
WORKDIR /app  
RUN npm i npm -g
RUN npm i
ENV PORT=80
ENV NODE_ENV=development
RUN npm run build-prod
ENTRYPOINT ["node", "./.build/server.js"]
