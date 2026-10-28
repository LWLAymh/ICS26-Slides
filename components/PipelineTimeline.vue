<script setup lang="ts">
import { computed } from 'vue'
import './pipelineClicksHmr'
import { pipelineScenarios } from './pipelineScenarios'
import type { PipelineCell } from './pipelineScenarios'

const props = withDefaults(defineProps<{ scenario: string; cycle: number; compact?: boolean; focus?: string }>(), { compact: false, focus: '' })
const config = computed(() => pipelineScenarios[props.scenario])
const activeCycle = computed(() => Math.min(config.value.end, Math.max(1, props.cycle)))
const note = computed(() => config.value.notes[activeCycle.value - 1])
const gridX = 306
const gridY = 44
const columnWidth = 46
const rowHeight = 36
const width = computed(() => gridX + config.value.end * columnWidth + 14)
const height = computed(() => gridY + config.value.rows.length * rowHeight + 16)
const forwards = computed(() => config.value.forwards?.filter(arrow => arrow.cycle === activeCycle.value) ?? [])
const splitAtStall = computed(() => config.value.rows.some(row => row.cells.some(cell => cell.stalled)))
// A stall opens a new lane at that cycle; earlier stages keep their original lane.
function visualRow(row: number, cycle: number) {
  if (!splitAtStall.value) return row
  return row - config.value.rows.slice(0, row).filter(previous =>
    previous.label === 'bubble' && previous.cells[0].cycle > cycle,
  ).length
}
const stallTurns = computed(() => config.value.rows.flatMap((row, rowIndex) =>
  row.cells.flatMap((cell, index) => {
    const previous = row.cells[index - 1]
    if (!previous || cell.cycle > activeCycle.value || visualRow(rowIndex, previous.cycle) === visualRow(rowIndex, cell.cycle)) return []
    return [{ row: rowIndex, previous, cell }]
  }),
))
function isDanger(row: number, cell: PipelineCell) {
  const danger = config.value.danger
  return danger?.cycle === activeCycle.value && cell.cycle === activeCycle.value
    && danger.cells.some(([index, stage]) => row === index && cell.stage === stage)
}
function cellX(cycle: number) { return gridX + (cycle - 1) * columnWidth }
function cellY(row: number, cycle = activeCycle.value) { return gridY + visualRow(row, cycle) * rowHeight }
function turnPath(row: number, previous: PipelineCell, cell: PipelineCell) {
  const x = cellX(cell.cycle)
  const y = cellY(row, previous.cycle) + rowHeight / 2
  return `M ${x - 7} ${y} H ${x} V ${cellY(row, cell.cycle) + rowHeight / 2} h 7`
}
function arrowPath(from: number, to: number, index: number) {
  const x = cellX(activeCycle.value) + columnWidth - 6 - index * 7
  return `M ${x} ${cellY(from) + 8} V ${cellY(to) + rowHeight - 7} l -4 -7 m 4 7 l 4 -7`
}
</script>

