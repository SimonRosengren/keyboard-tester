import { ref, computed, reactive } from 'vue';
import type { TypingState } from '~/types';

// List of common words for the typing test
const wordList = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what'
];

export function useTypingTest() {
  // Get 25 random words from the list
  const getRandomWords = (count: number = 25): string[] => {
    const shuffled = [...wordList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const state = reactive<TypingState>({
    words: getRandomWords(),
    currentWordIndex: 0,
    currentInput: '',
    startTime: null,
    wpm: 0,
    completed: false
  });

  // We'll get the inputRef from the component

  // Calculate WPM
  const calculateWPM = () => {
    if (!state.startTime) return 0;
    
    const timeElapsed = (Date.now() - state.startTime) / 1000 / 60; // in minutes
    const wordCount = state.currentWordIndex;
    
    return Math.round(wordCount / timeElapsed);
  };

  // Handle input changes
  const handleInput = (event: Event) => {
    const input = (event.target as HTMLInputElement).value;
    
    // Start timer on first input
    if (!state.startTime && input.length > 0) {
      state.startTime = Date.now();
    }
    
    state.currentInput = input;
  };

  // Handle space key to move to next word
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === ' ' && state.currentInput.trim() !== '') {
      // Check if current input matches current word
      if (state.currentInput.trim() === state.words[state.currentWordIndex]) {
        state.currentWordIndex++;
        state.currentInput = '';
        
        // Update WPM
        if (state.startTime) {
          state.wpm = calculateWPM();
        }
        
        // Check if test is completed
        if (state.currentWordIndex >= state.words.length) {
          state.completed = true;
        }
      }
      
      event.preventDefault();
    }
  };

  // Reset the typing test
  const resetTest = () => {
    state.words = getRandomWords();
    state.currentWordIndex = 0;
    state.currentInput = '';
    state.startTime = null;
    state.wpm = 0;
    state.completed = false;
    
    // Focus the input field
    setTimeout(() => {
      inputRef.value?.focus();
    }, 0);
  };

  return {
    state,
    handleInput,
    handleKeyDown,
    resetTest
  };
}
