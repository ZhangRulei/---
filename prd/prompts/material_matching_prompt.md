# 素材匹配 Prompt 规范（Agent 模式）

## 概述

素材匹配是整个链路中唯一使用 **Agent 模式**的环节。

原因：

- 需要逐分镜调用素材库检索工具
- 匹配失败时需要动态决策（降级策略/替代方案）
- 中间结果不确定，需要多轮工具调用

---

## 素材库四类类型定义


| 类型 ID             | 类型名称     | 内容说明           | 典型标签特征                         |
| ----------------- | -------- | -------------- | ------------------------------ |
| `product_display` | 商品展示素材   | 产品外观、细节、包装特写   | subject=产品名, action=展示/旋转/特写   |
| `product_explain` | 商品讲解素材   | IP 出镜口播讲解产品    | subject=IP人物+产品, action=讲解/演示  |
| `effect_demo`     | 通用效果展示素材 | 护肤动作、使用过程、效果呈现 | action=涂抹/按压/拍打, subject=皮肤/手部 |
| `ip_lifestyle`    | IP 生活素材  | IP 人物日常生活、情感表达 | subject=IP人物, scene_type=生活场景  |


---

## 优化后的匹配策略

### 核心思路：按素材类型差异化处理

| 素材类型 | 量级 | 搜索策略 | 备选数量 |
|---|---|---|---|
| `product_display` | 少 | 关键词精准匹配（产品名必须命中） | 匹配不到直接标记补拍 |
| `product_explain` | 少 | 关键词精准匹配（产品名+IP必须命中） | 匹配不到直接标记补拍 |
| `effect_demo` | 多 | 向量语义搜索 → 按相关度排序 | 返回5个备选供用户挑选 |
| `ip_lifestyle` | 多 | 向量语义搜索 + 情绪过滤 → 排序 | 返回5个备选供用户挑选 |

### 两阶段搜索模型

```
产品类素材（product_display / product_explain）：
  第一阶段：关键词硬过滤（产品名/IP名必须精确命中）
      ↓ 有结果
  直接返回，不做语义搜索
      ↓ 无结果
  标记补拍，不降级到通用素材（产品素材不可替代）

通用/生活类素材（effect_demo / ip_lifestyle）：
  第一阶段：关键词预过滤（缩小候选池）
      ↓
  第二阶段：向量语义搜索（用分镜描述做查询向量）
      ↓
  按相关度评分排序，返回 Top5 备选
```

### 用户可调整机制

- 每个分镜展示**主素材1个 + 备选N个**（产品类3个，通用/生活类5个）
- 用户可手动拖拽替换主素材
- 用户替换行为记录到 `match_feedback` 表，用于后续优化排序权重

---

## Agent 工具定义

### Tool 1：search_materials

```json
{
  "name": "search_materials",
  "description": "根据分镜的素材标签检索素材库，返回匹配的素材列表",
  "parameters": {
    "material_type": {
      "type": "string",
      "enum": ["product_display", "product_explain", "effect_demo", "ip_lifestyle"],
      "description": "素材类型，必填"
    },
    "search_mode": {
      "type": "string",
      "enum": ["keyword", "semantic", "hybrid"],
      "description": "搜索模式：keyword=关键词精准匹配，semantic=向量语义搜索，hybrid=两者结合。产品类用keyword，通用/生活类用semantic或hybrid"
    },
    "semantic_query": {
      "type": "string",
      "description": "语义搜索的查询文本，用分镜的 footage+emotion 组合描述，如：'温馨室内场景，女性轻拍脸部，舒缓放松'"
    },
    "subject": {
      "type": "array",
      "items": {"type": "string"},
      "description": "主体关键词，如：['木兰精华液', '猫七七阿姨']"
    },
    "action": {
      "type": "string",
      "description": "动作描述关键词，如：讲解、涂抹、展示、旋转"
    },
    "mood": {
      "type": "array",
      "items": {"type": "string"},
      "description": "情绪关键词，如：['温馨', '专业', '信任']"
    },
    "visual_style": {
      "type": "string",
      "description": "视觉风格，如：国风、现代、温馨、专业"
    },
    "duration_min_sec": {
      "type": "number",
      "description": "最短时长（秒）"
    },
    "duration_max_sec": {
      "type": "number",
      "description": "最长时长（秒）"
    },
    "limit": {
      "type": "number",
      "description": "返回数量，默认3",
      "default": 3
    }
  },
  "required": ["material_type", "subject"]
}
```

