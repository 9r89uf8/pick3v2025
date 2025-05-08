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
    useTheme // Import useTheme to access theme properties directly if needed for sx props
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
// If it's confirmed to be unused, it can be removed.
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
// If confirmed unused across the project, it could be removed.
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
    let patternArray = ['', '', '']; // This is the internal 'patternArray'
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
const getABDistribution = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length !== 3 || numbers.some(isNaN)) {
        return "INVALID_INPUT";
    }
    if (new Set(numbers).size !== 3) {
        return "REPEATING";
    }
    let countB = 0; // Numbers 0-4
    let countA = 0; // Numbers 5-9
    for (const num of numbers) {
        if (num >= 0 && num <= 4) countB++;
        else if (num >= 5 && num <= 9) countA++;
        else return "OUT_OF_RANGE";
    }
    if (countB === 3) return "BBB";
    if (countB === 2 && countA === 1) return "BBA";
    if (countB === 1 && countA === 2) return "BAA";
    if (countA === 3) return "AAA";
    return "UNKNOWN_DIST";
};


const DrawListSorted = ({ draws }) => {
    const theme = useTheme(); // For accessing theme properties in sx props

    return (
        <Grid container spacing={3} sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {draws?.slice(0, 200).map((item, index) => {
                const sortedDrawNumbers = [
                    Number(item.sortedFirstNumber),
                    Number(item.sortedSecondNumber),
                    Number(item.sortedThirdNumber),
                ].filter(n => !isNaN(n));

                const fireballNumber = Number(item.fireball);

                if (sortedDrawNumbers.length !== 3) {
                    console.warn(`Skipping draw item (ID: ${item.drawId || 'N/A'}) due to missing/invalid sorted numbers.`);
                    return (
                        <Grid item xs={12} sm={6} md={4} key={item.drawId || index}>
                            <StyledCard>
                                <CardContent><Typography color="error">Invalid draw data</Typography></CardContent>
                            </StyledCard>
                        </Grid>
                    );
                }

                const isSortedDrawUnique = new Set(sortedDrawNumbers).size === 3;
                let mainDrawABPattern = "N/A";
                let isMainDrawBBAorBAA = false;

                if (isSortedDrawUnique) {
                    mainDrawABPattern = getABDistribution(sortedDrawNumbers);
                    isMainDrawBBAorBAA = mainDrawABPattern === "BBA" || mainDrawABPattern === "BAA";
                } else {
                    mainDrawABPattern = "REPEATING";
                }

                // L/M/H pattern for original draw is no longer calculated or displayed.

                const fireballSubResults = [];
                const hasValidFireball = !isNaN(fireballNumber);

                if (hasValidFireball) {
                    for (let i = 0; i < 3; i++) {
                        const tempSub = [...sortedDrawNumbers];
                        tempSub[i] = fireballNumber;

                        const isSubUnique = new Set(tempSub).size === 3;
                        let subABPattern = "N/A";
                        let isSubBBAorBAA = false;
                        // subLmhPattern is no longer calculated

                        if (isSubUnique) {
                            subABPattern = getABDistribution(tempSub);
                            isSubBBAorBAA = subABPattern === "BBA" || subABPattern === "BAA";
                        } else {
                            subABPattern = "REPEATING";
                        }
                        fireballSubResults.push({
                            substitutedNumbersDisplay: `[${tempSub.join(', ')}]`,
                            originalIndexReplaced: i,
                            isUnique: isSubUnique,
                            abPattern: subABPattern,
                            isBBAorBAA: isSubBBAorBAA,
                            // lmhPattern property removed
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
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: 1 }}>
                                        <Tooltip title="Sorted draw: Uniqueness status" arrow>
                                            <StatusChip
                                                label={isSortedDrawUnique ? 'UNIQUE' : 'REPEATING'}
                                                isvalidprop={isSortedDrawUnique}
                                            />
                                        </Tooltip>

                                        {isSortedDrawUnique && (
                                            <Tooltip title={`Sorted draw: A/B Distribution (${mainDrawABPattern})`} arrow>
                                                <Chip
                                                    label={`A/B: ${mainDrawABPattern}`}
                                                    color={isMainDrawBBAorBAA ? 'primary' : 'default'}
                                                    sx={{
                                                        fontWeight: isMainDrawBBAorBAA ? 700 : 500,
                                                        border: isMainDrawBBAorBAA ? `2px solid ${theme.palette.primary.light}`: 'none'
                                                    }}
                                                />
                                            </Tooltip>
                                        )}
                                        {isSortedDrawUnique && isMainDrawBBAorBAA && (
                                            <Chip label="Target A/B" color="success" size="small" variant="filled" />
                                        )}

                                        {/* L/M/H (Orig) PatternChip removed */}
                                    </Box>

                                    {hasValidFireball && fireballSubResults.length > 0 && (
                                        <Box sx={{ mt: 1.5, width: '100%', px:1 }}>
                                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: alpha('#ffffff', 0.7), mb: 1 }}>
                                                Fireball Substitution Results
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                {fireballSubResults.map((fbSub, idx) => (
                                                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '95%', maxWidth: '300px', gap: 0.5 }}>
                                                        <Tooltip title={`Fireball (${fireballNumber}) replaces number at original sorted position ${fbSub.originalIndexReplaced + 1}. Substituted set: ${fbSub.substitutedNumbersDisplay}`} arrow placement="left">
                                                            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.9), mr: 0.5, whiteSpace: 'nowrap' }}>
                                                                Pos {fbSub.originalIndexReplaced + 1}➔FB:
                                                            </Typography>
                                                        </Tooltip>
                                                        <Chip
                                                            label={fbSub.isUnique ? fbSub.abPattern : 'REPEATING'} // Only A/B pattern or REPEATING
                                                            color={!fbSub.isUnique ? 'warning' : (fbSub.isBBAorBAA ? 'success' : 'default')}
                                                            size="small"
                                                            sx={{ flexGrow: 1, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis'} }}
                                                        />
                                                        {fbSub.isUnique && fbSub.isBBAorBAA && (
                                                            <Chip label="Target" color="success" size="small" variant="outlined" sx={{ml: 0.5}} />
                                                        )}
                                                    </Box>
                                                ))}
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
