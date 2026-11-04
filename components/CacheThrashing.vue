<script setup lang="ts">
import { computed } from 'vue'
import './pipelineClicksHmr'

const props = defineProps<{ step: number }>()
const blocks = ['A', 'B', 'C', 'D', 'E']
const colors: Record<string, string> = { A: '#fecaca', B: '#bae6fd', C: '#fef08a', D: '#fed7aa', E: '#ddd6fe' }
const accesses = Array.from({ length: 20 }, (_, index) => blocks[index % blocks.length])
const frames: { slots: (string | null)[]; incoming: string | null; evicted: string | null; slot: number }[] = [
  { slots: [null, null, null, null], incoming: null, evicted: null, slot: -1 },
]
const recent: string[] = []
for (const incoming of accesses) {
  const slots = [...frames.at(-1)!.slots]
  let slot = slots.indexOf(null)
  const evicted = slot < 0 ? recent.shift()! : null
  if (evicted) slot = slots.indexOf(evicted)
  slots[slot] = incoming
  recent.push(incoming)
  frames.push({ slots, incoming, evicted, slot })
}
const activeStep = computed(() => Math.min(accesses.length, Math.max(0, props.step)))
const frame = computed(() => frames[activeStep.value])
const cached = computed(() => frame.value.slots.flatMap((block, slot) => block ? [{ block, slot }] : []))
const cacheY = (slot: number) => 55 + slot * 43
const memoryY = (block: string) => 42 + blocks.indexOf(block) * 40
const loadPath = computed(() => {
  const { incoming, slot } = frame.value
  if (!incoming) return ''
  return `M 608 ${memoryY(incoming) + 17} C 480 ${memoryY(incoming) + 17}, 455 ${cacheY(slot) + 17}, 322 ${cacheY(slot) + 17}`
})
const evictPath = computed(() => {
  if (!frame.value.evicted) return ''
  return `M 322 ${cacheY(frame.value.slot) + 28} Q 390 ${cacheY(frame.value.slot) + 28}, 415 239`
})
</script>

