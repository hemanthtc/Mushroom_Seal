import React, { useState } from 'react';
import { Lock, KeyRound, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { sellerResetPassword } from '../../services/api';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onSuccess: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  token,
  addToast,
  onSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sellerResetPassword(token, newPassword);
      if (res.success) {
        setIsSuccess(true);
        addToast('success', 'Your password has been reset successfully.');
        setTimeout(() => {
          onClose();
          onSuccess(); // Open the login modal
        }, 2000);
      } else {
        setErrorMsg(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password. The link may be expired or invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm">
      <div className="bg-emerald-950 border border-emerald-500/20 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-emerald-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Reset Seller Password</h2>
          <p className="text-emerald-400 text-xs mt-1">
            Please enter and confirm your new password below.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/50 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-2xl flex items-start gap-2.5 mb-5 text-xs">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSuccess && (
          <div className="bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl flex items-start gap-2.5 mb-5 text-xs">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
            <span>Password updated successfully! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-emerald-300 font-bold mb-1.5 text-xs">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={isLoading || isSuccess}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-emerald-900/40 border border-emerald-500/30 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder-emerald-700/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-emerald-300 font-bold mb-1.5 text-xs">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={isLoading || isSuccess}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-emerald-900/40 border border-emerald-500/30 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder-emerald-700/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className={`w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-sm shadow-lg transition-all ${
              (isLoading || isSuccess) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
