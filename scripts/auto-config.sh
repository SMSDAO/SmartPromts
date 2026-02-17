#!/bin/bash

# Auto-configuration script for SmartPromts
# Sets up environment for preview/production deployment

set -e

echo "🚀 SmartPromts Auto-Config Script"
echo "=================================="

# Check Node version
NODE_VERSION=$(node -v | sed 's/v//' | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Error: Node.js 20+ is required (current: $(node -v))"
  echo "Please install Node.js 20 or higher"
  exit 1
fi

echo "✅ Node version: $(node -v)"

# Determine environment
ENV=${1:-development}
echo "📦 Environment: $ENV"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "⚠️  Please update .env.local with your actual credentials"
else
  echo "✅ .env.local already exists"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
else
  echo "✅ Dependencies already installed"
fi

# Validate required environment variables
echo "🔍 Validating environment variables..."

REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
)

source .env.local 2>/dev/null || true

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ] || [[ "${!var}" == *"your_"* ]]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo "⚠️  Warning: The following required variables need to be configured:"
  for var in "${MISSING_VARS[@]}"; do
    echo "   - $var"
  done
  echo ""
  echo "Please update .env.local with your actual credentials"
fi

# Check if database migrations are needed
echo "🗄️  Database setup reminder:"
echo "   Make sure to run the SQL schema in your Supabase dashboard"
echo "   See README.md for database setup instructions"

echo ""
echo "✅ Configuration complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env.local with your credentials"
echo "  2. Run database migrations in Supabase"
echo "  3. Start development: npm run dev"
echo "  4. Or build for production: npm run build"
