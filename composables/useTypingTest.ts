import { ref, computed, reactive, onMounted } from 'vue';
import type { TypingState, TypingScore } from '~/types';

// List of words for the typing test with varied finger placement
const wordList = [
  'quick', 'jump', 'lazy', 'fox', 'brown', 'dog', 'over', 'type', 'keyboard', 'finger',
  'rhythm', 'jazz', 'quiz', 'waltz', 'nymph', 'vex', 'fjord', 'glyphs', 'zephyr', 'sphinx',
  'pixel', 'quartz', 'jinx', 'azure', 'oxygen', 'zombie', 'vortex', 'whiskey', 'jackpot', 'maximize',
  'complex', 'subway', 'quip', 'wizard', 'jukebox', 'kayak', 'equip', 'matrix', 'puzzle', 'hybrid',
  'syntax', 'python', 'javascript', 'react', 'vue', 'nuxt', 'code', 'program', 'function', 'variable',
  'method', 'object', 'array', 'string', 'number', 'boolean', 'interface', 'component', 'module', 'export'
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
  let interval = 0;

  const state = reactive<TypingState>({
    words: getRandomWords(),
    currentWordIndex: 0,
    currentInput: '',
    startTime: null,
    elapsedTime: 0,
    wpm: 0,
    completed: false,
    correctChars: 0,
    incorrectChars: 0,
    incorrectPositions: {}
  });

  const highScore = ref<number | null>(null);
  const { getHighestScore } = useIndexedDB();

  // Register lifecycle hooks before any async operations
  if (process.client) {
    onMounted(() => {
      // Load high score
      getHighestScore()
        .then(score => {
          if (score) {
            highScore.value = score.wpm;
          }
        })
        .catch(err => {
          console.error('Failed to load high score:', err);
        });
    });
  }

  // Track correctly typed words
  const correctWords = ref<number>(0);
  
  // Calculate WPM
  const calculateWPM = () => {
    if (!state.startTime) return 0;
    
    const timeElapsed = (Date.now() - state.startTime) / 1000 / 60; // in minutes
    // Only count correctly typed words
    const wordCount = correctWords.value;
    
    return Math.round(wordCount / timeElapsed);
  };

  // Calculate accuracy
  const calculateAccuracy = computed(() => {
    const totalChars = state.correctChars + state.incorrectChars;
    return totalChars > 0 ? (state.correctChars / totalChars) * 100 : 0;
  });

  // Handle input changes
  const handleInput = (event: Event) => {
    const input = (event.target as HTMLInputElement).value;
    const prevInput = state.currentInput;
    
    // Start timer on first input
    if (!state.startTime && input.length > 0) {
      state.startTime = Date.now();

      if (interval) {
        clearInterval(interval);
      }
      interval = setInterval(() => {
        state.elapsedTime++;
      }, 1000)
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
          // Store the incorrect position for the current word
          if (!state.incorrectPositions[state.currentWordIndex]) {
            state.incorrectPositions[state.currentWordIndex] = {};
          }
          state.incorrectPositions[state.currentWordIndex][newCharIndex] = true;
        }
      } else {
        // Extra character beyond word length
        state.incorrectChars++;
        // Store the incorrect position for the current word
        if (!state.incorrectPositions[state.currentWordIndex]) {
          state.incorrectPositions[state.currentWordIndex] = {};
        }
        state.incorrectPositions[state.currentWordIndex][newCharIndex] = true;
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

    // If space is pressed, move to the next word
    if (event.key === ' ') {
      // Check if the word was typed correctly
      const currentWord = state.words[state.currentWordIndex];
      const isCorrect = state.currentInput.trim() === currentWord;
      
      // Only increment correct words count if the word was typed correctly
      if (isCorrect) {
        correctWords.value++;
      }
      
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
        if (interval) {
          clearInterval(interval);
        }
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
    
    try {
      const score = {
        wpm: state.wpm,
        accuracy: calculateAccuracy.value,
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
    state.elapsedTime = 0;
    state.completed = false;
    state.correctChars = 0;
    state.incorrectChars = 0;
    state.incorrectPositions = {};
    correctWords.value = 0;

    if (interval) {
      clearInterval(interval);
    }
  };

  return {
    state,
    highScore,
    handleInput,
    handleKeyDown,
    resetTest,
    calculateAccuracy,
    saveTestScore
  };
}
