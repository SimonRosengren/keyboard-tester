<template>
  <div class="min-h-screen bg-kq-white dark:bg-kq-black-300 text-kq-black dark:text-kq-white p-8">
    <div class="max-w-4xl mx-auto">
      <HighScoresList />

      <h1 class="text-3xl font-bold mb-6">Typing History</h1>
      
      <div v-if="loading" class="text-center py-8">
        <p>Loading your typing history...</p>
      </div>
      
      <div v-else-if="error" class="text-center py-8 text-kq-red">
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="scores.length === 0" class="text-center py-8">
        <p>No typing tests completed yet. Start typing to record your scores!</p>
        <NuxtLink to="/" class="inline-block mt-4 px-4 py-2 bg-kq-blue text-white rounded hover:bg-opacity-90">
          Go to Typing Test
        </NuxtLink>
      </div>
      
      <div v-else>
        <div class="mb-6 flex justify-between items-center">
          <div>
            <span class="font-bold">Highest WPM:</span> {{ highestWpm }}
          </div>
          <NuxtLink to="/" class="px-4 py-2 bg-kq-blue text-white rounded hover:bg-opacity-90">
            Back to Typing Test
          </NuxtLink>
        </div>
        
        <div class="bg-kq-black-100 rounded-lg overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="bg-kq-black-200 text-kq-white">
                <th class="py-3 px-4 text-left">Date</th>
                <th class="py-3 px-4 text-left">WPM</th>
                <th class="py-3 px-4 text-left">Accuracy</th>
                <th class="py-3 px-4 text-left">Words</th>
                <th class="py-3 px-4 text-left">Duration</th>
                <th class="py-3 px-4 text-left">Sync Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="score in scores" :key="score.id" class="border-t border-gray-700">
                <td class="py-3 px-4">{{ formatDate(score.date) }}</td>
                <td class="py-3 px-4 font-medium">{{ score.wpm }}</td>
                <td class="py-3 px-4">{{ score.accuracy.toFixed(1) }}%</td>
                <td class="py-3 px-4">{{ score.wordCount }}</td>
                <td class="py-3 px-4">{{ formatDuration(score.duration) }}</td>
                <td class="py-3 px-4">
                  <span :class="score.synced ? 'text-green-500' : 'text-yellow-500'">
                    {{ score.synced ? 'Synced' : 'Local Only' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useIndexedDB } from '~/composables/useIndexedDB';
import type { TypingScore } from '~/types';

const { getScores } = useIndexedDB();
const scores = ref<TypingScore[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const highestWpm = computed(() => {
  if (scores.value.length === 0) return 0;
  return Math.max(...scores.value.map(s => s.wpm));
});

onMounted(async () => {
  if (process.client) {
    try {
      loading.value = true;
      scores.value = await getScores();
      // Sort by date descending
      scores.value.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (err) {
      error.value = 'Failed to load typing history';
      console.error(err);
    } finally {
      loading.value = false;
    }
  }
});

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString();
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
</script>
