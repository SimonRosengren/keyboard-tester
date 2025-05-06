<template>
  <div class="w-full">
    <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
      <Icon name="lets-icons:world-2" class="text-kq-white !h-6 !w-6" />
      Global
    </h2>
    
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin h-8 w-8 border-4 border-kq-blue rounded-full border-t-transparent"></div>
    </div>
    
    <div v-else-if="error" class="p-4 bg-kq-red/20 text-kq-red rounded mb-4">
      {{ error }}
    </div>
    
    <div v-else-if="highScores.length === 0" class="text-center py-8">
      <p>No high scores yet. Start typing to set a record!</p>
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
            :class="{ 
              'bg-kq-blue/10': isCurrentUser(score),
              'opacity-70': !score.synced
            }"
          >
            <td class="py-2 px-4">{{ index + 1 }}</td>
            <td class="py-2 px-4 font-bold">{{ score.wpm }}</td>
            <td class="py-2 px-4">{{ Math.round(score.accuracy) }}%</td>
            <td class="py-2 px-4">{{ score.wordCount }}</td>
            <td class="py-2 px-4">{{ formatDate(new Date(score.date)) }}</td>
            <td class="py-2 px-4">
              <span v-if="!score.synced" class="text-yellow-500 text-sm">
                Syncing...
              </span>
              <span v-else-if="isCurrentUser(score)" class="text-green-500 text-sm">
                You
              </span>
              <span v-else class="text-sm text-gray-500">
                Other
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
const { getCombinedHighScores } = useHighScores();
const { getAnonymousId } = useIndexedDB();
const user = useSupabaseUser();

// Format date to a readable string
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Check if the score belongs to the current user
const isCurrentUser = (score: TypingScore) => {
  if (user.value && score.userId === user.value.id) {
    return true;
  }
  
  // Check anonymous ID
  const anonymousId = getAnonymousId();
  return score.anonymousId === anonymousId || score.userId === anonymousId;
};

// Load high scores
const loadHighScores = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    highScores.value = await getCombinedHighScores(15);
  } catch (err: any) {
    error.value = err.message || 'Failed to load high scores';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadHighScores();
});
</script>
