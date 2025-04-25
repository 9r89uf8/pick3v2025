import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Chip,
    styled,
    Tooltip, // Import Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Today, AccessTime, LocalFireDepartment } from '@mui/icons-material'; // Added Fire icon

// --- Styled Components (StatusChip, PatternChip, FireballBox, etc. remain the same) ---
const StyledCard = styled(Card)(({ theme }) => ({
    width: '100%',
    background: `linear-gradient(
    135deg,
    ${alpha('#1a237e', 0.95)},
    ${alpha('#0d47a1', 0.85)}
  )`,
    backdropFilter: 'blur(16px)',
    borderRadius: theme.spacing(3),
    border: `1px solid ${alpha('#ffffff', 0.12)}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 28px ${alpha(theme.palette.secondary.main, 0.25)}`,
    },
}));

const NumberBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(2),
    background: alpha(theme.palette.common.white, 0.1),
    backdropFilter: 'blur(8px)',
    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '70px', // Adjusted minWidth slightly
    minHeight: '70px', // Ensure consistent height
    transition: 'all 0.2s ease',
    '&:hover': {
        background: alpha(theme.palette.common.white, 0.15),
        transform: 'scale(1.05)',
    },
}));

const StatusChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'isvalidprop',
})(({ isvalidprop, theme }) => ({
    background: isvalidprop
        ? `linear-gradient(135deg, ${alpha('#00c853', 0.95)}, ${alpha('#00e676', 0.85)})` // Green for valid
        : `linear-gradient(135deg, ${alpha('#ffc107', 0.95)}, ${alpha('#ffca28', 0.85)})`, // Amber/Yellow for invalid (repeating)
    color: isvalidprop ? theme.palette.common.white : theme.palette.common.black, // Adjust text color for contrast
    fontWeight: 600,
    padding: theme.spacing(0.75, 1.5), // Adjusted padding
    height: 28, // Adjusted height
    fontSize: '0.8rem', // Adjusted font size
    transition: 'all 0.2s ease',
    border: `1px solid ${alpha('#ffffff', 0.2)}`,
    boxShadow: isvalidprop
        ? `0 2px 8px ${alpha('#00e676', 0.4)}`
        : `0 2px 8px ${alpha('#ffca28', 0.4)}`,
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: isvalidprop
            ? `0 4px 12px ${alpha('#00e676', 0.6)}`
            : `0 4px 12px ${alpha('#ffca28', 0.6)}`,
    },
}));

const PatternChip = styled(Chip)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.info.dark, 0.8), // Informational color
    color: theme.palette.common.white,
    fontWeight: 500,
    padding: theme.spacing(0.75, 1.5), // Adjusted padding
    height: 28, // Adjusted height
    fontSize: '0.8rem', // Adjusted font size
    border: `1px solid ${alpha('#ffffff', 0.15)}`,
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.info.dark, 0.9),
        transform: 'scale(1.03)',
    }
}));

// --- Updated FireballResultChip ---
const FireballResultChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'isRepeating',
})(({ isRepeating, theme }) => ({
    // --- Increased Size & Visibility ---
    height: 28,                 // Increased height (matches other main chips)
    fontSize: '0.8rem',         // Increased font size
    fontWeight: 600,            // Increased font weight for emphasis
    lineHeight: 1.5,            // Adjust line height if needed with larger font/padding
    padding: theme.spacing(0.75, 1.5), // Increased padding (matches other main chips)
    // --- Adjusted Colors/Appearance (Optional, fine-tune as needed) ---
    backgroundColor: isRepeating
        ? alpha(theme.palette.warning.main, 0.7) // Slightly less transparent warning
        : alpha(theme.palette.success.main, 0.7), // Slightly less transparent success
    color: theme.palette.common.white, // Use white text for better contrast on darker alpha bg
    textShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.3)}`, // Subtle text shadow
    border: `1px solid ${isRepeating ? alpha(theme.palette.warning.dark, 0.8) : alpha(theme.palette.success.dark, 0.8)}`, // Stronger border
    boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.2)}`, // Add a subtle shadow
    transition: 'all 0.2s ease', // Keep transition
    '&:hover': { // Optional hover effect
        transform: 'scale(1.03)',
        backgroundColor: isRepeating
            ? alpha(theme.palette.warning.dark, 0.8)
            : alpha(theme.palette.success.dark, 0.8),
    },
}));


