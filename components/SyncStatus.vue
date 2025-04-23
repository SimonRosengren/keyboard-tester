<template>
  <div class="flex items-center gap-2 text-sm text-kq-white/70">
    <span v-if="isSyncing" class="flex items-center">
      <span class="animate-spin h-4 w-4 border-2 border-kq-blue rounded-full border-t-transparent mr-2"></span>
      Syncing...
    </span>
    <span v-else-if="lastSyncTime" class="flex items-center">
      <span class="text-kq-blue">✓</span>
      Synced {{ formatTime(lastSyncTime) }}
    </span>
    <span v-else-if="unsyncedCount > 0" class="flex items-center">
      <button @click="syncNow" class="text-kq-yellow hover:underline">
        {{ unsyncedCount }} unsaved {{ unsyncedCount === 1 ? 'score' : 'scores' }} - Sync now
      </button>
    </span>
    <span v-else-if="syncError" class="text-kq-red">
      {{ syncError }}
    </span>
  </div>
</template>

<script setup lang="ts">
const { isSyncing, lastSyncTime, syncError, syncAllScores } = useSyncScores()
const { getUnsyncedScores } = useIndexedDB()
const unsyncedCount = ref(0)

// Format time as "X minutes ago" or "just now"
const formatTime = (date: Date) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins === 1) return '1 minute ago'
  if (diffMins < 60) return `${diffMins} minutes ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours === 1) return '1 hour ago'
  if (diffHours < 24) return `${diffHours} hours ago`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'yesterday'
  return `${diffDays} days ago`
}

// Check for unsynced scores
const checkUnsyncedScores = async () => {
  try {
    const scores = await getUnsyncedScores()
    unsyncedCount.value = scores.length
  } catch (error) {
    console.error('Error checking unsynced scores:', error)
  }
}

// Sync now button handler
const syncNow = async () => {
  await syncAllScores()
  await checkUnsyncedScores()
}

// Check for unsynced scores on mount and when sync status changes
onMounted(checkUnsyncedScores)
watch(isSyncing, async (newVal, oldVal) => {
  if (oldVal && !newVal) {
    // Sync just completed
    await checkUnsyncedScores()
  }
})

// Periodically check for unsynced scores
if (process.client) {
  const interval = setInterval(checkUnsyncedScores, 60000) // Check every minute
  onUnmounted(() => clearInterval(interval))
}
</script>
