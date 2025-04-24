import { ref, computed, reactive, onMounted } from 'vue';
import type { TypingState, TypingScore } from '~/types';

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
  
  const { saveScore } = useIndexedDB();
  const { syncNewScore } = useSyncScores();
  const user = useSupabaseUser();

  const state = reactive<TypingState>({
    words: getRandomWords(),
    currentWordIndex: 0,
    currentInput: '',
    startTime: null,
    wpm: 0,
    completed: false,
    correctChars: 0,
    incorrectChars: 0
  });

  const highScore = ref<number | null>(null);
  const { getHighestScore } = useIndexedDB();

  // Load high score on mount
  onMounted(async () => {
    if (process.client) {
      try {
        const score = await getHighestScore();
        if (score) {
          highScore.value = score.wpm;
        }
      } catch (err) {
        console.error('Failed to load high score:', err);
      }
    }
  });

  // Calculate WPM
  const calculateWPM = () => {
    if (!state.startTime) return 0;
    
    const timeElapsed = (Date.now() - state.startTime) / 1000 / 60; // in minutes
    const wordCount = state.currentWordIndex;
    
    return Math.round(wordCount / timeElapsed);
  };

  // Calculate accuracy
  const calculateAccuracy = () => {
    const totalChars = state.correctChars + state.incorrectChars;
    return totalChars > 0 ? (state.correctChars / totalChars) * 100 : 0;
  };

  // Handle input changes
  const handleInput = (event: Event) => {
    const input = (event.target as HTMLInputElement).value;
    const prevInput = state.currentInput;
    
    // Start timer on first input
    if (!state.startTime && input.length > 0) {
      state.startTime = Date.now();
    }
    
    // Track accuracy by comparing with current word
    const currentWord = state.words[state.currentWordIndex];
    
    // If input is longer than previous input, check the new character
    if (input.length > prevInput.length) {
      const newCharIndex = input.length - 1;
      if (newCharIndex < currentWord.length) {
        if (input[newCharIndex] === currentWord[newCharIndex]) {
          state.correctChars++;
        } else {
          state.incorrectChars++;
        }
      } else {
        // Extra character beyond word length
        state.incorrectChars++;
      }
    }
    
    state.currentInput = input;
  };

  // Handle key presses
  const handleKeyDown = (event: KeyboardEvent) => {
    // Start timer on first input if not already started
    if (!state.startTime && state.currentInput.length > 0) {
      state.startTime = Date.now();
    }

    // If space is pressed, move to the next word regardless of correctness
    if (event.key === ' ') {
      // Move to next word
      state.currentWordIndex++;
      state.currentInput = '';
      
      // Update WPM
      if (state.startTime) {
        state.wpm = calculateWPM();
      }
      
      // Check if test is completed
      if (state.currentWordIndex >= state.words.length) {
        state.completed = true;
        saveTestScore();
      }
      
      event.preventDefault();
    }
  };

  // Save score to IndexedDB and sync to Supabase
  const saveTestScore = async () => {
    if (!state.startTime || !state.completed) return;
    
    const endTime = Date.now();
    const duration = (endTime - state.startTime) / 1000; // in seconds
    const accuracy = calculateAccuracy();
    
    try {
      const score = {
        wpm: state.wpm,
        accuracy,
        date: new Date(),
        wordCount: state.words.length,
        duration,
        synced: false,
        userId: user.value?.id
      };
      
      // Save to IndexedDB first
      const scoreId = await saveScore(score);
      
      // Then try to sync with Supabase
      if (navigator.onLine) {
        console.log('Syncing to supabase...')
        await syncNewScore({ ...score, id: scoreId });
      }
      
      // Update high score if needed
      if (highScore.value === null || state.wpm > highScore.value) {
        highScore.value = state.wpm;
      }
    } catch (err) {
      console.error('Failed to save score:', err);
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
    state.correctChars = 0;
    state.incorrectChars = 0;
  };

  return {
    state,
    highScore,
    handleInput,
    handleKeyDown,
    resetTest,
    saveTestScore
  };
}
