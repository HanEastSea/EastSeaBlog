"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowUpRight, CalendarDays, Check, ChevronLeft,
  ChevronRight, CircleUserRound, Clock3, FilePenLine, Layers3,
  ImagePlus, Menu, Plus, Search, Sparkles, UploadCloud, X, Pin, Trash2,
} from "lucide-react";
import { BlogPost, blogPosts, categories, formatDate, formatShortDate } from "@/lib/blog-data";
import { makeSmartExcerpt } from "@/lib/excerpt";
import { renderMarkdown } from "@/lib/markdown";

type Theme = "detective" | "magician";
type View = "home" | "categories" | "calendar" | "admin";

const navItems: { label: string; href: string; icon: typeof Sparkles }[] = [
  { label: "首页", href: "/", icon: Sparkles },
  { label: "分类", href: "/categories", icon: Layers3 },
  { label: "时间线", href: "/calendar", icon: CalendarDays },
  { label: "后台管理", href: "/admin", icon: CircleUserRound },
];

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const detective = theme === "detective";
  return <button className="theme-toggle" onClick={onToggle} aria-label={detective ? "切换到魔术模式" : "切换到推理模式"}><span className="theme-icon">{detective ? "🎀" : "🎩"}</span><span className="theme-toggle-copy"><small>主题</small><strong>{detective ? "推理模式" : "魔术模式"}</strong></span><span className="theme-switch"><span /></span></button>;
}

