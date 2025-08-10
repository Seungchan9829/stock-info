# 1단계: 빌드
FROM node:22 AS builder

# 작업 디렉토리 설정
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# 실행 스테이지
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

# 빌드 결과만 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "run", "start"]