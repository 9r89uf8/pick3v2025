import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Chip,
    styled,
    Tooltip,
    useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Today, AccessTime } from '@mui/icons-material';

// --- Styled Components ---
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
    minWidth: '70px',
    minHeight: '70px',
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
        ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.95)}, ${alpha(theme.palette.success.dark, 0.85)})`
        : `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.95)}, ${alpha(theme.palette.warning.dark, 0.85)})`,
    color: theme.palette.common.white,
    fontWeight: 600,
    padding: theme.spacing(0.75, 1.5),
    height: 28,
    fontSize: '0.8rem',
    transition: 'all 0.2s ease',
    border: `1px solid ${alpha('#ffffff', 0.2)}`,
    boxShadow: isvalidprop
        ? `0 2px 8px ${alpha(theme.palette.success.dark, 0.4)}`
        : `0 2px 8px ${alpha(theme.palette.warning.dark, 0.4)}`,
    '&:hover': {
        transform: 'scale(1.05)',
    },
}));

// PatternChip is no longer used for L/M/H, but keeping definition if used elsewhere or for future.
const PatternChip = styled(Chip)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.info.dark, 0.8),
    color: theme.palette.common.white,
    fontWeight: 500,
    padding: theme.spacing(0.75, 1.5),
    height: 28,
    fontSize: '0.8rem',
    border: `1px solid ${alpha('#ffffff', 0.15)}`,
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.info.dark, 0.9),
        transform: 'scale(1.03)',
    }
}));


const FireballBox = styled(Box)(({ theme }) => ({
    width: 50,
    height: 50,
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
    boxShadow: `0 0 15px 2px ${alpha('#ff4500', 0.6)}`,
}));

// --- Helper function to get L/M/H Pattern (based on original positions) ---
// This function is no longer called by the DrawList component's rendering logic
// but is kept here as it might be a general utility.
const getLmhPattern = (rawNumbers) => {
    if (!Array.isArray(rawNumbers) || rawNumbers.length !== 3 || rawNumbers.some(isNaN)) {
        return "INVALID_DATA";
    }
    const uniqueNums = new Set(rawNumbers);
    if (uniqueNums.size !== rawNumbers.length) {
        return "REPEATING";
    }
    const indexedNums = rawNumbers.map((value, originalIndex) => ({ value, originalIndex }));
    const sortedNums = [...indexedNums].sort((a, b) => a.value - b.value);
    let patternArray = ['', '', ''];
    patternArray[sortedNums[0].originalIndex] = 'L';
    patternArray[sortedNums[1].originalIndex] = 'M';
    patternArray[sortedNums[2].originalIndex] = 'H';
    const pattern = patternArray.join('');
    if (pattern.length === 3 && pattern.includes('L') && pattern.includes('M') && pattern.includes('H')) {
        return pattern;
    }
    return "ERROR";
};

// --- Helper function to get A/B Distribution ---
// Assumes numbers are single digits (0-9) if called after validation.
const getABDistribution = (numbers) => {
    // This function is called by isDrawPassing. Initial validation (length, isNaN, range) happens in isDrawPassing.
    if (!Array.isArray(numbers) || numbers.length !== 3) { // Basic check
        return "INVALID_INPUT_FORMAT";
    }

    let countB = 0; // Numbers 0-4
    let countA = 0; // Numbers 5-9
    for (const num of numbers) {
        if (isNaN(num)) return "CONTAINS_NAN"; // Should be caught by isDrawPassing
        if (num >= 0 && num <= 4) countB++;
        else if (num >= 5 && num <= 9) countA++;
        else return "NUM_OUT_OF_RANGE"; // e.g. 10, -1. Should be caught by isDrawPassing
    }

    if (countB + countA !== 3) return "INVALID_COUNTS"; // If numbers were out of range and not caught

    if (countB === 3) return "BBB";
    if (countB === 2 && countA === 1) return "BBA";
    if (countB === 1 && countA === 2) return "BAA";
    if (countA === 3) return "AAA";

    return "UNKNOWN_DIST_LOGIC"; // Should ideally not be reached
};

// --- New helper function to validate draw based on all rules ---
const isDrawPassing = (numbers) => {
    // Validate numbers: must be 3 numbers, each a digit from 0-9
    if (!Array.isArray(numbers) || numbers.length !== 3 || numbers.some(n => isNaN(n) || n < 0 || n > 9)) {
        return { passing: false, abPattern: "INVALID_NUMS", reason: "Numbers must be 3 digits (0-9)." };
    }

    // Rule 1: No repeating numbers
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
        // Get A/B pattern even for repeating numbers for display purposes
        const patternForRepeating = getABDistribution([...numbers]);
        return { passing: false, abPattern: patternForRepeating, reason: "REPEATING_NUMBERS" };
    }

    const abPattern = getABDistribution(numbers);

    // Rule 2: Distribution must be 'BBA' or 'BAA'
    if (abPattern !== "BBA" && abPattern !== "BAA") {
        // Handle specific non-target patterns or errors from getABDistribution
        let reasonText = `DISTRIBUTION_NOT_TARGET (${abPattern})`;
        if (["AAA", "BBB"].includes(abPattern)) {
            reasonText = `Non-target distribution: ${abPattern}`;
        } else if (abPattern === "INVALID_INPUT_FORMAT" || abPattern === "CONTAINS_NAN" || abPattern === "NUM_OUT_OF_RANGE" || abPattern === "UNKNOWN_DIST_LOGIC") {
            reasonText = `Internal A/B calc issue: ${abPattern}`;
        }
        return { passing: false, abPattern: abPattern, reason: reasonText };
    }

    // Rule 3 & 4: Difference checks for BBA or BAA
    // The numbers are already sorted as per `sortedDrawNumbers`
    if (abPattern === "BBA") {
        // Difference between the second and first number must be 2 or less
        if (Math.abs(numbers[1] - numbers[0]) <= 2) {
            return { passing: true, abPattern: "BBA", reason: "PASS" };
        } else {
            return { passing: false, abPattern: "BBA", reason: "BBA_SPREAD_FAIL" };
        }
    }

    if (abPattern === "BAA") {
        // Difference between the third and second number must be 2 or less
        if (Math.abs(numbers[2] - numbers[1]) <= 2) {
            return { passing: true, abPattern: "BAA", reason: "PASS" };
        } else {
            return { passing: false, abPattern: "BAA", reason: "BAA_SPREAD_FAIL" };
        }
    }

    // Fallback, should not be reached if logic is correct and exhaustive
    return { passing: false, abPattern: (abPattern || "UNKNOWN"), reason: "UNHANDLED_VALIDATION_PATH" };
};


const DrawListSorted = ({ draws }) => {
    const theme = useTheme();

    return (
        <Grid container spacing={3} sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {draws?.slice(0, 200).map((item, index) => {
                // Ensure numbers are parsed and are actual numbers, filter out NaNs early.
                // The problem states "sortedFirstNumber", etc. implying they are already sorted.
                const sortedDrawNumbers = [
                    Number(item.sortedFirstNumber),
                    Number(item.sortedSecondNumber),
                    Number(item.sortedThirdNumber),
                ].filter(n => !isNaN(n)); // Keep this filter for safety

                const fireballNumber = Number(item.fireball);

                // If, after filtering NaNs, we don't have 3 numbers, it's invalid for processing.
                if (sortedDrawNumbers.length !== 3) {
                    console.warn(`Skipping draw item (ID: ${item.drawId || 'N/A'}) due to insufficient valid sorted numbers. Found: ${sortedDrawNumbers.length}`);
                    return (
                        <Grid item xs={12} sm={6} md={4} key={item.drawId || index}>
                            <StyledCard>
                                <CardContent><Typography color="error">Invalid draw data: Not enough numbers.</Typography></CardContent>
                            </StyledCard>
                        </Grid>
                    );
                }

                // Perform the comprehensive validation for the main draw
                const mainDrawValidation = isDrawPassing(sortedDrawNumbers);

                const fireballSubResults = [];
                const hasValidFireball = !isNaN(fireballNumber) && fireballNumber >=0 && fireballNumber <=9;

                if (hasValidFireball) {
                    for (let i = 0; i < 3; i++) {
                        const tempSub = [...sortedDrawNumbers];
                        tempSub[i] = fireballNumber;
                        // IMPORTANT: The problem implies the original numbers `sortedDrawNumbers` are already sorted.
                        // When substituting with fireball, the resulting `tempSub` might NOT be sorted.
                        // The rules "difference between the second and first" or "third and second"
                        // usually apply to numbers in their sorted order.
                        // If `tempSub` needs to be re-sorted before applying BBA/BAA diff rules, add:
                        tempSub.sort((a, b) => a - b);
                        // For now, assuming rules apply to the numbers *as they are* in the BBA/BAA sequence,
                        // and `sortedDrawNumbers` defines that initial sequence order.
                        // The problem statement says "the difference between the second and first number... if distribution is 'BBA'"
                        // This implies the numbers are already in an order that forms BBA.
                        // Let's assume `sortedDrawNumbers` is the sequence to check.

                        const subValidationOutcome = isDrawPassing(tempSub); // tempSub might not be sorted

                        fireballSubResults.push({
                            substitutedNumbersDisplay: `[${tempSub.join(', ')}]`,
                            originalIndexReplaced: i,
                            // Store the whole validation object
                            validationOutcome: subValidationOutcome,
                        });
                    }
                }

                return (
                    <Grid item xs={12} sm={6} md={4} key={item.drawId || index}>
                        <StyledCard elevation={8}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                                    {sortedDrawNumbers.map((num, idx) => (
                                        <NumberBox key={idx}>
                                            <Typography variant="h4" sx={{ color: 'common.white', fontWeight: 700 }}>
                                                {num}
                                            </Typography>
                                        </NumberBox>
                                    ))}
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
                                    <Tooltip title={`Fireball Number: ${item.fireball ?? '?'}`} arrow>
                                        <FireballBox>
                                            <Typography variant="h5" sx={{ color: 'common.white' }}>
                                                {item.fireball ?? '?'}
                                            </Typography>
                                        </FireballBox>
                                    </Tooltip>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                    {/* Main Draw Status */}
                                    <Tooltip
                                        title={`Main Draw: ${mainDrawValidation.reason} (A/B: ${mainDrawValidation.abPattern})`}
                                        arrow
                                    >
                                        <StatusChip
                                            label={mainDrawValidation.passing ? 'PASS' : 'FAIL'}
                                            isvalidprop={mainDrawValidation.passing}
                                        />
                                    </Tooltip>

                                    {/* L/M/H (Orig) PatternChip removed as per original comments */}

                                    {hasValidFireball && fireballSubResults.length > 0 && (
                                        <Box sx={{ mt: 1.5, width: '100%', px:1 }}>
                                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: alpha('#ffffff', 0.7), mb: 1 }}>
                                                Fireball Substitution Results
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                {fireballSubResults.map((fbSub, idx) => {
                                                    const { validationOutcome } = fbSub;
                                                    let chipLabel = validationOutcome.abPattern;
                                                    if (!validationOutcome.passing) {
                                                        // For failed cases, the reason might be more informative
                                                        chipLabel = validationOutcome.reason;
                                                    }

                                                    return (
                                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '95%', maxWidth: '320px', gap: 0.5 }}>
                                                            <Tooltip
                                                                title={`FB (${fireballNumber}) replaces original number at sorted position ${fbSub.originalIndexReplaced + 1}. Result: ${fbSub.substitutedNumbersDisplay}. Status: ${validationOutcome.reason}`}
                                                                arrow
                                                                placement="left"
                                                            >
                                                                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.9), mr: 0.5, whiteSpace: 'nowrap' }}>
                                                                    Pos {fbSub.originalIndexReplaced + 1}➔FB:
                                                                </Typography>
                                                            </Tooltip>
                                                            <Chip
                                                                label={chipLabel}
                                                                color={validationOutcome.passing ? 'success' : 'warning'}
                                                                size="small"
                                                                sx={{ flexGrow: 1, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis'} }}
                                                            />
                                                            {validationOutcome.passing && (
                                                                <Chip label="PASS" color="success" size="small" variant="outlined" sx={{ml: 0.5}} />
                                                            )}
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    )}

                                    <Box sx={{ display: 'flex', gap: 2, color: alpha('#ffffff', 0.8), mt: 2 }}>
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

export default DrawListSorted;

