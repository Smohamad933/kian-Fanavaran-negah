import { useMemo, useState } from 'react';
import {
  Activity, Archive, ArrowDown, ArrowDownToLine, ArrowUp, BadgeCheck, Bell,
  Check, ChevronDown, ChevronRight, CircleHelp, Clock3, CloudDownload, Copy, FileArchive,
  FileImage, FileText, Film, Folder, FolderDown, HardDrive, Image, Link2, ListFilter,
  LockKeyhole, Menu, MoreHorizontal, Music2, Pause, Play, Plus, Search, Settings2,
  ShieldCheck, Smartphone, Square, Trash2, Video, X, Zap,
} from 'lucide-react';

type DownloadItem = {
  id: number; name: string; category: string; size: string; progress: number;
  status: 'Downloading' | 'Paused' | 'Complete' | 'Queued'; speed: string; icon: 'video' | 'music' | 'archive' | 'image' | 'doc' | 'app'; color?: string;
};

const initialItems: DownloadItem[] = [
  { id: 1, name: 'Planet.Earth.III.2160p.WEB-DL.mkv', category: 'Video · 4K HDR', size: '8.42 GB', progress: 68, status: 'Downloading', speed: '12.8 MB/s', icon: 'video' },
  { id: 2, name: 'Midnight City — M83.flac', category: 'Music · FLAC', size: '38.6 MB', progress: 100, status: 'Complete', speed: '—', icon: 'music' },
  { id: 3, name: 'KFN-Brand-Guidelines-v4.zip', category: 'Compressed · ZIP', size: '246 MB', progress: 42, status: 'Downloading', speed: '5.2 MB/s', icon: 'archive' },
  { id: 4, name: 'Architecture-Overview.pdf', category: 'Document · PDF', size: '18.2 MB', progress: 100, status: 'Complete', speed: '—', icon: 'doc' },
  { id: 5, name: 'Product-Launch-2026.mp4', category: 'Video · 1080p', size: '1.84 GB', progress: 0, status: 'Queued', speed: '—', icon: 'video' },
  { id: 6, name: 'Studio-Workspace.png', category: 'Image · PNG', size: '12.4 MB', progress: 100, status: 'Complete', speed: '—', icon: 'image' },
  { id: 7, name: 'KFNDM-Setup-0.1.0.exe', category: 'Program · Windows', size: '92.1 MB', progress: 16, status: 'Paused', speed: '—', icon: 'app' },
  { id: 8, name: 'Ambient-Collection.zip', category: 'Compressed · ZIP', size: '512 MB', progress: 8, status: 'Downloading', speed: '2.1 MB/s', icon: 'archive' },
];

const iconFor = (kind: DownloadItem['icon']) => {
  if (kind === 'video') return <Film />;
  if (kind === 'music') return <Music2 />;
  if (kind === 'archive') return <FileArchive />;
  if (kind === 'image') return <FileImage />;
  if (kind === 'doc') return <FileText />;
  return <Smartphone />;
};

