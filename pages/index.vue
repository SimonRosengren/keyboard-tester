<template>
  <div class="min-h-screen bg-kq-white dark:bg-kq-black-300 text-kq-black-300 dark:text-kq-white flex flex-col pt-48 lg:pt-60">

    
    <!-- Words Container -->
    <div
      class="w-full mb-12 relative"
    >
      <ProgressBar :progress="progress" class="mb-12" />
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
            <span class="font-semibold">TIM:</span> {{ state.elapsedTime }}
          </div>
          <!-- <div v-if="highScore"> -->
          <!--   <span class="font-semibold">High Score:</span> {{ highScore }} -->
          <!-- </div> -->
        </div>
        <div :class="{ 'pb-highlight': pbHighlighted }">
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
        class="
          absolute h-[340%] w-[180%] -left-[40%] -top-[70%]
          backdrop-blur-xl
          flex flex-col items-center justify-center
        "
        @click="focusInput"
      >
          <p class="text-lg text-kq-black font-medium mb-3">Focus lost</p>
          <p class="text-kq-black">Press <span class="mx-2 font-bold border rounded-sm py-0.5 px-2 bg-kq-white/10">Enter</span> to continue typing</p>
      </div>
    </div>

    <div class="w-full bg-gradient-to-r from-kq-pink/10 via-kq-pink/50 to-kq-pink/10 h-px mb-2" />
    <div class="w-full bg-gradient-to-r from-kq-yellow/10 via-kq-yellow/50 to-kq-yellow/10 h-px mb-2" />
    <div class="w-full bg-gradient-to-r from-kq-blue/10 via-kq-blue/50 to-kq-blue/10 h-px mb-12" />
    <!-- Instructions -->
    <div class="text-sm text-kq-white/60">
      <p class="mb-6">Type the words above. Press <span class="mx-2 font-bold border rounded-sm py-0.5 px-2 bg-kq-white/10">Space</span> to move to the next word.</p>
      <p>Restart by refreshing <span class="mx-2 font-bold border rounded-sm py-0.5 px-2 bg-kq-white/10">⌘ + r</span> or <span class="mx-2 font-bold border rounded-sm py-0.5 px-2 bg-kq-white/10">Ctrl + r</span></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
import WordsDisplay from '~/components/WordsDisplay.vue';
import TypingInput from '~/components/TypingInput.vue';
import type ProgressBar from '~/components/ProgressBar.vue';

const { state, highScore, handleInput, handleKeyDown, calculateAccuracy, resetTest } = useTypingTest();
const inputRef = ref(null);
const isFocused = ref(true);
const blurTimeout = ref<number | null>(null);
const personalBest = ref<number | null>(null);
const pbHighlighted = ref(false);
const pbAnimationTimeout = ref<number | null>(null);
const progress = computed(() => Math.floor((state.currentWordIndex / state.words.length) * 100));


// Get personal best score
const { getPersonalBestScore } = useHighScores();

// Load personal best score
onMounted(async () => {
  const bestScore = await getPersonalBestScore();
  if (bestScore) {
    personalBest.value = bestScore.wpm;
  }
  
  // Listen for the focus event from the typing test reset
  if (process.client) {
    document.addEventListener('typing-test-focused', () => {
      // Clear any pending blur timeout
      if (blurTimeout.value !== null) {
        clearTimeout(blurTimeout.value);
        blurTimeout.value = null;
      }
      isFocused.value = true;
    });
  }
});

// Update personal best when highScore changes
watch(highScore, (newHighScore) => {
  if (newHighScore && (!personalBest.value || newHighScore > personalBest.value)) {
    personalBest.value = newHighScore;
    
    // Trigger the highlight animation
    if (pbAnimationTimeout.value !== null) {
      clearTimeout(pbAnimationTimeout.value);
    }
    
    pbHighlighted.value = true;
    pbAnimationTimeout.value = window.setTimeout(() => {
      pbHighlighted.value = false;
      pbAnimationTimeout.value = null;
    }, 800);
  }
});

// Track focus state with debounce for blur
const handleFocusChange = (focused: boolean) => {
  if (focused) {
    // If focus is gained, clear any pending blur timeout
    if (blurTimeout.value !== null) {
      clearTimeout(blurTimeout.value);
      blurTimeout.value = null;
    }
    isFocused.value = true;
  } else {
    // If focus is lost, set a timeout before showing the blur overlay
    blurTimeout.value = window.setTimeout(() => {
      isFocused.value = false;
      blurTimeout.value = null;
    }, 400);
  }
};

const focusInput = () => {
  if (inputRef.value) {
    inputRef.value.inputRef.value.focus();
  }
};

// Clear any pending timeouts when component is unmounted
onBeforeUnmount(() => {
  if (blurTimeout.value !== null) {
    clearTimeout(blurTimeout.value);
  }
  
  if (pbAnimationTimeout.value !== null) {
    clearTimeout(pbAnimationTimeout.value);
  }
});

</script>

<style scoped>
.pb-highlight {
  transition: color 400ms ease-in-out;
  color: rgb(74 222 128); /* Tailwind's green-400 */
  animation: highlight-pb 800ms ease-in-out;
}

@keyframes highlight-pb {
  0% {
    color: inherit;
  }
  50% {
    color: rgb(74 222 128); /* Tailwind's green-400 */
  }
  100% {
    color: inherit;
  }
}
</style>
