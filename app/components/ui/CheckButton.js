import React from 'react';
import { Button, Box } from '@mui/material';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import { checkComboDraws, checkStraightDraws } from "@/app/services/playService";

const CheckButton = ({ tabValue }) => {
  const handlePlayClick = async () => {
    try {
      // Call the appropriate testing function based on active tab
      if (tabValue === 0) {
        // COMBO tab
        await checkComboDraws();
      } else {
        // STRAIGHT tab
        await checkStraightDraws();
      }
    } catch (error) {
      alert("There was an issue starting the play sequence. Please try again.");
    }
  };

  return (
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
        check
      </Button>
    </Box>
  );
};

export default CheckButton;