import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
    try {
        const { subscriptionId, userId, planName, variantId } = await req.json();

        if (!subscriptionId || !userId || !planName || !variantId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Update or insert the subscription
        const { error } = await supabase
            .from('user_subscriptions')
            .upsert({
                user_id: userId,
                paypal_subscription_id: subscriptionId,
                plan_name: planName,
                variant_id: variantId,
                status: 'active',
                updated_at: new Date().toISOString(),
            }, { onConflict: 'paypal_subscription_id' });

        if (error) {
            console.error('Database Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('PayPal Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
