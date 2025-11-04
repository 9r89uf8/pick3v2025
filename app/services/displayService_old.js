import { useStore } from '../store/store'; // Ensure you import the correct store

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
            throw new Error('Failed to fetch posts');
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
            throw new Error('Failed to fetch posts');
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
            throw new Error('Failed to fetch posts');
        }
    } catch (error) {
        console.error(error);
        return [];
    }
};