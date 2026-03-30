# 脚本写作 Prompt 规范

## 概述

脚本写作输出结构与爆款拆解完全对齐，对应相关框架：

1. **脚本摘要**：整体创作策略，对应爆款拆解的"分析摘要"
2. **分镜脚本**：逐场景创作指令，对应爆款拆解的"分镜拆解"，同样11个维度

每个分镜额外输出**素材匹配标签**，供第三步素材匹配使用。

---

## 输入来源


| 输入项    | 来源          | 注入方式               |
| ------ | ----------- | ------------------ |
| 品牌知识库  | 知识库系统       | System Prompt 固定注入 |
| IP 人物库 | 知识库系统       | System Prompt 固定注入 |
| 勾选商品信息 | 用户勾选 → 后端查询 | User Prompt 动态拼入   |
| 爆款拆解结果 | 上一步输出的 JSON | User Prompt 动态拼入   |
| 创作模式   | 用户选择        | User Prompt 动态拼入   |


---

## Prompt 1：脚本摘要

### 适用时机

用户确认爆款拆解结果、勾选商品、选择 IP 后，点击"开始创作"时调用。

### 系统 Prompt（System）

```
你是黛莱皙（DINESSR）品牌的首席短视频内容策划师。

{{brand_knowledge}}
{{ip_profiles}}

你的任务是基于爆款视频的拆解结果，结合黛莱皙品牌调性和指定商品信息，
创作一份可直接用于带货视频混剪的短视频脚本。

创作原则：
1. 保留爆款的核心结构和钩子逻辑，替换为黛莱皙的品牌语言和产品内容
2. IP 人物的出现必须符合其人设，台词风格贴合其语言习惯
3. 每个分镜必须输出素材匹配标签，标签需足够具体以便后续素材检索
4. 输出必须严格遵循 JSON 格式，不得添加任何额外解释文字
```

### 用户 Prompt（User）

```
请基于以下信息创作黛莱皙短视频脚本，输出"脚本摘要"部分。

## 创作模式
{{creation_mode}}
（竞对仿写 / 自有爆款复刻 / 全新创作）

## 参考爆款分析摘要
{{viral_summary_json}}

## 本次主推商品
{{product_info}}
示例格式：
{
  "name": "木兰多肽精华液",
  "series": "木兰系列",
  "core_selling_points": ["三色三效", "添加玻色因与胶原", "100次不如用一次"],
  "price": "79元/三瓶",
  "target_audience": "25-45岁女性，关注抗初老",
  "ingredients_highlight": "玻色因、胶原蛋白肽",
  "usage_scene": "日常护肤、睡前精华"
}

## 出镜 IP（可多选）
{{selected_ip}}
示例：["猫七七阿姨", "叔叔尹海波"]

## 目标平台
{{platform}}（douyin / kuaishou / shipinhao）

## 输出格式（严格按此 JSON 输出）

{
  "script_summary": {
    "overview": "本视频的核心创作策略，不超过80字",
    "shooting_technique": "整体拍摄手法，如：多场景快速剪辑，结合特写与中景口播",
    "main_scenes": ["场景1", "场景2", "场景3"],
    "emotion_atmosphere": "整体情感基调，如：从生活共鸣切入，转向产品种草，结尾强化信任",
    "target_audience": "目标人群描述",
    "selling_points": ["本视频主打卖点1", "卖点2", "卖点3"],
    "promotion": "促销话术，如：今日直播间专属价，三瓶只要79",
    "ip_strategy": "IP 使用策略，如：猫七七阿姨主讲，叔叔辅助出镜增强家庭感",
    "bgm_suggestion": "BGM 风格建议，如：轻快国风电子乐，节奏与口播节点对齐",
    "highlights": ["视频亮点1", "亮点2", "亮点3"]
  },
  "meta": {
    "platform": "{{platform}}",
    "estimated_duration_sec": 0,
    "hook_type": "痛点刺激 | 悬念设置 | 价格冲击 | 反常识 | 情感共鸣",
    "emotion_curve": "低平 | 递进 | 起伏 | 反转",
    "edit_rhythm": "慢节奏 | 快剪 | 混剪",
    "cta_timing_sec": 0,
    "cta_script": "转化话术原文"
  }
}
```

---

## Prompt 2：分镜脚本

### 适用时机

与 Prompt 1 并行调用。

### 系统 Prompt（System）

```
（与 Prompt 1 相同的 System Prompt）
```

### 用户 Prompt（User）

