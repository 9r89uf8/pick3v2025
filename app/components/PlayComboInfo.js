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
    Collapse, // Import Collapse
    IconButton // Import IconButton
} from '@mui/material';
import { useStore } from '@/app/store/store';
import { playCombo } from "@/app/services/playService"; // User's updated import
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Not used
// import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'; // Not used
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import Looks3OutlinedIcon from '@mui/icons-material/Looks3Outlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import RuleFolderOutlinedIcon from '@mui/icons-material/RuleFolderOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NumbersList from "@/app/components/NumbersList"; // For expand/collapse indication

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

// Collapsible Rule Item Component
const CollapsibleRuleItem = ({ icon, title, description, expanded, onToggle }) => (
    <Paper
        elevation={0}
        sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: `1px solid ${alpha('#ffffff', 0.15)}`,
            borderRadius: 2,
            // padding: 2.5, // Padding will be applied to header and content separately
            // height: '100%', // Height will be dynamic
        }}
    >
        {/* Clickable Header for Toggling */}
        <Box
            onClick={onToggle}
            sx={{
                padding: theme => theme.spacing(2, 2.5), // Consistent padding for the header
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                gap: 2,
                borderBottom: expanded ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none', // Separator when expanded
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
                {/* The description for rule 3 is already a JSX element, so it will render correctly.
                     For plain string descriptions, they will also render fine. */}
                <Typography variant="body1" component="div"> {/* Ensure Typography for consistent styling if description is a string */}
                    {description}
                </Typography>
            </Box>
        </Collapse>
    </Paper>
);

const PlayComboInfo = () => {
    const numbers = useStore((state) => state.numbers);
    const clearNumbers = useStore((state) => state.clearNumbers);
    const handleClear = () => {
        clearNumbers();
    };

    const [expandedRule, setExpandedRule] = useState(null); // null or -1 for all collapsed, or 0 for first rule expanded by default

    const handlePlayClick = async () => {
        // console.log("Play button clicked! Calling playCombo service...");
        try {
            await playCombo();
            // console.log("playCombo service called successfully.");
            // Add any success feedback for the user here, e.g., a toast message
        } catch (error) {
            // console.error("Error calling playCombo service:", error);
            // Add any error feedback for the user here
            alert("There was an issue starting the play sequence. Please try again.");
        }
    };

    const handleToggleRule = (index) => {
        setExpandedRule(expandedRule === index ? null : index);
    };

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

            <Grid container spacing={2}> {/* Reduced spacing slightly for a tighter look */}
                {rules.map((rule, index) => (
                    // Each rule item will take full width to allow for clear expansion
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

export default PlayComboInfo;
