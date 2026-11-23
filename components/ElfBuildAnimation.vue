<script setup lang="ts">
import { computed } from 'vue'
import './pipelineClicksHmr'
import { demoFiles, demoHeader, elfLevel, elfSteps } from './linkingAnimationData'

const props = defineProps<{ step: number }>()
const current = computed(() => Math.max(0, Math.min(elfSteps.length - 1, props.step)))
const activeFile = computed(() => current.value ? Math.floor((current.value - 1) / 2) : -1)
const note = computed(() => elfSteps[current.value])
</script>

<template>
  <div class="elf-build" :data-step="current" aria-label="逐个将三个 C 文件编译为 ELF 目标文件">
    <div class="shared-header"><code>demo.h</code>：<code>{{ demoHeader }}</code></div>
    <div class="file-columns">
      <div v-for="(file, index) in demoFiles" :key="file.id" class="file-column" :class="{ active: activeFile === index }" :data-file="file.id">
        <div class="source-file">
          <div class="file-title">{{ file.id }}.c</div>
          <pre><code><span v-for="(line, lineIndex) in file.source" :key="lineIndex" class="source-line"><span class="line-number">{{ lineIndex + 1 }}</span>{{ line }}</span></code></pre>
        </div>
        <div class="compile-arrow" :class="{ visible: elfLevel(index, current) > 0 }">↓ 编译、汇编</div>
        <div class="object-file" :class="{ generated: elfLevel(index, current) > 0 }" :data-level="elfLevel(index, current)">
          <div class="object-title">{{ file.id }}.o <span>{{ elfLevel(index, current) ? 'ELF' : '尚未生成' }}</span></div>
          <template v-if="elfLevel(index, current)">
            <div class="elf-directory">ELF 头 + 节目录</div>
            <TransitionGroup name="section-reveal" tag="div" class="section-list">
              <div v-for="section in file.sections.filter(s => s.kind === 'content' || elfLevel(index, current) === 2)"
                :key="section.name" class="elf-section" :class="{ fresh: activeFile === index && (current % 2 ? section.kind === 'content' : section.kind === 'metadata') }">
                <code class="section-name">{{ section.name }}</code>
                <div><div v-for="line in section.lines" :key="line">{{ line }}</div></div>
              </div>
            </TransitionGroup>
          </template>
        </div>
      </div>
    </div>
    <div class="step-explanation" aria-live="polite">
      <div class="step-title">{{ current }} / 6 · {{ note[0] }}</div>
      <div class="step-detail">{{ note[1] }}</div>
    </div>
    <div class="diagram-note">只画本例相关内容；分步展开用于讲解，文件布局与指令内容均为示意。</div>
  </div>
</template>

<style scoped>
.elf-build { width: 100%; cursor: pointer; }
.shared-header { font-size: 12px; color: #cbd5e1; margin: 0 0 8px; line-height: 1.4; }
.shared-header code { font-family: Consolas, monospace; }
.file-columns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.source-file { border: 1.5px solid #475569; background: #1b1b1b; border-radius: 5px; height: 116px; overflow: hidden; }
.file-title, .object-title { font: 600 14px/1.3 Consolas, monospace; padding: 5px 8px; }
.file-title { color: #e2e8f0; }
.source-file pre { margin: 0; padding: 1px 8px 6px; font: 12px/16px Consolas, '华文中宋', monospace; background: transparent; }
.source-line { display: block; white-space: pre; color: #e2e8f0; }
.line-number { display: inline-block; width: 16px; margin-right: 7px; color: #64748b; text-align: right; }
.compile-arrow { height: 18px; text-align: center; color: transparent; font-size: 12px; line-height: 18px; }
.compile-arrow.visible { color: #94a3b8; }
.active .source-file, .active .object-file { border-color: #f59e0b; }
.active .file-title, .active .compile-arrow { color: #fbbf24; }
.object-file { height: 165px; border: 1.5px dashed #334155; border-radius: 5px; background: #121820; overflow: hidden; }
.object-file.generated { border-style: solid; }
.object-title { display: flex; justify-content: space-between; color: #cbd5e1; border-bottom: 1px solid #334155; }
.object-title span { font-size: 11px; font-weight: 400; color: #94a3b8; }
.elf-directory { color: #94a3b8; font-size: 10px; line-height: 16px; padding: 0 7px; }
.section-list { padding: 0 5px 4px; }
.elf-section { display: grid; grid-template-columns: 70px minmax(0, 1fr); gap: 4px; padding: 3px 2px; border-top: 1px solid #334155; font-size: 10.8px; line-height: 14px; color: #cbd5e1; }
.section-name { font: 11px/14px Consolas, monospace; color: #7dd3fc; padding: 0; background: none; }
.elf-section.fresh { background: #f59e0b1c; box-shadow: inset 2px 0 #f59e0b; }
.step-explanation { border-top: 2px solid #f59e0b; margin-top: 10px; padding-top: 7px; min-height: 61px; }
.step-title { color: #fbbf24; font-size: 17px; font-weight: 600; line-height: 1.35; }
.step-detail { color: #e2e8f0; font-size: 14px; line-height: 1.45; margin-top: 4px; }
.diagram-note { color: #94a3b8; font-size: 10px; line-height: 1.3; margin-top: 2px; }
.section-reveal-enter-active, .section-reveal-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.section-reveal-enter-from, .section-reveal-leave-to { opacity: 0; transform: translateY(5px); }
@media (prefers-reduced-motion: reduce) { .section-reveal-enter-active, .section-reveal-leave-active { transition: none; } }
</style>
