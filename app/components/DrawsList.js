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
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Today, AccessTime, LocalFireDepartment, CheckCircle, Cancel } from '@mui/icons-material';

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
        ? `linear-gradient(135deg, ${alpha('#00c853', 0.95)}, ${alpha('#00e676', 0.85)})`
        : `linear-gradient(135deg, ${alpha('#ffc107', 0.95)}, ${alpha('#ffca28', 0.85)})`,
    color: isvalidprop ? theme.palette.common.white : theme.palette.common.black,
    fontWeight: 600,
    padding: theme.spacing(0.75, 1.5),
    height: 28,
    fontSize: '0.8rem',
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
    backgroundColor: alpha(theme.palette.info.dark, 0.8),
    color: theme.palette.common.white,
    fontWeight: 600,
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

// --- Helper Functions for Straight Bet Validation ---
const CATEGORY_B_MAX = 4; // Numbers 0-4 are category 'B'
const MAX_ALLOWED_DIFF = 2; // Maximum allowed difference for passing draws

/**
 * Categorizes a number as 'A' or 'B'
 * B: 0-4, A: 5-9
 */
const getCategory = (num) => num <= CATEGORY_B_MAX ? 'B' : 'A';

/**
 * Gets the A/B pattern for ordered numbers (e.g., "BBA", "BAB", etc.)
 * For STRAIGHT bets, order matters!
 */
const getOrderedPattern = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length !== 3) {
        return "INVALID_INPUT";
    }

    return numbers.map(getCategory).join('');
};

/**
 * Finds positions of matching categories for difference checking
 * Returns array of position pairs that have the same category
 */
const getMatchingCategoryPositions = (pattern) => {
    const positions = [];

    // Find all pairs of positions with the same category
    for (let i = 0; i < pattern.length; i++) {
        for (let j = i + 1; j < pattern.length; j++) {
            if (pattern[i] === pattern[j]) {
                positions.push([i, j]);
            }
        }
    }

    return positions;
};

/**
 * Validates if a STRAIGHT draw passes all rules
 * Numbers are in original order (not sorted)
 */
const validateStraightDraw = (numbers) => {
    // Rule 1: Must be 3 numbers, each 0-9
    if (!Array.isArray(numbers) || numbers.length !== 3) {
        return { valid: false, pattern: "INVALID", reason: "Must have exactly 3 numbers" };
    }

    if (numbers.some(n => isNaN(n) || n < 0 || n > 9)) {
        return { valid: false, pattern: "INVALID", reason: "Numbers must be 0-9" };
    }

    // Rule 2: No repeating numbers
    if (new Set(numbers).size !== 3) {
        const pattern = getOrderedPattern(numbers);
        return { valid: false, pattern, reason: "No repeating numbers allowed" };
    }

    // Get pattern
    const pattern = getOrderedPattern(numbers);

    // Rule 3: Check which patterns we consider valid
    // For now, let's consider patterns with 2:1 ratio (similar to COMBO)
    const validPatterns = ['BBA', 'BAB', 'ABB', 'BAA', 'ABA', 'AAB'];
    if (!validPatterns.includes(pattern)) {
        return { valid: false, pattern, reason: `Pattern ${pattern} not in valid set` };
    }

    // Rule 4: Check difference between matching category positions
    const matchingPositions = getMatchingCategoryPositions(pattern);

    // For patterns with 2 of the same category, check their difference
    if (matchingPositions.length === 1) {
        const [pos1, pos2] = matchingPositions[0];
        const diff = Math.abs(numbers[pos1] - numbers[pos2]);

        if (diff > MAX_ALLOWED_DIFF) {
            return {
                valid: false,
                pattern,
                reason: `Difference ${diff} > ${MAX_ALLOWED_DIFF}`
            };
        }
    }

    return { valid: true, pattern, reason: "PASS" };
};

