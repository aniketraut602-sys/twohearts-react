# Frontend stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# API stage
FROM node:18-alpine
WORKDIR /app
COPY api/package*.json api/
RUN npm ci --prefix api
COPY api/ .

# Final stage
# Final stage
FROM node:18-alpine
RUN apk add --no-cache tini
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api
COPY start.sh ./
RUN chmod +x start.sh
USER node
EXPOSE 4000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./start.sh"]