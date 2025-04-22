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

export interface TypingScore {
  id?: number;
  wpm: number;
  accuracy: number;
  date: Date;
  wordCount: number;
  duration: number;
  synced: boolean;
}
