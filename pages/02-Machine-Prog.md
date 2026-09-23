---
# You can also start simply with 'default'
theme: academic
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
# background: bg.jpg
# some information about your slides (markdown enabled)
title: "02-Machine-Prog"
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
coverBackgroundUrl: /02-Machine-Prog/cover.jpg
---

# 程序的机器级表示

Menghong Yu, EECS, PKU

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

---

# BombLab配置

在您的终端键入如下指令(请将下面的`User`替换为您的用户名,例如`s`+学号):

```bash
mkdir -p /home/User/.config/gdb
vim /home/User/.config/gdb/gdbinit
```

然后在打开的vim编辑器中输入`i`进入编辑模式, 复制如下配置:

```bash
set auto-load safe-path /
set breakpoint pending on
set disassemble-next-line on
b explode_bomb
b phase_1
b phase_2
b phase_3
b phase_4
b phase_5
b phase_6
```

点击`esc`退出编辑模式, 输入`:wq`退出.

---

# 基本概念

basic concepts

- Architecture（架构）{.font-bold}：也称为 ISA（指令集架构，Instruction Set Architecture）。
  
  指处理器设计的一部分，程序员需要了解，以便编写正确的汇编代码（asm Code）或机器码（Machine Code）。

  包括指令集规范（Instruction Set Specification）和寄存器（Registers）等。

- Assembly Code（汇编代码）{.font-bold}

  是机器码的文本表示形式，通常使用助记符和符号来代替二进制代码，以便程序员更容易理解和编写。

- Machine Code（机器码）{.font-bold}
  
  是处理器可以直接执行的字节级别程序。通常以二进制形式表示，是计算机硬件可以理解和执行的最低级别的指令。

---

# CISC(复杂指令集计算机) vs RISC(精简指令集计算机)

需要会，很喜欢考

<div grid="~ cols-2 gap-4">
  <div>

## RISC

- 指令集精简，单条指令完成较简单的操作
- 指令编码规则，通常使用定长指令
- 寻址方式简单
- 通常采用 load/store 结构：算术指令主要操作寄存器，访存由专门指令完成
- 不使用条件码
- 使用寄存器传递过程参数

代表：ARM, MIPS, RISC-V

  </div>
<div>

## CISC

- 指令种类丰富
- 指令执行时间可能较长
- 编码长度可变
- 寻址方式多样：`Imm(%base, %index, scale)`
- 可以对内存操作数运算
- 通常有条件码
- 传统上常使用栈传递过程参数

代表：IA32, x86-64

</div>
</div>

发展趋势是融合发展。请参考课本 p249-250。

我们学习的 Y86-64 既有 CISC 特性也有 RISC 特性。

<!--
抽学生分析 Y86 有什么 CISC 特性和 RISC 特性。

CISC：条件码，变长指令，用栈保存返回地址

RISC：寄存器传递过程参数，load/store来操作内存
-->

---

# 当你写完一段代码时，它如何起作用？

- 编译器工具链：将源代码逐步翻译成汇编代码和机器码，最终由 CPU 执行机器指令
  - 由于编译器在现代软件工程生态中的重要性, 保证编译器的正确性成了一个较热门的研究方向
  - 感兴趣的同学可以阅读《Formal Verification of a Realistic Compiler》
- 解释器：读取程序并按语言语义逐步执行，不一定先生成独立的机器码文件
- JIT编译：在运行期间把热点代码编译为机器码，以减少后续执行开销
  - 现代模型训练中有很多地方都使用了JIT编译优化，感兴趣的同学可以阅读《PyTorch 2: Faster Machine Learning Through Dynamic Python Bytecode Transformation and Graph Compilation》

---

# 编译器是如何工作的？

- 源程序（source program）：通常使用一个编程语言来编写
- 目标程序（target program）：通常表示为一个处理器的指令集
- 有时会借助中间表示（IR, Intermediate Representation）

![IR](/02-Machine-Prog/IR.png)


---

# 编译器是如何工作的？

![Compiler](/02-Machine-Prog/compiler.png)

---

# 从 C 源代码到汇编代码

from C source code to assembly code

```bash
gcc -Og -S hello.c
gcc -Og -c hello.c
gcc -O1 -o hello hello.c
gcc -O1 -o hello hello.o
```

- 使用 `-S` 指令可以生成 `.s` 汇编代码文本
- 使用 `-c` 选项可以生成 `.o` 可重定位目标文件（只编译、汇编，不链接，在第七章“链接”中会讲）
- 使用 `-Og/-O1/-O2/-O3` 指令可以指定编译器优化等级

<br>

```bash
objdump -d hello > hello.asm
```

- 使用 `objdump` 可以将二进制文件通过反汇编得到它的汇编代码文本

---

# 基本概念

basic concepts

CPU 直接执行的是 **机器码**{}。汇编代码是机器指令的文本表示，汇编器会将其编码为目标文件中的机器指令。

指令的内容包括内存读写操作、算术操作、控制操作等。

使用 Objdump 反编译一个二进制文件（在 Bomblab 你一定会用到）：

<div grid="~ cols-2 gap-12">
<div>



```bash
objdump -d bomb > bomb.asm
```

- `-d` 代表 disassemble，反汇编。
- `bomb` 是你要反汇编的二进制文件名。
- `> bomb.asm` 是将反汇编结果输出到 `bomb.asm` 文件中。

</div>

<div>

```asm
0000000000001000 <_init>:
    1000: f3 0f 1e fa                  	endbr64
    1004: 48 83 ec 08                  	subq	$8, %rsp
    1008: 48 8b 05 d9 5f 00 00         	movq	24537(%rip), %rax       # 0x6fe8 <_GLOBAL_OFFSET_TABLE_+0x118>
    100f: 48 85 c0                     	testq	%rax, %rax
    1012: 74 02                        	je	0x1016 <_init+0x16>
    1014: ff d0                        	callq	*%rax
    1016: 48 83 c4 08                  	addq	$8, %rsp
    101a: c3                           	retq
```


</div>
</div>

<!--
讲一下linux终端重定向I/O
-->

---

# 数据格式

data format

<div text="sm">

| C 声明     | Intel 数据类型 | 汇编代码后缀 (记忆) | 大小（字节） |
|------------|----------------|---------------|---------------|
| `char`       | 字节           | b (byte)             | 1             |
| `short`      | 字             | w (word)             | 2             |
| `int`        | 双字           | l (double word)             | 4             |
| `long`       | 四字           | q (quad word)             | 8             |
| `char*`      | 四字           | q (quad word)            | 8             |
| `float`      | 单精度         | s (single word)            | 4             |
| `double`     | 双精度         | l (double word)            | 8             |

</div>


<div class="text-sm text-gray-5">

记忆：byte, word, long word, quad word

</div>

---

# 程序计数器

Program Counter (PC)

- 程序计数器（PC）是一个寄存器，用于存储将要执行的**下一条指令**在内存中的地址
  - 为什么需要PC? 因为冯诺依曼架构: 存储程序原理
- 在 x86-64 中，程序计数器通常是 `%rip` 寄存器。
- 每当执行一条指令时，程序计数器会根据指令的长度自动更新，指向下一条指令的地址。

---

# 存储

storage

程序在运行时的存储主要有 **寄存器（条件码）**{.text-sky-5} 和 **内存**{.text-sky-5}。

- 内存可以抽象为按字节寻址的数组，地址宽度决定了可表示的地址范围。
- 通用寄存器可以看作运行过程中可快速访问的存储位置；部分寄存器具有硬件规定的用途，调用约定还会赋予通用寄存器特定角色。

---
layout: image-right
image: /02-Machine-Prog/runtime-memory.png
backgroundSize: 80%
---

# 栈

stack

栈在程序运行时具有很重要的作用，包括：

- **函数调用管理**：函数调用使用栈保存返回地址，并在需要时建立栈帧。
- **局部变量存储**：无法完全保存在寄存器中的局部数据可以放入栈帧；函数结束时通常通过恢复 `%rsp` 释放这部分空间。
- **控制流管理**：通过保存返回地址，确保函数调用结束后能正确返回调用点。


---
layout: image-right
image: /02-Machine-Prog/runtime-memory.png
backgroundSize: 80%
---

# 程序输出烫烫烫烫烫烫，是不是CPU过热？

hot!hot!hot!!!!!!!

- MSVC调试版中, 栈中的未用字节初始化为`0xCC`, 而"烫"字的GBK编码为`0xCCCC`.
- 同理, 堆中的未用字节初始化为`0xCD`, 而"屯"字的GBK编码为`0xCDCD`.


---
layout: image-right
image: /02-Machine-Prog/registers.png
backgroundSize: 80%
---

# 寄存器

Registers

**这个表要完整的记忆下来。**

<!--
后面开始依次分批介绍
-->

---

# 寄存器

Registers


- `%r[a-d]x` - `%e[a-d]x` - `%[a-d]x` - `%[a-d]l`

  Register / Extended / Lower-part

  - accumulator 累加寄存器 / **返回值**
  - base 基址寄存器
  - count 计数寄存器
  - data 数据寄存器

  记忆：只有 `[a-d]x` 的 Low-part 除了尾加 `l` 以外，还删掉了原有的 `x` 后缀

