import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface LoginDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignup: () => void;
    onLoginSuccess: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({
    isOpen,
    onClose,
    onSwitchToSignup,
    onLoginSuccess,
}) => {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await signIn(email, password);

            if (error) {
                let errorMessage = 'Login failed. Please try again.';

                if (error.message) {
                    if (error.message.includes('Invalid login credentials')) {
                        errorMessage = 'Invalid email or password. Please check your credentials.';
                    } else if (error.message.includes('Email not confirmed') || error.code === 'EMAIL_NOT_CONFIRMED') {
                        errorMessage = 'Please check your email and click the confirmation link before signing in. If you didn\'t receive the email, check your spam folder.';
                    } else if (error.message.includes('Too many requests')) {
                        errorMessage = 'Too many login attempts. Please try again later.';
                    } else {
                        errorMessage = error.message;
                    }
                }

                toast.error(errorMessage);
                return;
            }

            toast.success('Login successful! Welcome back!');
            onClose();
            onLoginSuccess();

        } catch (error) {
            toast.error('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between pt-6 pl-6 pr-6 pb-0 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Welcome Back
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Sign in to your AeroNote account
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="pl-10 pr-12 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
                        </label>
                        <button
                            type="button"
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Signing In...
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </Button>

                    {/* Switch to Signup */}
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={onSwitchToSignup}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginDialog;
