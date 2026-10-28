<script setup lang="ts">
import PipelineTimeline from './PipelineTimeline.vue'

defineProps<{ cycle: number }>()
</script>

<template>
  <PipelineTimeline scenario="raw" :cycle="cycle" />
</template>
