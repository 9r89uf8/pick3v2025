import { useStore } from '../store/store'; // Ensure you import the correct store

export const playCombo = async (formData) => {
    const setNumbers = useStore.getState().setNumbers;
    try {
        const response = await fetch('/api/play/combo',{
            method: 'POST',
            cache: 'no-store',
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const numbers = await response.json();
            setNumbers(numbers);
            return numbers;
        } else {
            throw new Error('Failed to fetch posts');
        }
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const playStraight = async (formData) => {
    const setNumbers = useStore.getState().setNumbers;
    try {
        const response = await fetch('/api/play/straight',{
            method: 'POST',
            cache: 'no-store',
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const numbers = await response.json();
            setNumbers(numbers);
            return numbers;
        } else {
            throw new Error('Failed to fetch posts');
        }
    } catch (error) {
        console.error(error);
        return [];
    }
};


export const checkComboDraws = async () => {
    const setCheckLoading = useStore.getState().setCheckLoading;
    const setTestResults = useStore.getState().setTestResults;
    try {
        setCheckLoading(true)
        const response = await fetch('/api/test/combo', {
            method: 'GET',
            cache: 'no-store'
        });

        if (response.ok) {
            setCheckLoading(false)
            const results = await response.json();
            setTestResults(results);
            return results;
        } else {
            setCheckLoading(false)
            throw new Error('Failed to check posts');
        }
    } catch (error) {
        setCheckLoading(false)
        console.error(error);
        return [];
    }
};

export const checkStraightDraws = async () => {
    const setCheckLoading = useStore.getState().setCheckLoading;
    const setStraightTestResults = useStore.getState().setStraightTestResults;
    try {
        setCheckLoading(true)
        const response = await fetch('/api/test/straight', {
            method: 'GET',
            cache: 'no-store'
        });

        if (response.ok) {
            setCheckLoading(false)
            const results = await response.json();
            setStraightTestResults(results);
            return results;
        } else {
            setCheckLoading(false)
            throw new Error('Failed to check straight draws');
        }
    } catch (error) {
        setCheckLoading(false)
        console.error(error);
        return [];
    }
};

// Legacy function names for backward compatibility
export const playOptionOne = playCombo;
export const playOptionTwo = playStraight;
export const checkDraws = checkComboDraws;