# specify base image from dockerhub
FROM node:20-alpine as builder

LABEL version="1.0"
LABEL description="React Frontend for the Library API"

WORKDIR /app

COPY ["package.json","package-lock.json*","./"]

# Install dependencies and clear npm cache
RUN npm install && npm cache clean --force

COPY . .

RUN npm run build

FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# serve images using nginx
COPY --from=builder /app/build /usr/share/nginx/html