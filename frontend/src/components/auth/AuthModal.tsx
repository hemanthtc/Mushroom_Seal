import React, { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { 
  User, 
  Store, 
  Phone, 
  Mail, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  EyeOff,
  Bike,
  Truck
} from 'lucide-react';
import type { UserProfile, SellerProfile, DeliveryAgent } from '../../types';
import {
  sellerLogin as apiSellerLogin,
  sellerRegister as apiSellerRegister,
  customerSendOtp as apiSendOtp,
  customerVerifyOtp as apiVerifyOtp,
  customerPasswordLogin as apiCustomerPasswordLogin,
  customerResetPassword as apiCustomerResetPassword,
  riderLogin as apiRiderLogin,
  setAuth,
  sellerForgotPassword,
  updateCustomerProfile,
} from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  initialRole?: 'customer' | 'seller' | 'delivery';
  onCustomerLoginSuccess: (profile: UserProfile) => void;
  onSellerLoginSuccess: (profile: SellerProfile) => void;
  onCustomerRegisterSuccess: (profile: UserProfile) => void;
  onSellerRegisterSuccess: (message: string) => void;
  onDeliveryLoginSuccess: (agent: DeliveryAgent) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  initialRole = 'customer',
  onCustomerLoginSuccess,
  onSellerLoginSuccess,
  onCustomerRegisterSuccess,
  onSellerRegisterSuccess,
  onDeliveryLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [roleTab, setRoleTab] = useState<'customer' | 'seller' | 'delivery'>(initialRole);

  // Delivery partner login states
  const [deliveryId, setDeliveryId] = useState('');
  const [deliveryPassword, setDeliveryPassword] = useState('');
  const [showDeliveryPassword, setShowDeliveryPassword] = useState(false);

  // Customer Login States
  const [custLoginMethod, setCustLoginMethod] = useState<'otp' | 'password'>('otp');
  const [custPhone, setCustPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [custOtp, setCustOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  // Customer Password Login States
  const [custPwdPhone, setCustPwdPhone] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [showCustPassword, setShowCustPassword] = useState(false);
  // Customer Forgot Password States
  const [isCustForgotPassword, setIsCustForgotPassword] = useState(false);
  const [custForgotPhone, setCustForgotPhone] = useState('');
  const [custForgotOtpSent, setCustForgotOtpSent] = useState(false);
  const [custForgotOtp, setCustForgotOtp] = useState('');
  const [custForgotSimulatedOtp, setCustForgotSimulatedOtp] = useState('');
  const [custForgotNewPassword, setCustForgotNewPassword] = useState('');
  const [showCustForgotNewPassword, setShowCustForgotNewPassword] = useState(false);
  const [custForgotSuccess, setCustForgotSuccess] = useState(false);
  const [isCustForgotLoading, setIsCustForgotLoading] = useState(false);

  // Seller Login States
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerPassword, setSellerPassword] = useState('');
  const [showSellerPassword, setShowSellerPassword] = useState(false);
  const [showRegSellerPassword, setShowRegSellerPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Customer Registration States
  const [regCustName, setRegCustName] = useState('');
  const [regCustPhone, setRegCustPhone] = useState('+91 ');
  const [regCustEmail, setRegCustEmail] = useState('');
  const [regCustStreet, setRegCustStreet] = useState('');
  const [regCustCity, setRegCustCity] = useState('Bengaluru');
  const [regCustPincode, setRegCustPincode] = useState('560034');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regSimulatedOtp] = useState('');
  const [regOtpVal, setRegOtpVal] = useState('');
  const [regCustPassword, setRegCustPassword] = useState('');
  const [showRegCustPassword, setShowRegCustPassword] = useState(false);

  // Seller Registration States
  const [regSellerFarm, setRegSellerFarm] = useState('');
  const [regSellerOwner, setRegSellerOwner] = useState('');
  const [regSellerEmail, setRegSellerEmail] = useState('');
  const [regSellerPassword, setRegSellerPassword] = useState('');
  const [regSellerPhone, setRegSellerPhone] = useState('+91 ');
  const [regSellerGstin, setRegSellerGstin] = useState('');
  const [regSellerCert, setRegSellerCert] = useState('IND-ORG-2026-');

  // Error & Status message
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // --- HANDLERS ---

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!custPhone || custPhone.replace(/\D/g, '').length < 8) {
      setErrorMsg('Please enter a valid phone number (e.g. +91 98450 12345)');
      return;
    }
    try {
      const { otp } = await apiSendOtp(custPhone);
      setSimulatedOtp(otp);
      setCustOtp(otp);
      setOtpSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send OTP.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const { token, customer } = await apiVerifyOtp(custPhone, custOtp, regCustName || undefined);
      setAuth(token, 'customer');
      onCustomerLoginSuccess(customer);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP code. Please check your SMS code.');
    }
  };

  const handleCustomerPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!custPwdPhone || !custPassword) {
      setErrorMsg('Please enter both phone number and password.');
      return;
    }
    try {
      const { token, customer } = await apiCustomerPasswordLogin(custPwdPhone, custPassword);
      setAuth(token, 'customer');
      onCustomerLoginSuccess(customer);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid phone number or password.');
    }
  };

  const handleCustForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!custForgotPhone || custForgotPhone.replace(/\D/g, '').length < 8) {
      setErrorMsg('Please enter a valid phone number (e.g. +91 98450 12345)');
      return;
    }
    setIsCustForgotLoading(true);
    try {
      const { otp } = await apiSendOtp(custForgotPhone);
      setCustForgotSimulatedOtp(otp || '');
      setCustForgotOtp(otp || '');
      setCustForgotOtpSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send OTP.');
    } finally {
      setIsCustForgotLoading(false);
    }
  };

  const handleCustForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!custForgotOtp) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    if (!custForgotNewPassword || custForgotNewPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    setIsCustForgotLoading(true);
    try {
      const res = await apiCustomerResetPassword(custForgotPhone, custForgotOtp, custForgotNewPassword);
      if (res.success) {
        setCustForgotSuccess(true);
      } else {
        setErrorMsg(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setIsCustForgotLoading(false);
    }
  };

  const handleSellerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!sellerEmail || !sellerPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    try {
      const { token, seller } = await apiSellerLogin(sellerEmail, sellerPassword);
      setAuth(token, 'seller');
      onSellerLoginSuccess(seller);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    }
  };

  const handleDeliveryLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!deliveryId || !deliveryPassword) {
      setErrorMsg('Please enter your Delivery Partner ID and password.');
      return;
    }
    try {
      const { token, rider } = await apiRiderLogin(deliveryId, deliveryPassword);
      setAuth(token, 'rider');
      onDeliveryLoginSuccess(rider);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid Rider ID or password.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!forgotEmail) {
      setErrorMsg('Please enter your registered seller email address.');
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await sellerForgotPassword(forgotEmail);
      if (res.success) {
        setForgotSuccess(true);
      } else {
        setErrorMsg(res.message || 'Failed to send recovery link.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send recovery link.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regCustName || !regCustPhone) {
      setErrorMsg('Please complete all required fields (Name, Phone).');
      return;
    }
    try {
      // Direct registration using the mock OTP verification code
      const { token, customer } = await apiVerifyOtp(
        regCustPhone,
        "123456",
        regCustName,
        regCustEmail || undefined,
        regCustPassword || undefined
      );
      setAuth(token, 'customer');

      // Attempt to update backend customer profile with registration address
      const registeredAddress = {
        fullName: regCustName,
        phone: regCustPhone,
        streetAddress: regCustStreet,
        city: regCustCity,
        pincode: regCustPincode,
        estimatedDistanceKm: 5,
      };

      let finalCustomer = customer;
      try {
        finalCustomer = await updateCustomerProfile({
          name: regCustName,
          email: regCustEmail,
          savedAddresses: [registeredAddress],
          defaultAddressIndex: 0
        });
      } catch {
        // Fallback for Express backend where profile update endpoint does not exist
      }

      onCustomerRegisterSuccess(finalCustomer);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    }
  };

  const handleCustomerRegisterVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regOtpVal) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    try {
      const { token, customer } = await apiVerifyOtp(regCustPhone, regOtpVal, regCustName, regCustEmail || undefined, regCustPassword || undefined);
      setAuth(token, 'customer');

      // Attempt to update backend customer profile with registration address
      const registeredAddress = {
        fullName: regCustName,
        phone: regCustPhone,
        streetAddress: regCustStreet,
        city: regCustCity,
        pincode: regCustPincode,
        estimatedDistanceKm: 5,
      };

      let finalCustomer = customer;
      try {
        finalCustomer = await updateCustomerProfile({
          name: regCustName,
          email: regCustEmail,
          savedAddresses: [registeredAddress],
          defaultAddressIndex: 0
        });
      } catch {
        // Fallback for Express backend where profile update endpoint does not exist
      }

      onCustomerRegisterSuccess(finalCustomer);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP code. Registration failed.');
    }
  };

  const handleSellerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regSellerFarm || !regSellerOwner || !regSellerEmail || !regSellerPassword) {
      setErrorMsg('Please complete all mandatory vendor fields (Farm Name, Owner, Email, Password).');
      return;
    }
    try {
      const { token, seller } = await apiSellerRegister({
        farmName: regSellerFarm,
        ownerName: regSellerOwner,
        email: regSellerEmail,
        password: regSellerPassword,
        phone: regSellerPhone,
        gstin: regSellerGstin,
        organicCertNo: regSellerCert,
      });
      setAuth(token, 'seller');
      onSellerRegisterSuccess(`Welcome, ${seller.farmName}! Your seller account is live.`);
      onSellerLoginSuccess(seller);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Vendor registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-emerald-950 border border-emerald-700/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-emerald-100 flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-2xl border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">Shroom & Veggies Portal</h2>
              <p className="text-xs text-emerald-300">Choose your access mode to continue</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRIMARY MODE TABS (Login vs Register) */}
        <div className="bg-emerald-900/60 p-2 border-b border-emerald-800/80 flex gap-2">
          <button
            onClick={() => {
              setActiveTab('login');
              setIsForgotPassword(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl font-extrabold text-xs transition-all ${
              activeTab === 'login'
                ? 'bg-amber-500 text-emerald-950 shadow-md'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            Sign In / Login
          </button>

          <button
            onClick={() => {
              setActiveTab('register');
              setIsForgotPassword(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl font-extrabold text-xs transition-all ${
              activeTab === 'register'
                ? 'bg-amber-500 text-emerald-950 shadow-md'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* SECONDARY ROLE TABS (Customer vs Seller) */}
        {!isForgotPassword && (
          <div className="bg-emerald-950/90 px-6 pt-4 flex gap-3 text-xs">
            <button
              onClick={() => {
                setRoleTab('customer');
                setErrorMsg('');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold border transition-all ${
                roleTab === 'customer'
                  ? 'bg-emerald-800 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-emerald-900/30 border-emerald-800 text-emerald-300 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>

            <button
              onClick={() => {
                setRoleTab('seller');
                setErrorMsg('');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold border transition-all ${
                roleTab === 'seller'
                  ? 'bg-emerald-800 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-emerald-900/30 border-emerald-800 text-emerald-300 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Seller / Vendor</span>
            </button>

            <button
              onClick={() => {
                setRoleTab('delivery');
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold border transition-all ${
                roleTab === 'delivery'
                  ? 'bg-emerald-800 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-emerald-900/30 border-emerald-800 text-emerald-300 hover:text-white'
              }`}
              data-testid="auth-role-delivery"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Delivery</span>
            </button>
          </div>
        )}

        {/* BODY CONTENT */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {errorMsg && (
            <div className="bg-red-950/80 border border-red-800/80 text-red-200 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <X className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* FORGOT PASSWORD SUB-VIEW FOR SELLER */}
          {isForgotPassword ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800 space-y-2">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" /> Seller Password Recovery
                </h3>
                <p className="text-emerald-300 text-xs">
                  Enter your registered business email address. We will send you a password reset verification link.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="bg-emerald-900/80 border border-emerald-600 p-4 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="font-bold text-white text-xs">Password Reset Link Sent!</p>
                  <p className="text-[11px] text-emerald-200">
                    Check your inbox at <strong className="text-amber-300">{forgotEmail}</strong> to update your seller password.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-emerald-300 font-bold mb-1">Business Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                      <input
                        type="email"
                        required
                        placeholder="seller@shroomvalley.org"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="text-emerald-400 hover:text-white font-bold underline"
                    >
                      ← Back to Seller Login
                    </button>

                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className={`bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl shadow-lg ${isForgotLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isForgotLoading ? 'Sending...' : 'Send Recovery Link'}
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            <>
              {/* ---------------- LOGIN MODE ---------------- */}
              {activeTab === 'login' && (
                <>
                  {/* CUSTOMER LOGIN (OTP or PASSWORD) */}
                  {roleTab === 'customer' && (
                    <div className="space-y-4">
                      {/* Login Method Toggle */}
                      <div className="bg-emerald-900/50 p-1.5 rounded-2xl border border-emerald-800/80 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => { setCustLoginMethod('otp'); setErrorMsg(''); setOtpSent(false); }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                            custLoginMethod === 'otp'
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-emerald-950 shadow-md'
                              : 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
                          }`}
                          data-testid="cust-login-otp-tab"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Login with OTP</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCustLoginMethod('password'); setErrorMsg(''); }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                            custLoginMethod === 'password'
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-emerald-950 shadow-md'
                              : 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
                          }`}
                          data-testid="cust-login-password-tab"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Login with Password</span>
                        </button>
                      </div>

                      {/* OTP Login Flow */}
                      {custLoginMethod === 'otp' && (
                        <>
                          <div className="bg-emerald-900/30 p-3 rounded-2xl border border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Phone-first instant authentication. Customer sessions persist for <strong>7 days</strong> across browser re-opens.</span>
                          </div>

                          {!otpSent ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                              <div>
                                <label className="block text-emerald-300 font-bold mb-1">Mobile Phone Number (E.164 format)</label>
                                <div className="relative">
                                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                                  <input
                                    type="text"
                                    required
                                    placeholder="Phone Number"
                                    value={custPhone}
                                    onChange={(e) => setCustPhone(e.target.value)}
                                    className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400"
                                  />
                                </div>
                              </div>

                              <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black py-3 rounded-xl shadow-lg text-xs transition-all flex items-center justify-center gap-2"
                              >
                                <span>Send 6-Digit SMS OTP</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </form>
                          ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                              <div className="bg-amber-500/10 border border-amber-500/40 p-3 rounded-2xl text-center space-y-1">
                                <span className="text-emerald-300 text-[11px]">OTP Sent to <strong className="text-white">{custPhone}</strong></span>
                                {simulatedOtp && (
                                  <div className="bg-amber-400 text-emerald-950 font-mono font-black text-xs px-2.5 py-1 rounded-lg inline-block">
                                    Simulated SMS Code: {simulatedOtp}
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-emerald-300 font-bold mb-1">Enter 6-Digit Verification Code</label>
                                <div className="relative">
                                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                                  <input
                                    type="text"
                                    maxLength={6}
                                    required
                                    placeholder="123456"
                                    value={custOtp}
                                    onChange={(e) => setCustOtp(e.target.value)}
                                    className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono font-bold text-center tracking-widest text-sm focus:ring-2 focus:ring-amber-400"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => setOtpSent(false)}
                                  className="w-1/3 bg-emerald-900 hover:bg-emerald-800 text-emerald-300 font-bold py-2.5 rounded-xl text-xs border border-emerald-700"
                                >
                                  Change Phone
                                </button>

                                <button
                                  type="submit"
                                  className="w-2/3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black py-2.5 rounded-xl shadow-lg text-xs"
                                >
                                  Verify & Sign In
                                </button>
                              </div>
                            </form>
                          )}
                        </>
                      )}

                      {/* Password Login Flow */}
                      {custLoginMethod === 'password' && !isCustForgotPassword && (
                        <>
                          <div className="bg-emerald-900/30 p-3 rounded-2xl border border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>Sign in with your phone number and password. Default password for existing customers: <strong className="text-amber-300">Customer123</strong></span>
                          </div>

                          <form onSubmit={handleCustomerPasswordLogin} className="space-y-4">
                            <div>
                              <label className="block text-emerald-300 font-bold mb-1">Mobile Phone Number</label>
                              <div className="relative">
                                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                                <input
                                  type="text"
                                  required
                                  placeholder="Phone Number"
                                  value={custPwdPhone}
                                  onChange={(e) => setCustPwdPhone(e.target.value)}
                                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400"
                                  data-testid="cust-pwd-phone-input"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-emerald-300 font-bold">Password</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsCustForgotPassword(true);
                                    setCustForgotPhone(custPwdPhone);
                                    setErrorMsg('');
                                  }}
                                  className="text-amber-400 hover:text-amber-300 font-semibold text-[11px] underline"
                                >
                                  Forgot Password?
                                </button>
                              </div>
                              <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                                <input
                                  type={showCustPassword ? 'text' : 'password'}
                                  required
                                  placeholder="••••••••"
                                  value={custPassword}
                                  onChange={(e) => setCustPassword(e.target.value)}
                                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-10 py-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400"
                                  data-testid="cust-pwd-password-input"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCustPassword(!showCustPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-amber-300 p-1 transition-colors"
                                  title={showCustPassword ? 'Hide password' : 'Show password'}
                                >
                                  {showCustPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black py-3 rounded-xl shadow-lg text-xs transition-all flex items-center justify-center gap-2"
                              data-testid="cust-pwd-login-submit"
                            >
                              <span>Sign In with Password</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </form>
                        </>
                      )}

                      {/* Customer Forgot Password Flow */}
                      {custLoginMethod === 'password' && isCustForgotPassword && (
                        <div className="space-y-4">
                          <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800 space-y-2">
                            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                              <KeyRound className="w-4 h-4 text-amber-400" /> Customer Password Recovery
                            </h3>
                            <p className="text-emerald-300 text-xs">
                              We’ll send a 6-digit OTP to your registered phone number. Verify it and set a new password.
                            </p>
                          </div>

                          {custForgotSuccess ? (
                            <div className="bg-emerald-900/80 border border-emerald-600 p-4 rounded-2xl text-center space-y-3">
                              <CheckCircle2 className="w-8 h-8 text-amber-400 mx-auto" />
                              <p className="font-bold text-white text-xs">Password Reset Successful!</p>
                              <p className="text-[11px] text-emerald-200">
                                Your password has been updated. You can now sign in with your new password.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustForgotPassword(false);
                                  setCustForgotSuccess(false);
                                  setCustForgotOtpSent(false);
                                  setCustForgotOtp('');
                                  setCustForgotNewPassword('');
                                  setCustForgotSimulatedOtp('');
                                }}
                                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-5 py-2 rounded-xl text-xs"
                              >
                                Back to Login
                              </button>
                            </div>
                          ) : !custForgotOtpSent ? (
                            <form onSubmit={handleCustForgotSendOtp} className="space-y-4">
                              <div>
                                <label className="block text-emerald-300 font-bold mb-1">Registered Phone Number</label>
                                <div className="relative">
                                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                                  <input
                                    type="text"
                                    required
                                    placeholder="Phone Number"
                                    value={custForgotPhone}
                                    onChange={(e) => setCustForgotPhone(e.target.value)}
                                    className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsCustForgotPassword(false);
                                    setErrorMsg('');
                                  }}
                                  className="text-emerald-400 hover:text-white font-bold underline text-xs"
                                >
                                  ← Back to Login
                                </button>

                                <button
                                  type="submit"
                                  disabled={isCustForgotLoading}
                                  className={`bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl shadow-lg text-xs ${isCustForgotLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {isCustForgotLoading ? 'Sending...' : 'Send OTP'}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <form onSubmit={handleCustForgotResetPassword} className="space-y-4">
                              <div className="bg-amber-500/10 border border-amber-500/40 p-3 rounded-2xl text-center space-y-1">
                                <span className="text-emerald-300 text-[11px]">OTP Sent to <strong className="text-white">{custForgotPhone}</strong></span>
                                {custForgotSimulatedOtp && (
                                  <div className="bg-amber-400 text-emerald-950 font-mono font-black text-xs px-2.5 py-1 rounded-lg inline-block">
                                    Simulated SMS Code: {custForgotSimulatedOtp}
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-emerald-300 font-bold mb-1">Enter 6-Digit Verification Code</label>
                                <div className="relative">
                                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                                  <input
                                    type="text"
                                    maxLength={6}
                                    required
                                    placeholder="123456"
                                    value={custForgotOtp}
                                    onChange={(e) => setCustForgotOtp(e.target.value)}
                                    className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono font-bold text-center tracking-widest text-sm focus:ring-2 focus:ring-amber-400"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-emerald-300 font-bold mb-1">New Password (min 6 characters)</label>
                                <div className="relative">
                                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                                  <input
                                    type={showCustForgotNewPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    value={custForgotNewPassword}
                                    onChange={(e) => setCustForgotNewPassword(e.target.value)}
                                    className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-10 py-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowCustForgotNewPassword(!showCustForgotNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-amber-300 p-1 transition-colors"
                                    title={showCustForgotNewPassword ? 'Hide password' : 'Show password'}
                                  >
                                    {showCustForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustForgotOtpSent(false);
                                    setCustForgotOtp('');
                                    setCustForgotNewPassword('');
                                    setCustForgotSimulatedOtp('');
                                  }}
                                  className="w-1/3 bg-emerald-900 hover:bg-emerald-800 text-emerald-300 font-bold py-2.5 rounded-xl text-xs border border-emerald-700"
                                >
                                  Change Phone
                                </button>

                                <button
                                  type="submit"
                                  disabled={isCustForgotLoading}
                                  className={`w-2/3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black py-2.5 rounded-xl shadow-lg text-xs ${isCustForgotLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {isCustForgotLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustForgotPassword(false);
                                  setCustForgotOtpSent(false);
                                  setCustForgotOtp('');
                                  setCustForgotNewPassword('');
                                  setCustForgotSimulatedOtp('');
                                  setErrorMsg('');
                                }}
                                className="w-full text-emerald-400 hover:text-white font-bold underline text-xs text-center"
                              >
                                ← Back to Password Login
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SELLER LOGIN (EMAIL + PASSWORD) */}
                  {roleTab === 'seller' && (
                    <form onSubmit={handleSellerLogin} className="space-y-4">
                      <div className="bg-emerald-900/30 p-3 rounded-2xl border border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>High-security vendor login. Seller sessions expire automatically when you close your browser tab.</span>
                      </div>

                      <div>
                        <label className="block text-emerald-300 font-bold mb-1">Business Email Address</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                          <input
                            type="email"
                            required
                            placeholder="seller@shroomvalley.org"
                            value={sellerEmail}
                            onChange={(e) => setSellerEmail(e.target.value)}
                            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-emerald-300 font-bold">Password</label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsForgotPassword(true);
                              setErrorMsg('');
                            }}
                            className="text-amber-400 hover:text-amber-300 font-semibold text-[11px] underline"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                          <input
                            type={showSellerPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={sellerPassword}
                            onChange={(e) => setSellerPassword(e.target.value)}
                            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-10 py-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSellerPassword(!showSellerPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-amber-300 p-1 transition-colors"
                            title={showSellerPassword ? 'Hide password' : 'Show password'}
                          >
                            {showSellerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black py-3 rounded-xl shadow-lg text-xs transition-all flex items-center justify-center gap-2"
                      >
                        <span>Seller Portal Login</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* DELIVERY PARTNER LOGIN (DELIVERY ID + PASSWORD) */}
                  {roleTab === 'delivery' && (
                    <form onSubmit={handleDeliveryLogin} className="space-y-4">
                      <div className="bg-emerald-900/30 p-3 rounded-2xl border border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Delivery Partner access. Log in with the Rider ID issued by your seller / logistics admin. Demo: <strong className="text-amber-300">RIDER-001 / Rider123</strong>.</span>
                      </div>

                      <div>
                        <label className="block text-emerald-300 font-bold mb-1">Delivery Partner ID</label>
                        <div className="relative">
                          <Bike className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                          <input
                            type="text"
                            required
                            placeholder="RIDER-001"
                            value={deliveryId}
                            onChange={(e) => setDeliveryId(e.target.value)}
                            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono font-bold uppercase focus:ring-2 focus:ring-amber-400"
                            data-testid="delivery-id-input"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-emerald-300 font-bold mb-1">Password</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                          <input
                            type={showDeliveryPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={deliveryPassword}
                            onChange={(e) => setDeliveryPassword(e.target.value)}
                            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-10 py-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400"
                            data-testid="delivery-password-input"
                          />
                          <button
                            type="button"
                            onClick={() => setShowDeliveryPassword(!showDeliveryPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-amber-300 p-1 transition-colors"
                          >
                            {showDeliveryPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black py-3 rounded-xl shadow-lg text-xs transition-all flex items-center justify-center gap-2"
                        data-testid="delivery-login-submit"
                      >
                        <span>Delivery Partner Login</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* ---------------- REGISTRATION MODE ---------------- */}
              {activeTab === 'register' && (
                <>
                  {/* CUSTOMER REGISTRATION */}
                  {roleTab === 'customer' && (
                    !regOtpSent ? (
                      <form onSubmit={handleCustomerRegister} className="space-y-3">
                        <div>
                          <label className="block text-emerald-300 font-bold mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Anish Sharma"
                            value={regCustName}
                            onChange={(e) => setRegCustName(e.target.value)}
                            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-emerald-300 font-bold mb-1">Mobile Phone *</label>
                            <input
                              type="text"
                              required
                              placeholder="Phone Number"
                              value={regCustPhone}
                              onChange={(e) => setRegCustPhone(e.target.value)}
                              className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-emerald-300 font-bold mb-1">Email Address</label>
                            <input
                              type="email"
                              placeholder="anish@example.com"
                              value={regCustEmail}
                              onChange={(e) => setRegCustEmail(e.target.value)}
                              className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-emerald-300 font-bold mb-1">Street Address *</label>
                          <input
                            type="text"
                            required
                            placeholder="Flat 102, Green Park Avenue"
                            value={regCustStreet}
                            onChange={(e) => setRegCustStreet(e.target.value)}
                            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-emerald-300 font-bold mb-1">City</label>
                            <input
                              type="text"
                              value={regCustCity}
                              onChange={(e) => setRegCustCity(e.target.value)}
                              className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-emerald-300 font-bold mb-1">Pincode</label>
                            <input
                              type="text"
                              value={regCustPincode}
                              onChange={(e) => setRegCustPincode(e.target.value)}
                              className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-emerald-300 font-bold mb-1">Set Password *</label>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                            <input
                              type={showRegCustPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              placeholder="Min 6 characters"
                              value={regCustPassword}
                              onChange={(e) => setRegCustPassword(e.target.value)}
                              className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-10 py-2 text-white font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegCustPassword(!showRegCustPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-amber-300 p-1 transition-colors"
                              title={showRegCustPassword ? 'Hide password' : 'Show password'}
                            >
                              {showRegCustPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black py-3 rounded-xl shadow-lg text-xs mt-2"
                        >
                          Create Customer Account
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleCustomerRegisterVerify} className="space-y-4">
                        <div className="bg-amber-500/10 border border-amber-500/40 p-3 rounded-2xl text-center space-y-1">
                          <span className="text-emerald-300 text-[11px]">OTP Sent to <strong className="text-white">{regCustPhone}</strong></span>
                          {regSimulatedOtp && (
                            <div className="bg-amber-400 text-emerald-950 font-mono font-black text-xs px-2.5 py-1 rounded-lg inline-block">
                              Simulated SMS Code: {regSimulatedOtp}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-emerald-300 font-bold mb-1">Enter 6-Digit Verification Code</label>
                          <div className="relative">
                            <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                            <input
                              type="text"
                              maxLength={6}
                              required
                              placeholder="123456"
                              value={regOtpVal}
                              onChange={(e) => setRegOtpVal(e.target.value)}
                              className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono font-bold text-center tracking-widest text-sm focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setRegOtpSent(false)}
                            className="w-1/3 bg-emerald-900 hover:bg-emerald-800 text-emerald-300 font-bold py-2.5 rounded-xl text-xs border border-emerald-700"
                          >
                            Back to Form
                          </button>

                          <button
                            type="submit"
                            className="w-2/3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black py-2.5 rounded-xl shadow-lg text-xs"
                          >
                            Verify & Register
                          </button>
                        </div>
                      </form>
                    )
                  )}

                  {/* SELLER REGISTRATION */}
                  {roleTab === 'seller' && (
                    <form onSubmit={handleSellerRegister} className="space-y-3">
                      <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-[11px] text-amber-300">
                        Notice: Newly registered seller accounts default to <strong>PENDING</strong> status and require administrative review before catalog publishing.
                      </div>

                      <div>
                        <label className="block text-emerald-300 font-bold mb-1">Farm / Business Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="ShroomCraft Organic Farms"
                          value={regSellerFarm}
                          onChange={(e) => setRegSellerFarm(e.target.value)}
                          className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-emerald-300 font-bold mb-1">Owner Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ramesh Patel"
                            value={regSellerOwner}
                            onChange={(e) => setRegSellerOwner(e.target.value)}
                            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-emerald-300 font-bold mb-1">Contact Phone *</label>
                          <input
                            type="text"
                            required
                            placeholder="Phone Number"
                            value={regSellerPhone}
                            onChange={(e) => setRegSellerPhone(e.target.value)}
                            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-emerald-300 font-bold mb-1">Business Email *</label>
                          <input
                            type="email"
                            required
                            placeholder="ramesh@shroomcraft.org"
                            value={regSellerEmail}
                            onChange={(e) => setRegSellerEmail(e.target.value)}
                            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-emerald-300 font-bold mb-1">Password *</label>
                          <div className="relative">
                            <input
                              type={showRegSellerPassword ? 'text' : 'password'}
                              required
                              placeholder="••••••••"
                              value={regSellerPassword}
                              onChange={(e) => setRegSellerPassword(e.target.value)}
                              className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-3 pr-10 py-2 text-white font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegSellerPassword(!showRegSellerPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-amber-300 p-1 transition-colors"
                              title={showRegSellerPassword ? 'Hide password' : 'Show password'}
                            >
                              {showRegSellerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-emerald-300 font-bold mb-1">GSTIN Tax ID</label>
                          <input
                            type="text"
                            placeholder="29ABCDE1234F1Z5"
                            value={regSellerGstin}
                            onChange={(e) => setRegSellerGstin(e.target.value)}
                            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                          />
                        </div>

                        <div>
                          <label className="block text-emerald-300 font-bold mb-1">Organic Cert No.</label>
                          <input
                            type="text"
                            placeholder="IND-ORG-2026-88"
                            value={regSellerCert}
                            onChange={(e) => setRegSellerCert(e.target.value)}
                            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black py-3 rounded-xl shadow-lg text-xs mt-2"
                      >
                        Submit Vendor Registration
                      </button>
                    </form>
                  )}

                  {/* DELIVERY PARTNER — NO SELF REGISTRATION */}
                  {roleTab === 'delivery' && (
                    <div className="bg-emerald-900/40 border border-emerald-800 rounded-2xl p-5 text-center space-y-3">
                      <Bike className="w-10 h-10 text-amber-400 mx-auto" />
                      <h3 className="font-extrabold text-white text-sm">Delivery Partners are onboarded by Sellers</h3>
                      <p className="text-[11px] text-emerald-300">
                        Delivery Partner IDs (e.g. RIDER-001) are issued by the seller / logistics admin. Please switch to the
                        <strong className="text-amber-300"> Login</strong> tab and sign in with your issued Rider ID.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black px-4 py-2 rounded-xl text-xs"
                      >
                        Go to Delivery Login
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
