export type DemoFileId = 'main' | 'add' | 'data'
export type LinkMode = 'objects' | 'archive' | 'archive-first' | 'object-scan'

export interface DemoSection {
  name: string
  kind: 'content' | 'metadata'
  lines: string[]
}

export const demoHeader = 'extern int x, y;  int add(int a, int b);'
export const demoFiles: {
  id: DemoFileId
  source: string[]
  definitions: string[]
  local: string[]
  references: string[]
  sections: DemoSection[]
}[] = [
  {
    id: 'main',
    source: ['#include "demo.h"', 'int main(void) {', '    y = 3;', '    return add(x, y);', '}'],
    definitions: ['main'], local: [], references: ['x', 'y', 'add'],
    sections: [
      { name: '.text', kind: 'content', lines: ['main 的机器指令', '写 y；读 x/y；调用 add'] },
      { name: '.symtab', kind: 'metadata', lines: ['定义 main', '外部引用 x、y、add'] },
      { name: '.strtab', kind: 'metadata', lines: ['main、x、y、add 的名字'] },
      { name: '.rela.text', kind: 'metadata', lines: ['上述指令中待修补的位置'] },
    ],
  },
  {
    id: 'add',
    source: ['#include "demo.h"', 'static int bias = 0;', 'int add(int a, int b) {', '    return a + b + bias;', '}'],
    definitions: ['add'], local: ['bias'], references: [],
    sections: [
      { name: '.text', kind: 'content', lines: ['add 的机器指令'] },
      { name: '.bss', kind: 'content', lines: ['bias：4 字节，零初始化'] },
      { name: '.symtab', kind: 'metadata', lines: ['全局定义 add；局部 bias'] },
      { name: '.strtab', kind: 'metadata', lines: ['add、bias 的名字'] },
      { name: '.rela.text', kind: 'metadata', lines: ['读取 bias 的引用待修补'] },
    ],
  },
  {
    id: 'data',
    source: ['#include "demo.h"', 'int x = 2;', 'int y = 0;'],
    definitions: ['x', 'y'], local: [], references: [],
    sections: [
      { name: '.data', kind: 'content', lines: ['x 的初值 2'] },
      { name: '.bss', kind: 'content', lines: ['y：4 字节，零初始化'] },
      { name: '.symtab', kind: 'metadata', lines: ['全局定义 x、y'] },
      { name: '.strtab', kind: 'metadata', lines: ['x、y 的名字'] },
    ],
  },
]

export const elfSteps = [
  ['先看源代码', '沿用 main.c、add.c、data.c；三个文件通过 demo.h 中的声明互相使用。'],
  ['main.c → main.o：机器指令', 'main.o 已有写 y、读 x/y、调用 add 的指令；最终引用位置仍待链接器修补。'],
  ['main.o：留下链接说明', '符号表记下“定义 main、需要 x/y/add”；名字和待修补位置也一并留在 ELF 中。'],
  ['add.c → add.o：代码与静态数据', 'add 的机器指令进入 .text；本文件私有的 bias 所需零初始化空间记入 .bss。'],
  ['add.o：定义与引用分清楚', 'add 可以给其他文件用；bias 是本文件的局部符号，它的地址引用仍需要修补。'],
  ['data.c → data.o：数据', 'x 的初值 2 存入 .data；y 所需的零初始化空间记入 .bss。'],
  ['data.o：提供 x、y 的定义', '三个 .o 各有自己的 ELF 内容；接下来链接器才能把 main 所需的 x、y、add 对应起来。'],
]

export function elfLevel(fileIndex: number, step: number) {
  return Math.max(0, Math.min(2, step - fileIndex * 2))
}

export interface LinkFrame {
  step: number
  title: string
  detail: string
  E: string[]
  U: string[]
  D: string[]
  added: { E: string[]; U: string[]; D: string[] }
  removedU: string[]
  active: DemoFileId | 'library' | 'all' | null
  referencesRead: boolean
  libraryRead: boolean
  layout: boolean
  linked: boolean
  error: boolean
  symbol?: string
  readSymbols?: Record<DemoFileId, string[]>
}

