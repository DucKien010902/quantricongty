FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Các biến môi trường NEXT_PUBLIC được nhúng vào lúc build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_DEVICE_IP
ARG NEXT_PUBLIC_DEVICE_PORT
ARG NEXT_PUBLIC_DEVICE_COMM_KEY

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
ENV NEXT_PUBLIC_DEVICE_IP=${NEXT_PUBLIC_DEVICE_IP}
ENV NEXT_PUBLIC_DEVICE_PORT=${NEXT_PUBLIC_DEVICE_PORT}
ENV NEXT_PUBLIC_DEVICE_COMM_KEY=${NEXT_PUBLIC_DEVICE_COMM_KEY}

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "start"]
