import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      console.log('Attempting login...');
      setError('');
      setLoading(true);

      await new Promise<void>((resolve, reject) => {
        Meteor.loginWithPassword(username, password, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      console.log('Login successful');
      navigate('/');
    } catch (error: any) {
      console.error('Login failed:', error.reason || error.message);
      setError(error.reason || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div 
      className="min-h-screen w-screen bg-cover bg-center flex items-center justify-center p-5" 
      style={{ 
        backgroundImage: "url('/images/login.png')",
        fontFamily: '"Comic Sans MS", cursive, sans-serif'
      }}
    >
      <div className="backdrop-blur-md bg-white/5 p-8 text-center w-full max-w-xl border border-white/50 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-xl transition-transform duration-300 hover:scale-105">
        <h1 className="text-black font-bold text-3xl mb-6">
          Login
        </h1>
        
        <div className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 rounded-lg border border-white/30 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:bg-white/20 transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 rounded-lg border border-white/30 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:bg-white/20 transition-all duration-200"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center text-white text-sm cursor-pointer">
              <input 
                type="checkbox" 
                className="mr-2 rounded focus:ring-[#C47B4D] focus:ring-2" 
              />
              Remember me
            </label>
            <a href="#" className="text-sm text-blue-300 hover:text-blue-100 hover:underline transition-colors">
              Forgot password?
            </a>
          </div>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#C47B4D] hover:bg-[#A35F35] focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:ring-offset-2 transform hover:scale-105'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </button>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}
          
          <p className="text-white text-center">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-blue-300 hover:text-blue-100 hover:underline font-semibold transition-colors"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};