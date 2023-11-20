'use client'
import { useEffect, useState } from 'react';
import API_EDPOINTS from '../../../api';
import { useRouter } from 'next/navigation';

interface FormErrors {
  email?: string;
  password?: string;
}

const ISSERVER = typeof window === "undefined";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSignup, setIsSignup] = useState(false);
  const router = useRouter();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors({});
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors({});
  };

  useEffect(() => {
    if (!ISSERVER) {
      const token = localStorage.getItem('token');
      if (token && token !== 'null') {
        router.push('/');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch(isSignup ? API_EDPOINTS.signup : API_EDPOINTS.login, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
          })
        });
        if (!response.ok) {
          setErrors({ email: 'Something went wrong!', password: 'Something went wrong!' });
        }
        const data = await response.json();
        if (data.error) {
          setErrors({ email: data.msg, password: data.msg });
          console.log(data);
          return;
        }
        if (!ISSERVER) {
          localStorage.setItem('token', data.data.token);
        }
        router.push('/');
        console.log(data);
      }
      catch (error) {
        console.error(error);
        setErrors({ email: 'Something went wrong!', password: 'Something went wrong!' });
      }
    }
  };

  const toggleView = () => {
    setIsSignup(!isSignup);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full p-6 bg-gray-800 shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-4">{isSignup ? 'Sign Up' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-400 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-700 text-white`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-400 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-700 text-white`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300`}
          >
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div className="mt-4 flex items-center justify-center">
          <button
            onClick={toggleView}
            className="text-sm text-gray-400 hover:underline focus:outline-none"
          >
            {isSignup ? 'Switch to Login' : 'Not have account yet? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}
