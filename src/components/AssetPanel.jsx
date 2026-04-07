import { useState, useRef, useEffect } from 'react'
import './AssetPanel.css'

const TABS = ['全部', '视频', '图片', '音频']
const TYPE_MAP = { MP4: '视频', mp4: '视频', jpg: '图片', png: '图片', mp3: '音频', wav: '音频', pdf: '文档' }

const MOCK_FILES = [
  { id: 1, name: '逆袭颠身 1_1', type: 'MP4', date: '今天更新', duration: '01:03', group: '今天', model: 'DINESSR-SD2.0Fast', prompt: '电影感，特写镜头，一只毛茸茸的银渐层英国短毛猫，睁着圆溜溜的、像琥珀一样的大眼睛，好奇地歪着头。它正伸出粉嫩的小爪子，试图触碰从窗户斜射进来的一束阳光，细小的尘埃在光柱中飞舞。环境是午后洒满阳光的木质窗台，光线温暖柔和，营造出宁静温馨的氛围。背景略微虚化，突出猫咪的可爱神态。' },
  { id: 2, name: '逆袭颠身 1_1', type: 'jpg', date: '今天更新', duration: '', group: '今天', model: 'Stable Diffusion XL', prompt: '高清写实风格，产品封面图，简洁背景，专业摄影' },
  { id: 3, name: '逆袭颠身 1_1', type: 'mp3', date: '今天更新', duration: '01:03', group: '今天', model: 'TTS-Pro', prompt: '温柔女声，语速适中，情感饱满' },
  { id: 4, name: '逆袭颠身 1_1', type: 'pdf', date: '今天更新', duration: '01:03', group: '今天', model: '', prompt: '' },
  { id: 5, name: '产品介绍视频', type: 'MP4', date: '昨天更新', duration: '02:15', group: '昨天', model: 'Wan2.1', prompt: '产品展示视频，专业打光，360度旋转展示，白色背景，高清4K' },
  { id: 6, name: '封面图设计', type: 'jpg', date: '昨天更新', duration: '', group: '昨天', model: 'FLUX.1', prompt: '电商封面，鲜艳色彩，吸引眼球，产品主图' },
  { id: 7, name: '配音文件', type: 'mp3', date: '昨天更新', duration: '00:45', group: '昨天', model: 'CosyVoice', prompt: '磁性男声，专业播音腔，节奏稳健' },
]

const FOLDER_FILES = {
  1: [
    { id: 101, name: '产品讲解视频', type: 'MP4', date: '今天更新', duration: '03:20', group: '视频' },
    { id: 102, name: '产品封面图', type: 'jpg', date: '今天更新', duration: '', group: '图片' },
    { id: 103, name: '产品配音', type: 'mp3', date: '今天更新', duration: '01:10', group: '音频' },
    { id: 104, name: '子文件夹', type: 'folder', date: '今天更新', duration: '', group: '文件夹' },
  ],
  2: [
    { id: 201, name: '日常vlog', type: 'MP4', date: '昨天更新', duration: '05:00', group: '视频' },
  ],
  3: [
    { id: 301, name: '爆款视频1', type: 'MP4', date: '今天更新', duration: '01:30', group: '视频' },
    { id: 302, name: '爆款视频2', type: 'MP4', date: '今天更新', duration: '02:00', group: '视频' },
  ],
}

const IcoFolder = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
  </svg>
)

const IcoMore = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
  </svg>
)

const IcoPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

const IcoSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
  </svg>
)

const IcoEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const IcoUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <path d="M12 16V6M8.5 9.5L12 6l3.5 3.5"/>
    <path d="M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1"/>
  </svg>
)

function AudioCover() {
  return (
    <div className="asset-cover cover-audio">
      <svg viewBox="0 0 48 32" fill="none" width="64" height="42">
        <rect x="0" y="14" width="4" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
        <rect x="6" y="10" width="4" height="12" rx="2" fill="rgba(255,255,255,0.65)"/>
        <rect x="12" y="6" width="4" height="20" rx="2" fill="rgba(255,255,255,0.8)"/>
        <rect x="18" y="2" width="4" height="28" rx="2" fill="rgba(255,255,255,0.95)"/>
        <rect x="24" y="8" width="4" height="16" rx="2" fill="rgba(255,255,255,0.8)"/>
        <rect x="30" y="12" width="4" height="8" rx="2" fill="rgba(255,255,255,0.65)"/>
        <rect x="36" y="10" width="4" height="12" rx="2" fill="rgba(255,255,255,0.5)"/>
        <rect x="42" y="14" width="4" height="4" rx="2" fill="rgba(255,255,255,0.35)"/>
      </svg>
    </div>
  )
}

