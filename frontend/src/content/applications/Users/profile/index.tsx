import { Helmet } from 'react-helmet-async';
import Footer from 'src/components/Footer';

import { Grid, Container, Box } from '@mui/material';

import ProfileCover from './ProfileCover';
import { useAuth } from 'src/contexts/AuthContext';

function ManagementUserProfile() {
  const { user: authUser } = useAuth();

  const user = {
    savedCards: 7,
    name: authUser?.fullName || 'User',
    coverImg: '/static/images/placeholders/covers/5.jpg',
    avatar: '/static/images/avatars/4.jpg',
    description: 'Welcome to your profile page',
    jobtitle: authUser?.email || '',
    location: '',
    followers: '0'
  };

  return (
    <>
      <Helmet>
        <title>User Details - Management</title>
      </Helmet>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Container sx={{ mt: 3, mb: 3, flex: 1 }} maxWidth="lg">
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={3}
          >
            <Grid item xs={12}>
              <ProfileCover user={user} />
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </Box>
    </>
  );
}

export default ManagementUserProfile;
