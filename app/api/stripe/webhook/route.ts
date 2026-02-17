import { NextRequest, NextResponse } from 'next/server'
import { stripe, getTierFromPriceId } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId) {
          console.error('No userId in session metadata')
          return NextResponse.json(
            { error: 'Missing userId in metadata' },
            { status: 400 }
          )
        }

        // Get subscription details
        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id
        const tier = getTierFromPriceId(priceId)

        // Update user subscription
        const { error } = await supabase
          .from('users')
          .update({
            subscription_tier: tier,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
          })
          .eq('id', userId)

        if (error) {
          console.error('Failed to update user subscription:', error)
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          )
        }

        console.log(`Subscription created for user ${userId}: ${tier}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: user, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (fetchError || !user) {
          console.error('User not found for customer:', customerId, fetchError)
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        const priceId = subscription.items.data[0].price.id
        const tier = getTierFromPriceId(priceId)

        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_tier: tier,
            stripe_subscription_id: subscription.id,
          })
          .eq('id', user.id)

        if (updateError) {
          console.error('Failed to update user subscription:', updateError)
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          )
        }

        console.log(`Subscription updated for user ${user.id}: ${tier}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: user, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (fetchError || !user) {
          console.error('User not found for customer:', customerId, fetchError)
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        // Downgrade to free tier
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_tier: 'free',
            stripe_subscription_id: null,
          })
          .eq('id', user.id)

        if (updateError) {
          console.error('Failed to downgrade user to free tier:', updateError)
          return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
          )
        }

        console.log(`Subscription cancelled for user ${user.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
