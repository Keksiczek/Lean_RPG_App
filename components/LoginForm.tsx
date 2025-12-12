import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { gameService } from '../services/gameService'; // Import gameService
import { useLanguage } from '../contexts/LanguageContext';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock handler for demonstration if backend is not running
  const handleMockLogin = async () => {
     setLoading(true);
     // Explicitly use getMockPlayer to avoid API call errors if backend is down
     const mockUser = gameService.getMockPlayer();
     // Simulate small delay
     await new Promise(resolve => setTimeout(resolve, 500));
     login('mock-token', mockUser);
     setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      login(response.token, response.user);
    } catch (err: any) {
      console.error(err);
      setError('Invalid credentials or server unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md flex flex-col md:flex-row">
        
        <div className="w-full p-8 md:p-12">
           <div className="flex items-center space-x-2 mb-8 justify-center">
              <div className="w-10 h-10 bg-red-600 rounded-sm flex items-center justify-center text-white font-bold transform skew-x-[-10deg] text-xl">L</div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">LEAN RPG</span>
           </div>

           <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Login</h2>
           <p className="text-gray-500 text-center mb-8 text-sm">Enter your credentials to access the factory.</p>

           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                 <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="name@magna.com"
                 />
               </div>
             </div>

             <div>
               <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                 <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                 />
               </div>
             </div>

             {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center">
                    {error}
                </div>
             )}

             <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-red-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-red-700 transition-all flex items-center justify-center disabled:opacity-50"
             >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
             </button>
           </form>

           <div className="mt-6 text-center">
             <button onClick={handleMockLogin} className="text-xs text-gray-400 hover:text-gray-600 underline">
               Skip Login (Demo Mock Mode)
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;