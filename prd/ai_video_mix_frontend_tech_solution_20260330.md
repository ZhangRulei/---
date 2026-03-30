# AI视频混剪前端技术方案（按即梦截图重写版）

## 1. 目标与范围

基于《AI混剪素材生成功能PRD20260330》，建设一个桌面端素材生成工作台，支持 Agent、图片、视频、数字人、配音 5 种生成能力，并完成素材库归档、历史复用、时间轴联动。

本版约束：
- 布局参考你提供的即梦截图
- 左侧导航仅保留一个入口：`素材生成`
- 不做移动端方案

## 2. 页面布局（严格对齐截图结构）

### 2.1 总体结构

采用 4 层固定布局：
1. 左侧窄导航栏（固定宽度 72px）
2. 顶部工具筛选栏（时间/生成类型/操作类型）
3. 中央内容流（对话与生成结果混排）
4. 底部输入操作条（文本输入 + @主体/参考 + 提交）

### 2.2 左侧导航栏

仅保留一个主功能入口：
- `素材生成`（默认高亮）

导航行为：
- 点击 `素材生成` 不跳转多页面，仅切换/聚焦工作区状态
- 无 `灵感/资产/画布` 等额外入口

### 2.3 中央内容流

采用“会话流 + 结果卡片流”结构：
- 上部：Agent 的规划文本、确认文本、系统提示
- 中部：生成中的任务卡片（进度、排队信息、取消）
- 下部：生成结果卡片（图片宫格、视频卡、音频卡、数字人卡）

支持行为：
- 流式追加（新内容追加到底部）
- 历史回看（滚动加载旧任务）
- 回到底部按钮（与截图一致）

### 2.4 底部输入条

固定吸底，包含：
- 主输入框：创意描述
- `@` 引用入口：引用主体/素材
- 附件上传：图/视频/音频
- 提交按钮：触发生成

交互规则：
- Enter 提交，Shift+Enter 换行
- 提交后输入框保留草稿（可配置）
- 超字数实时提示（各模式按 PRD 限制）

## 3. 前端技术栈

- React 18 + TypeScript + Vite
- Zustand（界面态）+ TanStack Query（服务端状态）
- React Hook Form + Zod（参数与输入校验）
- Tailwind CSS + Radix UI（基础组件）
- 视频预览：hls.js
- 音频波形：wavesurfer.js
- 上传：tus-js-client（断点续传）
- 监控：Sentry + 自定义埋点

## 4. 功能分层设计

```txt
src/
  pages/studio/                 # 单页面工作区
  features/
    generation-input/           # 底部输入条
    generation-feed/            # 中央会话流/结果流
    generation-filter/          # 顶部筛选栏
    task-queue/                 # 任务队列与状态
    mode-agent/
    mode-image/
    mode-video/
    mode-avatar/
    mode-voice/
    material-link/              # 添加到素材库/时间轴
  entities/
    task/
    material/
    preset/
  shared/
    api/
    ui/
    hooks/
```

说明：采用“单页多模块”而非多路由分散结构，确保交互连续性和即梦式使用感。

## 5. 五模式在同一工作区的承载方式

### 5.1 模式切换

不使用左侧多入口切换，改为：
- 顶部筛选 `生成类型` 选择模式（Agent/图片/视频/数字人/配音）
- 底部输入条根据模式动态切换参数抽屉

### 5.2 参数呈现

- 默认精简参数（常用）
- 高级参数放右侧抽屉（按需展开）
- 参数变更实时保存为草稿

### 5.3 任务反馈

每次提交生成后，在内容流中插入任务卡：
- `排队中`：队列位置 + 预估时间
- `生成中`：进度条 + 可取消
- `已完成`：结果卡 + 操作按钮
- `失败`：错误原因 + 一键重试

## 6. 核心数据结构

```ts
type GenMode = 'agent' | 'image' | 'video' | 'avatar' | 'voice';

type TaskStatus = 'queued' | 'running' | 'success' | 'failed' | 'canceled';

interface GenTask {
  id: string;
  mode: GenMode;
  status: TaskStatus;
  progress: number;
  etaSec?: number;
  params: Record<string, unknown>;
  materialIds: string[];
  createdAt: string;
}

interface Material {
  id: string;
  type: 'image' | 'video' | 'audio' | 'avatarVideo';
  url: string;
  cover?: string;
  duration?: number;
  sourceTaskId: string;
}
```

## 7. 接口契约建议

- `POST /api/gen/tasks`：提交任务（mode + params + references）
- `GET /api/gen/tasks/:id`：查询任务状态
- `GET /api/materials?taskId=xxx`：获取生成素材
- `POST /api/timeline/insert`：素材一键上轨
- `POST /api/materials/archive`：保存到素材库

实时通道（SSE/WebSocket）：
- `task.queued`
- `task.progress`
- `task.completed`
- `task.failed`

## 8. 视觉规范（按截图风格）

- 背景：浅灰工作区（非深色）
- 卡片：白底 + 8~12px 圆角 + 轻阴影
- 导航：极简线性图标，激活态描边高亮
- 输入条：大圆角吸底悬浮条
- 字体：中文优先 `PingFang SC`

建议 Token：
- `--bg-page: #f5f6f8`
- `--bg-card: #ffffff`
- `--text-primary: #1f2329`
- `--text-secondary: #667085`
- `--line: #e7eaf0`
- `--brand: #3b82f6`

## 9. 桌面端适配基线（无移动端）

- 最小宽度：1280px
- 推荐设计宽度：1440px / 1728px
- 仅提供桌面断点：
  - `>=1728`：宽屏
  - `1440~1727`：标准
  - `1280~1439`：紧凑（部分文案省略）

## 10. 性能与稳定性

- 内容流虚拟滚动（历史很多时）
- 图片懒加载 + 视频封面优先
- 任务状态退避轮询（2s/4s/8s）+ 实时推送优先
- 单用户并发提交上限 5（前端限流）
- 失败自动保留参数，支持一键重试

## 11. 埋点指标

- `gen_submit` 提交次数（按模式）
- `gen_success_rate` 成功率
- `gen_avg_duration` 平均耗时
- `result_action` 结果操作（下载/入库/上轨）
- `mode_switch` 模式切换路径

## 12. 里程碑排期（前端）

- 第1周：页面骨架（左导航+顶部筛选+中央流+底部输入）
- 第2周：图片/视频/配音主链路打通
- 第3周：Agent/数字人接入 + 素材上轨 + 历史复用
- 第4周：联调、性能优化、埋点、验收

## 13. 验收标准

- 左侧导航仅一个入口：`素材生成`
- 五种模式均在同一工作区内完成提交与结果展示
- 任务状态完整可见（排队/进度/完成/失败）
- 素材支持下载、入库、上轨
- 仅桌面端适配，无移动端样式与交互要求
