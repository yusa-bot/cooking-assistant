# AI-Chef
AI-Chefは、手持ちの材料を撮影するとAIが最適なレシピを提案し、調理ガイドをしてくれるアプリケーションです。
料理中画面では、音声読み上げ・認識機能でハンズフリー操作を可能にし、料理中でも使いやすいUIになっています。

開発体験記: https://qiita.com/yubot/items/208d10b3cbb315df3507
topas: https://topaz.dev/projects/0e4b5dea401914a3868f

![image](https://ptera-publish.topaz.dev/project/01JSTSPQSFDT0FMKMQ28F1B9XE.png)

## deploy(vercel)
https://cooking-assistant-deploy.vercel.app/

## 開発手順
ハッカソンで2人チームで開発。
フロント担当とバック担当に分かれ、私はフロントを担当。

## 技術スタック
```bash
フロントエンド: Next.js(App Router), React, TypeScript, Tailwind CSS
バックエンド: Node.js
認証・DB: Supabase
AI連携: OpenAI API (画像認識・レシピ生成)
UI設計支援: v0,Figma
その他: Lottieアニメーション, Lucideアイコン
deploy: vercel
```

## AI活用
コーディング補助: GitHub Copilot, Cline
設計補助: v0, Mermaid

## 主な機能
```bash
食材スキャン: カメラで食材を撮影し、AIが自動で食材を識別
レシピ提案: 識別された食材から最適なレシピを提案
音声アシスタント: 調理中の質問に音声で回答
ステップバイステップガイド: 調理手順を詳細に案内
タイマー機能: 調理時間の管理をサポート
料理履歴: 完成した料理を記録し、振り返りが可能
レシピ帳: お気に入りのレシピを保存
```
