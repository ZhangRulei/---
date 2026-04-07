import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import './VoicePanel.css'

const VOICE_TABS = ['通用音色', '我创建的']

const VOICES = [
  { id: 1, name: '猫七七阿姨', tags: ['多情感'], emotions: ['中性', '沮丧', '开心', '愤怒'] },
  { id: 2, name: '叔叔', tags: ['多情感'], emotions: ['中性', '沮丧'] },
  { id: 3, name: '猫七七', tags: ['多情感'], emotions: ['中性', '开心'] },
  { id: 4, name: '尹若涵（妞妞）', tags: ['多情感'], emotions: ['中性', '沮丧', '开心'] },
  { id: 5, name: '通用女声', tags: [], emotions: ['中性'] },
  { id: 6, name: '通用男声', tags: [], emotions: ['中性'] },
]

const IcoPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const IcoSliders = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
    <line x1="4" y1="6" x2="20" y2="6"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
    <line x1="6" y1="18" x2="18" y2="18"/>
  </svg>
)

function ConfigPopover({ voice, speed, volume, emotion, onSpeed, onVolume, onEmotion, onConfirm, anchorEl, onClose }) {
  const popRef = useRef(null)
  const [pos, setPos] = useState({ top: -9999, left: -9999 })

  useLayoutEffect(() => {
    if (!anchorEl || !popRef.current) return
    const rect = anchorEl.getBoundingClientRect()
    const popW = popRef.current.offsetWidth || 240
    const popH = popRef.current.offsetHeight || 200
    let left = rect.left
    let top = rect.bottom + 8
    if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8
    if (top + popH > window.innerHeight - 8) top = rect.top - popH - 8
    setPos({ top, left })
  }, [anchorEl])

  useEffect(() => {
    const handler = (e) => {
      if (
        popRef.current && !popRef.current.contains(e.target) &&
        anchorEl && !anchorEl.contains(e.target)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, anchorEl])

  return createPortal(
    <div
      ref={popRef}
      className="vp-popover"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="vp-slider-row">
        <span className="vp-slider-label">语速</span>
        <input type="range" min="-10" max="10" value={speed}
          onChange={e => onSpeed(Number(e.target.value))} className="vp-slider"/>
        <span className="vp-slider-val">{speed}</span>
      </div>
      <div className="vp-slider-row">
        <span className="vp-slider-label">音量</span>
        <input type="range" min="-10" max="10" value={volume}
          onChange={e => onVolume(Number(e.target.value))} className="vp-slider"/>
        <span className="vp-slider-val">{volume}</span>
      </div>
      {voice.emotions.length > 1 && (
        <div className="vp-emotion-row">
          <span className="vp-slider-label">情感</span>
          <div className="vp-emotions">
            {voice.emotions.map(em => (
              <button key={em}
                className={`vp-emotion-btn ${emotion === em ? 'active' : ''}`}
                onClick={() => onEmotion(em)}>{em}</button>
            ))}
          </div>
        </div>
      )}
      <button className="vp-confirm-btn" onClick={onConfirm}>确认</button>
    </div>,
    document.body
  )
}

export default function VoicePanel({ value, onChange }) {
  const [tab, setTab] = useState('通用音色')
  const [selectedId, setSelectedId] = useState(value?.id || 1)
  const [openConfigId, setOpenConfigId] = useState(null)
  const [speed, setSpeed] = useState(0)
  const [volume, setVolume] = useState(0)
  const [emotion, setEmotion] = useState('中性')

  const configBtnRefs = useRef({})

  const selectedVoice = VOICES.find(v => v.id === selectedId) || VOICES[0]
  const configVoice = VOICES.find(v => v.id === openConfigId)

  const handleSelectVoice = (voice) => {
    setSelectedId(voice.id)
    setEmotion(voice.emotions[0] || '中性')
    if (openConfigId !== voice.id) setOpenConfigId(null)
  }

  const handleToggleConfig = (e, voice) => {
    e.stopPropagation()
    setOpenConfigId(prev => prev === voice.id ? null : voice.id)
  }

  const handleConfirm = useCallback(() => {
    onChange?.({ ...selectedVoice, speed, volume, emotion })
    setOpenConfigId(null)
  }, [selectedVoice, speed, volume, emotion, onChange])

  const closePopover = useCallback(() => setOpenConfigId(null), [])

  return (
    <div className="vp-panel">
      <div className="vp-tabs">
        {VOICE_TABS.map(t => (
          <button key={t} className={`vp-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="vp-row">
        {VOICES.map(v => (
          <div
            key={v.id}
            className={`vp-card ${selectedId === v.id ? 'selected' : ''}`}
            onClick={() => handleSelectVoice(v)}
          >
            <div className="vp-avatar"><IcoPlay/></div>
            <div className="vp-card-body">
              <span className="vp-card-name">{v.name}</span>
              <div className="vp-card-tags">
                {v.tags.map(t => <span key={t} className="vp-tag">{t}</span>)}
              </div>
            </div>
            {selectedId === v.id && (
              <button
                ref={el => { configBtnRefs.current[v.id] = el }}
                className={`vp-config-btn ${openConfigId === v.id ? 'active' : ''}`}
                onClick={e => handleToggleConfig(e, v)}
              >
                <IcoSliders/>
              </button>
            )}
          </div>
        ))}
      </div>

      {openConfigId && configVoice && (
        <ConfigPopover
          voice={configVoice}
          speed={speed}
          volume={volume}
          emotion={emotion}
          onSpeed={setSpeed}
          onVolume={setVolume}
          onEmotion={setEmotion}
          onConfirm={handleConfirm}
          anchorEl={configBtnRefs.current[openConfigId]}
          onClose={closePopover}
        />
      )}
    </div>
  )
}