```
请基于以下信息创作黛莱皙短视频脚本，输出"分镜脚本"部分。

## 创作模式
{{creation_mode}}

## 参考爆款分镜拆解
{{viral_scenes_json}}

## 本次主推商品
{{product_info}}

## 出镜 IP
{{selected_ip}}

## 目标平台
{{platform}}

## 分镜维度说明

每个分镜按以下 11 个维度输出创作指令，并额外输出素材匹配标签：

| 维度 | 说明 |
|---|---|
| 导演 | 该场景的叙事意图和导演指令 |
| 片段 | 画面内容和人物行为的具体描述 |
| 摄影 | 镜头类型、运镜方式、景别要求 |
| 演员 | 演员表演指令：情绪、动作、状态 |
| 画面内容 | 字幕文案、贴片信息、特效要求 |
| 场景 | 拍摄地点、背景、道具陈列要求 |
| 人员配合 | 出场人物组合 |
| 人物 | 人物着装、造型、气质要求 |
| 道具 | 该场景需要的道具清单 |
| 视频结构 | 该场景在整体叙事中的功能 |
| 情绪 | 该场景的目标情绪 |
| 口播文案 | 该场景的完整台词（贴合 IP 语言风格） |
| 素材标签 | 供素材匹配使用的检索标签（见格式说明） |

## 素材标签格式说明

每个分镜的 material_tags 用于第三步素材匹配，需包含：
- scene_type：场景类型（室内/户外/产品特写/生活场景）
- subject：主体（产品名/人物/场景元素）
- mood：情绪关键词
- action：动作描述
- visual_style：视觉风格（国风/现代/温馨/专业）
- preferred_duration_sec：该分镜建议时长
- material_type：素材类型（product_display/product_explain/effect_demo/ip_lifestyle）

## 配音规则说明

- material_type = `product_explain`（IP出镜讲解素材）：使用素材原声，不生成配音
  → `voiceover_script` 填空，`use_original_audio: true`
- 其他类型：正常生成配音
  → `voiceover_script` 填写完整台词，`use_original_audio: false`

## 输出格式（严格按此 JSON 输出）

{
  "scenes": [
    {
      "scene_index": 1,
      "time_range": "00:00-00:05",
      "direction": "导演指令",
      "footage": "画面内容描述",
      "cinematography": "摄影指令",
      "performance": "演员表演指令",
      "visual_content": "字幕/贴片/特效要求",
      "location": "场景/背景要求",
      "cast_combo": "人员配合",
      "character_profile": "人物造型要求",
      "props": ["道具1", "道具2"],
      "narrative_structure": "视频结构功能",
      "emotion": "目标情绪",
      "voiceover_script": "完整口播台词，product_explain类型留空",
      "use_original_audio": false,
      "material_tags": {
        "material_type": "product_display | product_explain | effect_demo | ip_lifestyle",
        "scene_type": "室内 | 户外 | 产品特写 | 生活场景",
        "subject": ["木兰精华液", "猫七七阿姨"],
        "mood": ["温馨", "信任"],
        "action": "主播手持产品介绍",
        "visual_style": "国风温馨",
        "preferred_duration_sec": 5
      }
    }
  ]
}
```

---

## 数据库存储字段映射

### scripts 主表（来自 Prompt 1 输出）


| DB 字段                    | JSON 路径                             | 类型      |
| ------------------------ | ----------------------------------- | ------- |
| `id`                     | 自动生成                                | uuid    |
| `viral_analysis_id`      | 关联爆款拆解                              | uuid FK |
| `product_id`             | 勾选商品                                | uuid FK |
| `selected_ip`            | 出镜 IP                               | jsonb   |
| `platform`               | `meta.platform`                     | enum    |
| `creation_mode`          | 竞对仿写/自有复刻/全新                        | varchar |
| `overview`               | `script_summary.overview`           | text    |
| `shooting_technique`     | `script_summary.shooting_technique` | text    |
| `main_scenes`            | `script_summary.main_scenes`        | jsonb   |
| `emotion_atmosphere`     | `script_summary.emotion_atmosphere` | text    |
| `selling_points`         | `script_summary.selling_points`     | jsonb   |
| `promotion`              | `script_summary.promotion`          | text    |
| `ip_strategy`            | `script_summary.ip_strategy`        | text    |
| `bgm_suggestion`         | `script_summary.bgm_suggestion`     | text    |
| `highlights`             | `script_summary.highlights`         | jsonb   |
| `hook_type`              | `meta.hook_type`                    | varchar |
| `emotion_curve`          | `meta.emotion_curve`                | varchar |
| `edit_rhythm`            | `meta.edit_rhythm`                  | varchar |
| `estimated_duration_sec` | `meta.estimated_duration_sec`       | int     |
| `cta_timing_sec`         | `meta.cta_timing_sec`               | int     |
| `cta_script`             | `meta.cta_script`                   | text    |
| `raw_summary_json`       | 完整 Prompt 1 输出                      | jsonb   |


### script_scenes 分镜表（来自 Prompt 2 输出）


| DB 字段                 | JSON 路径               | 类型      |
| --------------------- | --------------------- | ------- |
| `script_id`           | 关联主表                  | uuid FK |
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
| `use_original_audio`  | `use_original_audio`  | boolean |
| `material_tags`       | `material_tags`       | jsonb   |


---

## 调用策略

```
用户操作：
  1. 查看爆款拆解结果
  2. 勾选主推商品
  3. 选择出镜 IP
  4. 选择目标平台
  5. 点击"开始创作"
        ↓
后端组装输入：
  viral_summary_json    ← 从 viral_analysis 表查询
  viral_scenes_json     ← 从 viral_scenes 表查询
  product_info          ← 从商品库查询（用户勾选）
  brand_knowledge       ← 从知识库读取（固定）
  ip_profiles           ← 从知识库读取（固定）
        ↓
并行调用：
  ├── Prompt 1（脚本摘要）→ 写入 scripts 表
  └── Prompt 2（分镜脚本）→ 写入 script_scenes 表
        ↓
前端展示两个 Tab（脚本摘要 / 分镜脚本）
        ↓
script_scenes.material_tags → 传入第三步素材匹配
```

> Prompt 1 和 Prompt 2 并行调用，无依赖关系。
> `material_tags` 是连接脚本写作与素材匹配的关键字段，需保证标签足够具体。

