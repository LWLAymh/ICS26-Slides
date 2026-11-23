<script setup lang="ts">
import { computed } from 'vue'
import './pipelineClicksHmr'
import { demoFiles, demoHeader, linkCommands, linkFrames, objectScanEntries } from './linkingAnimationData'
import type { DemoFileId, LinkMode } from './linkingAnimationData'

const props = withDefaults(defineProps<{ step: number; mode?: LinkMode }>(), { mode: 'objects' })
const frames = computed(() => linkFrames[props.mode])
const current = computed(() => Math.max(0, Math.min(frames.value.length - 1, props.step)))
const frame = computed(() => frames.value[current.value])
const isArchive = computed(() => props.mode === 'archive' || props.mode === 'archive-first')
const setRows = [
  { id: 'E' as const, meaning: '已选入的目标文件' },
  { id: 'U' as const, meaning: '仍缺定义的外部符号' },
  { id: 'D' as const, meaning: '已找到的全局定义' },
]
const read = (id: DemoFileId) => frame.value.E.includes(id + '.o')
const visibleDefinitions = (index: number) => demoFiles[index].definitions.filter(name => frame.value.D.includes(name))
</script>

<template>
  <div class="linker-sets" :class="{ 'object-scan': mode === 'object-scan' }" :data-step="current" :data-mode="mode" :data-symbol="frame.symbol" :data-linked="frame.linked" :data-error="frame.error">
    <div class="link-command"><code><template v-for="(token, index) in linkCommands[mode].split(' ')" :key="index"><span class="command-token" :class="{ selected: token === frame.active + '.o' }">{{ token }}</span>{{ ' ' }}</template></code><span class="step-count">{{ current }} / {{ frames.length - 1 }}</span></div>
    <div v-if="isArchive" class="archive-caption" :class="{ selected: frame.active === 'library' }">
      libadd.a = { add.o, data.o } <span v-if="mode === 'archive-first' && frame.libraryRead">· 已扫描，后面不会自动回头</span>
    </div>
    <div v-else-if="mode === 'object-scan'" class="archive-caption source-header"><code>demo.h</code>：<code>{{ demoHeader }}</code></div>
    <div v-else class="archive-caption">gcc 先生成三个临时 .o，下面跟踪链接器读取它们的过程</div>
    <div v-if="mode === 'object-scan'" class="source-files">
      <div v-for="file in demoFiles" :key="file.id" class="scan-source" :class="{ selected: frame.active === file.id }" :data-source="file.id">
        <div class="source-title">{{ file.id }}.c</div>
        <pre><code><span v-for="(line, i) in file.source" :key="i" class="source-line">{{ line }}</span></code></pre>
      </div>
    </div>
    <div class="input-files">
      <div v-for="(file, index) in demoFiles" :key="file.id" class="input-file"
        :class="{ selected: frame.active === file.id, read: read(file.id), member: isArchive && index > 0 }" :data-file="file.id">
        <div class="input-title">{{ file.id }}.o <span>{{ read(file.id) ? '已加入 E' : (isArchive && index > 0) ? '库内，未取出' : '未读取' }}</span></div>
        <div v-if="mode === 'object-scan'" class="scan-symbols">
          <template v-for="entry in objectScanEntries[file.id]" :key="entry.name">
            <div v-if="frame.readSymbols?.[file.id].includes(entry.name)" class="scan-symbol" :class="{ current: frame.active === file.id && frame.symbol === entry.name }" :data-symbol="entry.name">
              <code>{{ entry.name }}</code><span>{{ entry.meaning }}</span>
            </div>
          </template>
        </div>
        <div v-else class="symbol-detail">
          <template v-if="read(file.id)">
            <div>定义：<code>{{ visibleDefinitions(index).join('、') || '继续读取中' }}</code></div>
            <div v-if="file.id === 'main' && frame.referencesRead">外部：<code>x、y、add</code></div>
            <div v-if="file.local.length">局部：<code>{{ file.local.join('、') }}</code>（不放入 D）</div>
          </template>
        </div>
      </div>
    </div>
    <div class="set-area">
      <div v-for="row in setRows" :key="row.id" class="set-row" :class="row.id" :data-set="row.id" :data-values="JSON.stringify(frame[row.id])">
        <div class="set-letter">{{ row.id }}</div>
        <div class="set-meaning">{{ row.meaning }}</div>
        <div class="set-values">
          <span class="brace">{</span>
          <TransitionGroup name="set-item" tag="div" class="token-list">
            <code v-for="value in frame[row.id]" :key="value" class="set-token" :class="{ added: frame.added[row.id].includes(value) }">{{ value }}</code>
          </TransitionGroup>
          <span v-if="!frame[row.id].length" class="empty">空</span>
          <span class="brace">}</span>
          <span v-if="row.id === 'U' && frame.removedU.length" class="removed">移除 <s>{{ frame.removedU.join('、') }}</s></span>
        </div>
      </div>
    </div>
    <div v-if="mode !== 'object-scan'" class="layout-slot">
      <div v-if="frame.layout" class="linked-layout" :class="{ complete: frame.linked }">
        <strong>{{ frame.linked ? 'demo：引用已接好' : 'demo 布局：等待修补' }}</strong>
        <code>.text：main + add</code><code>.data：x = 2</code><code>.bss：y、bias</code>
      </div>
      <div v-if="frame.error" class="link-error">U 中还有 x、y、add → 链接失败，不能生成 demo</div>
    </div>
    <div class="step-explanation" :class="{ error: frame.error }" aria-live="polite">
      <div class="step-title">第 {{ current }} 步：{{ frame.title }}</div>
      <div class="step-detail">{{ frame.detail }}</div>
    </div>
    <div class="diagram-note">只跟踪本例符号；按讲解顺序分步显示，不展开启动文件和其他系统符号。</div>
  </div>
