import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

test('renders login button', () => {
  render(<App />);
  const loginButton = screen.getByRole('button', { name: /ログイン/i });
  expect(loginButton).toBeInTheDocument();
});
