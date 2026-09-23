---
# You can also start simply with 'default'
theme: academic
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
# background: bg.jpg
# some information about your slides (markdown enabled)
title: "03-Arch"
highlighter: shiki
info: |
  ICS 2026 Fall Slides
# apply unocss classes to the current slide
presenter: true
class: text-center
# https://sli.dev/features/drawing
titleTemplate: '%s'
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
transition: fade-out
# enable MDC Syntax: https://sli.dev/features/mdc
mdc: true
fonts:
  sans: '"", "华文中宋", "宋体"'
  serif: '"Consolas", "华文中宋", "宋体"'
  mono: '"Consolas", "华文中宋", "宋体"'

lineNumbers: true

layout: cover
coverBackgroundUrl: /03-Arch/cover.jpg
---
# Arch: ISA & Pipeline

Taoyu Yang, EECS, PKU

<style>
  div{
   @apply text-gray-2;
  }
</style>

---

layout: center
class: text-center
---

# 研讨题分享

<!--
强调一下 attacklab 和 archlab

archlab 让学 PIPE 的时候写 part B，专注去尝试搞懂几种 hazard 对应的 bubble 和 stall。以及用 git 做好版本控制。
-->

---

# 什么是 ISA？

Instruction Set Architecture

直译：指令集体系结构

- 一个处理器支持的指令和指令的字节级编码
- 不同的处理器“家族”都有不同的 ISA
- 本章我们将研究一个硬件系统怎么执行某种 ISA（Y86-64）

Y86-64：一种精简的 ISA（基于 x86-64）

<div v-click>

- 定义一个 ISA 需要定义：
  - 状态单元
  - 指令集及编码
  - 编程规范
  - 异常处理

</div>


---

# 程序员可见状态

programmer visible state


| 缩写 | 全称 | 描述 | 包括 |
|------|-------|------|------|
| RF   | Register File | 程序寄存器 | `%rax` ~ `%r14` |
| CC   | Condition Code | 条件码 | ZF<span follow>zero</span>, OF<span follow>overflow</span>, SF<span follow>sign</span> |
| Stat | Status | 程序状态 | - |
| PC   | Program Counter | 程序计数器 | - |
| DMEM | Data Memory | 内存 | - |

<style>
span[follow] {
  @apply text-[0.6rem];
}
</style>

<!--
指的是指令可以读取/修改的处理器状态。包含RF, CC, Stat, PC, DMEM
-->


---
layout: image-right
image: /03-Arch/Y86-Instruction.png
---

# Y86-64 ISA

一个 X86-64 的子集

```md {all|1|2|3|4|5|6|7|8|9|10|11|12|13|all}
* halt # 停机
* nop # 空操作，可以用于对齐字节
* cmovXX rA, rB # 如果条件码满足，则将寄存器 A 的值移动到寄存器 B
* rrmovq rA, rB # 将寄存器 A 的值移动到寄存器 B
* irmovq V, rB # 将立即数 V 移动到寄存器 B
* rmmovq rA, D(rB) # 将寄存器 A 的值移动到内存地址 rB + D
* mrmovq D(rB), rA # 将内存地址 rB + D 的值移动到寄存器 A
* OPq rA, rB # 将寄存器 A 和寄存器 B 的值进行运算，结果存入寄存器 B
* jXX Dest # 如果条件码满足，跳转到 Dest
* call Dest # 跳转到 Dest，同时将下一条指令的地址压入栈
* ret # 从栈中弹出地址，跳转到该地址
* pushq rA # 将寄存器A的值压入栈
* popq rA # 从栈中弹出值，存入寄存器A
```

<div text-sm>

* 第一个字节为 **代码** ，其高 4 位为操作类型，低 4 位为操作类型（fn）的具体操作（或 0）
* F：0xF，为 Y86-64 中“不存在的寄存器”
* 所有数值（立即数、内存地址）均以 hex 表示，为 8 字节

</div>

<!--
指令集

这一页讲指令的格式，icode:ifun，寄存器，0xF。
-->

---
layout: image-right
image: /03-Arch/Y86-Instruction.png
---

# Y86-64 ISA

一个 X86-64 的子集

```md {all|1|2|3|4|5|6|7|8|9|10|11|12|13|all}
* halt # 停机
* nop # 空操作，可以用于对齐字节
* cmovXX rA, rB # 如果条件码满足，则将寄存器 A 的值移动到寄存器 B
* rrmovq rA, rB # 将寄存器 A 的值移动到寄存器 B
* irmovq V, rB # 将立即数 V 移动到寄存器 B
* rmmovq rA, D(rB) # 将寄存器 A 的值移动到内存地址 rB + D
* mrmovq D(rB), rA # 将内存地址 rB + D 的值移动到寄存器 A
* OPq rA, rB # 将寄存器 A 和寄存器 B 的值进行运算，结果存入寄存器 B
* jXX Dest # 如果条件码满足，跳转到 Dest
* call Dest # 跳转到 Dest，同时将下一条指令的地址压入栈
* ret # 从栈中弹出地址，跳转到该地址
* pushq rA # 将寄存器A的值压入栈
* popq rA # 从栈中弹出值，存入寄存器A
```


<div class="text-[0.8rem]" grid="~ cols-2 gap-4">

<div>
  
* i(immediate)：立即数
* r(register)：寄存器
* m(memory)：内存地址{.text-sky-4}
  
</div>
<div>
  
* d(displacement)：偏移量
* dest(destination)：目标地址
* v(value)：数值
  
</div>
</div>

<!--
这一页会挨个过一遍所有指令

V：立即数，irmovq

D：偏移量，D(rB)

Dest：目标地址，jxx和call

注意这些东西都是 64 位的
-->

---
layout: image-right
image: /03-Arch/register.png
---

# 寄存器

Register

```markdown{all|1-4|5-6|7-8|9-15|16|all|8,7,3,2|all|4,6,13-16}
* 0x0 %rax 
* 0x1 %rcx
* 0x2 %rdx
* 0x3 %rbx
* 0x4 %rsp
* 0x5 %rbp
* 0x6 %rsi
* 0x7 %rdi
* 0x8 %r8
* 0x9 %r9
* 0xA %r10
* 0xB %r11
* 0xC %r12
* 0xD %r13
* 0xE %r14
* 0xF F / No Register
```

- 一共只有 15 个寄存器，`0xF` 表示空。
- 用 4 个二进制位来标识

<!--
这一页介绍所有的寄存器
-->

---

# 汇编代码翻译

translate assembly code to machine code

以下习题节选自书 P248，练习题 4.1 / 4.2

<div v-click-hide>

### Quiz

|     |     |
| --- | --- |
| 0x200 | a0 6f 80 0c 02 00 00 00 00 00 00 00 30 f3 0a 00 00 00 00 00 00 00 90 |
| loop | rmmovq %rcx, -3(%rbx) |

对于第一条翻译为汇编代码，第二条翻译为机器码

<br/>

</div>

<div v-after>

### Step 1
|     |     |
| --- | --- |
| 0x200 | <kbd>a0</kbd> <kbd>6f</kbd> \| <kbd>80</kbd> <kbd>0c 02 00 00 00 00 00 00</kbd> \| <kbd>00</kbd> \| <kbd>30</kbd> <kbd>f</kbd><kbd>3</kbd> <kbd>0a 00 00 00 00 00 00 00</kbd> \| <kbd>90</kbd>|
| loop | rmmovq, rcx, rbx, -3 |


</div>

<br>

<div v-click>

### Step 2

<div  grid="~ cols-2 gap-4">
<div>

```bash
0x200:
  pushq %rbp
  call 0x20c
  halt
0x20c:
  irmovq $10, %rbx
  ret
```

</div>
<div>

<kbd>40</kbd> <kbd>1</kbd><kbd>3</kbd> <kbd>fd ff ff ff ff ff ff ff</kbd>

</div>
</div>
</div>

<style>
.slidev-vclick-hidden {
  @apply hidden;
}
</style>

<!--
地址、立即数都是小端法

0x200:
  pushq %rbp
  call 0x20c
  halt
0x20c:
  irmovq $10, %rbx
  ret

<kbd>40</kbd> <kbd>1</kbd><kbd>3</kbd> <kbd>fd ff ff ff ff ff ff ff</kbd>
-->

---

# Y86-64 vs x86-64, CISC vs RISC

Complex Instruction Set Computer & Reduced Instruction Set Computer


<div grid="~ cols-2 gap-4">
  <div>

* Y86-64 是 X86-64 的子集
* X86-64 更复杂，但是更强大
* Y86-64 更简单，复杂指令由简单指令组合而成
  
如 Y86-64 的算数指令（`OPq`）只能操作寄存器，而 X86-64 可以操作内存

> 所以 Y86-64 需要额外的指令（`mrmovq`、`rmmovq`）来先加载内存中的值到寄存器，再进行运算

  </div>
<div>


</div>
</div>



---

# Y86-64 状态

status

状态码 Stat 描述了程序执行的总体状态。

| 值 | 名字 | 含义 | 全称 |
|----|------|------|------|
| 1  | `AOK`  | 正常操作 | All OK |
| 2  | `HLT`  | 遇到 `halt` 指令 | Halt |
| 3  | `ADR`  | 遇到非法地址，如向非法地址读/写 | Address Error |
| 4  | `INS`  | 遇到非法指令，如遇到一个 `ff` | Invalid Instruction |

除非状态值是 `AOK`，否则程序会停止执行。

---

# Y86-64 栈

stack

`Pushq rA F / 0xA0 rA F`

压栈指令
- 将 `%rsp` 减去8
- 将字从 `rA` 存储到 `%rsp` 的内存中

<br>

***

`Popq rA F / 0xB0 rA F`

弹栈指令
- 将字从 `%rsp` 的内存中取出
- 将 `%rsp` 加上8
- 将字存储到 `rA` 中

<!--
强调栈是从高往低增长的


Fn是0，第二个寄存器是F


`pushq %rsp` 会压入旧的 `%rsp`，然后将 `%rsp` 减 8；`popq %rsp` 最终会把 `%rsp` 设置为弹出的值。
-->


