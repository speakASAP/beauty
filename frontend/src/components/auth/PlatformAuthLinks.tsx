/**
 * Platform Auth Links
 * Login and Register links that point to platform auth (auth-microservice).
 * Uses same-origin routes that render forms calling auth-microservice API.
 */

import { Link } from 'react-router-dom';

export function PlatformAuthLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Link
        to="/platform-login"
        className="px-4 py-2 rounded-button text-base hover:bg-white/20 transition-colors text-white font-medium"
      >
        Login
      </Link>
      <Link
        to="/platform-register"
        className="px-4 py-2 rounded-button bg-white/20 hover:bg-white/30 transition-colors text-white font-medium"
      >
        Register
      </Link>
    </div>
  );
}