export default function App() {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Downloads');
  const [modal, setModal] = useState<'add' | 'account' | 'settings' | 'queues' | null>(null);
  const [url, setUrl] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [context, setContext] = useState<{ x: number; y: number; id: number } | null>(null);
  const [notice, setNotice] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const visibleItems = useMemo(() => items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All Downloads' ||
      (filter === 'Unfinished' && item.status !== 'Complete') ||
      (filter === 'Finished' && item.status === 'Complete') ||
      item.category.toLowerCase().includes(filter.toLowerCase());
    return matchesSearch && matchesFilter;
  }), [items, search, filter]);

  const toast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  };

  const addDownload = (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim()) return;
    const isVideo = /youtube|youtu\.be|twitter|x\.com|vimeo|instagram/i.test(url);
    const name = isVideo ? 'Video link — choosing best quality…' : decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'New-download.bin');
    setItems((current) => [{ id: Date.now(), name, category: isVideo ? 'Video · Available formats' : 'File · Direct link', size: 'Detecting…', progress: 0, status: 'Queued', speed: '—', icon: isVideo ? 'video' : 'doc' }, ...current]);
    setUrl(''); setModal(null);
    toast('Added to queue · subscription authorization will be connected in Phase 1');
  };

  const changeStatus = (id: number, status: DownloadItem['status']) => setItems((current) => current.map((item) => item.id === id ? { ...item, status, speed: status === 'Downloading' ? '8.4 MB/s' : '—' } : item));
  const selectedItems = selected.length ? selected : items.filter((item) => item.status === 'Downloading').map((item) => item.id);
  const stopAll = () => { setItems((current) => current.map((item) => item.status === 'Downloading' ? { ...item, status: 'Paused', speed: '—' } : item)); toast('All active downloads paused'); };
  const removeItem = (id: number) => { setItems((current) => current.filter((item) => item.id !== id)); setSelected((current) => current.filter((itemId) => itemId !== id)); setContext(null); };

  return (
    <main className="stage" onClick={() => context && setContext(null)}>
      <section className="app-window">
        <header className="titlebar">
          <div className="brand-mark"><CloudDownload size={18} /></div>
          <div className="window-title">Kian Fanavaran Negah <span>Download Manager</span><b>PREVIEW</b></div>
          <div className="window-controls"><button aria-label="Minimize">−</button><button aria-label="Maximize">□</button><button aria-label="Close">×</button></div>
        </header>
        <div className="top-nav">
          <button className="mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={18} /></button>
          <nav><button>Tasks</button><button>File</button><button>Downloads</button><button>View</button><button onClick={() => setModal('account')}>Account</button><button onClick={() => toast('Help center is coming soon')}>Help</button></nav>
          <div className="nav-actions"><div className="searchbox"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search in the List" /></div><button className="language-switch" onClick={() => toast('رابط فارسی RTL در مرحله بومی‌سازی اضافه می‌شود')}>FA</button></div>
        </div>
        <div className="workspace">
          <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-hidden'}`}>
            <div className="category-card">
              <button className={`category-root ${filter === 'All Downloads' ? 'active' : ''}`} onClick={() => setFilter('All Downloads')}><Folder size={17} /><span>All Downloads</span><ChevronDown size={14} className="root-chevron" /></button>
              <div className="category-list">
                <Category label="Music" icon={<Music2 />} active={filter === 'Music'} onClick={() => setFilter('Music')} />
                <Category label="Compressed" icon={<Archive />} active={filter === 'Compressed'} onClick={() => setFilter('Compressed')} />
                <Category label="Videos" icon={<Video />} active={filter === 'Video'} onClick={() => setFilter('Video')} />
                <Category label="Programs" icon={<Smartphone />} active={filter === 'Program'} onClick={() => setFilter('Program')} />
                <Category label="Documents" icon={<FileText />} active={filter === 'Document'} onClick={() => setFilter('Document')} />
                <Category label="Images" icon={<Image />} active={filter === 'Image'} onClick={() => setFilter('Image')} />
              </div>
              <button className={`category-root sub-root ${filter === 'Unfinished' ? 'active' : ''}`} onClick={() => setFilter('Unfinished')}><FolderDown size={17} /><span>Unfinished</span><ChevronDown size={14} /></button>
              <button className={`category-root sub-root ${filter === 'Finished' ? 'active' : ''}`} onClick={() => setFilter('Finished')}><FolderDown size={17} /><span>Finished</span><ChevronDown size={14} /></button>
            </div>
            <div className="disk-card">
              <div className="card-heading"><span><HardDrive size={16} /> Disk Space</span><button className="icon-button" onClick={() => toast('Choose a destination drive in Settings')}><MoreHorizontal size={18} /></button></div>
              <div className="disk-meter"><svg viewBox="0 0 180 100" aria-label="Disk used 72 percent"><defs><linearGradient id="meter" x1="0" x2="1"><stop offset="0" stopColor="#27c8b8"/><stop offset=".58" stopColor="#5f8dff"/><stop offset="1" stopColor="#c652ef"/></linearGradient></defs><path className="meter-track" d="M19 83 A72 72 0 0 1 161 83"/><path className="meter-fill" d="M19 83 A72 72 0 0 1 161 83"/></svg><div className="meter-center"><span>72%</span><small>used</small></div></div>
              <div className="disk-label"><span>System Drive</span><strong>368 GB <i>/ 512 GB</i></strong></div><div className="disk-path">C:\Downloads</div>
              <button className="gradient-button clean-button" onClick={() => toast('Temporary-file cleanup will be available in the desktop build')}><Zap size={15} /> Disk Cleaner</button>
            </div>
            <div className="side-foot"><ShieldCheck size={15} /><span>Connection encrypted</span><span className="online-dot" /></div>
          </aside>
          <section className="main-panel">
            <div className="toolbar">
              <button className="add-link" onClick={() => setModal('add')}><Link2 size={18} /><span>Add URL</span><span className="cloud-add"><CloudDownload size={18} /></span></button>
              <div className="toolbar-divider" />
              <ToolButton icon={<Play />} label="Resume" onClick={() => { (selectedItems.length ? selectedItems : []).forEach((id) => changeStatus(id, 'Downloading')); toast('Selected downloads resumed'); }} />
              <ToolButton icon={<Square />} label="Stop" onClick={() => { selectedItems.forEach((id) => changeStatus(id, 'Paused')); toast('Selected downloads paused'); }} />
              <ToolButton icon={<Clock3 />} label="Stop All" onClick={stopAll} />
              <div className="toolbar-divider" />
              <ToolButton icon={<Trash2 />} label="Delete" onClick={() => { if (!selected.length) return toast('Select one or more downloads first'); selected.forEach(removeItem); toast('Selected downloads removed'); }} />
              <ToolButton icon={<Settings2 />} label="Options" onClick={() => setModal('settings')} />
              <ToolButton icon={<Copy />} label="Queues" onClick={() => setModal('queues')} />
              <ToolButton icon={<Clock3 />} label="Scheduler" onClick={() => toast('Scheduler settings are coming soon')} />
              <ToolButton icon={<ArrowUp />} label="Share" onClick={() => toast('Share links with KFNDM — coming soon')} />
            </div>
            <div className="table-scroll">
              <div className="download-table">
                <div className="table-header"><div className="select-cell"><button className={`checkbox ${selected.length === visibleItems.length && visibleItems.length ? 'checked' : ''}`} onClick={() => setSelected(selected.length === visibleItems.length ? [] : visibleItems.map((item) => item.id))}>{selected.length === visibleItems.length && visibleItems.length ? <Check size={12} /> : null}</button></div><button className="column-name" onClick={() => toast('Sorted by name')}>Name <ListFilter size={12}/></button><button className="column-size" onClick={() => toast('Sorted by size')}>Size <ListFilter size={12}/></button><button className="column-status">Status</button><button className="column-speed">Speed</button><button className="column-date">Added</button><span className="column-more" /></div>
                {visibleItems.length === 0 ? <div className="empty-state"><Search size={25}/><strong>No downloads found</strong><span>Try a different search or add a new URL.</span><button className="gradient-button" onClick={() => setModal('add')}><Plus size={15}/> Add a download</button></div> : visibleItems.map((item) => (
                  <div className={`download-row ${selected.includes(item.id) ? 'row-selected' : ''}`} key={item.id} onContextMenu={(event) => { event.preventDefault(); setContext({ x: event.clientX, y: event.clientY, id: item.id }); }}>
                    <div className="select-cell"><button className={`checkbox ${selected.includes(item.id) ? 'checked' : ''}`} onClick={() => setSelected((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}>{selected.includes(item.id) ? <Check size={12} /> : null}</button></div>
                    <div className="file-name"><span className={`file-icon ${item.icon}`}>{iconFor(item.icon)}</span><span className="file-copy"><strong title={item.name}>{item.name}</strong><small>{item.category}</small></span></div>
                    <div className="file-size">{item.size}</div>
                    <div className="file-status">{item.status === 'Complete' ? <><span className="status-complete"><BadgeCheck size={14}/> Complete</span><span className="status-detail">File ready</span></> : item.status === 'Paused' ? <><span className="status-paused"><Pause size={13}/> Paused</span><span className="status-detail">{item.progress}% downloaded</span></> : item.status === 'Queued' ? <><span className="status-queued"><Clock3 size={13}/> Queued</span><span className="status-detail">Waiting in queue</span></> : <><span className="progress-percent">{item.progress}%</span><div className="progress-track"><span style={{ width: `${item.progress}%` }} /></div></>}</div>
                    <div className="file-speed">{item.speed}</div><div className="file-date">Today</div>
                    <button className="row-more" aria-label="More actions" onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setContext({ x: rect.right - 210, y: rect.bottom + 6, id: item.id }); }}><MoreHorizontal size={17}/></button>
                  </div>
                ))}
              </div>
            </div>
            <footer className="status-bar"><div className="select-all"><button className={`checkbox ${selected.length === visibleItems.length && visibleItems.length ? 'checked' : ''}`} onClick={() => setSelected(selected.length === visibleItems.length ? [] : visibleItems.map((item) => item.id))}>{selected.length === visibleItems.length && visibleItems.length ? <Check size={12}/> : null}</button><span>Select All</span><span className="item-count">{visibleItems.length} items</span></div><div className="network-stats"><span className="speed-gauge"><Activity size={19}/></span><span className="live-label">Live speed</span><span className="speed-down"><ArrowDown size={15}/><b>20.1</b> MB/s</span><span className="stat-separator"/><span className="speed-up"><ArrowUp size={15}/><b>1.26</b> MB/s</span></div></footer>
          </section>
        </div>
        <div className="window-bottom"><span><span className="online-dot"/> All systems operational</span><span>KFNDM · 0.1.0 preview</span></div>
        {!localStorage.getItem('kfndm-card-dismissed') && <div className="premium-card"><button className="premium-close" aria-label="Dismiss" onClick={() => { localStorage.setItem('kfndm-card-dismissed', '1'); (document.activeElement as HTMLElement)?.blur(); toast('Premium card dismissed'); }}><X size={15}/></button><span className="premium-kicker"><span className="premium-spark">✦</span> KFNDM PREMIUM</span><h3>Downloads without limits.</h3><p>Unlock high-speed downloads, video quality selection, and more connected devices.</p><button className="gradient-button premium-cta" onClick={() => setModal('account')}>Explore plans <ChevronRight size={15}/></button><small>Subscription portal preview</small></div>}
        {context && <div className="context-menu" style={{ left: Math.min(context.x, window.innerWidth - 230), top: Math.min(context.y, window.innerHeight - 340) }} onClick={(event) => event.stopPropagation()}><ContextAction icon={<Play/>} label="Resume download" onClick={() => { changeStatus(context.id, 'Downloading'); setContext(null); toast('Download resumed'); }}/><ContextAction icon={<Folder/>} label="Open folder" onClick={() => { setContext(null); toast('Folder will open in the desktop app'); }}/><ContextAction icon={<ArrowDownToLine/>} label="Redownload" onClick={() => { changeStatus(context.id, 'Queued'); setContext(null); toast('Added to queue again'); }}/><div className="context-separator"/><ContextAction icon={<Trash2/>} label="Remove from list" danger onClick={() => removeItem(context.id)}/><ContextAction icon={<CircleHelp/>} label="Properties" onClick={() => { setContext(null); toast('Download properties'); }}/></div>}
        {modal && <Modal type={modal} close={() => setModal(null)} url={url} setUrl={setUrl} submit={addDownload} toast={toast} />}
        {notice && <div className="toast"><Check size={15}/>{notice}</div>}
      </section>
      <div className="stage-caption"><span className="caption-dot"/> Desktop interface · first interactive preview <span>·</span> License service integration is next</div>
    </main>
  );
}

