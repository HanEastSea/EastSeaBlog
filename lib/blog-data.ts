export type PostType = "生活" | "技术";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  type: PostType;
  date: string;
  readTime: string;
  pinned?: boolean;
  tags: string[];
  coverImage?: string | null;
  content: string[];
  markdown?: string;
  accent: "crimson" | "sapphire" | "silver";
};

export const blogPosts: BlogPost[] = [
  {
    id: "case-001",
    slug: "a-quiet-sunday-by-the-window",
    title: "窗边的星期日：给生活留一页空白",
    excerpt: "没有待办清单的下午，阳光、咖啡和一段慢下来的时间。",
    category: "日常生活",
    type: "生活",
    date: "2026-09-10",
    readTime: "4 分钟",
    pinned: true,
    tags: ["日常", "随笔", "慢生活"],
    accent: "crimson",
    content: [
      "星期日的下午，我把手机调成静音，给桌面留出一小块没有安排的区域。窗外的光线从白色窗帘后面慢慢移动，像一条不急着揭晓的线索。",
      "生活并不总需要一个明确的结论。有时，一杯咖啡的温度、书页翻动的声音，以及没有被填满的半小时，就是值得保存的证据。",
      "我想把这页空白留给下一次出发。",
    ],
  },
  {
    id: "case-002",
    slug: "building-a-small-content-engine",
    title: "给个人博客做一个轻量内容引擎",
    excerpt: "从文章模型、图片存储到主题切换，记录这次博客重构的关键取舍。",
    category: "技术记录",
    type: "技术",
    date: "2026-09-06",
    readTime: "9 分钟",
    tags: ["Next.js", "架构", "Supabase"],
    accent: "sapphire",
    content: [
      "一个真正愿意长期使用的博客，重点不是堆叠功能，而是让记录这件事足够顺手。文章编辑、图片上传、立即发布和可恢复的版本历史，是内容系统的骨架。",
      "前台负责阅读体验，后台负责写作体验。两者共享文章模型，却不应该共享同一套视觉密度：阅读页面需要留白，编辑页面需要明确的状态和反馈。",
      "这次重构先保留简单的数据边界，再为未来的全文搜索、RSS 和导出能力预留接口。",
    ],
  },
  {
    id: "case-003",
    slug: "notes-from-the-night-walk",
    title: "夜行记录：城市灯光下的三条线索",
    excerpt: "一次没有目的地的散步，最后留下了三件想带回家的小事。",
    category: "随笔",
    type: "生活",
    date: "2026-08-28",
    readTime: "6 分钟",
    tags: ["城市", "夜晚", "记录"],
    accent: "silver",
    content: [
      "夜里十点以后，街道像换了一套低饱和度的滤镜。便利店门口的灯、公交站牌上的蓝光，还有一只停在屋檐上的猫，构成了今晚最清晰的三条线索。",
      "我没有拍下太多照片，只把它们写进备忘录。也许文字更适合保存那些还没有被解释的瞬间。",
    ],
  },
];

export const categories = [
  { name: "日常生活", count: 1, symbol: "🎀", description: "把平凡的一天保存成档案。" },
  { name: "技术记录", count: 1, symbol: "♠", description: "记录代码、工具和构建过程。" },
  { name: "随笔", count: 1, symbol: "✦", description: "还没有结论的想法，也值得留下。" },
];

export const formatDate = (value: string) => new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(new Date(`${value}T00:00:00`));
export const formatShortDate = (value: string) => value.replaceAll("-", ".").slice(5);
