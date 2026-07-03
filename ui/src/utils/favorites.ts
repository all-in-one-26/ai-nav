const STORAGE_KEY = "ai-nav-favorites";

export const getFavorites = (): number[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const isFavorite = (id: number): boolean => {
  return getFavorites().includes(id);
};

export const toggleFavorite = (id: number): boolean => {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) {
    favs.push(id);
  } else {
    favs.splice(idx, 1);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  return idx === -1;
};
