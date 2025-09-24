
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Gem, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { updateMembership } from "@/lib/actions";
import React from "react";

type TierName = 'Bronze' | 'Silver' | 'Gold';

const membershipTiers: { name: TierName; price: string; icon: React.ElementType; features: string[]; className: string; buttonClass: string; }[] = [
    {
        name: "Bronze",
        price: "₹49",
        icon: Star,
        features: [
            "Ad-free viewing",
            "Custom chat badge",
            "Access to member-only polls",
        ],
        className: "border-amber-700/50 hover:border-amber-700",
        buttonClass: "bg-amber-700 hover:bg-amber-800"
    },
    {
        name: "Silver",
        price: "₹99",
        icon: Gem,
        features: [
            "All Bronze benefits",
            "Access to exclusive content",
            "Early access to new videos",
            "Member-only live streams",
        ],
        className: "border-slate-500/50 hover:border-slate-500",
        buttonClass: "bg-slate-500 hover:bg-slate-600"
    },
    {
        name: "Gold",
        price: "₹199",
        icon: Crown,
        features: [
            "All Silver benefits",
            "Behind-the-scenes content",
            "Direct shout-outs in videos",
            "Priority replies to comments",
        ],
        className: "border-yellow-500/50 hover:border-yellow-500",
        buttonClass: "bg-yellow-500 hover:bg-yellow-600"
    },
];

export default function MembershipPage() {
    const { user, loading, refreshUser } = useAuth();
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = React.useState<TierName | null>(null);

    const handleChoosePlan = async (tier: TierName) => {
        if (!user) {
            toast({ variant: "destructive", title: "Please log in to choose a plan." });
            return;
        }

        setIsUpdating(tier);
        const result = await updateMembership(user.id, tier.toLowerCase());
        
        if (result.success) {
            await refreshUser(); // Re-fetch user data to get the latest membership status
            toast({ title: "Membership Updated!", description: `You are now a ${tier} member.` });
        } else {
            toast({ variant: "destructive", title: "Failed to update membership.", description: result.error });
        }
        setIsUpdating(null);
    };

    const currentTier = user?.membershipTier;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Become a Member</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Support your favorite creators and get exclusive perks.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {membershipTiers.map((tier) => {
                    const isCurrent = currentTier === tier.name.toLowerCase();
                    const isProcessing = isUpdating === tier.name;
                    return (
                        <Card key={tier.name} className={cn("flex flex-col transition-all hover:shadow-lg", tier.className, isCurrent && 'ring-2 ring-primary')}>
                            <CardHeader className="items-center">
                                <div className="p-4 bg-muted rounded-full">
                                    <tier.icon className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-headline">{tier.name}</CardTitle>
                                <CardDescription className="text-lg">
                                    <span className="text-2xl font-bold">{tier.price}</span>
                                    /month
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3">
                                <p className="font-semibold text-center">What you get:</p>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {tier.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className={cn("w-full", tier.buttonClass)} 
                                    onClick={() => handleChoosePlan(tier.name)}
                                    disabled={isProcessing || loading || isCurrent}
                                >
                                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isCurrent ? <Check className="mr-2 h-4 w-4" /> : null}
                                    {isCurrent ? 'Current Plan' : `Choose ${tier.name}`}
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

             <Card className="mt-12">
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold">How do memberships work?</h4>
                        <p className="text-sm text-muted-foreground">By becoming a member, you are directly supporting creators on a monthly basis, which helps them continue making the content you love. In return, you get access to special perks.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Can I cancel anytime?</h4>
                        <p className="text-sm text-muted-foreground">Yes, you can cancel your membership at any time. You will retain your benefits until the end of your current billing cycle.</p>
                    </div>
                     <div>
                        <h4 className="font-semibold">How will payments be handled?</h4>
                        <p className="text-sm text-muted-foreground">Payment processing will be handled through a secure, third-party provider (e.g., Stripe, Razorpay). This feature is coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
