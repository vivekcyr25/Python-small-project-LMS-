import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';

import { getFirebaseAuth, isFirebaseConfigured } from '../../lib/firebase';
import { firebaseLogin } from '../../features/auth/firebaseApi';
import useAuthStore from '../../stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const PhoneOtpLogin: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  // Cleanup reCAPTCHA on unmount to avoid memory leaks / duplicate widgets.
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  const clearRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    } catch {
      // ignore — verifier may already be cleared
    }
    window.recaptchaVerifier = undefined;
    // Also wipe the DOM container — Firebase leaves an iframe behind,
    // which causes "reCAPTCHA has already been rendered in this element"
    // on the next attempt.
    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';
  };

  const setupRecaptcha = () => {
    // Always create a fresh verifier — never reuse across attempts.
    clearRecaptcha();
    window.recaptchaVerifier = new RecaptchaVerifier(
      getFirebaseAuth(),
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => { /* reCAPTCHA solved */ },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
        },
      }
    );
    return window.recaptchaVerifier;
  };

  const handleSendOtp = async () => {
    setError('');
    const trimmed = phoneNumber.trim();
    if (!trimmed) {
      setError('Please enter a phone number.');
      return;
    }
    // Basic format guard — must start with +
    if (!/^\+\d{7,15}$/.test(trimmed)) {
      setError('Enter a valid phone number with country code, e.g. +91XXXXXXXXXX');
      return;
    }

    setLoading(true);
    try {
      if (!isFirebaseConfigured()) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        confirmationRef.current = {
          confirm: async () => ({
            user: { getIdToken: async () => 'mock-phone-token' },
          }),
        } as unknown as ConfirmationResult;
        setStep('otp');
        return;
      }

      const appVerifier = setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(getFirebaseAuth(), trimmed, appVerifier);
      confirmationRef.current = confirmationResult;
      setStep('otp');
    } catch (err: any) {
      // Recreate reCAPTCHA on error so the user can retry.
      clearRecaptcha();
      const code = err?.code || '';
      if (code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Use international format: +91XXXXXXXXXX');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait before trying again.');
      } else {
        setError(err?.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!otp.trim()) {
      setError('Please enter the OTP.');
      return;
    }
    if (!confirmationRef.current) {
      setError('Session expired. Please send OTP again.');
      setStep('phone');
      return;
    }

    setLoading(true);
    try {
      let data;
      if (!isFirebaseConfigured()) {
        const idToken = 'mock-phone-token';
        data = await firebaseLogin(idToken);
      } else {
        const confirmationResult = confirmationRef.current;
        const result = await confirmationResult.confirm(otp.trim());
        const idToken = await result.user.getIdToken(true);
        data = await firebaseLogin(idToken);
      }

      setToken(data.access_token);
      setUser(data.user as any);

      // 4. Redirect by role.
      const role = data.user.role;
      if (role === 'instructor') navigate('/instructor/dashboard', { replace: true });
      else if (role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/student/dashboard', { replace: true });
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check and try again.');
      } else if (code === 'auth/code-expired') {
        setError('OTP has expired. Please send a new one.');
        setStep('phone');
      } else {
        setError(
          err?.message ||
          'Verification failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setError('');
    confirmationRef.current = null;
    clearRecaptcha();
  };

  return (
    <div className="w-full space-y-3">
      {/* Invisible reCAPTCHA mount point */}
      <div id="recaptcha-container" />

      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          <motion.div
            key="phone-step"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                <Phone size={14} className="text-cyan-400" /> Phone Number
              </label>
              <Input
                type="tel"
                placeholder="+91XXXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                disabled={loading}
              />
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendOtp}
              disabled={loading}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 px-4',
                'rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm',
                'hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                <ShieldCheck size={14} className="text-cyan-400" />
                Enter OTP sent to {phoneNumber}
              </label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                disabled={loading}
              />
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleVerifyOtp}
              disabled={loading}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 px-4',
                'rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm',
                'hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}
              {loading ? 'Verifying...' : 'Verify OTP'}
            </motion.button>
            <button
              type="button"
              onClick={handleBack}
              className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Change phone number
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          key={error}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-red-400 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default PhoneOtpLogin;
