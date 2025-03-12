# Rescue Mate
> A Service Worker demo

# To deploy
1. Generate VAPID keys
> npx web-push generate-vapid-keys --json
2. Setup a MongoDB instance with a database named "alerts-db" with collections "alerts" and "subscriptions"
3. Deploy this to Vercel