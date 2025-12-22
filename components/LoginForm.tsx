import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { gameService } from '../services/gameService';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../hooks/useToast';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { success, error: toastError } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMockLogin = async () => {
     setLoading(true);
     const mockUser = gameService.getMockPlayer();
     await new Promise(resolve => setTimeout(resolve, 500));
     login('mock-token', mockUser);
     success('Welcome CI Specialist', 'You are logged in via Demo Mode');
     setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      login(response.token, response.user);
      success('Login Successful', `Welcome back, ${response.user.username}`);
    } catch (err: any) {
      console.error(err);
      const msg = 'Invalid credentials or server unavailable.';
      setError(msg);
      toastError('Authentication Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md flex flex-col md:flex-row border dark:border-slate-800 transition-colors duration-200">
        
        <div className="w-full p-8 md:p-12">
           <div className="flex items-center space-x-2 mb-8 justify-center">
              <div className="w-10 h-10 bg-red-600 rounded-sm flex items-center justify-center text-white font-bold transform skew-x-[-10deg] text-xl shadow-lg">L</div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">LEAN RPG</span>
           </div>

           <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-2 text-center">Login</h2>
           <p className="text-gray-500 dark:text-slate-400 text-center mb-8 text-sm">Enter your credentials to access the factory.</p>

           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">Email Address</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-3 text-gray-400 dark:text-slate-500 w-5 h-5" />
                 <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="name@magna.com"
                 />
               </div>
             </div>

             <div>
               <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">Password</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-3 text-gray-400 dark:text-slate-500 w-5 h-5" />
                 <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                 />
               </div>
             </div>

             {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-100 dark:border-red-900/30 flex items-center">
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
             <button onClick={handleMockLogin} className="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 underline font-medium">
               Skip Login (Demo Mock Mode)
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;