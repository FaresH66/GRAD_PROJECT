import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios'; // Import AxiosError
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

interface LoginResponse {
  status: 'success' | 'error';
  role?: string;
  user_id?: number;
  message?: string;
}

// Type for Axios error response (optional, if the backend returns a specific error structure)
interface LoginErrorResponse {
  message?: string;
}

const getBackendUrl = () => {
  return process.env.NODE_ENV === 'development' ? '/login' : 'https://your-backend-domain.com/login'; // Replace with deployed backend URL
};

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const backendUrl = getBackendUrl();
    try {
      const res = await axios.post<LoginResponse>(backendUrl, { email, password }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.data.status === 'success' && res.data.role && res.data.user_id) {
        sessionStorage.setItem('user_id', res.data.user_id.toString());
        sessionStorage.setItem('role', res.data.role);
        await new Promise((resolve) => setTimeout(resolve, 500));
        navigate(`/${res.data.role}`);
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err) {
      // Type the error as AxiosError with an optional response data of type LoginErrorResponse
      const axiosError = err as AxiosError<LoginErrorResponse>;
      if (axiosError.response && axiosError.response.data) {
        setError(axiosError.response.data.message || 'Invalid credentials or server error');
      } else {
        setError('Network error or server unreachable');
      }
      console.error('Login error:', axiosError.response?.data || axiosError.message);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.4 } },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <motion.div
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative z-10"
      >
        <Card className="w-[400px] shadow-2xl border border-gray-700 bg-gray-950/90 backdrop-blur-md">
          <CardHeader className="text-center">
            <h2 className="text-3xl font-bold text-white tracking-tight">Gatekeeper Login</h2>
            <p className="text-gray-400 mt-2">Secure access to your community</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="text-red-500 text-center animate-pulse">{error}</div>
              )}
              <motion.div variants={inputVariants} initial="hidden" animate="visible">
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>
              <motion.div variants={inputVariants} initial="hidden" animate="visible">
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>
              <motion.div variants={inputVariants} initial="hidden" animate="visible" className="mt-4">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Sign In
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className="text-center text-gray-400 text-sm">
            <p>© 2025 Gatekeeper. All rights reserved.</p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;