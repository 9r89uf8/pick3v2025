import React, { useState } from 'react';
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
    Chip
} from '@mui/material';
import { useStore } from '@/app/store/store';
import { playCombo } from "@/app/services/playService";
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import Looks3OutlinedIcon from '@mui/icons-material/Looks3Outlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import RuleFolderOutlinedIcon from '@mui/icons-material/RuleFolderOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NumbersList from "@/app/components/NumbersList";

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
                padding: theme => theme.spacing(2, 2.5),
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                gap: 2,
                borderBottom: expanded ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
            }}
        >
            <ListItemIcon sx={{ minWidth: 'auto', color: '#ffc300', mt: 0.5 }}>
                {icon}
            </ListItemIcon>
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
            <Box sx={{ padding: theme => theme.spacing(1.5, 2.5, 2.5, 2.5), color: 'rgba(255, 255, 255, 0.85)' }}>
                <Typography variant="body1" component="div">
                    {description}
                </Typography>
            </Box>
        </Collapse>
    </Paper>
);

const ComboPlayInfo = () => {
    const numbers = useStore((state) => state.numbers);
    const clearNumbers = useStore((state) => state.clearNumbers);
    const handleClear = () => {
        clearNumbers();
    };

    // State for expanded rule sections
    const [expandedRule, setExpandedRule] = useState(null);
    const [showBBACombinations, setShowBBACombinations] = useState(false);
    const [showBAACombinations, setShowBAACombinations] = useState(false);

    const handlePlayClick = async () => {
        try {
            await playCombo();
        } catch (error) {
            alert("There was an issue starting the play sequence. Please try again.");
        }
    };

    const handleToggleRule = (index) => {
        setExpandedRule(expandedRule === index ? null : index);
    };

    // Create all valid BBA combinations
    const generateBBACombos = () => {
        const combos = [];

        // Valid BB pairs (first two B numbers with difference ≤ 2)
        const bbPairs = [
            [0, 1], [0, 2],
            [1, 2], [1, 3],
            [2, 3], [2, 4],
            [3, 4]
        ];

        // For each valid BB pair, combine with each A number (5-9)
        for (const pair of bbPairs) {
            for (let a = 5; a <= 9; a++) {
                combos.push([...pair, a]);
            }
        }

        return combos;
    };

    // Create all valid BAA combinations
    const generateBAACombos = () => {
        const combos = [];

        // Valid AA pairs (two A numbers with difference ≤ 2)
        const aaPairs = [
            [5, 6], [5, 7],
            [6, 7], [6, 8],
            [7, 8], [7, 9],
            [8, 9]
        ];

        // For each valid AA pair, combine with each B number (0-4)
        for (const pair of aaPairs) {
            for (let b = 0; b <= 4; b++) {
                combos.push([b, ...pair]);
            }
        }

        return combos;
    };

    const bbaCombinations = generateBBACombos();
    const baaCombinations = generateBAACombos();

    const rules = [
        {
            icon: <Looks3OutlinedIcon fontSize="large" />,
            title: "1. Valid Numbers",
            description: "Each draw must consist of three numbers. These numbers must be unique (no repeats) and each must be a single digit from 0 to 9.",
        },
        {
            icon: <CategoryOutlinedIcon fontSize="large" />,
            title: "2. A/B Distribution Pattern",
            description: "Numbers are categorized: 'B' for digits 0-4 and 'A' for digits 5-9. To pass, the three unique numbers must form either a 'BBA' pattern (two 'B' numbers, one 'A' number) or a 'BAA' pattern (one 'B' number, two 'A' numbers).",
        },
        {
            icon: <RuleFolderOutlinedIcon fontSize="large" />,
            title: "3. Spread Consistency (Sorted Numbers)",
            description: (
                <>
                    For a draw to pass, its numbers (after being sorted numerically) must meet specific difference criteria based on its A/B pattern:
                    <List dense sx={{pl: 1, mt: 1, '& .MuiListItem-root': {paddingLeft: 0, alignItems: 'flex-start'} }}>
                        <ListItem>
                            <ListItemIcon sx={{minWidth: '24px', color: '#ffc300', mt: '4px' }}><CompareArrowsOutlinedIcon sx={{fontSize: '1.2rem'}} /></ListItemIcon>
                            <ListItemText
                                primaryTypographyProps={{variant: 'body2', color: 'rgba(255,255,255,0.85)'}}
                                primary="BBA Pattern: The difference between the second and first sorted numbers must be 2 or less."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon sx={{minWidth: '24px', color: '#ffc300', mt: '4px'}}><CompareArrowsOutlinedIcon sx={{fontSize: '1.2rem'}} /></ListItemIcon>
                            <ListItemText
                                primaryTypographyProps={{variant: 'body2', color: 'rgba(255,255,255,0.85)'}}
                                primary="BAA Pattern: The difference between the third and second sorted numbers must be 2 or less."
                            />
                        </ListItem>
                    </List>
                </>
            )
        },
    ];

    return (
        <StyledRulesContainer elevation={3}>
            <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#ffc300',
                    mb: 4,
                }}
            >
                Combo Rules
            </Typography>

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

            {/* New Possible Combinations Section */}
            <Paper
                elevation={0}
                sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${alpha('#ffffff', 0.15)}`,
                    borderRadius: 2,
                    mt: 2,
                }}
            >
                <Box
                    sx={{
                        padding: theme => theme.spacing(2, 2.5),
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'default',
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
                            There are exactly 35 possible combinations for BBA and 35 for BAA patterns.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ padding: theme => theme.spacing(2, 2.5) }}>
                    <Grid container spacing={2}>
                        {/* BBA Combinations */}
                        <Grid item xs={12} md={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setShowBBACombinations(!showBBACombinations)}
                                endIcon={<ExpandMoreIcon sx={{
                                    transform: showBBACombinations ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s'
                                }} />}
                                sx={{
                                    color: '#ffc300',
                                    borderColor: 'rgba(255, 195, 0, 0.5)',
                                    '&:hover': {
                                        borderColor: '#ffc300',
                                        background: 'rgba(255, 195, 0, 0.1)',
                                    },
                                    mb: 1
                                }}
                            >
                                View BBA Combinations (35)
                            </Button>
                            <Collapse in={showBBACombinations} timeout="auto" unmountOnExit>
                                <Box sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    mt: 1,
                                    p: 1.5,
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    borderRadius: 1
                                }}>
                                    {bbaCombinations.map((combo, idx) => (
                                        <CombinationChip
                                            key={idx}
                                            label={combo.join(' - ')}
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Collapse>
                        </Grid>

                        {/* BAA Combinations */}
                        <Grid item xs={12} md={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setShowBAACombinations(!showBAACombinations)}
                                endIcon={<ExpandMoreIcon sx={{
                                    transform: showBAACombinations ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s'
                                }} />}
                                sx={{
                                    color: '#ffc300',
                                    borderColor: 'rgba(255, 195, 0, 0.5)',
                                    '&:hover': {
                                        borderColor: '#ffc300',
                                        background: 'rgba(255, 195, 0, 0.1)',
                                    },
                                    mb: 1
                                }}
                            >
                                View BAA Combinations (35)
                            </Button>
                            <Collapse in={showBAACombinations} timeout="auto" unmountOnExit>
                                <Box sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    mt: 1,
                                    p: 1.5,
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    borderRadius: 1
                                }}>
                                    {baaCombinations.map((combo, idx) => (
                                        <CombinationChip
                                            key={idx}
                                            label={combo.join(' - ')}
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Collapse>
                        </Grid>
                    </Grid>

                    {/* Summary stats */}
                    <Box sx={{ mt: 2, p: 2, background: 'rgba(255, 195, 0, 0.1)', borderRadius: 1, border: '1px dashed rgba(255, 195, 0, 0.3)' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            <strong>Total Valid Combinations:</strong> 70 out of 720 possible 3-digit combinations (9.7%)
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 4 }} />

            <Typography variant="body1" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', mb: 3, fontStyle: 'italic' }}>
                Only draws that satisfy all these conditions are considered "Passing Draws".
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

export default ComboPlayInfo;
