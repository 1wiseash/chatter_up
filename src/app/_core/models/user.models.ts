import { MembershipType } from "./membership.models";

export interface AuthData {
    email: string;
    password: string;
}

export interface User {
    username: string;
    gameCounts: {
        business: number,
        dating: number,
        social: number,
    },
    chatScores: {
        business: number[],
        dating: number[],
        social: number[],
    },
    membershipLevel?: MembershipType,
}

export const DEFAULT_USER: User = {
    username: '',
    gameCounts: {
        business: 0,
        dating: 0,
        social: 0,
    },
    chatScores: {
        business: [],
        dating: [],
        social: [],
    },
    membershipLevel: MembershipType.Free,
}

export const GUEST_USER: User = {
    username: 'guest',
    gameCounts: {
        business: 0,
        dating: 0,
        social: 0,
    },
    chatScores: {
        business: [],
        dating: [],
        social: [],
    },
    membershipLevel: MembershipType.Free,
}
