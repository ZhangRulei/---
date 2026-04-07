import { useEffect, useMemo, useRef, useState } from 'react'
import './InputBar.css'
import VoicePanel from './VoicePanel'

const GEN_TYPES = ['文案写作', '图片生成', '视频生成', '语音合成', '数字人']
const IMAGE_MODELS = ['图片5.0 Lite', '图片5.0 Pro', 'Nano banana2']
const VIDEO_MODELS = ['Seedance 2.0 Fast VIP', 'Seedance 2.0 Pro']
const VOICE_MODELS = ['克隆声音', '通用女声', '通用男声']

const RATIOS = [
  { label: '智能', value: 'auto' },
  { label: '21:9', value: '21:9' },
  { label: '16:9', value: '16:9' },
  { label: '3:2', value: '3:2' },
  { label: '4:3', value: '4:3' },
  { label: '1:1', value: '1:1' },
  { label: '3:4', value: '3:4' },
  { label: '2:3', value: '2:3' },
  { label: '9:16', value: '9:16' },
]

const QUALITIES = [
  { label: '高清 2K', value: '2k' },
  { label: '超清 4K', value: '4k', premium: true },
]

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.9',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  width: 13,
  height: 13,
}

const IcoText = () => (
  <svg {...svgProps}>
    <path d="M5 18l4.2-12h1.6L15 18"/>
    <path d="M7.2 12.3h5.6"/>
    <path d="M17.5 7.5h1.5M17.5 11.5h1.5M17.5 15.5h1.5"/>
  </svg>
)

const IcoImage = () => (
  <svg {...svgProps}>
    <rect x="4" y="5" width="16" height="14" rx="3"/>
    <circle cx="9" cy="10" r="1.6"/>
    <path d="M20 16l-4.8-4.8L8 18"/>
  </svg>
)

const IcoVideo = () => (
  <svg {...svgProps}>
    <rect x="3" y="6" width="13" height="12" rx="2.5"/>
    <path d="M16 10l5-3v10l-5-3"/>
  </svg>
)

const IcoVoice = () => (
  <svg {...svgProps}>
    <rect x="9" y="4" width="6" height="10" rx="3"/>
    <path d="M5 10a7 7 0 0014 0M12 17v3M8 20h8"/>
  </svg>
)

const IcoDigital = () => (
  <svg {...svgProps}>
    <rect x="5" y="3" width="14" height="18" rx="4"/>
    <circle cx="12" cy="10" r="2.5"/>
    <path d="M9 16.5a4.2 4.2 0 016 0"/>
  </svg>
)

const IcoModel = () => (
  <svg {...svgProps}>
    <path d="M4 8l8-4 8 4-8 4-8-4z"/>
    <path d="M4 12l8 4 8-4"/>
    <path d="M4 16l8 4 8-4"/>
  </svg>
)

const IcoDuration = () => (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="8"/>
    <path d="M12 8v4l3 2"/>
  </svg>
)

const IcoUpload = () => (
  <svg {...svgProps}>
    <path d="M12 16V6M8.5 9.5L12 6l3.5 3.5"/>
    <path d="M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1"/>
  </svg>
)

const IcoAt = () => (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="4"/>
    <path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"/>
  </svg>
)

const IcoChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="10" height="10">
    <path d="M6 9l6 6 6-6"/>
  </svg>
)

const IcoCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)

