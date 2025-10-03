
export enum GameType {
    business,
    dating,
    social,
}

export interface GameInfo {
    id: GameType;
    title: string;
    description: string;
    imageURL: string;
    color: string;
}

export const environments: GameInfo[] = [
    {
      id: GameType.business,
      title: 'Business Networking',
      description: 'Master professional conversations, elevator pitches, and business small talk',
      imageURL: 'https://d64gsuwffb70l.cloudfront.net/68c420a0b789544db45fdcdd_1757683915688_7b274ae7.webp',
      color: 'blue'
    },
    {
      id: GameType.dating,
      title: 'Online Dating',
      description: 'Practice engaging conversations that spark genuine connections',
      imageURL: 'https://d64gsuwffb70l.cloudfront.net/68c420a0b789544db45fdcdd_1757683919457_95a9c325.webp',
      color: 'pink'
    },
    {
      id: GameType.social,
      title: 'Social Events',
      description: 'Build confidence at parties, gatherings, and casual meetups',
      imageURL: 'https://d64gsuwffb70l.cloudfront.net/68c420a0b789544db45fdcdd_1757683924034_4ee48844.webp',
      color: 'green'
    }
  ];
