import { useState, useRef, useEffect } from 'react'
import './TopBar.css'

const ChevronDown = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" width="10" height="10">
    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" clipRule="evenodd"/>
  </svg>
)

const IcoClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
    <circle cx="12" cy="12" r="8"/>
    <path d="M12 8v4l3 2"/>
  </svg>
)

const IcoGen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
    <path d="M5 12h4M12 5v4M12 15v4M15 12h4"/>
    <rect x="8" y="8" width="8" height="8" rx="2"/>
  </svg>
)

const TIME_OPTIONS = ['全部', '今天', '最近7天', '最近30天']
const GEN_OPTIONS = ['全部', '文案写作', '图片生成', '视频生成', '语音合成', '数字人']

function FilterDropdown({ icon, label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="filter-dropdown-wrap" ref={ref}>
      <button className={`filter-btn ${open ? 'open' : ''}`} onClick={() => setOpen(v => !v)}>
        {icon}
        {value === '全部' ? label : value}
        <ChevronDown/>
      </button>
      {open && (
        <div className="filter-panel">
          {options.map(opt => (
            <button
              key={opt}
              className={`filter-option ${value === opt ? 'active' : ''}`}
              onClick={() => { onChange(opt); setOpen(false) }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TopBar({ currentSession, sessions, onSessionSelect, onNewSession, onRename, onDelete }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState(null) // { sessionId, x, y }
  const [renaming, setRenaming] = useState(null)
  const [timeFilter, setTimeFilter] = useState('全部')
  const [genFilter, setGenFilter] = useState('全部')
  const dropdownRef = useRef(null)
  const renameRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
        setContextMenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (renaming && renameRef.current) renameRef.current.focus()
  }, [renaming])

  const handleRenameSubmit = (id) => {
    if (renaming?.value?.trim()) onRename(id, renaming.value.trim())
    setRenaming(null)
    setContextMenu(null)
    setDropdownOpen(false)
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="session-selector" ref={dropdownRef}>
          <button
            className={`session-btn ${dropdownOpen ? 'open' : ''}`}
            onClick={() => {
              setDropdownOpen(v => !v)
              setContextMenu(null)
            }}
          >
            <span className="session-name">{currentSession.name}</span>
            <svg className="chevron" viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
              <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" clipRule="evenodd"/>
            </svg>
          </button>

          {dropdownOpen && (
            <div className="session-dropdown">
              <button className="new-session-btn" onClick={() => { onNewSession(); setDropdownOpen(false) }}>
                <span className="plus-icon">
                  <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                    <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
                  </svg>
                </span>
                新建对话
              </button>
              <div className="session-divider"/>
              <div className="session-list">
                {sessions.map(session => (
                  <div key={session.id} className={`session-item ${currentSession.id === session.id ? 'active' : ''}`}>
                    {renaming?.sessionId === session.id ? (
                      <input
                        ref={renameRef}
                        className="rename-input"
                        value={renaming.value}
                        onChange={e => setRenaming(r => ({ ...r, value: e.target.value }))}
                        onBlur={() => handleRenameSubmit(session.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameSubmit(session.id)
                          if (e.key === 'Escape') {
                            setRenaming(null)
                            setContextMenu(null)
                          }
                        }}
                      />
                    ) : (
                      <>
                        <div className="session-item-main" onClick={() => { onSessionSelect(session); setDropdownOpen(false) }}>
                          <span className="session-item-name">{session.name}</span>
                          <span className="session-item-date">{session.date}</span>
                        </div>
                        {currentSession.id === session.id && (
                          <span className="check-icon">
                            <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                              <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" clipRule="evenodd"/>
                            </svg>
                          </span>
                        )}
                        <button className={`more-btn ${contextMenu?.sessionId === session.id ? 'active' : ''}`} onClick={e => { e.stopPropagation(); if (contextMenu?.sessionId === session.id) { setContextMenu(null) } else { const r = e.currentTarget.getBoundingClientRect(); setContextMenu({ sessionId: session.id, x: r.right + 4, y: r.top }) } }}>
                          <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                            <path d="M3 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9.5 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right">
        <div className="filter-box">
          <FilterDropdown icon={<IcoClock/>} label="时间" options={TIME_OPTIONS} value={timeFilter} onChange={setTimeFilter}/>
          <div className="filter-sep"/>
          <FilterDropdown icon={<IcoGen/>} label="生成类型" options={GEN_OPTIONS} value={genFilter} onChange={setGenFilter}/>
        </div>
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }}
        >
          {sessions.filter(s => s.id === contextMenu.sessionId).map(session => (
            <div key={session.id}>
              <button className="ctx-item" onClick={() => { setRenaming({ sessionId: session.id, value: session.name }); setContextMenu(null) }}>
                <svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11"><path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61z"/></svg>
                重命名
              </button>
              <button className="ctx-item danger" onClick={() => { onDelete(session.id); setContextMenu(null); setDropdownOpen(false) }}>
                <svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11"><path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H.75a.75.75 0 010-1.5H3V1.75C3 .784 3.784 0 4.75 0h6.5C12.216 0 13 .784 13 1.75zM4.496 6.675L4.75 12.5h6.5l.254-5.825A.75.75 0 0112.996 6h.004a.75.75 0 01.75.75v.075l-.27 6.175A1.75 1.75 0 0111.73 14.5H4.27a1.75 1.75 0 01-1.75-1.5L2.25 6.825A.75.75 0 013 6.075h.004a.75.75 0 01.746.6z"/></svg>
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </header>
  )
}
