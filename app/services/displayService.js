import { useStore } from '../store/store';

export const setComboDisplayInfo = async () => {
    const setDisplay = useStore.getState().setDisplay;
    try {
        const response = await fetch('/api/display/combo/create',{
            method: 'GET',
            cache: 'no-store'
        });

        if (response.ok) {
            const numbers = await response.json();
            setDisplay(numbers);
            return numbers;
        } else {
            throw new Error('Failed to create combo stats');
        }
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getComboDisplayInfo = async () => {
    const setDisplay = useStore.getState().setDisplay;

    try {
        const response = await fetch('/api/display/combo/get',{
            method: 'GET',
            cache: 'no-store'
        });

        if (response.ok) {
            const numbers = await response.json();
            setDisplay(numbers);
            return numbers;
        } else {
            throw new Error('Failed to fetch combo stats');
        }
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getStraightDisplayInfo = async () => {
    const setDisplay = useStore.getState().setDisplayUnordered;

    try {
        const response = await fetch('/api/display/straight/get',{
            method: 'GET',
            cache: 'no-store'
        });

        if (response.ok) {
            const numbers = await response.json();
            setDisplay(numbers);
            return numbers;
        } else {
            throw new Error('Failed to fetch straight stats');
        }
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const setStraightDisplayInfo = async () => {
    const setDisplay = useStore.getState().setDisplayUnordered;
    try {
        const response = await fetch('/api/display/straight/create',{
            method: 'GET',
            cache: 'no-store'
        });

        if (response.ok) {
            const numbers = await response.json();
            setDisplay(numbers);
            return numbers;
        } else {
            throw new Error('Failed to create straight stats');
        }
    } catch (error) {
        console.error(error);
        return [];
    }
};

// Legacy function names for backward compatibility
export const setDisplayInfo = setComboDisplayInfo;
export const getDisplayInfo = getComboDisplayInfo;
export const getDisplayInfoUnordered = getStraightDisplayInfo;