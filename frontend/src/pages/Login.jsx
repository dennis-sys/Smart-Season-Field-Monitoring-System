import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/30204867/pexels-photo-30204867.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 to-green-800/60"></div>
        </div>
        
        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="max-w-lg text-center">
            <h1 className="text-5xl font-bold mb-6">Smart Season</h1>
            <p className="text-xl mb-8">
              Field Monitoring System
            </p>
            <p className="text-lg text-green-100">
              Track crop progress, manage fields, and optimize your growing season with real-time insights from your field agents.
            </p>
            
            {/* Feature List */}
            <div className="mt-12 space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Real-time field monitoring</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Crop stage tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Agent collaboration tools</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Data-driven insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md w-full">
          {/* Logo/Title for mobile */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800">SmartSeason</h1>
            <p className="text-gray-600 mt-2">Field Monitoring System</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-green-600 hover:text-green-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Demo credentials:</p>
              <p className="mt-1">
                <span className="font-medium">Admin:</span> admin@smartseason.com
              </p>
              <p>
                <span className="font-medium">Agent:</span> agent@smartseason.com
              </p>
              <p className="text-xs text-gray-500 mt-2">Password: admin123 / agent123</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>&copy; 2026 SmartSeason. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}