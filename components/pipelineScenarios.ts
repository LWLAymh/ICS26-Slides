export interface PipelineCell { cycle: number; stage: string; bubble?: boolean; stalled?: boolean }
export interface PipelineRow { label: string; cells: PipelineCell[]; canceledAt?: number }
export interface PipelineScenario {
  title: string
  end: number
  rows: PipelineRow[]
  notes: string[][]
  danger?: { cycle: number; cells: [number, string][] }
  forwards?: { cycle: number; from: number; to: number }[]
}

function row(label: string, start: number, stages = ['F', 'D', 'E', 'M', 'W'], bubble = false): PipelineRow {
  return { label, cells: stages.map((stage, index) => ({ cycle: start + index, stage, bubble })) }
}
function heldRow(label: string, start: number, held: 'F' | 'D'): PipelineRow {
  const stages = held === 'D' ? ['F', 'D', 'D', 'E', 'M', 'W'] : ['F', 'F', 'D', 'E', 'M', 'W']
  const result = row(label, start, stages)
  result.cells[held === 'D' ? 2 : 1].stalled = true
  return result
}
const simple = ['0x000: irmovq $10,%rdx', '0x00a: irmovq $3,%rax']
const loads = [
  '0x000: irmovq $128,%rdx', '0x00a: irmovq $3,%rcx',
  '0x014: rmmovq %rcx,0(%rdx)', '0x01e: irmovq $10,%rbx', '0x028: mrmovq 0(%rdx),%rax',
]
const loadSetup = [
  ['取指', '取出 irmovq $128,%rdx，准备设置内存访问的基址。'],
  ['准备写入的数据', '第一条指令译码；取出 irmovq $3,%rcx。'],
  ['指令继续推进', '第一条 irmovq 继续向后传递立即数 128，等待写回；rmmovq 进入 F。'],
  ['转发到存储指令', 'rmmovq 在 D 得到基址 128 和待写数据 3；取出 irmovq $10,%rbx。'],
  ['计算存储地址', 'rmmovq 在 E 算出地址 128；%rdx 在本周期末写成 128。'],
  ['先写内存，再准备加载', 'rmmovq 在 M 将 M[128] 写成 3；mrmovq 在 D 读取基址；addq 进入 F。'],
]

