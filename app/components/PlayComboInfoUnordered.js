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
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { useStore } from '@/app/store/store';
import { playOptionOne } from "@/app/services/playService";
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

// Styled component for pattern chips
const PatternChip = styled(Chip)(({ theme }) => ({
    margin: theme.spacing(0.5),
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#f0f0f0',
    border: `1px solid ${alpha('#ffffff', 0.2)}`,
    fontWeight: 'bold',
    fontSize: '0.9rem',
}));

// Styled table cell
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    color: 'rgba(255, 255, 255, 0.9)',
    borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
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

const PlayStraightInfo = () => {
    const numbers = useStore((state) => state.numbers);
    const clearNumbers = useStore((state) => state.clearNumbers);
    const handleClear = () => {
        clearNumbers();
    };

    // State for expanded rule sections
    const [expandedRule, setExpandedRule] = useState(null);
    const [showPatternDetails, setShowPatternDetails] = useState(false);

    const handlePlayClick = async () => {
        try {
            await playOptionOne();
        } catch (error) {
            alert("There was an issue starting the play sequence. Please try again.");
        }
    };

    const handleToggleRule = (index) => {
        setExpandedRule(expandedRule === index ? null : index);
    };

    // Calculate valid combinations for each pattern
    const calculatePatternCombinations = () => {
        // For patterns with 2 B's: Valid B pairs (diff ≤ 2) × A numbers
        // Valid B pairs: (0,1), (0,2), (1,2), (1,3), (2,3), (2,4), (3,4) = 7
        // A numbers: 5, 6, 7, 8, 9 = 5
        // So each pattern with 2 B's has 7 × 5 = 35 combinations

        // For patterns with 2 A's: Valid A pairs (diff ≤ 2) × B numbers
        // Valid A pairs: (5,6), (5,7), (6,7), (6,8), (7,8), (7,9), (8,9) = 7
        // B numbers: 0, 1, 2, 3, 4 = 5
        // So each pattern with 2 A's has 7 × 5 = 35 combinations

        return {
            BBA: 35,
            BAB: 35,
            ABB: 35,
            BAA: 35,
            ABA: 35,
            AAB: 35,
            total: 210
        };
    };

    const patternCombinations = calculatePatternCombinations();

    const rules = [
        {
            icon: <Looks3OutlinedIcon fontSize="large" />,
            title: "1. Valid Numbers",
            description: "Each draw must consist of three numbers. These numbers must be unique (no repeats) and each must be a single digit from 0 to 9.",
        },
        {
            icon: <CategoryOutlinedIcon fontSize="large" />,
            title: "2. A/B Distribution Pattern (Order Matters!)",
            description: (
                <>
                    Numbers are categorized: 'B' for digits 0-4 and 'A' for digits 5-9.
                    In STRAIGHT bets, <strong style={{color: '#ffc300'}}>order matters</strong>!
                    Valid patterns are those with a 2:1 ratio:
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <PatternChip label="BBA" />
                        <PatternChip label="BAB" />
                        <PatternChip label="ABB" />
                        <PatternChip label="BAA" />
                        <PatternChip label="ABA" />
                        <PatternChip label="AAB" />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.7)' }}>
                        Example: The draw 2-7-4 has pattern BAB (B-A-B), which is different from 2-4-7 with pattern BBA (B-B-A).
                    </Typography>
                </>
            )
        },
        {
            icon: <RuleFolderOutlinedIcon fontSize="large" />,
            title: "3. Spread Consistency (Position-Based)",
            description: (
                <>
                    For STRAIGHT bets, numbers maintain their original order. The difference rule applies to positions with matching categories:
                    <List dense sx={{pl: 1, mt: 1, '& .MuiListItem-root': {paddingLeft: 0, alignItems: 'flex-start'} }}>
                        <ListItem>
                            <ListItemIcon sx={{minWidth: '24px', color: '#ffc300', mt: '4px' }}><CompareArrowsOutlinedIcon sx={{fontSize: '1.2rem'}} /></ListItemIcon>
                            <ListItemText
                                primaryTypographyProps={{variant: 'body2', color: 'rgba(255,255,255,0.85)'}}
                                primary="BBA: Positions 1 & 2 are both B → check |pos1 - pos2| ≤ 2"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon sx={{minWidth: '24px', color: '#ffc300', mt: '4px' }}><CompareArrowsOutlinedIcon sx={{fontSize: '1.2rem'}} /></ListItemIcon>
                            <ListItemText
                                primaryTypographyProps={{variant: 'body2', color: 'rgba(255,255,255,0.85)'}}
                                primary="BAB: Positions 1 & 3 are both B → check |pos1 - pos3| ≤ 2"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon sx={{minWidth: '24px', color: '#ffc300', mt: '4px' }}><CompareArrowsOutlinedIcon sx={{fontSize: '1.2rem'}} /></ListItemIcon>
                            <ListItemText
                                primaryTypographyProps={{variant: 'body2', color: 'rgba(255,255,255,0.85)'}}
                                primary="ABB: Positions 2 & 3 are both B → check |pos2 - pos3| ≤ 2"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon sx={{minWidth: '24px', color: '#ffc300', mt: '4px' }}><CompareArrowsOutlinedIcon sx={{fontSize: '1.2rem'}} /></ListItemIcon>
                            <ListItemText
                                primaryTypographyProps={{variant: 'body2', color: 'rgba(255,255,255,0.85)'}}
                                primary="BAA: Positions 2 & 3 are both A → check |pos2 - pos3| ≤ 2"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon sx={{minWidth: '24px', color: '#ffc300', mt: '4px' }}><CompareArrowsOutlinedIcon sx={{fontSize: '1.2rem'}} /></ListItemIcon>
                            <ListItemText
                                primaryTypographyProps={{variant: 'body2', color: 'rgba(255,255,255,0.85)'}}
                                primary="ABA: Positions 1 & 3 are both A → check |pos1 - pos3| ≤ 2"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon sx={{minWidth: '24px', color: '#ffc300', mt: '4px' }}><CompareArrowsOutlinedIcon sx={{fontSize: '1.2rem'}} /></ListItemIcon>
                            <ListItemText
                                primaryTypographyProps={{variant: 'body2', color: 'rgba(255,255,255,0.85)'}}
                                primary="AAB: Positions 1 & 2 are both A → check |pos1 - pos2| ≤ 2"
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
                Straight Rules
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

            {/* Possible Combinations Section */}
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
                    onClick={() => setShowPatternDetails(!showPatternDetails)}
                    sx={{
                        padding: theme => theme.spacing(2, 2.5),
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: 2,
                        borderBottom: showPatternDetails ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
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
                            There are 210 total valid combinations across all 6 patterns
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        sx={{
                            color: 'rgba(255,255,255,0.7)',
                            transform: showPatternDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s',
                        }}
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                </Box>

                <Collapse in={showPatternDetails} timeout="auto" unmountOnExit>
                    <Box sx={{ padding: theme => theme.spacing(2, 2.5) }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell><strong>Pattern</strong></StyledTableCell>
                                        <StyledTableCell align="center"><strong>Example</strong></StyledTableCell>
                                        <StyledTableCell align="center"><strong>Valid Combinations</strong></StyledTableCell>
                                        <StyledTableCell align="center"><strong>Matching Positions</strong></StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <StyledTableCell><PatternChip label="BBA" size="small" /></StyledTableCell>
                                        <StyledTableCell align="center">2-4-7</StyledTableCell>
                                        <StyledTableCell align="center">{patternCombinations.BBA}</StyledTableCell>
                                        <StyledTableCell align="center">1st & 2nd</StyledTableCell>
                                    </TableRow>
                                    <TableRow>
                                        <StyledTableCell><PatternChip label="BAB" size="small" /></StyledTableCell>
                                        <StyledTableCell align="center">1-8-3</StyledTableCell>
                                        <StyledTableCell align="center">{patternCombinations.BAB}</StyledTableCell>
                                        <StyledTableCell align="center">1st & 3rd</StyledTableCell>
                                    </TableRow>
                                    <TableRow>
                                        <StyledTableCell><PatternChip label="ABB" size="small" /></StyledTableCell>
                                        <StyledTableCell align="center">6-0-2</StyledTableCell>
                                        <StyledTableCell align="center">{patternCombinations.ABB}</StyledTableCell>
                                        <StyledTableCell align="center">2nd & 3rd</StyledTableCell>
                                    </TableRow>
                                    <TableRow>
                                        <StyledTableCell><PatternChip label="BAA" size="small" /></StyledTableCell>
                                        <StyledTableCell align="center">4-5-7</StyledTableCell>
                                        <StyledTableCell align="center">{patternCombinations.BAA}</StyledTableCell>
                                        <StyledTableCell align="center">2nd & 3rd</StyledTableCell>
                                    </TableRow>
                                    <TableRow>
                                        <StyledTableCell><PatternChip label="ABA" size="small" /></StyledTableCell>
                                        <StyledTableCell align="center">9-2-8</StyledTableCell>
                                        <StyledTableCell align="center">{patternCombinations.ABA}</StyledTableCell>
                                        <StyledTableCell align="center">1st & 3rd</StyledTableCell>
                                    </TableRow>
                                    <TableRow>
                                        <StyledTableCell><PatternChip label="AAB" size="small" /></StyledTableCell>
                                        <StyledTableCell align="center">5-6-0</StyledTableCell>
                                        <StyledTableCell align="center">{patternCombinations.AAB}</StyledTableCell>
                                        <StyledTableCell align="center">1st & 2nd</StyledTableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Summary stats */}
                        <Box sx={{ mt: 2, p: 2, background: 'rgba(255, 195, 0, 0.1)', borderRadius: 1, border: '1px dashed rgba(255, 195, 0, 0.3)' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                <strong>Total Valid Combinations:</strong> {patternCombinations.total} out of 720 possible 3-digit ordered sequences (29.2%)
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
                                Each pattern has exactly 35 valid combinations (7 valid pairs × 5 single digits)
                            </Typography>
                        </Box>
                    </Box>
                </Collapse>
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

export default PlayStraightInfo;