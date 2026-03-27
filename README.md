This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## DynamoDB Logging

Logging storage now switches by environment:

- local development defaults to SQLite
- production defaults to DynamoDB
- optional override: `LOG_STORAGE_BACKEND=sqlite` or `LOG_STORAGE_BACKEND=dynamodb`

Server environment variables:

```env
DYNAMODB_REGION=ap-southeast-2
DYNAMODB_CHAT_LOGS_TABLE=chat_logs
DYNAMODB_SITE_VISITS_TABLE=site_visits
```

For normal local development, no AWS setup is required because SQLite is the default.

If you explicitly want to test DynamoDB locally, use your normal AWS credentials chain before running `pnpm dev`, for example:

```bash
aws configure
```

or an AWS profile / SSO session that can access the configured tables.

If you switch local logging to DynamoDB and credentials are missing, the site still loads, but server-side logging and admin log reads return a helpful DynamoDB configuration or credential error.

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
