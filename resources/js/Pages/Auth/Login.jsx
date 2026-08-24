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

        post(route('login'), {
            onSuccess: () => {
                setLoginSuccess(true);
            },
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#001b3d] flex flex-col items-center justify-center p-4 font-sans text-white relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/images/login_bg.jpg')" }}>
            {/* Subtle dark overlay for dashboard integration */}
            <div className="absolute inset-0 bg-[#001b3d]/45 z-0" />

            <Head title="Log in" />

            <div className={`w-full max-w-[450px] bg-[#031433]/85 border border-white/10 shadow-2xl rounded-2xl p-8 backdrop-blur-md relative z-10 overflow-hidden border-t-4 border-t-[#d4af37] transition-all duration-300 ${
                hasErrors ? 'animate-shake border-t-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)]' :
                loginSuccess ? 'border-t-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.35)]' : 'animate-fade-in-up'
            }`}>

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="/images/logo.png"
                        alt="Logo DivHubInter"
                        className="h-28 w-auto object-contain mb-3 drop-shadow-[0_4px_12px_rgba(212,175,55,0.2)] transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11c0-3.517 1.009-6.799 2.753-9.571m-3.44 2.04A13.916 13.916 0 009 11c0 3.517 1.009 6.799 2.753 9.571m3 0c1.744-2.772 2.753-6.054 2.753-9.571m-3 0c-1.744 2.772-2.753 6.054-2.753 9.571'/%3E%3C/svg%3E";
                        }}
                    />
                    <h1 className="text-lg font-black tracking-wider text-white">DIVHUBINTER POLRI</h1>
                    <p className="text-xs font-bold text-[#d4af37] tracking-widest mt-0.5">NCB INTERPOL INDONESIA</p>
                </div>

                {/* Login Success Alert Banner */}
                {loginSuccess && (
                    <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-bold text-emerald-300 text-center animate-slide-down flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 0118 0z" />
                        </svg>
                        <span>Otentikasi Berhasil! Mengalihkan ke Pusat Komando...</span>
                    </div>
                )}

                {status && (
                    <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 text-center animate-slide-down flex items-center justify-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 0118 0z" />
                        </svg>
                        {status}
                    </div>
                )}

                {hasErrors && !loginSuccess && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400 text-center animate-slide-down flex items-center justify-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 0118 0z" />
                        </svg>
                        Otentikasi gagal. Periksa kembali email & password Anda.
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* EMAIL Field */}
                    <div>
                        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Email / Username
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </span>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder="Masukkan kredensial anda"
                                className="w-full bg-[#001b3d]/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:scale-[1.01] transition-all duration-200"
                                autoComplete="username"
                                required
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.email} className="mt-2 text-xs text-red-400 animate-slide-down" />
                    </div>

                    {/* PASSWORD Field */}
                    <div>
                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                placeholder="••••••••"
                                className="w-full bg-[#001b3d]/50 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:scale-[1.01] transition-all duration-200"
                                autoComplete="current-password"
                                required
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-transform duration-200 active:scale-95"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-2 text-xs text-red-400 animate-slide-down" />
                    </div>

                    {/* Remember me & Forgot Password */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center select-none cursor-pointer group">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded bg-[#001b3d] border-white/20 text-[#d4af37] focus:ring-0 focus:ring-offset-0 transition cursor-pointer"
                            />
                            <span className="ms-2 text-xs font-semibold text-gray-300 group-hover:text-white transition">
                                Ingat Saya
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-[#d4af37] hover:text-[#b5952f] transition hover:underline"
                            >
                                Lupa Password?
                            </Link>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`w-full font-bold py-3.5 px-4 rounded-lg text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-85 disabled:cursor-not-allowed ${
                            loginSuccess
                                ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                                : 'bg-[#d4af37] hover:bg-[#b5952f] active:bg-[#9c7f23] text-[#001b3d] hover:shadow-[0_0_20px_rgba(212,175,55,0.35)]'
                        }`}
                        disabled={processing || loginSuccess}
                    >
                        {loginSuccess ? (
                            <>
                                <svg className="h-4 w-4 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                </form>

                {/* Footer Message */}
                <div className="mt-8 pt-4 border-t border-white/10 text-center">
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                        Sistem ini dilindungi dan dienkripsi.<br />Akses tidak sah dilarang keras.
                    </p>
                </div>
            </div>
        </div>
    );
}
