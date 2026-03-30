# 爆款拆解 Prompt 规范

## 概述

爆款拆解分两个阶段输出，对应前端两个 Tab：

1. **分析摘要**：整体维度，10个字段
2. **分镜拆解**：按场景逐帧拆解，11个维度矩阵

---

## Prompt 1：分析摘要

### 适用时机

视频上传/链接导入后，第一步调用，输出整体摘要。

### 系统 Prompt（System）

```
你是一名专注于快手/抖音电商带货短视频赛道的内容策略分析师。
你的任务是对输入的视频内容进行结构化拆解，输出标准化的爆款分析报告。
输出必须严格遵循 JSON 格式，不得添加任何额外解释文字。
```

### 用户 Prompt（User）

```
请对以下视频内容进行爆款分析，输出"分析摘要"部分。

//此部分根据实际拆解内容进行定义

## 视频信息
- 标题：{{title}}
- 平台：{{platform}}（douyin / kuaishou / shipinhao）
- 时长：{{duration_sec}} 秒
- 视频字幕/转写文本：
{{transcript}}


## 输出格式（严格按此 JSON 输出）

{
  "summary": {
    "overview": "一句话总结视频核心策略，不超过80字",
    "shooting_technique": "拍摄手法描述，如：多景快速剪辑、结合特写镜头与中景对话等",
    "main_scenes": ["场景1", "场景2", "场景3"],
    "emotion_atmosphere": "情感氛围描述，如：轻松幽默中带点戏剧冲突，后转为专业可信的产品推荐氛围",
    "target_audience": "目标人群描述，如：25-45岁关注抗初老、眼部护理的女性及家庭消费群体",
    "selling_points": ["卖点1", "卖点2", "卖点3"],
    "promotion": "促销优惠信息，如：79元三瓶，加生产线保障供应",
    "kol_info": "明星/达人信息描述，如：一位黑发短发风格鲜明的中年女性（疑似网红/品牌代言人）",
    "bgm": "BGM风格描述，如：轻快流行电子配乐，节奏明快",
    "highlights": ["亮点1", "亮点2", "亮点3"]
  },
  "meta": {
    "platform": "{{platform}}",
    "duration_sec": {{duration_sec}},
    "hook_type": "痛点刺激 | 悬念设置 | 价格冲击 | 反常识 | 情感共鸣",
    "emotion_curve": "低平 | 递进 | 起伏 | 反转",
    "edit_rhythm": "慢节奏 | 快剪 | 混剪",
    "cta_timing_sec": 0,
    "reusable_for_dinessr": ["可复用元素1", "可复用元素2"]
  }
}
```

此部分根据输入内容进行修改

### 变量说明


| 变量                 | 来源              |
| ------------------ | --------------- |
| `{{title}}`        | 用户输入或平台爬取       |
| `{{platform}}`     | 用户选择            |
| `{{duration_sec}}` | 视频元数据           |
| `{{transcript}}`   | ASR 转写结果 / 字幕文件 |


---

## Prompt 2：分镜拆解

### 适用时机

分析摘要完成后，开始分镜拆解。

### 系统 Prompt（System）

```
你是一名专业的短视频导演和内容策略师。
你的任务是将视频逐场景拆解为结构化的分镜表，供后续脚本仿写使用。
输出必须严格遵循 JSON 格式，场景数量根据实际内容决定（通常3-10个场景）。
不得添加任何额外解释文字。
```

### 用户 Prompt（User）

