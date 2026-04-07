import { useState, useEffect, useRef } from 'react'
import './MainContent.css'
import logoImg from '../assets/logo.png'
import {
  Pencil, RotateCcw, Trash2, Copy, Download, Star,
  Play, Pause, ZoomIn, Image as ImageIcon, X, Music
} from 'lucide-react'

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
        <div className="msg-prompt-wrap">
          <span className="msg-prompt">{img.prompt}</span>
          <span className="msg-tags">
            <span className="msg-divider">|</span>
            <span className="msg-tag">文案创作</span>
            <span className="msg-divider">|</span>
            <span className="msg-tag">{img.imageModel || 'DINESSR-智能助手'}</span>
            <button className="msg-copy-btn" title="复制" onClick={() => navigator.clipboard.writeText(img.textContent || '')}>
              <Copy size={13} strokeWidth={1.6}/>
            </button>
          </span>
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
          <Pencil size={13} strokeWidth={1.6}/>
          重新编辑
        </button>
        <button className="msg-action-btn" onClick={() => onReEdit(img)}>
          <RotateCcw size={13} strokeWidth={1.6}/>
          再次生成
        </button>
        <div className="msg-action-sep"/>
        <button className="msg-action-btn danger" onClick={() => onDelete(img.id)}>
          <Trash2 size={13} strokeWidth={1.6}/>
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
          <X size={13} strokeWidth={2}/>
          关闭
        </button>
        <div className="detail-img-wrap" style={{'--card-ratio': ratioToCss(img.ratio)}}>
          <div className="detail-img-placeholder"/>
          <div className="detail-img-hint">
            <ZoomIn size={13} strokeWidth={1.6}/>
            点击放大查看细节
          </div>
        </div>
      </div>
      <div className="detail-info">
        <div className="detail-info-header">
          <ImageIcon size={14} strokeWidth={1.6}/>
          图片详情
        </div>
        <div className="detail-divider"/>
        <div className="detail-field"><span className="detail-label">模型</span><span>{img.imageModel || '图片5.0 Lite'}</span></div>
        <div className="detail-field"><span className="detail-label">提示词</span><span className="detail-prompt">{img.prompt}</span></div>
        <button className="detail-download">
          <Download size={14} strokeWidth={2}/>
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
        <div className="msg-prompt-wrap">
          <span className="msg-prompt">{img.prompt}</span>
          <span className="msg-tags">
            <span className="msg-divider">|</span>
            <span className="msg-tag">语音合成</span>
            <span className="msg-divider">|</span>
            <span className="msg-tag">{img.voiceModel || '猫七七阿姨'}</span>
          </span>
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
                <Music size={16} strokeWidth={1.8}/>
              )}
            </div>
            <div className="audio-card-info">
              <span className="audio-card-name">{img.voiceModel || '猫七七阿姨'}配音</span>
              <span className="audio-card-duration">00：03</span>
            </div>
            <div className="audio-card-actions">
              <button className="audio-card-action-btn" title="下载" onClick={e => e.stopPropagation()}>
                <Download size={12} strokeWidth={2}/>
              </button>
              <button className="audio-card-action-btn" title="收藏" onClick={e => e.stopPropagation()}>
                <Star size={12} strokeWidth={2}/>
              </button>
            </div>
            <button className="audio-card-play" onClick={e => { e.stopPropagation(); setPlaying(playing === i ? null : i) }}>
              {playing === i ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
            </button>
          </div>
        ))}
      </div>
      <div className="msg-actions">
        <button className="msg-action-btn" onClick={() => onReEdit(img)}>
          <Pencil size={13} strokeWidth={1.6}/>
          重新编辑
        </button>
        <button className="msg-action-btn" onClick={() => onReEdit(img)}>
          <RotateCcw size={13} strokeWidth={1.6}/>
          再次生成
        </button>
        <div className="msg-action-sep"/>
        <button className="msg-action-btn danger" onClick={() => onDelete(img.id)}>
          <Trash2 size={13} strokeWidth={1.6}/>
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
        <div className="msg-prompt-wrap">
          <span className="msg-prompt">{img.prompt}</span>
          <span className="msg-tags">
            <span className="msg-divider">|</span>
            <span className="msg-tag">{img.genType || '图片生成'}</span>
            <span className="msg-divider">|</span>
            <span className="msg-tag">{img.ratio}</span>
            <span className="msg-divider">|</span>
            <span className="msg-tag">{img.quality === '4k' ? '超清4K' : '高清2K'}</span>
          </span>
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
                    <Download size={13} strokeWidth={2}/>
                  </button>
                  <button className="image-card-btn" title="收藏">
                    <Star size={13} strokeWidth={2}/>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="msg-actions">
        <button className="msg-action-btn" onClick={() => onReEdit(img)}>
          <Pencil size={13} strokeWidth={1.6}/>
          重新编辑
        </button>
        <button className="msg-action-btn" onClick={() => onReEdit(img)}>
          <RotateCcw size={13} strokeWidth={1.6}/>
          再次生成
        </button>
        <div className="msg-action-sep"/>
        <button className="msg-action-btn danger" onClick={() => onDelete(img.id)}>
          <Trash2 size={13} strokeWidth={1.6}/>
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
