"use client";
import { PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
    planId: string;
    onSuccess: (subscriptionId: string) => void;
    onError: (error: any) => void;
}

export default function PayPalButton({ planId, onSuccess, onError }: PayPalButtonProps) {
    return (
        <PayPalButtons
            style={{
                shape: 'rect',
                color: 'gold',
                layout: 'vertical',
                label: 'subscribe'
            }}
            createSubscription={(data, actions) => {
                return actions.subscription.create({
                    plan_id: planId
                });
            }}
            onApprove={async (data, actions) => {
                if (data.subscriptionID) {
                    onSuccess(data.subscriptionID);
                }
            }}
            onError={(err) => {
                console.error("PayPal Subscription Error:", err);
                onError(err);
            }}
        />
    );
}
