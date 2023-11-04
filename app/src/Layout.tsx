import { PropsWithChildren } from 'react';
import { Box, AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Footer from './Footer';
import Search from './Search';
import GlobalLoadingIndicator from './components/GlobalLoadingIndicator';

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <>
      <AppBar position="static" sx={{ flex: 0 }}>
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Open menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="h1" noWrap sx={{ flexGrow: 1 }}>
            AWS UI
          </Typography>
          <Search />
        </Toolbar>
      </AppBar>
      <GlobalLoadingIndicator />
      <Box sx={{ flex: 1 }}>{children}</Box>
      <Box sx={{ flex: 0 }}>
        <Footer />
      </Box>
    </>
  );
}