function RatioIcon({ value, size = 13 }) {
  const map = {
    auto: [size, size],
    '21:9': [size * 1.4, size * 0.6],
    '16:9': [size * 1.25, size * 0.7],
    '3:2': [size * 1.1, size * 0.75],
    '4:3': [size, size * 0.75],
    '1:1': [size, size],
    '3:4': [size * 0.75, size],
    '2:3': [size * 0.7, size * 1.05],
    '9:16': [size * 0.6, size * 1.1],
  }
  const [w, h] = map[value] || [size, size]
  const rw = Math.max(Math.round(w), 6)
  const rh = Math.max(Math.round(h), 6)
  return (
    <svg viewBox={`0 0 ${rw} ${rh}`} fill="none" width={rw} height={rh} style={{ minWidth: rw, flexShrink: 0 }}>
      <rect x="1" y="1" width={rw - 2} height={rh - 2} rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function UploadSlot({ label }) {
  return (
    <button className="upload-slot" type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      <span>{label}</span>
    </button>
  )
}

function getGenTypeIcon(type) {
  if (type === '文案写作') return <IcoText/>
  if (type === '图片生成') return <IcoImage/>
  if (type === '视频生成') return <IcoVideo/>
  if (type === '语音合成') return <IcoVoice/>
  return <IcoDigital/>
}

export default function InputBar({ onGenerate, reEditData, onReEditDone }) {
  const [genType, setGenType] = useState('文案写作')
  const [text, setText] = useState('')
  const [motionText, setMotionText] = useState('')

  const [imageModel, setImageModel] = useState(IMAGE_MODELS[0])
  const [videoModel, setVideoModel] = useState(VIDEO_MODELS[0])
  const [voiceModel, setVoiceModel] = useState(VOICE_MODELS[0])

  const [ratio, setRatio] = useState('16:9')
  const [quality, setQuality] = useState('2k')
  const [duration, setDuration] = useState('4s')
  const [frameMode, setFrameMode] = useState('首尾帧')
  const [digitalMode, setDigitalMode] = useState('快速模式')

  const [showRatio, setShowRatio] = useState(false)
  const [showQuality, setShowQuality] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const [showGenType, setShowGenType] = useState(false)
  const [showVoicePanel, setShowVoicePanel] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState({ id: 1, name: '猫七七阿姨' })

  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  // 回填重新编辑数据
  useEffect(() => {
    if (!reEditData) return
    setText(reEditData.prompt || '')
    if (reEditData.genType) setGenType(reEditData.genType)
    if (reEditData.ratio) setRatio(reEditData.ratio)
    if (reEditData.quality) setQuality(reEditData.quality)
    if (reEditData.imageModel) setImageModel(reEditData.imageModel)
    if (reEditData.videoModel) setVideoModel(reEditData.videoModel)
    setTimeout(() => inputRef.current?.focus(), 50)
    onReEditDone?.()
  }, [reEditData])

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowRatio(false)
        setShowModel(false)
        setShowGenType(false)
        setShowVoicePanel(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  const isTextMode = genType === '文案写作'
  const isImageMode = genType === '图片生成'
  const isVideoMode = genType === '视频生成'
  const isVoiceMode = genType === '语音合成'
  const isDigitalMode = genType === '数字人'

  const placeholder = useMemo(() => {
    if (isImageMode) return '上传参考图，输入文字或 @ 主体，描述你想生成的图片。'
    if (isVideoMode) return '输入文字，描述你想创作的画面内容、运动方式。例：一个3D小男孩在公园滑滑板。'
    if (isVoiceMode) return '输入配音文案，例如：你好，欢迎来到我的频道。'
    if (isDigitalMode) return '请输入你希望角色说出的内容'
    return '请输入你的创作需求，如:写一段木兰系列的短视频脚本....'
  }, [isImageMode, isVideoMode, isVoiceMode, isDigitalMode])

  const closeMenus = () => {
    setShowRatio(false)
    setShowQuality(false)
    setShowModel(false)
    setShowGenType(false)
  }

  const selectGenType = (type) => {
    setGenType(type)
    closeMenus()
  }

  const handleGenerate = () => {
    if (!text.trim() && !motionText.trim()) return
    onGenerate({
      prompt: text,
      motionText,
      genType,
      imageModel,
      videoModel,
      voiceModel,
      ratio,
      quality,
      duration,
      frameMode,
      digitalMode,
    })
    setText('')
    setMotionText('')
  }

  const currentModel = isVideoMode ? videoModel : isVoiceMode ? voiceModel : imageModel
  const modelList = isVideoMode ? VIDEO_MODELS : isVoiceMode ? VOICE_MODELS : IMAGE_MODELS

  return (
    <div className="inputbar-wrap" ref={wrapRef}>
      <div className="inputbar">
        <div className="upload-area">
          {isImageMode && <UploadSlot label="参考图"/>}
          {isVideoMode && (
            <div className="upload-row">
              <UploadSlot label="首帧"/>
              <span className="slot-connector">⇄</span>
              <UploadSlot label="尾帧"/>
            </div>
          )}
          {isDigitalMode && (
            <div className="upload-row">
              <UploadSlot label="角色"/>
              <UploadSlot label="音色"/>
            </div>
          )}
          {isVoiceMode && (
            <div className="gen-type-wrap">
              <div className="voice-preview-card" onClick={() => setShowVoicePanel(v => !v)}>
                <div className="voice-preview-cover">
                  <svg viewBox="0 0 36 24" fill="none" width="36" height="24">
                    <rect x="0" y="9" width="3" height="6" rx="1.5" fill="rgba(255,255,255,0.6)"/>
                    <rect x="5" y="5" width="3" height="14" rx="1.5" fill="rgba(255,255,255,0.8)"/>
                    <rect x="10" y="2" width="3" height="20" rx="1.5" fill="rgba(255,255,255,0.95)"/>
                    <rect x="15" y="6" width="3" height="12" rx="1.5" fill="rgba(255,255,255,0.8)"/>
                    <rect x="20" y="9" width="3" height="6" rx="1.5" fill="rgba(255,255,255,0.6)"/>
                    <rect x="25" y="4" width="3" height="16" rx="1.5" fill="rgba(255,255,255,0.75)"/>
                    <rect x="30" y="8" width="3" height="8" rx="1.5" fill="rgba(255,255,255,0.55)"/>
                  </svg>
                </div>
                <span className="voice-preview-name">{selectedVoice.name}</span>
                <button type="button" className="voice-play">▶</button>
              </div>
              {showVoicePanel && (
                <div className="gentype-float-panel voice-float-panel">
                  <VoicePanel
                    value={selectedVoice}
                    onChange={(v) => { setSelectedVoice(v); setShowVoicePanel(false) }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {!isDigitalMode && (
          <textarea
            className="prompt-input"
            placeholder={placeholder}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleGenerate()
              }
            }}
            rows={1}
          />
        )}

        {isDigitalMode && (
          <div className="digital-inputs">
            <label className="digital-row">
              <span className="digital-label">说话内容</span>
              <input className="digital-text" value={text} onChange={e => setText(e.target.value)} placeholder={placeholder} />
            </label>
            <label className="digital-row">
              <span className="digital-label">动作描述</span>
              <input className="digital-text" value={motionText} onChange={e => setMotionText(e.target.value)} placeholder="(可选) 镜头推进、点头、挥手等" />
            </label>
          </div>
        )}

        <div className="toolbar">
          <div className="toolbar-left">
            <div className="gen-type-wrap">
              <button className={`flat-btn flat-btn-accent ${showGenType ? 'open' : ''}`} onClick={(e) => {
                e.stopPropagation()
                setShowModel(false)
                setShowRatio(false)
                setShowGenType(v => !v)
              }}>
                {getGenTypeIcon(genType)}
                <span>{genType}</span>
                <IcoChevron/>
              </button>

              {showGenType && (
                <div className="gentype-float-panel" onMouseDown={(e) => e.stopPropagation()}>
                  <p className="panel-label">生成类型</p>
                  {GEN_TYPES.map(type => (
                    <button key={type} className={`model-item ${genType === type ? 'active' : ''}`} onClick={() => selectGenType(type)}>
                      {getGenTypeIcon(type)}
                      <span>{type}</span>
                      {genType === type && <span className="check-ml"><IcoCheck/></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!isTextMode && <div className="toolbar-sep"/>}

            {isTextMode && (
              <button className="flat-btn">
                <IcoModel/>
                <span>DINESSR智能助手</span>
              </button>
            )}

            {isImageMode && (
              <>
                <div className="gen-type-wrap">
                  <button className={`flat-btn is-selected ${showModel ? 'open' : ''}`} onClick={() => { setShowGenType(false); setShowRatio(false); setShowQuality(false); setShowModel(v => !v) }}>
                    <IcoModel/>
                    <span>{imageModel}</span>
                  </button>
                  {showModel && (
                    <div className="gentype-float-panel">
                      <p className="panel-label">选择模型</p>
                      {IMAGE_MODELS.map(m => (
                        <button key={m} className={`model-item ${imageModel === m ? 'active' : ''}`} onClick={() => { setImageModel(m); setShowModel(false) }}>
                          <IcoModel/>
                          <span>{m}</span>
                          {imageModel === m && <span className="check-ml"><IcoCheck/></span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="gen-type-wrap">
                  <button className={`flat-btn ${showRatio ? 'open' : ''}`} onClick={() => { setShowGenType(false); setShowModel(false); setShowQuality(false); setShowRatio(v => !v) }}>
                    <RatioIcon value={ratio} size={12}/>
                    <span>{ratio === 'auto' ? '自动' : ratio}</span>
                  </button>
                  {showRatio && (
                    <div className="gentype-float-panel" style={{ minWidth: 292 }}>
                      <p className="panel-label">选择比例</p>
                      <div className="ratio-grid">
                        {RATIOS.map(r => (
                          <button key={r.value} className={`ratio-item ${ratio === r.value ? 'active' : ''}`} onClick={() => setRatio(r.value)}>
                            <span className="ratio-icon-wrap"><RatioIcon value={r.value}/></span>
                            <span className="ratio-label">{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="gen-type-wrap">
                  <button className={`flat-btn ${showQuality ? 'open' : ''}`} onClick={() => { setShowGenType(false); setShowModel(false); setShowRatio(false); setShowQuality(v => !v) }}>
                    <IcoDuration/>
                    <span>{quality === '4k' ? '超清4K' : '高清2K'}</span>
                  </button>
                  {showQuality && (
                    <div className="gentype-float-panel" style={{ minWidth: 200 }}>
                      <p className="panel-label">选择分辨率</p>
                      <div className="quality-row">
                        {QUALITIES.map(q => (
                          <button key={q.value} className={`quality-btn ${quality === q.value ? 'active' : ''} ${q.premium ? 'premium' : ''}`} onClick={() => { setQuality(q.value); setShowQuality(false) }}>
                            {q.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button className="flat-btn">
                  <IcoAt/>
                </button>
              </>
            )}

            {isVideoMode && (
              <>
                <div className="gen-type-wrap">
                  <button className={`flat-btn is-selected ${showModel ? 'open' : ''}`} onClick={() => { setShowGenType(false); setShowRatio(false); setShowModel(v => !v) }}>
                    <IcoModel/>
                    <span>{videoModel}</span>
                  </button>
                  {showModel && (
                    <div className="gentype-float-panel">
                      <p className="panel-label">选择模型</p>
                      {VIDEO_MODELS.map(m => (
                        <button key={m} className={`model-item ${videoModel === m ? 'active' : ''}`} onClick={() => { setVideoModel(m); setShowModel(false) }}>
                          <IcoModel/>
                          <span>{m}</span>
                          {videoModel === m && <span className="check-ml"><IcoCheck/></span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="flat-btn" onClick={() => setFrameMode(frameMode === '首尾帧' ? '全能参考' : '首尾帧')}>
                  <IcoImage/>
                  <span>{frameMode}</span>
                  <IcoChevron/>
                </button>
                <button className={`flat-btn ${showRatio ? 'open' : ''}`} onClick={() => { setShowGenType(false); setShowModel(false); setShowRatio(v => !v) }}>
                  <RatioIcon value={ratio} size={12}/>
                  <span>{ratio}</span>
                </button>
                <button className="flat-btn" onClick={() => setDuration(duration === '4s' ? '8s' : '4s')}>
                  <IcoDuration/>
                  <span>{duration}</span>
                </button>
              </>
            )}

            {isDigitalMode && (
              <>
                <button className="flat-btn" onClick={() => setDigitalMode(digitalMode === '快速模式' ? '专业模式' : '快速模式')}>
                  <IcoModel/>
                  <span>{digitalMode}</span>
                </button>
                <button className="flat-btn">
                  <IcoUpload/>
                  <span>上传音频</span>
                </button>
              </>
            )}
          </div>

          <div className="toolbar-right">
            <span className="credit-count">✦ {isVideoMode ? '44' : isImageMode ? '0/张' : '0'}</span>
            <button className={`send-btn ${text.trim() || motionText.trim() ? 'ready' : ''}`} onClick={handleGenerate}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