---

# Y86-64 过程调用

`call` & `ret`

`Call Dest / 0x80 Dest`

调用指令
- 将下一条指令的地址 `pushq` 到栈上（`%rsp` 减 8、地址存入栈中）
- 从目标处开始执行指令

<br/>

***

`Ret / 0x90`

返回指令
- 从栈上 `popq` 出地址，用作下一条指令的地址（`%rsp` 加 8、地址从栈中取出，存入 `%rip`）


---

# Y86-64 终止与对齐

`Halt / 0x00`

终止指令
- 停止执行
- 停止模拟器
- 在 x86-64 中，用户不允许使用这个指令

<br/>

`Nop / 0x10`

空操作
- 什么都不做（但是 PC <span text-sm> Program Counter </span> + 1），可以用于对齐字节

---

# Y86-64 汇编

Y86-64 Assembly

与 x86-64 的区别与联系：

- 在算数指令中不能使用立即数操作数
  - 需要先 `irmovq` 一下
- 在算数指令中不能使用内存操作数
  - 需要先 `rmmovq` 一下
  - （至于为什么，学 SEQ 的时候就知道了）
- 所有的 `movq` 指令都有前缀指定其功能
  - 注意没有 `mmmovq`
- 操作数都是 64 位
- 其余与 x86-64 很像。
- Y86-64 模拟器推荐：https://boginw.github.io/js-y86-64/

<!--
可以演示一下
-->

---

# 硬件的组成

hardware control language

* 计算机底层是 0（低电压） 和 1（高电压）的世界
* HCL（硬件 **控制** 语言）是一种硬件 **描述** 语言（HDL），用于描述硬件的逻辑电路
* HCL 是 HDL 的子集

<br>

- **组合逻辑电路：输出与输入（几乎）同步，没有存储功能（无状态）**
  - 逻辑门：基本的运算单元
  - 组合电路：（位级/字级/ALU）
- **存储器：按位存储（有状态）**
  - 时钟寄存器
  - 随机访问存储器（RAM）
    - 虚拟内存
    - 寄存器文件（这个是什么后面会具体辨析）

<!--
在这门课里我们只关心控制，不关心硬件单元的具体实现。

写出合法的 HCL 就意味着可以设计出对应的电路

三种基本逻辑门如上。
-->

---

# 逻辑门

logical gate 

- 高低电压对应 1/0
- 输入与输出几乎同步（会有微小延迟）
- 单个逻辑门**没有存储功能**

<div grid="~ cols-3 gap-4"  mt-2>

<div>

#### 与门 And

![And](/03-Arch/and.png){.h-30}

```c
out = a&&b
```

</div>

<div>

#### 或门 Or

![Or](/03-Arch/or.png){.h-30}

```c
out = a||b
```

</div>

<div>

#### 非门 Not

![Not](/03-Arch/not.png){.h-30}

```c
out = !a
```

</div>

</div>

记忆：方形的更严格→与；圆形的更宽松→或

<!--
C语言中这几种逻辑门长这样

事实上最基本的逻辑门并不是他们

大家如果玩过 Turing Complete 会发现 NAND 和 NOT 可以组合成剩下所有逻辑门
-->


---

# HCL 代码

hardware description/control language

HCL 语法包括两种表达式类型：**布尔表达式**（单个位的信息）和**整数表达式**（多个位的信息），分别用 `bool-expr` 和 `int-expr` 表示。

<div grid="~ cols-2 gap-12">
<div>

#### 布尔表达式

逻辑操作

`a && b`，`a || b`，`!a`（与、或、非）

字符比较

`A == B`，`A != B`，`A < B`，`A <= B`，`A >= B`，`A > B`

集合成员资格

`A in { B, C, D }`

等同于 `A == B || A == C || A == D`

</div>

<div>

#### 字符表达式

case 表达式

```hcl
[
  bool-expr1 : int-expr1
  bool-expr2 : int-expr2
  ...
  bool-exprk : int-exprk
]
```

- `bool-expr_i` 决定是否选择该 case。
- `int-expr_i` 为该 case 的值。

<div text-sky-5>

依次评估测试表达式，返回第一个成功测试的字符表达式 `A`，`B`，`C`

</div>

</div>
</div>



---

# 组合电路 / 高级逻辑设计

中杯：bit level / bool

<div grid="~ cols-2 gap-12"  mt-2>

<div>

```c
bool eq = (a && b) || (!a && !b);
```

![bit_eq](/03-Arch/bit_eq.png){.h-50.mx-auto}

- 组合电路是 `响应式` 的：在输入改变时，输出经过一个很短的时间会立即改变
- **没有短路求值特性**：`a && b` 不会在 `a` 为 `false` 时就不计算 `b`

</div>

<div>

```c
bool out = (s && a) || (!s && b);
```

![bit_mux](/03-Arch/bit_mux.png){.h-50.mx-auto}

- Mux：Multiplexer / 多路复用器，用一个 `s` 信号来选择 `a` 或 `b`

</div>

</div>

<!--
位级别的 eq 和 mux
-->

---

# 组合电路 / 高级逻辑设计

大杯：word level / word

<div grid="~ cols-2 gap-12">
<div>




```c
bool Eq = (A == B)

```

![word_eq](/03-Arch/word_eq.png){.h-60}

</div>

<div>

```c
word Out = [
  s : A; # select: expr
  1 : B;
];

```

![word_mux](/03-Arch/word_mux.png){.h-60}

</div>
</div>

<!--
字级别的，无非就是几个拼起来了而已。

在 HCL 中，字大小的一般用大写字母

不区分字长，这页的图中是 64 位

可以再试试MUX4：

word Out4 = [
 !s1 && !s0 : A; # 00
 !s1             : B; # 01
 !s0             : C; # 10
  1               : D; # 00
]

可以简化
-->

---

# 组合电路 / 算数逻辑单元 ALU
Arithmetic Logic Unit

![ALU](/03-Arch/alu.png)

<div grid="~ cols-2 gap-4"  mt-2>

<div>

- **组合逻辑**
- 持续响应输入
- 控制信号选择计算的功能
</div>
<div>

- 对应于 Y86-64 中的 4 个算术 / 逻辑操作
- 计算条件码的值
- 注意 `sub` 是被减的数在后面，即输入 B 减去输入 A
</div>
</div> 

大家可以想想这几个 ALU 可以怎么用逻辑门实现，其实并不难~（当然这门课不要求掌握）

---

# 存储器和时钟

可能开始不好理解了

组合电路：不存储任何信息，只是一个 `输入` 到 `输出` 的映射（**有一定的延迟**）

时序电路：有 **状态** ，并基于此进行计算

状态的改变受**周期性的时钟信号控制**

- 时钟信号的产生：晶体谐振器（石英晶体的压电效应）
- 时钟信号为整个计算机系统提供了时序信息

---

# 时钟寄存器 / 寄存器 / 硬件寄存器

register

存储单个位或者字

- 以时钟信号控制寄存器加载输入值
- 直接将它的输入和输出线连接到电路的其他部分


<div grid="~ cols-2 gap-12" mt-8>
<div>

![clock-1](/03-Arch/clock-1.png){.h-45.mx-auto}

</div>

<div>

![clock-2](/03-Arch/clock-2.png){.h-45.mx-auto}

</div>
</div>

在 Clock 信号的上升沿，寄存器将输入的值采样并加载到输出端，其他时间输出端保持不变

---

# 时钟寄存器 / 寄存器 / 硬件寄存器

register

PC，CC 和 Stat 都使用时钟寄存器存储

- 相当于每接收到一次时钟信号这些状态就会被更新
- 时钟周期/频率决定了计算机系统的“运转节奏”

---

# 随机访问存储器 / 内存

memory

<div grid="~ cols-2 gap-12">
<div>

以 **地址** 选择读写

包括：

- 虚拟内存系统，寻址范围很大
- 寄存器文件 / 程序寄存器，个数有限，在 Y86-64 中为 15 个程序寄存器（`%rax` ~ `%r14`）

可以在一个周期内读取和 / 或写入多个字词

**一定要注意“寄存器”这个词在不同语境下的语义差别！**

前一页的东西可以叫做“硬件寄存器”。

</div>

<div>

![register-file](/03-Arch/register-file.png){.h-50.mx-auto}

两个读端口，一个写端口。srcA 输入查询地址，valA 返回存储在相应程序寄存器的值。

写入通过**时钟**控制，时钟上升时，valW 上的值会被写入 dstW 对应的程序寄存器（0xF 则什么都不做）。

</div>
</div>

<!--
register file 也可以叫做寄存器堆

这一页慢一点，重点讲一下这个东西和时钟寄存器的区别。

读数据时可以把寄存器堆当作组合逻辑

但是写的时候，受时钟控制

虚拟内存系统同理
-->

---

# Y86-64 的顺序实现

sequential implementation

我们已经有了实现 Y86-64 处理器所需要的部件。接下来我们首先考虑实现一个 SEQ：每个时钟周期上 SEQ 完整执行一条指令。

当然这样的话，一个时钟周期就会很长，但是实现 SEQ 是将来实现流水线化的 PIPE 的基础。

对于 SEQ 的实现、线是怎么连接的，信号是怎么产生、在什么时候产生的，都**需要完全理解、背诵**

处理一条指令通常包含以下几个阶段：

1. 取指（Fetch）
2. 译码（Decode）
3. 执行（Execute）
4. 访存（Memory）
5. 写回（Write Back）
6. 更新PC（PC Update）

---

# Y86-64 的顺序实现

sequential implementation

<div grid="~ cols-2 gap-12">
<div>

### 1. 取指（Fetch）

**操作**：取指阶段从内存中读取指令字节，地址由程序计数器 (PC) 的值决定。



<div text-sm>

读出的指令由如下几个部分组成：

- `icode`：指令代码，指示指令类型，是指令字节的高 4 位
- `ifun`：指令功能，指示指令的子操作类型，是指令字节的低 4 位（不指定时为 0）
- `rA`：第一个源操作数寄存器（可选）
- `rB`：第二个源操作数寄存器（可选）
- `valC`：常数，Constant（可选）