function SiteHeader({ theme, onToggle, menuOpen, onMenu, searchQuery, onSearchChange, onSearchSubmit, canManage }: { theme: Theme; onToggle: () => void; menuOpen: boolean; onMenu: () => void; searchQuery: string; onSearchChange: (value: string) => void; onSearchSubmit: () => void; canManage: boolean }) {
  const pathname = usePathname();
  const visibleNavItems = canManage ? navItems : navItems.filter((item) => item.href !== "/admin");
  return <header className="site-header"><a href="/" className="brand" aria-label="东海档案馆首页"><span className="brand-mark"><span>东</span><i /></span><span className="brand-copy"><strong>东海档案馆</strong><small>DETECTIVE DIARY / ARCHIVE</small></span></a><nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="主导航">{visibleNavItems.map(({ label, href, icon: Icon }) => { const active = pathname === href; return <a key={href} href={href} className={`nav-link ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined}><Icon size={17} strokeWidth={1.8} />{label}</a>; })}</nav><div className="header-actions"><form className="header-search" role="search" onSubmit={(event) => { event.preventDefault(); onSearchSubmit(); }}><Search size={16} /><input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="搜索文章..." aria-label="搜索文章" />{searchQuery && <button type="button" className="search-clear" onClick={() => onSearchChange("")} aria-label="清除搜索"><X size={13} /></button>}</form><ThemeToggle theme={theme} onToggle={onToggle} /><button className="mobile-menu" onClick={onMenu} aria-label={menuOpen ? "关闭菜单" : "打开菜单"}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button></div></header>;
}

function PostCard({ post, featured = false, onOpen }: { post: BlogPost; featured?: boolean; onOpen?: (post: BlogPost) => void }) {
  const thumbClass = `post-thumb ${featured ? "has-hero" : ""} ${post.coverImage ? "has-cover" : ""}`;
  const thumbStyle = post.coverImage ? { backgroundImage: `url("${post.coverImage}")` } : featured ? { backgroundImage: "url('/hero-archive.png')" } : undefined;
  const summary = makeSmartExcerpt(post.markdown ?? post.content.join("\n\n"), post.title, post.excerpt);
  return <article className={`post-card ${featured ? "post-card-featured" : ""} accent-${post.accent}`}><div className={thumbClass} style={thumbStyle}><span className="thumb-case">CASE {post.id.replace("case-", "")}</span><span className="thumb-symbol">{post.type === "技术" ? "♠" : post.pinned ? "🎀" : "✦"}</span><span className="thumb-stamp">{post.pinned ? "置顶" : post.type}</span></div><div className="post-card-content"><div className="post-card-topline"><span className="eyebrow"><span className="eyebrow-dot" />{post.category}</span>{post.pinned && <span className="pin-badge">置顶档案</span>}</div><h3>{post.title}</h3><p>{summary}</p><div className="tag-list">{post.tags.slice(0, 4).map((tag) => <span key={tag}>#{tag}</span>)}</div><div className="post-card-footer"><div className="post-meta"><span><Clock3 size={13} /> {formatShortDate(post.date)}</span><span><span className="mini-eye">◉</span> {post.readTime}</span></div><button className="read-more" onClick={() => onOpen?.(post)}>阅读全文 <ArrowUpRight size={15} /></button></div></div></article>;
}

function MiniCalendar({ posts, onOpen }: { posts: BlogPost[]; onOpen: (post: BlogPost) => void }) {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const postDays = new Map(posts.map((post) => [Number(post.date.slice(-2)), post]));
  return <div className="mini-calendar"><div className="mini-calendar-head"><strong>柯南日历</strong><span>2026 年 9 月</span><div><ChevronLeft size={14} /><ChevronRight size={14} /></div></div><div className="mini-week">{["一", "二", "三", "四", "五", "六", "日"].map((day) => <span key={day}>{day}</span>)}</div><div className="mini-days">{days.map((day) => { const post = postDays.get(day); return <button key={day} className={post ? "has-note" : ""} onClick={() => post && onOpen(post)} disabled={!post}>{day}{post && <i />}</button>; })}</div></div>;
}

function ProfileCard({ posts }: { posts: BlogPost[] }) {
  const categoryCount = new Set(posts.map((post) => post.category)).size;
  const tagCount = new Set(posts.flatMap((post) => post.tags)).size;
  return <div className="profile-card"><div className="profile-head"><div className="profile-avatar">东</div><div><span>ABOUT THE AUTHOR</span><strong>东海</strong><small>记录生活的观察员</small></div><span className="profile-bow">🎀</span></div><p>“如果你的话，一定能找到真相的。”</p><div className="profile-stats"><span><strong>{posts.length.toString().padStart(2, "0")}</strong>文章</span><span><strong>{categoryCount.toString().padStart(2, "0")}</strong>分类</span><span><strong>{tagCount.toString().padStart(2, "0")}</strong>标签</span></div></div>;
}

function Sidebar({ posts, onOpen }: { posts: BlogPost[]; onOpen: (post: BlogPost) => void }) {
  const categoryItems = categories.map((category) => ({ ...category, count: posts.filter((post) => post.category === category.name).length }));
  const tagItems = Array.from(new Set(posts.flatMap((post) => post.tags)));
  return <aside className="right-sidebar"><ProfileCard posts={posts} /><div className="sidebar-panel"><div className="sidebar-title"><strong>热门分类</strong><span>INDEX</span></div><div className="hot-categories">{categoryItems.map((category) => <a key={category.name} href={`/categories#${category.name}`}><span>{category.symbol}</span><strong>{category.name}</strong><small>{category.count}</small></a>)}</div></div><div className="sidebar-panel"><div className="sidebar-title"><strong>最新标签</strong><span>TAG CLOUD</span></div><div className="cloud-tags">{tagItems.length ? tagItems.map((tag) => <span key={tag}>#{tag}</span>) : <span>暂无标签</span>}</div></div><MiniCalendar posts={posts} onOpen={onOpen} /></aside>;
}

function SearchEmptyState({ theme }: { theme: Theme }) {
  const detective = theme === "detective";
  return <div className={`search-empty-card ${detective ? "search-empty-detective" : "search-empty-magician"}`}>{detective ? <><div className="search-detective-art"><img src="/search-detective.png" alt="举着放大镜的少年侦探" /></div><div className="search-empty-copy"><strong>没有找到匹配文章</strong><small>请换一个关键词重新搜索</small></div></> : <div className="search-letter"><h3>预告信</h3><strong>没有找到匹配文章</strong><small>请换一个关键词重新搜索</small><img src="/kid-letter-mark.png" alt="怪盗基德帽子图案" /></div>}</div>;
}

function HomeView({ posts, onOpen, searchQuery, theme }: { posts: BlogPost[]; onOpen: (post: BlogPost) => void; searchQuery: string; theme: Theme }) {
  const featured = posts.find((post) => post.pinned) ?? posts[0];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchingPosts = normalizedQuery ? posts.filter((post) => `${post.title} ${post.excerpt} ${post.category} ${post.type} ${post.tags.join(" ")}`.toLowerCase().includes(normalizedQuery)) : posts;
  return <div className="home-content-grid"><main className="home-feed"><div className="feed-title"><div><h2>{normalizedQuery ? "搜索结果" : "置顶文章"}</h2>{normalizedQuery && <p className="search-summary">找到 {matchingPosts.length} 篇相关档案</p>}</div></div>{normalizedQuery ? matchingPosts.map((post) => <PostCard key={post.id} post={post} onOpen={onOpen} />) : <>{featured && <PostCard post={featured} featured onOpen={onOpen} />}<div className="feed-label"><span>最新文章</span><span>{posts.length.toString().padStart(2, "0")} ENTRIES</span></div>{posts.filter((post) => post.id !== featured?.id).map((post) => <PostCard key={post.id} post={post} onOpen={onOpen} />)}</>}{normalizedQuery && !matchingPosts.length && <SearchEmptyState theme={theme} />}</main><Sidebar posts={posts} onOpen={onOpen} /></div>;
}

function CategoriesView({ posts, onOpen }: { posts: BlogPost[]; onOpen: (post: BlogPost) => void }) {
  const [selected, setSelected] = useState<string | null>(null); const visible = selected ? posts.filter((post) => post.category === selected) : posts; const categoryItems = categories.map((category) => ({ ...category, count: posts.filter((post) => post.category === category.name).length }));
  return <section className="page-view"><div className="category-grid">{categoryItems.map((category) => <button key={category.name} className={`category-card ${selected === category.name ? "is-selected" : ""}`} onClick={() => setSelected(selected === category.name ? null : category.name)}><span className="category-symbol">{category.symbol}</span><span className="category-card-top"><span>CAT / {category.name}</span><span>{category.count.toString().padStart(2, "0")}</span></span><strong>{category.name}</strong><p>{category.description}</p><ArrowUpRight size={17} /></button>)}</div><div className="section-heading compact"><div><span className="section-kicker">{selected ? `FILTERED / ${selected}` : "ALL CATEGORIES"}</span><h2>相关档案</h2></div></div><div className="post-grid">{visible.map((post) => <PostCard key={post.id} post={post} onOpen={onOpen} />)}</div></section>;
}

function CalendarView({ posts, onOpen }: { posts: BlogPost[]; onOpen: (post: BlogPost) => void }) {
  const [month, setMonth] = useState(new Date(2026, 8, 1)); const first = new Date(month.getFullYear(), month.getMonth(), 1); const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(); const leading = (first.getDay() + 6) % 7; const postByDay = new Map(posts.map((post) => [post.date, post])); const cells = Array.from({ length: leading + days }, (_, index) => index < leading ? null : index - leading + 1); const monthLabel = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long" }).format(month);
  return <section className="page-view"><div className="calendar-layout"><div className="calendar-card"><div className="calendar-header"><div><span className="section-kicker">FIELD NOTES</span><h2>{monthLabel}</h2></div><div className="calendar-controls"><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="上个月"><ChevronLeft size={17} /></button><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="下个月"><ChevronRight size={17} /></button></div></div><div className="weekdays">{["一", "二", "三", "四", "五", "六", "日"].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{cells.map((day, index) => { const dateKey = day ? `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : ""; const post = dateKey ? postByDay.get(dateKey) : undefined; return <button key={`${dateKey}-${index}`} className={`calendar-cell ${post ? "has-post" : ""} ${day ? "" : "is-empty"}`} onClick={() => post && onOpen(post)} disabled={!post}>{day && <><span>{day}</span>{post && <i title={post.title} />}</>}</button>; })}</div></div><aside className="calendar-aside"><span className="section-kicker">THIS MONTH</span><div className="calendar-total"><strong>{posts.filter((post) => post.date.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`)).length}</strong><span>篇记录</span></div><div className="timeline-mini">{posts.slice(0, 3).map((post) => <button key={post.id} onClick={() => onOpen(post)}><span>{formatShortDate(post.date)}</span><strong>{post.title}</strong></button>)}</div></aside></div></section>;
}

function ArticleView({ post, onBack, theme }: { post: BlogPost; onBack: () => void; theme: Theme }) {
  const markdown = post.markdown ?? post.content.join("\n\n");
  return <section className="article-view"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> 返回文章列表</button><div className="article-header"><span className="section-kicker">CASE {post.id.replace("case-", "")} / {post.type.toUpperCase()}</span><h1>{post.title}</h1><div className="article-meta"><span className="article-author">东海 · 作者</span><span className="meta-divider" /><span className="article-date">{formatDate(post.date)}</span><span className="meta-divider" /><span className="article-reading"><Clock3 size={14} /> {post.readTime}</span></div></div><div className="article-body markdown-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }} /><div className="article-tags">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><button className="article-top-button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="返回顶部" title="返回顶部"><span>{theme === "magician" ? "♠" : "🎀"}</span></button></section>;
}

function AdminView({ posts, onSave, onDelete, onTogglePinned }: { posts: BlogPost[]; onSave: (post: BlogPost) => Promise<void>; onDelete: (post: BlogPost) => Promise<void>; onTogglePinned: (post: BlogPost) => Promise<void> }) {
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("日常生活");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [type, setType] = useState<"生活" | "技术">("生活");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const openEditor = (post?: BlogPost) => {
    const target = post ?? { id: `draft-${crypto.randomUUID()}`, slug: "", title: "", excerpt: "", category: "日常生活", type: "生活" as const, date: new Date().toISOString().slice(0, 10), readTime: "5 分钟", tags: [], accent: "crimson" as const, content: [], markdown: "" };
    setEditing(target); setTitle(target.title); setCategory(target.category); setTags(target.tags.join(", ")); setCoverImage(target.coverImage ?? null); setType(target.type); setBody(target.markdown ?? target.content.join("\n\n")); setSaved(false); setError("");
  };
  const save = async () => {
    if (!title.trim() || !body.trim() || !editing) { setError("标题和 Markdown 正文不能为空。"); return; }
    setBusy(true); setError("");
    try {
      const generatedExcerpt = makeSmartExcerpt(body.trim(), title.trim(), title.trim());
      const parsedTags = tags.split(/[,，\n]/).map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean).filter((tag, index, all) => all.indexOf(tag) === index).slice(0, 12);
      await onSave({ ...editing, title: title.trim(), excerpt: generatedExcerpt.slice(0, 140), category, type, tags: parsedTags, coverImage: coverImage?.trim() || null, markdown: body.trim(), content: body.trim().split(/\n\s*\n/).filter(Boolean) });
      setSaved(true); setEditing(null);
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "保存失败，请稍后再试。"); }
    finally { setBusy(false); }
  };
  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    setUploadingImage(true); setError("");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/images", { method: "POST", body: form });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "图片上传失败。");
      const imageMarkdown = `![${file.name}](${result.url})`;
      setBody((current) => `${current}${current && !current.endsWith("\n") ? "\n\n" : ""}${imageMarkdown}\n\n`);
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "图片上传失败。"); }
    finally { setUploadingImage(false); }
  };
  const uploadCover = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    setUploadingCover(true); setError("");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/images", { method: "POST", body: form });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "封面上传失败。");
      setCoverImage(result.url);
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "封面上传失败。"); }
    finally { setUploadingCover(false); }
  };
  const deletePost = async (post: BlogPost) => { if (!window.confirm(`确定要删除《${post.title}》吗？`)) return; await onDelete(post); };
  return <section className="page-view admin-view"><button type="button" className="admin-toolbar admin-create-bar" onClick={() => openEditor()} aria-label="新建文章"><Plus size={18} /><span>新建文章</span></button><div className="admin-list">{posts.map((post) => <div className="admin-row" key={post.id}><div className="admin-row-symbol">{post.type === "技术" ? "♠" : "🎀"}</div><div className="admin-row-copy"><span>{post.category} · {formatDate(post.date)}</span><strong>{post.title}</strong></div><div className="admin-row-status">{post.pinned && <span className="pin-badge">置顶</span>}<span className="published"><Check size={13} /> 已发布</span></div><div className="admin-row-actions"><button className="button button-quiet pin-action" onClick={() => onTogglePinned(post)}><Pin size={13} /> {post.pinned ? "取消置顶" : "置顶"}</button><button className="icon-button" onClick={() => openEditor(post)} aria-label={`编辑${post.title}`}><FilePenLine size={16} /></button><button className="icon-button danger-icon" onClick={() => deletePost(post)} aria-label={`删除${post.title}`}><Trash2 size={16} /></button></div></div>)}</div>{editing && <div className="editor-overlay"><div className="editor-modal"><div className="editor-header"><div><span className="section-kicker">{editing.title ? "EDIT ENTRY" : "NEW ENTRY"}</span><h2>{editing.title ? "编辑档案" : "写下新档案"}</h2></div><button className="icon-button" onClick={() => setEditing(null)} aria-label="关闭编辑器"><X size={19} /></button></div><label>标题<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="给这条记录一个标题" /></label><label>分类<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><label>标签<input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="用逗号分隔多个标签，例如：生活，随笔，记录" /></label><label>封面图片<input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={uploadCover} /><div className="cover-picker">{coverImage ? <div className="cover-preview" style={{ backgroundImage: `url("${coverImage}")` }}><span>已选择封面</span><div><button type="button" className="button button-quiet" onClick={() => coverInputRef.current?.click()}><ImagePlus size={15} />更换</button><button type="button" className="button button-quiet" onClick={() => setCoverImage(null)}><X size={15} />移除</button></div></div> : <button type="button" className="cover-picker-empty" disabled={uploadingCover} onClick={() => coverInputRef.current?.click()}><ImagePlus size={20} /><span>{uploadingCover ? "上传中..." : "选择封面图片"}</span><small>发布后展示在首页文章卡片左侧</small></button>}</div></label><label>Markdown 正文<textarea className="body-input" value={body} onChange={(event) => setBody(event.target.value)} rows={12} placeholder={'# 标题\n\n写下正文，支持 **加粗**、列表、引用、代码块和图片。'} /></label><input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={uploadImage} /><div className="upload-box"><UploadCloud size={20} /><div><strong>在正文中插入图片</strong><span>支持 JPG、PNG、WEBP、GIF，单张不超过 8MB</span></div><button className="button button-quiet" type="button" disabled={uploadingImage} onClick={() => imageInputRef.current?.click()}>{uploadingImage ? "上传中..." : "上传并插入"}</button></div>{error && <div className="form-error">{error}</div>}<div className="editor-footer"><div><button type="button" className="button button-quiet editor-cancel" onClick={() => setEditing(null)}><X size={15} />取消</button><button type="button" className="button button-primary editor-save" disabled={busy || uploadingImage || uploadingCover} onClick={save}><Check size={15} />{busy ? "发布中..." : "保存并发布"}</button></div></div></div></div>}{saved && <div className="toast"><Check size={16} /> 文章已发布到博客</div>}</section>;
}

