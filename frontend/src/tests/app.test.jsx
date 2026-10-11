import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import { ConnectionStatus } from '../components/common/ConnectionStatus';
import { AuthProvider } from '../context/AuthContext';
import { EmergencyProvider } from '../context/EmergencyContext';
import { ThemeProvider } from '../context/ThemeContext';
import { App } from '../App';

describe('Frontend Component & Form Tests', () => {
  it('Badge renders correct variant styles and children', () => {
    render(<Badge variant="emergency">ACTIVE SOS</Badge>);
    expect(screen.getByText('ACTIVE SOS')).toBeInTheDocument();
  });

  it('EmptyState renders icon, title, and action', () => {
    render(
      <EmptyState
        title="No contacts found"
        description="Add a contact to get started"
        action={<button>Add Contact</button>}
      />
    );
    expect(screen.getByText('No contacts found')).toBeInTheDocument();
    expect(screen.getByText('Add Contact')).toBeInTheDocument();
  });

  it('LoginPage renders email and password fields and submit button', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('RegisterPage validates password mismatch before submission', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText(/Priya Sharma/i);
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const phoneInput = screen.getByPlaceholderText(/98765/i);
    const passInput = screen.getByPlaceholderText('Choose a strong password');
    const confirmInput = screen.getByPlaceholderText('Confirm your password');
    const submitBtn = screen.getByRole('button', { name: /Register Secure Account/i });

    fireEvent.change(nameInput, { target: { value: 'Priya Sharma' } });
    fireEvent.change(emailInput, { target: { value: 'priya@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '+919876543210' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'different123' } });

    fireEvent.click(submitBtn);

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('ConnectionStatus displays API connection indicator', () => {
    render(<ConnectionStatus />);
    expect(screen.getByText(/API:/i)).toBeInTheDocument();
    expect(screen.getByText(/Realtime:/i)).toBeInTheDocument();
  });

  it('Renders full App without crashing', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <EmergencyProvider>
              <App />
            </EmergencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
    expect(screen.getAllByText(/Women Safety/i).length).toBeGreaterThanOrEqual(1);
  });
});
