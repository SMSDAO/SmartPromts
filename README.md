# SmartPromts

AI Smart Prompts Optimized for any Agent, Any Model - with advanced caching, dynamic balancing, and enterprise-grade features.

> **Note**: Screenshots of the application are available in the pull request description. To add your own dashboard screenshot, place it at `./docs/dashboard-screenshot.png`.

## 🚀 Features

- **AI-Powered Prompt Optimization** - Transform your prompts for better clarity and effectiveness
- **Multi-Model Support** - Optimized for GPT-4, Claude, Gemini, and more
- **Supabase Authentication** - Secure magic link login with session management
- **Stripe Billing Integration** - Tiered subscriptions (Free, Pro, Enterprise)
- **Usage Limiting** - Tier-based monthly usage tracking and limits
- **Rate Limiting** - Protect your API from abuse
- **Modern UI** - Beautiful responsive interface with dark mode
- **TypeScript + Next.js 14** - Built with the latest app directory features
- **Production Ready** - Complete with middleware, error handling, and security

## 📋 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Payments**: Stripe
- **AI**: OpenAI API
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier works)
- OpenAI API account
- Stripe account (test mode for development)

### 1. Clone & Install

```bash
git clone https://github.com/SMSDAO/SmartPromts.git
cd SmartPromts
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_PRICE_ID_FREE=price_xxx_free_tier
STRIPE_PRICE_ID_PRO=price_xxx_pro_tier
STRIPE_PRICE_ID_ENTERPRISE=price_xxx_enterprise_tier

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Database Setup

Run this SQL in your Supabase SQL Editor to create the required tables and functions:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  usage_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- Create function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### 4. Stripe Configuration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create three products with recurring prices:
   - **Free Tier** (optional, or handle in code)
   - **Pro Tier** - e.g., $29/month
   - **Enterprise Tier** - e.g., $99/month
3. Copy the Price IDs (starting with `price_`) to your `.env.local`
4. Set up a webhook endpoint:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment (Vercel)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy!
5. Update Stripe webhook URL to your production domain

## 📁 Project Structure

```
SmartPromts/
├── app/
│   ├── api/
│   │   ├── auth/signout/      # Sign out endpoint
│   │   ├── optimize/          # Prompt optimization endpoint
│   │   └── stripe/
│   │       ├── checkout/      # Create checkout session
│   │       └── webhook/       # Handle Stripe events
│   ├── dashboard/             # Protected dashboard pages
│   ├── login/                 # Magic link login page
│   ├── pricing/               # Pricing tiers page
│   ├── layout.tsx             # Root layout with providers
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── lib/
│   ├── auth.ts                # Authentication utilities
│   ├── openai.ts              # OpenAI service
│   ├── rate-limit.ts          # Rate limiting logic
│   ├── stripe.ts              # Stripe configuration
│   ├── supabase.ts            # Supabase clients
│   └── usage.ts               # Usage tracking
├── middleware.ts              # Auth & route protection
├── .env.example               # Environment template
└── package.json               # Dependencies
```

## 🔒 Security Features

- **Session-based Authentication** - No client-provided user IDs
- **Rate Limiting** - Prevents API abuse (10 req/min per user)
- **Usage Limits** - Tier-based monthly caps
- **Stripe Webhook Verification** - Signature validation
- **Row-Level Security** - Supabase RLS policies
- **Middleware Protection** - Route guards for authenticated areas

## 📊 Subscription Tiers

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Optimizations/month | 10 | 1,000 | Unlimited |
| All AI Models | ✅ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Team Management | ❌ | ❌ | ✅ |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Stripe](https://stripe.com/)
- [OpenAI](https://openai.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Note**: Place a screenshot of your dashboard in `./docs/dashboard-screenshot.png` for the README display. The landing page supports dynamic day/night themes.