</template>

<style scoped>
.linker-sets { width: 100%; cursor: pointer; }
.link-command { display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; border-left: 3px solid #f59e0b; background: #1b1b1b; font: 15px/1.3 Consolas, monospace; color: #e2e8f0; }
.link-command code { background: none; padding: 0; }
.link-command .step-count { color: #fbbf24; font-size: 12px; }
.command-token.selected { color: #fbbf24; background: #f59e0b26; outline: 1px solid #f59e0b; border-radius: 2px; }
.archive-caption { height: 24px; line-height: 24px; font-size: 12px; color: #94a3b8; }
.archive-caption.selected { color: #fbbf24; }
.input-files { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.input-file { height: 78px; border: 1.5px solid #334155; border-radius: 4px; background: #131a23; overflow: hidden; }
.input-file.member { border-style: dashed; }
.input-file.read { border-style: solid; }
.input-file.selected { border-color: #f59e0b; background: #f59e0b12; }
.input-title { display: flex; justify-content: space-between; font: 600 14px/1.3 Consolas, monospace; padding: 6px 8px 4px; color: #e2e8f0; }
.input-title span { color: #94a3b8; font-size: 10px; font-weight: 400; }
.symbol-detail { padding: 0 8px; font-size: 12px; line-height: 17px; color: #cbd5e1; }
.symbol-detail code { font-family: Consolas, monospace; background: none; padding: 0; }
.source-header code { background: none; padding: 0; font-family: Consolas, monospace; }
.source-files { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 6px; }
.scan-source { height: 110px; border: 1.5px solid #475569; border-radius: 4px; background: #1b1b1b; overflow: hidden; }
.scan-source.selected { border-color: #f59e0b; }
.source-title { padding: 4px 7px; color: #e2e8f0; font: 600 13px/16px Consolas, monospace; }
.scan-source pre { margin: 0; padding: 0 7px 5px; background: none; font: 12px/15px Consolas, monospace; }
.source-line { display: block; white-space: pre; color: #e2e8f0; }
.object-scan .input-file { height: 84px; }
.object-scan .input-title { padding: 4px 8px 2px; }
.scan-symbols { padding: 0 6px; }
.scan-symbol { display: flex; align-items: center; gap: 12px; padding: 0 3px; color: #cbd5e1; font-size: 11px; line-height: 14px; }
.scan-symbol code { width: 36px; background: none; padding: 0; font: 12px/14px Consolas, monospace; }
.scan-symbol.current { background: #f59e0b26; box-shadow: inset 2px 0 #f59e0b; color: #fbbf24; }
.object-scan .set-area { margin-top: 6px; }
.object-scan .set-row { min-height: 30px; }
.object-scan .set-values { min-height: 29px; }
.object-scan .step-explanation { margin-top: 8px; min-height: 50px; }
.object-scan .diagram-note { display: none; }
.set-area { margin-top: 10px; }
.set-row { display: grid; grid-template-columns: 30px 163px minmax(0, 1fr); align-items: center; min-height: 42px; border-bottom: 1px solid #334155; }
.set-letter { font: 700 23px Consolas, monospace; }
.set-meaning { font-size: 13px; color: #cbd5e1; }
.set-row.E .set-letter { color: #7dd3fc; }
.set-row.U .set-letter { color: #fca5a5; }
.set-row.D .set-letter { color: #86efac; }
.set-values { display: flex; align-items: center; gap: 6px; position: relative; min-height: 33px; }
.brace { font: 20px Consolas, monospace; color: #94a3b8; }
.token-list { display: flex; align-items: center; gap: 7px; position: relative; }
.set-token { display: inline-block; padding: 3px 9px; border: 1px solid #475569; border-radius: 3px; background: #1e293b; color: #e2e8f0; font: 15px/1.2 Consolas, monospace; }
.U .set-token { background: #7f1d1d40; color: #fecaca; }
.D .set-token { background: #14532d40; color: #bbf7d0; }
.set-token.added { border-color: #f59e0b; box-shadow: 0 0 0 1px #f59e0b50; }
.empty { color: #64748b; font-size: 12px; }
.removed { color: #fbbf24; font-size: 12px; margin-left: 10px; }
.layout-slot { height: 43px; display: flex; align-items: center; }
.linked-layout { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 11px; color: #cbd5e1; }
.linked-layout strong { color: #fbbf24; font-size: 13px; }
.linked-layout.complete strong { color: #86efac; }
.linked-layout code { font-family: Consolas, monospace; background: #1b1b1b; padding: 3px 5px; }
.link-error { color: #fca5a5; font-size: 15px; }
.step-explanation { border-top: 2px solid #f59e0b; padding-top: 7px; min-height: 68px; }
.step-title { color: #fbbf24; font-size: 17px; font-weight: 600; line-height: 1.35; }
.step-detail { margin-top: 4px; color: #e2e8f0; font-size: 14px; line-height: 1.45; }
.step-explanation.error { border-color: #ef4444; }
.step-explanation.error .step-title { color: #fca5a5; }
.diagram-note { margin-top: 2px; font-size: 10px; line-height: 1.3; color: #94a3b8; }
.set-item-enter-active, .set-item-leave-active, .set-item-move { transition: opacity 220ms ease, transform 220ms ease; }
.set-item-enter-from { opacity: 0; transform: translateY(-7px); }
.set-item-leave-to { opacity: 0; transform: translateY(7px); }
.set-item-leave-active { position: absolute; }
@media (prefers-reduced-motion: reduce) { .set-item-enter-active, .set-item-leave-active, .set-item-move { transition: none; } }
</style>
