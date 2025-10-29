// Shared configuration for focus pairs tracked across the app.
export const TARGET_PAIRS_BY_POSITION = {
    '1st & 2nd': ['0-1', '0-2', '1-2', '3-4', '1-4'],
    '1st & 3rd': ['1-8', '1-9', '0-9', '0-7', '0-8'],
    '2nd & 3rd': ['7-8', '8-9', '6-7', '5-7', '5-8']
};

export const ALL_TARGET_PAIRS = Object.values(TARGET_PAIRS_BY_POSITION).flat();