<template>
  <div class="pipeline-timeline" :class="{ compact }" :data-scenario="scenario" :data-cycle="activeCycle" :data-end="config.end"
    :aria-label="`${config.title}，第 ${activeCycle} 周期`">
    <svg :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="config.title">
      <title>单击前进一个周期，未来的流水线阶段暂不显示</title>
      <rect :width="width" :height="height" fill="white" rx="5" />
      <g class="cycle-highlight" :style="{ transform: `translateX(${cellX(activeCycle)}px)` }">
        <rect x="0" y="7" :width="columnWidth" :height="height - 13" fill="#f59e0b" fill-opacity="0.16" stroke="#f59e0b" stroke-width="2.5" rx="4" />
      </g>
      <text x="12" y="28" class="heading">指令 / 周期</text>
      <text v-for="cycle in config.end" :key="cycle" :x="cellX(cycle) + columnWidth / 2" y="29"
        text-anchor="middle" class="cycle-number" :class="{ selected: cycle === activeCycle, future: cycle > activeCycle }"
      >{{ cycle }}</text>
      <g v-for="(row, rowIndex) in config.rows" :key="rowIndex">
        <text v-if="row.label !== 'bubble' || row.cells[0].cycle <= activeCycle" x="10" :y="cellY(rowIndex) + 24" class="instruction"
          :class="{ canceled: row.canceledAt && activeCycle >= row.canceledAt, bubble: row.label === 'bubble' }"
        >{{ row.label }}</text>
        <template v-for="cell in row.cells" :key="cell.cycle">
          <g v-if="cell.cycle <= activeCycle && cell.cycle <= config.end" class="pipeline-cell"
            :data-cell-cycle="cell.cycle" :data-stage="cell.stage" :data-row="rowIndex" :class="{ danger: isDanger(rowIndex, cell) }">
            <rect :x="cellX(cell.cycle)" :y="cellY(rowIndex, cell.cycle)" :width="columnWidth" :height="rowHeight"
              :fill="cell.cycle === activeCycle ? '#fde68a' : cell.bubble ? '#f1f5f9' : '#e0f2fe'"
              :stroke="isDanger(rowIndex, cell) ? '#dc2626' : '#64748b'"
              :stroke-width="isDanger(rowIndex, cell) || (cell.cycle === activeCycle && focus === cell.stage) ? 3 : 1.3" />
            <text :x="cellX(cell.cycle) + columnWidth / 2" :y="cellY(rowIndex, cell.cycle) + 25" text-anchor="middle"
              class="stage" :class="{ conflict: isDanger(rowIndex, cell), bubble: cell.bubble, stalled: cell.stalled }"
            >{{ cell.stage }}</text>
            <path v-if="cell.stalled && cell.cycle === activeCycle"
              :d="`M ${cellX(cell.cycle) + 7} ${cellY(rowIndex, cell.cycle) + 31} h ${columnWidth - 14}`" stroke="#c2410c" stroke-width="2.5" />
          </g>
        </template>
      </g>
      <path v-for="turn in stallTurns" :key="`${turn.row}-${turn.cell.cycle}`" class="stall-turn"
        :d="turnPath(turn.row, turn.previous, turn.cell)" fill="none" stroke="#c2410c" stroke-width="2.3" />
      <path v-for="(arrow, index) in forwards" :key="index" class="forward-arrow"
        :d="arrowPath(arrow.from, arrow.to, index)" fill="none" stroke="#0f766e" stroke-width="2.8" />
    </svg>
    <div class="cycle-notes" :class="{ conflict: config.danger?.cycle === activeCycle }" aria-live="polite">
      <div class="note-title">第 {{ activeCycle }} 周期：{{ note[0] }}</div>
      <div v-for="line in note.slice(1)" :key="line" class="note-line">{{ line }}</div>
    </div>
  </div>
</template>

<style scoped>
.pipeline-timeline { width: 100%; cursor: pointer; }
svg { display: block; width: 100%; height: auto; font-family: Consolas, '华文中宋', '宋体', monospace; }
svg text { fill: #0f172a; }
.cycle-highlight { transition: transform 200ms ease; }
.heading, .cycle-number { font-size: 20px; }
.cycle-number.selected { fill: #b45309; font-weight: 700; }
.cycle-number.future { fill: #94a3b8; }
.instruction { font-size: 17px; }
.instruction.canceled { fill: #b91c1c; text-decoration: line-through; }
.instruction.bubble, .stage.bubble { fill: #64748b; font-style: italic; }
.stage { font-size: 22px; }
.stage.stalled { fill: #c2410c; font-weight: 700; }
.stage.conflict { fill: #b91c1c; font-weight: 700; }
.cycle-notes { border-top: 2px solid #f59e0b; padding-top: 9px; margin-top: 12px; min-height: 115px; }
.cycle-notes .note-title { color: #fbbf24; font-size: 17px; line-height: 1.45; font-weight: 600; margin-bottom: 7px; }
.cycle-notes .note-line { color: inherit; font-size: 15px; line-height: 1.6; margin-top: 4px; }
.cycle-notes.conflict .note-title { color: #f87171; }
.compact .cycle-notes { min-height: 74px; margin-top: 7px; padding-top: 6px; }
.compact .note-title { font-size: 14px; margin-bottom: 3px; }
.compact .note-line { font-size: 12px; line-height: 1.45; margin-top: 2px; }
@media (prefers-reduced-motion: reduce) { .cycle-highlight { transition: none; } }
</style>
