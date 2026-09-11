---
# You can also start simply with 'default'
theme: academic
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
# background: bg.jpg
# some information about your slides (markdown enabled)
title: "00-Introduction"
highlighter: shiki
info: |
  ICS 2026 Fall Slides
# apply unocss classes to the current slide
presenter: false
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
coverBackgroundUrl: /00-Introduction/cover.jpg
---

# 欢迎来到 ICS 课程

Menghong Yu, EECS, PKU


<style>
  div{
   @apply text-gray-2;
  }
</style>


<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->

---
layout: two-cols
---

# 基本信息

- 周三 10-11 节，地学107
- 班号 #19
- 小班老师：张史梁老师
  - 计算机学院 长聘副教授
  - 研究所：视频与视觉技术研究所
  - 研究领域：计算机视觉
- 小班助教：于孟宏
  - 24 级 CS 专业本科生
  - https://lwlaymh.github.io/about.html

::right::

<img src="/00-Introduction/qr.png" alt="qr" style="width: auto; height: 65%; margin: 0 auto;" />


---

# 日程安排

<img src="/00-Introduction/schedule.png" alt="schedule" style="width: 75%; height: auto; margin: 0 auto;" />

---

# 课程概述

给分方案

- 阶段测验 2*10%、期末 30%
- Lab（包括Lab测验） 30%
- 小班评分 15%，拟采用下述方式（如有意见可以提出）：
  - 同学互评 3%
  - 老师评分 6%
  - 助教评分 6%
  - **无故迟到超过 5 分钟 (-0.5) 无故缺勤 (-1)**
- 大班评分 5%

<br>

> 可能有调整

---

# 关于小班

概述

- ICS 小班/讨论班是同学们之间相互讨论、相互提高的重要平台

- 自我介绍环节（以下作为参考，随便说点什么都行）
  - 姓名/年级/院系
  - 各种兴趣爱好
  - 和你有关的一件有意思的事
  - 对 ICS 有什么样的预期?
  - 对我们的讨论课有什么样的预期？
  - 学术上你对什么方向比较感兴趣？ 
  
---

# 关于小班

基本内容安排

- 同学分享研讨题 与 各种习题
- 助教梳理重点 & 适度拓展 & 讨论问题
- 做/讲习题


---

# 关于研讨题

- 每次大班课（含专题讲座）会布置 2 道适合分析研讨的题目，同时助教会发布与该次大班课相关的CSAPP课后题/往年考试真题
  - 每道研讨题安排 1 名同学上台讲解（用 PPT、板书或其他形式，自行决定）；其他同学提问和参与讨论
  - 同学、教师和助教点评打分，计入小班评分
- 同学们自行选择自己喜欢的模块，如果有冲突则先到先得
  - 每次讲解的四位同学可以提前联系并共同进行准备
- **时间尽量控制在 15 分钟以内**（暂定，以实际情况为准）


---

# 关于答疑

请多提问

- 线上答疑
  - 在小班微信群中**积极提问、相互答疑**，相信问题会得到更快、更好的解决
  - 可以私戳助教提问，助教会耐心地回答每一个问题，不过回复可能会慢一点
    - 如果助教的回答没有把问题讲明白，请务必当场质疑助教！
  - 可以去民间水群提问
- 线下答疑
  - 助教会在每周三的晚上提前 20 分钟左右到达小班教室，欢迎来提问
