import React, { useState } from 'react';
import DoubleBezel from './components/DoubleBezel';

export default function AuthForms({
  isLoginMode,
  setIsLoginMode,
  isResetMode,
  setIsResetMode,
  setResetToken,
  isForgotMode,
  setIsForgotMode,
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  regFullName,
  setRegFullName,
  regEmail,
  setRegEmail,
  regConfirmPassword,
  setRegConfirmPassword,
  forgotEmail,
  setForgotEmail,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleLogin,
  handleRegister,
  handleForgotPassword,
  handleResetPassword,
  loginWithGoogle,
  setIsPrivacyOpen,
  setIsTermsOpen,
  setShowAuthForm,
  language,
  setLanguage,
}) {
  const [agreed, setAgreed] = useState(false);
  const isIndo = language === 'id';

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-glass-bg dark:bg-[#090D16] font-sans selection:bg-[#111E38] selection:text-[#FACC15] dark:selection:bg-[#FACC15] dark:selection:text-[#111E38] overflow-hidden">
      
      {/* Sisi Kiri (Desktop/Tablet Layout) */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-16 text-[#111E38] dark:text-white overflow-hidden">
        {/* Background Photo */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/happy_office_workers.png" 
            alt="Happy young professionals working together" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          {/* White overlay like hero image / calm gray background in dark mode */}
          <div className="absolute inset-0 bg-white/85 dark:bg-[#090D16]/90 backdrop-blur-[2px]" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Logo & Wordmark (Dibuat Lebih Besar) */}
          <div className="flex items-center gap-1 select-none">
            <h1 className="text-5xl font-black tracking-tighter">
              <span className="text-[#111E38] dark:text-white">alur</span>
              <span className="text-[#FACC15]">ku</span>
              <span className="text-[#FACC15]">.</span>
            </h1>
          </div>

          {/* Core Brand Value Messages (Teks Dibuat Lebih Besar & Bilingual) */}
          <div className="space-y-8 max-w-xl my-auto">
            {/* Tagline Capitalized & formatted nicely */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FACC15]/20 text-[#111E38] dark:text-[#FACC15] border border-[#FACC15]/30 text-sm font-extrabold rounded-full tracking-wide">
              {isIndo ? 'Kuasai Waktumu, Lancarkan Alurmu.' : 'Master Your Time, Smooth Your Flow.'}
            </div>
            <h2 className="text-5xl md:text-6xl font-black leading-tight text-[#111E38] dark:text-white tracking-tight">
              {isIndo 
                ? 'Berhenti mengingat semua tugasmu, mulailah menyelesaikannya.' 
                : 'Stop remembering all your tasks, start completing them.'}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg font-medium leading-relaxed">
              {isIndo
                ? 'alurku. adalah asisten cerdas yang mengubah tumpukan rencana kerjamu menjadi alur eksekusi yang rapi. Fokus pada hasil, biarkan AI kami yang mengatur jadwalnya.'
                : 'alurku. is an intelligent assistant that transforms your pile of work plans into a neat execution flow. Focus on results, let our AI organize the schedule.'}
            </p>

            {/* Subtle Pillars Display */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-neutral-300/50 dark:border-white/10">
              <div>
                <h4 className="text-[#111E38] dark:text-[#FACC15] font-extrabold text-base flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FACC15]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {isIndo ? 'Perencana Otomatis' : 'Automated Planner'}
                </h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {isIndo ? 'Estimasi & penjadwalan otomatis berbasis AI.' : 'AI-based automated estimation & scheduling.'}
                </p>
              </div>
              <div>
                <h4 className="text-[#111E38] dark:text-[#FACC15] font-extrabold text-base flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FACC15]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {isIndo ? 'Beban Kerja Seimbang' : 'Balanced Workload'}
                </h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {isIndo ? 'Visualisasi kapasitas agar tetap produktif bebas burnout.' : 'Capacity visualization to stay productive and burnout-free.'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-xs text-[#111E38]/60 dark:text-neutral-400 flex justify-between">
            <span>&copy; 2026 alurku. {isIndo ? 'Semua hak dilindungi undang-undang.' : 'All rights reserved.'}</span>
            <div className="flex gap-4">
              <button onClick={() => setIsPrivacyOpen?.(true)} className="hover:text-[#111E38] dark:hover:text-white transition-colors">{isIndo ? 'Kebijakan Privasi' : 'Privacy Policy'}</button>
              <button onClick={() => setIsTermsOpen?.(true)} className="hover:text-[#111E38] dark:hover:text-white transition-colors">{isIndo ? 'Ketentuan Layanan' : 'Terms of Service'}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sisi Kanan (Form Layout) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-16 bg-glass-bg dark:bg-[#090D16]">
        
        <DoubleBezel className="w-full max-w-md bg-white dark:bg-[#121B2D] p-8 sm:p-10 shadow-md border border-neutral-200/60 dark:border-neutral-800/80 rounded-2xl relative mac-animate overflow-hidden">
          
          {/* Back to Home Button & Language Switcher */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowAuthForm(false)}
              className="group flex items-center gap-2 text-xs font-bold text-[#111E38]/60 dark:text-neutral-400 hover:text-[#111E38] dark:hover:text-white transition-colors uppercase tracking-wider"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {isIndo ? 'Kembali' : 'Back'}
            </button>
            <button
              onClick={() => setLanguage?.(isIndo ? 'en' : 'id')}
              className="text-xs font-bold text-[#111E38]/60 dark:text-neutral-400 hover:text-[#111E38] dark:hover:text-white transition-colors border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 rounded-md"
            >
              {isIndo ? 'English (EN)' : 'Bahasa (ID)'}
            </button>
          </div>

          {/* Brand Logo for Mobile (Hidden on Desktop) */}
          <div className="md:hidden flex items-center gap-1 mb-6">
            <h1 className="text-2xl font-extrabold tracking-tighter">
              <span className="text-[#111E38] dark:text-white">alur</span>
              <span className="text-[#FACC15]">ku</span>
              <span className="text-[#FACC15]">.</span>
            </h1>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-extrabold text-[#111E38] dark:text-white tracking-tight">
              {isResetMode ? (
                isIndo ? 'Atur Ulang Kata Sandi' : 'Reset Password'
              ) : isForgotMode ? (
                isIndo ? 'Pemulihan Akun' : 'Account Recovery'
              ) : isLoginMode ? (
                isIndo ? (
                  <>
                    Masuk ke <span className="font-extrabold tracking-tighter">alur<span className="text-[#FACC15]">ku</span><span className="text-[#FACC15]">.</span></span>
                  </>
                ) : (
                  <>
                    Sign In to <span className="font-extrabold tracking-tighter">alur<span className="text-[#FACC15]">ku</span><span className="text-[#FACC15]">.</span></span>
                  </>
                )
              ) : (
                isIndo ? 'Daftar Akun Baru' : 'Register New Account'
              )}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2 font-medium">
              {isResetMode
                ? (isIndo ? 'Masukkan kata sandi baru Anda di bawah ini.' : 'Enter your new password below.')
                : isForgotMode
                ? (isIndo ? 'Masukkan email terdaftar untuk menerima tautan pemulihan.' : 'Enter registered email to receive a recovery link.')
                : isLoginMode
                ? (isIndo ? 'Kelola alur kerja dan proyek harian Anda dengan asisten cerdas.' : 'Manage your workflows and daily projects with an intelligent assistant.')
                : (isIndo ? 'Buat akun Anda secara gratis untuk mulai merapikan rencana.' : 'Create your account for free to start streamlining your plans.')}
            </p>
          </div>

          {/* Reset Password Form */}
          {isResetMode ? (
            <form key="reset" onSubmit={handleResetPassword} className="space-y-4 form-animate">
              <div>
                <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200 mb-1">
                  {isIndo ? 'Kata Sandi Baru' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:border-[#111E38] dark:focus:border-[#FACC15] outline-none text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#111E38] dark:hover:text-white"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200 mb-1">
                  {isIndo ? 'Konfirmasi Kata Sandi' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:border-[#111E38] dark:focus:border-[#FACC15] outline-none text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#111E38] dark:hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-[#111E38] font-bold py-3.5 mt-6 uppercase tracking-widest text-xs rounded-lg transition-colors border border-transparent shadow-sm flex items-center justify-center gap-2"
              >
                {isIndo ? 'Simpan Kata Sandi Baru' : 'Save New Password'}
              </button>
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setResetToken(null);
                  }}
                  className="text-xs font-bold text-neutral-500 hover:text-[#111E38] dark:hover:text-white uppercase tracking-wider transition-colors"
                >
                  {isIndo ? 'Kembali ke Halaman Masuk' : 'Back to Login Page'}
                </button>
              </div>
            </form>
          ) : isForgotMode ? (
            /* Forgot Password / Account Recovery Form */
            <form key="forgot" onSubmit={handleForgotPassword} className="space-y-4 form-animate">
              <div>
                <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200 mb-1">
                  {isIndo ? 'Alamat Email' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:border-[#111E38] dark:focus:border-[#FACC15] outline-none text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-[#111E38] font-bold py-3.5 mt-6 uppercase tracking-widest text-xs rounded-lg transition-colors border border-transparent shadow-sm"
              >
                {isIndo ? 'Kirim Tautan Atur Ulang' : 'Send Reset Link'}
              </button>
              <div className="relative flex items-center py-4">
                <div className="grow border-t border-neutral-200 dark:border-neutral-800"></div>
                <span className="mx-4 text-neutral-400 text-xs font-bold uppercase tracking-widest">{isIndo ? 'Atau' : 'Or'}</span>
                <div className="grow border-t border-neutral-200 dark:border-neutral-800"></div>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsForgotMode(false)}
                  className="text-xs font-bold text-neutral-500 hover:text-[#111E38] dark:hover:text-white uppercase tracking-wider transition-colors"
                >
                  {isIndo ? 'Kembali ke Halaman Masuk' : 'Back to Login Page'}
                </button>
              </div>
            </form>
          ) : isLoginMode ? (
            /* Login Form */
            <form key="login" onSubmit={handleLogin} className="space-y-5 form-animate">
              <div>
                <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200 mb-1">
                  {isIndo ? 'Nama Pengguna (Username)' : 'Username'}
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:border-[#111E38] dark:focus:border-[#FACC15] outline-none text-sm"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200">
                    {isIndo ? 'Kata Sandi (Password)' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotMode(true)}
                    className="text-xs font-bold text-neutral-500 hover:text-[#111E38] dark:hover:text-white transition-colors"
                  >
                    {isIndo ? 'Lupa Sandi?' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:border-[#111E38] dark:focus:border-[#FACC15] outline-none text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#111E38] dark:hover:text-white"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-[#111E38] font-bold py-3.5 mt-6 uppercase tracking-widest text-xs rounded-lg transition-colors border border-transparent shadow-sm flex items-center justify-center gap-2"
              >
                {isIndo ? 'Masuk' : 'Sign In'}
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="grow border-t border-neutral-200 dark:border-neutral-800"></div>
                <span className="mx-4 text-neutral-400 text-xs font-bold uppercase tracking-widest">{isIndo ? 'Atau' : 'Or'}</span>
                <div className="grow border-t border-neutral-200 dark:border-neutral-800"></div>
              </div>
              
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full bg-transparent text-[#111E38] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50 font-bold py-3.5 uppercase tracking-widest text-xs border border-neutral-300 dark:border-neutral-700 rounded-lg flex items-center justify-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isIndo ? 'Masuk dengan Google' : 'Sign In with Google'}
              </button>
            </form>
          ) : (
            /* Register / Request Access Form - Swapped Email and Username */
            <form key="register" onSubmit={handleRegister} className="space-y-4 form-animate">
              <div>
                <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200 mb-1">
                  {isIndo ? 'Nama Lengkap' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:border-[#111E38] dark:focus:border-[#FACC15] outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200 mb-1">
                  {isIndo ? 'Nama Pengguna (Username)' : 'Username'}
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:border-[#111E38] dark:focus:border-[#FACC15] outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200 mb-1">
                  {isIndo ? 'Email' : 'Email'}
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:border-[#111E38] dark:focus:border-[#FACC15] outline-none text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200 mb-1">
                    {isIndo ? 'Kata Sandi' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:border-[#111E38] dark:focus:border-[#FACC15] outline-none text-sm pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#111E38] dark:hover:text-white"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200 mb-1">
                    {isIndo ? 'Konfirmasi' : 'Confirm'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full p-3 bg-transparent border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:border-[#111E38] dark:focus:border-[#FACC15] outline-none text-sm pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#111E38] dark:hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 mt-2 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  {isIndo
                    ? 'Kata sandi dienkripsi satu arah secara matematis. Admin sistem tidak dapat melihat atau memulihkan sandi Anda.'
                    : 'Passwords are mathematically one-way encrypted. System admins cannot view or retrieve your password.'}
                </p>
              </div>

              <div className="flex items-start gap-2.5 mt-4">
                <input
                  type="checkbox"
                  id="reg-agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-[#111E38] dark:text-[#FACC15] focus:ring-[#111E38] cursor-pointer shrink-0"
                />
                <label
                  htmlFor="reg-agree"
                  className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed cursor-pointer select-none"
                >
                  {isIndo ? (
                    <>
                      Saya telah membaca dan menyetujui{' '}
                      <button
                        type="button"
                        onClick={() => setIsTermsOpen?.(true)}
                        className="text-[#111E38] dark:text-[#FACC15] font-bold hover:underline"
                      >
                        Ketentuan Layanan
                      </button>{' '}
                      dan{' '}
                      <button
                        type="button"
                        onClick={() => setIsPrivacyOpen?.(true)}
                        className="text-[#111E38] dark:text-[#FACC15] font-bold hover:underline"
                      >
                        Kebijakan Privasi
                      </button>
                      .
                    </>
                  ) : (
                    <>
                      I have read and agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setIsTermsOpen?.(true)}
                        className="text-[#111E38] dark:text-[#FACC15] font-bold hover:underline"
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={() => setIsPrivacyOpen?.(true)}
                        className="text-[#111E38] dark:text-[#FACC15] font-bold hover:underline"
                      >
                        Privacy Policy
                      </button>
                      .
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={!agreed}
                className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-[#111E38] disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3.5 mt-6 uppercase tracking-widest text-xs rounded-lg transition-colors border border-transparent shadow-sm"
              >
                {isIndo ? 'Buat Akun Baru' : 'Create Account'}
              </button>

              <div className="relative flex items-center py-2">
                <div className="grow border-t border-neutral-200 dark:border-neutral-800"></div>
                <span className="mx-4 text-neutral-400 text-xs font-bold uppercase tracking-widest">{isIndo ? 'Atau' : 'Or'}</span>
                <div className="grow border-t border-neutral-200 dark:border-neutral-800"></div>
              </div>

              <button
                type="button"
                disabled={!agreed}
                onClick={() => loginWithGoogle()}
                className="w-full bg-transparent text-[#111E38] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50 font-bold py-3.5 uppercase tracking-widest text-xs border border-neutral-300 dark:border-neutral-700 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isIndo ? 'Daftar dengan Google' : 'Sign Up with Google'}
              </button>
            </form>
          )}

          {/* Mode Switch Button */}
          {!isResetMode && !isForgotMode && (
            <p className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-semibold form-animate">
              {isLoginMode ? (
                <>
                  {isIndo ? 'Belum punya akses?' : "Don't have access?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(false);
                      setLoginUsername('');
                      setLoginPassword('');
                    }}
                    className="font-bold text-[#111E38] dark:text-[#FACC15] hover:underline"
                  >
                    {isIndo ? 'Daftar Baru' : 'Register Now'}
                  </button>
                </>
              ) : (
                <>
                  {isIndo ? 'Sudah punya akun?' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(true);
                      setLoginUsername('');
                      setLoginPassword('');
                      setRegConfirmPassword('');
                    }}
                    className="font-bold text-[#111E38] dark:text-[#FACC15] hover:underline"
                  >
                    {isIndo ? 'Masuk' : 'Sign In'}
                  </button>
                </>
              )}
            </p>
          )}
        </DoubleBezel>
      </div>
    </div>
  );
}
