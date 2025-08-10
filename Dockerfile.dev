# 1단계: 빌드
FROM node:22

# 작업 디렉토리 설정
WORKDIR /app

# package.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 모든 소스 복사
COPY . .

# 포트 개방
EXPOSE 3000

# 개발 서버 실행
CMD ["npm", "run", "dev"]