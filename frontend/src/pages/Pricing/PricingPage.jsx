import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400 text-sm">Redirecting to Dashboard (100% Free & Open Access Platform)...</p>
    </div>
  );
};

export default PricingPage;
