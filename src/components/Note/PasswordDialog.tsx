import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface PasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onPasswordSubmit: (password: string) => boolean;
    noteTitle: string;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({
    isOpen,
    onClose,
    onPasswordSubmit,
    noteTitle,
}) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.trim()) {
            const isCorrect = onPasswordSubmit(password);
            if (isCorrect) {
                setPassword('');
                setError('');
            } else {
                setError('Incorrect password. Please try again.');
                setPassword('');
            }
        } else {
            setError('Please enter a password');
        }
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        setShowPassword(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
                        <Lock className="w-5 h-5 text-amber-600" />
                        Password Required
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            This note is password protected
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            "{noteTitle}"
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Enter Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError('');
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                    placeholder="Enter your password..."
                                    className={`pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-primary-500 focus:ring-primary-500'}`}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {error && (
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 text-white"
                                style={{ backgroundColor: 'rgb(2 132 199)' }}
                            >
                                Unlock Note
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PasswordDialog;
