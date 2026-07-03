import "./index.css";
import CardV2 from "../CardV2";
import ToolDetail from "../ToolDetail";
import { Loading } from "../Loading";
import { Helmet } from "react-helmet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FetchList, recordSearch } from "../../utils/api";
import pinyin from "pinyin-match";
import DarkSwitch from "../DarkSwitch";
import { generateSearchEngineCard } from "../../utils/serachEngine";
import { toggleJumpTarget } from "../../utils/setting";
import { getFavorites } from "../../utils/favorites";

const EMOJI_MAP: Record<string, string> = {
  "AI创作": "✍️",
  "AI改写": "🔄",
  "AI趋势分析": "📈",
  "AI建站": "🌐",
  "AI自动分发": "📡",
  "AI广告投放": "🎯",
  "AI CRM": "🤝",
  "AI个人IP/数字人": "🧑‍💻",
  "AI联盟营销": "💰",
  "AI数据分析": "📊",
  "AI项目管理": "📋",
  "AI数据采集": "🕷️",
  "AI财务记账": "💳",
  "AI客服/对话": "💬",
  "AI社群运营": "👥",
  "AI知识付费": "🎓",
  "AI生产力": "⚡",
  "AI SEO/GEO": "🔍",
  "AI法律合规": "⚖️",
  "AI Agent平台": "🤖",
  "AI翻译/出海": "🌍",
  "AI设计": "🎨",
  "AI直播/播客": "🎙️",
  "AI电商/跨境": "🛒",
  "AI HR/团队": "👔",
  "AI内容重写": "📝",
  "AI广告创意": "💡",
  "AI销售外联": "📞",
  "AI PR/媒体": "📣",
  "AI归因分析": "🧩",
  "AI语音/TTS": "🔊",
  "AI素材库": "🖼️",
  "AI开发/API": "🛠️",
  "AI转化优化/CRO": "🚀",
  "AI Link-in-Bio": "🔗",
  "AI社媒排程": "📅",
  "AI邮件营销": "📧",
  "AI自动化工作流": "⚙️",
};

const HOT_TAGS = ["AI创作", "AI设计", "AI SEO/GEO", "AI数据分析", "AI电商/跨境"];

const SIDEBAR_GROUPS: { label: string; emoji: string; tags: string[] }[] = [
  {
    label: "内容创作",
    emoji: "✏️",
    tags: ["AI创作", "AI改写", "AI内容重写", "AI设计", "AI语音/TTS", "AI素材库", "AI直播/播客"],
  },
  {
    label: "营销推广",
    emoji: "📢",
    tags: ["AI广告投放", "AI广告创意", "AI SEO/GEO", "AI社媒排程", "AI邮件营销", "AI PR/媒体", "AI自动分发"],
  },
  {
    label: "销售变现",
    emoji: "💵",
    tags: ["AI联盟营销", "AI销售外联", "AI电商/跨境", "AI CRM", "AI转化优化/CRO", "AI Link-in-Bio", "AI知识付费"],
  },
  {
    label: "数据洞察",
    emoji: "📊",
    tags: ["AI数据分析", "AI归因分析", "AI趋势分析", "AI数据采集"],
  },
  {
    label: "效率管理",
    emoji: "⚡",
    tags: ["AI生产力", "AI项目管理", "AI自动化工作流", "AI客服/对话", "AI社群运营", "AI HR/团队", "AI财务记账"],
  },
  {
    label: "技术平台",
    emoji: "🛠️",
    tags: ["AI Agent平台", "AI开发/API", "AI建站", "AI翻译/出海", "AI个人IP/数字人", "AI法律合规"],
  },
];

const PRICE_RE = /(免费增值|免费版可用|完全免费|免费试用|免费|付费|按需报价|\$[\d,.]+\/[^\s。；，]{1,8})/;