export const objectScanEntries: Record<DemoFileId, { name: string; meaning: string }[]> = {
  main: [
    { name: 'main', meaning: '全局定义 · .text' },
    { name: 'x', meaning: '外部引用 · UNDEF' },
    { name: 'y', meaning: '外部引用 · UNDEF' },
    { name: 'add', meaning: '外部引用 · UNDEF' },
  ],
  add: [
    { name: 'add', meaning: '全局定义 · .text' },
    { name: 'bias', meaning: '局部定义 · .bss' },
  ],
  data: [
    { name: 'x', meaning: '全局定义 · .data' },
    { name: 'y', meaning: '全局定义 · .bss' },
  ],
}

export function makeObjectScanFrames(): LinkFrame[] {
  const E = new Set<string>()
  const U = new Set<string>()
  const D = new Set<string>()
  const readSymbols: Record<DemoFileId, string[]> = { main: [], add: [], data: [] }
  const frames: LinkFrame[] = []
  const define = (name: string) => { D.add(name); U.delete(name) }
  const push = (title: string, detail: string, active: DemoFileId | null, symbol?: string, action?: () => void) => {
    const before = { E: [...E], U: [...U], D: [...D] }
    action?.()
    if (active && symbol) readSymbols[active].push(symbol)
    frames.push({
      step: frames.length, title, detail, active, symbol,
      E: [...E], U: [...U], D: [...D],
      added: {
        E: [...E].filter(x => !before.E.includes(x)),
        U: [...U].filter(x => !before.U.includes(x)),
        D: [...D].filter(x => !before.D.includes(x)),
      },
      removedU: before.U.filter(x => !U.has(x)),
      readSymbols: { main: [...readSymbols.main], add: [...readSymbols.add], data: [...readSymbols.data] },
      referencesRead: readSymbols.main.includes('x'),
      libraryRead: false, layout: false, linked: false, error: false,
    })
  }

  push('尚未读取：三个集合都为空', '三个 .o 已经生成。链接器按命令中的 main.o、add.o、data.o 顺序读取。', null)
  push('读 main.o：发现 main 的定义', 'main.o 加入 E；它在 .text 中定义的 main 加入 D。', 'main', 'main', () => {
    E.add('main.o'); define('main')
  })
  for (const name of demoFiles[0].references) {
    push(`读 main.o：需要 ${name}`, `main.o 引用 ${name}，但 D 中还没有它的定义，因此把 ${name} 加入 U。`, 'main', name, () => {
      if (!D.has(name)) U.add(name)
    })
  }
  push('开始读 add.o：选入目标文件', '先把 add.o 加入 E；此时还没读取它的符号定义，U、D 保持不变。', 'add', undefined, () => {
    E.add('add.o')
  })
  push('读 add.o：找到 add 的定义', 'add 加入 D，并从 U 中移除。main 对 add 的引用已经找到定义。', 'add', 'add', () => {
    define('add')
  })
  push('读 add.o：bias 是本文件的局部符号', 'bias 只供 add.o 自己使用，不参与跨文件匹配，U、D 都不变。', 'add', 'bias')
  push('开始读 data.o：选入目标文件', 'data.o 是命令中直接提供的目标文件，加入 E；接下来读取它的 x、y 定义。', 'data', undefined, () => {
    E.add('data.o')
  })
  for (const name of demoFiles[2].definitions) {
    push(`读 data.o：找到 ${name} 的定义`, `${name} 加入 D，并从 U 中移除。${name === 'y' ? '现在 main 所需的 x、y、add 都找到了。' : 'U 中还剩 y，继续读取。'}`, 'data', name, () => {
      define(name)
    })
  }
  push('扫描完成：U 为空，符号解析完成', 'E 中有三个目标文件；main 所需的定义都已配上。之后才安排地址、修补引用，生成 demo。', null)
  return frames
}

