import { useCallback, useEffect, useMemo, useState } from "react";
import "./index.css";
import { getLogoUrl } from "../../utils/check";
import { isFavorite, toggleFavorite } from "../../utils/favorites";

interface ToolDetailProps {
  tool: {
    id: number;
    name: string;
    url: string;
    logo: string;
    catelog: string;
    desc: string;
  };
  onClose: () => void;
  onFavChange: () => void;
}

const PRICE_RE = /(免费增值|免费版可用|完全免费|免费试用|免费|付费|按需报价|\$[\d,.]+\/[^\s。；，]{1,8})/;

const getPriceInfo = (desc: string): { label: string; type: "free" | "freemium" | "paid" } | null => {
  const m = desc?.match(PRICE_RE);
  if (!m) return null;
  const price = m[0];
  if (price === "免费" || price === "完全免费" || price === "免费试用") {
    return { label: price, type: "free" };
  }
  if (price === "免费增值" || price === "免费版可用") {
    return { label: price, type: "freemium" };
  }
  return { label: price, type: "paid" };
};

const getCleanDesc = (desc: string): string => {
  if (!desc) return "";
  return desc.replace(PRICE_RE, "").replace(/[。；，、\s]+$/, "").replace(/^[。；，、\s]+/, "").trim();
};

const ToolDetail = ({ tool, onClose, onFavChange }: ToolDetailProps) => {
  const [fav, setFav] = useState(() => isFavorite(tool.id));
  const [screenshotLoaded, setScreenshotLoaded] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleFav = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const nowFav = toggleFavorite(tool.id);
    setFav(nowFav);
    onFavChange();
  }, [tool.id, onFavChange]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(tool.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [tool.url]);

  const priceInfo = useMemo(() => getPriceInfo(tool.desc), [tool.desc]);
  const cleanDesc = useMemo(() => getCleanDesc(tool.desc), [tool.desc]);

  const imageSrc = useMemo(() => getLogoUrl(tool.logo), [tool.logo]);

  const fallbackLetter = (tool.name || "?").charAt(0).toUpperCase();
  const fallbackColors = [
    "#4a6cf7","#f59e0b","#10b981","#ef4444","#8b5cf6",
    "#ec4899","#06b6d4","#f97316","#14b8a6","#6366f1",
  ];
  const colorIndex = (tool.name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % fallbackColors.length;

  let domain = "";
  try {
    domain = new URL(tool.url).hostname;
  } catch {}

  const screenshotUrl = domain ? `https://image.thum.io/get/width/680/crop/400/https://${domain}` : "";

  return (
    <div className="tool-detail-overlay" onClick={onClose}>
      <div className="tool-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="td-close" onClick={onClose}>✕</button>

        {/* Screenshot */}
        <div className="td-screenshot">
          {screenshotUrl && !screenshotError ? (
            <>
              {!screenshotLoaded && (
                <div className="td-screenshot-placeholder">
                  <div className="td-screenshot-loading" />
                  <span>加载网站预览...</span>
                </div>
              )}
              <img
                src={screenshotUrl}
                alt={`${tool.name} preview`}
                onLoad={() => setScreenshotLoaded(true)}
                onError={() => setScreenshotError(true)}
                style={{ display: screenshotLoaded ? "block" : "none" }}
              />
            </>
          ) : (
            <div className="td-screenshot-placeholder">
              <span>暂无网站预览</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="td-body">
          {/* Header */}
          <div className="td-header">
            <div className="td-logo">
              <LogoImg src={imageSrc} fallbackLetter={fallbackLetter} fallbackColor={fallbackColors[colorIndex]} name={tool.name} />
            </div>
            <div className="td-info">
              <h2 className="td-name">{tool.name}</h2>
              <div className="td-meta">
                {tool.catelog && <span className="td-category">{tool.catelog}</span>}
                {priceInfo && (
                  <span className={`td-price-badge td-price-${priceInfo.type}`}>
                    {priceInfo.label}
                  </span>
                )}
              </div>
            </div>
            <button className={`td-fav-btn ${fav ? "is-fav" : ""}`} onClick={handleFav} title={fav ? "取消收藏" : "添加收藏"}>
              {fav ? "♥" : "♡"}
            </button>
          </div>

          {/* Description */}
          {cleanDesc && <div className="td-desc">{cleanDesc}</div>}

          {/* URL */}
          <div className="td-url">
            <svg className="td-url-icon" width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M8 12a4.5 4.5 0 0 0 6.36-.64l2-2a4.5 4.5 0 0 0-6.36-6.36l-1.15 1.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 8a4.5 4.5 0 0 0-6.36.64l-2 2a4.5 4.5 0 0 0 6.36 6.36l1.14-1.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {tool.url}
          </div>

          {/* Actions */}
          <div className="td-actions">
            <a href={tool.url} target="_blank" rel="noreferrer" className="td-visit-btn">
              访问网站
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M7 3h10v10M17 3 7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <button className="td-copy-btn" onClick={handleCopy}>
              {copied ? "✓ 已复制" : "复制链接"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogoImg = ({ src, fallbackLetter, fallbackColor, name }: { src: string; fallbackLetter: string; fallbackColor: string; name: string }) => {
  const [error, setError] = useState(false);
  if (error) {
    return <div className="td-logo-fallback" style={{ background: fallbackColor }}>{fallbackLetter}</div>;
  }
  return <img src={src} alt={name} onError={() => setError(true)} />;
};

export default ToolDetail;
