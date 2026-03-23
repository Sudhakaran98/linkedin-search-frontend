FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY public ./public
COPY src ./src
COPY tsconfig.json ./
COPY webpack.config.js ./
RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 9000

CMD ["nginx", "-g", "daemon off;"]
