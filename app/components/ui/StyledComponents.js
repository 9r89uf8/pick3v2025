import { styled, alpha } from "@mui/material/styles";
import { Paper, IconButton } from "@mui/material";

export const Item = styled(Paper)(({ theme }) => ({
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

export const ExpandButton = styled(IconButton)(({ theme }) => ({
  color: '#ffffff',
  margin: theme.spacing(1),
  transition: 'transform 0.3s',
  '&:hover': {
    backgroundColor: alpha('#ffffff', 0.1),
  },
}));