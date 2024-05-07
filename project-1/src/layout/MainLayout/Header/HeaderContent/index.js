import { IconButton, Tooltip, Box, Typography } from '@mui/material';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const HeaderContent = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('companyId');
    localStorage.removeItem('userId');
    localStorage.removeItem('logged');
    navigate('/');

    window.location.reload();
  };

  return (
    <Tooltip title="Logout">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton disableRipple color="secondary" onClick={handleLogout} sx={{ color: 'text.primary', bgcolor: 'grey.100' }}>
          <LogoutOutlined />
        </IconButton>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 'bold',
            color: '#212121',
            marginLeft: 1
          }}
        >
          LOGOUT
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default HeaderContent;
