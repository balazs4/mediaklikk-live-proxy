FROM jribar/node-phantomjs:latest
COPY . /app
WORKDIR /app
RUN ["yarn", "install", "--production"]
EXPOSE 3000
CMD ["yarn", "run", "docker"]
