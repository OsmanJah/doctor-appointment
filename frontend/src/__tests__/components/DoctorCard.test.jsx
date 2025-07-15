import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DoctorCard from '../../components/Doctors/DoctorCard';

const mockDoctor = {
  _id: '1',
  name: 'Dr. John Smith',
  specialization: 'Cardiology',
  photo: '/images/doctor1.jpg',
};

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DoctorCard Component', () => {
  test('renders doctor information correctly', () => {
    renderWithRouter(<DoctorCard doctor={mockDoctor} />);
    
    expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
  });

  test('shows doctor image with alt text', () => {
    renderWithRouter(<DoctorCard doctor={mockDoctor} />);
    
    const image = screen.getByAltText('Dr. John Smith');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/doctor1.jpg');
  });

  test('has clickable link to doctor profile', () => {
    renderWithRouter(<DoctorCard doctor={mockDoctor} />);
    
    const profileLink = screen.getByRole('link');
    expect(profileLink).toHaveAttribute('href', '/doctors/1');
  });

  test('displays default specialization when not provided', () => {
    const doctorWithoutSpecialization = { ...mockDoctor, specialization: null };
    renderWithRouter(<DoctorCard doctor={doctorWithoutSpecialization} />);
    
    expect(screen.getByText('Specialist')).toBeInTheDocument();
  });

  test('renders with proper styling classes', () => {
    renderWithRouter(<DoctorCard doctor={mockDoctor} />);
    
    const cardContainer = screen.getByText('Dr. John Smith').closest('div').parentElement;
    expect(cardContainer).toHaveClass('p-3', 'lg:p-5', 'border', 'border-gray-200', 'rounded-lg');
  });

  test('has proper hover effects on link', () => {
    renderWithRouter(<DoctorCard doctor={mockDoctor} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveClass('group', 'hover:bg-buttonBgColor', 'hover:border-none');
  });

  test('handles missing photo gracefully', () => {
    const doctorWithoutPhoto = { ...mockDoctor, photo: null };
    renderWithRouter(<DoctorCard doctor={doctorWithoutPhoto} />);
    
    const image = screen.getByAltText('Dr. John Smith');
    expect(image).toBeInTheDocument();
    expect(image).not.toHaveAttribute('src');
  });
});
