import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Tool {
  id: number;
  name: string;
  description: string;
  status: string;
}

const Dashboard = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user info and tools
    const fetchData = async () => {
      try {
        const [userRes, toolsRes] = await Promise.all([
          axios.get('http://localhost:8000/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8000/tools', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setUser(userRes.data);
        setTools(toolsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleToolAction = async (toolId: number, action: string) => {
    const token = localStorage.getItem('access_token');
    try {
      await axios.post(`http://localhost:8000/actions/${toolId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh tools list
      const response = await axios.get('http://localhost:8000/tools', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTools(response.data);
    } catch (error) {
      console.error(`Failed to ${action} tool:`, error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-white">CyberBlue SOC Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-xl font-semibold mb-6">SOC Tools Management</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div key={tool.id} className="bg-slate-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{tool.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tool.status === 'running' ? 'bg-green-600 text-white' :
                    tool.status === 'stopped' ? 'bg-red-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {tool.status}
                  </span>
                </div>
                <p className="text-slate-400 mb-4">{tool.description}</p>
                <div className="flex space-x-2">
                  {tool.status === 'stopped' && (
                    <button
                      onClick={() => handleToolAction(tool.id, 'start')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm"
                    >
                      Start
                    </button>
                  )}
                  {tool.status === 'running' && (
                    <>
                      <button
                        onClick={() => handleToolAction(tool.id, 'stop')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm"
                      >
                        Stop
                      </button>
                      <button
                        onClick={() => handleToolAction(tool.id, 'restart')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm"
                      >
                        Restart
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;