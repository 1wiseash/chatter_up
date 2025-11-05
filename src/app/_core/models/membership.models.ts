export enum MembershipType {
    Free,
    Paid,
    Premium,
}

export interface MembershipInfo {
    id: MembershipType;
    stripePlanId?: string;
    stripePlanTestId?: string;
    name: string;
    monthlyPrice: number;
    description: string;
    features: string[];
    popular: boolean;
    comingSoon: boolean;
}

export const MembershipPlans: MembershipInfo[] = [{
        id: MembershipType.Free,
        name: 'Free',
        monthlyPrice: 0,
        description: 'Play Chatter Up! for free',
        features: ['Unlimited practice sessions', 'Numeric message scoring', 'Access to all environments', 'View greatest hits', 'No credit card required'],
        popular: false,
        comingSoon: false,
    }, {
        id: MembershipType.Paid,
        stripePlanId: 'price_1SMqhcJcBOj7rqgxxb3GVRfS',
        stripePlanTestId: 'price_1SOhsxJcBOj7rqgxWUYtNVut',
        name: 'Paid',
        monthlyPrice: 4.99,
        description: 'Detailed coach feedback',
        features: ['Everything in Free', '3-day free trial', 'Detailed score explanations', 'Personal progress tracking', 'Conversation history', 'Weekly tips newsletter'],
        popular: true,
        comingSoon: false,
    }, {
        id: MembershipType.Premium,
        stripePlanId: 'price_1SMqtDJcBOj7rqgxtjZQgyp1',
        name: 'Premium',
        monthlyPrice: 7.49,
        description: 'Access to all features',
        features: ['Everything in Paid Member', 'Coach suggestions upon request', 'Conversation Rewinds', 'Invitations to special events', 'Priority support'],
        popular: false,
        comingSoon: true,
    }
];
