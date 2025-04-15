export interface TypingState {
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  startTime: number | null;
  wpm: number;
  completed: boolean;
}
