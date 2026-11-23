<script setup lang="ts">
import { demoFiles, demoHeader } from './linkingAnimationData'
</script>

<template>
  <div class="demo-sources">
    <div class="demo-header"><code>demo.h</code>：<code>{{ demoHeader }}</code></div>
    <div class="demo-files">
      <div v-for="file in demoFiles" :key="file.id" class="demo-file">
        <div class="file-name">{{ file.id }}.c</div>
        <pre><code><span v-for="(line, i) in file.source" :key="i" class="source-line"><span class="line-number">{{ i + 1 }}</span>{{ line }}</span></code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-header { font-size: 14px; line-height: 1.4; margin-bottom: 10px; }
.demo-header code { font-family: Consolas, monospace; }
.demo-files { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.demo-file { border: 1.5px solid #475569; border-radius: 5px; background: #1b1b1b; min-height: 132px; }
.file-name { padding: 7px 8px; font: 600 16px/1.3 Consolas, monospace; color: #e2e8f0; }
.demo-file pre { padding: 0 8px 8px; margin: 0; background: transparent; font: 12px/18px Consolas, monospace; }
.source-line { display: block; white-space: pre; color: #e2e8f0; }
.line-number { display: inline-block; width: 12px; margin-right: 8px; text-align: right; color: #64748b; }
</style>
