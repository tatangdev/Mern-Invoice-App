import { Helmet } from 'react-helmet-async';
import Footer from 'src/components/Footer';
import { format } from 'date-fns';

import { Grid, Container, Box } from '@mui/material';

import ProfileCover from './ProfileCover';
import { useAuth } from 'src/contexts/AuthContext';

function ManagementUserProfile() {
  const { user: authUser } = useAuth();

  const user = {
    name: authUser?.fullName || 'User',
    fullName: authUser?.fullName || 'User',
    email: authUser?.email || '',
    coverImg: authUser?.coverImage || '',
    coverImage: authUser?.coverImage || '',
    avatar: authUser?.profileImage || '',
    profileImage: authUser?.profileImage || '',
    jobtitle: authUser?.email || '',
    joinDate: authUser?.createdAt
      ? format(new Date(authUser.createdAt), 'MMMM yyyy')
      : null
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
