// supabase:allow-unauthenticated
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown> | string) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Price ID to tier mapping
const PRICE_TO_TIER: Record<string, string> = {
  "price_1SzpxL00hgPyjPBoVuIUrdh0": "plus",   // $9.99/month
  "price_1Szq2s00hgPyjPBo7CHRJUZa": "pro",     // $19.99/3 months
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    logStep("ERROR: STRIPE_SECRET_KEY not set");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500, headers: corsHeaders });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-04-30.basil" });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;

    if (webhookSecret && sig) {
      try {
        event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        let errorMsg = "Unknown error";
        if (typeof err === "object" && err && "message" in err) {
          errorMsg = (err as { message: string }).message;
        }
        logStep("ERROR: Webhook signature verification failed", { error: errorMsg });
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400, headers: corsHeaders });
      }
    } else {
      // Fallback: parse without signature verification (for testing)
      event = JSON.parse(body);
      logStep("WARNING: Processing without signature verification");
    }

    logStep("Event received", { type: event.type, id: event.id });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_details?.email || session.customer_email;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      logStep("Checkout completed", { customerEmail, customerId, subscriptionId });

      if (!customerEmail) {
        logStep("ERROR: No customer email found");
        return new Response(JSON.stringify({ error: "No customer email" }), { status: 400, headers: corsHeaders });
      }

      // Get subscription to determine the price/tier
      let tier = "plus"; // default
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;
        tier = PRICE_TO_TIER[priceId] || "plus";
        logStep("Determined tier from subscription", { priceId, tier });
      }

      // Find user by email and update their profile
      const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      if (userError) {
        logStep("ERROR: Failed to list users", { error: userError.message });
        return new Response(JSON.stringify({ error: "Failed to find user" }), { status: 500, headers: corsHeaders });
      }

      const user = users.users.find((u: { email: string }) => u.email === customerEmail);
      if (!user) {
        logStep("ERROR: No user found for email", { customerEmail });
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: corsHeaders });
      }

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ subscription_tier: tier, stripe_customer_id: customerId })
        .eq("id", user.id);

      if (updateError) {
        logStep("ERROR: Failed to update profile", { error: updateError.message });
        return new Response(JSON.stringify({ error: "Failed to update profile" }), { status: 500, headers: corsHeaders });
      }

      logStep("Profile updated successfully", { userId: user.id, tier });

    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      logStep("Subscription deleted", { customerId });

      // Find profile by stripe_customer_id
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profileError || !profile) {
        logStep("ERROR: Profile not found for customer", { customerId, error: profileError?.message });
        return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: corsHeaders });
      }

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ subscription_tier: "free" })
        .eq("id", profile.id);

      if (updateError) {
        logStep("ERROR: Failed to downgrade profile", { error: updateError.message });
        return new Response(JSON.stringify({ error: "Failed to update profile" }), { status: 500, headers: corsHeaders });
      }

      logStep("Profile downgraded to free", { userId: profile.id });
    } else {
      logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