</div>

<div text-sm text-gray-5 mt-4>

各个不同名称的指令一般具有不同的 `icode`，但是也有可能共享相同的 `icode`，然后通过 `ifun` 区分。

</div>
</div>

<div>

![fetch](/03-Arch/fetch.png)

</div>
</div>

<!--
根据 icode 决定读多少字节后面的内容，以及读不读 rA, rB 和 valC
-->


---

# Y86-64 的顺序实现

sequential implementation

<div grid="~ cols-2 gap-12">
<div>

### 1. 取指（Fetch）

**操作**：取指阶段从内存中读取指令字节，地址由程序计数器 (PC) 的值决定。

<div text-sm>

- `ifun` 在除指令为 `OPq`，`jXX` 或 `cmovXX` 其中之一时都为 0
- `rA`，`rB` 为寄存器的编码，取值为 0 到 F，每个编码对应着一个寄存器。注意当编码为 F 时代表无寄存器。
- `rA`，`rB` 并不是每条指令都有的，`jXX`，`call` 和 `ret` 就没有 `rA` 和 `rB`，这在 HCL 中通过 `need_regids` 来控制
- `valC` 为 8 字节常数，可能代表立即数（`irmovq`），偏移量（`rmmovq` `mrmovq`）或地址（`call` `jmp`）。`valC` 也不是每条指令都有的，这在 HCL 中通过 `need_valC` 来控制


</div>
</div>

<div>

![fetch](/03-Arch/fetch.png)

</div>
</div>

---

# Y86-64 的顺序实现

sequential implementation

### 2. 译码（Decode）

**操作**：译码阶段从寄存器文件读取操作数，得到 `valA` 和 / 或 `valB`。

一般根据上一阶段得到的 `rA` 和 `rB` 来确定需要读取的寄存器。

也有部分指令会读取 `rsp` 寄存器（`popq` `pushq` `ret` `call`）。


---

# Y86-64 的顺序实现

sequential implementation

### 3. 执行（Execute）

**操作**：执行阶段，算术/逻辑单元（ALU）进行运算，包括如下情况：

- 执行指令指明的操作（`opq`）
- 计算内存引用的地址（`rmmovq` `mrmovq`）
- 增加/减少栈指针（`pushq` `popq`）<span text-sm text-gray-5>其中加数可以是 +8 或 -8</span>

最终，我们把此阶段得到的值称为 `valE`（Execute stage value）。

一般来讲，这里使用的运算为加法运算，除非是在 `OPq` 指令中通过 `ifun` 指定为其他运算。这个阶段还会：

<div grid="~ cols-2 gap-12">
<div>

设置条件码（`OPq`）：

```hcl
set CC
```

</div>

<div>

检查条件码和和传送条件（`jXX` `cmovXX`）：

```hcl
Cnd <- Cond(CC, ifun)
```

</div>
</div>

---

# Y86-64 的顺序实现

sequential implementation

### 4. 访存（Memory）

**操作**：访存阶段可以将数据写入内存（`rmmovq` `pushq` `call`），或从内存读取数据（`mrmovq` `popq` `ret`）

- 若是向内存写，则：
  - 写入的地址为 `valE`（需要计算得到，`rmmovq` `pushq` `call`）
  - 数据为 `valA`（`rmmovq` `pushq`） 或 `valP`（`call`）
- 若是从内存读，则：
  - 地址为 `valA`（`popq` `ret`，此时 `valB` 用于计算更新后的 `%rsp`） 或者 `valE`（需要计算得到，`mrmovq`）
  - 读出的值为 `valM`（Memory stage value）

---

# Y86-64 的顺序实现

sequential implementation

### 5. 写回（Write Back）

**操作**：写回阶段最多可以写 **两个**{.text-sky-5} 结果到寄存器文件（即更新寄存器）。

---

# Y86-64 的顺序实现

sequential implementation

### 6. 更新PC（PC Update）

**操作**：将 PC 更新成下一条指令的地址 `new_pc`。

- 对于 `call` 指令，`new_pc` 是 `valC`
- 对于 `jxx` 指令，`new_pc` 是 `valC` 或 `valP`，取决于条件码
- 对于 `ret` 指令，`new_pc` 是 `valM`
- 其他情况，`new_pc` 是 `valP`


---

# Y86-64 的顺序实现

sequential implementation

<div text-sm>

下面是 `op`, `cmovXX`, `rrmovq` 和 `irmovq` 在 SEQ 实现中各个阶段的计算。

这里的表中没有写出 `cmovXX`，因为其与 `rrmovq` 共用同一个 `icode`，然后通过 `ifun` 区分。注意 `OPq` 的顺序，是 `valB OP valA`。

</div>

![seq_inst_stages_1](/03-Arch/seq_inst_stages_1.png){.h-75.mx-auto}

<!--
可以发现是很统一地用 valE 写回。因为都是要用 ALU 计算出来的值。

注意 OP 操作是要更新 CC 的

注意 $M_1$ 和 $M_8$ 的区别
-->

---

# Y86-64 的顺序实现

sequential implementation

<div grid="~ cols-3 gap-8">
<div>

下面是两种涉及访存的 mov 类指令。

`valC` 被当做偏移量使用，与 `valB` 相加得到 `valE`，然后 `valE` 被当做地址使用。

</div>

<div col-span-2>

![seq_inst_stages_2](/03-Arch/seq_inst_stages_2.png){.h-90.mx-auto}

</div>
</div>

---

# Y86-64 的顺序实现

sequential implementation

<div grid="~ cols-3 gap-8">
<div>

`popq` 中，会将 `valA` 和 `valB` 的值都设置为 `R[%rsp]`，因为一个要用于去当内存，读出旧 `M[%rsp]` 处的值，一个要用于计算，更新 `R[%rsp]`。

为了统一，在 `popq` 中，用于计算的依旧是 `valB`。

<div text-sm>

- `pushq %rsp` 的行为：`pushq` 压入的是旧的 `%rsp`，然后 `%rsp` 减 8
- `popq %rsp` 的行为：最终将 `%rsp` 设置为旧的 `M[%rsp]`

↑ 其他情况：

`pushq` 先 -8 再压栈；`popq` 先读出再 +8

</div>

</div>

<div col-span-2>

![seq_inst_stages_3](/03-Arch/seq_inst_stages_3.png){.h-90.mx-auto}

</div>
</div>

<!--
这个是最复杂的

为了统一都是用 valB 来读 %rsp 的值然后进行更新后的指针计算。

可以发现访存是在写回前执行的，所以访存的时候栈指针是还没有更新的
-->
---

# Y86-64 的顺序实现

sequential implementation

<div grid="~ cols-3 gap-8">
<div>

根据这个流程，思考一下 `pushq %rsp` 和 `popq %rsp` 的时候会发生什么？

<div v-click>

- `pushq %rsp` 的时候，`rA = rB = %rsp`，访存时写入内存的是 `valA`，所以是把 `%rsp` 还没修改的值压进了栈。
- `popq %rsp` 的时候，`valM` 为栈顶的值。最后会往 `%rsp` 里写 `valE` 和 `valM`，因为写 `valM` 后发生（见课本习题答案），所以是直接把 `%rsp` 重置为栈顶的值。

</div>

</div>

<div col-span-2>

![seq_inst_stages_3](/03-Arch/seq_inst_stages_3.png){.h-90.mx-auto}

</div>
</div>

<!--
这个是最复杂的

为了统一都是用 valB 来读 %rsp 的值然后进行更新后的指针计算。

可以发现访存是在写回前执行的，所以访存的时候栈指针是还没有更新的
-->

---

# Y86-64 的顺序实现

sequential implementation

<div text-sm>

`ret` 指令和 `popq` 指令类似，`call` 指令和 `pushq` 指令类似，区别只有 PC 更新的部分。

所以，同样注意他们用于计算的依旧是 `valB`。

</div>

![seq_inst_stages_4](/03-Arch/seq_inst_stages_4.png){.h-75.mx-auto}

<!--
几个涉及控制流跳转的指令

解释一下这里的 Cnd 是什么。

call 和 ret 与 pushq 和 popq 都很像，只有 PC 更新的时候不一样
-->


---

# SEQ 的时序

有点难理解

- 之前我们对于指令的描述是从上往下执行的程序符号
- 但是在实际硬件结构中根本完全不同，一个时钟变化会引发一个组合逻辑的流来执行指令
- 事实上，所有的状态更新**同时发生**，且只在时钟上升开始下一周期时。
- **原则：从不回读**：处理器从来不需要为了完成一条指令的执行而去读由该指令更新了的状态
  - 状态在存储器里：PC，条件码，数据内存，寄存器堆
  - 状态的更新发生在**指令结束时**
  - 处理器无法在执行当前指令的过程中提前读到更新后的状态

---

# 理解 SEQ 的时序

![](/03-Arch/seq_time_1.png)

<!--
所有状态单元保持 irmovq 指令更新过的状态
-->

---

# 理解 SEQ 的时序

![](/03-Arch/seq_time_2.png)

<!--
组合逻辑完成了一系列操作，CC，%rbx，PC 的新值被生成。此时组合逻辑是已经被更新的了，但是状态还没有被更新。
-->

---

# 理解 SEQ 的时序

![](/03-Arch/seq_time_3.png)

<!--
时钟上升后，更新 PC，寄存器文件和CC寄存器。但组合逻辑还没对这些变化响应
-->

---

# 理解 SEQ 的时序

![](/03-Arch/seq_time_4.png)

这样，值沿着组合逻辑传播，状态在时钟上升时更新

<!--
第四周期结尾，组合逻辑反应过来了，算了一个新的PC，因为没有要跳转所以其他什么都没干，但状态还是旧的，没更新过

在这一页再次强调一下从不回读的意思，更新后的状态是没有办法访问的
-->

---

# 顺序实现 - 取指阶段

sequential implementation: fetch stage

<div grid="~ cols-2 gap-12">
<div>

