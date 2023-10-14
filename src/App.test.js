import { render, screen } from '@testing-library/react';
import App from './App';

test('renders add task button', () => {
  render(<App />);
  const addButton = screen.getByText(/Add/i);
  expect(addButton).toBeInTheDocument();
});