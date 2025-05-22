// store/postSlice.js
export const createHistorySlice = (set) => ({
    history: [],
    display: {},
    displayUnordered: {},
    data: [],
    setHistory: (history) => set({history}),
    setDisplay: (display) => set({display}),
    setDisplayUnordered: (displayUnordered) => set({displayUnordered}),
    setData: (data) => set({data}),
    clearHistory: () => set({ history: [], display: {}, displayUnordered: {} }),
});