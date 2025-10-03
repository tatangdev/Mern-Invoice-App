import { Helmet } from 'react-helmet-async';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Box
} from '@mui/material';
import { useAuth } from 'src/contexts/AuthContext';
import Footer from 'src/components/Footer';
import { Navigate } from 'react-router-dom';
import SuspenseLoader from '../../../components/SuspenseLoader';

function DashboardRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <SuspenseLoader />;
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h3" gutterBottom>
                Welcome back, {user?.fullName}!
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                Here's what's happening with your business today.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h4">0</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Invoices
                  </Typography>
                  <Typography variant="h4">0</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </Box>
    </>
  );
}

export default Dashboard;