- 善用AI/搜索
  - Claude/ChatGPT/Gemini/DeepSeek等AI目前的能力应该足以回答大部分ICS相关问题
  - 也可以搜索一些往年学长的博客/笔记，比如下面两位：
    - [A神](https://arthals.ink/)
    - [tygg小班课件](https://blog.imyangty.com/ICS25-Slides/1)

---

# 关于 lab

- 本学期共设置 8 个 lab，预计期末之前全部截止
  - 平均每 2 周 1 个 lab，大约随大班讲课进度发布 
  - 非常非常不建议大家当 ddl 战士
- **认真、独立完成**
  - 按照往年惯例设有查重机制，如果被认定为抄袭（网络、往年代码）会被请喝茶
    - 可能会被处本次 lab 成绩作废或全部 lab 成绩作废的惩罚
    - Datalab 抄袭也是抄袭
    - 有的lab代码内要写自己姓名和学号，请不要抄成别人的
  - 抄课本代码不算抄袭（proxylab 等）
- 有的lab针对部分评测指标会有排行榜
  - 这个排行榜**没有除了展示以外的作用**，只要该lab达标满分标准，排行榜上排名再高也不会作为加分标准
  - 鼓励同学探索更优秀的方式，但请不要盲目刷榜
  - **不要**用AI刷榜

---

# 如何完成 lab

https://clab.pku.edu.cn/ 

- **ICS 所有的 lab** 都最好在类 UNIX 环境下完成，Windows 环境大概率无法使用。
- 如果你是 Linux 或 Mac 系统，你可能可以在本地完成部分 lab 的代码编写
- 如果你是 Windows 系统，建议配置一个 WSL (Windows Subsystem for Linux)
  - 可以参考[《北京大学计算机基础科学与开发手册》by 臧炫懿](https://github.com/ZangXuanyi/getting-started-handout) 中的第 8.1.4 节相关内容
- 你也可以（且推荐）在 Linux 俱乐部提供的 Clab 上进行完成。
  - 关于 Clab 的配置与使用，助教稍后会进行演示
  - 关于 ssh 连接主机以及 Linux 常见命令的使用，请参考[《北京大学计算机基础科学与开发手册》by 臧炫懿](https://github.com/ZangXuanyi/getting-started-handout) 中的第 5.3/7.2/8.1-8.3 节相关内容


---

# Linux基础命令使用示范-文件系统相关

- `.`: 表示当前目录
- `..`: 表示父目录
- `/`: 表示根目录
- `~`: 表示用户根目录
- `cd /path/to/something`: 切换当前工作目录到`/path/to/something`
- `ls`: 列出工作目录里的文件
  - `-a`: 列出全部文件(包括隐藏文件)
  - `-h`: 显示文件大小
  - `-t`: 按修改时间排序
  - `-l`: 以长格式列出文件和目录的详细信息
- `find /path/to/ -name "a.log"`: 在/path/to/目录下查找名为"a.log"的文件
- `df -h`: 显示当前工作目录下的文件夹所占磁盘空间

---

# Linux基础命令使用示范-文件系统相关

- `mkdir qwq`: 创建一个名为"qwq"的文件夹
- `touch qwq.txt`: 在当前工作目录下创建一个名为"qwq.txt"的文件
- `mv file.txt /path/to/destination/`: 移动"file.txt"到"/path/to/destination/"目录
- `mv file.txt qwq.txt`:重命名"file.txt"为"qwq.txt"
- `rm qwq.txt`: 删除名为"qwq.txt"的文件
  - `rm -r qwq`: 递归删除名为"qwq"的文件夹
  - `rm -f qwq`: 强制删除名为"qwq"的文件夹
- `cp /path/to/qwq.txt`: 复制"/path/to/qwq.txt"到当前工作目录
  - `cp -r /path/to/qwq`: 递归复制"/path/to/qwq"文件夹到当前工作目录
- `scp main.cpp user@192.168.1.100:/path/to/`: 将本地文件发送到远程用户的/path/to/目录下
- `scp user@192.168.1.100:path/to/app.log .`: 从远程下载单文件到本地当前目录
- `chmod 755 a.sh`: 赋予脚本执行权限（所有者可读写执行，组和其他人只读可执行）

---

# Linux基础命令使用示范-文件操作相关

- `cat a.txt`: 在终端中打印a.txt的内容
- `vim a.txt`: 在终端中以vim打开a.txt
  - `i`: 进入编辑状态
  - `esc`: 退出编辑状态
  - `:q`: 退出
  - `:wq`: 保存并退出 
  - `/qwq`: 查找"qwq"文本, 输入`n`找到下一处, 输入`N`找到上一处
- `grep "qwq" a.txt`: 在 a.txt 中搜索所有包含 qwq 的行
- `head -n 5 a.txt`: 查看a.txt的前五行
- `tail -n 5 a.txt`: 查看a.txt的后五行
  - `tail -f a.log`: 监听a.log日志


---

# Linux基础命令使用示范-进程操作相关

- `ps`: 展示当前系统正在进行的进程
  - `-e`: 显示当前系统正在进行的所有进程
  - `-f`: 以全格式显示所有进程
  - `-H`: 以树形结构显示所有进程
- `bg 114514`: 将pid为114514的进程挂到后台（或者可以对前台进程使用ctrl+Z）
- `fg 114514`: 将pid为114514的进程放回前台
- `kill 114514`: 杀死pid为114514的进程（或者可以对前台进程使用ctrl+C）

--- 

# 如何配置Xlab

- 今年的ICS提供[Xlab](https://xlab.pku.edu.cn/)给大家操作, 您可以查看其[手册](https://xlab.pku.edu.cn/docs/getting-started)获得更多信息, 也可以跟随我在下面写的教程. 如有配置上的问题请联系助教.
- 新建节点
  - 进入xlab后, 可以点击右上角的"新建节点", 其它选项可以默认, 最下面会要求你提供一把ed25519公钥.
  - 你也许听说过公私钥加密系统: 具体而言, 这个系统由一把公钥和一把私钥组成, 你需要保护你的私钥, 而公开你的公钥. 
  - Xlab需要你提供你的公钥, 我们下面将介绍一个简单的生成公钥的流程. 如果你希望更细致地操作, 可以查询更详细的教程.
  - windows系统下, 可以通过打开powershell终端输入 `ssh-keygen -t ed25519`, 然后一路回车. 最终会显示一行形如:
    - `Your public key has been saved in C:/Users/user/.ssh/id_ed25519.pub`
  - 这就是你的公钥! 你可以点开该.pub文件并将其复制到Xlab中需要公钥的地方.
  - 等待节点创建完成.

--- 

# 如何配置Xlab

- 下面的步骤假设大家本地已经下载了VSCode
- 配置你的远端(方法A)
  - 在你的VSCode中安装"Remote SSH"插件.
  - 对于创建好的节点, 会有一个"打开VS Code"的按钮, 请点击, 此时浏览器会通过SSH自动打开VSCode.
  - 打开后会询问选择何种操作系统, 建议选择Linux.
  - 耐心等待VSCode服务器配置完成.
  - 如果配置中出现错误, 请打开VSCode设置, 确保其中`remote.SSH.localServerDownload`选项为`auto`或`always`. 如果`auto`仍然出错, 可以尝试改为`always`.
  - 当你发现终端中显示`xxxx:end`时, 点击VSCode中的"新建终端", 此时您已经配置成功. 建议您在当前目录`:~/ics-2026`下为每个lab创建相应的文件夹.
- 配置你的远端(方法B)(不推荐, 除非您是Linux命令行高手)
  - 直接使用显示的ssh命令连接远端, 您可以使用Linux命令行进行后续的操作.
  - 您可以键入"ctrl+D"退出连接.

---
layout: cover
class: text-center
coverBackgroundUrl: /00-Introduction/cover.jpg
---

# Thank you for your listening!

祝大家新学期一切顺利！


<style>
  div{
   @apply text-gray-2;
  }
</style>