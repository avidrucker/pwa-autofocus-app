import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {

  test('renders add item button', () => {
    // Mock console.info method
    console.info = jest.fn();

    render(<App />);
    const addButton = screen.getByText(/Add Item/i);
    expect(addButton).toBeInTheDocument();

    // Verify that console.info was called
    expect(console.info).toHaveBeenCalled();
  });

});
