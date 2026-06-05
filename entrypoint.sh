#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
node node_modules/.bin/prisma migrate deploy

echo "🌱 Seeding database (if first run)..."
# Only seed if users table is empty
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => { console.log(count); process.exit(0); }).catch(() => { console.log(0); process.exit(0); });
")

if [ "$USER_COUNT" = "0" ]; then
  echo "📦 Database is empty, running seed..."
  node node_modules/.bin/ts-node prisma/seed.ts || echo "⚠️  Seed skipped (ts-node not available in prod)"
else
  echo "✅ Database already seeded ($USER_COUNT users found)"
fi

echo "🚀 Starting WMS Backend..."
exec node dist/main
