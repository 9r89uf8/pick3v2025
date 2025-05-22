import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    alpha,
    styled,
    Collapse,
    IconButton,
    Chip,
} from '@mui/material';
import { useStore } from '@/app/store/store';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Looks3OutlinedIcon from '@mui/icons-material/Looks3Outlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import RuleFolderOutlinedIcon from '@mui/icons-material/RuleFolderOutlined';
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import NumbersList from "@/app/components/NumbersList";
import {playOptionTwo} from "@/app/services/playService";

// Styled component for the main container
const StyledRulesContainer = styled(Paper)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    borderRadius: theme.spacing(2.5),
    border: `1px solid ${alpha('#ffffff', 0.25)}`,
    padding: theme.spacing(3),
    marginTop: theme.spacing(4),
    color: '#ffffff',
}));

// Styled component for combination chips
const CombinationChip = styled(Chip)(({ theme }) => ({
    margin: theme.spacing(0.5),
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#f0f0f0',
    border: `1px solid ${alpha('#ffffff', 0.2)}`,
    '&:hover': {
        background: 'rgba(255, 195, 0, 0.2)',
        borderColor: 'rgba(255, 195, 0, 0.4)',
    },
}));

// Collapsible Rule Item Component
const CollapsibleRuleItem = ({ icon, title, description, expanded, onToggle }) => (
    <Paper
        elevation={0}
        sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: `1px solid ${alpha('#ffffff', 0.15)}`,
            borderRadius: 2,
        }}
    >
        {/* Clickable Header for Toggling */}
        <Box
            onClick={onToggle}
            sx={{
                padding: (theme) => theme.spacing(2, 2.5),
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                gap: 2,
                borderBottom: expanded ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
            }}
        >
            <ListItemIcon sx={{ minWidth: 'auto', color: '#ffc300', mt: 0.5 }}>{icon}</ListItemIcon>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#f0f0f0' }}>
                    {title}
                </Typography>
            </Box>
            <IconButton
                size="small"
                sx={{
                    color: 'rgba(255,255,255,0.7)',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                }}
            >
                <ExpandMoreIcon />
            </IconButton>
        </Box>

        {/* Collapsible Content */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ padding: (theme) => theme.spacing(1.5, 2.5, 2.5, 2.5), color: 'rgba(255, 255, 255, 0.85)' }}>
                <Typography variant="body1" component="div">
                    {description}
                </Typography>
            </Box>
        </Collapse>
    </Paper>
);

const generateUnorderedCombos = () => {
    const combos = [];
    const all = [...Array(10).keys()]; // 0-9
    for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
            for (let k = j + 1; k < all.length; k++) {
                const triple = [all[i], all[j], all[k]];
                const hasLow = triple.some((d) => d >= 0 && d <= 2);
                const hasHigh = triple.some((d) => d >= 7 && d <= 9);
                if (hasLow && hasHigh) {
                    combos.push(triple);
                }
            }
        }
    }
    return combos; // 54 combos
};

const generateOrderedCombos = () => {
    const combos = [];
    for (let a = 0; a < 10; a++) {
        for (let b = 0; b < 10; b++) {
            if (b === a) continue;
            for (let c = 0; c < 10; c++) {
                if (c === a || c === b) continue;
                const triple = [a, b, c];
                const hasLow = triple.some((d) => d >= 0 && d <= 2);
                const hasHigh = triple.some((d) => d >= 7 && d <= 9);
                if (hasLow && hasHigh) {
                    combos.push(triple);
                }
            }
        }
    }
    return combos; // 324 combos
};

