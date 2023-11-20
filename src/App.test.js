import { render, screen } from '@testing-library/react';
import App from './App';

test('renders add task button', () => {
  // Mock console.info method
  console.info = jest.fn();

  render(<App />);
  const addButton = screen.getByText(/Add Task/i);
  expect(addButton).toBeInTheDocument();

  // Verify that console.info was called
  expect(console.info).toHaveBeenCalled();
});