const getPriceType = (desc: string): "free" | "freemium" | "paid" | "unknown" => {
  const m = desc?.match(PRICE_RE);
  if (!m) return "unknown";
  const p = m[0];
  if (p === "免费" || p === "完全免费" || p === "免费试用") return "free";
  if (p === "免费增值" || p === "免费版可用") return "freemium";
  return "paid";
};

const mutiSearch = (s, t) => {
  const source = (s as string).toLowerCase();
  const target = t.toLowerCase();
  const rawInclude = source.includes(target);
  const pinYinInlcude = Boolean(pinyin.match(source, target));
  return rawInclude || pinYinInlcude;
};

type SortMode = "default" | "az" | "za";
type PriceFilter = "all" | "free" | "freemium" | "paid";

const Content = (props: any) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currTag, setCurrTag] = useState("全部工具");
  const [searchString, setSearchString] = useState("");
  const [val, setVal] = useState("");
  const [searchEngineCards, setSearchEngineCards] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [detailTool, setDetailTool] = useState<any>(null);
  const [favVersion, setFavVersion] = useState(0);

  const filteredDataRef = useRef<any>([]);

  const allTags = useMemo(() => {
    return data?.catelogs ?? [];
  }, [data]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (data?.tools) {
      for (const t of data.tools) {
        counts[t.catelog] = (counts[t.catelog] || 0) + 1;
      }
    }
    return counts;
  }, [data]);

  const favCount = useMemo(() => {
    return getFavorites().length;
    // eslint-disable-next-line
  }, [favVersion, data]);

  const handleFavChange = useCallback(() => {
    setFavVersion((v) => v + 1);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const r = await FetchList();
      setData(r);
      const tagInLocalStorage = window.localStorage.getItem("tag");
      if (tagInLocalStorage && tagInLocalStorage !== "") {
        if (r?.catelogs && r?.catelogs.includes(tagInLocalStorage)) {
          setCurrTag(tagInLocalStorage);
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [setData, setLoading, setCurrTag]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const loadSearchEngineCards = async () => {
      try {
        const cards = await generateSearchEngineCard(searchString);
        setSearchEngineCards(cards);
      } catch (error) {
        console.error('加载搜索引擎卡片失败:', error);
        setSearchEngineCards([]);
      }
    };

    loadSearchEngineCards();
  }, [searchString]);

  const handleSetCurrTag = (tag: string) => {
    setCurrTag(tag);
    if (tag !== "管理后台") {
      window.localStorage.setItem("tag", tag);
    }
    resetSearch(true);
    setSidebarOpen(false);
    setPriceFilter("all");
    setSortMode("default");
  };

  const resetSearch = (notSetTag?: boolean) => {
    setVal("");
    setSearchString("");
    const tagInLocalStorage = window.localStorage.getItem("tag");
    if (!notSetTag && tagInLocalStorage && tagInLocalStorage !== "" && tagInLocalStorage !== "管理后台") {
      setCurrTag(tagInLocalStorage);
    }
  };

  const searchTimerRef = useRef<any>(null);

  const handleSetSearch = (val: string) => {
    if (val !== "" && val) {
      setCurrTag("全部工具");
      setSearchString(val.trim());
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        const q = val.trim();
        if (q.length >= 2) {
          const results = data?.tools?.filter((item: any) =>
            mutiSearch(item.name, q) || mutiSearch(item.desc, q) || mutiSearch(item.url, q)
          )?.length || 0;
          recordSearch(q, results);
        }
      }, 2000);
    } else {
      resetSearch();
    }
  }

  const filteredData = useMemo(() => {
    if (!data.tools) return [...searchEngineCards];

    const favIds = getFavorites();
    let localResult = data.tools
      .filter((item: any) => {
        if (currTag === "我的收藏") {
          return favIds.includes(item.id);
        }
        if (currTag === "全部工具") return true;
        return item.catelog === currTag;
      })
      .filter((item: any) => {
        if (searchString === "") return true;
        return (
          mutiSearch(item.name, searchString) ||
          mutiSearch(item.desc, searchString) ||
          mutiSearch(item.url, searchString)
        );
      })
      .filter((item: any) => {
        if (priceFilter === "all") return true;
        return getPriceType(item.desc) === priceFilter;
      });

    if (sortMode === "az") {
      localResult = [...localResult].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === "za") {
      localResult = [...localResult].sort((a, b) => b.name.localeCompare(a.name));
    }

    return [...localResult, ...searchEngineCards];
    // eslint-disable-next-line
  }, [data, currTag, searchString, searchEngineCards, sortMode, priceFilter, favVersion]);

  useEffect(() => {
    filteredDataRef.current = filteredData
  }, [filteredData])

  useEffect(() => {
    const focusSearch = (ev: KeyboardEvent) => {
      const reg = /[a-zA-Z0-9]|[一-龥]/g;
      if (ev.code === "Enter" || reg.test(ev.key)) {
        const el = document.getElementById("search-bar");
        if (el) el.focus();
      }
    };
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  useEffect(() => {
    if (searchString.trim() === "") {
      document.removeEventListener("keydown", onKeyEnter);
    } else {
      document.addEventListener("keydown", onKeyEnter);
    }
    return () => {
      document.removeEventListener("keydown", onKeyEnter);
    }
    // eslint-disable-next-line
  }, [searchString])

  const handleSearchKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      ev.stopPropagation();
    }
  };

  const renderCardsV2 = useCallback(() => {
    return filteredData.map((item, index) => {
      return (
        <CardV2
          title={item.name}
          url={item.url}
          des={item.desc}
          logo={item.logo}
          key={item.id}
          catelog={item.catelog}
          index={index}
          toolId={item.id}
          isSearching={searchString.trim() !== ""}
          noImageMode={data?.siteConfig?.noImageMode || false}
          compactMode={data?.siteConfig?.compactMode || false}
          onShowDetail={undefined}
          onFavChange={handleFavChange}
          onClick={() => {
            resetSearch();
            if (item.url === "toggleJumpTarget") {
              toggleJumpTarget();
              loadData();
            }
          }}
        />
      );
    });
    // eslint-disable-next-line
  }, [filteredData, searchString, data?.siteConfig?.noImageMode, data?.siteConfig?.compactMode, handleFavChange]);

  const onKeyEnter = (ev: KeyboardEvent) => {
    const active = document.activeElement;
    if (active && active.id === "search-bar") return;
    const cards = filteredDataRef.current;
    if (ev.keyCode === 13) {
      if (cards && cards.length) {
        window.open(cards[0]?.url, "_blank");
        resetSearch();
      }
    }
    if (ev.ctrlKey || ev.metaKey) {
      const num = Number(ev.key);
      if (isNaN(num)) return;
      ev.preventDefault()
      const index = Number(ev.key) - 1;
      if (index >= 0 && index < cards.length) {
        window.open(cards[index]?.url, "_blank");
        resetSearch();
      }
    }
  };

  const renderSidebarGroups = () => {
    return SIDEBAR_GROUPS.map((group) => {
      const visibleTags = group.tags.filter((tag) => allTags.includes(tag));
      if (visibleTags.length === 0) return null;
      return (
        <div className="sidebar-group" key={group.label}>
          <div className="sidebar-group-label"><span className="group-emoji">{group.emoji}</span>{group.label}</div>
          {visibleTags.map((tag) => (
            <div
              className={`sidebar-tag ${currTag === tag ? "sidebar-tag-active" : ""}`}
              key={tag}
              onClick={() => handleSetCurrTag(tag)}
            >
              <span>{EMOJI_MAP[tag] || "📁"} {tag}</span>
              <span className="sidebar-tag-count">{tagCounts[tag] || 0}</span>
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <link
          rel="icon"
          href={
            data?.setting?.favicon ?? "favicon.ico"
          }
        />
        <title>{data?.setting?.title ?? "Van Nav"}</title>
      </Helmet>

      {/* Left sidebar */}
      <div className={`sidebar-overlay ${sidebarOpen ? "sidebar-overlay-show" : ""}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <h1 className="sidebar-brand-title">
            <span className="brand-logo">AI</span>工具大全
          </h1>
          <div className="sidebar-brand-stats">{data?.tools?.length || 0} 个工具 · {allTags.length} 个分类</div>
        </div>
        <div className="sidebar-header">
          <span className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</span>
        </div>
        <div className="sidebar-tags">
          <div
            className={`sidebar-tag ${currTag === "全部工具" ? "sidebar-tag-active" : ""}`}
            onClick={() => handleSetCurrTag("全部工具")}
          >
            <span>🏠 全部工具</span>
            <span className="sidebar-tag-count">{data?.tools?.length || 0}</span>
          </div>
          {/* Favorites */}
          <div
            className={`sidebar-tag sidebar-tag-fav ${currTag === "我的收藏" ? "sidebar-tag-active" : ""}`}
            onClick={() => handleSetCurrTag("我的收藏")}
          >
            <span>♥ 我的收藏</span>
            <span className="sidebar-tag-count">{favCount}</span>
          </div>
          {renderSidebarGroups()}
        </div>
      </aside>

      {/* Brand header - mobile only */}
      <div className="brand-header">
        <h1 className="brand-title">AI 工具大全</h1>
        <p className="brand-subtitle">收录 {data?.tools?.length || 0} 个AI工具，覆盖 {allTags.length} 个场景</p>
      </div>

      <div className="main-content-area">
        {/* Search section */}
        <div className="search-section">
          <div className="search-box">
            <svg className="search-icon-svg" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16ZM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              id="search-bar"
              type="search"
              placeholder="搜索工具名称、功能、描述..."
              value={val}
              onKeyDown={handleSearchKeyDown}
              onChange={(ev) => {
                const v = ev.target.value;
                setVal(v);
                handleSetSearch(v);
              }}
            />
          </div>
        </div>

        {/* Hot tags */}
        <div className="hot-tags">
          {HOT_TAGS.map((tag) => (
            <span
              key={tag}
              className={`hot-tag ${currTag === tag ? "hot-tag-active" : ""}`}
              onClick={() => handleSetCurrTag(tag)}
            >
              {EMOJI_MAP[tag] || ""} {tag.replace("AI", "").replace("/", " / ")}
            </span>
          ))}
        </div>

        {/* Category heading + sort/filter */}
        <div className="category-heading">
          <h2 className="category-title">
            {currTag === "我的收藏" ? "♥" : (EMOJI_MAP[currTag] || "🏠")}{" "}
            {currTag}
          </h2>
          <span className="category-count">{filteredData.length} 个工具</span>
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            ☰ 分类
          </button>
        </div>

        {/* Sort and filter bar */}
        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">排序</span>
            <select
              className="filter-select"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
            >
              <option value="default">默认排序</option>
              <option value="az">名称 A→Z</option>
              <option value="za">名称 Z→A</option>
            </select>
          </div>
          <div className="filter-pills">
            {([
              { value: "all", label: "全部" },
              { value: "free", label: "免费" },
              { value: "freemium", label: "免费增值" },
              { value: "paid", label: "付费" },
            ] as { value: PriceFilter; label: string }[]).map((p) => (
              <span
                key={p.value}
                className={`filter-pill ${priceFilter === p.value ? "filter-pill-active" : ""}`}
                onClick={() => setPriceFilter(p.value)}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className={`content cards ${data?.siteConfig?.compactMode ? 'compact-grid' : ''}`}>
          {loading ? <Loading></Loading> : renderCardsV2()}
        </div>
      </div>

      {/* Tool detail modal */}
      {detailTool && (
        <ToolDetail
          tool={detailTool}
          onClose={() => setDetailTool(null)}
          onFavChange={handleFavChange}
        />
      )}

      <DarkSwitch showGithub={false} />
    </>
  );
};

export default Content;