### Tool 2：get_material_detail

```json
{
  "name": "get_material_detail",
  "description": "获取单个素材的完整标签信息，用于判断是否符合分镜要求",
  "parameters": {
    "material_id": {
      "type": "string",
      "description": "素材 ID"
    }
  },
  "required": ["material_id"]
}
```

### Tool 3：mark_unmatched

```json
{
  "name": "mark_unmatched",
  "description": "标记某分镜未找到合适素材，记录原因，触发人工补拍提醒",
  "parameters": {
    "scene_index": {
      "type": "number",
      "description": "未匹配的分镜编号"
    },
    "reason": {
      "type": "string",
      "description": "未匹配原因，如：无对应产品特写素材、IP人物素材不足"
    },
    "fallback_suggestion": {
      "type": "string",
      "description": "降级建议，如：可用通用护肤效果素材替代"
    }
  },
  "required": ["scene_index", "reason"]
}
```

---

## 系统 Prompt（System）

```
你是黛莱皙 AI 混剪系统的素材匹配引擎。

你的任务是根据视频脚本的每个分镜，从素材库中找到最合适的素材。

## 素材库四类类型
- product_display：商品展示素材（产品外观/细节/包装特写）— 量少，不可替代
- product_explain：商品讲解素材（IP出镜口播讲解）— 量少，不可替代
- effect_demo：通用效果展示素材（护肤动作/使用过程）— 量多，语义匹配
- ip_lifestyle：IP生活素材（IP日常生活/情感表达）— 量多，语义匹配

## 按类型差异化的匹配规则

### 产品类（product_display / product_explain）
- 使用 search_mode="keyword"
- subject 中的产品名/IP名必须精确命中
- 有结果 → 直接选用，取前3个为备选
- 无结果 → 立即调用 mark_unmatched，不做降级，产品素材不可用其他类型替代

### 通用/生活类（effect_demo / ip_lifestyle）
- 使用 search_mode="semantic"
- semantic_query 用该分镜的 footage + emotion 字段组合生成，如：
  "温馨室内，女性轻拍脸部精华，舒缓放松"
- 返回 Top5 备选，按相关度排序
- ip_lifestyle 额外传入 mood 字段做情绪过滤
- 无结果时放宽 semantic_query 重试一次，仍无结果再调用 mark_unmatched

## 每个分镜的匹配目标
- 产品类：主素材1个 + 备选2个
- 通用/生活类：主素材1个（评分最高）+ 备选4个（供用户手动替换）

## 执行顺序（分组并行）

分两组处理，组内并行，组间顺序：

第一组（优先）：product_display / product_explain
- 产品素材不可替代，优先锁定
- 组内各分镜并行调用 search_materials
- 全部完成后进入第二组

第二组：effect_demo / ip_lifestyle
- 组内各分镜并行调用 search_materials
- 所有结果返回后做冲突检测：
  同一素材被多个分镜选为主素材 → 相关度次高的备选自动升主

## 输出要求
输出必须严格遵循 JSON 格式，不得添加任何额外解释文字。
```

---

## 用户 Prompt（User）

