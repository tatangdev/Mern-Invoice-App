import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router';

import SidebarLayout from 'src/layouts/SidebarLayout';
import BaseLayout from 'src/layouts/BaseLayout';

import SuspenseLoader from 'src/components/SuspenseLoader';
import ProtectedRoute from 'src/components/ProtectedRoute';
import DashboardRedirect from 'src/content/applications/Dashboard';

const Loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

const Login = Loader(lazy(() => import('src/content/pages/Auth/Login')));
const Register = Loader(lazy(() => import('src/content/pages/Auth/Register')));

const Dashboard = Loader(
  lazy(() => import('src/content/applications/Dashboard'))
);

const Products = Loader(
  lazy(() => import('src/content/applications/Products'))
);
const ProductDetail = Loader(
  lazy(() => import('src/content/applications/Products/ProductDetail'))
);
const Invoices = Loader(
  lazy(() => import('src/content/applications/Invoices'))
);
const UserProfile = Loader(
  lazy(() => import('src/content/applications/Users'))
);

const Status404 = Loader(
  lazy(() => import('src/content/pages/Status/Status404'))
);
const Status500 = Loader(
  lazy(() => import('src/content/pages/Status/Status500'))
);

const routes: RouteObject[] = [
  {
    path: 'login',
    element: <Login />
  },
  {
    path: 'register',
    element: <Register />
  },
  {
    path: '',
    element: <BaseLayout />,
    children: [
      {
        path: '/',
        element: <DashboardRedirect />
      },
      {
        path: 'status',
        children: [
          {
            path: '',
            element: <Navigate to="404" replace />
          },
          {
            path: '404',
            element: <Status404 />
          },
          {
            path: '500',
            element: <Status500 />
          }
        ]
      },
      {
        path: '*',
        element: <Status404 />
      }
    ]
  },
  {
    path: 'dashboard',
    element: (
      <ProtectedRoute>
        <SidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Dashboard />
      }
    ]
  },
  {
    path: 'management',
    element: (
      <ProtectedRoute>
        <SidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="invoices" replace />
      },
      {
        path: 'products',
        element: <Products />
      },
      {
        path: 'products/:id',
        element: <ProductDetail />
      },
      {
        path: 'invoices',
        element: <Invoices />
      },
      {
        path: 'profile',
        element: <UserProfile />
      }
    ]
  }
];

export default routes;
