import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import type { UserProfile, SellerProfile, AddressDetails } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  initialRole?: 'customer' | 'seller';
  onCustomerLoginSuccess: (profile: UserProfile) => void;
  onSellerLoginSuccess: (profile: SellerProfile) => void;
  onCustomerRegisterSuccess: (profile: UserProfile) => void;
  onSellerRegisterSuccess: (message: string) => void;
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
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [roleTab, setRoleTab] = useState<'customer' | 'seller'>(initialRole);

  // Customer Login States
  const [custPhone, setCustPhone] = useState('+91 98450 12345');
  const [otpSent, setOtpSent] = useState(false);
  const [custOtp, setCustOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');

  // Seller Login States
  const [sellerEmail, setSellerEmail] = useState('ramesh.patel@shroomvalley.org');
  const [sellerPassword, setSellerPassword] = useState('Seller123');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Customer Registration States
  const [regCustName, setRegCustName] = useState('');
  const [regCustPhone, setRegCustPhone] = useState('+91 ');
  const [regCustEmail, setRegCustEmail] = useState('');
  const [regCustStreet, setRegCustStreet] = useState('');
  const [regCustCity, setRegCustCity] = useState('Bengaluru');
  const [regCustPincode, setRegCustPincode] = useState('560034');

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

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!custPhone || custPhone.length < 10) {
      setErrorMsg('Please enter a valid phone number (e.g. +91 98450 12345)');
      return;
    }
    // Generate 6-digit OTP simulation
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(generated);
    setCustOtp(generated); // Pre-fill for instant smooth testing
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (custOtp !== simulatedOtp && custOtp !== '123456') {
      setErrorMsg('Invalid OTP code. Please check your SMS code.');
      return;
    }
    // Success -> Create/fetch customer profile
    const profile: UserProfile = {
      name: regCustName || 'Valued Customer',
      phone: custPhone,
      email: regCustEmail || 'customer@example.com',
      savedAddresses: [
        {
          fullName: regCustName || 'Valued Customer',
          phone: custPhone,
          streetAddress: regCustStreet || 'Flat 102, Laurel Springs Apt, Koramangala',
          city: regCustCity || 'Bengaluru',
          pincode: regCustPincode || '560034',
          estimatedDistanceKm: 4.5,
          latitude: 12.9352,
          longitude: 77.6245,
        }
      ],
      defaultAddressIndex: 0,
    };
    onCustomerLoginSuccess(profile);
    onClose();
  };

  const handleSellerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!sellerEmail || !sellerPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    // Validate email
    if (sellerEmail.toLowerCase().includes('pending')) {
      setErrorMsg('Access Denied: Your seller account is PENDING administrator approval.');
      return;
    }

    const profile: SellerProfile = {
      sellerId: 'FARM-' + Math.floor(1000 + Math.random() * 9000),
      farmName: 'ShroomValley Organic & Agro Farm',
      ownerName: 'Ramesh Patel',
      phone: '+91 94480 99887',
      email: sellerEmail,
      farmAddress: 'Survey #42, Organic Agro Belt, Sarjapur Road, Bengaluru',
      latitude: 12.9716,
      longitude: 77.5946,
      organicCertNo: 'IND-ORG-2024-88192',
      rating: 4.9,
      establishedYear: 2018,
    };

    onSellerLoginSuccess(profile);
    onClose();
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!forgotEmail) {
      setErrorMsg('Please enter your registered seller email address.');
      return;
    }
    setForgotSuccess(true);
    setTimeout(() => {
      setIsForgotPassword(false);
      setForgotSuccess(false);
    }, 3000);
  };

  const handleCustomerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regCustName || !regCustPhone || !regCustStreet) {
      setErrorMsg('Please complete all required fields (Name, Phone, Street Address).');
      return;
    }

    const newAddress: AddressDetails = {
      fullName: regCustName,
      phone: regCustPhone,
      streetAddress: regCustStreet,
      city: regCustCity,
      pincode: regCustPincode,
      estimatedDistanceKm: 3.5,
      latitude: 12.9352,
      longitude: 77.6245,
    };

    const newProfile: UserProfile = {
      name: regCustName,
      phone: regCustPhone,
      email: regCustEmail || `${regCustName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      savedAddresses: [newAddress],
      defaultAddressIndex: 0,
    };

    onCustomerRegisterSuccess(newProfile);
    onClose();
  };

  const handleSellerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regSellerFarm || !regSellerOwner || !regSellerEmail || !regSellerPassword || !regSellerGstin) {
      setErrorMsg('Please complete all mandatory vendor fields (Farm Name, Owner, Email, Password, GSTIN).');
      return;
    }

    onSellerRegisterSuccess(`Vendor Registration submitted for '${regSellerFarm}'! Status: PENDING approval.`);
    onClose();
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
                      className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl shadow-lg"
                    >
                      Send Recovery Link
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
                  {/* CUSTOMER LOGIN (PHONE + OTP) */}
                  {roleTab === 'customer' && (
                    <div className="space-y-4">
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
                                placeholder="+91 98765 43210"
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
                            type="password"
                            required
                            placeholder="••••••••"
                            value={sellerPassword}
                            onChange={(e) => setSellerPassword(e.target.value)}
                            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400"
                          />
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
                </>
              )}

              {/* ---------------- REGISTRATION MODE ---------------- */}
              {activeTab === 'register' && (
                <>
                  {/* CUSTOMER REGISTRATION */}
                  {roleTab === 'customer' && (
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
                            placeholder="+91 98765 43210"
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

                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black py-3 rounded-xl shadow-lg text-xs mt-2"
                      >
                        Create Customer Account
                      </button>
                    </form>
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
                            placeholder="+91 94480 99887"
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
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={regSellerPassword}
                            onChange={(e) => setRegSellerPassword(e.target.value)}
                            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-emerald-300 font-bold mb-1">GSTIN Tax ID *</label>
                          <input
                            type="text"
                            required
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
                </>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