export default function BlogApp({ initialView = "home", initialTheme = "magician", initialPosts = blogPosts, canManage = false }: { initialView?: View; initialTheme?: Theme; initialPosts?: BlogPost[]; canManage?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const view: View = pathname === "/" ? "home" : pathname === "/categories" ? "categories" : pathname === "/calendar" ? "calendar" : pathname === "/admin" && canManage ? "admin" : initialView;
  const [theme, setTheme] = useState<Theme>(initialTheme); const [menuOpen, setMenuOpen] = useState(false); const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null); const [posts, setPosts] = useState<BlogPost[]>(initialPosts); const [searchQuery, setSearchQuery] = useState(""); const [submittedQuery, setSubmittedQuery] = useState(""); const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { document.documentElement.dataset.theme = theme; window.localStorage.setItem("east-sea-theme", theme); document.cookie = `east-sea-theme=${theme}; path=/; max-age=31536000; samesite=lax`; }, [theme]);
  // Navigation uses native anchors for the deployed Sites runtime, so reset the client-only article overlay here.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setSelectedPost(null); setMenuOpen(false); }, [pathname]);
  // Enable banner crossfades only after the initial paint, avoiding a blank blue flash on navigation.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsMounted(true); }, []);
  // Keep a submitted search after a page refresh without changing the server-rendered HTML.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const query = new URLSearchParams(window.location.search).get("search") ?? ""; setSearchQuery(query); setSubmittedQuery(query); }, []);
  const orderedPosts = useMemo(() => [...posts].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.date.localeCompare(a.date)), [posts]);
  const openPost = (post: BlogPost) => { setSelectedPost(post); setMenuOpen(false); };
  const handleSearchChange = (value: string) => { setSearchQuery(value); if (!value.trim()) setSubmittedQuery(""); };
  const submitSearch = () => { const query = searchQuery.trim(); setSubmittedQuery(query); router.replace(query ? `/?search=${encodeURIComponent(query)}` : "/"); };
  const savePost = async (post: BlogPost) => { const isNew = post.id.startsWith("draft-"); const response = await fetch(isNew ? "/api/posts" : `/api/posts/${post.id}`, { method: isNew ? "POST" : "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(post) }); const result = await response.json() as { post?: BlogPost; error?: string }; if (!response.ok || !result.post) throw new Error(result.error || "保存失败，请稍后再试。"); setPosts((current) => isNew ? [result.post!, ...current] : current.map((item) => item.id === result.post!.id ? result.post! : item)); };
  const deletePost = async (post: BlogPost) => { const response = await fetch(`/api/posts/${post.id}`, { method: "DELETE" }); const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error || "删除失败，请稍后再试。"); setPosts((current) => current.filter((item) => item.id !== post.id)); if (selectedPost?.id === post.id) setSelectedPost(null); };
  const togglePinned = async (post: BlogPost) => { const response = await fetch(`/api/posts/${post.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ pinned: !post.pinned }) }); const result = await response.json() as { post?: BlogPost; error?: string }; if (!response.ok || !result.post) throw new Error(result.error || "置顶操作失败，请稍后再试。"); setPosts((current) => current.map((item) => item.id === post.id ? result.post! : item)); };
  return <div className={`site-shell ${isMounted ? "is-mounted" : ""}`}><SiteHeader theme={theme} onToggle={() => setTheme(theme === "detective" ? "magician" : "detective")} menuOpen={menuOpen} onMenu={() => setMenuOpen(!menuOpen)} searchQuery={searchQuery} onSearchChange={handleSearchChange} onSearchSubmit={submitSearch} canManage={canManage} /><div className="app-body"><main className={`site-main ${view === "home" ? "home-main" : ""}`}>{selectedPost ? <ArticleView post={selectedPost} theme={theme} onBack={() => setSelectedPost(null)} /> : view === "home" ? <HomeView posts={orderedPosts} onOpen={openPost} searchQuery={submittedQuery} theme={theme} /> : view === "categories" ? <CategoriesView posts={orderedPosts} onOpen={openPost} /> : view === "calendar" ? <CalendarView posts={orderedPosts} onOpen={openPost} /> : <AdminView posts={orderedPosts} onSave={savePost} onDelete={deletePost} onTogglePinned={togglePinned} />}</main></div><footer className="site-footer"><span>© 2026 EAST SEA ARCHIVE</span><span>KEEP THE CLUE / KEEP THE NOTE</span><span className="footer-links">{canManage && <><a href="/admin">PRIVATE CONSOLE</a><span>·</span></>}<span>ORIGINAL FAN-INSPIRED DESIGN</span></span></footer></div>;
}
