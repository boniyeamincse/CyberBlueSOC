import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement JWT/OAuth2 login logic with backend API
      console.log('Secure login attempt:', { email, password });
      // For now, simulate authentication and navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      // TODO: Show error message to user
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 dark:bg-slate-900">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-slate-100">CyberBlueSOC Login</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Secure access to SOC platform with JWT/OAuth2 authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                aria-describedby="email-error"
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                aria-describedby="password-error"
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>
            <div className="flex items-center justify-between">
              <a href="#" className="text-sm text-slate-400 hover:text-slate-300">
                Forgot password?
              </a>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Sign In Securely
            </Button>
            <div className="text-center">
              <p className="text-xs text-slate-500">
                Role-based access: Admin, Analyst, Manager
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;