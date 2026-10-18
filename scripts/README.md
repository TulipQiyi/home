# scripts/ — 性能与交互验证工具

开发期用的临时脚手架,不参与构建。全部基于 Edge headless + CDP,无需安装 Playwright。

## 前置

```bash
pnpm build && pnpm preview --port 4173
```

预览服务监听 `::1`,请用 `http://localhost:4173/` 访问(用 `127.0.0.1` 会被拒绝)。

默认浏览器路径写死为 `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`,
换机器时用环境变量覆盖:

```powershell
$env:EDGE_PATH = "C:/Program Files/Microsoft/Edge/Application/msedge.exe"
```

## perf.mjs — 主测量

```bash
node scripts/perf.mjs <url> [标签] [注入CSS文件或 -] [端口偏移] [CPU降频倍数]
node scripts/perf.mjs http://localhost:4173/ baseline - 0 4
```

跑两段负载(滚动 5s / 鼠标移动 4s),输出 JSON:`TaskDuration`、`ScriptDuration`、
`LayoutDuration`、`RecalcStyleDuration` 及 rAF 间隔统计(p50/p95/p99/over33)。

- 第 3 个参数可注入一份 CSS,用于消融实验(关掉某类效果再测),不传则用 `-`。
- 并发跑多个实例时**必须给不同的端口偏移**,否则会撞端口报 `CDP not reachable`。

> **坑(务必注意)**:headless Edge 默认 `prefers-reduced-motion: reduce` 为 `true`。
> 脚本已通过 `Emulation.setEmulatedMedia` 强制设成 `no-preference`,否则测到的是动画
> 全关的降级分支,数据毫无意义。自己写新脚本时一定要先断言媒体查询状态。

## trace.mjs — 帧级归因

```bash
node scripts/trace.mjs http://localhost:4173/ 4
```

用 DevTools Tracing(ReportEvents 模式)抓取滚动过程,按耗时聚合 top 事件
(`UpdateLayoutTree`、`FunctionCall`、`Paint` 等),用于判断主线程时间到底花在哪。

## probe7.mjs — 交互断言 + 截图

```bash
node scripts/probe7.mjs
```

断言:媒体查询状态、磁吸位移与回弹、滚动进场元素是否全部显示、控制台是否有警告,
并输出 `v-hero.png` / `v-1500.png` / `v-3400.png` / `v-5600.png` / `v-7600.png` 五张截图。
截图已在 `.gitignore` 中忽略。
