<template>
  <div class="w-full mt-8">
    <h2 class="text-xl font-bold mb-4">Your Top 5 Scores</h2>
    
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin h-8 w-8 border-4 border-kq-blue rounded-full border-t-transparent"></div>
    </div>
    
    <div v-else-if="error" class="p-4 bg-kq-red/20 text-kq-red rounded mb-4">
      {{ error }}
    </div>
    
    <div v-else-if="highScores.length === 0" class="text-center py-8">
      <p>You haven't completed any typing tests yet. Start typing to set a record!</p>
    </div>
    
    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-kq-black-100 dark:border-kq-black-300">
            <th class="py-2 px-4 text-left">#</th>
            <th class="py-2 px-4 text-left">WPM</th>
            <th class="py-2 px-4 text-left">Accuracy</th>
            <th class="py-2 px-4 text-left">Words</th>
            <th class="py-2 px-4 text-left">Date</th>
            <th class="py-2 px-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(score, index) in highScores" 
            :key="`${score.remote ? 'remote' : 'local'}-${score.id}`"
            class="border-b border-kq-black-100 dark:border-kq-black-300"
            :class="{ 'opacity-70': !score.synced }"
          >
            <td class="py-2 px-4">{{ index + 1 }}</td>
            <td class="py-2 px-4 font-bold">{{ score.wpm }}</td>
            <td class="py-2 px-4">{{ Math.round(score.accuracy) }}%</td>
            <td class="py-2 px-4">{{ score.wordCount }}</td>
            <td class="py-2 px-4">{{ formatDate(new Date(score.date)) }}</td>
            <td class="py-2 px-4">
              <span v-if="!score.synced" class="text-yellow-500 text-sm">
                Local Only
              </span>
              <span v-else class="text-green-500 text-sm">
                Synced
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { TypingScore } from '~/types';

const highScores = ref<TypingScore[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const { getPersonalHighScores } = useHighScores();

// Format date to a readable string
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Load personal high scores
const loadHighScores = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    highScores.value = await getPersonalHighScores(5);
  } catch (err: any) {
    error.value = err.message || 'Failed to load personal high scores';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadHighScores();
});
</script>
