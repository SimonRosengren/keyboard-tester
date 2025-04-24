export interface TypingState {
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  startTime: number | null;
  wpm: number;
  completed: boolean;
  correctChars: number;
  incorrectChars: number;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

export interface TypingScore {
  id?: number;
  userId?: string;
  anonymousId?: string;
  wpm: number;
  accuracy: number;
  date: Date;
  wordCount: number;
  duration: number;
  synced: boolean;
  remote?: boolean; // Indicates if the score is from remote database
}
