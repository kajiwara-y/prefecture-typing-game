# Dockerfile
FROM node:18-slim

WORKDIR /app

# nodejsユーザーを作成
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# package.jsonとpackage-lock.jsonをコピー
COPY package.json package-lock.json ./

# 依存関係をインストール
RUN npm ci

# アプリケーションのソースをコピー
COPY . .

# Node.js用にビルド
RUN npm run build:node

# 不要なdevDependenciesを削除
RUN npm prune --production

# 権限を設定
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8080
CMD ["npm", "start"]
