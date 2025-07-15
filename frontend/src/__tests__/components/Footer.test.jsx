import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';

const FooterWithRouter = () => (
  <BrowserRouter>
    <Footer />
  </BrowserRouter>
);

describe('Footer Component', () => {
  test('renders footer with copyright', () => {
    render(<FooterWithRouter />);
    expect(screen.getByText(/Copyright/i)).toBeInTheDocument();
  });

  test('renders brand name', () => {
    render(<FooterWithRouter />);
    expect(screen.getByText(/MarieCare/i)).toBeInTheDocument();
  });

  test('renders developer information', () => {
    render(<FooterWithRouter />);
    expect(screen.getByText(/developed by Osman Jah/i)).toBeInTheDocument();
  });

  test('renders social media links', () => {
    render(<FooterWithRouter />);
    // Check for social media icons or links
    const socialLinks = screen.getAllByRole('link');
    expect(socialLinks.length).toBeGreaterThan(0);
  });

  test('has proper link attributes', () => {
    render(<FooterWithRouter />);
    const links = screen.getAllByRole('link');
    
    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
