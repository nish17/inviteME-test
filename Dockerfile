FROM node:11.10-alpine
RUN mkdir -p /src/app/functions
WORKDIR /src/app/functions
COPY ./functions/package.json /src/app/functions/package.json
RUN npm install 
COPY . /src/app/functions
EXPOSE 3000

# RUN ls
# COPY ./functions/ .
# RUN ls
