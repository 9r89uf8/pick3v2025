import { useStore } from '../store/store'; // Ensure you import the correct store

export const playOptionOne = async (formData) => {
    const setNumbers = useStore.getState().setNumbers;
    try {
        const response = await fetch('/api/play/sortedPlay',{
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

export const playOptionTwo = async (formData) => {
    const setNumbers = useStore.getState().setNumbers;
    try {
        const response = await fetch('/api/play/original',{
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


export const checkDraws = async () => {
    const setCheckLoading = useStore.getState().setCheckLoading;
    try {
        setCheckLoading(true)
        const response = await fetch('/api/test2', {
            method: 'GET',
            cache: 'no-store'
        });

        if (response.ok) {
            setCheckLoading(false)
            const posts = await response.json();
            return posts;
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