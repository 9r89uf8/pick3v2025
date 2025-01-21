import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Chip,
    styled,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    CheckCircleOutline,
    Cancel,
    Today,
    AccessTime,
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
    width: '100%',
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.primary.dark, 0.8)}, 
      ${alpha(theme.palette.primary.main, 0.6)})`,
    backdropFilter: 'blur(10px)',
    borderRadius: theme.spacing(2),
    border: `1px solid ${alpha('#ffffff', 0.2)}`,
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
}));

const NumberBox = styled(Box)(({ isvalid, theme }) => ({
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    backgroundColor: isvalid
        ? alpha(theme.palette.success.main, 0.2)
        : alpha(theme.palette.error.main, 0.1),
    border: `1px solid ${
        isvalid
            ? theme.palette.success.main
            : theme.palette.error.main
    }`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60px',
}));

const StatusChip = styled(Chip)(({ isvalid, theme }) => ({
    backgroundColor: isvalid
        ? alpha(theme.palette.success.main, 0.9)
        : alpha(theme.palette.error.main, 0.9),
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: theme.spacing(1),
}));

/**
 * Checks if the sorted[0] is in [0..4],
 * sorted[1] is in [2..7], and
 * sorted[2] is in [5..9],
 * plus NO DUPLICATES (lowest, middle, highest must be distinct).
 */
const validateSortedDraw = (sortedNums) => {
    const [lowest, middle, highest] = sortedNums;

    // No duplicates allowed
    const allDistinct = (lowest !== middle) && (middle !== highest) && (lowest !== highest);

    return (
        allDistinct &&
        lowest >= 0 && lowest <= 2 &&
        middle >= 3 && middle <= 6 &&
        highest >= 7 && highest <= 9
    );
};

/**
 * Given a number and its position (lowest|middle|highest),
 * return true if it fits the expected range for that position.
 */
const validateNumberByPosition = (num, position) => {
    switch (position) {
        case 'lowest':
            return num >= 0 && num <= 2;
        case 'middle':
            return num >= 3 && num <= 6;
        case 'highest':
            return num >= 7 && num <= 9;
        default:
            return false;
    }
};

/**
 * Determine if `num` in the original, unsorted array
 * corresponds to the `lowest`, `middle`, or `highest` position
 * in the sorted array. This is used so that we highlight
 * each box according to its intended position-based rule.
 */
const getPositionInSortedDraw = (num, originalArray) => {
    // Make a copy and sort the copy
    const sorted = [...originalArray].sort((a, b) => a - b);

    // Because there could be duplicates, we do a small trick:
    // 1) find the index of the FIRST matching occurrence
    // 2) temporarily set it to null so subsequent duplicates
    //    won't snag the same index
    for (let i = 0; i < sorted.length; i++) {
        if (sorted[i] === num) {
            if (i === 0) {
                sorted[i] = null;
                return 'lowest';
            } else if (i === 1) {
                sorted[i] = null;
                return 'middle';
            } else if (i === 2) {
                sorted[i] = null;
                return 'highest';
            }
        }
    }

    // Fallback in case something is off
    return null;
};

const DrawList = ({ draws }) => {
    return (
        <Grid container spacing={2} sx={{ p: 2 }}>
            {draws?.slice(0, 60).map((item, index) => {
                // Convert to numbers
                const rawNumbers = [
                    Number(item.sortedFirstNumber),
                    Number(item.sortedSecondNumber),
                    Number(item.sortedThirdNumber),
                ];

                // Sort them (lowest, middle, highest)
                const sortedNums = [...rawNumbers].sort((a, b) => a - b);

                // Check entire draw validity
                const drawIsValid = validateSortedDraw(sortedNums);

                return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <StyledCard elevation={4}>
                            <CardContent>
                                <Box
                                    sx={{
                                        mb: 2,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: 2,
                                    }}
                                >
                                    {rawNumbers.map((num, idx) => {
                                        const position = getPositionInSortedDraw(
                                            num,
                                            rawNumbers
                                        );

                                        const isNumValid = validateNumberByPosition(
                                            num,
                                            position
                                        );

                                        return (
                                            <NumberBox
                                                key={idx}
                                                isvalid={isNumValid}
                                            >
                                                <Typography
                                                    variant="h4"
                                                    color="white"
                                                >
                                                    {num}
                                                </Typography>
                                                {isNumValid ? (
                                                    <CheckCircleOutline
                                                        sx={{
                                                            color: 'success.light',
                                                            mt: 0.5,
                                                        }}
                                                    />
                                                ) : (
                                                    <Cancel
                                                        sx={{
                                                            color: 'error.light',
                                                            mt: 0.5,
                                                        }}
                                                    />
                                                )}
                                            </NumberBox>
                                        );
                                    })}
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <StatusChip
                                        label={drawIsValid ? 'PASSED' : 'FAILED'}
                                        isvalid={drawIsValid}
                                    />

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 2,
                                            mt: 2,
                                            color: 'white',
                                            opacity: 0.8,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                            }}
                                        >
                                            <Today fontSize="small" />
                                            <Typography variant="body2">
                                                {item.drawDate}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                            }}
                                        >
                                            <AccessTime fontSize="small" />
                                            <Typography variant="body2">
                                                {item.time}
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