const PlayComboInfoUnordered = () => {
    const numbers = useStore((state) => state.numbers);
    const clearNumbers = useStore((state) => state.clearNumbers);
    const handleClear = () => {
        clearNumbers();
    };


    const handlePlayClick = async () => {
        try {
            await playOptionTwo();
        } catch (error) {
            alert("There was an issue starting the play sequence. Please try again.");
        }
    };

    // Handle collapsible rules
    const [expandedRule, setExpandedRule] = useState(null);
    const handleToggleRule = (index) => {
        setExpandedRule(expandedRule === index ? null : index);
    };

    // Show/Hide combos
    const [showUnordered, setShowUnordered] = useState(false);
    const [showOrdered, setShowOrdered] = useState(false);

    const unorderedCombos = useMemo(() => generateUnorderedCombos(), []);
    const orderedCombos = useMemo(() => generateOrderedCombos(), []);

    const rules = [
        {
            icon: <Looks3OutlinedIcon fontSize="large" />,
            title: '1. Three Unique Digits',
            description: 'Each draw consists of three different digits (0‑9), with no repeats.',
        },
        {
            icon: <CategoryOutlinedIcon fontSize="large" />,
            title: '2. Range Requirement',
            description:
                'A valid draw must include at least one digit in the range 0‑2 and at least one digit in the range 7‑9.',
        },
        {
            icon: <RuleFolderOutlinedIcon fontSize="large" />,
            title: '3. Order Variants',
            description:
                'When order doesn’t matter, there are 54 possible draws. If order matters (treating 123, 132 … as distinct), there are 324 possibilities.',
        },
    ];

    return (
        <StyledRulesContainer elevation={3}>
            <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{ textAlign: 'center', fontWeight: 'bold', color: '#ffc300', mb: 4 }}
            >
                Draw Rules & Combinations
            </Typography>

            {/* RULES */}
            <Grid container spacing={2}>
                {rules.map((rule, index) => (
                    <Grid item xs={12} key={index}>
                        <CollapsibleRuleItem
                            icon={rule.icon}
                            title={rule.title}
                            description={rule.description}
                            expanded={expandedRule === index}
                            onToggle={() => handleToggleRule(index)}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* COMBINATIONS */}
            <Paper
                elevation={0}
                sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${alpha('#ffffff', 0.15)}`,
                    borderRadius: 2,
                    mt: 4,
                }}
            >
                <Box
                    sx={{
                        padding: (theme) => theme.spacing(2, 2.5),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 'auto', color: '#ffc300', mt: 0.5 }}>
                        <InfoOutlinedIcon fontSize="large" />
                    </ListItemIcon>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#f0f0f0' }}>
                            Possible Combinations
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                            54 ordered combinations · 324 unordered combinations
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ padding: (theme) => theme.spacing(2, 2.5) }}>
                    <Grid container spacing={2}>
                        {/* Unordered */}
                        <Grid item xs={12} md={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setShowUnordered(!showUnordered)}
                                endIcon={
                                    <ExpandMoreIcon
                                        sx={{
                                            transform: showUnordered ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s',
                                        }}
                                    />
                                }
                                sx={{
                                    color: '#ffc300',
                                    borderColor: 'rgba(255, 195, 0, 0.5)',
                                    '&:hover': {
                                        borderColor: '#ffc300',
                                        background: 'rgba(255, 195, 0, 0.1)',
                                    },
                                    mb: 1,
                                }}
                            >
                                View Ordered (54)
                            </Button>
                            <Collapse in={showUnordered} timeout="auto" unmountOnExit>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        mt: 1,
                                        p: 1.5,
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        borderRadius: 1,
                                        maxHeight: 300,
                                        overflowY: 'auto',
                                    }}
                                >
                                    {unorderedCombos.map((combo, idx) => (
                                        <CombinationChip key={idx} label={combo.join(' - ')} variant="outlined" />
                                    ))}
                                </Box>
                            </Collapse>
                        </Grid>

                        {/* Ordered */}
                        <Grid item xs={12} md={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setShowOrdered(!showOrdered)}
                                endIcon={
                                    <ExpandMoreIcon
                                        sx={{
                                            transform: showOrdered ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s',
                                        }}
                                    />
                                }
                                sx={{
                                    color: '#ffc300',
                                    borderColor: 'rgba(255, 195, 0, 0.5)',
                                    '&:hover': {
                                        borderColor: '#ffc300',
                                        background: 'rgba(255, 195, 0, 0.1)',
                                    },
                                    mb: 1,
                                }}
                            >
                                View Unordered (324)
                            </Button>
                            <Collapse in={showOrdered} timeout="auto" unmountOnExit>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        mt: 1,
                                        p: 1.5,
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        borderRadius: 1,
                                        maxHeight: 300,
                                        overflowY: 'auto',
                                    }}
                                >
                                    {orderedCombos.map((combo, idx) => (
                                        <CombinationChip key={idx} label={combo.join(' - ')} variant="outlined" />
                                    ))}
                                </Box>
                            </Collapse>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 4 }} />

            <Typography
                variant="body1"
                sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', mb: 2, fontStyle: 'italic' }}
            >
                Only draws that satisfy these rules are considered <strong>passing</strong>.
            </Typography>


            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handlePlayClick}
                    startIcon={<SportsEsportsOutlinedIcon />}
                    sx={{
                        minWidth: '220px',
                        padding: '12px 24px',
                        fontWeight: 'bold',
                        borderRadius: '50px',
                        background: 'linear-gradient(45deg, #ffc300 30%, #ff8f00 90%)',
                        color: 'black',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #ff8f00 30%, #ffc300 90%)',
                            transform: 'scale(1.05)',
                            boxShadow: '0 8px 20px rgba(255,195,0,0.4)',
                        },
                    }}
                >
                    Play Now!
                </Button>
            </Box>

            {numbers && numbers.length > 0 && (
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleClear}
                        sx={{
                            mt: 2,
                            background: 'linear-gradient(to right, #ef233c, #d90429)',
                            color: 'black',
                        }}
                    >
                        Clear
                    </Button>
                    <List>
                        <NumbersList combinations={numbers} />
                    </List>
                </Box>
            )}
        </StyledRulesContainer>
    );
};

export default PlayComboInfoUnordered;
