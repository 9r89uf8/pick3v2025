export const createFavoritesSlice = (set, get) => ({
    favorites: [],
    
    addFavorite: (favorite) => set((state) => ({
        favorites: [...state.favorites, {
            ...favorite,
            id: `${favorite.combination.join('-')}-${Date.now()}`,
            addedAt: Date.now()
        }]
    })),
    
    removeFavorite: (id) => set((state) => ({
        favorites: state.favorites.filter(fav => fav.id !== id)
    })),
    
    isFavorite: (combination) => {
        const favs = get().favorites;
        const combString = combination.join('-');
        return favs.some(fav => fav.combination.join('-') === combString);
    },
    
    clearFavorites: () => set({ favorites: [] }),
    
    getFavoritesCount: () => get().favorites.length
});