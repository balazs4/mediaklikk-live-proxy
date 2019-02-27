FROM node:alpine
LABEL maintainer="balazs4web@gmail.com"
RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      nss@edge
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
COPY . /app
WORKDIR /app
EXPOSE 3000
RUN ["yarn", "install", "--production"]
CMD ["yarn", "run", "docker"]
