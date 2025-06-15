# Pair Tracker

ペアプログラミングの追跡を行うためのシステムです。チーム、ペア、ユーザー、課題の管理を行います。

## 機能

- チーム管理（3名以上のメンバーで構成）
- ペア管理（2-3名のメンバーで構成）
- ユーザー管理（在籍状況の追跡）
- 課題管理（作成者、担当者、ステータスの管理）

## 技術スタック

- TypeScript
- Node.js
- Jest（テスティング）

## セットアップ

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# テストの実行
npm test

# アプリケーションの起動
npm start
```

## ドメインモデル

- Team集約
  - チーム名は3文字以内
  - メンバーは最低3名必要
  - ペアは2-3名で構成

- User集約
  - ユーザーステータス（在籍中、一時停止、退会）
  - 非在籍中のユーザーはチームに所属不可

- Issue集約
  - タイトルは1-20文字
  - ステータス（未着手、レビュー中、完了）
  - 担当者のみがステータスを変更可能

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## ドメイン概要（集約間の関係）

![Domain Overview](docs/domain/DomainOverview.svg)