# ========================================
# ステージ1: base - 基盤イメージの設定
# ========================================
FROM oven/bun:1 AS base
# Bunの公式イメージを基盤として使用
# 'AS base'で名前を付けることで、他のステージから参照可能

WORKDIR /app
# 作業ディレクトリを/appに設定
# 以降のコマンドはこのディレクトリで実行される

# ========================================
# ステージ2: install - 依存関係のインストール
# ========================================
FROM base AS install
# baseステージを継承（WORKDIR /appも継承される）
# このステージでは2種類の依存関係をインストールする

# 開発用依存関係のインストール（ビルド時に必要）
RUN mkdir -p /temp/dev
# 一時ディレクトリ作成（開発用依存関係用）

COPY package.json bun.lock /temp/dev/
# package.jsonとbun.lockのみをコピー
# これによりDockerのレイヤーキャッシュが効率化される
# （依存関係が変わらない限り、このステージはキャッシュされる）

RUN cd /temp/dev && bun install --frozen-lockfile
# 開発依存関係も含めて全ての依存関係をインストール
# --frozen-lockfileでbun.lockの内容を厳密に再現

# 本番用依存関係のインストール（実行時に必要）
RUN mkdir -p /temp/prod
# 一時ディレクトリ作成（本番用依存関係用）

COPY package.json bun.lock /temp/prod/
# 再度package.jsonとbun.lockをコピー

RUN cd /temp/prod && bun install --frozen-lockfile --production
# --productionフラグでdevDependenciesを除外
# 本番環境で必要な依存関係のみをインストール

# ========================================
# ステージ3: build - アプリケーションのビルド
# ========================================
FROM base AS build
# baseステージを継承（WORKDIR /appを継承）

COPY --from=install /temp/dev/node_modules node_modules
# installステージから開発用依存関係をコピー
# ビルド時にはdevDependenciesも必要なため

COPY . .
# 全てのソースコードをコピー
# .dockerignoreで除外されたファイル以外の全て

ENV NODE_ENV=production
# 本番環境用の環境変数を設定

RUN bun run build:bun
# Bun用のビルドコマンドを実行
# この結果、/app/dist/にビルド成果物が生成される

# ========================================
# ステージ4: release - 本番用最小イメージ
# ========================================
FROM oven/bun:1-alpine AS release
# Alpine Linuxベースの軽量なBunイメージを使用
# 本番環境では軽量性を重視

WORKDIR /app
# 作業ディレクトリを設定

COPY --chown=bun:bun --from=install /temp/prod/node_modules node_modules
# installステージから本番用依存関係のみをコピー
# --chown=bun:bunでファイルの所有者をbunユーザーに設定
# セキュリティ向上のため

COPY --chown=bun:bun --from=build /app/dist .
# buildステージからビルド成果物をコピー
# /app/dist/の内容を/app/（カレントディレクトリ）にコピー
# 結果的に/app/index.js、/app/assets/などが配置される

USER bun
# セキュリティのためrootユーザーから一般ユーザーに切り替え
# 最小権限の原則に従う

EXPOSE 8080
# コンテナが8080ポートを使用することを宣言
# 実際のポート公開はdocker runの-pオプションで行う

ENV PORT=8080
# アプリケーションで使用するポート番号を環境変数で設定

CMD ["bun", "run", "index.js"]
# コンテナ起動時に実行するコマンド
# /app/index.js（ビルドされたメインファイル）を実行