```hcl {*}{maxHeight:'380px'}
# 指令代码
word icode = [
  imem_error: INOP; # 读取出了问题，返回空指令
  1: imem_icode; # 读取成功，返回指令代码
];

# 指令功能
word ifun = [
  imem_error: FNONE; # 读取出了问题，返回空操作
  1: imem_ifun; # 读取成功，返回指令功能
];

# 指令是否有效
bool instr_valid = icode in {
  INOP, IHALT, IRRMOVQ, IIRMOVQ, IRMMOVQ, IMRMOVQ,
  IOPQ, IJXX, ICALL, IRET, IPUSHQ, IPOPQ
};

# 是否需要寄存器
bool need_regids = icode in {
  IRRMOVQ, IOPQ, IPUSHQ, IPOPQ,
  IIRMOVQ, IRMMOVQ, IMRMOVQ
};

# 是否需要常量字
bool need_valC = icode in {
  IIRMOVQ, IRMMOVQ, IMRMOVQ, IJXX, ICALL
};
```

</div>

<div>

![fetch](/03-Arch/fetch.png)

</div>
</div>

---

# 顺序实现 - 译码/写回阶段

sequential implementation: decode/write back stage

<div grid="~ cols-2 gap-12">
<div>

```hcl
# 源寄存器 A 的选择
word srcA = [
  icode in { IRRMOVQ, IRMMOVQ, IOPQ, IPUSHQ } : rA;
  icode in { IPOPQ, IRET } : RRSP;
  1 : RNONE; # 不需要寄存器
];
# 源寄存器 B 的选择
word srcB = [
  icode in { IOPQ, IRMMOVQ, IMRMOVQ } : rB;
  icode in { IPUSHQ, IPOPQ, ICALL, IRET } : RRSP;
  1 : RNONE; # 不需要寄存器
];
```

</div>

<div>

```hcl
# 目标寄存器 E 的选择
word dstE = [
  icode in { IRRMOVQ } && Cnd : rB; # 支持 cmovXX
  icode in { IIRMOVQ, IOPQ } : rB; # 注意这里！
  icode in { IPUSHQ, IPOPQ, ICALL, IRET } : RRSP;
  1 : RNONE; # 不写入任何寄存器
];
# 目标寄存器 M 的选择
word dstM = [
  icode in { IMRMOVQ, IPOPQ } : rA;
  1 : RNONE; # 不写入任何寄存器
];
```


</div>
</div>

寄存器 ID `srcA` 表明应该读哪个寄存器以产生 `valA`（注意不是 `aluA`），`srcB` 同理。

寄存器 ID `dstE` 表明写端口 E 的目的寄存器，计算出来的 `valE` 将放在那里，`dstM` 同理。

在 SEQ 实现中，回写和译码放到了一起。

---

# 顺序实现 - 执行阶段

sequential implementation: execute stage


```hcl
# 选择 ALU 的输入 A
word aluA = [
  icode in { IRRMOVQ, IOPQ } : valA;  # 指令码为 IRRMOVQ 时，执行 valA + 0
  icode in { IIRMOVQ, IRMMOVQ, IMRMOVQ } : valC;  # 立即数相关，都送入的是 aluA
  icode in { ICALL, IPUSHQ } : -8;  # 减少栈指针
  icode in { IRET, IPOPQ } : 8;  # 增加栈指针
  # 其他指令不需要 ALU
];
# 选择 ALU 的输入 B，再次强调 OPq 指令中，是 `valB OP valA`
word aluB = [
  icode in { IRMMOVQ, IMRMOVQ, IOPQ, ICALL, IPUSHQ, IRET, IPOPQ } : valB;  # 大部分都用 valB
  icode in { IRRMOVQ, IIRMOVQ } : 0;  # 指令码为 IRRMOVQ 或 IIRMOVQ 时，选择 0
  # 其他指令不需要 ALU
];
# 设置 ALU 功能
word alufun = [
  icode == IOPQ : ifun;  # 如果指令码为 IOPQ，则使用 ifun 指定的功能
  1 : ALUADD;  # 默认使用 ALUADD 功能
];
# 是否更新条件码
bool set_cc = icode in { IOPQ };  # 仅在指令码为 IOPQ 时更新条件码
```

---

# 顺序实现 - 访存阶段

sequential implementation: memory stage

<div grid="~ cols-2 gap-12">
<div>


```hcl
# 设置读取控制信号
bool mem_read = icode in { IMRMOVQ, IPOPQ, IRET };
# 设置写入控制信号
bool mem_write = icode in { IRMMOVQ, IPUSHQ, ICALL };
# 选择内存地址
word mem_addr = [
  icode in { IRMMOVQ, IPUSHQ, ICALL, IMRMOVQ } : valE;
  icode in { IPOPQ, IRET } : valA; # valE 算栈指针去了
  # 其它指令不需要使用地址
];
```


</div>

<div>


```hcl
# 选择内存输入数据
word mem_data = [
  # 从寄存器取值
  icode in { IRMMOVQ, IPUSHQ } : valA; # valB 算地址去了
  # 返回 PC
  icode == ICALL : valP;
  # 默认：不写入任何数据
];
# 确定指令状态
word Stat = [
  imem_error || dmem_error : SADR;
  !instr_valid : SINS;
  icode == IHALT : SHLT;
  1 : SAOK;
];
```

</div>
</div>

---

# 顺序实现 - 更新 PC 阶段

sequential implementation: update pc stage



<div grid="~ cols-2 gap-12">
<div>

```hcl
# 设置新 PC 值
word new_pc = [
  # 调用指令，使用指令常量
  icode == ICALL : valC;
  # 条件跳转且条件满足，使用指令常量
  icode == IJXX && Cnd : valC;
  # RET 指令完成，使用栈中的值
  icode == IRET : valM;
  # 默认：使用递增的 PC 值
  # 等于上一条指令地址 + 上一条指令长度 1,2,9,10
  1 : valP;
];
```

</div>

<div v-click>

![fetch](/03-Arch/fetch.png)


</div>
</div>

<button @click="$nav.go(26)">🔙</button>


---

<div grid="~ cols-2 gap-12">
<div>

# 顺序实现 - 总结

sequential implementation: summary

重点关注：

- `valA` 和 `valB` 怎么连的
- 什么时候 `valP` 可以直传内存
- 什么时候 `valA` 可以直传内存

<div v-click mt-4>

### 答案：

1. `call`
2. `rmmovq` `pushq` `popq`（`mrmovq` 需要吗？不！）

</div>

</div>

<div>



![seq_hardware](/03-Arch/seq_hardware.png){.h-120.mx-auto}

</div>
</div>

---

# Pipeline

Taoyu Yang, EECS, PKU

<style>
  div{
   @apply text-gray-2;
  }
</style>

---

# 关于 Archlab

- **请仔细完整阅读 writeup！！**
- Part-B 是助你理解流水线的重要练习
  - 强烈建议不要用 AI 辅助
  - 鼓励同学之间互相讨论
  - 利用 Git 做版本管理会方便不少
  - 初始下发的 `pipe_s4b.rs` 和 `pipe_s4c.rs` 有问题，请对照群消息修改或者下载最新版
  - ~~可能听完这次课你也不理解流水线，但自己写完 Part-B 是一定可以理解的~~
- Part-C
  - 仔细读评分标准可以发现 arch cost 这个指标可能比你想象中重要！
  - 不是几年前狂卷 CPE 的时代了
  - ac 如何降到 3 呢，仔细想想！
- **注意 DDL 是 11 月 3 号！！！尽早开始写**
- ~~这周四就发 cachelab 了，不要 pipelined lab（~~

---
layout: center
class: text-center
---

# 研讨题分享

<!--

-->


---

# 流水线实现

pipelined implementation

什么是流水线？答：通过同一时间上的并行，来提高效率。

<div grid="~ cols-2 gap-12">
<div>

![without_pipeline](/03-Arch/without_pipeline.png)

</div>

<div>

![with_pipeline](/03-Arch/with_pipeline.png)

</div>
</div>

---

# 流水线实现

pipelined implementation

<div class="text-sm">


吞吐量：单位时间内完成的指令数量。

单位：每秒千兆指令（GIPS，$10^9$ instructions per second，等于 1 ns（$10^{-9}$ s） 执行多少条指令再加个 G）。


<div grid="~ cols-2 gap-8">
<div>

$$
\text{吞吐量} = \frac{1}{(300 + 20) \text{ps}} \cdot \frac{1000 \text{ps}}{1 \text{ns}}  = 3.125 \text{GIPS}
$$

![without_pipeline](/03-Arch/without_pipeline.png){.h-60.mx-auto}

</div>

<div>

$$
\text{吞吐量} = \frac{1}{(100 + 20) \text{ps}} \cdot \frac{1000 \text{ps}}{1 \text{ns}}  = 8.33 \text{GIPS}
$$

![with_pipeline](/03-Arch/with_pipeline.png){.h-60.mx-auto}

</div>
</div>


</div>

---

# 流水线实现的局限性

pipelined implementation: limitations

- **运行时钟的速率是由最慢的阶段的延迟限制的**。每个时钟周期的最后，只有最慢的阶段会一直处于活动状态
- **流水线过深**：不能无限增加流水线的阶段数，**因为此时流水线寄存器的延迟占比加大**。
- **数据冒险**

<div grid="~ cols-2 gap-12">
<div>

![pipe_limit_1](/03-Arch/pipe_limit_1.png){.mx-auto}

</div>

<div>

![pipe_limit_2](/03-Arch/pipe_limit_2.png){.mx-auto}

</div>
</div>

```asm
irmovq $50, %rax   ; 将立即数50移动到寄存器rax中
addq %rax, %rbx    ; 将寄存器rax中的值与rbx中的值相加
mrmovq 100(%rbx), %rdx  ; 从内存地址rbx+100读取值到寄存器rdx中
```

---

# 小练习：流水线计算

exercise

A~H 为8个基本逻辑单元，下图中标出了每个单元的延迟，以及用箭头标出了单元之间的数据依赖关系。寄存器的延迟均为10ps。

<div grid="~ cols-[1fr_1.8fr] gap-12">

<div>

