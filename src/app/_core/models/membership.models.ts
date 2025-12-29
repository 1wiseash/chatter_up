export enum MembershipType {
    Free,
    Basic,
    Premium,
}

export interface MembershipInfo {
    id: MembershipType;
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
        id: MembershipType.Basic,
        name: 'Basic',
        monthlyPrice: 4.99,
        description: 'Detailed coach feedback',
        features: ['Everything in Free', '3-day free trial', 'Detailed score explanations', 'Personal progress tracking', 'Conversation history', 'Weekly tips newsletter'],
        popular: true,
        comingSoon: false,
    }, {
        id: MembershipType.Premium,
        name: 'Premium',
        monthlyPrice: 7.49,
        description: 'Access to all features',
        features: ['Everything in Basic', 'Coach suggestions upon request', 'Conversation Rewinds', 'Invitations to special events', 'Priority support'],
        popular: false,
        comingSoon: true,
    }
];