```
请对以下脚本的每个分镜进行素材匹配。

## 脚本分镜列表
{{script_scenes_json}}

## 匹配说明
- 每个分镜已包含 material_tags，直接用于检索
- product_display / product_explain：keyword 模式，subject 必须精确命中
- effect_demo / ip_lifestyle：semantic 模式，用 footage+emotion 组合生成 semantic_query
- 按 scene_index 顺序逐个处理
- 匹配失败则调用 mark_unmatched 记录

## 最终输出格式（所有分镜处理完成后输出）

{
  "match_result": [
    {
      "scene_index": 1,
      "match_status": "matched | partial | unmatched",
      "search_mode": "keyword | semantic",
      "primary_material": {
        "material_id": "",
        "material_type": "",
        "match_reason": "命中原因说明"
      },
      "alternative_materials": [
        {
          "material_id": "",
          "material_type": "",
          "match_reason": ""
        }
      ],
      "unmatched_reason": "未匹配时填写",
      "fallback_suggestion": "降级建议"
    }
  ],
  "summary": {
    "total_scenes": 0,
    "matched": 0,
    "partial": 0,
    "unmatched": 0,
    "unmatched_scene_indexes": []
  }
}
```

---

## 匹配策略决策树

```text
分镜列表进来
    ↓
按 material_type 分为两组

【第一组 - 并行】product_display / product_explain
  每个分镜同时：
  search_materials(mode="keyword", subject=[产品名/IP名])
      ↓ 有结果 → matched，主素材=第1个，备选=第2-3个
      ↓ 无结果 → mark_unmatched（产品素材不降级）

【第二组 - 并行】effect_demo / ip_lifestyle
  每个分镜同时：
  semantic_query = footage + emotion 组合
  search_materials(mode="semantic", semantic_query, mood)
      ↓ 有结果 → matched，Top1为主素材，Top2-5为备选
      ↓ 无结果 → 去掉 mood 过滤重试
                    ↓ 有结果 → partial
                    ↓ 无结果 → mark_unmatched

【冲突检测】两组完成后
  同一 material_id 被多个分镜选为主素材
      ↓ 相关度最高的分镜保留
      ↓ 其余分镜：备选列表中相关度次高者自动升主
```

---

## 数据库存储字段映射

### material_matches 匹配结果表


| DB 字段                      | JSON 路径                               | 类型      |
| -------------------------- | ------------------------------------- | ------- |
| `script_id`                | 关联脚本主表                                | uuid FK |
| `scene_index`              | `scene_index`                         | int     |
| `match_status`             | `match_status`                        | enum    |
| `primary_material_id`      | `primary_material.material_id`        | uuid FK |
| `primary_match_reason`     | `primary_material.match_reason`       | text    |
| `alternative_material_ids` | `alternative_materials[].material_id` | jsonb   |
| `unmatched_reason`         | `unmatched_reason`                    | text    |
| `fallback_suggestion`      | `fallback_suggestion`                 | text    |


### match_summary 汇总表


| DB 字段                     | JSON 路径                           | 类型      |
| ------------------------- | --------------------------------- | ------- |
| `script_id`               | 关联脚本                              | uuid FK |
| `total_scenes`            | `summary.total_scenes`            | int     |
| `matched`                 | `summary.matched`                 | int     |
| `partial`                 | `summary.partial`                 | int     |
| `fallback`                | `summary.fallback`                | int     |
| `unmatched`               | `summary.unmatched`               | int     |
| `unmatched_scene_indexes` | `summary.unmatched_scene_indexes` | jsonb   |


---

## 调用策略

```text
用户点击"开始匹配"
    ↓
后端传入 script_scenes_json
    ↓
启动 Agent，分组处理：

  第一组（并行）product_display / product_explain
  → 全部完成
  ↓
  第二组（并行）effect_demo / ip_lifestyle
  → 全部完成
  ↓
  冲突检测 → 写 material_matches
  ↓
写 match_summary
    ↓
前端展示匹配结果：
  ├── matched / partial：显示素材缩略图 + 备选（可手动替换）
  └── unmatched：红色标记 + 降级建议 + "补拍提醒"入口
```

> 分组并行处理，总耗时从 N×T 降至 max(T产品, T通用)。
> unmatched 分镜触发"待补拍"任务，进入补拍排期流程。
> 用户手动替换的行为记录到 match_feedback 表，用于后续优化排序权重。

