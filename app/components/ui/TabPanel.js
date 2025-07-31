import React from 'react';
import { Box } from '@mui/material';

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

export default TabPanel;