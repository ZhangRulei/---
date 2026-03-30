# 混剪 Prompt 规范

## 概述

混剪阶段 AI 的职责：
1. **生成基础剪辑配置 JSON**：时间轴、转场/特效、字幕、配音参数、BGM（基于主素材）
2. **口播文案差异化改写**：同意思换说法，每个版本不同，通过查重校验

非 AI 职责（后端算法处理）：
- 素材组合排列：从各分镜备选素材中生成差异最大化的 N 套组合
- 素材起始帧微偏移
- 配音语速/音调随机浮动
- N 个版本最终配置合并

---

## 多版本生成逻辑

```text
输入：
  - 每个分镜：1个主素材 + 最多4个备选素材
  - 用户设置版本数 N

后端素材组合算法：
  目标：生成 N 套素材组合，版本间差异最大化
  规则：
    1. 版本1 = 全部使用主素材（baseline）
    2. 版本2起，逐分镜轮换备选素材
    3. 优先替换备选素材数量最多的分镜
    4. 允许不同版本的同一分镜使用相同素材

  示例（3个分镜，各有3/2/4个备选）：
    版本1: [主,  主,  主 ]
    版本2: [备1, 主,  备1]
    版本3: [备2, 备1, 备2]
    版本4: [主,  主,  备3]
    ...

文案差异化：
  Prompt 2 输出 N 套口播文案版本

最终合并：
  版本i = 基础剪辑配置 + 素材组合i + 文案版本i + 随机规则参数
```

---

## Prompt 1：基础剪辑配置

### 适用时机
素材匹配完成，用户确认素材后，点击"开始混剪"时调用。

### 系统 Prompt（System）

```
你是黛莱皙 AI 混剪系统的剪辑配置生成引擎。

你的任务是根据脚本分镜和已匹配的素材，生成一份完整的剪辑配置 JSON。
这份配置将直接交给剪辑引擎执行，必须精确、可执行。

配置原则：
1. 严格按照分镜顺序编排素材，不要自行调整顺序
2. 每个分镜的素材时长尽量贴合 preferred_duration_sec
3. use_original_audio=true 的分镜：使用素材原声，voiceover 留空，字幕留空
4. use_original_audio=false 的分镜：生成配音和字幕，文案使用 voiceover_script
5. 转场和特效根据分镜情绪 + 素材类型智能选择（见规则）
6. BGM 优先使用同款，无同款则从库中选相似风格
7. 输出必须严格遵循 JSON 格式，不得添加任何额外解释文字

## 转场选择规则

| 当前分镜情绪 / 素材类型 | 推荐转场 |
|---|---|
| product_display（产品特写）→ 任意 | cut（直切，干净利落）|
| 情绪低→高（铺垫→高潮） | flash（闪白，制造爆发感）|
| ip_lifestyle（生活场景）→ 生活场景 | fade（淡入淡出，保持温馨感）|
| effect_demo（效果展示）→ 任意 | cut 或 wipe |
| 任意 → CTA（结尾转化） | zoom_out（拉远，引导点击）|
| 其他默认 | cut |

参考原视频的转场类型（viral_analysis 中的 edit_rhythm）作为整体风格基准。

## 特效选择规则

| 使用场景 | 推荐特效 |
|---|---|
| 卖点文字出现时 | text_bounce（文字弹跳）或 text_highlight（高亮描边）|
| 价格/促销信息 | shake（轻微抖动强调）|
| 产品细节特写 | zoom_in（局部放大）|
| 情绪高潮段落 | particle（粒子效果）|
| IP出镜开口瞬间 | none（保持自然）|

## BGM 匹配规则

1. 同款优先：从 viral_analysis.bgm 提取风格，查 BGM 库同款曲目
2. 相似备选：同款不存在时，按风格（轻快/温馨/激昂）+ 节拍（BPM范围）匹配
3. 多段支持：一条视频可配置多段 BGM，节点跟随分镜情绪曲线切换
4. 音量规则：有口播的段落 BGM 音量 0.2，纯画面段落 0.5
```

### 用户 Prompt（User）