function Category({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return <button className={`category-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span></button>;
}
function ToolButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) { return <button className="tool-button" onClick={onClick}>{icon}<span>{label}</span></button>; }
function ContextAction({ icon, label, onClick, danger = false }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) { return <button className={`context-action ${danger ? 'danger' : ''}`} onClick={onClick}>{icon}<span>{label}</span></button>; }

function Modal({ type, close, url, setUrl, submit, toast }: { type: 'add' | 'account' | 'settings' | 'queues'; close: () => void; url: string; setUrl: (value: string) => void; submit: (event: React.FormEvent) => void; toast: (message: string) => void }) {
  const titles = { add: 'Add a download', account: 'Your KFNDM account', settings: 'Preferences', queues: 'Download queues' };
  return <div className="modal-backdrop" onClick={close}><section className="modal" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="modal-icon">{type === 'add' ? <Link2/> : type === 'account' ? <LockKeyhole/> : type === 'settings' ? <Settings2/> : <Copy/>}</span><div><h2>{titles[type]}</h2><p>{type === 'add' ? 'Paste a file or supported video URL to continue.' : type === 'account' ? 'Sign in to manage your subscription and devices.' : type === 'settings' ? 'Customize your download experience.' : 'Organize downloads and control what runs next.'}</p></div></div><button className="modal-close" onClick={close}><X size={18}/></button></div>
    {type === 'add' && <form onSubmit={submit}><label className="field-label" htmlFor="download-url">Download URL</label><div className="url-field"><Link2 size={17}/><input autoFocus id="download-url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/file.zip or video link" /></div><div className="supported-sites"><span className="status-dot"/> Video URLs supported · quality selection coming soon</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button type="submit" className="gradient-button"><CloudDownload size={16}/> Add to queue</button></div></form>}
    {type === 'account' && <div className="account-preview"><div className="account-art"><ShieldCheck size={27}/></div><div className="account-status"><strong>Premium membership</strong><span>Connect the license portal to sign in and manage your subscription.</span></div><button className="gradient-button full-button" onClick={() => toast('Account and license API are planned in Phase 1')}>Continue to sign in <ChevronRight size={16}/></button><div className="security-note"><LockKeyhole size={13}/> License authorization will be verified by the KFNDM server.</div></div>}
    {type === 'settings' && <div className="settings-list"><SettingRow icon={<Bell/>} title="Notifications" detail="Show status alerts and completion messages" checked/><SettingRow icon={<Zap/>} title="Start downloads automatically" detail="Begin as soon as a link is added" checked/><SettingRow icon={<HardDrive/>} title="Default download folder" detail="C:\Downloads"/><div className="modal-actions"><button className="secondary-button" onClick={close}>Close</button><button className="gradient-button" onClick={() => { close(); toast('Preferences saved'); }}>Save changes</button></div></div>}
    {type === 'queues' && <div className="queue-preview"><div className="queue-summary"><span className="queue-number">03</span><div><strong>General queue</strong><small>3 active · 2 waiting</small></div><ChevronRight size={17}/></div><div className="queue-summary"><span className="queue-number violet">01</span><div><strong>Video queue</strong><small>1 waiting · highest quality</small></div><ChevronRight size={17}/></div><button className="secondary-button full-button" onClick={() => toast('Queue controls are being connected to the download engine')}>Manage queues</button></div>}
  </section></div>;
}
function SettingRow({ icon, title, detail, checked = false }: { icon: React.ReactNode; title: string; detail: string; checked?: boolean }) { return <div className="setting-row"><span className="setting-icon">{icon}</span><span className="setting-copy"><strong>{title}</strong><small>{detail}</small></span>{checked ? <span className="toggle on"/> : <ChevronRight size={16} className="setting-chevron"/>}</div>; }