export const pipelineScenarios: Record<string, PipelineScenario> = {
  raw: {
    title: '未处理的数据冒险', end: 6,
    rows: [...simple, '0x014: nop', '0x015: nop', '0x016: addq %rdx,%rax', '0x018: halt'].map((label, index) => row(label, index + 1)),
    notes: [
      ['取指', '取出 irmovq $10,%rdx。它只进入了 F，还没有修改 %rdx。'],
      ['译码与下一次取指', '第一条 irmovq 进入 D；取出 irmovq $3,%rax，%rax 仍为旧值 0。'],
      ['指令继续推进', '第一条 irmovq 继续向后传递立即数 10，尚未写回；第二条进入 D。'],
      ['等待写回', '第二条 irmovq 继续向后传递立即数 3；此时 %rax 仍未更新，nop 继续流动。'],
      ['先写回 %rdx', '第一条 irmovq 在周期末把 %rdx 写成 10；addq 进入 F，%rax 仍为 0。'],
      ['数据冒险：演示在这里停止', 'irmovq 在 W，要到周期末才把 %rax 写成 3。', '同周期的 addq 已在 D 读取 %rax，得到旧值 0；valA = 10，valB = 0。'],
    ],
    danger: { cycle: 6, cells: [[1, 'W'], [4, 'D']] },
  },
  stall: {
    title: '暂停解决数据冒险', end: 11,
    rows: [
      ...[...simple, '0x014: nop', '0x015: nop'].map((label, index) => row(label, index + 1)),
      row('bubble', 7, ['E', 'M', 'W'], true),
      heldRow('0x016: addq %rdx,%rax', 5, 'D'), heldRow('0x018: halt', 6, 'F'),
    ],
    notes: [
      ['取指', '取出 irmovq $10,%rdx。'],
      ['译码', '第一条指令进入 D；取出 irmovq $3,%rax。'],
      ['指令继续推进', '第一条 irmovq 继续向后传递立即数 10，尚未写回。'],
      ['等待写回', '第二条 irmovq 继续向后传递立即数 3；两条 nop 为后面的 addq 留出间隔。'],
      ['第一个写回', '%rdx 在周期末写成 10；addq 进入 F。'],
      ['检测依赖，决定暂停', 'addq 在 D 仍读不到新的 %rax；保持 F、D，并准备向 E 插入气泡。', '较早的 irmovq 继续通过 W，在周期末把 %rax 写成 3。'],
      ['保持 D，气泡进入 E', 'addq 仍在 D，此时可读到 %rdx = 10、%rax = 3；halt 保持在 F。'],
      ['恢复推进', 'addq 进入 E，正确计算 10 + 3 = 13；halt 进入 D。'],
      ['结果通过 M', 'addq 不访问内存，将计算结果 13 继续传向 W。'],
      ['写回正确结果', 'addq 在周期末把 %rax 写成 13。'],
      ['完成', 'halt 到达 W。只额外暂停了一个周期。'],
    ],
  },
  forwarding: {
    title: '相邻指令的转发', end: 8,
    rows: [...simple, '0x014: addq %rdx,%rax', '0x016: halt'].map((label, index) => row(label, index + 1)),
    notes: [
      ['取指', '取出 irmovq $10,%rdx。'],
      ['准备第二个立即数', '第一条指令在 D；第二条 irmovq 进入 F。'],
      ['指令继续推进', '第一条 irmovq 继续向后传递立即数 10，等待写回；addq 进入 F。'],
      ['两路转发到 D', 'M_valE = 10 转发给 d_valA；本周期的 e_valE = 3 转发给 d_valB。', 'addq 不必等待寄存器写回，周期末即可把两个正确操作数存入 E。'],
      ['使用转发结果', 'addq 在 E 计算 10 + 3 = 13；第一条 irmovq 在 W 写回 %rdx。'],
      ['结果继续传递', '第二条 irmovq 写回 %rax = 3；addq 的结果 13 位于 M。'],
      ['写回 addq', 'addq 将 %rax 更新为 13。'],
      ['完成', 'halt 到达 W；这次依赖没有引入暂停。'],
    ],
    forwards: [{ cycle: 4, from: 0, to: 2 }, { cycle: 4, from: 1, to: 2 }],
  },
  forwardingGap: {
    title: '间隔一条 nop 的转发', end: 9,
    rows: [...simple, '0x014: nop', '0x015: addq %rdx,%rax', '0x017: halt'].map((label, index) => row(label, index + 1)),
    notes: [
      ['取指', '取出 irmovq $10,%rdx。'],
      ['译码', '第一条指令在 D；第二条 irmovq 进入 F。'],
      ['指令继续推进', '第一条 irmovq 继续向后传递立即数 10；nop 进入 F。'],
      ['等待写回', '第二条 irmovq 继续向后传递立即数 3；addq 进入 F。'],
      ['从 W、M 转发', 'addq 在 D：由 W_valE 得到 10，由 M_valE 得到 3。', '虽然两条生产者处于不同阶段，仍能在周期末提供正确操作数。'],
      ['执行 addq', 'addq 在 E 计算 13。'],
      ['通过 M', '计算结果 13 继续传向 W。'],
      ['写回', 'addq 将 %rax 写成 13。'],
      ['完成', 'halt 到达 W，全程不需要暂停。'],
    ],
    forwards: [{ cycle: 5, from: 0, to: 3 }, { cycle: 5, from: 1, to: 3 }],
  },
  loadUse: {
    title: '未处理的加载 / 使用冒险', end: 7,
    rows: [...loads, '0x032: addq %rbx,%rax', '0x034: halt'].map((label, index) => row(label, index + 1)),
    notes: [...loadSetup,
      ['D 阶段读不到正确值：演示停止', 'addq 在 D 需要读取 %rax，却只能读到旧值 0；另一路可转发得到 %rbx = 10。', 'mrmovq 还在 E，只算出了地址 128，加载值尚未读出。应立即暂停 D，不能让 addq 带着旧值进入 E。'],
    ],
    danger: { cycle: 7, cells: [[4, 'E'], [5, 'D']] },
  },
  loadStall: {
    title: '加载 / 使用：暂停 + 转发', end: 12,
    rows: [
      ...loads.map((label, index) => row(label, index + 1)), row('bubble', 8, ['E', 'M', 'W'], true),
      heldRow('0x032: addq %rbx,%rax', 6, 'D'), heldRow('0x034: halt', 7, 'F'),
    ],
    notes: [...loadSetup,
      ['暂停 F、D，向 E 注入气泡', 'mrmovq 在 E、addq 在 D，检测到加载 / 使用依赖。', '保持取指和译码，避免 addq 带着旧值进入下一周期的 E。'],
      ['加载完成，转发到保留的 D', 'mrmovq 在 M 读出 3，转发 m_valM 给仍处于 D 的 addq。', '另一路从 W_valE 得到 %rbx = 10；本周期 E 执行的是气泡。'],
      ['恢复执行', 'addq 在 E 使用 10 和 3，正确算出 13；halt 进入 D。'],
      ['结果经过 M', 'addq 将结果 13 继续传向 W；气泡也正常向后流动。'],
      ['写回', 'addq 将 %rax 更新为 13。'],
      ['完成', 'halt 到达 W。一次暂停加转发解决了加载 / 使用冒险。'],
    ],
    forwards: [{ cycle: 8, from: 3, to: 6 }, { cycle: 8, from: 4, to: 6 }],
  },
  ret: {
    title: 'RET：等待返回地址', end: 11,
    rows: [
      row('0x000: irmovq Stack,%rsp', 1), row('0x00a: call proc', 2), row('0x020: ret', 3),
      ...[4, 5, 6].map(start => row('bubble', start, ['停', 'D', 'E', 'M', 'W'], true)),
      row('0x013: irmovq $10,%rdx', 7),
    ],
    notes: [
      ['设置栈指针', '取出 irmovq Stack,%rsp。'],
      ['取出 call', 'call 将跳转到 proc，并把返回点 0x013 压栈。'],
      ['取出 ret', '按 call 的目标取到 ret；返回地址仍需要从栈中读取。'],
      ['ret 在 D：第一次暂停', 'ret 读取栈指针；F 保持，向 D 的下一周期注入气泡。'],
      ['ret 在 E：第二次暂停', 'ret 计算弹栈后的 %rsp；call 在 M 把返回地址 0x013 写入栈。'],
      ['ret 在 M：第三次暂停', '从栈中读出 m_valM = 0x013；教材 PIPE 等待它进入 W，F 仍保持。'],
      ['恢复正确取指', '返回地址已在 W_valM，F 从 0x013 取指；ret 同时完成写回。'],
      ['返回点指令译码', 'irmovq $10,%rdx 进入 D；三个气泡继续向后流动。'],
      ['返回点指令继续推进', 'irmovq 继续向后传递立即数 10，等待写回。'],
      ['继续推进', '返回点指令通过 M。'],
      ['写回', '返回点指令将 %rdx 写成 10。RET 共造成三个周期的取指停顿。'],
    ],
  },
  branch: {
    title: 'JXX：预测失败后清空错误路径', end: 10,
    rows: [
      row('0x000: xorq %rax,%rax', 1), row('0x002: jne target', 2),
      { ...row('0x016: irmovq $2,%rdx', 3, ['F', 'D']), canceledAt: 5 },
      row('bubble', 5, ['E', 'M', 'W'], true),
      { ...row('0x020: irmovq $3,%rbx', 4, ['F']), canceledAt: 5 },
      row('bubble', 5, ['D', 'E', 'M', 'W'], true),
      row('0x00b: irmovq $1,%rax', 5), row('0x015: halt', 6),
    ],
    notes: [
      ['取指', '取出 xorq %rax,%rax。'],
      ['预测跳转', '取出 jne target，预测选择 target 作为下一条 PC。'],
      ['沿预测路径取指', 'xorq 在 E 产生 0，设置 ZF = 1；F 已取到 target 处的指令。'],
      ['发现预测错误', 'jne 在 E 判断条件不满足；此时错误路径的两条指令分别位于 D、F。', '置 D_bubble、E_bubble，在周期末丢弃这两条错误指令。'],
      ['纠正 PC 并插入两个气泡', 'jne 在 M，通过 M_valA 提供顺序地址 0x00b；F 从正确路径重新取指。', 'D、E 中是气泡，错误路径的指令不会修改寄存器。'],
      ['恢复正常推进', '正确路径的 irmovq 进入 D，halt 进入 F。'],
      ['正确路径继续推进', 'irmovq 继续向后传递立即数 1，等待写回；两个气泡继续向后流动。'],
      ['通过 M', '正确结果 1 继续传向 W。'],
      ['写回', '正确路径将 %rax 写成 1；错误路径的 $2、$3 均未写回。'],
      ['完成', 'halt 到达 W。分支预测失败损失了两个取指机会。'],
    ],
  },
}
