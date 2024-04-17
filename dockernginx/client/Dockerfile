# specify base image from dockerhub
FROM node:20-alpine

LABEL version="1.0"
LABEL description="React Frontend for the Library API"

WORKDIR /app

COPY ./package.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html