```
请根据以下脚本分镜和匹配素材，生成基础剪辑配置。

## 脚本分镜（含口播文案和配音标记）
{{script_scenes_json}}

## 素材匹配结果
{{material_match_json}}

## 参考爆款信息（用于 BGM 和转场风格参考）
- BGM 风格：{{viral_bgm}}
- 剪辑节奏：{{viral_edit_rhythm}}
- 情绪曲线：{{viral_emotion_curve}}

## 配音配置（仅对 use_original_audio=false 的分镜生效）
- 音色：{{voice_id}}
- 语速：{{voice_speed}}（默认 1.0）
- 情感：{{voice_emotion}}

## BGM 库可用曲目
{{bgm_library_json}}
示例格式：
[
  { "bgm_id": "bgm_001", "title": "轻风国韵", "style": "轻快国风", "bpm": 120, "duration_sec": 180 },
  { "bgm_id": "bgm_002", "title": "温柔时光", "style": "温馨抒情", "bpm": 80, "duration_sec": 200 }
]

## 目标平台
{{platform}}（影响分辨率和最大时长）

## 输出格式（严格按此 JSON 输出）

{
  "config": {
    "platform": "{{platform}}",
    "resolution": "1080x1920",
    "fps": 30,
    "estimated_duration_sec": 0,
    "voice_id": "{{voice_id}}",
    "voice_speed": 1.0,
    "voice_emotion": "{{voice_emotion}}"
  },
  "timeline": [
    {
      "scene_index": 1,
      "material_id": "主素材ID",
      "material_type": "product_display | product_explain | effect_demo | ip_lifestyle",
      "use_original_audio": false,
      "clip_start_sec": 0,
      "clip_end_sec": 5,
      "duration_sec": 5,
      "transition_in": "cut | fade | flash | wipe | zoom_out",
      "transition_reason": "选择该转场的原因",
      "effects": [
        { "type": "text_bounce | shake | zoom_in | particle | none", "timing": "0.5s", "target": "字幕/画面/局部" }
      ],
      "subtitle": {
        "text": "口播原文，use_original_audio=true 时留空",
        "position": "bottom",
        "style": "default"
      },
      "voiceover": {
        "enabled": true,
        "text": "口播原文，use_original_audio=true 时留空",
        "voice_id": "{{voice_id}}",
        "speed": 1.0
      }
    }
  ],
  "bgm_tracks": [
    {
      "bgm_id": "bgm_001",
      "start_sec": 0,
      "end_sec": 30,
      "volume": 0.2,
      "match_reason": "同款 / 风格相似-轻快国风"
    }
  ]
}
```

---

## Prompt 2：口播文案差异化改写

### 适用时机
Prompt 1 完成后，提取所有分镜的 voiceover.text，批量改写 N 个版本。

### 系统 Prompt（System）

```
你是黛莱皙品牌的短视频文案创作专家，精通快手/抖音平台语言风格。

你的任务是将一套口播文案改写为多个差异化版本，要求：
1. 核心意思和卖点完全保留，不得删减产品功效和促销信息
2. 每个版本的表达方式、用词、句式必须有明显差异
3. 语言风格贴合指定 IP 的说话习惯
4. 改写后的文案长度与原文接近（±10%），确保配音时长匹配
5. 输出必须严格遵循 JSON 格式，不得添加任何额外解释文字

## 差异化策略（每个版本至少使用2种）
- 换开头方式：疑问句/感叹句/陈述句 互换
- 换关键词表达：同义词替换，如"滋润"→"水润"→"补水"
- 换句式结构：长句拆短/短句合并
- 换口语化程度：更生活化/更专业化
- 换情感强度：平铺直叙/夸张强调
```

### 用户 Prompt（User）

```
请将以下口播文案改写为 {{version_count}} 个差异化版本。

## 原始口播文案（按分镜）
{{voiceover_scripts}}
示例格式：
[
  { "scene_index": 1, "text": "姐妹们，今天给你们带来一个好东西..." },
  { "scene_index": 2, "text": "这个木兰精华液，用了真的不一样..." }
]

## IP 语言风格
{{ip_style_guide}}
示例：猫七七阿姨风格：亲切、接地气、喜欢用"姐妹""闺女"称呼，常用感叹句

## 改写要求
- 版本数量：{{version_count}} 个
- 每个版本所有分镜文案必须整体风格一致
- 版本之间差异度要足够大，可通过查重校验

## 输出格式（严格按此 JSON 输出）

{
  "versions": [
    {
      "version_index": 1,
      "diff_strategies": ["换开头方式", "换关键词表达"],
      "scenes": [
        { "scene_index": 1, "text": "改写后的文案" },
        { "scene_index": 2, "text": "改写后的文案" }
      ]
    },
    {
      "version_index": 2,
      "diff_strategies": ["换句式结构", "换情感强度"],
      "scenes": [
        { "scene_index": 1, "text": "改写后的文案" },
        { "scene_index": 2, "text": "改写后的文案" }
      ]
    }
  ]
}
```