1. 计算目前的电路的总延迟
2. 通过插入寄存器，可以对这个电路进行流水化改造。现在想将其改造为两级流水线，为了达到尽可能高的吞吐率，问寄存器应插在何处?获得的吞吐率是多少?
3. 现在想将其改造为三级流水线，问最优改造所获得的吞吐率是多少?

</div>

<div>

![](/03-Arch/pipeline_calc_exercise.png)

</div>

</div>

<!--
40+60+40+30+10=180ps

插在BC、FG之间。1000/110=9.09GIPS


插在AB、AF、EF、BC、FG 之间。1000/(40+30+10)=12.5GIPS
-->

---

# SEQ 与 SEQ+

SEQ vs SEQ+

- 在 SEQ 中，PC 计算发生在时钟周期结束的时候，根据当前时钟周期内计算出的信号值来计算 PC 寄存器的新值。
- 在 SEQ+ 中，我们需要在每个时钟周期都可以取出下一条指令的地址，所以更新 PC 阶段在一个时钟周期开始时执行，而不是结束时才执行。
- **SEQ+ 没有硬件寄存器来存放程序计数器**。而是根据从前一条指令保存下来的一些状态信息动态地计算 PC。

![seq+_pc](/03-Arch/seq+_pc.png){.mx-auto.h-40}

此处，小写的 `p` 前缀表示它们保存的是前一个周期中产生的控制信号。

<!--
意思就是在之前的 SEQ 里面，一条指令全部执行完之后才知道 PC 的新值。不方便我们流水线化地取下一条指令

所以在 SEQ+ 里面把更新 PC 阶段放在开头，直接从前一条指令留下来的信息算 PC，即放到了取指阶段进行
-->

---

# SEQ vs SEQ+

<div grid="~ cols-2 gap-12">
<div>

![seq_hardware](/03-Arch/seq_hardware.png){.h-90.mx-auto}

</div>

<div>

![seq+_hardware](/03-Arch/seq+_hardware.png){.h-90.mx-auto}

</div>
</div>

<!--
把新 PC 的计算移动到了最前，其余没有区别
-->

---

<div grid="~ cols-2 gap-12">
<div>

# 弱化一些的 PIPE 结构

PIPE-

<div class="text-sm">

各个信号的命名：

- 在命名系统中，大写的前缀 “D”、“E”、“M” 和 “W” 指的是 **流水线寄存器**，所以 `M_stat` 指的是流水线寄存器 `M` 的状态码字段。

    可以理解为，对应阶段开始时就已经是正确的值了（且由于不回写的原则，所以该时钟周期内不会再改变，直到下一个时钟上升沿的到来）
- 小写的前缀 `f`、`d`、`e`、`m` 和 `w` 指的是 **流水线阶段**，所以 `m_stat` 指的是在访存阶段 **中** 由控制逻辑块产生出的状态信号。

    可以理解为，对应阶段中，完成相应运算时才会是正确的值

- 右图中没有转发逻辑，右侧的实线是流水线寄存器间（大写前缀）的同步。

</div>




</div>

<div>

![pipe-_hardware](/03-Arch/pipe-_hardware.png){.h-120.mx-auto}

</div>
</div>

<!--
注意区分这里的大小写区别。
-->

---

# SEQ+ vs PIPE-

<div grid="~ cols-2 gap-12">
<div>

![seq+_hardware](/03-Arch/seq+_hardware.png){.h-90.mx-auto}

</div>

<div>

![pipe-_hardware](/03-Arch/pipe-_hardware.png){.h-90.mx-auto}

</div>
</div>

<button @click="$nav.go(43)">🔙</button>

<!--
在 SEQ+ 的基础上，把每个阶段的信号给放到流水线寄存器里面存下来
-->

---

<div grid="~ cols-2 gap-12">
<div>

# 弱化一些的 PIPE 结构

PIPE-


- 等价于在 SEQ+ 中插入了流水线寄存器 **（他们都是即将由对应阶段进行处理）**{.text-sky-5}
  - F：Fetch，取指阶段
  - D：Decode，译码阶段
  - E：Execute，执行阶段
  - M：Memory，访存阶段
  - W：Write back，写回阶段
- 同时，有个新模块 `selectA` 来选择 `valA` 的来源
  - `valP`：`call` `jXX`（后面讲，可以想想为啥，提示：控制冒险）
  - `d_rvalA`：其他未转发的情况（后面讲）<button @click="$nav.go(41)">🔙</button>

</div>

<div>

![pipe-_hardware](/03-Arch/pipe-_hardware.png){.h-120.mx-auto}

</div>
</div>

<!--
selectA 的逻辑其实就是，回顾 SEQ，只有 call 在 M 阶段需要 valP，只有 jXX 在 E 阶段（不需要跳转的时候）需要 valP。而他们都不需要寄存器文件读出来的 valA。所以我们将 valP 合并到 valA，这正是 selectA 在做的事情。

这样可以减少流水线寄存器的状态数量（不然是不是就需要在 E 和 M 都记 valP）
-->

---

# PIPE- 分支预测

PIPE- branch prediction

**分支预测**：猜测分支方向并根据猜测开始取指的技术。

对于 `jXX` 指令，有两种情况：

- 分支不执行：下一条 PC 是 `valP`
- 分支执行：下一条 PC 是 `valC`

由于我们现在是流水线，我们需要每个时钟周期都能给出一个指令地址用于取址，所以我们采用分支预测：

最简单的策略：总是预测选择了条件分支，因而预测 PC 的新值为 `valC`。

对于 `ret` 指令，我们等待它通过写回 `W` 阶段（从而可以从 `M` 中得到之前压栈的返回值并更新 `PC`）。

> 同条件转移不同，`ret` 可能的返回值几乎是无限的，因为返回地址是位于栈顶的字，其内容可以是任意的。

<!--
我们希望每个时钟周期都发射一条新指令

always taken
-->

---

# 流水线冒险

hazards

冒险分为两类：

1. **数据冒险 (Data Hazard)**：下一条指令需要使用当前指令计算的结果。
2. **控制冒险 (Control Hazard)**：指令需要确定下一条指令的位置，例如跳转、调用或返回指令。

<!-- 提醒大家仔细听 -->

---

# 数据冒险

data hazard

<div grid="~ cols-2 gap-8">
<div>

数据冒险是相对容易理解的。

在右图代码中，`%rax` 的值需要在第 6 个周期结束时才能完成写回，但是在 第 6 个周期内，正处于译码阶段的 `addq` 指令就需要使用 `%rax` 的值了。这就产生了数据冒险。

类似可推得，如果一条指令的操作数被它前面 3 条指令中的任意一条改变的话，都会出现数据冒险。

我们需要满足：当后来的需要某一寄存器的指令处于译码 D 阶段时，该寄存器的值必须已经更新完毕（即已经 **完成** 写回 W 阶段）。

<div class="text-sm">

以 2F 的左边缘作为起始时刻，则：

$$
5(完成 W) - 1(开始 D，即完成 F) - 1(错开一条指令) = 3
$$

</div>


</div>

<div>



![data_hazard](/03-Arch/data_hazard.png){.mx-auto}

</div>
</div>

---

# 数据冒险的解决：暂停

data hazard resolution: stall


<div grid="~ cols-2 gap-4">
<div>


**暂停**：暂停时，处理器会停止流水线中一条或多条指令，直到冒险条件不再满足。

<div class="text-sm">

> 让一条指令停顿在译码阶段，直到产生它的源操作数的指令通过了写回阶段，这样我们的处理器就能避免数据冒险。（即，下一个时钟周期开始时，此指令开始真正译码，此时源操作数已经更新完毕）

暂停技术就是让一组指令阻塞在它们所处的阶段，而允许其他指令继续通过流水线（如右图 `irmovq` 指令）。

每次要把一条指令阻塞在 **译码阶段**，就在 **执行阶段**（下一个阶段）插入一个气泡。

气泡就像一个自动产生的 `nop` 指令，**它不会改变寄存器、内存、条件码或程序状态。**{.text-sky-5}

</div>


</div>

<div>

![stall](/03-Arch/stall.png){.mx-auto}

<div class="text-xs">

- ↑ 5W、6W 的右边缘蓝色线代表直到此处，这条指令才能正确的更新寄存器，在 5W、6W 块内起始已经准备好了值，但是由于没有到时钟上升沿，所以并没有写入到只有在时钟上升沿才会采样输入、更新其内值的寄存器文件（注意不是流水线寄存器）。
- ↑ 7D 的左边缘蓝色线代表第 7 个周期的译码 D 阶段流水线寄存器，我们需要在此时保证寄存器文件（注意不是流水线寄存器）的值正确，因为在这个 7D 阶段，寄存器文件不会遇到新的时钟上升沿，更新其内值、其输出。

流水线寄存器 vs 寄存器文件：{.!mb-0}

- 流水线寄存器：保存的是和流水线某一阶段运算所需的一些初始值
- 寄存器文件：保存的是当前所有寄存器（`%rax` `%rbx` 等等）的值

</div>


</div>
</div>

---

# 暂停 vs 气泡

stall vs bubble

<div grid="~ cols-2 gap-12">
<div>

- 正常：寄存器的状态和输出被设置成输入的值
- 暂停：状态保持为先前的值不变
- 气泡：会用 `nop` 操作的状态覆盖当前状态

所以，在上页图中，我们说：
- 给执行阶段插入了气泡
- 对译码阶段执行了暂停


</div>

<div>

![stall_vs_bubble](/03-Arch/stall_vs_bubble.png){.mx-auto}

</div>
</div>

---

# 数据冒险的解决：转发

data hazard resolution: forwarding

<div grid="~ cols-2 gap-12">
<div>

实际上，在这里，所需要的真实  `%rax` 值，早在 4E 快结束时（其内红线）就已经计算出来了（3E 同理）。

而我们需要用到它的是 5E 的开始（此时，5E 阶段的组合逻辑即将从其左边缘红线所代表的 E 执行阶段流水线寄存器中取出 `valA` `valB` `valC` 用于计算）。

回忆：大写的寄存器是在对应阶段开始时就已经是正确的值。

</div>

