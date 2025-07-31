import React from 'react';
import { Box, Typography, List, Button } from '@mui/material';
import { useStore } from '@/app/store/store';
import { setStraightDisplayInfo } from "@/app/services/displayService";
import { checkStraightDraws } from "@/app/services/playService";
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import ClearIcon from '@mui/icons-material/Clear';

import StraightPlayInfo from './StraightPlayInfo';
import StraightDrawsList from './StraightDrawsList';
import StraightTestResultsDisplay from './StraightTestResultsDisplay';
import StatsDisplay from '../shared/StatsDisplay';

const StraightTab = () => {
  const posts = useStore((state) => state.posts);
  const display = useStore((state) => state.display);
  const straightTestResults = useStore((state) => state.straightTestResults);
  const checkLoading = useStore((state) => state.checkLoading);
  const clearHistory = useStore((state) => state.clearHistory);

  const handleCheckClick = async () => {
    try {
      await checkStraightDraws();
    } catch (error) {
      alert("There was an issue analyzing the draws. Please try again.");
    }
  };

  const handleClearClick = () => {
    clearHistory();
  };

  return (
    <>
      <StraightPlayInfo />
      
      {/* Check and Clear Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, mb: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleCheckClick}
          startIcon={<SportsEsportsOutlinedIcon />}
          disabled={checkLoading}
          sx={{
            minWidth: '220px',
            padding: '12px 24px',
            fontWeight: 'bold',
            borderRadius: '50px',
            background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
            color: 'white',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              background: 'linear-gradient(45deg, #BA68C8 30%, #9C27B0 90%)',
              transform: 'scale(1.05)',
              boxShadow: '0 8px 20px rgba(156,39,176,0.4)',
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)',
            }
          }}
        >
          {checkLoading ? 'Analyzing...' : 'Check Historical Draws'}
        </Button>
        
        {(straightTestResults || display.totalDraws) && (
          <Button
            variant="outlined"
            size="large"
            onClick={handleClearClick}
            startIcon={<ClearIcon />}
            disabled={checkLoading}
            sx={{
              minWidth: '120px',
              padding: '12px 24px',
              fontWeight: 'bold',
              borderRadius: '50px',
              borderColor: '#f44336',
              color: '#f44336',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                borderColor: '#d32f2f',
                backgroundColor: 'rgba(244, 67, 54, 0.04)',
                transform: 'scale(1.05)',
              },
              '&:disabled': {
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
              }
            }}
          >
            Clear
          </Button>
        )}
      </Box>
      
      <StraightTestResultsDisplay testResults={straightTestResults} loading={checkLoading} />
      {display && (
        <StatsDisplay display={display} getter={setStraightDisplayInfo} />
      )}

      {posts.length > 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center">
          <List>
            <StraightDrawsList draws={posts} />
          </List>
        </Box>
      ) : (
        <Typography sx={{ textAlign: 'center', mt: 2 }}>No posts available</Typography>
      )}
    </>
  );
};

export default StraightTab;