---

## 后端差异化引擎（非 AI，规则处理）

Prompt 2 完成后，后端按以下规则为每个版本叠加差异：

```text
版本N的最终配置 =
  基础配置（Prompt 1输出）
  + 文案版本N（Prompt 2输出）
  + 规则随机参数：
      voice_speed: 基准值 ± 0.05 随机浮动
      voice_emotion: 同情感类别内随机变体
      clip_start_sec: 素材有效范围内随机偏移 0-1秒（避免相同起始帧）
```

> BGM、转场、特效由 Prompt 1 智能决策，不在差异化引擎中随机处理，保证每个版本的剪辑逻辑一致。

---

## 数据库存储字段映射

### video_configs 剪辑配置表（每个版本一条）

| DB 字段 | 来源 | 类型 |
|---|---|---|
| `id` | 自动生成 | uuid |
| `script_id` | 关联脚本 | uuid FK |
| `version_index` | 第几个版本 | int |
| `platform` | config.platform | varchar |
| `resolution` | config.resolution | varchar |
| `estimated_duration_sec` | config.estimated_duration_sec | int |
| `voice_id` | config.voice_id | varchar |
| `diff_strategies` | versions[n].diff_strategies | jsonb |
| `timeline_json` | 完整时间轴配置 | jsonb |
| `bgm_style` | bgm.style | varchar |
| `status` | pending/rendering/done/failed | enum |
| `output_url` | 渲染完成后的视频地址 | text |

### video_scenes 分镜配置表

| DB 字段 | 来源 | 类型 |
|---|---|---|
| `config_id` | 关联主表 | uuid FK |
| `scene_index` | timeline[n].scene_index | int |
| `material_id` | timeline[n].material_id | uuid FK |
| `use_original_audio` | timeline[n].use_original_audio | boolean |
| `clip_start_sec` | timeline[n].clip_start_sec | float |
| `clip_end_sec` | timeline[n].clip_end_sec | float |
| `transition_in` | timeline[n].transition_in | varchar |
| `transition_reason` | timeline[n].transition_reason | text |
| `effects` | timeline[n].effects | jsonb |
| `subtitle_text` | timeline[n].subtitle.text | text |
| `voiceover_enabled` | timeline[n].voiceover.enabled | boolean |
| `voiceover_text` | timeline[n].voiceover.text | text |

### video_bgm_tracks BGM轨道表

| DB 字段 | 来源 | 类型 |
|---|---|---|
| `config_id` | 关联主表 | uuid FK |
| `bgm_id` | bgm_tracks[n].bgm_id | varchar |
| `start_sec` | bgm_tracks[n].start_sec | float |
| `end_sec` | bgm_tracks[n].end_sec | float |
| `volume` | bgm_tracks[n].volume | float |
| `match_reason` | bgm_tracks[n].match_reason | text |

---

## 调用策略

```text
用户设置版本数量 N，点击"开始混剪"
    ↓
【并行】
  ├── Prompt 1：生成基础剪辑配置（基于主素材）
  └── 后端素材组合算法：生成 N 套素材组合
    ↓（等两者都完成）
提取 Prompt 1 中所有 use_original_audio=false 分镜的 voiceover.text
    ↓
Prompt 2：一次性改写 N 个文案版本
    ↓
后端合并引擎（并行生成 N 个最终配置）：
  版本i = 基础剪辑配置（转场/特效/BGM不变）
        + 素材组合i（各分镜换对应备选素材）
        + 文案版本i（口播文案替换）
        + 随机规则参数（语速浮动 ±0.05，起始帧偏移 0-1s）
    ↓
写入 video_configs 表（N 条）
    ↓
并行提交剪辑引擎渲染
    ↓
前端展示 N 个版本的渲染进度和预览结果
```

> Prompt 1 与素材组合算法并行，互不依赖，节省等待时间。
> Prompt 2 单次调用输出全部 N 个文案版本，不重复调用 N 次。
> 转场、特效、BGM 由 Prompt 1 智能决策，所有版本共用，保证剪辑风格一致。
> N 条视频并行渲染，总耗时不随版本数线性增长。
