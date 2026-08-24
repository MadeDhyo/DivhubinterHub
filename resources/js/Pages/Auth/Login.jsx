import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);

    const hasErrors = Object.keys(errors).length > 0;

    const submit = (e) => {
        e.preventDefault();
        setLoginSuccess(true);

        setTimeout(() => {
            post(route('login'), {
                onError: () => {
                    setLoginSuccess(false);
                },
                onFinish: () => reset('password'),
            });
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#001b3d] flex flex-col items-center justify-center p-4 font-sans text-white relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/images/login_bg.jpg')" }}>
            <div className="absolute inset-0 bg-[#001b3d]/45 z-0" />

            <Head title="Log in" />

            {/* Success Modal */}
            {loginSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-success-backdrop" style={{ backgroundColor: 'rgba(0,10,30,0.82)' }}>
                    <div className="animate-success-modal animate-success-glow relative bg-gradient-to-b from-[#04244d] to-[#021633] border border-emerald-500/30 rounded-3xl p-10 max-w-xs w-full text-center overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

                        <div className="relative flex items-center justify-center mx-auto mb-7" style={{ width: 80, height: 80 }}>
                            <span className="animate-ripple absolute inset-0 rounded-full border border-emerald-400/30" />
                            <span className="absolute inset-0 rounded-full border border-emerald-500/15" />
                            <span className="animate-check-ring absolute inset-2 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center">
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                                    <path className="animate-check-draw" d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white tracking-wide">Autentikasi Berhasil</h3>
                        <p className="text-xs text-gray-400 mt-1.5 font-medium">
                            Mengalihkan ke <span className="text-[#d4af37]">Pusat Komando</span>...
                        </p>

                        <div className="my-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <div className="flex items-center justify-center gap-2">
                            <span className="h-3.5 w-3.5 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">Menghubungkan</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Card */}
            <div className={`w-full max-w-[450px] bg-[#031433]/85 border border-white/10 shadow-2xl rounded-2xl p-8 backdrop-blur-md relative z-10 overflow-hidden border-t-4 transition-all duration-300 ${
                hasErrors
                    ? 'animate-shake border-t-red-500/80'
                    : loginSuccess
                    ? 'border-t-emerald-500/70'
                    : 'border-t-[#d4af37] animate-fade-in-up'
            }`}>

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="/images/logo.png"
                        alt="Logo DivHubInter"
                        className="h-24 w-auto object-contain mb-3 animate-float drop-shadow-[0_4px_16px_rgba(212,175,55,0.15)] transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11c0-3.517 1.009-6.799 2.753-9.571m-3.44 2.04A13.916 13.916 0 009 11c0 3.517 1.009 6.799 2.753 9.571m3 0c1.744-2.772 2.753-6.054 2.753-9.571m-3 0c-1.744 2.772-2.753 6.054-2.753 9.571'/%3E%3C/svg%3E";
                        }}
                    />
                    <h1 className="text-lg font-black tracking-wider text-white">DIVHUBINTER POLRI</h1>
                    <p className="text-[11px] font-semibold text-[#d4af37]/80 tracking-[0.2em] mt-0.5">NCB INTERPOL INDONESIA</p>
                </div>

                {/* Status alert */}
                {status && (
                    <div className="mb-5 px-3.5 py-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20 text-xs font-semibold text-emerald-400/90 animate-slide-down flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                        {status}
                    </div>
                )}

                {/* Error alert */}
                {hasErrors && !loginSuccess && (
                    <div className="mb-5 px-3.5 py-2.5 rounded-lg bg-red-500/8 border border-red-500/20 text-xs font-semibold text-red-400/90 animate-slide-down flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0 animate-pulse" />
                        Otentikasi gagal. Periksa kembali kredensial Anda.
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    {/* EMAIL */}
                    <div className="animate-stagger-1">
                        <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                            Email / Username
                        </label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#d4af37] transition-colors duration-200">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </span>
                            {/* animated left accent bar */}
                            <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-[#d4af37] scale-y-0 origin-center group-focus-within:scale-y-100 transition-transform duration-200" />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder="Masukkan kredensial anda"
                                className="w-full bg-white/[0.04] border border-white/8 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/[0.06] transition-all duration-200"
                                autoComplete="username"
                                required
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1.5 text-xs text-red-400/80 animate-slide-down" />
                    </div>

                    {/* PASSWORD */}
                    <div className="animate-stagger-2">
                        <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                            Password
                        </label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#d4af37] transition-colors duration-200">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-[#d4af37] scale-y-0 origin-center group-focus-within:scale-y-100 transition-transform duration-200" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                placeholder="••••••••"
                                className="w-full bg-white/[0.04] border border-white/8 rounded-lg pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/[0.06] transition-all duration-200"
                                autoComplete="current-password"
                                required
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors duration-150 active:scale-90"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1.5 text-xs text-red-400/80 animate-slide-down" />
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between animate-stagger-3">
                        <label className="flex items-center select-none cursor-pointer group">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded bg-transparent border-white/20 text-[#d4af37] focus:ring-0 focus:ring-offset-0 transition cursor-pointer"
                            />
                            <span className="ms-2 text-xs text-gray-500 group-hover:text-gray-300 transition-colors duration-150">
                                Ingat Saya
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-gray-500 hover:text-[#d4af37] transition-colors duration-150"
                            >
                                Lupa Password?
                            </Link>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="animate-stagger-4">
                        <button
                            type="submit"
                            className={`w-full font-bold py-3.5 px-4 rounded-lg text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                                loginSuccess
                                    ? 'bg-emerald-500/90 text-white'
                                    : 'animate-btn-shimmer bg-[#d4af37] hover:bg-[#c9a832] active:scale-[0.98] text-[#001b3d]'
                            }`}
                            disabled={processing || loginSuccess}
                        >
                            {loginSuccess ? (
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>BERHASIL MASUK</span>
                                </>
                            ) : processing ? (
                                <>
                                    <span className="inline-block h-4 w-4 border-2 border-[#001b3d] border-t-transparent rounded-full animate-spin" />
                                    <span>MENGOTENTIKASI SESI...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>MASUK KE DASHBOARD</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-7 pt-4 border-t border-white/[0.07] text-center">
                    <p className="text-[10px] text-gray-600 leading-relaxed">
                        Sistem ini dilindungi dan dienkripsi.<br />Akses tidak sah dilarang keras.
                    </p>
                </div>
            </div>
        </div>
    );
}