<template>
  <div class="cache-thrashing" :data-step="activeStep" aria-label="4 个缓存位置循环访问 5 个数据块的抖动动画">
    <div class="accesses" aria-label="访问序列">
      <span class="sequence-label">访问序列</span>
      <span v-for="(block, index) in accesses" :key="index" class="access"
        :class="{ current: index === activeStep - 1, past: index < activeStep - 1, separator: index > 0 && index % 5 === 0 }"
      >{{ block }}</span>
    </div>
    <svg viewBox="0 0 900 274" role="img" aria-label="左边是 4 个缓存位置，右边主存始终保存 A 到 E；彩色副本载入缓存，旧副本移出并消失">
      <defs>
        <marker id="thrashing-load-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
        </marker>
        <marker id="thrashing-evict-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#fb923c" />
        </marker>
      </defs>
      <text x="210" y="24" class="label" text-anchor="middle">Cache：4 个位置（LRU）</text>
      <text x="715" y="24" class="label" text-anchor="middle">主存：5 个数据块</text>
      <g v-for="slot in 4" :key="slot">
        <text x="78" :y="cacheY(slot - 1) + 23" class="slot-number" text-anchor="end">{{ slot - 1 }}</text>
        <rect x="100" :y="cacheY(slot - 1)" width="220" height="34" rx="3" fill="#1e293b" stroke="#64748b" />
        <text x="210" :y="cacheY(slot - 1) + 23" class="empty" text-anchor="middle">空</text>
      </g>
      <g v-for="block in blocks" :key="block" class="memory-block" :data-block="block">
        <rect x="610" :y="memoryY(block)" width="210" height="34" rx="3" :fill="colors[block]"
          :stroke="block === frame.incoming ? '#f59e0b' : '#475569'" :stroke-width="block === frame.incoming ? 3 : 1" />
        <text x="715" :y="memoryY(block) + 23" class="block-text" text-anchor="middle">{{ block }}</text>
      </g>
      <path v-if="frame.incoming" :d="loadPath" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#thrashing-load-arrow)" />
      <path v-if="frame.evicted" :d="evictPath" fill="none" stroke="#fb923c" stroke-width="2.5" stroke-dasharray="6 5" marker-end="url(#thrashing-evict-arrow)" />
      <text v-if="frame.incoming" x="455" y="66" class="load-label" text-anchor="middle">载入 {{ frame.incoming }}</text>
      <text v-if="frame.evicted" x="455" y="262" class="evict-label" text-anchor="middle">驱逐 {{ frame.evicted }}</text>
      <text x="715" y="263" class="memory-note" text-anchor="middle">主存保留原数据，缓存保存副本</text>
      <TransitionGroup name="cache-copy" tag="g">
        <g v-for="{ block, slot } in cached" :key="block" class="cache-copy" :data-block="block" :data-slot="slot"
          :style="{ transform: `translate(100px, ${cacheY(slot)}px)`, '--memory-y': `${memoryY(block)}px` }">
          <rect width="220" height="34" rx="3" :fill="colors[block]"
            :stroke="block === frame.incoming ? '#f59e0b' : '#475569'" :stroke-width="block === frame.incoming ? 3 : 1" />
          <text x="110" y="23" class="block-text" text-anchor="middle">{{ block }}</text>
        </g>
      </TransitionGroup>
    </svg>
    <div class="explanation" aria-live="polite">
      <template v-if="!frame.incoming">缓存为空；每次点击，访问下一个数据块。</template>
      <template v-else>
        <span class="miss">访问 {{ frame.incoming }}：不命中。</span>
        <template v-if="frame.evicted">驱逐最久未使用的 <strong>{{ frame.evicted }}</strong>，载入 <strong>{{ frame.incoming }}</strong>。</template>
        <template v-else>将 <strong>{{ frame.incoming }}</strong> 载入空闲位置（{{ activeStep }} / 4）。</template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.cache-thrashing { width: 100%; cursor: pointer; }
.accesses { display: flex; align-items: center; justify-content: center; margin: 4px 0 10px; gap: 5px; font: 17px Consolas, monospace; }
.sequence-label { font-family: inherit; margin-right: 12px; color: #cbd5e1; }
.access { color: #64748b; width: 23px; text-align: center; border: 2px solid transparent; border-radius: 3px; }
.access.past { color: #cbd5e1; }
.access.current { color: #fbbf24; border-color: #f59e0b; background: #f59e0b20; font-weight: bold; }
.access.separator { margin-left: 12px; }
svg { display: block; width: 100%; font-family: Consolas, '华文中宋', '宋体', monospace; overflow: visible; }
.label { fill: #e2e8f0; font-size: 20px; }
.slot-number, .empty { fill: #94a3b8; font-size: 16px; }
.block-text { fill: #0f172a; font-size: 21px; font-weight: bold; }
.load-label { fill: #38bdf8; font-size: 18px; }
.evict-label { fill: #fb923c; font-size: 18px; }
.memory-note { fill: #94a3b8; font-size: 13px; }
.cache-copy-enter-active, .cache-copy-leave-active { transition: transform 700ms ease, opacity 700ms ease; }
.cache-copy-enter-from { transform: translate(610px, var(--memory-y)) !important; opacity: 0.35; }
.cache-copy-leave-to { transform: translate(350px, 229px) scale(0.75) !important; opacity: 0; }
.explanation { border-top: 2px solid #f59e0b; padding-top: 8px; margin-top: 7px; font-size: 18px; line-height: 1.5; text-align: center; }
.miss { color: #fbbf24; margin-right: 8px; font-weight: bold; }
@media (prefers-reduced-motion: reduce) { .cache-copy-enter-active, .cache-copy-leave-active { transition: none; } }
</style>
