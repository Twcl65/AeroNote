import React, { useState } from 'react';
import {
    CheckCircle,
    Shield,
    Zap,
    Smartphone,
    Cloud,
    Search,
    PenTool,
    Lock,
    Users,
    Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import LoginDialog from './LoginDialog';
import SignupDialog from './SignupDialog';

interface LandingPageProps {
    onLoginSuccess: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);

    const features = [
        {
            icon: <PenTool className="w-8 h-8 text-blue-600" />,
            title: "Rich Text Editor",
            description: "Create beautiful notes with formatting, lists, and code blocks"
        },
        {
            icon: <Shield className="w-8 h-8 text-green-600" />,
            title: "Password Protection",
            description: "Keep sensitive notes secure with password protection"
        },
        {
            icon: <Search className="w-8 h-8 text-purple-600" />,
            title: "Smart Search",
            description: "Find notes instantly with powerful search and filtering"
        },
        {
            icon: <Cloud className="w-8 h-8 text-orange-600" />,
            title: "Cloud Sync",
            description: "Access your notes from anywhere, anytime"
        },
        {
            icon: <Smartphone className="w-8 h-8 text-pink-600" />,
            title: "Mobile Optimized",
            description: "Fully responsive design that works on all devices"
        },
        {
            icon: <Zap className="w-8 h-8 text-yellow-600" />,
            title: "Lightning Fast",
            description: "Built for speed with offline-first architecture"
        }
    ];

    const stats = [
        { number: "10K+", label: "Active Users" },
        { number: "1M+", label: "Notes Created" },
        { number: "99.9%", label: "Uptime" },
        { number: "24/7", label: "Support" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">AeroNote</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => setIsLoginOpen(true)}
                                variant="outline"
                                className="hidden sm:flex"
                            >
                                Sign In
                            </Button>
                            <Button
                                onClick={() => setIsSignupOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                        Your Notes,{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Elevated
                        </span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        AeroNote is the modern, secure, and lightning-fast note-taking app that helps you capture ideas, organize thoughts, and stay productive across all your devices.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => setIsSignupOpen(true)}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3"
                        >
                            Start Writing for Free
                        </Button>
                        <Button
                            onClick={() => setIsLoginOpen(true)}
                            variant="outline"
                            size="lg"
                            className="text-lg px-8 py-3"
                        >
                            Sign In
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Take Better Notes
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Powerful features designed to make note-taking effortless, organized, and secure.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                                <div className="mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Note-Taking?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of users who have already discovered the power of AeroNote.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => setIsSignupOpen(true)}
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
                        >
                            Create Your Account
                        </Button>
                        <Button
                            onClick={() => setIsLoginOpen(true)}
                            variant="outline"
                            size="lg"
                            className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
                        >
                            Sign In
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold">AeroNote</h3>
                            </div>
                            <p className="text-gray-400">
                                The modern note-taking app that helps you stay organized and productive.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>Features</li>
                                <li>Pricing</li>
                                <li>Security</li>
                                <li>API</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>About</li>
                                <li>Blog</li>
                                <li>Careers</li>
                                <li>Contact</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>Help Center</li>
                                <li>Documentation</li>
                                <li>Community</li>
                                <li>Status</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 AeroNote. All rights reserved. Built with ❤️ by <a href="https://github.com/Twcl65" className="text-blue-500 hover:text-blue-600">Twcl65</a></p>
                    </div>
                </div>
            </footer>

            {/* Auth Dialogs */}
            <LoginDialog
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onSwitchToSignup={() => {
                    setIsLoginOpen(false);
                    setIsSignupOpen(true);
                }}
                onLoginSuccess={onLoginSuccess}
            />
            <SignupDialog
                isOpen={isSignupOpen}
                onClose={() => setIsSignupOpen(false)}
                onSwitchToLogin={() => {
                    setIsSignupOpen(false);
                    setIsLoginOpen(true);
                }}
                onLoginSuccess={onLoginSuccess}
            />
        </div>
    );
};

export default LandingPage;
