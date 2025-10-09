import { ChatterUpGame, GameType } from "./game.models";
import { MembershipType } from "./membership.models";

export interface AuthData {
    email: string;
    password: string;
}

export interface User {
    username: string;
    chatterUpGames: string[];
    chatterUpStats: {
        bestScores: {'business': number, 'dating': number, 'social': number},
        totalScores: {'business': number, 'dating': number, 'social': number},
        gameCounts: {'business': number, 'dating': number, 'social': number},
        streakDays: {'business': number, 'dating': number, 'social': number},
    };
    membershipLevel: MembershipType;
}

export const DEFAULT_USER: User = {
    username: '',
    chatterUpGames: [],
    chatterUpStats: {
        bestScores: {'business': 0, 'dating': 0, 'social': 0},
        totalScores: {'business': 0, 'dating': 0, 'social': 0},
        gameCounts: {'business': 0, 'dating': 0, 'social': 0},
        streakDays: {'business': 0, 'dating': 0, 'social': 0},
    },
    membershipLevel: MembershipType.Free,
}

export const GUEST_USER: User = {
    username: 'guest',
    chatterUpGames: [],
    chatterUpStats: {
        bestScores: {'business': 0, 'dating': 0, 'social': 0},
        totalScores: {'business': 0, 'dating': 0, 'social': 0},
        gameCounts: {'business': 0, 'dating': 0, 'social': 0},
        streakDays: {'business': 0, 'dating': 0, 'social': 0},
    },
    membershipLevel: MembershipType.Free,
}
