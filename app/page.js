'use client';
import React, { useEffect, useState } from 'react';
import { fetchPosts } from './services/postService';
import DrawsList from "@/app/components/DrawsList";
import DrawsListSortedX from "@/app/components/DrawsListSortedX";
import DrawsListSorted from "@/app/components/DrawsListSorted";
import PlayComboInfo from "@/app/components/PlayComboInfo";
import PlayStraightInfo from "@/app/components/PlayComboInfoUnordered";
import Stats from "@/app/components/Stats";
import MarkovSecondOrder from "@/app/components/MarkovSecondOrder";
import MarkovFirstOrder from "@/app/components/MarkovFirstOrder";
import ProbabilityTable from "@/app/components/ProbabilityTable";
import StatsDisplay from "@/app/components/StatsDisplay";
import { setDisplayInfo, setDisplayInfoUnordered } from "@/app/services/displayService";
import Analysis from "@/app/components/Analysis";
import FireballAnalysis from "@/app/components/FireballAnalysis";
import {
  Button,
  List,
  Container,
  Typography,
  Box,
  AppBar,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  IconButton,
  ButtonGroup,
  Collapse,
  Divider,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import { alpha, styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useStore } from '@/app/store/store';
import {playCombo, playStraight, checkDraws, playOptionOne} from "@/app/services/playService";
import NumbersList from "@/app/components/NumbersList";
import PostCreationButtons from "@/app/components/PostCreationButtons";
import { getDisplayInfo, getDisplayInfoUnordered } from "@/app/services/displayService";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  marginTop: 15,
  color: '#ffffff',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: 10,
  border: `1px solid ${alpha('#ffffff', 0.2)}`,
}));

const ExpandButton = styled(IconButton)(({ theme }) => ({
  color: '#ffffff',
  margin: theme.spacing(1),
  transition: 'transform 0.3s',
  '&:hover': {
    backgroundColor: alpha('#ffffff', 0.1),
  },
}));

// TabPanel component to encapsulate tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
      <div
          role="tabpanel"
          hidden={value !== index}
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
      >
        {value === index && (
            <Box sx={{ pt: 2 }}>
              {children}
            </Box>
        )}
      </div>
  );
}

const HomePage = () => {
  const posts = useStore((state) => state.posts);
  const recurrence = useStore((state) => state.recurrence);
  const numbers = useStore((state) => state.numbers);
  const display = useStore((state) => state.display);
  const displayUnordered = useStore((state) => state.displayUnordered);
  const [loading, setLoading] = useState(false);
  const clearNumbers = useStore((state) => state.clearNumbers);
  const [showDashboard, setShowDashboard] = useState(false);
  const [expandSection, setExpandSection] = useState(false);
  const [tabValue, setTabValue] = useState(0); // State for active tab

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const getPosts = async () => {
      await fetchPosts();
      await getDisplayInfo()
      await getDisplayInfoUnordered()
    };
    getPosts();
  }, []);

  const handlePlayClick = async () => {
    try {
      await checkDraws();
    } catch (error) {
      alert("There was an issue starting the play sequence. Please try again.");
    }
  };

  return (
      <Box sx={{ width: '100%' }}>
        <Container maxWidth="sm">
          {/*<Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>*/}
          {/*  <Button*/}
          {/*      variant="contained"*/}
          {/*      size="large"*/}
          {/*      onClick={handlePlayClick}*/}
          {/*      startIcon={<SportsEsportsOutlinedIcon />}*/}
          {/*      sx={{*/}
          {/*        minWidth: '220px',*/}
          {/*        padding: '12px 24px',*/}
          {/*        fontWeight: 'bold',*/}
          {/*        borderRadius: '50px',*/}
          {/*        background: 'linear-gradient(45deg, #ffc300 30%, #ff8f00 90%)',*/}
          {/*        color: 'black',*/}
          {/*        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',*/}
          {/*        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',*/}
          {/*        '&:hover': {*/}
          {/*          background: 'linear-gradient(45deg, #ff8f00 30%, #ffc300 90%)',*/}
          {/*          transform: 'scale(1.05)',*/}
          {/*          boxShadow: '0 8px 20px rgba(255,195,0,0.4)',*/}
          {/*        },*/}
          {/*      }}*/}
          {/*  >*/}
          {/*    check*/}
          {/*  </Button>*/}
          {/*</Box>*/}


          {/* Tabs UI */}
          <AppBar position="static">
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="secondary"
                textColor="inherit"
                variant="fullWidth"
                aria-label="full width tabs example"
            >
              <Tab label="COMBO" />
              <Tab label="STRAIGHT" />
            </Tabs>
          </AppBar>

          {/* First Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <PlayComboInfo />
            <Analysis/>
            <FireballAnalysis/>
            {display && (
                <StatsDisplay display={display} getter={setDisplayInfo}/>
            )}

            {posts.length > 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center">
                  <List>
                    <DrawsListSortedX draws={posts} />
                  </List>
                </Box>
            ) : (
                <Typography sx={{ textAlign: 'center', mt: 2 }}>No posts available</Typography>
            )}
          </TabPanel>

          {/* Second Tab Content */}
          <TabPanel value={tabValue} index={1}>
            <PlayStraightInfo/>
            {display && (
                <StatsDisplay display={displayUnordered} getter={setDisplayInfoUnordered} />
            )}

            {posts.length > 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center">
                  <List>
                    <DrawsList draws={posts} />
                  </List>
                </Box>
            ) : (
                <Typography sx={{ textAlign: 'center', mt: 2 }}>No posts available</Typography>
            )}
          </TabPanel>

          {/* Expand section (shown on both tabs) */}
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <ExpandButton
                onClick={() => setExpandSection(!expandSection)}
                aria-label="expand section"
            >
              {expandSection ? <KeyboardArrowUpIcon fontSize='large'/> : <KeyboardArrowDownIcon fontSize='large'/>}
            </ExpandButton>
          </Box>

          <Collapse in={expandSection}>
            <Item elevation={4}>
              <PostCreationButtons />
            </Item>
          </Collapse>
        </Container>
      </Box>
  );
};

export default HomePage;