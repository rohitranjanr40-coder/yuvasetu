export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  channelAvatarUrl: string;
  views: number;
  uploadedAt: string;
  duration: string;
  category: string;
  live?: boolean;
}

export interface Short {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  views: number;
}

export interface User {
  id:string;
  name: string;
  avatarUrl: string;
  subscribers: number;
  teacherId?: string;
}

export interface Comment {
    id: string;
    user: User;
    text: string;
    timestamp: string;
}

export interface Test {
  id: string;
  subject: string;
  durationInMinutes: number;
  questions: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}
