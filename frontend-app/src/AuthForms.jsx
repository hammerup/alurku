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
  const [rememberMe, setRememberMe] = useState(true);

  React.useEffect(() => {
    localStorage.setItem('alurku_remember_me', 'true');
    sessionStorage.removeItem('alurku_remember_me');
  }, []);

  const isIndo = language === 'id';

  const tMsg = (en, id) => (isIndo ? id : en);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#f8f9ff] dark:bg-[#090D16] font-sans selection:bg-[#FACC15] selection:text-[#111E38] overflow-hidden">
      
      {/* ── LEFT SIDE: VISUAL / ILLUSTRATION ── */}
      <section className="hidden md:flex relative md:w-1/2 lg:w-3/5 bg-[#111e38] overflow-hidden items-center justify-center p-16">
        {isLoginMode || isForgotMode || isResetMode ? (
          /* Sign In Left Side Visuals */
          <>
            {/* Logo on Top Left of Left Side */}
            <div className="absolute top-12 left-12 flex items-center gap-2.5 z-20 select-none">
              <div className="w-9 h-9 bg-[#FACC15] rounded-xl flex items-center justify-center font-black text-[#111E38] text-2xl leading-none pb-0.5 shadow-md shrink-0">a</div>
              <span className="font-black text-2xl tracking-tighter text-white">
                alur<span className="text-[#FACC15]">ku</span>.
              </span>
            </div>
            <div className="absolute inset-0 z-0">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwlHJROQcT99u1N5kYuI2k7mNzyzE_GH6XV9Jv_RkJyFJkyld-WQSYjTvJxHFyHOlkDcuMIo2imzimRjHcwZMtIT-9Uky982fnT35pHZQEs9eriSAi9YydETb631tj6RxskGRbPph3SAvlt6FBZZeN8QIvSt6eUJaRTDFxrLjAaFOYYA9ShfuOKiLRlFuaNNTP9Rxo-2FHPLcp_TYOdxOcgHkuBFwOh1UIOhI583mg2CXdheCDSfGkPyRl51vx85-LHq9CiDJfm65j" 
                class="w-full h-full object-cover opacity-50 mix-blend-overlay transform hover:scale-102 transition-transform duration-10000 ease-out"
                alt="Workspace background"
              />
            </div>
            {/* Dark Navy overlay */}
            <div className="absolute inset-0 z-10 bg-linear-to-tr from-[#111e38] via-[#111e38]/80 to-transparent"></div>
            
            <div className="relative z-20 max-w-2xl text-white space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <span className="material-symbols-outlined text-[#FACC15] text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#FACC15]">
                  {tMsg("Future of Workflow", "Masa Depan Alur Kerja")}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                {tMsg("Turn Plans Into Real Workflows.", "Ubah Rencana Menjadi Alur Kerja Nyata.")}
              </h1>
              
              <p className="text-lg text-white/80 leading-relaxed max-w-xl font-medium">
                {tMsg(
                  "alurku. is an intelligent assistant that transforms your pile of work plans into a neat execution flow. Focus on results, let our AI organize the schedule.",
                  "alurku. adalah asisten cerdas yang mengubah tumpukan rencana kerjamu menjadi alur eksekusi yang rapi. Fokus pada hasil, biarkan AI kami yang mengatur jadwalnya."
                )}
              </p>
              
              <div className="mt-12 flex gap-12 border-t border-white/10 pt-12">
                <div>
                  <p className="text-3xl font-extrabold text-[#FACC15]">10k+</p>
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mt-1">{tMsg("Active Teams", "Tim Aktif")}</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-[#FACC15]">99.9%</p>
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mt-1">{tMsg("Uptime SLA", "Uptime SLA")}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Create Account Left Side Visuals */
          <>
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay transform hover:scale-102 transition-transform duration-10000 ease-out" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida/AP1WRLtmaqQjQgKcp1Vgh5ENv1jofL54V1J7rREQpGmDRwverxjByjVFbPlZskQCcBGPaZPWp_Paq6QBSqm4nEdsWpaOjkrDISiTtzF-5M05nGIbrGW4QbA_nAA4vZC9USp6VfGsY6b6LbYgRTrBQZO-LvYtCiOR54jvQMY1iluFRbn4vIH5Q3FUMpj_d9HLypXwHnRSpsqthd3IHsUiD7x7G4yYeS3jNauStu2uIGQQjTm8BNQ3cnr9RhwCLqBS')" }}
              alt="Secure network background"
            />
            {/* Ambient glows */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#FACC15]/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#111e38]/40 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute inset-0 z-10 bg-linear-to-tr from-[#111e38] via-[#111e38]/70 to-transparent"></div>

            <div className="relative z-20 max-w-xl text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <span className="material-symbols-outlined text-[#FACC15] text-sm">verified_user</span>
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#FACC15]">
                  {tMsg("Secure & Trusted System", "Sistem Aman & Terpercaya")}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                {isIndo ? (
                  <>Mulai Perjalanan Anda di alur<span className="text-[#FACC15]">ku</span>.</>
                ) : (
                  <>Begin Your Journey with alur<span className="text-[#FACC15]">ku</span>.</>
                )}
              </h1>
              
              <p className="text-lg text-white/80 leading-relaxed font-medium">
                {tMsg(
                  "Optimize your productivity and manage your workflow with the precision of future technology.",
                  "Optimalkan produktivitas dan kelola workflow Anda dengan presisi teknologi masa depan."
                )}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-left pt-6">
                <div className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors">
                  <span className="material-symbols-outlined text-[#FACC15] mb-2">speed</span>
                  <h3 className="font-bold text-white text-base">{tMsg("High Performance", "Performa Tinggi")}</h3>
                  <p className="text-xs text-white/60 mt-1 font-semibold">{tMsg("Uncompromising speed for every process.", "Kecepatan tanpa kompromi untuk setiap proses.")}</p>
                </div>
                <div className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors">
                  <span className="material-symbols-outlined text-[#FACC15] mb-2">dashboard_customize</span>
                  <h3 className="font-bold text-white text-base">{tMsg("High Customization", "Kustomisasi Luas")}</h3>
                  <p className="text-xs text-white/60 mt-1 font-semibold">{tMsg("Tailor the interface to fit your work style.", "Sesuaikan antarmuka sesuai gaya kerja Anda.")}</p>
                </div>
              </div>
            </div>
            
            {/* Logo on Top Left of Left Side */}
            <div className="absolute top-12 left-12 flex items-center gap-2.5 z-20 select-none">
              <div className="w-9 h-9 bg-[#FACC15] rounded-xl flex items-center justify-center font-black text-[#111E38] text-2xl leading-none pb-0.5 shadow-md shrink-0">a</div>
              <span className="font-black text-2xl tracking-tighter text-white">
                alur<span className="text-[#FACC15]">ku</span>.
              </span>
            </div>
          </>
        )}
      </section>

      {/* ── RIGHT SIDE: FORM CONTAINER ── */}
      <section className="w-full md:w-1/2 lg:w-2/5 flex flex-col bg-[#f8f9ff] dark:bg-[#090D16] p-6 sm:p-12 lg:p-20 justify-between min-h-screen overflow-y-auto">
        
        {/* Navigation & Language switcher header */}
        <div className="flex items-center justify-between w-full mb-8">
          <button
            onClick={() => setShowAuthForm(false)}
            className="group flex items-center gap-2 text-xs font-bold text-[#111E38]/60 dark:text-neutral-400 hover:text-[#111E38] dark:hover:text-white transition-colors uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[16px] transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
            {tMsg("Back", "Kembali")}
          </button>
          <button
            onClick={() => setLanguage(isIndo ? 'en' : 'id')}
            className="text-xs font-bold text-[#111E38]/60 dark:text-neutral-400 hover:text-[#111E38] dark:hover:text-white transition-colors border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-900 shadow-sm"
          >
            {isIndo ? 'English (EN)' : 'Bahasa (ID)'}
          </button>
        </div>

        {/* Mobile branding header */}
        <div className="md:hidden flex justify-center mb-8">
          <span className="font-black text-3xl tracking-tighter text-[#111E38] dark:text-white">
            alur<span className="text-[#FACC15]">ku</span>.
          </span>
        </div>

        {/* Forms Body Card */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          {/* Desktop Logo (Right Side - above form) */}
          <div className="hidden md:flex items-center gap-2.5 mb-8 select-none">            
            <span className="font-black text-5xl tracking-tighter text-[#111E38] dark:text-white">
              alur<span className="text-[#FACC15]">ku</span>.
            </span>
          </div>

          <header className="mb-8">
            <h2 className="text-3xl font-black text-[#111E38] dark:text-white tracking-tight leading-tight">
              {isResetMode ? (
                tMsg("Reset Password", "Atur Ulang Sandi")
              ) : isForgotMode ? (
                tMsg("Account Recovery", "Pemulihan Akun")
              ) : isLoginMode ? (
                tMsg("Welcome Back", "Selamat Datang Kembali")
              ) : (
                tMsg("Create New Account", "Buat Akun Baru")
              )}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2 font-medium">
              {isResetMode ? (
                tMsg("Enter your new password below.", "Masukkan kata sandi baru Anda di bawah ini.")
              ) : isForgotMode ? (
                tMsg("Enter your registered email to receive a recovery link.", "Masukkan email terdaftar untuk menerima tautan pemulihan.")
              ) : isLoginMode ? (
                tMsg("Please enter your account details to access the dashboard.", "Silakan masukkan detail akun Anda untuk mengakses dashboard.")
              ) : (
                tMsg("Join thousands of professionals streamlining their workflows today.", "Bergabunglah dengan ribuan profesional lainnya.")
              )}
            </p>
          </header>

          {/* 1. RESET PASSWORD FORM */}
          {isResetMode && (
            <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-up">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200">
                  {tMsg("New Password", "Kata Sandi Baru")}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-450 hover:text-[#111E38] dark:hover:text-white"
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200">
                  {tMsg("Confirm Password", "Konfirmasi Kata Sandi")}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400">lock_reset</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-450 hover:text-[#111E38] dark:hover:text-white"
                  >
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#FACC15] hover:bg-[#EAB308] text-[#111E38] font-bold rounded-lg transition-colors border border-transparent shadow-md flex items-center justify-center gap-2"
              >
                <span>{tMsg("Save New Password", "Simpan Kata Sandi Baru")}</span>
                <span className="material-symbols-outlined text-[20px]">save</span>
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setResetToken(null);
                  }}
                  className="text-xs font-bold text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 hover:underline uppercase tracking-wider transition-colors"
                >
                  {tMsg("Back to Login", "Kembali ke Halaman Masuk")}
                </button>
              </div>
            </form>
          )}

          {/* 2. FORGOT PASSWORD FORM */}
          {isForgotMode && (
            <form onSubmit={handleForgotPassword} className="space-y-5 animate-fade-up">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200">
                  {tMsg("Email Address", "Alamat Email")}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400">mail</span>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#FACC15] hover:bg-[#EAB308] text-[#111E38] font-bold rounded-lg transition-colors border border-transparent shadow-md flex items-center justify-center gap-2"
              >
                <span>{tMsg("Send Reset Link", "Kirim Tautan Atur Ulang")}</span>
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setIsForgotMode(false)}
                  className="text-xs font-bold text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 hover:underline uppercase tracking-wider transition-colors"
                >
                  {tMsg("Back to Login", "Kembali ke Halaman Masuk")}
                </button>
              </div>
            </form>
          )}

          {/* 3. SIGN IN FORM */}
          {isLoginMode && !isForgotMode && !isResetMode && (
            <form onSubmit={handleLogin} className="space-y-5 animate-fade-up">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200">
                  {tMsg("Email or Username", "Email atau Nama Pengguna")}
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400 group-focus-within:text-[#111E38] dark:group-focus-within:text-sky-500 transition-colors">person</span>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200">
                    {tMsg("Password", "Kata Sandi")}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotMode(true)}
                    className="text-xs font-bold text-sky-500 dark:text-sky-400 hover:underline transition-colors"
                  >
                    {tMsg("Forgot Password?", "Lupa Sandi?")}
                  </button>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400 group-focus-within:text-[#111E38] dark:group-focus-within:text-sky-500 transition-colors">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-450 hover:text-[#111E38] dark:hover:text-white"
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRememberMe(checked);
                    if (checked) {
                      localStorage.setItem('alurku_remember_me', 'true');
                      sessionStorage.removeItem('alurku_remember_me');
                    } else {
                      sessionStorage.setItem('alurku_remember_me', 'false');
                      localStorage.removeItem('alurku_remember_me');
                    }
                  }}
                  className="w-5 h-5 rounded border-neutral-300 text-sky-500 focus:ring-sky-500/30 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold cursor-pointer select-none">
                  {tMsg("Remember me on this device", "Ingat saya di perangkat ini")}
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#FACC15] hover:bg-[#EAB308] text-[#111E38] font-bold rounded-lg transition-colors border border-transparent shadow-md flex items-center justify-center gap-2"
              >
                <span>{tMsg("Sign In Now", "Masuk Sekarang")}</span>
                <span className="material-symbols-outlined text-[20px]">login</span>
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-200 dark:border-neutral-800"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#f8f9ff] dark:bg-[#090D16] px-4 text-neutral-400 font-bold tracking-wider">
                    {tMsg("Or sign in with", "Atau masuk dengan")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full bg-white dark:bg-[#121B2D] text-[#111E38] dark:text-white hover:bg-sky-50/20 dark:hover:bg-sky-950/20 hover:border-sky-500 dark:hover:border-sky-500 hover:ring-2 hover:ring-sky-500/20 font-bold py-3.5 border border-neutral-300 dark:border-neutral-700 rounded-lg flex items-center justify-center gap-3 transition-all text-xs tracking-wider"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"></path>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                </svg>
                <span>Google</span>
              </button>
            </form>
          )}

          {/* 4. REGISTER / CREATE ACCOUNT FORM */}
          {!isLoginMode && !isForgotMode && !isResetMode && (
            <form onSubmit={handleRegister} className="space-y-5 animate-fade-up">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200">
                  {tMsg("Full Name", "Nama Lengkap")}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400">person</span>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder={tMsg("Enter full name", "Masukkan nama lengkap")}
                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400">alternate_email</span>
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="alurku_user"
                      className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200">
                    Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400">mail</span>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200">
                    {tMsg("Password", "Kata Sandi")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400">lock</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-405 hover:text-[#111E38] dark:hover:text-white"
                    >
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#111E38] dark:text-neutral-200">
                    {tMsg("Confirm Password", "Konfirmasi Sandi")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400">lock_reset</span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 text-[#111E38] dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-405 hover:text-[#111E38] dark:hover:text-white"
                    >
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Encryption Disclaimer Box */}
              <div className="flex items-start gap-2.5 mt-2 bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5 rounded-lg border border-emerald-500/20">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-base shrink-0 mt-0.5">verified</span>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  {tMsg(
                    "Passwords are mathematically one-way encrypted. System admins cannot view or retrieve your password.",
                    "Kata sandi dienkripsi satu arah secara matematis. Admin sistem tidak dapat melihat atau memulihkan sandi Anda."
                  )}
                </p>
              </div>

              {/* Agreement checkbox */}
              <div className="flex items-start gap-3 mt-4">
                <input
                  type="checkbox"
                  id="reg-agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-neutral-300 text-[#111E38] dark:text-[#FACC15] focus:ring-[#111E38]/30 cursor-pointer shrink-0"
                />
                <label htmlFor="reg-agree" className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold leading-relaxed cursor-pointer select-none">
                  {isIndo ? (
                    <>
                      Saya setuju dengan{' '}
                      <button
                        type="button"
                        onClick={() => setIsTermsOpen?.(true)}
                        className="text-[#111E38] dark:text-[#FACC15] font-extrabold hover:underline"
                      >
                        Syarat Layanan
                      </button>{' '}
                      dan{' '}
                      <button
                        type="button"
                        onClick={() => setIsPrivacyOpen?.(true)}
                        className="text-[#111E38] dark:text-[#FACC15] font-extrabold hover:underline"
                      >
                        Kebijakan Privasi
                      </button>{' '}
                      alurku.
                    </>
                  ) : (
                    <>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setIsTermsOpen?.(true)}
                        className="text-[#111E38] dark:text-[#FACC15] font-extrabold hover:underline"
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={() => setIsPrivacyOpen?.(true)}
                        className="text-[#111E38] dark:text-[#FACC15] font-extrabold hover:underline"
                      >
                        Privacy Policy
                      </button>{' '}
                      of alurku.
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={!agreed}
                className="w-full py-4 bg-[#FACC15] hover:bg-[#EAB308] text-[#111E38] disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 group shadow-yellow-500/10"
              >
                <span>{tMsg("Create Account", "Buat Akun")}</span>
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-200 dark:border-neutral-800"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#f8f9ff] dark:bg-[#090D16] px-4 text-neutral-400 font-bold tracking-wider">
                    {tMsg("Or register with", "Atau daftar dengan")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1">
                <button
                  type="button"
                  disabled={!agreed}
                  onClick={() => loginWithGoogle()}
                  className="flex items-center justify-center gap-3 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-sky-50/20 dark:hover:bg-sky-950/20 hover:border-sky-500 dark:hover:border-sky-500 hover:ring-2 hover:ring-sky-500/20 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-[#121B2D] text-[#111E38] dark:text-white text-xs tracking-wider"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"></path>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                  </svg>
                  <span>Google</span>
                </button>
              </div>
            </form>
          )}

          {/* Mode Switch footer text */}
          {!isResetMode && !isForgotMode && (
            <p className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold">
              {isLoginMode ? (
                <>
                  {tMsg("Don't have access?", "Belum punya akses?")}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(false);
                      setLoginUsername('');
                      setLoginPassword('');
                    }}
                    className="font-extrabold text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-350 hover:underline"
                  >
                    {tMsg("Register Now", "Daftar Baru")}
                  </button>
                </>
              ) : (
                <>
                  {tMsg("Already have an account?", "Sudah punya akun?")}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(true);
                      setLoginUsername('');
                      setLoginPassword('');
                      setRegConfirmPassword('');
                    }}
                    className="font-extrabold text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-350 hover:underline"
                  >
                    {tMsg("Sign In", "Masuk")}
                  </button>
                </>
              )}
            </p>
          )}
        </div>

        {/* Global Footer Links */}
        <footer className="mt-8 pt-8 flex flex-wrap justify-center gap-6 text-neutral-400 dark:text-neutral-500 font-bold text-xs border-t border-neutral-200 dark:border-neutral-800/80">
          <button onClick={() => setIsPrivacyOpen?.(true)} className="hover:text-sky-500 dark:hover:text-white transition-colors">{tMsg("Privacy Policy", "Kebijakan Privasi")}</button>
          <button onClick={() => setIsTermsOpen?.(true)} className="hover:text-sky-500 dark:hover:text-white transition-colors">{tMsg("Terms of Service", "Ketentuan Layanan")}</button>
          <a href="/panduan" className="hover:text-sky-500 dark:hover:text-white transition-colors">{tMsg("Help", "Bantuan")}</a>
          <span className="ml-auto font-medium">&copy; 2026 alurku.</span>
        </footer>
      </section>
    </div>
  );
}
