import { useState, useEffect, useRef } from 'react'
import './MainContent.css'
import logoImg from '../assets/logo.png'

function TextMessage({ img, onDelete, onReEdit }) {
  const [hover, setHover] = useState(false)
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    const content = img.textContent || ''
    setDisplayed('')
    indexRef.current = 0
    const timer = setInterval(() => {
      indexRef.current += 3
      setDisplayed(content.slice(0, indexRef.current))
      if (indexRef.current >= content.length) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [img.textContent])

  return (
    <div
      className="message-group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="message-meta">
        <div className="msg-avatar">
          <img src={logoImg} alt="" onError={e => e.target.style.display = 'none'}/>
        </div>
        <span className="msg-prompt">{img.prompt}</span>
        <div className="msg-tags">
          <span className="msg-divider">|</span>
          <span className="msg-tag">文案创作</span>
          <span className="msg-divider">|</span>
          <span className="msg-tag">{img.imageModel || 'DINESSR-智能助手'}</span>
          <button className="msg-copy-btn" title="复制" onClick={() => navigator.clipboard.writeText(img.textContent || '')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="text-content-box">
        <div className="text-content markdown-body">
          <MarkdownRenderer content={displayed} />
          {displayed.length < (img.textContent || '').length && (
            <span className="stream-cursor"/>
          )}
        </div>
      </div>
      <div className={`msg-actions ${hover ? 'visible' : ''}`}>
        <button className="msg-action-btn" onClick={() => onReEdit(img)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          重新编辑
        </button>
        <button className="msg-action-btn" onClick={() => onReEdit(img)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/>
          </svg>
          再次生成
        </button>
        <div className="msg-action-sep"/>
        <button className="msg-action-btn danger" onClick={() => onDelete(img.id)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
          删除
        </button>
      </div>
    </div>
  )
}

function MarkdownRenderer({ content }) {
  const lines = content.split('\n')
  const elements = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^### (.+)/.test(line)) {
      elements.push(<h3 key={i}>{parseLine(line.replace(/^### /, ''))}</h3>)
    } else if (/^## (.+)/.test(line)) {
      elements.push(<h2 key={i}>{parseLine(line.replace(/^## /, ''))}</h2>)
    } else if (/^# (.+)/.test(line)) {
      elements.push(<h1 key={i}>{parseLine(line.replace(/^# /, ''))}</h1>)
    } else if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i}/>)
    } else if (/^[*-] (.+)/.test(line)) {
      elements.push(<li key={i}>{parseLine(line.replace(/^[*-] /, ''))}</li>)
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="md-spacer"/>)
    } else {
      elements.push(<p key={i}>{parseLine(line)}</p>)
    }
    i++
  }
  return <>{elements}</>
}

function parseLine(text) {
  const parts = []
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|【(.+?)】)/g
  let last = 0, m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>)
    else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>)
    else if (m[4]) parts.push(<span key={m.index} className="md-bracket">【{m[4]}】</span>)
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function ImageDetail({ img, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="detail-overlay">
      <div className="detail-preview">
        <button className="detail-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          关闭
        </button>
        <div className="detail-img-wrap" style={{'--card-ratio': ratioToCss(img.ratio)}}>
          <div className="detail-img-placeholder"/>
          <div className="detail-img-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
            点击放大查看细节
          </div>
        </div>
      </div>
      <div className="detail-info">
        <div className="detail-info-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          图片详情
        </div>
        <div className="detail-divider"/>
        <div className="detail-field"><span className="detail-label">模型</span><span>{img.imageModel || '图片5.0 Lite'}</span></div>
        <div className="detail-field"><span className="detail-label">提示词</span><span className="detail-prompt">{img.prompt}</span></div>
        <button className="detail-download">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          下载图片
        </button>
      </div>
    </div>
  )
}


function ratioToCss(ratio) {
  if (!ratio) return '1'
  const map = { '1:1': '1', '16:9': '16/9', '9:16': '9/16', '4:3': '4/3', '3:4': '3/4', '21:9': '21/9' }
  return map[ratio] || ratio.replace(':', '/')
}

function VoiceMessage({ img, onDelete, onReEdit }) {
  const [playing, setPlaying] = useState(null)

  return (
    <div className="message-group">
      <div className="message-meta">
        <div className="msg-avatar">
          <img src={logoImg} alt="" onError={e => e.target.style.display = 'none'}/>
        </div>
        <span className="msg-prompt">{img.prompt}</span>
        <div className="msg-tags">
          <span className="msg-divider">|</span>
          <span className="msg-tag">语音合成</span>
          <span className="msg-divider">|</span>
          <span className="msg-tag">{img.voiceModel || '猫七七阿姨'}</span>
        </div>
      </div>
      <div className="audio-cards-row">
        {[0, 1].map(i => (
          <div key={i} className="audio-card">
            <div className="audio-card-icon">
              {playing === i ? (
                <div className="audio-wave">
                  <span/><span/><span/><span/><span/>
                </div>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <rect x="2" y="10" width="2" height="4" rx="1"/>
                  <rect x="6" y="7" width="2" height="10" rx="1"/>
                  <rect x="10" y="4" width="2" height="16" rx="1"/>
                  <rect x="14" y="7" width="2" height="10" rx="1"/>
                  <rect x="18" y="10" width="2" height="4" rx="1"/>
                </svg>
              )}
            </div>
            <div className="audio-card-info">
              <span className="audio-card-name">{img.voiceModel || '猫七七阿姨'}配音</span>
              <span className="audio-card-duration">00：03</span>
            </div>
            <div className="audio-card-actions">
              <button className="audio-card-action-btn" title="下载" onClick={e => e.stopPropagation()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <button className="audio-card-action-btn" title="收藏" onClick={e => e.stopPropagation()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            </div>
            <button className="audio-card-play" onClick={e => { e.stopPropagation(); setPlaying(playing === i ? null : i) }}>
              {playing === i ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>
      <div className="msg-actions">
        <button className="msg-action-btn" onClick={() => onReEdit(img)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          重新编辑
        </button>
        <button className="msg-action-btn" onClick={() => onReEdit(img)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/>
          </svg>
          再次生成
        </button>
        <div className="msg-action-sep"/>
        <button className="msg-action-btn danger" onClick={() => onDelete(img.id)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
          删除
        </button>
      </div>
    </div>
  )
}


function MessageGroup({ img, onDelete, onReEdit }) {
  const [hover, setHover] = useState(false)
  const [detailIndex, setDetailIndex] = useState(null)

  return (
    <div
      className="message-group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="message-meta">
        <div className="msg-avatar">
          <img src={logoImg} alt="" onError={e => e.target.style.display = 'none'}/>
        </div>
        <span className="msg-prompt">{img.prompt}</span>
        <div className="msg-tags">
          <span className="msg-divider">|</span>
          <span className="msg-tag">{img.genType || '图片生成'}</span>
          <span className="msg-divider">|</span>
          <span className="msg-tag">{img.ratio}</span>
          <span className="msg-divider">|</span>
          <span className="msg-tag">{img.quality === '4k' ? '超清4K' : '高清2K'}</span>
        </div>
      </div>
      <div className="images-row">
        {[0, 1, 2, 3].map(j => {
          const isGenerating = img.progress !== undefined && img.progress < 100
          return (
            <div key={j} className={`image-card ${isGenerating ? 'generating' : ''}`} style={{'--card-ratio': ratioToCss(img.ratio)}} onClick={() => !isGenerating && setDetailIndex(j)}>
              {isGenerating && j === 0 && (
                <div className="image-card-progress">{img.progress}%造梦中</div>
              )}
              {!isGenerating && j === 3 && (
                <div className="image-card-actions">
                  <button className="image-card-btn" title="下载">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                  <button className="image-card-btn" title="收藏">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="msg-actions">
        <button className="msg-action-btn" onClick={() => onReEdit(img)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          重新编辑
        </button>
        <button className="msg-action-btn" onClick={() => onReEdit(img)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/>
          </svg>
          再次生成
        </button>
        <div className="msg-action-sep"/>
        <button className="msg-action-btn danger" onClick={() => onDelete(img.id)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
          删除
        </button>
      </div>
    </div>
  )
}

export default function MainContent({ images, onDelete, onReEdit }) {
  if (images.length === 0) {
    return (
      <div className="main-content empty-state">
        <div className="empty-orb">
          <div className="empty-orb-inner"/>
          <span className="empty-orb-figure">🦞</span>
        </div>
        <p className="empty-text">开启你的新创作</p>
      </div>
    )
  }

  return (
    <div className="main-content image-grid">
      {images.map((img) => (
        img.genType === '文案写作'
          ? <TextMessage key={img.id} img={img} onDelete={onDelete} onReEdit={onReEdit}/>
          : img.genType === '语音合成'
          ? <VoiceMessage key={img.id} img={img} onDelete={onDelete} onReEdit={onReEdit}/>
          : <MessageGroup key={img.id} img={img} onDelete={onDelete} onReEdit={onReEdit}/>
      ))}
    </div>
  )
}
