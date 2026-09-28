"use client";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
    planId: string;
    onSuccess: (subscriptionId: string) => void;
    onError: (error: any) => void;
}

export default function PayPalButton({ planId, onSuccess, onError }: PayPalButtonProps) {
    const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();

    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
        return <div className="text-red-400 text-xs italic">PayPal Client ID missing</div>;
    }

    if (isPending) {
        return <div className="text-gray-400 text-xs animate-pulse">Loading PayPal...</div>;
    }

    if (isRejected) {
        return <div className="text-red-400 text-xs">Failed to load PayPal</div>;
    }

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
                alert("PayPal failed to initialize. Please check if your Client ID is correct and you have an active internet connection.");
                onError(err);
            }}
        />
    );
}
