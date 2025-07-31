'use client';
import React, { useEffect, useState } from 'react';
import { fetchPosts } from './services/postService';
import { getComboDisplayInfo, getStraightDisplayInfo } from "@/app/services/displayService";
import {
  Container,
  Box,
  AppBar,
  Tabs,
  Tab,
  Collapse,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Import new organized components
import TabPanel from "@/app/components/ui/TabPanel";
import { Item, ExpandButton } from "@/app/components/ui/StyledComponents";
import ComboTab from "@/app/components/combo/ComboTab";
import StraightTab from "@/app/components/straight/StraightTab";
import PostCreationButtons from "@/app/components/shared/PostCreationButtons";

const HomePage = () => {
  const [expandSection, setExpandSection] = useState(false);
  const [tabValue, setTabValue] = useState(0); // State for active tab

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const getPosts = async () => {
      await fetchPosts();
      await getComboDisplayInfo();
      await getStraightDisplayInfo();
    };
    getPosts();
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Container maxWidth="sm">
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

        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <ComboTab />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <StraightTab />
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