const FireballBox = styled(Box)(({ theme }) => ({
    width: 50, // Slightly smaller
    height: 50, // Slightly smaller
    borderRadius: '50%',
    background: `radial-gradient(
        circle at 30% 30%,
        #ffd700 25%,
        #ff4500 60%,
        #ff0000 100%
    )`,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
    fontWeight: 700,
    boxShadow: `0 0 15px 2px ${alpha('#ff4500', 0.6)}`, // Add glow
}));

// --- Helper function to get LMH Pattern (no changes needed) ---
const getLmhPattern = (rawNumbers) => {
    // Check for non-numeric values just in case
    if (rawNumbers.some(isNaN)) {
        return "INVALID_DATA";
    }

    // 1. Check for uniqueness (This also defines validity now)
    const uniqueNums = new Set(rawNumbers);
    if (uniqueNums.size !== rawNumbers.length) {
        return "REPEATING"; // Contains duplicates - mark as invalid pattern
    }

    // 2. If unique, determine the LMH pattern
    const indexedNums = rawNumbers.map((value, originalIndex) => ({ value, originalIndex }));

    // Create a stable sort if needed, but usually default sort is fine for numbers
    const sortedNums = [...indexedNums].sort((a, b) => a.value - b.value);
    // sortedNums[0] is L, sortedNums[1] is M, sortedNums[2] is H

    let patternArray = ['', '', ''];
    patternArray[sortedNums[0].originalIndex] = 'L'; // Place L in its original slot
    patternArray[sortedNums[1].originalIndex] = 'M'; // Place M in its original slot
    patternArray[sortedNums[2].originalIndex] = 'H'; // Place H in its original slot

    const pattern = patternArray.join(''); // e.g., "MHL", "LMH"

    // Optional: Check if pattern is one of the expected 6 (should always be if unique)
    if (pattern.length === 3 && pattern.includes('L') && pattern.includes('M') && pattern.includes('H')) {
        return pattern;
    } else {
        // This case should not happen with unique numbers 0-9
        console.error("Unexpected error generating LMH pattern for:", rawNumbers);
        return "ERROR";
    }
};


