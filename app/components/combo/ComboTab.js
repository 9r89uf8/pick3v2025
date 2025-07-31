import React from 'react';
import { Box, Typography, List, Button } from '@mui/material';
import { useStore } from '@/app/store/store';
import { setComboDisplayInfo } from "@/app/services/displayService";
import { checkComboDraws } from "@/app/services/playService";
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import ClearIcon from '@mui/icons-material/Clear';

import ComboPlayInfo from './ComboPlayInfo';
import ComboDrawsList from './ComboDrawsList';
import TestResultsDisplay from './TestResultsDisplay';
import Analysis from '../shared/Analysis';
import FireballAnalysis from '../shared/FireballAnalysis';
import StatsDisplay from '../shared/StatsDisplay';

const ComboTab = () => {
  const posts = useStore((state) => state.posts);
  const display = useStore((state) => state.display);
  const testResults = useStore((state) => state.testResults);
  const checkLoading = useStore((state) => state.checkLoading);
  const clearHistory = useStore((state) => state.clearHistory);

  const handleCheckClick = async () => {
    try {
      await checkComboDraws();
    } catch (error) {
      alert("There was an issue analyzing the draws. Please try again.");
    }
  };

  const handleClearClick = () => {
    clearHistory();
  };

  return (
    <>
      <ComboPlayInfo />
      
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
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
              transform: 'scale(1.05)',
              boxShadow: '0 8px 20px rgba(33,150,243,0.4)',
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)',
            }
          }}
        >
          {checkLoading ? 'Analyzing...' : 'Check Historical Draws'}
        </Button>
        
        {(testResults || display.totalDraws) && (
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
      
      <TestResultsDisplay testResults={testResults} loading={checkLoading} />
      <Analysis />
      <FireballAnalysis />
      {display && (
        <StatsDisplay display={display} getter={setComboDisplayInfo} />
      )}

      {posts.length > 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center">
          <List>
            <ComboDrawsList draws={posts} />
          </List>
        </Box>
      ) : (
        <Typography sx={{ textAlign: 'center', mt: 2 }}>No posts available</Typography>
      )}
    </>
  );
};

export default ComboTab;