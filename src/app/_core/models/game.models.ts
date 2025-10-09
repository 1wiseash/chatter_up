import { Timestamp } from "firebase/firestore";
import { MembershipType } from "./membership.models";
import { User } from "./user.models";

export const CHATTER_UP_GAME_DURATION = 60000;

export enum GameType {
    business = 'business',
    dating = 'dating',
    social = 'social',
}

export interface GameTypeInfo {
    id: GameType;
    title: string;
    description: string;
    imageURL: string;
    scenarios: string[];
}

export const environments: GameTypeInfo[] = [
    {
      id: GameType.business,
      title: 'Business Networking',
      description: 'Master professional conversations, elevator pitches, and business small talk',
      imageURL: 'https://d64gsuwffb70l.cloudfront.net/68c420a0b789544db45fdcdd_1757683915688_7b274ae7.webp',
      scenarios: [
        'Conference networking mixer',
        'Industry meetup after-party',
        'Corporate lunch gathering',
        'Startup pitch event mingling',
        'Professional association meeting',
      ],
    },
    {
      id: GameType.dating,
      title: 'Online Dating',
      description: 'Practice engaging conversations that spark genuine connections',
      imageURL: 'https://d64gsuwffb70l.cloudfront.net/68c420a0b789544db45fdcdd_1757683919457_95a9c325.webp',
      scenarios: [
        'Coffee shop first date',
        'Online dating app conversation',
        'Speed dating event',
        'Casual bar encounter',
        'Friend\'s party introduction',
      ],
    },
    {
      id: GameType.social,
      title: 'Social Events',
      description: 'Build confidence at parties, gatherings, and casual meetups',
      imageURL: 'https://d64gsuwffb70l.cloudfront.net/68c420a0b789544db45fdcdd_1757683924034_4ee48844.webp',
      scenarios: [
        'House party with strangers',
        'Wedding reception table',
        'Gym or fitness class',
        'Neighborhood barbecue',
        'Volunteer event teamwork',
      ],
    }
  ];

export type ChatMessage = {
  id: string;
  timeSent: Date;
  sender: 'user' | 'coach';
  text: string;
  scored: boolean;
  score: -2 | -1 | 0 | 1 | 2 | -999;
  flagged: boolean;
  explanation?: string;
};

export type FirestoreChatMessage = Omit<ChatMessage, 'timeSent'> & {timeSent: Timestamp};

export const DEFAULT_CHAT_MESSAGE = {
  id: '',
  timeSent: new Date(),
  sender: 'user',
  text: '',
  scored: false,
  score: 0,
  flagged: false,
}

export type ChatterUpGame = {
  id: string;
  startTime: Date;
  lastMessageTime: Date;
  type: GameType;
  scenario: string;
  messages: ChatMessage[];
  score: number;
  flagged: boolean;
  timeRemaining: number;
  userId: string;
  username: string;
  userMembershipLevel: MembershipType;
};

export type FirestoreChatterUpGame = Omit<ChatterUpGame, 'startTime' | 'lastMessageTime' | 'messages'>
 & {startTime: Timestamp, lastMessageTime: Timestamp, messages: FirestoreChatMessage[]};

export const DEFAULT_CHATTER_UP_GAME: ChatterUpGame = {
  id: '',
  startTime: new Date(0),
  lastMessageTime: new Date(0),
  type: GameType.business,
  scenario: '',
  messages: [],
  score: 0,
  flagged: false,
  timeRemaining: CHATTER_UP_GAME_DURATION,
  userId: '',
  username: '',
  userMembershipLevel: MembershipType.Free,
};

export interface Achievement {
    name: string;
    description: string;
    icon: string;
    earned: boolean;
}
