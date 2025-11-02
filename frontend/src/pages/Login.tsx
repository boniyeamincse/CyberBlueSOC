import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setLoading(true);
    // Redirect to Keycloak login
    window.location.href = 'http://localhost:8080/realms/cyberblue/protocol/openid-connect/auth?client_id=cyberblue-frontend&redirect_uri=http://localhost:3000/dashboard&response_type=code&scope=openid';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">CyberBlue SOC</h1>
          <p className="text-slate-400">Security Operations Center Platform</p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
        >
          {loading ? 'Redirecting...' : 'Login with Keycloak'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            Secure access to SOC tools and monitoring
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;