const DrawListStraight = ({ draws }) => {
    return (
        <Grid container spacing={3} sx={{ p: 3 }}>
            {draws?.slice(0, 200).map((item, index) => {
                // Get the original order numbers (for STRAIGHT bets)
                const originalNumbers = [
                    Number(item.originalFirstNumber),
                    Number(item.originalSecondNumber),
                    Number(item.originalThirdNumber),
                ].filter(n => !isNaN(n));

                const fireballNumber = Number(item.fireball);

                // If we don't have 3 numbers, it's invalid
                if (originalNumbers.length !== 3) {
                    console.warn(`Skipping draw item (ID: ${item.drawId || 'N/A'}) due to insufficient valid numbers.`);
                    return (
                        <Grid item xs={12} sm={6} md={4} key={item.drawId || index}>
                            <StyledCard>
                                <CardContent><Typography color="error">Invalid draw data: Not enough numbers.</Typography></CardContent>
                            </StyledCard>
                        </Grid>
                    );
                }

                // Calculate validation for main draw
                const mainDrawValidation = validateStraightDraw(originalNumbers);

                // Calculate fireball substitutions
                const fireballResults = [];
                let fireballPassCount = 0;
                const hasValidFireball = !isNaN(fireballNumber) && fireballNumber >= 0 && fireballNumber <= 9;

                if (hasValidFireball) {
                    for (let i = 0; i < 3; i++) {
                        const substitutedNumbers = [...originalNumbers];
                        substitutedNumbers[i] = fireballNumber;

                        const validation = validateStraightDraw(substitutedNumbers);

                        fireballResults.push({
                            position: i + 1,
                            substitution: substitutedNumbers,
                            valid: validation.valid,
                            pattern: validation.pattern,
                            reason: validation.reason
                        });

                        if (validation.valid) {
                            fireballPassCount++;
                        }
                    }
                }

                return (
                    <Grid item xs={12} sm={6} md={4} key={item.drawId || index}>
                        <StyledCard elevation={8}>
                            <CardContent sx={{ p: 2.5 }}>
                                {/* Original Numbers Display (in original order) */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                                    {originalNumbers.map((num, idx) => (
                                        <NumberBox key={idx}>
                                            <Typography
                                                variant="h4"
                                                sx={{ color: 'common.white', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                            >
                                                {num}
                                            </Typography>
                                        </NumberBox>
                                    ))}
                                </Box>

                                {/* Fireball Display */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                    <Tooltip title={`Fireball Number: ${fireballNumber ?? '?'}`} arrow>
                                        <FireballBox>
                                            <Typography variant="h5" sx={{ color: 'common.white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                                {fireballNumber ?? '?'}
                                            </Typography>
                                        </FireballBox>
                                    </Tooltip>
                                </Box>

                                {/* Status and Info Section */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                    {/* Main Draw Status with Pattern */}
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        <Tooltip
                                            title={`Main Draw: ${mainDrawValidation.reason}`}
                                            arrow
                                        >
                                            <StatusChip
                                                label={mainDrawValidation.valid ? 'PASS' : 'FAIL'}
                                                isvalidprop={mainDrawValidation.valid}
                                                icon={mainDrawValidation.valid ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                                            />
                                        </Tooltip>

                                        {/* Pattern Chip */}
                                        <PatternChip
                                            label={mainDrawValidation.pattern}
                                            size="small"
                                        />
                                    </Box>

                                    {/* Fireball analysis */}
                                    {hasValidFireball && (
                                        <Box sx={{ mt: 1.5, width: '100%', px: 1 }}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'block',
                                                    textAlign: 'center',
                                                    color: alpha('#ffffff', 0.7),
                                                    mb: 1,
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Fireball Substitutions ({fireballPassCount} Pass)
                                            </Typography>

                                            {/* Show all 3 substitutions with their results */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                {fireballResults.map((result, idx) => {
                                                    const displayCombo = result.substitution.join('-');

                                                    return (
                                                        <Box key={idx} sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            width: '100%',
                                                            maxWidth: '280px',
                                                            gap: 1
                                                        }}>
                                                            <Tooltip
                                                                title={`FB (${fireballNumber}) replaces position ${result.position}`}
                                                                arrow
                                                                placement="left"
                                                            >
                                                                <Typography variant="caption" sx={{
                                                                    color: alpha('#ffffff', 0.9),
                                                                    minWidth: '80px',
                                                                    whiteSpace: 'nowrap'
                                                                }}>
                                                                    Pos {result.position}➔FB:
                                                                </Typography>
                                                            </Tooltip>

                                                            <Chip
                                                                label={displayCombo}
                                                                size="small"
                                                                sx={{
                                                                    minWidth: '80px',
                                                                    backgroundColor: result.valid
                                                                        ? alpha('#00e676', 0.3)
                                                                        : alpha('#ff6b6b', 0.3),
                                                                    color: 'white',
                                                                    fontWeight: 600,
                                                                    border: `1px solid ${result.valid
                                                                        ? alpha('#00e676', 0.5)
                                                                        : alpha('#ff6b6b', 0.5)}`
                                                                }}
                                                            />

                                                            {result.valid ? (
                                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                    <Chip
                                                                        label="PASS"
                                                                        color="success"
                                                                        size="small"
                                                                        sx={{ height: 24, fontWeight: 600 }}
                                                                    />
                                                                    {/*<Chip*/}
                                                                    {/*    label={result.pattern}*/}
                                                                    {/*    size="small"*/}
                                                                    {/*    sx={{*/}
                                                                    {/*        height: 24,*/}
                                                                    {/*        backgroundColor: alpha('#2196f3', 0.7),*/}
                                                                    {/*        color: 'white',*/}
                                                                    {/*        fontWeight: 600*/}
                                                                    {/*    }}*/}
                                                                    {/*/>*/}
                                                                </Box>
                                                            ) : (
                                                                <Chip
                                                                    label="FAIL"
                                                                    size="small"
                                                                    sx={{
                                                                        height: 24,
                                                                        backgroundColor: alpha('#ff6b6b', 0.7),
                                                                        color: 'white',
                                                                        fontWeight: 600
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Date and Time */}
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

export default DrawListStraight;