FROM node:14.17-alpine AS builder
ENV NEXT_TELEMETRY_DISABLED 1
RUN apk add --no-cache libc6-compat git python py-pip make g++
WORKDIR /app
COPY * ./
RUN npm run build
RUN ls -la

FROM node:14.17-alpine AS runner
ENV NEXT_TELEMETRY_DISABLED 1
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

WORKDIR /app
RUN addgroup -g 1002 -S nodejs
RUN adduser -S nodejs -u 1002

COPY --from=builder /app/*config* ./
COPY --from=builder /app/*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nodejs
CMD ["npm", "run", "start:prod"]
