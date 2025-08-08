import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Accounts } from 'meteor/accounts-base';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterFormData } from '../types/User';

export const Register = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(''); // Clear errors when user starts typing
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill out all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    Accounts.createUser({
      username,
      email,
      password,
      profile: {
        name: username, 
        preferences: [], 
      }
    }, (err) => {
      setLoading(false);
      if (err) {
        setError(`Registration failed: ${err.reason || err.message}`);
      } else {
        console.log('User registered and logged in!');
        navigate('/');
      }
    });
  };

  return (
    <div 
      className="min-h-screen pt-16 w-screen bg-cover bg-center flex items-center justify-center p-5" 
      style={{ 
        backgroundImage: "url('/images/login.png')",
        fontFamily: '"Comic Sans MS", cursive, sans-serif'
      }}
    >
      <div className="backdrop-blur-md bg-white/5 p-8 text-center w-full max-w-xl border border-white/50 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-xl transition-transform duration-300 hover:scale-105">
        <h1 className="text-black font-bold text-3xl mb-2">
          Welcome to Finding Nibbles!
        </h1>
        <p className="text-gray-700 mb-6 text-lg">Create your account to start discovering amazing food</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 rounded-lg border border-white/30 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:bg-white/20 transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 rounded-lg border border-white/30 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:bg-white/20 transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password (min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 rounded-lg border border-white/30 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:bg-white/20 transition-all duration-200"
              required
              minLength={6}
            />
          </div>
          
          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 rounded-lg border border-white/30 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:bg-white/20 transition-all duration-200"
              required
            />
          </div>
          
          <button
            type="submit"
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
                Creating account...
              </div>
            ) : (
              'Register'
            )}
          </button>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}
          
          <p className="text-white text-center">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-blue-300 hover:text-blue-100 hover:underline font-semibold transition-colors"
            >
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};