<!--
抽问学生这些是几字/几位
-->

---

# 寄存器

Registers

- `%r[s/d]i` - `%e[s/d]i` - `%[s/d]i` - `%[s/d]il`

  Register / Extended / Lower-part

  - source index 源索引寄存器
  - destination index 目的索引寄存器

  记忆：此处恢复正常，在 `[s/d]i` 后面直接加代表 low 的 `l` 后缀

---

# 寄存器

Registers

- `%r[b/s]p` - `%e[b/s]p` - `%[b/s]p` - `%[b/s]pl`

  Register / Extended / Lower-part

  - base pointer 栈基址寄存器
  - stack pointer 栈指针寄存器

  记忆：此处恢复正常，在 `[b/s]p` 后面直接加代表 low 的 `l` 后缀

---

# 寄存器

Registers

- `%r[8~15]` - `%r[8~15]d` - `%r[8~15]w` - `%r[8~15]b`

  Register / Double-word / Word / Byte

  - 命名非常规则

---

# 寄存器

Registers

<div grid="~ cols-2 gap-12">
<div>

### 被调用者保存寄存器

- `%rbx`
- `%rbp`
- `%r12` - `%r15`


### 调用者保存寄存器{.mt-10}

除了上述寄存器以及 `%rsp` 外，其余通用寄存器均为调用者保存寄存器。

</div>

<div>

什么是被调用者保存寄存器？

- 当一个函数 `B` 被另一个函数 `A` 调用时，被调用者 `B` 在处理过程中，有可能覆盖一些寄存器，然而这些寄存器对于恢复 `A` 的执行状态非常重要。
- 因此，在 `B` 的开始处，将这些寄存器中的值 **保存** 到栈中，在 `B` 的结束处，再将这些寄存器中的值从栈中 **恢复**。
- 所以，我们称这些寄存器为被调用者（`B`）保存寄存器。

</div>
</div>


---

# 寄存器

Registers

<div grid="~ cols-2 gap-12">
<div>

### 参数寄存器{.mb-4}

- `%rdi`：第一个参数
- `%rsi`：第二个参数
- `%rdx`：第三个参数
- `%rcx`：第四个参数
- `%r8`：第五个参数
- `%r9`：第六个参数

硬记吧，反正就 6 个。{.text-sm.text-gray-5}

</div>

<div>

### 其他参数

超过 6 个参数的函数调用，**使用栈传递**。

</div>
</div>


---

# 操作数指示符

operand indicator

操作数主要格式如下图。注意：
- 在 x86-64 中，基址和变址寄存器必须是 64 位寄存器 <span class="text-sm text-gray-5">（记忆：64 位系统）</span> → `(%eax)` 不合法
- 比例因子必须是 1、2、4、8 <span class="text-sm text-gray-5">（记忆：二进制）</span> → `(,%rax,3)` 不合法
- **特殊记忆：%rsp 不能作为变址寄存器**，即 `Imm(%base, %index, scale)` 中的 %index。

![operand](/02-Machine-Prog/operand.png){.h-70.mx-auto}

<!--
只要带了小括号的，都是指的访问内存；
为什么必须是 1，2，4，8？因为这是二进制！；
注意！立即数必须带上 \$，不带的话是认为内存地址的绝对值。比例变址寻址必须逗号要全。
-->

---

# Mov 类指令

`mov` instruction

<div text="sm">

| MOV S, D   | S→D    | 传送           |
|------------|--------|----------------|
| `movb`     |        | 传送字节       |
| `movw`     |        | 传送字         |
| `movl`     |        | 传送双字 <span class="text-sky-5">*</span>       |
| `movq`     |        | 传送四字       |
| `movabsq I, R` | I→R  | 传送绝对的四字|

</div>

- <span class="text-gray-5 text-sm">D 表示 destination / 目的地，S 表示 source / 源。</span>二者不能同时为内存
- 寄存器大小必须和指令后缀匹配。
- \*{.text-sky-5} `movl` 指令以寄存器为目的时，会将高位 4 字节清零。
- `movq` 只能处理 32 位立即数的源操作数，如果需要处理 64 位立即数只能使用 `movabsq`（想想为什么？）

<!--
不要搞反表达式
记住 source 和 destination
movq 指令编码的时候
-->

---

# Mov 类指令

`mov` instruction

<div text="sm" grid="~ cols-2 gap-12">

<div>

| S, R         | `movz`         |`movs`|
|--------------|--------------|-----------|
| 1→2          | `movzbw`       |`movsbw`|           
| 1→4          | `movzbl`       |`movsbl`|       
| 1→8          | `movzbq`       |`movsbq`|          
| 2→4          | `movzwl`       |`movswl`|       
| 2→8          | `movzwq`       |`movswq`|      
| 4→8          | `movl`{.text-sky-5}       |`movslq`|
| 4→8          | /       |`cltq`| 

</div>

<div text="base">

`cltq`：convert long to quad，将 `%eax` 符号扩展到 `%rax`，等价于 `movslq %eax, %rax`。

`s`：代表符号扩展，`z`：代表零扩展。

想想为什么没有 `movzlq`？

</div>

</div>

<!--
因为其等价于 `movl`
-->

---

# Mov 类指令

`mov` instruction

在 x86-64 下，以下哪个选项的说法是错误的？

- A. `movl` 指令以寄存器为目的时，会将该寄存器的高位 4 字节设置为 0
- B. `cltq` 指令的作用是将 `%eax` 符号扩展到 `%rax`
- C. `movabsq` 指令只能以寄存器为目的地
- D. `movswq` 指令的作用是将零扩展的字传送到四字节目的地

<!-- 很显然，选 D -->

---

# Mov 类指令

`mov` instruction

<style>
table {
  line-height: 1.6;
  font-size: 1rem;
}
table th, table td {
  padding: 6px 8px !important;
  vertical-align: middle;
}
</style>

| x86-64 汇编            | 错误原因               |
| ---------------------- | ---------------------- |
| `movb $0xF, (%ebx)`    | <div v-click> 基址寄存器应为 64 位  </div> |
| `movl %rax, (%rsp)`    | <div v-click> 应为 `movq` </div> |
| `movw (%rax), 4(%rsp)` | <div v-click> mov 类不能 M -> M </div> |
| `movb %al, %sl`        | <div v-click> 没有 `%sl` </div> |
| `movq %rax, $0x123`    | <div v-click> 反了 </div> |
| `movl %eax, %rdx`      | <div v-click> `movl` 和 `%rdx` 矛盾 </div> |
| `movb %si, 8(%rbp)`    | <div v-click> `movb` 应对应 `%sil` </div> |

