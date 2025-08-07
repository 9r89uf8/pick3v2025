// store/store.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createPostSlice } from './postSlice';
import {createPlaySlice} from "@/app/store/playSlice";
import {createHistorySlice} from "@/app/store/historySlice";
import {createFavoritesSlice} from "@/app/store/favoritesSlice";


export const useStore = create(
    persist(
        (...a) => ({
            ...createPostSlice(...a),
            ...createPlaySlice(...a),
            ...createHistorySlice(...a),
            ...createFavoritesSlice(...a)
        }),
        {
            name: 'ggg', // unique name for the storage
            storage: createJSONStorage(() => localStorage), // use local storage
        }
    )
);

export default useStore;



