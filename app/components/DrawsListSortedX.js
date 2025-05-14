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

// --- Helper function to get A/B Distribution ---
const getABDistribution = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length !== 3) {
        return "INVALID_INPUT_FORMAT";
    }

    let countB = 0; // Numbers 0-4
    let countA = 0; // Numbers 5-9
    for (const num of numbers) {
        if (isNaN(num)) return "CONTAINS_NAN";
        if (num >= 0 && num <= 4) countB++;
        else if (num >= 5 && num <= 9) countA++;
        else return "NUM_OUT_OF_RANGE";
    }

    if (countB + countA !== 3) return "INVALID_COUNTS";

    if (countB === 3) return "BBB";
    if (countB === 2 && countA === 1) return "BBA";
    if (countB === 1 && countA === 2) return "BAA";
    if (countA === 3) return "AAA";

    return "UNKNOWN_DIST_LOGIC";
};

// --- Updated validation function with new criteria ---
const isDrawPassing = (numbers) => {
    // Validate numbers: must be 3 numbers, each a digit from 0-9
    if (!Array.isArray(numbers) || numbers.length !== 3 || numbers.some(n => isNaN(n) || n < 0 || n > 9)) {
        return { passing: false, abPattern: "INVALID_NUMS", reason: "Numbers must be 3 digits (0-9)." };
    }

    // Rule 1: No repeating numbers
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
        const patternForRepeating = getABDistribution([...numbers]);
        return { passing: false, abPattern: patternForRepeating, reason: "REPEATING_NUMBERS" };
    }

    const abPattern = getABDistribution(numbers);

    // Rule 2: Distribution must be 'BBA' or 'BAA'
    if (abPattern !== "BBA" && abPattern !== "BAA") {
        let reasonText = `DISTRIBUTION_NOT_TARGET (${abPattern})`;
        if (["AAA", "BBB"].includes(abPattern)) {
            reasonText = `Non-target distribution: ${abPattern}`;
        } else if (abPattern.startsWith("INVALID") || abPattern === "UNKNOWN_DIST_LOGIC") {
            reasonText = `Internal A/B calc issue: ${abPattern}`;
        }
        return { passing: false, abPattern: abPattern, reason: reasonText };
    }

    // Rule 3: sortedFirstNumber is 0, 1, or 2
    if (numbers[0] !== 0 && numbers[0] !== 1 && numbers[0] !== 2) {
        return { passing: false, abPattern: abPattern, reason: "FIRST_NUM_NOT_0_1_2" };
    }

    // Rule 4: sortedThirdNumber is 7, 8, or 9
    if (numbers[2] !== 7 && numbers[2] !== 8 && numbers[2] !== 9) {
        return { passing: false, abPattern: abPattern, reason: "THIRD_NUM_NOT_7_8_9" };
    }

    // All rules pass
    return { passing: true, abPattern: abPattern, reason: "PASS" };
};

const DrawListSortedX = ({ draws }) => {
    const theme = useTheme();

    return (
        <Grid container spacing={3} sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {draws?.slice(0, 200).map((item, index) => {
                // Ensure numbers are parsed and are actual numbers
                const sortedDrawNumbers = [
                    Number(item.sortedFirstNumber),
                    Number(item.sortedSecondNumber),
                    Number(item.sortedThirdNumber),
                ].filter(n => !isNaN(n));

                const fireballNumber = Number(item.fireball);

                // If we don't have 3 numbers, it's invalid
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

                // Validate main draw with updated criteria
                const mainDrawValidation = isDrawPassing(sortedDrawNumbers);

                // Check fireball substitutions
                const fireballSubResults = [];
                const hasValidFireball = !isNaN(fireballNumber) && fireballNumber >= 0 && fireballNumber <= 9;

                if (hasValidFireball) {
                    for (let i = 0; i < 3; i++) {
                        const tempSub = [...sortedDrawNumbers];
                        tempSub[i] = fireballNumber;
                        // Sort after substitution to correctly evaluate criteria
                        tempSub.sort((a, b) => a - b);
                        const subValidationOutcome = isDrawPassing(tempSub);

                        fireballSubResults.push({
                            substitutedNumbers: tempSub,
                            substitutedNumbersDisplay: `[${tempSub.join(', ')}]`,
                            originalIndexReplaced: i,
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
                                    {/* Main Draw Status with updated criteria */}
                                    <Tooltip
                                        title={`Main Draw: ${mainDrawValidation.reason} (A/B: ${mainDrawValidation.abPattern})`}
                                        arrow
                                    >
                                        <StatusChip
                                            label={mainDrawValidation.passing ? 'PASS' : 'FAIL'}
                                            isvalidprop={mainDrawValidation.passing}
                                        />
                                    </Tooltip>

                                    {/* Fireball analysis with updated criteria - MODIFIED TO SHOW THE COMBINATION */}
                                    {hasValidFireball && fireballSubResults.length > 0 && (
                                        <Box sx={{ mt: 1.5, width: '100%', px: 1 }}>
                                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: alpha('#ffffff', 0.7), mb: 1 }}>
                                                Fireball Substitution Results
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                {fireballSubResults.map((fbSub, idx) => {
                                                    const { validationOutcome, substitutedNumbers } = fbSub;

                                                    // Display the actual combination of numbers instead of the pattern
                                                    const combinationDisplay = substitutedNumbers.join('-');

                                                    return (
                                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '95%', maxWidth: '320px', gap: 0.5 }}>
                                                            <Tooltip
                                                                title={`FB (${fireballNumber}) replaces original number at sorted position ${fbSub.originalIndexReplaced + 1}. Status: ${validationOutcome.reason}`}
                                                                arrow
                                                                placement="left"
                                                            >
                                                                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.9), mr: 0.5, whiteSpace: 'nowrap' }}>
                                                                    Pos {fbSub.originalIndexReplaced + 1}➔FB:
                                                                </Typography>
                                                            </Tooltip>
                                                            <Chip
                                                                label={combinationDisplay}
                                                                color={validationOutcome.passing ? 'success' : 'warning'}
                                                                size="small"
                                                                sx={{ flexGrow: 1, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                                                            />
                                                            {validationOutcome.passing && (
                                                                <Chip label="PASS" color="success" size="small" variant="outlined" sx={{ ml: 0.5 }} />
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

export default DrawListSortedX;