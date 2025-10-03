import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { authApi } from 'src/services/api';
import { STORAGE_KEYS } from 'src/constants';

vi.mock('src/services/api', () => ({
  authApi: {
    getCurrentUser: vi.fn(),
    updateProfileImage: vi.fn(),
    updateCoverImage: vi.fn()
  }
}));

function TestComponent() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="user">{auth.user ? auth.user.name : 'null'}</span>
      <span data-testid="token">{auth.token || 'null'}</span>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <button
        onClick={() =>
          auth.login('token-123', {
            id: '1',
            name: 'Test User',
            email: 'test@example.com'
          })
        }
      >
        Login
      </button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should provide authentication functionality', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });
});
