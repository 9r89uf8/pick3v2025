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

// --- Styled Components (keep existing styled components) ---
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

const FireballResultChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'passes',
})(({ passes, theme }) => ({
    height: 28,
    fontSize: '0.8rem',
    fontWeight: 600,
    lineHeight: 1.5,
    padding: theme.spacing(0.75, 1.5),
    backgroundColor: passes
        ? alpha(theme.palette.success.main, 0.7)
        : alpha(theme.palette.error.main, 0.7),
    color: theme.palette.common.white,
    textShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.3)}`,
    border: `1px solid ${passes ? alpha(theme.palette.success.dark, 0.8) : alpha(theme.palette.error.dark, 0.8)}`,
    boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.2)}`,
    transition: 'all 0.2s ease',
    '&:hover': {
        transform: 'scale(1.03)',
        backgroundColor: passes
            ? alpha(theme.palette.success.dark, 0.8)
            : alpha(theme.palette.error.dark, 0.8),
    },
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

// --- Helper function to check if a combination passes the conditions ---
const checkCombinationPasses = (combination) => {
    // 1. Check for uniqueness
    const uniqueNums = new Set(combination);
    if (uniqueNums.size !== combination.length) {
        return false; // Fails if it contains duplicates
    }

    // 2. Check for numbers in specific ranges
    let hasNumberInRange0to2 = false;
    let hasNumberInRange7to9 = false;

    for (const num of combination) {
        if (num >= 0 && num <= 2) {
            hasNumberInRange0to2 = true;
        }
        if (num >= 7 && num <= 9) {
            hasNumberInRange7to9 = true;
        }
    }

    // Pass only if both range conditions are met
    return hasNumberInRange0to2 && hasNumberInRange7to9;
};

const DrawList = ({ draws }) => {
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

                // Check if original draw passes our conditions
                const originalDrawPasses = checkCombinationPasses(rawNumbers);

                // --- Fireball Pattern Calculation ---
                const fireball = Number(item.fireball) || Number(item.fireball);
                let hasValidFireball = false;
                let fireballResults = [];

                if (!isNaN(fireball) && rawNumbers.length === 3 && !rawNumbers.some(isNaN)) {
                    hasValidFireball = true;

                    // Create the 3 substituted arrays
                    const combinations = [
                        [fireball, rawNumbers[1], rawNumbers[2]], // FB replaces 1st
                        [rawNumbers[0], fireball, rawNumbers[2]], // FB replaces 2nd
                        [rawNumbers[0], rawNumbers[1], fireball]  // FB replaces 3rd
                    ];

                    // Check each combination
                    fireballResults = combinations.map(combo => ({
                        combination: combo,
                        passes: checkCombinationPasses(combo)
                    }));
                }
                // --- End Fireball Calculation ---

                return (
                    <Grid item xs={12} sm={6} md={4} key={item.drawId || index}>
                        <StyledCard elevation={8}>
                            <CardContent sx={{ p: 2.5 }}>
                                {/* Original Numbers Display */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-around',
                                        mb: 2,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
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

                                {/* Fireball Display */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-around',
                                        mb: 2,
                                    }}
                                >
                                    <Tooltip title="Fireball Number" arrow>
                                        <FireballBox>
                                            <Typography variant="h5" sx={{ color: 'common.white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                                {fireball ?? '?'}
                                            </Typography>
                                        </FireballBox>
                                    </Tooltip>
                                </Box>

                                {/* Status and Info Section */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                    {/* Original Draw Status */}
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>

                                        {/* Does Original Draw Pass Conditions */}
                                        <Tooltip title="Does the original draw pass our conditions (unique, has 0-2, has 7-9)?" arrow>
                                            <FireballResultChip
                                                label={originalDrawPasses ? 'PASSES' : 'FAILS'}
                                                passes={originalDrawPasses}
                                                icon={originalDrawPasses ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                                            />
                                        </Tooltip>
                                    </Box>

                                    {/* Fireball Combinations Results */}
                                    {hasValidFireball && (
                                        <Box sx={{ mt: 1.5, width: '100%', px: 1 }}>
                                            <Typography variant="caption"
                                                        sx={{
                                                            display: 'block',
                                                            textAlign: 'center',
                                                            color: alpha('#ffffff', 0.7),
                                                            mb: 1,
                                                            fontWeight: 'bold'
                                                        }}
                                            >
                                                Fireball Substitution Results
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                {fireballResults.map((result, idx) => {
                                                    const tooltipTitle = `${result.combination.join('-')} (Fireball ${fireball} replaces position ${idx+1})`;
                                                    return (
                                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '260px' }}>
                                                            <Tooltip title={tooltipTitle} arrow placement="left">
                                                                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.9), mr: 1 }}>
                                                                    {`FB at Pos ${idx + 1}:`}
                                                                </Typography>
                                                            </Tooltip>

                                                            {/* Pass/Fail Chip */}
                                                            <FireballResultChip
                                                                label={result.passes ? 'PASS' : 'FAIL'}
                                                                passes={result.passes}
                                                                icon={result.passes ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                                                            />
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

export default DrawList;