```
请对以下视频内容进行逐场景的分镜拆解。

//此部分根据实际拆解内容进行定义
## 视频信息
- 标题：{{title}}
- 平台：{{platform}}
- 时长：{{duration_sec}} 秒
- 视频字幕/转写文本：
{{transcript}}

## 分镜拆解维度说明

每个场景需按以下 11 个维度拆解：

| 维度 | 说明 |
|---|---|
| 导演 | 该场景的叙事意图和导演策略，如"引导演员做出夸张的庆祝动作，营造欢乐氛围" |
| 片段 | 画面内容和人物行为的具体描述，直接返回具体片段 |
| 摄影 | 镜头类型、运镜方式、景别,如"手持跟拍，镜头跟随人物移动" |
| 演员 | 演员的表演状态、情绪、动作要求，如"夸张的表情和肢体动作，表现惊喜和兴奋" |
| 画面内容 | 画面内容描述，如“一家人在客厅得知产品降价后欢呼雀跃” |
| 场景 | 拍摄地点、背景、环境描述，如 室内客厅 |
| 人员配合 | 出场人物组合，如：三人，家庭成员 |
| 人物 | 人物性格特征、气质定位，如"女25-30岁，穿格子衣服；男40-50岁，穿白色T恤；女40-50岁，穿红色T恤" |
| 道具 | 该场景出现的具体道具清单，如"智能手机" |
| 视频结构 | 该场景在整体叙事中的功能，如：强冲击开场，引发观众兴趣 |
| 情绪 | 该场景的主导情绪，如：欢快、惊喜 |
| 口播文案 | 该场景的台词/口播原文（如有） |

## 输出格式（严格按此 JSON 输出）

{
  "scenes": [
    {
      "scene_index": 1,
      "time_range": "00:00-00:05",
      "direction": "导演意图描述",
      "footage": "片段画面描述",
      "cinematography": "摄影手法描述",
      "performance": "演员表演要求",
      "visual_content": "画面信息层描述",
      "location": "场景/背景描述",
      "cast_combo": "人员配合描述",
      "character_profile": "人物气质描述",
      "props": ["道具1", "道具2"],
      "narrative_structure": "视频结构功能",
      "emotion": "主导情绪",
      "voiceover_script": "口播台词原文，无则留空"
    }
  ]
}
```

---

## 数据库存储字段映射

### viral_analysis 主表（来自 Prompt 1 输出）


| DB 字段                  | JSON 路径                      | 类型      |
| ---------------------- | ---------------------------- | ------- |
| `overview`             | `summary.overview`           | text    |
| `shooting_technique`   | `summary.shooting_technique` | text    |
| `main_scenes`          | `summary.main_scenes`        | jsonb   |
| `emotion_atmosphere`   | `summary.emotion_atmosphere` | text    |
| `target_audience`      | `summary.target_audience`    | text    |
| `selling_points`       | `summary.selling_points`     | jsonb   |
| `promotion`            | `summary.promotion`          | text    |
| `kol_info`             | `summary.kol_info`           | text    |
| `bgm`                  | `summary.bgm`                | text    |
| `highlights`           | `summary.highlights`         | jsonb   |
| `platform`             | `meta.platform`              | enum    |
| `duration_sec`         | `meta.duration_sec`          | int     |
| `hook_type`            | `meta.hook_type`             | varchar |
| `emotion_curve`        | `meta.emotion_curve`         | varchar |
| `edit_rhythm`          | `meta.edit_rhythm`           | varchar |
| `cta_timing_sec`       | `meta.cta_timing_sec`        | int     |
| `reusable_for_dinessr` | `meta.reusable_for_dinessr`  | jsonb   |
| `raw_summary_json`     | 完整 Prompt 1 输出               | jsonb   |


### viral_scenes 场景表（来自 Prompt 2 输出）


| DB 字段                 | JSON 路径               | 类型      |
| --------------------- | --------------------- | ------- |
| `analysis_id`         | 关联主表                  | uuid FK |
| `scene_index`         | `scene_index`         | int     |
| `time_range`          | `time_range`          | varchar |
| `direction`           | `direction`           | text    |
| `footage`             | `footage`             | text    |
| `cinematography`      | `cinematography`      | text    |
| `performance`         | `performance`         | text    |
| `visual_content`      | `visual_content`      | text    |
| `location`            | `location`            | text    |
| `cast_combo`          | `cast_combo`          | varchar |
| `character_profile`   | `character_profile`   | text    |
| `props`               | `props`               | jsonb   |
| `narrative_structure` | `narrative_structure` | varchar |
| `emotion`             | `emotion`             | varchar |
| `voiceover_script`    | `voiceover_script`    | text    |


---

## 调用策略

```
用户上传视频
    ↓
ASR 转写 → 获得 transcript
    ↓
并行调用：
  ├── Prompt 1（分析摘要）→ 写入 viral_analysis 表
  └── Prompt 2（分镜拆解）→ 写入 viral_scenes 表
    ↓
前端展示两个 Tab
```

> Prompt 1 和 Prompt 2 可以并行调用，无依赖关系。
> 两个结果均写库后，前端再渲染，避免部分加载状态。

