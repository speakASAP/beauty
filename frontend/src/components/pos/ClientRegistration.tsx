import { useState } from 'react';
import { useRegisterClient } from '../../hooks/useClients';
import { useNavigate } from 'react-router-dom';
import { ErrorAlert } from '../common/ErrorAlert';

/**
 * Client Registration Component
 * 
 * Registers a new client.
 * 
 * Rules:
 * - Only sends command (no business logic)
 * - GDPR consent required
 * - Tenant context implicit
 */
export function ClientRegistration() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [error, setError] = useState('');

  const registerClient = useRegisterClient();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gdprConsent) {
      setError('GDPR consent is required');
      return;
    }

    try {
      await registerClient.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
        email: email || undefined,
        gdpr_consent: gdprConsent,
      });

      // Navigate back or show success
      navigate(-1);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to register client');
    }
  };

  return (
    <div className="bg-base p-6 rounded-2xl shadow-lg border border-borderLight max-w-2xl mx-auto">
      <h2 className="mb-4">Register New Client</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block mb-2 font-semibold text-dark">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block mb-2 font-semibold text-dark">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block mb-2 font-semibold text-dark">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 font-semibold text-dark">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
            />
          </div>
        </div>

        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              required
              className="mt-1 w-5 h-5 border-2 border-borderLight rounded focus:ring-2 focus:ring-accent"
            />
            <span className="text-dark">I consent to the processing of personal data (GDPR)</span>
          </label>
        </div>

        {error && <ErrorAlert message={error} />}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={registerClient.isPending}
            className="btn btn-primary"
          >
            {registerClient.isPending ? 'Registering...' : 'Register Client'}
          </button>
        </div>
      </form>
    </div>
  );
}