<div>


![data_hazard_2](/03-Arch/data_hazard_2.png){.mx-auto}

</div>
</div>

---

# 数据冒险的解决：转发

data hazard resolution: forwarding

**转发**：将结果值直接从一个流水线阶段传到较早阶段的技术。

这个过程可以发生在许多阶段（下图中，要到 6E 寄存器才定下来，所以只要在时钟上升沿来之前，都来得及）。

<div grid="~ cols-2 gap-12">
<div>

![forward_1](/03-Arch/forward_1.png){.mx-auto.h-80}

</div>

<div>

![forward_2](/03-Arch/forward_2.png){.mx-auto.h-80}

</div>
</div>

---

# 特殊的数据冒险：加载 / 使用冒险

data hazard: load / use hazard

- 如果在先前指令的 E 执行阶段（其内靠后时）就已经可以得到正确值，那么由于后面的指令至少落后 1 个阶段，我们总可以在后面指令的 E 寄存器最终确定之前，将正确值转发解决问题。
- 如果在先前指令的 M 访存阶段（其内靠后时）才能得到正确值，且后面指令紧跟其后，那么当我们实际得到正确值时，必然赶不上后面指令的 E 寄存器最终确定，所以我们必须暂停流水线。
- 所以，加载 / 使用冒险发生在 `mrmovq` 或 `popq` 后立即使用其目的寄存器的情况。

<div class="text-sm text-gray-5">

书上老说什么把值送回过去，我觉得第一次读真难明白吧。

</div>

---

# 特殊的数据冒险：加载 / 使用冒险

data hazard: load / use hazard

<div grid="~ cols-2 gap-12">
<div>

在这里，所需要的真实  `%rax` 值，在 8M 快结束时（其内红线）才能从内存中取出，位于 `m_valM`。

而我们需要用到它的是 8E 的开始（此时，8E 阶段的组合逻辑即将从其左边缘红线所代表的 E 执行阶段流水线寄存器中取出 `valA` `valB` `valC` 用于计算）。

在图中可以清晰看出，这存在时间上的错位，所以是不可能的。

</div>

<div>

![load_use_hazard](/03-Arch/load_use_hazard.png){.mx-auto}

</div>
</div>

---

# 加载 / 使用冒险解决方案：暂停 + 转发

load / use hazard solution

<div grid="~ cols-3 gap-12">
<div>

依旧是：

- 译码阶段中的指令暂停 1 个周期
- 执行阶段中插入 1 个气泡

此时，`m_valM` 的值已经更新完毕，所以可以转发到 `d_valA`（然后被用于存入 `E_valA`）。

`m_valM`：在 M 阶段内，取出的内存值

`d_valA`：在 D 阶段内，计算得到的即将设置为 `E_valA` 的值

</div>

<div col-span-2>

![load_use_hazard_solution](/03-Arch/load_use_hazard_solution.png){.mx-auto.h-100}

</div>
</div>

---

<div grid="~ cols-2 gap-12">
<div>

# PIPE 最终结构

PIPE final structure

把各个转发逻辑都画出来，就得到了最终的结构。

注意：

- `Sel + Fwd A`：是 PIPE- 中标号为 `Select A` 的块的功能与转发逻辑的结合。<button @click="$nav.go(30)">💡</button>
- `Fwd B`


</div>

<div>

![pipe_hardware](/03-Arch/pipe_hardware.png){.mx-auto.h-120}

</div>
</div>

---

# PIPE- vs PIPE

<div grid="~ cols-2 gap-12">
<div>

![pipe-_hardware](/03-Arch/pipe-_hardware.png){.h-110.mx-auto}

</div>

<div>

![pipe_hardware](/03-Arch/pipe_hardware.png){.h-110.mx-auto}

</div>
</div>

---

# 结构之间的差异

differences between structures

<div grid="~ cols-2 gap-4" text-sm>
<div>

### SEQ

- 完全的分阶段，且顺序执行
- 没有流水线寄存器
- 没有转发逻辑

</div>

<div>

### SEQ+

- 把计算新 PC 计算放到了最开始
- 目的：为了能够划分流水线做准备，当前指令到 D 阶段时，应当能开始下一条指令的 F 阶段
- 依旧是没有转发逻辑、且顺序执行
- <button @click="$nav.go(9)">💡 结构差异图</button> 

</div>

<div>

### PIPE-

- 在 SEQ+ 的基础上，增加了流水线寄存器
- 没有转发逻辑
- <button @click="$nav.go(11)">💡 结构差异图</button> 

</div>

<div>

### PIPE

- 在 PIPE- 的基础上，完善了转发逻辑，可以转发更多的计算结果（小写开头的，而不是只有大写开头的流水线寄存器）
- 增加了转发逻辑
- 转发源：`e_valE` `m_valM`（中间计算结果们）
- 转发目的地：`d_valA` `d_valB` 
- <button @click="$nav.go(24)">💡 结构差异图</button> 


</div>

</div>

---

# 控制冒险

control hazard

**控制冒险**：当处理器无法根据处于取指阶段的当前指令来确定下一条指令的地址时，就会产生控制冒险。

<div grid="~ cols-2 gap-12">
<div>


发生条件：`RET` `JXX`

`RET` 指令需要弹栈（访存）才能得到下一条指令的地址。

`JXX` 指令需要根据条件码来确定下一条指令的地址。

- `Cnd ← Cond(CC, ifun)`
- `Cnd ? valC : valP`



</div>

<div>

```hcl
# 指令应从哪个地址获取
word f_pc = [
  # 分支预测错误时，从增量的 PC 取指令
  # 传递路径：D_valP -> E_valA -> M_valA
  # 条件跳转指令且条件不满足时
  M_icode == IJXX && !M_Cnd : M_valA;
  # RET 指令终于执行到回写阶段时（即过了访存阶段）
  W_icode == IRET : W_valM;
  # 默认情况下，使用预测的 PC 值
  1 : F_predPC;
];
```

<button @click="$nav.go(23)">💡PIPELINE 电路图</button>

注意，这里用到的都是流水线寄存器，而没有中间计算结果（小写前缀）。

</div>
</div>

---

# 控制冒险：RET

control hazard: RET

![control_hazard_ret](/03-Arch/control_hazard_ret.png){.mx-auto.h-45}

涉及取指 F 阶段的不能转发中间结果 `m_valM`，必须等到流水线寄存器 `W_valM` 更新完毕！

为什么：取址阶段没有相关的硬件电路处理中间结果的转发！必须是流水线寄存器同步。

所以需要插入 3 个气泡（以 3F 的左边缘作为起始时刻）：

$$
4(\text{RET } 完成 M) - 0(开始 F) - 1(错开一条指令) = 3
$$

为什么是气泡：<button @click="$nav.go(17)">💡暂停 vs 气泡</button> 暂停保留状态，气泡清空状态。

---

# 控制冒险：JXX

control hazard: JXX

<div grid="~ cols-2 gap-12">
<div>

- 分支逻辑发现不应该选择分支之前（到达执行 E 阶段），已经取出了两条指令，它们不应该继续执行下去了。
- 这两条指令都没有导致程序员可见状态发生改变（没到到执行 E 阶段）。

</div>

<div>

![control_hazard_jxx](/03-Arch/control_hazard_jxx.png){.mx-auto.h-40}

</div>
</div>
<div grid="~ cols-2 gap-12" text-sm>
<div>

```hcl
bool branch_mispred = E_icode == IJXX && !e_Cnd;
bool load_use_hazard = 
  E_icode in { IMRMOVQ, IPOPQ } &&
  E_dstM in { d_srcA, d_srcB };
bool ret_hazard = 
  IRET in { D_icode, E_icode, M_icode }
// 先把三种冒险的 HCL 表达式定义如上，方便之后使用
```

</div>

<div>

```hcl
bool D_bubble = branch_mispred ||
  !load_use_hazard && ret_hazard;
// 如果是 load_use_harzard 的话是 stall

bool E_bubble = branch_mispred || load_use_hazard
```

</div>
</div>

---

# 控制冒险：JXX

control hazard: JXX

<div grid="~ cols-2 gap-12">
<div text-sm>

1. 在第 4 个时钟周期内靠后的位置，在 4E 处的红线所在的执行阶段，通过组合逻辑计算得到 `jne` 的条件没有满足
2. 于是这个信息被转发到了前面同一周期的 D、F 阶段，而这两个阶段正在分别进行运算，以准备第 5 个时钟周期初始的 E、D 流水线寄存器（两个蓝色框右边缘）
3. 得到转发的信息后，他们分别通过设置两个值 `E_bubble` `D_bubble`（右图未画出），以告诉下一阶段
4. 进入到第 5 个时钟周期后，E、D 阶段首先读取 E、D 流水线寄存器，发现各自的 `Bubble` 信号为真时，便会用 Bubble 气泡的 `nop` 指令顶掉第 5 个时钟周期时的 E、D 阶段的指令（也即第 4 个时钟周期时的 D、F 阶段的指令），从而实现了气泡的插入，且顶掉了错误的指令。

</div>

<div>

![control_hazard_jxx](/03-Arch/control_hazard_jxx.png){.mx-auto.h-40}

<div class="text-sm">

↑深蓝色框里是插入气泡的逻辑发生位置，深蓝色框右边缘代表得出的气泡信号存储到的流水线寄存器，左边缘代表得到转发开始设置的时间。

</div>

</div>
</div>

---

# PIPELINE 的各阶段实现：取指阶段

pipeline hcl: fetch stage

<div grid="~ cols-2 gap-4">
<div>

```hcl
# 指令应从哪个地址获取
word f_pc = [
  # 分支预测错误时，从增量的 PC 取指令
  # 传递路径：D_valP -> E_valA -> M_valA
  # 条件跳转指令且条件不满足时
  M_icode == IJXX && !M_Cnd : M_valA;
  # RET 指令终于执行到回写阶段时（即过了访存阶段）
  W_icode == IRET : W_valM;
  # 默认情况下，使用预测的 PC 值
  1 : F_predPC;
];
# 取指令的 icode
word f_icode = [
  imem_error : INOP;  # 指令内存错误，取 NOP
  1 : imem_icode;     # 否则，取内存中的 icode
];
# 取指令的 ifun
word f_ifun = [
  imem_error : FNONE; # 指令内存错误，取 NONE
  1 : imem_ifun;      # 否则，取内存中的 ifun
];
```
</div>

