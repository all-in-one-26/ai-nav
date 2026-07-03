import "./index.css";
import { useCallback } from "react";
interface TagSelectorProps {
  tags: any;
  onTagChange: (newTag: string) => void;
  currTag: string;
  onMenuClick?: () => void;
  emojiMap?: Record<string, string>;
}
const TagSelector = (props: TagSelectorProps) => {
  const { tags = ["all"], onTagChange, currTag, onMenuClick, emojiMap = {} } = props;
  const renderTags = useCallback(() => {
    return tags.map((each) => {
      const displayText = each === null || each === undefined || each === "" || (typeof each === 'string' && each.trim() === "")
        ? "未分类"
        : each;
      const emoji = emojiMap[each] || "";

      return (
        <span
          className={`select-tag ${
            currTag === each ? "select-tag-active" : ""
          }`}
          key={`${each}-select-tag`}
          onClick={() => {
            onTagChange(each);
          }}
        >
          {emoji && <span className="tag-emoji">{emoji}</span>}{displayText}
        </span>
      );
    });
  }, [tags, onTagChange, currTag, emojiMap]);
  return (
    <div className="tag-selector span-3">
      <div className="tag-selector-wrapper">
        {onMenuClick && (
          <span className="select-tag tag-menu-btn" onClick={onMenuClick}>
            ☰ 全部分类
          </span>
        )}
        <span
          className={`select-tag ${currTag === "全部工具" ? "select-tag-active" : ""}`}
          onClick={() => onTagChange("全部工具")}
        >
          🏠 全部
        </span>
        {renderTags()}
      </div>
    </div>
  );
};

export default TagSelector;
