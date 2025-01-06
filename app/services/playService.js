import { useStore } from '../store/store'; // Ensure you import the correct store

export const playNums = async (formData) => {
    const setNumbers = useStore.getState().setNumbers;
    try {
        const response = await fetch('/api/play/newPlayNumbers',{
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