<div>

![pipeline_fetch_stage](/03-Arch/pipeline_fetch_stage.png){.mx-auto}

</div>
</div>

---

# PIPELINE 的各阶段实现：取指阶段

pipeline hcl: fetch stage

<div grid="~ cols-2 gap-4">
<div>

```hcl
# 指令是否有效
bool instr_valid = f_icode in {
  INOP, IHALT, IRRMOVQ, IIRMOVQ, IRMMOVQ, IMRMOVQ,
  IOPQ, IJXX, ICALL, IRET, IPUSHQ, IPOPQ
};
# 获取指令的状态码
word f_stat = [
  imem_error : SADR;   # 内存错误
  !instr_valid : SINS; # 无效指令
  f_icode == IHALT : SHLT; # HALT 指令
  1 : SAOK;            # 默认情况，状态正常
];
```

</div>

<div>

![pipeline_fetch_stage](/03-Arch/pipeline_fetch_stage.png){.mx-auto}

</div>
</div>

---

# PIPELINE 的各阶段实现：取指阶段

pipeline hcl: fetch stage

<div grid="~ cols-2 gap-4">
<div>

```hcl
# 指令是否需要寄存器 ID 字节
# 单字节指令 `HALT` `NOP` `RET`；不需要寄存器 `JXX` `CALL`
bool need_regids = f_icode in {
  IRRMOVQ, IOPQ, IPUSHQ, IPOPQ,
  IIRMOVQ, IRMMOVQ, IMRMOVQ
};
# 指令是否需要常量值
# 作为值；作为 rB 偏移；作为地址
bool need_valC = f_icode in {
  IIRMOVQ, IRMMOVQ, IMRMOVQ, IJXX, ICALL
};
# 预测下一个 PC 值
word f_predPC = [
  # 跳转或调用指令，取 f_valC
  f_icode in { IJXX, ICALL } : f_valC;
  # 否则，取 f_valP
  1 : f_valP;
];
```
</div>

<div>

![pipeline_fetch_stage](/03-Arch/pipeline_fetch_stage.png){.mx-auto}

</div>
</div>

---

# PIPELINE 的各阶段实现：译码阶段

pipeline hcl: decode stage

<div grid="~ cols-2 gap-4">
<div>

```hcl
# 决定 d_valA 的来源
word d_srcA = [
  # 一般情况，使用 rA
  D_icode in { IRRMOVQ, IRMMOVQ, IOPQ, IPUSHQ } : D_rA;
  # 此时，valB 也是栈指针
  # 但是同时需要计算新值（valB 执行阶段计算）、使用旧值访存（valA）
  D_icode in { IPOPQ, IRET } : RRSP;
  1 : RNONE; # 不需要 valA
];
# 决定 d_valB 的来源
word d_srcB = [
  # 一般情况，使用 rB
  D_icode in { IOPQ, IRMMOVQ, IMRMOVQ } : D_rB;
  # 涉及栈指针，需要计算新的栈指针值
  D_icode in { IPUSHQ, IPOPQ, ICALL, IRET } : RRSP;
  1 : RNONE; # 不需要 valB
];
```

</div>

<div>

![pipeline_decode_stage](/03-Arch/pipeline_decode_stage.png){.mx-auto}

</div>
</div>

---

# PIPELINE 的各阶段实现：译码阶段

pipeline hcl: decode stage

<div grid="~ cols-2 gap-4">
<div>

```hcl
# 决定 E 执行阶段计算结果的写入寄存器
word d_dstE = [
  # 一般情况，写入 rB，注意 OPQ 指令的 rB 是目的寄存器
  D_icode in { IRRMOVQ, IIRMOVQ, IOPQ} : D_rB;
  # 涉及栈指针，更新 +8/-8 后的栈指针
  D_icode in { IPUSHQ, IPOPQ, ICALL, IRET } : RRSP;
  1 : RNONE; # 不写入 valE 到任何寄存器
];
# 决定 M 访存阶段读出结果的写入寄存器
word d_dstM = [
  # 这两个情况需要更新 valM 到 rA
  D_icode in { IMRMOVQ, IPOPQ } : D_rA;
  1 : RNONE; # 不写入 valM 到任何寄存器
];
```

</div>

<div>

![pipeline_decode_stage](/03-Arch/pipeline_decode_stage.png){.mx-auto}

</div>
</div>

---

# PIPELINE 的各阶段实现：译码阶段

pipeline hcl: decode stage

<div grid="~ cols-2 gap-4">
<div>

```hcl
# 决定 d 译码阶段的 valA 的最终结果，即将存入 E_valA
word d_valA = [
  # 保存递增的 PC
  # 对于 CALL，d_valA -> E_valA -> M_valA -> 写入内存
  # 对于 JXX，d_valA -> E_valA -> M_valA
  # 跳转条件不满足（预测失败）时，同步到 f_pc
  D_icode in { ICALL, IJXX } : D_valP; # 保存递增的 PC
  d_srcA == e_dstE : e_valE; # 前递 E 阶段计算结果
  d_srcA == M_dstM : m_valM; # 前递 M 阶段读出结果
  d_srcA == M_dstE : M_valE; # 前递 M 流水线寄存器最新值
  d_srcA == W_dstM : W_valM; # 前递 W 流水线寄存器最新值
  d_srcA == W_dstE : W_valE; # 前递 W 流水线寄存器最新值
  1 : d_rvalA; # 使用从寄存器文件读取的值，r 代表 read
];
```

为什么是 `e_dstE` 而不是 `E_dstE`，是因为 `cmov` 指令要在 E 阶段才知道是否要写。

</div>

<div>

![pipeline_decode_stage](/03-Arch/pipeline_decode_stage.png){.mx-auto}

</div>
</div>

---

# PIPELINE 的各阶段实现：译码阶段

pipeline hcl: decode stage

<div grid="~ cols-2 gap-4">
<div>

```hcl
# 决定 d 译码阶段的 valB 的最终结果，即将存入 E_valB
word d_valB = [
  d_srcB == e_dstE : e_valE; # 前递 E 阶段计算结果
  d_srcB == M_dstM : m_valM; # 前递 M 阶段读出结果
  d_srcB == M_dstE : M_valE; # 前递 M 流水线寄存器最新值
  d_srcB == W_dstM : W_valM; # 前递 W 流水线寄存器最新值
  d_srcB == W_dstE : W_valE; # 前递 W 流水线寄存器最新值
  1 : d_rvalB; # 使用从寄存器文件读取的值，r 代表 read
];
```

</div>

<div>

![pipeline_decode_stage](/03-Arch/pipeline_decode_stage.png){.mx-auto}

</div>
</div>

---

# PIPELINE 的各阶段实现：执行阶段

pipeline hcl: execute stage

<div grid="~ cols-2 gap-4">
<div>

```hcl
# 选择 ALU 的输入 A
word aluA = [
  # RRMOVQ：valA + 0; OPQ：valB OP valA
  E_icode in { IRRMOVQ, IOPQ } : E_valA;
  # IRMOVQ：valC + 0; RMMOVQ/MRMOVQ：valC + valB
  E_icode in { IIRMOVQ, IRMMOVQ, IMRMOVQ } : E_valC;
  # CALL/PUSH：-8; RET/POP：8
  E_icode in { ICALL, IPUSHQ } : -8;
  E_icode in { IRET, IPOPQ } : 8;
  # 其他指令不需要 ALU 的输入 A
];
# 选择 ALU 的输入 B
word aluB = [
  # 涉及栈时，有 E_valB = RRSP，用于计算新值
  E_icode in { IRMMOVQ, IMRMOVQ, IOPQ, ICALL,
    IPUSHQ, IRET, IPOPQ } : E_valB;
  # 注意 IRMOVQ 的寄存器字节是 rA=F，即存到 rB
  E_icode in { IRRMOVQ, IIRMOVQ } : 0;
  # 其他指令不需要 ALU 的输入 B
];
```

</div>

<div>

![pipeline_execute_stage](/03-Arch/pipeline_execute_stage.png){.mx-auto}

</div>
</div>

---

# PIPELINE 的各阶段实现：执行阶段

pipeline hcl: execute stage

<div grid="~ cols-2 gap-4">
<div>

```hcl
# 设置 ALU 功能
word alufun = [
  # 如果指令是 IOPQ，则选择 E_ifun
  E_icode == IOPQ : E_ifun;
  # 默认选择 ALUADD
  1 : ALUADD;
];
# 是否更新条件码
# 仅在指令为 IOPQ 时更新条件码
# 且只在正常操作期间状态改变
bool set_cc = E_icode == IOPQ &&
  !m_stat in { SADR, SINS, SHLT } &&
  !W_stat in { SADR, SINS, SHLT };
```

</div>

<div>

![pipeline_execute_stage](/03-Arch/pipeline_execute_stage.png){.mx-auto}

</div>
</div>

---

# PIPELINE 的各阶段实现：执行阶段

pipeline hcl: execute stage

<div grid="~ cols-2 gap-4">
<div>


```hcl
# 在执行阶段仅传递 valA 的去向
# E_valA -> e_valA -> M_valA
word e_valA = E_valA;
# CMOVQ 指令，与 RRMOVQ 共用 icode
# 当条件不满足时，不写入计算值到任何寄存器
word e_dstE = [
  E_icode == IRRMOVQ && !e_Cnd : RNONE;
  1 : E_dstE;    # 否则选择 E_dstE
];
```

</div>

<div>

![pipeline_execute_stage](/03-Arch/pipeline_execute_stage.png){.mx-auto}

</div>
</div>

---

# PIPELINE 的各阶段实现：访存阶段

pipeline hcl: memory stage

<div grid="~ cols-2 gap-4">
<div>

