// store/postSlice.js
export const createHistorySlice = (set) => ({
    history: [],
    display: {},
    displayUnordered: {},
    data: [],
    testResults: null,
    straightTestResults: null,
    setHistory: (history) => set({history}),
    setDisplay: (display) => set({display}),
    setDisplayUnordered: (displayUnordered) => set({displayUnordered}),
    setData: (data) => set({data}),
    setTestResults: (testResults) => set({testResults}),
    setStraightTestResults: (straightTestResults) => set({straightTestResults}),
    clearHistory: () => set({ history: [], display: {}, displayUnordered: {}, data: [], testResults: null, straightTestResults: null }),
});