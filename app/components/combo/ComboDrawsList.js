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

const ComboDrawsList = ({ draws }) => {
    const theme = useTheme();

    return (
        <Grid container spacing={3} sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {draws?.slice(0, 200).map((item, index) => {
                // Get the draw numbers
                const sortedDrawNumbers = [
                    Number(item.sortedFirstNumber),
                    Number(item.sortedSecondNumber),
                    Number(item.sortedThirdNumber),
                ].filter(n => !isNaN(n));

                const fireballNumber = Number(item.fireball);

                // Check if this draw has validation data
                const hasValidationData = item.isValidNewRules !== undefined && item.newRulesABPattern !== undefined;

                // If we don't have 3 numbers, it's invalid
                if (sortedDrawNumbers.length !== 3) {
                    console.warn(`Skipping draw item (ID: ${item.drawId || 'N/A'}) due to insufficient valid sorted numbers.`);
                    return (
                        <Grid item xs={12} sm={6} md={4} key={item.drawId || index}>
                            <StyledCard>
                                <CardContent><Typography color="error">Invalid draw data: Not enough numbers.</Typography></CardContent>
                            </StyledCard>
                        </Grid>
                    );
                }

                return (
                    <Grid item xs={12} sm={6} md={4} key={item.drawId || index}>
                        <StyledCard elevation={8}>
                            <CardContent sx={{ p: 2.5 }}>
                                {/* Draw Numbers */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                                    {sortedDrawNumbers.map((num, idx) => (
                                        <NumberBox key={idx}>
                                            <Typography variant="h4" sx={{ color: 'common.white', fontWeight: 700 }}>
                                                {num}
                                            </Typography>
                                        </NumberBox>
                                    ))}
                                </Box>

                                {/* Fireball */}
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
                                    {/* Show validation results if available */}
                                    {hasValidationData ? (
                                        <>
                                            {/* Main Draw Status */}
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <Tooltip
                                                    title={`Main Draw: ${item.newRulesReason || 'N/A'}`}
                                                    arrow
                                                >
                                                    <StatusChip
                                                        label={item.isValidNewRules ? 'PASS' : 'FAIL'}
                                                        isvalidprop={item.isValidNewRules}
                                                    />
                                                </Tooltip>

                                                {/* Pattern Chip */}
                                                <PatternChip
                                                    label={item.newRulesABPattern || 'N/A'}
                                                    size="small"
                                                />
                                            </Box>

                                            {/* Fireball analysis if available */}
                                            {item.isValidFireballNewRules !== undefined && item.fireballPassDetails && (
                                                <Box sx={{ mt: 1.5, width: '100%', px: 1 }}>
                                                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: alpha('#ffffff', 0.7), mb: 1 }}>
                                                        Fireball Substitutions ({item.fireballPassCount || 0} Pass)
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                        {item.fireballPassDetails.map((detail, idx) => {
                                                            const combinationDisplay = detail.sorted ? detail.sorted.join('-') : detail.substitution.join('-');

                                                            return (
                                                                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '95%', maxWidth: '320px', gap: 0.5 }}>
                                                                    <Tooltip
                                                                        title={`FB (${fireballNumber}) at position ${detail.position || idx + 1}. Pattern: ${detail.abPattern || detail.pattern}`}
                                                                        arrow
                                                                        placement="left"
                                                                    >
                                                                        <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.9), mr: 0.5, whiteSpace: 'nowrap' }}>
                                                                            Pos {detail.position || idx + 1}➔FB:
                                                                        </Typography>
                                                                    </Tooltip>
                                                                    <Chip
                                                                        label={combinationDisplay}
                                                                        color="success"
                                                                        size="small"
                                                                        sx={{ flexGrow: 1, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                                                                    />
                                                                    <Chip
                                                                        label={detail.abPattern || detail.pattern || 'PASS'}
                                                                        color="success"
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{ ml: 0.5 }}
                                                                    />
                                                                </Box>
                                                            );
                                                        })}

                                                        {/* Show if no fireball passes */}
                                                        {item.fireballPassCount === 0 && (
                                                            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5), fontStyle: 'italic' }}>
                                                                No passing fireball substitutions
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            )}
                                        </>
                                    ) : (
                                        /* Basic display without validation info */
                                        <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), fontStyle: 'italic' }}>
                                            No validation data available
                                        </Typography>
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

export default ComboDrawsList;