export function makeLinkFrames(mode: LinkMode): LinkFrame[] {
  if (mode === 'object-scan') return makeObjectScanFrames()
  const E = new Set<string>()
  const U = new Set<string>()
  const D = new Set<string>()
  const frames: LinkFrame[] = []
  let referencesRead = false
  let libraryRead = false
  let layout = false
  let linked = false
  let error = false
  const define = (name: string) => { D.add(name); U.delete(name) }
  const require = (name: string) => { if (!D.has(name)) U.add(name) }
  const push = (title: string, detail: string, active: LinkFrame['active'], action?: () => void) => {
    const before = { E: [...E], U: [...U], D: [...D] }
    action?.()
    frames.push({
      step: frames.length, title, detail, E: [...E], U: [...U], D: [...D],
      added: {
        E: [...E].filter(x => !before.E.includes(x)),
        U: [...U].filter(x => !before.U.includes(x)),
        D: [...D].filter(x => !before.D.includes(x)),
      },
      removedU: before.U.filter(x => !U.has(x)), active,
      referencesRead, libraryRead, layout, linked, error,
    })
  }

  push('尚未读取输入', mode === 'objects'
    ? 'gcc 先将三个 .c 分别编译成临时 .o；下面只跟踪链接阶段，起初 E、U、D 都为空。'
    : '先准备好 main.o，以及包含 add.o、data.o 的 libadd.a；下面按命令中的顺序读取。', null)

  if (mode === 'archive-first') {
    push('先读 libadd.a：没有需求，不取成员', '此时 U 为空，库里的 add.o、data.o 都不取出；E 和 D 也不变。', 'library', () => { libraryRead = true })
    push('再读 main.o：加入调用者', 'main.o 作为显式输入加入 E；它定义的 main 加入 D。', 'main', () => { E.add('main.o'); define('main') })
    push('发现需求：x、y、add 加入 U', 'main.o 引用的三个外部符号都还没有定义；它们留在 U 中。', 'main', () => {
      referencesRead = true
      demoFiles[0].references.forEach(require)
    })
    push('扫描结束：U 非空，链接失败', '链接器不会自动返回重扫前面的库；x、y、add 仍未解决，不能生成 demo。', 'library', () => { error = true })
    return frames
  }

  push('读 main.o：先记录它提供什么', '把 main.o 加入 E；把它提供的全局定义 main 加入 D。', 'main', () => { E.add('main.o'); define('main') })
  push('读 main.o：再记录它需要什么', 'x、y、add 都还没找到定义，加入 U。此时地址尚未修补，函数也没有执行。', 'main', () => {
    referencesRead = true
    demoFiles[0].references.forEach(require)
  })
  push(mode === 'archive' ? '读库：取出能提供 add 的 add.o' : '读 add.o：找到 add 的定义',
    'add.o 加入 E；add 加入 D，并从 U 移除。局部的 bias 只供 add.o 自己使用，不加入跨文件匹配的 D。', 'add', () => {
      if (mode === 'archive') libraryRead = true
      E.add('add.o'); define('add')
    })
  push(mode === 'archive' ? '读库：取出 data.o，先处理 x' : '读 data.o：先找到 x',
    'data.o 加入 E；x 的定义加入 D，并从 U 移除。y 的条目下一步再展示。', 'data', () => { E.add('data.o'); define('x') })
  push('继续读 data.o：找到 y', '把 y 加入 D，从 U 移除。现在 U 为空：main 所需的三个外部符号都找到了。', 'data', () => { define('y') })
  push('符号解析完成：开始安排位置', '合并相关代码和数据，确定 main、add、x、y、bias 的位置。找到全部定义，还不等于已经执行了加法。', 'all', () => { layout = true })
  push('重定位完成：生成 demo', '按 .rela.text 修补调用与读写位置；运行时才执行 y = 3，并以 2、3 调用 add，最终返回 5。', 'all', () => { linked = true })
  return frames
}

export const linkCommands: Record<LinkMode, string> = {
  'object-scan': 'gcc main.o add.o data.o -o demo',
  objects: 'gcc main.c add.c data.c -o demo',
  archive: 'gcc main.o ./libadd.a -o demo',
  'archive-first': 'gcc ./libadd.a main.o -o demo',
}

export const linkFrames: Record<LinkMode, LinkFrame[]> = {
  'object-scan': makeObjectScanFrames(),
  objects: makeLinkFrames('objects'),
  archive: makeLinkFrames('archive'),
  'archive-first': makeLinkFrames('archive-first'),
}
