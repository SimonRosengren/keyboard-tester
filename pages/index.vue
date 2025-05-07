<template>
  <div class="min-h-screen bg-kq-white dark:bg-kq-black-300 text-kq-black-300 dark:text-kq-white flex flex-col items-center justify-center">

    
    <!-- Words Container -->
    <div
      class="w-full mb-6 relative"
    >
      <WordsDisplay 
        :words="state.words" 
        :currentWordIndex="state.currentWordIndex"
        :currentInput="state.currentInput"
        :incorrectPositions="state.incorrectPositions"
      />
      <div class="flex justify-between w-full">
      <!-- WPM Counter and High Score -->
        <div class="text-md grid grid-cols-4 w-fit gap-6">
          <div>
            <span class="font-semibold">WPM:</span> {{ state.wpm }}
          </div>
          <div>
            <span class="font-semibold">ACC:</span> {{ Math.floor(calculateAccuracy) }}%
          </div>
          <div>
            <span class="font-semibold">COM:</span> {{ Math.floor((state.currentWordIndex / state.words.length) * 100) }}%
          </div>
          <div>
            <span class="font-semibold">TIM:</span> {{ state.elapsedTime }}
          </div>

          <!-- <div v-if="highScore"> -->
          <!--   <span class="font-semibold">High Score:</span> {{ highScore }} -->
          <!-- </div> -->
        </div>
        <div>
            <span class="font-semibold">PB:</span> {{ personalBest || '-' }}
        </div>
      </div>
      
      <TypingInput 
        ref="inputRef"
        :currentInput="state.currentInput"
        :completed="state.completed"
        :wpm="state.wpm"
        @input="handleInput"
        @keydown="handleKeyDown"
        @reset="resetTest"
        @focus="handleFocusChange(true)"
        @blur="handleFocusChange(false)"
      />
      
      <!-- Focus Overlay -->
      <div 
        v-if="!state.completed && !isFocused" 
        class="absolute inset-0 backdrop-blur-sm flex items-center justify-center"
        @click="focusInput"
      >
        <div class="text-center bg-kq-pink p-6 border-2 rounded-lg border-kq-yellow shadow-md">
          <p class="text-lg text-kq-black font-medium mb-2">Focus lost</p>
          <p class="text-kq-black">Press <span class="font-bold">enter</span> to continue typing</p>
        </div>
      </div>
    </div>
    
    <!-- Instructions -->
    <div class="text-sm text-gray-600">
      <p>Type the words above. Press space to move to the next word. Your WPM (words per minute) will be calculated as you type.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import WordsDisplay from '~/components/WordsDisplay.vue';
import TypingInput from '~/components/TypingInput.vue';

const { state, highScore, handleInput, handleKeyDown, calculateAccuracy, resetTest } = useTypingTest();
const inputRef = ref(null);
const isFocused = ref(true);
const personalBest = ref<number | null>(null);

// Get personal best score
const { getPersonalBestScore } = useHighScores();

// Load personal best score
onMounted(async () => {
  const bestScore = await getPersonalBestScore();
  if (bestScore) {
    personalBest.value = bestScore.wpm;
  }
});

// Update personal best when highScore changes
watch(highScore, (newHighScore) => {
  if (newHighScore && (!personalBest.value || newHighScore > personalBest.value)) {
    personalBest.value = newHighScore;
  }
});

// Track focus state
const handleFocusChange = (focused: boolean) => {
  isFocused.value = focused;
};

const focusInput = () => {
  if (inputRef.value) {
    inputRef.value.inputRef.value.focus();
  }
};

</script>
