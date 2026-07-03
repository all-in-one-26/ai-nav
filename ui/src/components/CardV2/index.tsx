import { useMemo, useState, useEffect, useCallback } from "react";
import "./index.css";
import { getLogoUrl } from "../../utils/check";
import { getJumpTarget } from "../../utils/setting";
import { isFavorite, toggleFavorite } from "../../utils/favorites";
import { recordClick } from "../../utils/api";

const Card = ({ title, url, des, logo, catelog, onClick, index, isSearching, noImageMode, compactMode, toolId, onShowDetail, onFavChange }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [fav, setFav] = useState(() => toolId ? isFavorite(toolId) : false);

  const imageSrc = useMemo(() => {
    return url === "admin" ? logo : getLogoUrl(logo);
  }, [logo, url]);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setShowLoading(true);
    const timeout = setTimeout(() => {
      setShowLoading(false);
    }, 10000);
    return () => clearTimeout(timeout);
  }, [imageSrc]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setShowLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setShowLoading(false);
  };

  const handleFavClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!toolId) return;
    const nowFav = toggleFavorite(toolId);
    setFav(nowFav);
    if (onFavChange) onFavChange();
  }, [toolId, onFavChange]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (url === "toggleJumpTarget") {
      onClick();
      return;
    }
    if (toolId && title && url) {
      recordClick(toolId, title, url);
    }
    if (onShowDetail) {
      e.preventDefault();
      onShowDetail();
    } else {
      onClick();
    }
  }, [url, onClick, onShowDetail, toolId, title]);

  const fallbackLetter = (title || "?").charAt(0).toUpperCase();
  const fallbackColors = [
    "#4a6cf7","#f59e0b","#10b981","#ef4444","#8b5cf6",
    "#ec4899","#06b6d4","#f97316","#14b8a6","#6366f1",
  ];
  const colorIndex = (title || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % fallbackColors.length;

  const el = useMemo(() => {
    if (imageError) {
      return <div className="card-icon-fallback" style={{ background: fallbackColors[colorIndex] }}>
        {fallbackLetter}
      </div>;
    }

    return (
      <>
        {showLoading && !imageLoaded && (
          <div className="card-loading-spinner"></div>
        )}
        <img
          src={imageSrc}
          alt={title}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            opacity: imageLoaded ? 1 : 0.1,
            transition: 'opacity 0.3s ease'
          }}
        />
      </>
    );
  }, [imageSrc, title, imageLoaded, imageError, showLoading]);

  const displayCatelog = useMemo(() => {
    return catelog === null || catelog === undefined || catelog === "" || (typeof catelog === 'string' && catelog.trim() === "")
      ? "未分类"
      : catelog;
  }, [catelog]);

  const renderDesc = (text: string) => {
    if (!text) return null;
    const priceRe = /(免费增值|免费版可用|完全免费|免费试用|免费|付费|按需报价|\$[\d,.]+\/[^\s。；，]{1,8})/;
    const m = text.match(priceRe);
    if (m) {
      const idx = text.indexOf(m[0]);
      const before = text.slice(0, idx).replace(/[。；，、\s]+$/, "");
      const price = m[0];
      const after = text.slice(idx + m[0].length).replace(/^[。；，、\s]+/, "");
      return (
        <>
          <span className="desc-main">{before}{after ? (before ? "。" : "") + after : ""}</span>
          <span className="desc-price">{price}</span>
        </>
      );
    }
    return <span className="desc-main">{text}</span>;
  };

  const showNumIndex = index < 10 && isSearching;
  return (
    <a
      href={url === "toggleJumpTarget" ? undefined : url}
      onClick={handleCardClick}
      target={getJumpTarget() === "blank" ? "_blank" : "_self"}
      rel="noreferrer"
      className="card-box"
    >
      {showNumIndex && <span className="card-index">{index + 1}</span>}
      {toolId && !compactMode && (
        <span
          className={`card-fav ${fav ? "card-fav-active" : ""}`}
          onClick={handleFavClick}
          title={fav ? "取消收藏" : "收藏"}
        >
          {fav ? "♥" : "♡"}
        </span>
      )}
      <div className={`card-content ${compactMode ? 'compact-mode' : ''}`}>
        {!noImageMode && (
          <div className="card-left">
            {el}
          </div>
        )}
        <div className="card-right">
          <div className="card-right-top">
            <span className="card-right-title" title={title}>{title}</span>
            {!compactMode && <span className="card-tag" title={displayCatelog}>{displayCatelog}</span>}
          </div>
          {!compactMode && <div className="card-right-bottom">{renderDesc(des)}</div>}
        </div>
      </div>
    </a>
  );
};

export default Card;
