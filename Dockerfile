FROM node:11.10-alpine
WORKDIR /src/app/functions
COPY ./functions/package.json /src/app/functions/package.json
RUN npm install 
COPY . /src/app/functions
EXPOSE 3000
CMD ["./node_modules/.bin/firebase","serve"]