const DrawList = ({ draws }) => {
    // ... (rest of the DrawList component remains the same)
    return (
        <Grid container spacing={3} sx={{ p: 3 }}>
            {draws?.slice(0, 200).map((item, index) => {
                // Ensure numbers are parsed correctly
                const rawNumbers = [
                    Number(item.originalFirstNumber),
                    Number(item.originalSecondNumber),
                    Number(item.originalThirdNumber),
                ];

                // Calculate validity (uniqueness) and LMH pattern for original draw
                const originalPatternResult = getLmhPattern(rawNumbers);
                const isOriginalDrawValid = originalPatternResult !== "REPEATING" && originalPatternResult !== "INVALID_DATA" && originalPatternResult !== "ERROR";

                // --- Fireball Pattern Calculation ---
                let fireballPatterns = ["N/A", "N/A", "N/A"]; // Default
                const fireball = Number(item.fireball);
                let hasValidFireball = false;

                if (!isNaN(fireball) && rawNumbers.length === 3 && !rawNumbers.some(isNaN)) {
                    hasValidFireball = true;
                    // Create the 3 substituted arrays
                    const sub1 = [fireball, rawNumbers[1], rawNumbers[2]]; // FB replaces 1st
                    const sub2 = [rawNumbers[0], fireball, rawNumbers[2]]; // FB replaces 2nd
                    const sub3 = [rawNumbers[0], rawNumbers[1], fireball]; // FB replaces 3rd

                    // Calculate pattern for each substitution
                    fireballPatterns = [
                        getLmhPattern(sub1),
                        getLmhPattern(sub2),
                        getLmhPattern(sub3)
                    ];
                }
                // --- End Fireball Calculation ---


                return (
                    <Grid item xs={12} sm={6} md={4} key={item.drawId || index}> {/* Use a stable key if available */}
                        <StyledCard elevation={8}>
                            <CardContent sx={{ p: 2.5 }}> {/* Slightly reduce padding */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center', // Align items vertically center
                                        justifyContent: 'space-around', // Distribute space
                                        mb: 2, // Reduced margin bottom
                                    }}
                                >
                                    {/* Number Display */}
                                    <Box sx={{ display: 'flex', gap: 1.5 }}> {/* Reduced gap */}
                                        {rawNumbers.map((num, idx) => (
                                            <NumberBox key={idx}>
                                                <Typography
                                                    variant="h4"
                                                    sx={{ color: 'common.white', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                                >
                                                    {isNaN(num) ? '?' : num}
                                                </Typography>
                                            </NumberBox>
                                        ))}
                                    </Box>
                                </Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center', // Align items vertically center
                                        justifyContent: 'space-around', // Distribute space
                                        mb: 2, // Reduced margin bottom
                                    }}
                                >
                                    {/* Fireball Display */}
                                    <Tooltip title="Fireball Number" arrow>
                                        <FireballBox>
                                            <Typography variant="h5" sx={{ color: 'common.white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                                {item.fireball ?? '?'}
                                            </Typography>
                                        </FireballBox>
                                    </Tooltip>
                                </Box>

                                {/* Status and Info Section */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}> {/* Reduced gap */}
                                    {/* Chips: Validity, Original Pattern */}
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                                        <Tooltip title="Original draw validity (unique numbers)" arrow>
                                            <StatusChip
                                                label={isOriginalDrawValid ? 'VALID' : 'REPEATING'}
                                                isvalidprop={isOriginalDrawValid}
                                            />
                                        </Tooltip>

                                        {isOriginalDrawValid && (
                                            <Tooltip title="Original draw pattern" arrow>
                                                <PatternChip
                                                    label={`${originalPatternResult}`} // Just show pattern
                                                />
                                            </Tooltip>
                                        )}
                                    </Box>

                                    {/* --- Fireball Patterns Display --- */}
                                    {hasValidFireball && ( // Only show if fireball is valid
                                        <Box sx={{ mt: 1.5, width: '100%', px:1 }}> {/* Added slight margin top */}
                                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: alpha('#ffffff', 0.7), mb: 1 }}> {/* Increased margin bottom */}
                                                Fireball Substitution Patterns
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}> {/* Center align items and increase gap */}
                                                {[0, 1, 2].map(idx => {
                                                    const pattern = fireballPatterns[idx];
                                                    const isRepeating = pattern === "REPEATING";
                                                    const label = `Pos ${idx + 1} ➔ FB:`; // Indicate which position was replaced
                                                    const tooltipTitle = `Pattern when Fireball (${fireball}) replaces original number at position ${idx+1}`;
                                                    return (
                                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '85%', maxWidth: '250px' }}> {/* Control width and center */}
                                                            <Tooltip title={tooltipTitle} arrow placement="left">
                                                                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.9), mr: 1 }}> {/* Make label slightly brighter */}
                                                                    {label}
                                                                </Typography>
                                                            </Tooltip>
                                                            <FireballResultChip
                                                                label={pattern}
                                                                isRepeating={isRepeating}
                                                            />
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    )}
                                    {/* --- End Fireball Patterns Display --- */}


                                    {/* Date and Time */}
                                    <Box sx={{ display: 'flex', gap: 2, color: alpha('#ffffff', 0.8), mt: 2 }}> {/* Increased margin top */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Today sx={{ fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {item.drawDate || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <AccessTime sx={{ fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {item.time || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default DrawList;