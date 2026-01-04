import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '../../contexts/TenantContext';

/**
 * Unauthorized Component
 * 
 * Displays unauthorized access message when user tries to access
 * a route they don't have permission for.
 * 
 * Rules:
 * - Shows role-based error message
 * - Provides navigation back to allowed routes
 */
export function Unauthorized() {
  const navigate = useNavigate();
  const { role, isFranchisor } = useTenantContext();

  const handleGoBack = () => {
    if (isFranchisor) {
      navigate('/franchise/kpis');
    } else {
      navigate('/pos/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light py-section-mobile md:py-section-desktop">
      <div className="container max-w-md">
        <div className="bg-base p-8 rounded-2xl shadow-lg border border-borderLight text-center">
          <h2 className="text-red-600 mb-4">Unauthorized Access</h2>
          <p className="text-soft mb-6">
            You don't have permission to access this resource.
          </p>
          {role && (
            <p className="text-soft mb-6">
              Your role: <strong className="text-dark">{role}</strong>
            </p>
          )}
          <button onClick={handleGoBack} className="btn btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