<!--
1. rbx;  2. movl;  3. M->M (铺垫一下 arch）; 4. 没有sl; 5. 反了; 6. movl和%rdx;  7.movb和%si
-->


---

# 算数和逻辑操作

arithmetic and logical operations

<div grid="~ cols-2 gap-12">
<div text="sm">

| 指令   | 效果                    | 描述                     |
|--------|-------------------------|--------------------------|
| `LEAQ S D`  | D ← &S                 | 加载有效地址             |
| `INC D` | D ← D + 1               | 加 1                     |
| `DEC D` | D ← D - 1               | 减 1                     |
| `NEG D` | D ← -D                  | 取负                     |
| `NOT D` | D ← ~D                  | 取反（按位）                   |
| `ADD S D` | D ← D + S               | 加法                     |
| `SUB S D` | D ← D - S               | 减法                     |
| `IMUL S D` | D ← D * S               | 乘法                     |

</div>

<div text="sm">

| 指令   | 效果                    | 描述                     |
|--------|-------------------------|--------------------------|
| `XOR S D` | D ← D ^ S               | 按位异或                     |
| `OR S D` | D ← D \| S              | 按位或                       |
| `AND S D` | D ← D & S               | 按位与                      |
| `SAL k D` | D ← D << k              | 左移                     |
| `SHL k D` | D ← D << k              | 左移（与 SAL 相同）      |
| `SAR k D` | D ← D >> <span text="8px">A</span> k            | 算术右移                 |
| `SHR k D` | D ← D >> <span text="8px">L</span> k            | 逻辑右移                 |

</div>
</div>


---

# leaq 指令

leaq instruction

`leaq` 指令：load effective address，意为“加载有效地址”。**但实际上主要用于计算**{.text-sky-5}

- “加载”是取内存的意思，地址代表取值，相当于 C 中先 `*` 再 `&`，等于没与内存交互。

  所以 `leaq` 指令主要用于计算，比如 `leaq 7(%rdx,%rdx,4), %rax` 意为 `%rax = 7 + 5 * %rdx`

- `leaq` 支持多种寻址方法，但是要求 `D` 必须是寄存器
- `leaq` 不改变条件码（常考）


<div class="text-sm">


暗坑之省略也要加逗号：

```asm
leaq (%rdx, 1), %rdx
```

应当改为：

```asm
leaq (,%rdx,1), %rdx
```

</div>

---

# 移位操作

shift operation

移位量可以是一个立即数，或者放在单字节寄存器 `%cl`中。（为什么是放在单字节寄存器中呢？）

注意：只有这个寄存器可以存移位量！<span class="text-sky-5">（记忆：`cl` → count lower）</span>

左移（`SAL` / `SHL`）是等价的，但是右移会区分算术右移（`SAR`，前补符号位）和逻辑右移（`SHR`，前补 0）。

<!--
SHift Right, Shift Arithmetic Right
-->

---

# 特殊算数操作

special arithmetic operations

<div text="sm">

| 指令     | 效果                                            | 描述                  |
|----------|-------------------------------------------------|-----------------------|
| `imulq S`| `R[%rdx]:R[%rax] ← S × R[%rax]`               | 有符号全乘法          |
| `mulq S` | `R[%rdx]:R[%rax] ← S × R[%rax]`                | 无符号全乘法          |
| `cqto`   | `R[%rdx]:R[%rax] ← SignExtend(R[%rax])`       | 将 `%rax` 符号扩展为 128 位被除数 |
| `idivq S`| `R[%rax] ← dividend ÷ S; R[%rdx] ← dividend mod S` | 有符号除法；`dividend` 为原 `%rdx:%rax` |
| `divq S` | `R[%rax] ← dividend ÷ S; R[%rdx] ← dividend mod S` | 无符号除法；`dividend` 为原 `%rdx:%rax` |

</div>


一般这里只考搭配的是 `%rax` 和 `%rdx` 两个寄存器，且后者在乘法里是高位。`%rax` 在除法里用于存商（因为 `%rax` 一般用于返回结果，可以这么记）

---

# 条件码

condition code / flags

算术和逻辑指令执行后，通常会隐式修改以下 4 个**条件码**：

- ZF（Zero Flag）：当该次运算结果为 0 时被置为 1，否则置为 0
- SF（Sign Flag）：当运算结果的符号位（最高位）为 1 时被置为 1，否则置为 0
- CF（Carry Flag）：当两个 unsigned 类型的数作运算因 **进位/借位**{.text-sky-5} 而发生溢出时置为 1，否则置为 0
- OF（Overflow Flag）：当两个 signed 类型的数做运算而发生符号位溢出时置为 1，否则置为 0

---

# 进位和溢出的区分

CF and OF

- 对二进制加法（含用二补码表示的有符号加法）：
  - CF = 最高位之后产生的进位（carry-out of MSB）。
  - OF = “进位进入最高位” XOR “进位从最高位溢出”（carry_into_MSB ⊕ carry_out_of_MSB）。
等价的直观判定：如果两个被加数 符号位相同，且和的符号与它们不同，则 OF = 1。

- 对减法（`x − y`，可看作 `x + (~y + 1)`）：
  - CF = 1 表示发生了借位（等价于 unsigned 下 x < y）。
  - OF 的判定也可用符号法：如果被减数和减数 符号不同，且结果的符号与被减数不同，则 OF = 1。

---

# CF 和 OF：小练习

Exercise

下面考虑 8 位整数。

<div grid="~ cols-2 gap-12">
<div>

1. `0x7F + 0x01`
   <div v-click>

   - `0x80` (128 as unsigned, -128 as signed)
   - `CF = 0`
   - `OF = 1`
   </div>

2. `0x00 - 0x80`
   <div v-click>

   - `0x80`
   - `CF = 1`
   - `OF = 1`（`0 - (-128) = 128`，符号溢出）
   </div>
</div>

<div>

3. `0x00 - 0x01`
    <div v-click>

   - `0xFF`
   - `CF = 1`（无符号减法发生借位）
   - `OF = 0`（`0 - 1 = -1`，没有符号溢出）
   </div>

4. `0x80 - 0x01`
   <div v-click>

   - `0x7F`
   - `CF = 0`（无符号 `128 - 1 = 127`）
   - `OF = 1`（`-128 - 1 = -129`，溢出）
   </div>

</div>

</div>


---

# 条件码

condition code / flags

设置条件码的细节：
- `leaq` 指令不改变任何条件码
- 逻辑操作（`AND`、`OR`、`XOR`）会把 `CF` 和 `OF` 设置成 0, `NOT`不影响任何标志码
- 移位量非零时，移位操作会把 `CF` 设置为最后一个被移出的位
- 右移 1 位时，`SAR` 将 `OF` 清零，`SHR` 将 `OF` 设置为原最高位；移位量大于 1 时 `OF` 未定义
- 左移 1 位时，`OF = MSB(result) XOR CF`；移位量大于 1 时 `OF` 未定义
- `INC` 和 `DEC` 会更新 `OF`、`SF`、`ZF`、`AF` 和 `PF`，但不会改变 `CF`

---

# 条件码指令

`cmpq` and `testq`

<div grid="~ cols-2 gap-12">
<div>

### `cmpq s1, s2`

包括 `cmpb` / `cmpw` / `cmpl` / `cmpq`

计算 `s2 - s1`，但不同于 `subq` 会修改 `s2` 的值，`cmpq` 只会影响条件码的值{.text-sky-5}。

注意顺序！记忆：大多数指令都是源操作数在前，目的操作数在后

</div>

<div>

### `testq s1, s2`

包括 `testb` / `testw` / `testl` / `testq`

计算 `s1 & s2`，<span text="sky-5">同样只会影响条件码的值</span>。

</div>
</div>

---

# 条件码指令

`setX`

我们并不能直接访问 Condition Codes，但我们可以用指令 `setX` 来间接的获取它们的值。

| setX        | 操作          | 描述               |
| ----------- | ------------------ | -------------- |
| `sete D`      | `D ← ZF`              | 等于 0 时设置|
| `setne D`     | `D ← ~ZF`             | 不等于 0 时设置|
| `sets D`      | `D ← SF`              | 负数时设置|
| `setns D`     | `D ← ~SF`             | 非负数时设置|

需要注意的是，`setX` 只会将最低的 1 个 Byte 置为相应的值，其他 Byte 保持不变！

Q：如果想要设置全部 8 Byte，该使用什么指令？ <span v-click>A：`movzbl` / `movzbq`</span>

<!--
movzbl movzbq
-->

---

# 条件码指令

`setX`

| setX        | 操作          | 描述               |
| ----------- | ------------------ | -------- |
| `setg D`  | `D ← ~(SF^OF)&~ZF` | 大于（有符号）          |
| `setge D` | `D ← ~(SF^OF)`     | 大于或等于（有符号） |
| `setl D`  | `D ← (SF^OF)`      | 小于（有符号）             |
| `setle D` | `D ← (SF^OF)\|ZF`  | 小于或等于（有符号）    |
| `seta D`  | `D ← ~CF&~ZF`      | 大于（无符号）          |
| `setb D`  | `D ← CF`           | 小于（无符号）          |

<!--
只需要记住一个，剩下的都可以推
-->

---

# 小于条件的证明

proof of `setl`

`cmp b a`当 $a < b$ 时，有两种情况：

<div grid="~ cols-2 gap-12">
<div>

1. **有溢出的情况**：
   - 条件： $a < b$ 且 $(a - b)_{\text{补码}} > 0$
   - 结果：会发生负溢出
   - 标志位： $OF = 1, SF = 0$

</div>

<div>

2. **无溢出的情况**：
   - 条件： $a < b$ 且 $(a - b)_{\text{补码}} < 0$
   - 结果：不会发生溢出
   - 标志位： $OF = 0, SF = 1$（负数）

</div>
</div>

由此，判断是否小于，可以用异或表达式 `OF ^ SF` 来表示。

而且，我们无法直接获得 `OF` 的值。


---

# 跳转指令

jumping instruction

<div grid="~ cols-2 gap-12">
<div>

### 直接跳转

```asm
Label:
  ...
  jmp Label
```

跳转目标作为指令的一部分编码，要定义 `Label`

`Label` 是汇编符号；汇编器和链接器会把它解析为相对位移或相应的重定位信息

</div>

<div>

### 间接跳转

```asm
jmp *Operand    e.g. jmp *%rax ; jmp *(%rax)
```

跳转目标是从寄存器或内存位置中读出的，有一个类似先前 `mov` 指令中介绍的取值表达式

在后面介绍的 `switch` 跳转表中会用到！

</div>
</div>

---

# 跳转指令的编码

encoding of jumping instruction


<div grid="~ cols-2 gap-12 gap-y-4">
<div>

### PC 相对的（PC-relative）

将目标指令的地址与紧跟在跳转指令后面那条指令的地址之间的差作为编码

- 当执行 `PC` 相对寻址时，**程序计数器的值是跳转指令后面的那条指令的地址**{.text-sky-5}
- 在 x86-64 的常见近跳转编码中，地址偏移量为 **1 或 4**{.text-sky-5} 个字节，按有符号数解释

好处：

- 指令编码更简洁：短跳转使用 1 字节位移，常见近跳转使用 4 字节位移；整条指令还包括操作码等字段
- 代码可以不做任何改变就移到内存中不同的位置


</div>

<div>

### 间接指定绝对目标

x86-64 的近直接跳转通常编码为相对位移。若要跳转到寄存器或内存中保存的任意绝对地址，应使用 `jmp *Operand` 形式的间接跳转。

</div>
</div>

---

# PC 相对的跳转指令的编码

encoding of PC-relative jumping instruction

注意，其中一个加数的是 **下一条指令**{.text-sky-5} 的地址！

![jmp-offset](/02-Machine-Prog/jmp-offset.png){.h-90.mx-auto}

---

# PC 相对的跳转指令的编码

encoding of PC-relative jumping instruction

在如下代码段的跳转指令中，目的地址是？

```asm
400020: 74 F0     je ____
400022: 5d        pop %rbp
```
<div v-click>


- `je` 指令：1 字节操作码 + 1 字节偏移量
- 偏移量范围：-128 到 +127（共256个字节）

`0xF0` 是一个负数，我们使用 `-x = ~x + 1` 来快速准确转换

`~0xF0 = 0x0F, 0x0F + 1 = 0x10`

`0x400022 - 0x10 = 0x400012`

</div>

<!--
-x = ~x + 1, ~0xF0+1 = 0x10, 400022-0x10 = 400012
-->

---

# 条件跳转指令

conditional branches & jumping

以 `.Expr:` 的格式定义跳代码块后，可以利用 `jX` 指令跳转到指定的代码位置。

利用不同的 jumping 指令（定义类似之前的 `setX` 指令），我们可以实现条件分支。

<div grid="~ cols-2 gap-6" text="sm">
<div>

| jX        | 条件          |
| --------- | --------------|
| `jmp`     | `1`           |
| `je`      | `ZF`          |
| `jne`     | `~ZF`         |
| `js`      | `SF`          |
| `jns`     | `~SF`         |

</div>

<div>

| jX        | Condition      |
| --------- | ---------------|
| `jg`      | `~(SF^OF)&~ZF` |
| `jge`     | `~(SF^OF)`     |
| `jl`      | `(SF^OF)`      |
| `jle`     | `(SF^OF)\|ZF`  |
| `ja`      | `~CF&~ZF`      |
| `jb`      | `CF`           |

</div>
</div>

---

# 条件跳转指令示例

conditional branches example

<div grid="~ cols-2 gap-12">
<div>


```c
long absdiff(long x, long y) {
    long result;
    if(x > y) result = x-y;
    else result = y-x;
    return result;
}
```

<br>

```asm
absdiff:
    cmpq %rsi, %rdi  # x:y
    jle .L4
    movq %rdi, %rax
    subq %rsi, %rax
    ret
.L4:       # x <= y
    movq %rsi, %rax
    subq %rdi, %rax
    ret
```

</div>

<div>

等价的 `goto` 版本：

```c
long absdiff_goto(long x, long y){
    long result;
    if(x > y) goto x_gt_y;
    result = y-x;
    return result;
x_gt_y:
    result = x-y;
    return result;
}
```

注意这里对 `if else` 的转写，在 Archlab 中会用到！


</div>
</div>


---

# 条件传送指令

`cmov` (conditional move) instruction

`cmovX S, R`：当条件码 `X` 满足时，将源寄存器或内存操作数的值 `S` 传送到目的寄存器 `R`

- **不支持单字节的条件传送**{.text-sky-5}
- 汇编器可以从目标寄存器的名字推断出条件传送指令的操作数长度，而无需显式写出（Diff：`movw`、`movl`、`movq`）
- 与流水线预测有关（第四章会学），并不总会提升效率

---

# 条件传送的适用条件

conditional move applicable conditions

只有当两个表达式（then-expr 和 else-expr）都很容易计算时，GCC才会使用条件传送

一些不会使用条件传送的情况：

<div text="sm">

1. 表达式的求值需要大量的运算
2. 表达式的求值可能导致错误

    ```c
    val = p ? *p : 0;
    ```

    在这个式子中，涉及指针的解引用操作，有可能会导致错误，如 `p` 为空指针

3. 表达式的求值可能导致副作用

    ```c
    val = x > 0 ? x *= 7 : x += 3;
    ```

    这两个操作都会修改`x`的值，称为副作用。条件传送要求在硬件层面一次性完成选择操作，而不能处理带有副作用的表达式。
    
    如果使用条件传送，无法保证 `x` 的修改只发生在条件满足的情况下。

</div>

<!--
讲一下分支预测错误会发生什么

一般适用场景

分支条件简单，代价小

当条件计算本身非常快（例如 cmp eax, ebx），但分支预测可能会失败时，用 cmov 代替 if/else 可以避免预测失败。

条件结果分布不均衡/难预测

如果某个条件的结果是“均匀分布”的（例如 50% true / 50% false），分支预测准确率可能会低。

此时用 cmov 能避免预测开销。

赋值操作便宜

cmov 只是一次寄存器到寄存器的移动，不涉及复杂计算。

如果赋值代价大，可能还不如分支跳转。

代码需要避免分支（如加密/并行算法）

在一些场景（比如加密算法、SIMD-friendly 代码），使用条件传送避免分支可以减少 执行时间差异，提高安全性或并行效率。

不适合的情况

条件极其偏向某一侧（例如 99% 情况走 true）：
分支预测准确率高，用普通 if 可能更快。

被保护的操作代价大：
cmov 两边的值都要提前计算好，而分支可以只计算一边。
-->

---

# 条件传送的适用条件

conditional move applicable conditions

对于下列四个函数，假设 gcc 开了编译优化，判断 gcc 是否会将其编译为条件传送

<div grid="~ cols-2 gap-4">
<div>

```c
long f1(long a, long b) {
    return (++a > --b) ? a : b;
}
```

</div>

<div>

```c
long f2(long *a, long *b) {
    return (*a > *b) ? --(*a) : (*b)--;
}
```

</div>
<div>

```c
long f3(long *a, long *b) {
    return a ? *a : (b ? *b : 0);
}
```

</div>

<div>

```c
long f4(long a, long b) {
    return (a > b) ? a++ : ++b;
}
```

</div>
</div>

你可以使用 [在线编译器](https://godbolt.org/) 来验证！（注意别在你的 ARM 设备上试，会不一样）

<div v-click text="sm">

- `f1` 由于比较前计算出的 `a` 与 `b` 就是条件传送的目标，因此会被编译成条件传送；
- `f2` 会修改被选中指针指向的元素，因此会被编译成条件跳转；
- `f3` 由于指针 `a` 可能无效，因此会被编译为条件跳转；
- `f4` 会被编译成条件传送，注意到 `a` 和 `b` 都是局部变量，return 的时候对 `a` 和 `b` 的操作都是没有用的。

</div>

<!--
- `f1` 由于比较前计算出的 `a` 与 `b` 就是条件传送的目标，因此会被编译成条件传送；
- `f2` 会修改被选中指针指向的元素，因此会被编译成条件跳转；
- `f3` 由于指针 `a` 可能无效，因此会被编译为条件跳转；
- `f4` 会被编译成条件传送，注意到 `a` 和 `b` 都是局部变量，return 的时候对 `a` 和 `b` 的操作都是没有用的。
-->

---

# do-while 循环

do-while loop

<div grid="~ cols-2 gap-12">
<div>


```c
do
    body-statement
while (test-expr);
```

此语法结构决定了循环体至少执行一次。

</div>

<div>

```c
loop:
    body-statement
    t = test-expr;
    if (t)
        goto loop;
```

</div>
</div>

<div grid="~ cols-2 gap-12">
<div>

```c
long fact_do(long n) {
    long result = 1;
    do {
        result *= n;
        n = n - 1;
    } while (n > 1);
    return result;
}
```

</div>

<div>


```asm
; long fact_do(long n)
; n 存储在 %rdi
fact_do:
    movl $1, %eax       ; 初始化 result = 1
.L2:
    imulq %rdi, %rax    ; 计算 result *= n
    subq $1, %rdi       ; 计算 n = n - 1
    cmpq $1, %rdi       ; 比较 n : 1
    jg .L2              ; 如果 n > 1，跳转到 .L2
    rep; ret            ; 返回
```

</div>
</div>

---

# while 循环

while loop

<div grid="~ cols-2 gap-12">
<div>


```c
while (test-expr)
    body-statement
```

</div>

<div>


```c
goto test;
loop:
    body-statement
test:
    t = test-expr;
    if (t)
        goto loop;
```

</div>
</div>

<div grid="~ cols-2 gap-12">
<div>

```c
long fact_while(long n) {
    long result = 1;
    while (n > 1) {
        result *= n;
        n = n - 1;
    }
    return result;
}
```

</div>

<div>

```asm
; long fact_while(long n)
; n 存储在 %rdi
fact_while:
    movl $1, %eax       ; 初始化 result = 1
    jmp .L5             ; Goto test
.L6:
    imulq %rdi, %rax    ; 计算 result *= n
    subq $1, %rdi       ; 计算 n = n - 1
.L5:
    cmpq $1, %rdi       ; 比较 n : 1
    jg .L6              ; 如果 n > 1，跳转到 .L6
    rep; ret            ; 返回
```

</div>
</div>

<!--
这个是 jump to middle
-->

---

# while 循环 - guarded do

while loop - guarded do

<div grid="~ cols-2 gap-12">
<div>

```c
t = test-expr;
if (!t)
    goto done;
loop:
    body-statement
    t = test-expr;
    if (t)
        goto loop;
done:
```

```c
long fact_while(long n) {
    long result = 1;
    while (n > 1) {
        result *= n;
        n = n - 1;
    }
    return result;
}
```

</div>

<div>

```asm
; long fact_while(long n)
; n 存储在 %rdi
fact_while:
    cmpq $1, %rdi       ; 比较 n : 1
    jle .L7             ; 如果 <=, 跳转到 done
    movl $1, %eax

.L6:
    imulq %rdi, %rax    ; 计算 result *= n
    subq $1, %rdi       ; 计算 n = n - 1
    cmpq $1, %rdi       ; 比较 n : 1
    jne .L6             ; 如果 n != 1，跳转到 .L6
    rep; ret            ; 返回
.L7:
    movl $1, %eax       ; 计算 result = 1
    ret                 ; 返回
```

</div>
</div>

<!--
guarded-do 的好处

1. 避免多余跳转（fall-through 更自然）

jump-to-middle 方式需要额外的一条无条件跳转来进入条件检查。

guarded-do 在一开始就测试条件，若不满足直接退出，否则顺势进入循环体 → 更少跳转指令，提高效率。

2. 分支预测更友好

硬件通常假设「前向跳转不 taken，后向跳转 taken」。

guarded-do 的循环结构是「条件失败 → 前向跳转退出，成功 → 后向跳转回头」，符合硬件预测模式。

jump-to-middle 里，第一次那条无条件前向跳转可能影响预测。

3. 入口更统一

guarded-do 代码入口就是循环条件，逻辑清晰。

jump-to-middle 的入口需要「跳过去」，让控制流图有点不直观。

4. 优化更容易

guarded-do 的条件检查位置固定在循环入口，方便编译器做 循环不变式外提、边界检查消除 等优化。

jump-to-middle 的“先跳再测”结构相对绕一些。
-->

---

# for 循环

for loop

```c
for (init-expr; test-expr; update-expr)
    body-statement
```

只需转换为 while 循环：

```c
init-expr;
while (test-expr) {
    body-statement
    update-expr;
}
```

---

# Switch 语句

switch statement

使用跳转表的场景：

- 当开关情况数量比较多（例如 4 个以上）
- 值的范围跨度比较小时（数据的极差不能过大）

优点：执行开关语句的时间与开关情况的数量无关。可以看做一种用空间换时间的策略

具体实现：

- 在 `.rodata`（只读数据）段中，用连续的地址存放一张跳转表，跳转表中的每一个表项对应了 switch 的一个分支代码段的所在地址
- 在 `switch` 对应的汇编代码段中，用 `jmp *JumpTab[x]` 间接跳转的方式跳转到对应的分支

简便理解：在一段特定的内存空间（跳转表）中，连续存放了多个跳转指令起始入口的地址，然后通过间接跳转的方法，根据当前的 `case` 值，跳转到对应的 `case` 代码段中。


---
layout: image-right
image: /02-Machine-Prog/stack.png
backgroundSize: 60%
---

# 栈

stack

- 栈从高地址向低地址增长 <span class="text-sky-5">（向下增长）</span>
- `%rsp` 表示栈中最低地址元素所在的位置（栈顶）
- `%rbp` 表示当前栈帧中一个锚点
- 超过 6 个参数的函数调用，使用栈传递参数

回忆一下，第 1~6 个参数分别使用哪些寄存器传递？

<div v-click>

`%rdi`，`%rsi`，`%rdx`，`%rcx`，`%r8`，`%r9`

</div>



---

# 栈的数据操作

stack data operation

| 指令        | 影响                                      | 描述               |
|-------------|-----------------------------------------|--------------------|
| `pushq S`     | `R[%rsp] ← R[%rsp] - 8; M[R[%rsp]] ← S`   | 压入四字（quad）数据 |
| `popq D`      | `D ← M[R[%rsp]]; R[%rsp] ← R[%rsp] + 8`   | 弹出四字（quad）数据 |

注意顺序！（其实这个顺序也很好理解，`stk[++top] = a` 和 `a = stk[top--]` 罢了）

但是需要注意的是，**对于操作数是 `%rsp` 的时候**，问题就不是那么简单了。

思考一下 `pushq %rsp` 和 `popq %rsp` 的时候会发生什么

- pushq %rsp 压的是 %rsp 的旧值；
- popq %rsp 是将栈指针设置为栈顶读出来的值

可以参考课本 p255-256 练习题 4.7 和 4.8, 我们讲Arch的时候还会细讲


---

# 栈的数据操作

stack data operation

![push-pop](/02-Machine-Prog/push-pop.png){.h-90.mx-auto}


---

# 过程

procedure

过程是软件设计中的重要抽象概念，它提供了一种封装代码的方式。通过指定的参数和可选的返回值来实现某个特定功能。

深入到机器层面，过程基于如下机制：

- **传递控制**：在进入过程 Q 的时候，程序计数器必须被设置为 Q 的代码的起始地址，然后在返回时，要把程序计数器设置为 **P 中调用 Q 后面那条指令**{.text-red-5} 的地址。
- **传递数据**：P 必须能够向 Q 提供一个或多个参数，Q 必须能够向 P 返回一个值。
- **分配和释放内存**：在开始时，Q 可能需要为局部变量分配空间，而在返回前，又必须释放这些存储空间。

---

# 运行时栈

runtime stack

C 语言过程调用依赖于运行时栈进行数据和指令管理。

- **过程栈帧**：函数在需要栈空间时会分配栈帧，用于保存局部数据、部分参数和寄存器等；函数调用还会在栈上保存返回地址。
- **栈帧管理**：函数可通过调整 `%rsp`，并按需使用 `push` / `pop` 或普通访存指令来管理栈上数据。

    栈帧不是必要的；寄存器不足、局部变量取地址或需要保存寄存器时会使用栈空间。

- **栈顶与栈底**：通过调整栈顶指针 `%rsp` 和栈底指针 `%rbp` 来管理栈帧。

    注意，栈顶在低地址，栈底在高地址，栈是向下增长的。

---

<div grid="~ cols-2 gap-12">
<div>

# x86-64 的栈结构

stack structure in x86-64

1. **栈帧布局**：
   - **参数构造区**：存放函数构造的参数
   <br>看图的上面，参数 7~n 就是 P 的参数构造区，注意顺序{.text-gray-5.text-sm}
   - **局部变量区**：用于函数临时构造的局部变量。
   - **被保存的寄存器**：用于保存调用过程中使用到的寄存器状态
   <br><div text-gray-5 text-sm>被调用者保存寄存器： `%rbp` `%rbx` `%r12` `%r13` `%r14` `%r15`</div>
   - **返回地址**：`call` 压入的下一条指令地址，位于调用者与被调用者栈帧的边界处，供 `ret` 使用
   - **对齐**：栈帧的地址必须是 16 的倍数
   <br>16 字节对齐，Attacklab 会用到哦{.text-gray-5.text-sm}

</div>

<div>

![栈帧结构图](/02-Machine-Prog/stack-frame.png){.h-110.mx-auto}

</div>
</div>

<!--
参数构造区：准备调用新的过程
-->

---

<div grid="~ cols-2 gap-12">
<div>

# x86-64 的栈结构

stack structure in x86-64

2. **栈顶管理**：使用 `push` 和 `pop` 指令进行数据的压栈和出栈管理。
3. **帧指针和栈指针**：使用寄存器 `%rbp` 和 `%rsp` 定位和管理栈帧。

</div>

<div>

![栈帧结构图](/02-Machine-Prog/stack-frame.png){.h-110.mx-auto}

</div>
</div>

---

# 转移控制

transfer control

转移控制是将程序的执行流程从一个函数跳转到另一个函数，并在完成任务后返回原函数。

- 指令层面，从函数 P 跳转到函数 Q，只需将程序计数器（PC）设置为 Q 的起始地址。
- 参数/数据层面，则需要通过栈帧 / 寄存器来传递。

---

# call 和 ret 指令

`call` and `ret` instructions

在x86-64体系中，这个转移过程通过指令 `call Q` 和 `ret` 来完成：

- `call Q`：调用 Q 函数，并将返回地址压入栈，返回地址是 `call` 指令的下一条指令的地址。
- `ret`：从栈中弹出压入的返回地址，并将 PC 设置为该地址。

这样，程序可以在函数间跳转，并能够正确返回。

<div grid="~ cols-2 gap-12">

<div>

### `call` 指令

- `call Label`： 直接调用，目标为标签地址
- `call *Operand`： 间接调用，目标为寄存器或内存中的地址
- 思考：什么时候会用到间接调用？
- <div v-click> 函数指针 </div>

</div>

<div>

### `ret` 指令

- 执行返回，将返回地址从栈中弹出并跳转

</div>

</div>

---

# call 和 ret 指令

`call` and `ret` instructions 

![call 和 ret 指令](/02-Machine-Prog/call-and-ret.png){.h-65.mx-auto}

观察：

- 压栈后，`%rsp` -8，压入的是 `%rip` 下一条指令地址
- 弹栈后，`%rsp` +8，弹出的是栈帧中的内容，和当前运行时的 `%rip` 无关


---

# 小测试

quiz

下面关于布尔代数的叙述，错误的是：

- A. 设 `x, y, z` 是整型，则 `x^y^z == y^z^x`
- B. 若允许使用“全 1”常量，任意逐位布尔运算都可以由与运算 (`&`) 和异或运算 (`^`) 组合得到
- C. 设 `m, n` 是 `char*` 类型的指针，则下面三条语句 `*n = *m^*n; *m = *m^*n; *n = *m^*n;` 可以交换 `*m` 和 `*n` 的值
- D. 已知 `a, b` 是无符号整型，且 `a+b+1==0` 为真，则 `a^b+1==0` 为真

<div v-click>

A. 正确，考虑每个 bit 的最终结果只和 `x, y, z` 的对应 bit 有多少个 0、多少个 1 有关，而和异或顺序无关

B. 正确。记 `ALL_ONES` 为与操作数等宽的全 1 常量，则 `~A = A ^ ALL_ONES`，并可由德摩根律构造 `A | B = ~(~A & ~B)`。

C. 错误，因为 `m` 和 `n` 可能指向同一个地址，所以第一句话直接置零了。但对于其他情况，是对的。

D. 正确，这个非常离谱，下一页 PPT 单独讲。

</div>

<!--
A. 正确，考虑每个 bit 的最终结果只和 `x, y, z` 的对应 bit 有多少个 0、多少个 1 有关，而和异或顺序无关

B. 正确。允许全 1 常量后，可以用异或构造按位取反，再结合与运算构造其他逐位布尔运算。

C. 错误，因为 `m` 和 `n` 可能指向同一个地址，所以第一句话直接置零了。但对于其他情况，是对的。

D. 正确，注意运算符优先级问题
-->

---

# 小测试

quiz

- D. 已知 `a, b` 是无符号整型，且 `a+b+1==0` 为真，则 `a^b+1==0` 为真

第一层理解：如果先按直觉给右式加上括号，前提在无符号模运算下给出 `a + b == UINT_MAX`，因此 `a == ~b`，从而 `(a ^ b) + 1 == 0`。

第二层理解：右式没有括号。根据 [优先级表](https://c-cpp.com/c/language/operator_precedence)，计算优先级为 `+` > `==` > `^`，所以实际表达式是 `a ^ ((b + 1) == 0)`，需要重新判断。

第三层理解：在第二层理解上再次思考，考虑了优先级后，何时 `a^((b+1)==0)` 为假？

该异或表达式只有在 `a` 等于布尔值 `0` 或 `1` 时才可能为 0；同时前提给出 `a + b == UINT_MAX`。

<div grid="~ cols-2 gap-12">
<div>

`a = 1`，则 `b = UINT_MAX - 1`，所以 `(b + 1) == 0` 为假，最终 `a ^ 0 == 1`。

</div>

<div>

`a = 0`，则 `b = UINT_MAX`，所以 `(b + 1) == 0` 为真，最终 `a ^ 1 == 1`。

</div>
</div>

所以，此选项仍然正确。

---

# 思考题

Machine Prog: Basics


1. 为什么在寄存器上读、写数据时不需要再考虑大端法和小端法的区别？
1. 为什么内存寻址的 `S (scale)` 参数总是 1，2，4 或者 8？

<!--
S 只需要占两个比特位，1，2，4，8对应 byte, word, dword, qword，方便数组寻址。对于任意缩放倍率，不实用，复杂性高。
-->

---

# 思考题

Machine Prog: Control

1. 如何对一个寄存器较高的字节赋值，同时不改变较低的字节？
2. 为什么不建议使用条件赋值？
3. C 语言中三种循环形式 (`for`，`while`，`do-while`)，理论上哪种效率更高？
4. 为什么 C 语言中的 `switch` 语句需要在每个分支后 `break` 才能退出？

<!--
有一些专门针对寄存器高位的，不展开。或者可以使用掩码，利用你在datalab的知识。三种循环编译后都一样的，不存在效率差别。switch-case语句的 fall-through语义，看编译的结果就能看出来。
-->


---

# 数据传送

data transfer

<div grid="~ cols-2 gap-12">
<div>

- 前 6 个参数：通过寄存器传递
    - `%rdi` `%rsi` `%rdx` `%rcx` `%r8` `%r9`
- 剩余的参数：通过栈传递
    - 参数 7 在栈顶（低地址）
    - 参数构造区向 8 对齐

![参数构造区](/02-Machine-Prog/params.png){.h-55.mx-auto}

</div>

<div>

#### C 代码

```c
void proc(long a1, long *a1p, int a2, int *a2p,
short a3, short *a3p, char a4, char *a4p) {
    *a1p += a1;
    *a2p += a2;
    *a3p += a3;
    *a4p += a4;
}
```

<br>

#### 生成的汇编代码

```asm
proc:
    movq 16(%rsp), %rax  # 取 a4p (64 位)
    addq %rdi, (%rsi)    # *a1p += a1 (64 位)
    addl %edx, (%rcx)    # *a2p += a2 (32 位)
    addw %r8w, (%r9)     # *a3p += a3 (16 位)
    movl 8(%rsp), %edx   # 取 a4 (8 位)
    addb %dl, (%rax)     # *a4p += a4 (8 位)
    ret
```

</div>
</div>

---

<div grid="~ cols-2 gap-12">
<div>

# 栈上的局部存储

local storage on the stack


有时，局部数据必须在内存中：

- 寄存器不够用
- 对一个局部变量使用地址运算符 `&`（因此必须能够为它产生一个地址，而不能放到寄存器里）
- 是数组或结构（要求连续、要求能够被引用 `&` 访问到）

注意，生长方向与参数构造区相反！

```c
long call_proc() {
    long x1 = 1; int x2 = 2;
    short x3 = 3; char x4 = 4;
    proc(x1, &x1, x2, &x2, x3, &x3, x4, &x4);
    return (x1 + x2) * (x3 - x4);
}
```

</div>

<div class="">

```asm {*}{maxHeight:'480px'}
call_proc:
    # 设置 proc 的参数
    subq $32, %rsp          # 分配 32 字节的栈帧
    movq $1, 24(%rsp)       # 将 1 存储在 &x1
    movl $2, 20(%rsp)       # 将 2 存储在 &x2
    movw $3, 18(%rsp)       # 将 3 存储在 &x3
    movb $4, 17(%rsp)       # 将 4 存储在 &x4
    leaq 17(%rsp), %rax     # 创建 &x4
    movq %rax, 8(%rsp)      # 将 &x4 作为参数 8 存储
    movl $4, (%rsp)         # 将 4 作为参数 7 存储
    leaq 18(%rsp), %r9      # 将 &x3 作为参数 6
    movl $3, %r8d           # 将 3 作为参数 5
    leaq 20(%rsp), %rcx     # 将 &x2 作为参数 4
    movl $2, %edx           # 将 2 作为参数 3
    leaq 24(%rsp), %rsi     # 将 &x1 作为参数 2
    movl $1, %edi           # 将 1 作为参数 1

    # 调用 proc
    call proc

    # 从内存中检索更改
    movslq 20(%rsp), %rdx   # 获取 x2 并转换为 long
    addq 24(%rsp), %rdx     # 计算 x1 + x2
    movswl 18(%rsp), %eax   # 获取 x3 并转换为 int
    movsbl 17(%rsp), %ecx   # 获取 x4 并转换为 int
    subl %ecx, %eax         # 计算 x3 - x4
    cltq                    # 转换为 long
    imulq %rdx, %rax        # 计算 (x1 + x2) * (x3 - x4)
    addq $32, %rsp          # 释放栈帧
    ret                     # 返回

```

</div>
</div>

<!--
代码建议大家课后读一下，书上也有，主要是要理解怎么算的
-->

---

# 寄存器上的局部存储

local storage on registers

<div grid="~ cols-2 gap-12">
<div>

###### Pro

被调用者 / 保存{.text-red-5}



</div>

<div>

###### Con

被 / 调用者保存



</div>
</div>

被调用者保存寄存器：`%rbx` `%rbp` `%r12` `%r13` `%r14` `%r15`

其他寄存器，**再除外 `%rsp`**{.text-red-5}， 均为 “调用者保存” 寄存器

---

# 指针运算

pointer arithmetic

<div grid="~ cols-3 gap-12">

<div>


注意步长！

指针的加减会按照所指类型的大小缩放。数组名在大多数表达式中会转换为指向首元素的指针，因此可参与相同的指针运算。

> 如 `int*` 加减的步长是 `int` 的大小，即 4

同一个数组中的两个指针可以相减，结果等于两个地址之差 **除以元素大小**{.text-red-5}。

> 看最后一个示例

</div>


<div grid="col-span-2">

<div text="xs">

| 表达式         | 类型      | 值                   | 汇编代码                         |
|--------------|---------|---------------------|---------------------------------|
| `E`            | `int*`    | $x_E$                 | `movq %rdx, %rax`                |
| `E[0]`         | `int`     | $M[x_E]$              | `movl (%rdx), %eax`              |
| `E[i]`         | `int`     | $M[x_E + 4i]$        | `movl (%rdx, %rcx, 4), %eax`    |
| `&E[2]`        | `int*`    | $x_E + 8$             | `leaq 8(%rdx), %rax`             |
| `E + i - 1`    | `int*`    | $x_E + 4i - 4$       | `leaq -4(%rdx, %rcx, 4), %rax`   |
| `*(E + i - 3)` | `int`     | $M[x_E + 4i - 12]$   | `movl -12(%rdx, %rcx, 4), %eax`  |
| `&E[i] - E`    | `long`    | i                   | `movq %rcx, %rax`                |

</div>

</div>

</div>

---

# 数组分配和访问

array allocation and access

数组声明如：

```c
T A[N];
```

其中 T 为数据类型，N 为整数常数。

初始化位置信息：

- 在内存中分配一个 $L \times N$ 字节的 **连续区域**{.text-sky-5}，$L$ 为数据类型 $T$ 的大小（单位为字节）。
- 引入标识符 $A$，可以通过指针 $x_A$ 访问数组元素。

访问公式：

$$
\&A[i] = x_A + L \cdot i
$$

数组名本身不是指针常量；它是数组对象的标识符，在大多数表达式中会转换为指向首元素的指针。{.text-red-5}



---

# 数组分配和访问

array allocation and access

<div grid="~ cols-3 gap-12">
<div>



如下声明的数组：

```c
char A[12];
char B[8];
int C[6];
double D[5];
```

</div>

<div grid="col-span-2">

这些声明会生成带有以下参数的数组：

| 数组 | 元素大小 | 总的大小 | 起始地址 | 元素 `X[i]` 的地址 |
|------|----------|----------|----------|--------|
| A    | `char`：1        | 12       | $x_A$       | $x_A + i$ |
| B    | `char`：1        | 8        | $x_B$       | $x_B + i$ |
| C    | `int`：4        | 24       | $x_C$       | $x_C + 4i$|
| D    | `double`：8        | 40       | $x_D$       | $x_D + 8i$|

</div>
</div>

---

# 数组分配和访问

array allocation and access


假设 `E` 是一个 `int` 型数组，其地址存放在寄存器 `%rdx` 中，`i` 存放在寄存器 `%rcx`，那么 `E[i]` 的汇编代码为：

```asm
movl (%rdx, %rcx, 4), %eax # (Start, Index, Step)
```

特别地，对于数组下标 `A[i]` 的计算，实际上是 `*(A+i)`，即 `A+i` 是一个指针，指向 `A` 的第 `i` 个元素。

### 嵌套数组{.mb-4}

```c
T D[R][C]; // Row, Column
```

数组元素 `D[i][j]` 的内存地址为（解的时候顺序从左到右）：

$$
\&D[i][j] = x_D + L \cdot (C \cdot i + j)
$$

---

# 解码复杂指针表达式

decode complex expression

<div grid="~ cols-2 gap-12">
<div>

1. 从变量名开始
2. 往右读直到读到右括号或到底
3. 往左，忽略读过的
4. 上面的括号均不包括成对的括号
5. `*` 读作 “指针，指向”
6. `[x]` 读作 “长为 x 的数组，元素类型为”
7. `(…)` 读作 “函数，返回值为” + 上面提的成对括号（参数列表可选）
8. 如果为匿名类型，手动补充变量名（参数列表里会出现）

</div>

<div>

```c
int *(*p[2])[3];
```

<div text-sm>

1. `p`：变量名
2. `[2]`：往右读，这是一个长度为 2 的数组，元素类型为...
3. `)`：往左读，忽略读过的
4. `(*p[2])`：这是一个指针，指向...
5. `(*p[2])[3]`：一个长度为 3 的数组
6. `;`：到底了，往左读
7. `*(*p[2])[3]`：一个指针，指向...
8. `int *(*p[2])[3]`：`int` 类型

合并：这是一个长度为 2 的数组，元素类型为<span text-sky-5>指针，指向一个长度为 3 的数组</span>，<span text-yellow-5>数组元素类型为指针，指向 `int`</span>。

</div>

</div>
</div>

---

# 解码复杂表达式

decode complex expression

<div grid="~ cols-2 gap-12">
<div>

1. 从变量名开始
2. 往右读直到读到右括号或到底
3. 往左，忽略读过的
4. 上面的括号均不包括成对的括号
5. `*` 读作 “指针，指向”
6. `[x]` 读作 “长为 x 的数组，元素类型为”
7. <span text-sky-5>`(…)` 读作 “函数，返回值为” + 上面提的成对括号（参数列表可选）</span>
8. 如果为匿名类型，手动补充变量名（参数列表里会出现）

</div>

<div>

<div text-sm>

```c
int func();
```

函数，返回值为 `int`

```c
void func(int a, float b); 
```

函数，返回值为 `void`，参数列表为 `int a` 和 `float b`

```c
int* func();
```

函数，返回值为 `int*`

```c
int (*func)();
```

函数指针，指向返回值为 `int` 的函数


</div>

</div>
</div>


---

# 解码复杂表达式

decode complex expression

<div grid="~ cols-2 gap-12">
<div>

#### Quiz

```c
int *(*p[2])[3];
```

你可以在 [cdecl.org](https://cdecl.org/) 验证，或者尝试其他表达式。

</div>

<div v-click>

让我们逐步解码：

1. `p`：变量名
2. `p[2]`：一个长度为 2 的数组，元素类型为...
3. `*p[2]`：一个指针，指向...
4. `(*p[2])[3]`：一个长度为 3 的数组，元素类型为...
5. `*(*p[2])[3]`：一个指针，指向...
6. `int *(*p[2])[3]`：`int` 类型

合并：声明 `p` 为一个包含 2 个元素的<span text-sky-5> 数组 </span>，每个元素是<span text-sky-5> 指向一个包含 3 个元素的<span text-yellow-5> 数组 </span>的指针 </span>，<span text-yellow-5> 这些数组的元素是指向 `int` 类型的指针 </span>。

</div>
</div>

---

# 数组名和指针

array name and pointer

数组名在大多数情况下的行为类似于指针。

<div grid="~ cols-2 gap-12">
<div>

###### 相同

- 数组名在表达式中会被隐式转换为指向数组第一个元素的指针
- 可以对数组名和指针进行类似的指针算术操作
    ```c
    int value = *(arr + 2); // 等价于 arr[2]
    ```

</div>

<div>

###### 相异

- 数组对象本身占据一块连续内存；指针变量只保存一个地址，可以指向数组元素、其他对象或动态分配的内存。
    ```c
    int arr[5]; // 局部数组，具有自动存储期
    int *p = malloc(5 * sizeof(int)); // 动态分配的内存
    ```
- 数组名不是指针变量，也不是可修改左值，因此不能对它赋值；指针变量则可以重新赋值。
    ```c
    int arr[5];
    int *p = arr;
    p = NULL; // 合法，p 可以重新赋值
    arr = NULL; // 非法，arr 不能重新赋值
    ```

</div>
</div>

---

# 数组名和指针

array name and pointer

数组名在大多数情况下的行为类似于指针。

###### 相异

- 数组在声明时必须指定大小或初始化，而指针在声明时可以不初始化。
    ```c
    int arr[5] = {1, 2, 3, 4, 5}; // 数组声明并初始化
    int *p; // 指针声明，无需初始化
    p = arr; // 之后初始化
    ```
- 对数组名使用 `sizeof` 操作符时，返回的是整个数组的大小，而对指针使用 `sizeof` 操作符时，返回的是指针本身的大小。
    ```c
    int arr[5];
    int *p = arr;
    // %zu 代表 size_t 类型，通常用于表示 sizeof 操作符的结果
    printf("%zu\n", sizeof(arr)); // 输出数组的总大小，20
    printf("%zu\n", sizeof(p));   // 输出指针的大小，8
    printf("%zu\n", sizeof(*p));  // 输出指针所指向的类型的大小，4
    ```

---

# 数组名和指针

array name and pointer

<div grid="~ cols-2 gap-12">
<div>

```c
sizeof(q) = 4;
sizeof(A) = 16;
int* p = A; // 此处 A 转换为指向首元素的指针
            // p 的值等于 &A[0]，但 p 与 A 的静态类型不同
sizeof(p) = 8; // sizeof 根据表达式的类型计算，因此结果不同
```

`A` 在 `sizeof` 中保持数组类型；赋值表达式中的 `A` 会转换为指向首元素的指针。

</div>

<div>

![sizeof](/02-Machine-Prog/sizeof.svg){.mx-auto}

</div>
</div>

---

# sizeof 与数组名

`sizeof` and array name

注意，当 `A` 是数组名，调用 `sizeof(A)` 时，返回的是整个数组的大小，如下所示：

```c
int main() {
    int A[5][3];
    cout << sizeof(&A) << endl; // 8：&A 的类型是 int (*)[5][3]，即指向整个数组的指针
    cout << sizeof(A) << endl; // 60：在 sizeof 中 A 不转换为指针，类型仍为 int[5][3]
    cout << sizeof(*A) << endl; // 12：*A 的类型是 int[3]
    cout << sizeof(A[0]) << endl; // 12，A[0] 等价于 *A，即 int[3]
    cout << sizeof(**A) << endl; // 4：**A 是 int 类型的左值
    cout << sizeof(A[0][0]) << endl; // 4，A[0][0] 等价于 **A
    cout << &A << " " << (&A + 1) << endl; // &A + 1 跨过整个数组，即前进 60 字节
}
```

---

# 指针的大小与类型

pointer size and type

对于一个 `int* p`，`sizeof(p)` 等于？

<div v-click>

答：`p` 的类型是 `int*`，所以 `sizeof(p)` 返回指针本身的大小 8；`sizeof(*p)` 返回 `int` 的大小 4。

辨析： `int q`

此时，`q` 的类型是 `int`，所以 `sizeof(q)` 等于 `sizeof(int)`，即 4。`q` 不是指针，不存在“其指向的内容”。

- `sizeof(expression)` 由表达式的类型决定
- 对指针 `p` 使用 `sizeof(p)` 得到指针类型的大小；使用 `sizeof(*p)` 得到所指类型的大小
- 数组表达式在 `sizeof`、一元 `&` 等少数上下文中不会转换为首元素指针

</div>

---

# 定长数组

fixed-length array

在处理定长数组时，编译器通过优化，可以尽可能避免开销较大的乘法运算。

<div grid="~ cols-2 gap-12">

<div>

###### 原始的 C 代码

```c
int fix_prod_ele(fix_matrix A, fix_matrix B, long i, long k) {
    long j;
    int result = 0;
    for (j = 0; j < N; j++) {
        result += A[i][j] * B[j][k];
    }
    return result;
}
```

- 这是常规的固定矩阵乘法实现
- 迭代访问元素并计算乘积
- 因为使用了 `A[i][j]` 这种形式，所以每次访问一个矩阵元素时，都需要进行一次乘法运算。

</div>

<div>

###### 优化的 C 代码

```c
int fix_prod_ele_opt(fix_matrix A, fix_matrix B, long i, long k) {
    int *Aptr = &A[i][0];  
    int *Bptr = &B[0][k];  
    int *Bend = &B[N][k];  
    int result = 0;

    do {
        result += *Aptr * *Bptr;  
        Aptr++;  
        Bptr += N;  
    } while (Bptr != Bend);  

    return result;
}
```

- 利用指针加速元素访问和乘法操作

</div>

</div>


---

# 变长数组

variable-length array

变长数组为灵活的数据存储解决方案。由于数组长度的不确定性，使用单个索引时容易导致性能问题。

<div grid="~ cols-2 gap-12">
<div>

###### 初始 C 代码


```c
/* 计算变量矩阵乘积的函数 */
int var_prod_ele(long n, int A[n][n], int B[n][n], long i, long k) {
    long j;
    int result = 0;
    for (j = 0; j < n; j++) {
        result += A[i][j] * B[j][k];
    }
    return result;
}
```

<div text-sm>

- 由于使用了 `A[n][n]` 这种形式，而 `n` 是不能在编译时确定的变量，所以每次访问一个矩阵元素时，都需要进行一次乘法运算。
- 所以在访问变长数组元素时，被迫使用 `imulq`，这可能会导致性能下降。

</div>

</div>

<div>

###### 优化后的 C 代码

```c
/* 优化后的变量矩阵乘积计算函数 */
int var_prod_ele_opt(long n, int A[n][n], int B[n][n], long i, long k) {
    int *Arow = A[i];
    int *Bptr = &B[0][k];
    int result = 0;
    long j;

    for (j = 0; j < n; j++) {
        result += Arow[j] * *Bptr;
        Bptr += n; // 向后移动指针，以减少访问时间
    }
    return result;
}
```

<div text-sm>

- 规律性的访问仍能被优化：通过定位数组指针，避免重复计算索引。

</div>

</div>
</div>


---

# 数据结构

data structure

<div grid="~ cols-2 gap-12">
<div>

#### `struct`

所有组分存放在内存中一段连续的区域内。


```c
struct S3 {
    char c;
    int i[2];
    double v;
};
```

</div>

<div>

#### `union`

用不同的字段引用相同的内存块。

```c
union U3 {
    char c;
    int i[2];
    double v;
};
```

</div>
</div>

<div text="sm" mt-4>

| 类型 |   `c`  |   `i`   |   `v`   | 大小 |
|------|------|-------|-------|------|
| S3   |  0   |  4    |  16   |  24  |
| U3   |  0   |  0    |  0    |  8   |

可以看到，对于 `Union`，所有字段的偏移都是 0，因为它们共享同一块内存。

</div>

---

# 对齐

alignment

任何 `K` 字节的基本对象的地址必须是 `K` 的倍数。


| K  | 类型                |
|----|--------------------|
| 1  | `char`               |
| 2  | `short`              |
| 4  | `int` `float`         |
| 8  | `long` `double` `char*` |



---

# 结构体对齐

structure alignment

在结构体的内存中，有一部分为了对齐而空出的字节

- 内部填充：使每个成员的偏移满足该成员类型的对齐要求
- 外部填充：使结构体总大小成为结构体对齐要求的整数倍，保证结构体数组中的每个元素都正确对齐


---

# 内部填充

internal padding

内部填充：为了让每个成员的起始地址满足该成员类型的对齐要求

```c
struct S1 {
    int i;
    char c;
    int j;
};
```

虽然结构体的三个元素总共只占 9 字节，但为了满足变量 `j` 的对齐，内存布局要求填充一个 3 字节的间隙，这样 `j` 的偏移量将是 8，也就导致了整个结构体的大小达到 12 字节。

![alignment](/02-Machine-Prog/alignment.png){.h-45.mx-auto}

---

# 外部填充

external padding

外部填充：为了让结构体总大小成为结构体对齐要求的整数倍

```c
struct S2 {
    int i;
    int j;
    char c;
};
```

此时，正常排确实可以只需要 9 字节，且同时满足了 `i` 和 `j` 的对齐要求。

但是，因为要考虑可能会有 `S2[N]` 这种数组声明，且数组又要求各元素在内存中连续，所以编译器实际上会为结构体分配 12 字节，最后 3 个字节是浪费的空间。

![alignment-2](/02-Machine-Prog/alignment-2.png){.w-100.mx-auto}

<div text-sm text-gray-5>

`.align 8` 命令可以确保数据的开始地址满足 8 的倍数。

</div>


---

# 结构体对齐示例

structure alignment example

<div grid="~ cols-3 gap-12">
<div>

#### 定义

```c
struct A {
    char CC1[6];
    int II1;
    long LL1;
    char CC2[10];
    long LL2;
    int II2;
};
```

</div>

<div grid-col-span-2>

#### 回答以下问题：

1. `sizeof(A)` 为？<span class="text-red-5" v-click>6(2) + 4(4) + 8 + 10(6) + 8 + 4(4) = 56</span>
2. 若将结构体重排，尽量减少结构体的大小，得到的新结构体大小？
    <br><span class="text-red-5" v-click>6 + 10 + 4 + 4 + 8 + 8= 40</span>

</div>
</div>

<div v-click text-sky-5>

技巧：
- 尽量减少结构体的大小：通常将对齐要求较大的成员放在前面，并把对齐要求相同的成员放在一起
- 结构体的对齐取其所有成员对齐要求的最大值；嵌套的 `union`、`struct` 使用其类型自身的对齐要求

</div>

---

# 结构体对齐示例

structure alignment example

<div grid="~ cols-3 gap-12">
<div>



#### 定义

```c
typedef union {
    char c[7];
    short h;
} union_e;

typedef struct {
    char d[3];  // 4
    union_e u;  // 8
    int i;      // 4
} struct_e;

struct_e s;
```

</div>

<div grid-col-span-2>


#### 回答以下问题：

1. `s.u.c` 的首地址相对于 `s` 的首地址的偏移量是？<span class="text-red-5" v-click>4</span>
2. `sizeof(union_e)`为？<span class="text-red-5" v-click>8</span>
3. `s.i` 的首地址相对于 `s` 的首地址的偏移量是？<span class="text-red-5" v-click>12</span>
4. `sizeof(struct_e)`为？<span class="text-red-5" v-click>16</span>
5. 若只将 `i` 的类型改成 `short`，那么 `sizeof(struct_e)`为？<span class="text-red-5" v-click>14</span>
6. 若只将 `h` 的类型改成 `int`，那么 `sizeof(union_e)`为？<span class="text-red-5" v-click>8</span>
7. 若将 `i` 的类型改成 `short`，将 `h` 的类型改成 `int`，那么 `sizeof(union_e)`为？`sizeof(struct_e)`为？<span class="text-red-5" v-click>8 16</span>
8. 若将 `short h` 的定义删除，那么 (1)~(4) 间的答案分别是？<span class="text-red-5" v-click>3 7 12 16</span>

</div>
</div>

---

# 强制对齐

force alignment

- 任何内存分配函数（`alloca` `malloc` `calloc` `realloc`）生成的块的起始地址都必须是 16 的倍数
- 大多数函数的栈帧的边界都必须是 16 字节的倍数（这个要求有一些例外）
- 参数构造区向 8 对齐


---
layout: cover
class: text-center
coverBackgroundUrl: /02-Machine-Prog/cover.jpg
---

# Thank you for your listening!


<style>
  div{
   @apply text-gray-2;
  }
</style>
