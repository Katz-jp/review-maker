# Vercelデプロイ手順

## 前提条件

- GitHubアカウント（プロジェクトがGitHubにプッシュされていること）
- Vercelアカウント（[vercel.com](https://vercel.com)で無料アカウント作成可能）
- 必要なAPIキーと認証情報

## デプロイ手順

### 1. Vercelアカウントの準備

1. [vercel.com](https://vercel.com)にアクセス
2. 「Sign Up」をクリックしてGitHubアカウントでログイン
3. Vercelダッシュボードに移動

### 2. プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリを選択（`review-maker`）
3. 「Import」をクリック

### 3. プロジェクト設定

Vercelが自動的にNext.jsプロジェクトを検出します。以下の設定を確認：

- **Framework Preset**: Next.js（自動検出）
- **Root Directory**: `./`（デフォルト）
- **Build Command**: `npm run build`（自動検出）
- **Output Directory**: `.next`（自動検出）
- **Install Command**: `npm install`（自動検出）

### 4. 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定します：

#### OpenAI API Key
```
OPENAI_API_KEY=sk-proj-...
```

#### Firebase設定（クライアント側）
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBWRlLZUi3ON6LIfj1Ae9Au4mVP0-z_X1s
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=review-maker-master.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=review-maker-master
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=review-maker-master.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=847972995600
NEXT_PUBLIC_FIREBASE_APP_ID=1:847972995600:web:88aa30869f0a92c2a8b095
```

#### Firebase Service Account（サーバー側）
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"review-maker-master",...}
```
⚠️ **注意**: JSON全体を1行で入力する必要があります。改行は含めず、エスケープ文字（`\n`）はそのまま残してください。

#### Stripe設定
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### アプリURL（本番環境用）
```
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
```
⚠️ **重要**: デプロイ後にVercelが生成するURLに変更してください。

### 5. 環境変数の設定方法

1. プロジェクト設定画面で「Environment Variables」タブを開く
2. 各環境変数を追加：
   - **Name**: 環境変数名（例: `OPENAI_API_KEY`）
   - **Value**: 環境変数の値
   - **Environment**: すべての環境（Production, Preview, Development）にチェック
3. 「Save」をクリック

### 6. デプロイの実行

1. すべての環境変数を設定後、「Deploy」ボタンをクリック
2. ビルドプロセスが開始されます（通常2-5分）
3. デプロイが完了すると、本番URLが表示されます

### 7. Stripe Webhookの設定

デプロイ後、StripeのWebhookエンドポイントを更新する必要があります：

1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks)にアクセス
2. Webhookエンドポイントを追加/編集
3. **Endpoint URL**: `https://your-project-name.vercel.app/api/webhooks/stripe`
4. **Events to send**: 必要なイベントを選択（例: `checkout.session.completed`, `customer.subscription.updated`など）
5. Webhookシークレットをコピーして、Vercelの環境変数`STRIPE_WEBHOOK_SECRET`に設定

### 8. 本番環境URLの更新

デプロイが完了したら、Vercelが生成した本番URLを環境変数に設定：

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Environment Variables」に移動
3. `NEXT_PUBLIC_APP_URL`を更新：
   ```
   NEXT_PUBLIC_APP_URL=https://your-actual-vercel-url.vercel.app
   ```
4. 「Redeploy」を実行して変更を反映

## トラブルシューティング

### ビルドエラーが発生する場合

- **環境変数が正しく設定されているか確認**
- **Firebase Service Account Keyの形式を確認**（JSON全体が1行になっているか）
- **ビルドログを確認**してエラーメッセージを確認

### Stripe Webhookが動作しない場合

- **Webhook URLが正しいか確認**（`/api/webhooks/stripe`で終わっているか）
- **Webhookシークレットが正しく設定されているか確認**
- **Stripe DashboardでWebhookイベントのログを確認**

### Firebase接続エラーが発生する場合

- **Firebase設定値が正しいか確認**
- **Firebase Service Account Keyの形式を確認**
- **Firebase Consoleでプロジェクトが有効か確認**

## 継続的デプロイ（CI/CD）

Vercelは自動的にGitHubと連携します：

- **main/masterブランチへのプッシュ**: 本番環境に自動デプロイ
- **その他のブランチへのプッシュ**: プレビュー環境に自動デプロイ
- **プルリクエスト**: プレビューURLが自動生成

## カスタムドメインの設定（オプション）

1. Vercelダッシュボードで「Settings」→「Domains」を開く
2. ドメイン名を入力して「Add」をクリック
3. DNS設定を指示に従って更新
4. ドメインが有効化されたら、`NEXT_PUBLIC_APP_URL`も更新

## セキュリティのベストプラクティス

- ✅ `.env.local`ファイルはGitにコミットしない（`.gitignore`に含まれています）
- ✅ 本番環境では`sk_test_`ではなく`sk_live_`のStripeキーを使用
- ✅ Firebase Service Account Keyは機密情報として扱う
- ✅ 定期的にAPIキーをローテーション

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
