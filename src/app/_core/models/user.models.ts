import { ChatterUpGame, GameType } from "./game.models";
import { MembershipType } from "./membership.models";

export interface AuthData {
    email: string;
    password: string;
}

export enum SkillLevel {
    Novice = 0,
    Beginner = 100,
    Intermediate = 500,
    Advanced = 1000,
    Expert = 2000,
    Genius = 5000,
}

export interface User {
    id: string;
    name?: string;
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

export const DEFAULT_AVATAR = '/assets/img/logo.png';

export const DEFAULT_USER: User = {
    id: '',
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
    id: '',
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

export interface UserProfile {
    id: string;
    avatarURL: string;
    username: string;
    story: string;
    rank: {'business': number, 'dating': number, 'social': number};
}

export const DEFAULT_USER_PROFILE: UserProfile = {
    id: '',
    avatarURL: DEFAULT_AVATAR,
    username: '',
    story: 'On the journey to be a better conversationalist.',
    rank: {'business': 0, 'dating': 0, 'social': 0},
}