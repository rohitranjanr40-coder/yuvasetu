

export interface Video {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  channelName: string | null;
  views: number | null;
  createdAt: string | null;
  duration: string | null;
  category: string | null;
  live: boolean | null;
  description: string | null;
  userId: number | null;
  videoUrl?: string | null;
}

export interface Short {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelName:string;
  views: number;
  videoUrl?: string;
}

export interface User {
  id: number;
  firebaseUid: string | null;
  name: string;
  email: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  galleryPhotos: any; // Can be an array of strings or objects
  joiners: number | null;
  role: 'user' | 'admin';
  membershipTier?: string | null;
}

export interface Comment {
    id: number;
    text: string;
    createdAt: string | null;
    userId: number | null;
    videoId: number | null;
}

export interface Notification {
  id: string;
  type: 'new_video' | 'live_stream' | 'new_joiner' | 'comment_reply';
  user: User;
  text: string;
  timestamp: string;
  read: boolean;
  href?: string;
}

export interface TestInstructions {
  durationInMinutes: number;
  marksPerQuestion: number;
  negativeMarks: number;
  permittedItems: string;
  prohibitedItems: string;
  generalInstructions: string[];
  declaration: string;
}

export interface Question {
    id: number;
    testId: number;
    questionText: string;
    options: string[];
    correctAnswer: string;
    solution?: string;
}

export interface Test {
  id: number;
  subject: string;
  instructions: TestInstructions | any; // Made 'any' to avoid serialization issues on server components
  isPublished: boolean | null;
  authorId: number | null;
  createdAt: string | null;
  questions?: Question[];
}

export interface TestSubmission {
    id: number;
    testId: number;
    studentId: number;
    score: number;
    submittedAt: string;
    answers: any;
}


// Types for ClipTick Feature
export interface ClipTickSegment {
  id: number;
  duration: number;
  dataUri: string;
}

export interface ClipTickDraft {
    id: string;
    createdAt: string;
    segments: ClipTickSegment[];
    selectedSong: any | null;
    songRegion: number[];
    musicVolume?: number;
    clipVolume?: number;
    caption?: string;
    privacy?: 'public' | 'followers' | 'private';
    voiceoverDataUri?: string;
    duration?: string;
}

// Types for Playlist Feature
export interface Playlist {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  createdAt: string;
  videoCount?: number;
  thumbnailUrl?: string | null;
}