function FileCover({ type }) {
  if (type === 'mp3' || type === 'wav') return <AudioCover/>
  const isVideo = type === 'MP4' || type === 'mp4'
  const isDoc = type === 'pdf' || type === 'doc'
  const isFolder = type === 'folder'
  const label = isVideo ? 'VIDEO' : isDoc ? 'word/pdf封面' : isFolder ? '文件夹封面' : '图片'
  return (
    <div className={`asset-cover ${isVideo ? 'cover-video' : isDoc ? 'cover-doc' : isFolder ? 'cover-folder' : 'cover-image'}`}>
      <span className="cover-label">{label}</span>
    </div>
  )
}

function CardMoreMenu({ onRename, onDownload, onMove, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="card-more-wrap" ref={ref}>
      <button className="asset-card-more" onClick={e => { e.stopPropagation(); setOpen(v => !v) }}><IcoMore/></button>
      {open && (
        <div className="card-context-menu">
          <button className="card-ctx-item" onClick={() => { onRename?.(); setOpen(false) }}>
            <svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11"><path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61z"/></svg>
            重命名
          </button>
          <button className="card-ctx-item" onClick={() => { onDownload?.(); setOpen(false) }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><path d="M12 16V4M8 12l4 4 4-4"/><path d="M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1"/></svg>
            下载
          </button>
          <button className="card-ctx-item" onClick={() => { onMove?.(); setOpen(false) }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/></svg>
            移动
          </button>
          <button className="card-ctx-item danger" onClick={() => { onDelete?.(); setOpen(false) }}>
            <svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11"><path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H.75a.75.75 0 010-1.5H3V1.75C3 .784 3.784 0 4.75 0h6.5C12.216 0 13 .784 13 1.75zM4.496 6.675L4.75 12.5h6.5l.254-5.825A.75.75 0 0112.996 6h.004a.75.75 0 01.75.75v.075l-.27 6.175A1.75 1.75 0 0111.73 14.5H4.27a1.75 1.75 0 01-1.75-1.5L2.25 6.825A.75.75 0 013 6.075h.004a.75.75 0 01.746.6z"/></svg>
            删除
          </button>
        </div>
      )}
    </div>
  )
}

const typeLabel = { MP4: '视频', mp4: '视频', jpg: '图片', png: '图片', mp3: '音频', wav: '音频' }

function DetailModal({ file, onClose }) {
  const isVideo = file.type === 'MP4' || file.type === 'mp4'
  const isImage = file.type === 'jpg' || file.type === 'png'
  const isAudio = file.type === 'mp3' || file.type === 'wav'
  const label = typeLabel[file.type] || file.type

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <div className="detail-media">
          <button className="detail-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><path d="M18 6L6 18M6 6l12 12"/></svg>
            关闭
          </button>
          {isVideo && (
            <video className="detail-video" controls>
              <source src="" type="video/mp4"/>
            </video>
          )}
          {isImage && (
            <div className="detail-image-wrap">
              <FileCover type={file.type}/>
            </div>
          )}
          {isAudio && (
            <div className="detail-audio-wrap">
              <AudioCover/>
              <audio className="detail-audio" controls>
                <source src="" type="audio/mpeg"/>
              </audio>
            </div>
          )}
          {!isVideo && !isImage && !isAudio && (
            <div className="detail-image-wrap"><FileCover type={file.type}/></div>
          )}
        </div>
        <div className="detail-panel">
          <div className="detail-panel-header">
            {isVideo && (
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <rect x="2" y="7" width="15" height="10" rx="2"/><path d="M17 9l5-2v10l-5-2"/>
              </svg>
            )}
            {isImage && (
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
              </svg>
            )}
            {isAudio && (
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            )}
            <span>{label}详情</span>
          </div>
          <div className="detail-panel-body">
            {file.model && (
              <div className="detail-field">
                <span className="detail-field-label">模型</span>
                <span className="detail-field-value">{file.model}</span>
              </div>
            )}
            {file.prompt && (
              <div className="detail-field">
                <span className="detail-field-label">提示词</span>
                <p className="detail-field-text">{file.prompt}</p>
              </div>
            )}
            <div className="detail-field">
              <span className="detail-field-label">文件名</span>
              <span className="detail-field-value">{file.name}.{file.type.toLowerCase()}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">更新时间</span>
              <span className="detail-field-value">{file.date}</span>
            </div>
            {file.duration && (
              <div className="detail-field">
                <span className="detail-field-label">时长</span>
                <span className="detail-field-value">{file.duration}</span>
              </div>
            )}
          </div>
          <div className="detail-panel-footer">
            <button className="detail-download-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <path d="M12 16V4M8 12l4 4 4-4"/><path d="M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1"/>
              </svg>
              下载{label}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AssetCard({ file, onOpen }) {
  return (
    <div className="asset-card" onClick={() => onOpen(file)}>
      <FileCover type={file.type}/>
      <div className="asset-card-row">
        <span className="asset-type-tag">{file.type}</span>
        {file.duration && <span className="asset-duration">{file.duration}</span>}
      </div>
      <div className="asset-card-info">
        <span className="asset-card-name">{file.name}</span>
        <div className="asset-card-bottom">
          <span className="asset-card-date">{file.date}</span>
          <CardMoreMenu/>
        </div>
      </div>
    </div>
  )
}

function FolderView({ folder, onBack }) {
  const files = FOLDER_FILES[folder.id] || []
  const groups = files.reduce((acc, f) => {
    if (!acc[f.group]) acc[f.group] = []
    acc[f.group].push(f)
    return acc
  }, {})
  const [renaming, setRenaming] = useState(false)
  const [folderName, setFolderName] = useState(folder.name)
  const inputRef = useRef(null)

  useEffect(() => { if (renaming) inputRef.current?.focus() }, [renaming])

  return (
    <div className="asset-main">
      <div className="asset-toolbar folder-toolbar">
        <div className="folder-title-wrap">
          {renaming ? (
            <input
              ref={inputRef}
              className="folder-rename-input"
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              onBlur={() => setRenaming(false)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setRenaming(false) }}
            />
          ) : (
            <h2 className="folder-title">
              {folderName}
              <button className="folder-title-edit" onClick={() => setRenaming(true)}><IcoEdit/></button>
            </h2>
          )}
        </div>
        <div className="asset-search">
          <IcoSearch/>
          <input placeholder="请输入关键词或自然语言检索，比如找到猫七七阿姨讲解护肤水的视频"/>
          <button className="asset-search-btn">搜索</button>
        </div>
      </div>

      <div className="folder-actions">
        <button className="folder-action-btn">
          <IcoUpload/> 本地上传
        </button>
        <button className="folder-action-btn">
          <IcoPlus/> 新建文件夹
        </button>
      </div>

      <div className="asset-content">
        {Object.entries(groups).map(([group, groupFiles]) => (
          <div key={group} className="asset-group">
            <div className="asset-group-header">
              <p className="asset-group-label">{group}</p>
              <button className="group-expand-btn">全部展开 (999) ›</button>
            </div>
            <div className="asset-grid">
              {groupFiles.map(f => <AssetCard key={f.id} file={f}/>)}
            </div>
          </div>
        ))}
        {files.length === 0 && <div className="asset-empty">暂无文件</div>}
      </div>
    </div>
  )
}

export default function AssetPanel() {
  const [activeTab, setActiveTab] = useState('全部')
  const [activeFolder, setActiveFolder] = useState('all')
  const [search, setSearch] = useState('')
  const [detailFile, setDetailFile] = useState(null)
  const [folders, setFolders] = useState([
    { id: 1, name: '产品讲解' },
    { id: 2, name: '阿姨日常' },
    { id: 3, name: '爆款视频' },
  ])
  const [folderMenu, setFolderMenu] = useState(null)
  const folderMenuRef = useRef(null)

  useEffect(() => {
    if (!folderMenu) return
    const handler = (e) => { if (folderMenuRef.current && !folderMenuRef.current.contains(e.target)) setFolderMenu(null) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [folderMenu])

  const addFolder = () => {
    setFolders(prev => [...prev, { id: Date.now(), name: `新文件夹 ${prev.length + 1}` }])
  }

  const deleteFolder = (id) => {
    setFolders(prev => prev.filter(f => f.id !== id))
    if (activeFolder === id) setActiveFolder('all')
  }

  const filtered = MOCK_FILES.filter(f => {
    if (activeTab !== '全部' && TYPE_MAP[f.type] !== activeTab) return false
    if (search && !f.name.includes(search)) return false
    return true
  })

  const groups = filtered.reduce((acc, f) => {
    if (!acc[f.group]) acc[f.group] = []
    acc[f.group].push(f)
    return acc
  }, {})

  const currentFolder = folders.find(f => f.id === activeFolder)

  return (
    <div className="asset-panel">
      <aside className="asset-sidebar">
        <button className={`asset-nav-item ${activeFolder === 'all' ? 'active' : ''}`} onClick={() => setActiveFolder('all')}>
          <IcoFolder/> 全部文件
        </button>
        <button className={`asset-nav-item ${activeFolder === 'mine' ? 'active' : ''}`} onClick={() => setActiveFolder('mine')}>
          <IcoFolder/> 我创建的
        </button>
        <div className="asset-folder-header">
          <span>主题文件夹</span>
          <button className="asset-folder-add" onClick={addFolder}><IcoPlus/></button>
        </div>
        {folders.map(f => (
          <div key={f.id} className={`asset-nav-item folder-item ${activeFolder === f.id ? 'active' : ''}`} onClick={() => setActiveFolder(f.id)}>
            <IcoFolder/>
            <span className="folder-name">{f.name}</span>
            <div className="folder-more-wrap" ref={folderMenu === f.id ? folderMenuRef : null}>
              <button className="folder-more" onClick={e => { e.stopPropagation(); setFolderMenu(folderMenu === f.id ? null : f.id) }}>
                <IcoMore/>
              </button>
              {folderMenu === f.id && (
                <div className="folder-context-menu">
                  <button className="card-ctx-item" onClick={() => setFolderMenu(null)}>
                    <svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11"><path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61z"/></svg>
                    重命名
                  </button>
                  <button className="card-ctx-item danger" onClick={() => { deleteFolder(f.id); setFolderMenu(null) }}>
                    <svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11"><path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H.75a.75.75 0 010-1.5H3V1.75C3 .784 3.784 0 4.75 0h6.5C12.216 0 13 .784 13 1.75zM4.496 6.675L4.75 12.5h6.5l.254-5.825A.75.75 0 0112.996 6h.004a.75.75 0 01.75.75v.075l-.27 6.175A1.75 1.75 0 0111.73 14.5H4.27a1.75 1.75 0 01-1.75-1.5L2.25 6.825A.75.75 0 013 6.075h.004a.75.75 0 01.746.6z"/></svg>
                    删除
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </aside>

      {currentFolder ? (
        <FolderView folder={currentFolder} onBack={() => setActiveFolder('all')}/>
      ) : (
        <div className="asset-main">
          <div className="asset-toolbar">
            <div className="asset-tabs">
              {TABS.map(t => (
                <button key={t} className={`asset-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
              ))}
            </div>
            <div className="asset-search">
              <IcoSearch/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="请输入关键词或自然语言检索，比如找到猫七七阿姨讲解护肤水的视频"/>
              <button className="asset-search-btn">搜索</button>
            </div>
          </div>
          <div className="asset-content">
            {Object.keys(groups).length === 0 ? (
              <div className="asset-empty">暂无文件</div>
            ) : (
              Object.entries(groups).map(([group, files]) => (
                <div key={group} className="asset-group">
                  <p className="asset-group-label">{group}</p>
                  <div className="asset-grid">
                    {files.map(f => <AssetCard key={f.id} file={f}/>)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
