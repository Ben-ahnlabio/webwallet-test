FROM mcr.microsoft.com/playwright:v1.48.2-noble
RUN mkdir -p /app
COPY . ./app
WORKDIR /app
RUN npm ci
RUN npm run build
CMD ["./docker-entrypoint.sh"]