```hcl
# 选择访存地址
word mem_addr = [
  # 需要计算阶段计算的值
  # RMMOVQ/MRMOVQ：valE = valC + valB，这里 valA/C “统一”
  # CALL/PUSH：valE = valB(RRSP) - 8
  M_icode in { IRMMOVQ, IPUSHQ, ICALL, IMRMOVQ } : M_valE;
  # 需要计算阶段不修改传递过来的值，即栈指针旧值
  # d_valA(RRSP) -> E_valA -> M_valA
  M_icode in { IPOPQ, IRET } : M_valA;
  # 其他指令不需要访存
];
# 是否读取内存
bool mem_read = M_icode in { IMRMOVQ, IPOPQ, IRET };
# 是否写入内存
bool mem_write = M_icode in { IRMMOVQ, IPUSHQ, ICALL };
```

</div>

<div>

![pipeline_memory_stage](/03-Arch/pipeline_memory_stage.png){.mx-auto}

</div>
</div>

---

# PIPELINE 的各阶段实现：访存阶段

pipeline hcl: memory stage

<div grid="~ cols-2 gap-4">
<div>

```hcl
# 更新状态
word m_stat = [
  dmem_error : SADR; # 数据内存错误
  1 : M_stat; # 默认状态
];
```


</div>

<div>

![pipeline_memory_stage](/03-Arch/pipeline_memory_stage.png){.mx-auto}

</div>
</div>

---

# PIPELINE 的各阶段实现：写回阶段

pipeline hcl: writeback stage

<div grid="~ cols-2 gap-4">
<div>


```hcl
# W 阶段几乎啥都不干，单纯传递
# 设置 E 端口寄存器 ID
word w_dstE = W_dstE; # E 端口寄存器 ID
# 设置 E 端口值
word w_valE = W_valE; # E 端口值
# 设置 M 端口寄存器 ID
word w_dstM = W_dstM; # M 端口寄存器 ID
# 设置 M 端口值
word w_valM = W_valM; # M 端口值
# 更新处理器状态
word Stat = [
  # SBUB 全称 State Bubble，即气泡状态
  W_stat == SBUB : SAOK;
  1 : W_stat; # 默认状态
];
```


</div>

<div>

![pipeline_memory_stage](/03-Arch/pipeline_memory_stage.png){.mx-auto}

</div>
</div>

---

# 异常处理（气泡 / 暂停）：取指阶段

bubble / stall in fetch stage

注意：bubble 和 stall 不能同时为真。

```hcl
# 是否向流水线寄存器 F 注入气泡？
bool F_bubble = 0; # 恒为假
# 是否暂停流水线寄存器 F？
bool F_stall = 
  # 加载/使用数据冒险时，要暂停 1 个周期的译码，进而也需要暂停 1 个周期的取指
  E_icode in { IMRMOVQ, IPOPQ } && E_dstM in { d_srcA, d_srcB } ||
  # 当 ret 指令通过流水线时暂停取指，一直等到 ret 指令得到 W_valM
  IRET in { D_icode, E_icode, M_icode };

// 实际就是 F_stall = load_use_hazard || ret_hazard
```

<div grid="~ cols-2 gap-12" relative>
<div>

![load_use_hazard_solution_stall](/03-Arch/load_use_hazard_solution_stall.png){.mx-auto}

</div>

<div>

![control_hazard_ret_stall](/03-Arch/control_hazard_ret_stall.png){.mx-auto}

</div>
</div>

---

# 异常处理（气泡 / 暂停）：译码阶段

bubble / stall in decode stage

注意：bubble 和 stall 不能同时为真。


```hcl
# 是否暂停流水线寄存器 D？
# 加载/使用数据冒险
bool D_stall = E_icode in { IMRMOVQ, IPOPQ } && E_dstM in { d_srcA, d_srcB };
# 是否向流水线寄存器 D 注入气泡？
bool D_bubble = 
  # 分支预测错误
  (E_icode == IJXX && !e_Cnd) ||
  # 当 ret 指令通过流水线时暂停 3 次译码阶段，但要求不满足读取/使用数据冒险的条件
  !(E_icode in { IMRMOVQ, IPOPQ } && E_dstM in { d_srcA, d_srcB }) && IRET in { D_icode, E_icode, M_icode };
```

<div grid="~ cols-2 gap-12">
<div>

![control_hazard_jxx_bubble_1](/03-Arch/control_hazard_jxx_bubble_1.png){.mx-auto}

</div>

<div>

![control_hazard_ret_bubble](/03-Arch/control_hazard_ret_bubble.png){.mx-auto} 

</div>
</div>

---

# 异常处理（气泡 / 暂停）：执行阶段

bubble / stall in execute stage

注意：bubble 和 stall 不能同时为真。


```hcl
# 是否需要阻塞流水线寄存器 E？
bool E_stall = 0;
# 是否向流水线寄存器 E 注入气泡？
bool E_bubble = 
  # 错误预测的分支
  (E_icode == IJXX && !e_Cnd) || 
  # 负载/使用冒险条件
  (E_icode in { IMRMOVQ, IPOPQ } && E_dstM in { d_srcA, d_srcB });
```

<div grid="~ cols-2 gap-12">
<div>

![control_hazard_jxx_bubble_2](/03-Arch/control_hazard_jxx_bubble_2.png){.mx-auto}

</div>

<div>

![load_use_hazard_solution_bubble](/03-Arch/load_use_hazard_solution_bubble.png){.mx-auto}

</div>
</div>

---

# 异常处理（气泡 / 暂停）：访存阶段

bubble / stall in memory stage

注意：bubble 和 stall 不能同时为真。


```hcl
# 是否需要暂停流水线寄存器 M？
bool M_stall = 0;
# 是否向流水线寄存器 M 注入气泡？
# 当异常通过内存阶段时开始插入气泡
bool M_bubble = m_stat in { SADR, SINS, SHLT } || W_stat in { SADR, SINS, SHLT };
```

---

# 异常处理（气泡 / 暂停）：写回阶段

bubble / stall in writeback stage

注意：bubble 和 stall 不能同时为真。

```hcl
# 是否需要暂停流水线寄存器 W？
bool W_stall = W_stat in { SADR, SINS, SHLT };
# 是否向流水线寄存器 W 注入气泡？
bool W_bubble = 0;
```

---

# 特殊的控制条件

special control conditions

![special_condition](/03-Arch/special_condition.png){.mx-auto.h-50}

<div grid="~ cols-2 gap-8" text-sm>
<div>

组合 A：执行阶段中有一条不选择分支（预测失败）的跳转指令 `JXX`，而译码阶段中有一条 `RET` 指令。

即，`JXX` 指令的跳转目标 `valC` 对应的内存指令是一条 `RET` 指令。

</div>

<div>

组合 B：包括一个加载 / 使用冒险，其中加载指令设置寄存器 `%rsp`，然后 `RET` 指令用这个寄存器作为源操作数。

因为 `RET` 指令需要正确的栈指针 `%rsp` 的值去寻址，才能从栈中弹出返回地址，所以流水线控制逻辑应该将 `RET` 指令阻塞在译码阶段。

</div>
</div>

---

# 特殊的控制条件：组合 A

special control conditions: combination A

![combination_a](/03-Arch/combination_a.png){.mx-auto.h-40}


<div grid="~ cols-2 gap-12" text-sm>
<div>

组合情况 A 的处理与预测错误的分支相似，只不过在取指阶段是暂停。

当这次暂停结束后，在下一个周期，PC 选择逻辑会选择跳转后面那条指令的地址，而不是预测的程序计数器值。

所以流水线寄存器 F 发生了什么是没有关系的。

<div text-sky-5>

气泡顶掉了 `RET` 指令的继续传递，所以不会发生第二次暂停。

</div>


</div>

<div>


```hcl
# 指令应从哪个地址获取
word f_pc = [
  # 分支预测错误时，从增量的 PC 取指令
  # 传递路径：D_valP -> E_valA -> M_valA
  # 条件跳转指令且条件不满足时
  M_icode == IJXX && !M_Cnd : M_valA;
  # RET 指令终于执行到回写阶段时（即过了访存阶段）
  W_icode == IRET : W_valM;
  # 默认情况下，使用预测的 PC 值
  1 : F_predPC;
];
```

</div>
</div>

---

# 特殊的控制条件：组合 B

special control conditions: combination B


![combination_b](/03-Arch/combination_b.png){.mx-auto.h-40}


<div grid="~ cols-2 gap-12" text-sm>
<div>

对于取指阶段，遇到加载/使用冒险或 `RET` 指令时，流水线寄存器 F 必须暂停。

对于译码阶段，这里产生了一个冲突，制逻辑会将流水线寄存器 D 的气泡和暂停信号都置为 1。这是不行的。

<div text-sky-5>

我们希望此时只采取针对加载/使用冒险的动作，即暂停。我们通过修改 `D_bubble` 的处理条件来实现这一点。

</div>


</div>

<div>


```hcl
# 是否需要注入气泡至流水线寄存器 D
bool D_bubble =
  # 错误预测的分支 
  (E_icode == IJXX && !e_Cnd) || 
  # 在取指阶段暂停，同时 ret 指令通过流水线
  # 但不存在加载/使用冒险的条件（此时使用暂停）
  !(E_icode in { IMRMOVQ, IPOPQ } &&
   E_dstM in { d_srcA, d_srcB }) &&
  # IRET 指令在 D、E、M 任何一个阶段
  IRET in { D_icode, E_icode, M_icode };
```

</div>
</div>

---

# 一些记忆要点

tips

- `branch_mispred`：D 气泡，E 气泡
- `load_use_hazard`：F 暂停，D 暂停，E 气泡
- `ret_hazard`：F 暂停，D 气泡
- 组合情况直接列表出来现推即可，有且仅有 load_use + RET 和 branch_mispred + RET 两种组合
  - 可以想想为什么剩余组合不存在
- F 不会气泡，E 不会暂停

---

layout: cover
class: text-center
coverBackgroundUrl: /03-Arch/cover.jpg
---

# Thank you for your listening!


Cat$^2$Fish❤

<style>
  div{
   @apply text-gray-2;
  }
</style>
