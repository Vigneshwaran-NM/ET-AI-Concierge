import { useState } from 'react';
import { Eye, EyeOff, TrendingUp, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const LIFE_STAGES = ['Student', 'Early Career', 'Mid Career', 'Pre-Retirement', 'Retired'];

export default function AuthPage({ onLoginSuccess }) {
    const [tab, setTab] = useState('login'); // 'login' | 'register'
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Login form state
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });

    // Register form state
    const [regForm, setRegForm] = useState({
        name: '',
        email: '',
        password: '',
        lifeStage: 'Early Career',
        riskScore: 5,
    });

    const riskLabel = (score) => {
        if (score <= 3) return 'Conservative';
        if (score <= 6) return 'Moderate';
        return 'Aggressive';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            localStorage.setItem('et_token', data.token);
            onLoginSuccess(data.token, data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const payload = {
                ...regForm,
                riskLabel: riskLabel(regForm.riskScore),
            };
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            localStorage.setItem('et_token', data.token);
            onLoginSuccess(data.token, data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        { icon: <TrendingUp size={20} />, text: 'Real-time market data via Tavily' },
        { icon: <Shield size={20} />, text: 'Personalised advice for your risk profile' },
        { icon: <Zap size={20} />, text: 'AI-powered portfolio analysis (PDF upload)' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-color)] flex transition-colors duration-300">
            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] flex-col justify-between p-12">
                <div>
                    <div className="flex items-center gap-3 mb-12">
                        <div className="bg-[var(--primary-red)] text-white text-[22px] font-bold px-2 py-1 leading-none tracking-tighter shadow">ET</div>
                        <span className="font-serif-et font-bold text-2xl text-[var(--text-color)]">AI Concierge</span>
                    </div>
                    <h2 className="font-serif-et text-4xl font-bold text-[var(--text-color)] leading-tight mb-4">
                        Your Intelligent<br />Financial Partner
                    </h2>
                    <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm">
                        Powered by Economic Times data, real-time search, and advanced AI to give you edge in every financial decision.
                    </p>
                    <div className="mt-10 space-y-4">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 text-[var(--text-color)]">
                                <div className="text-[var(--primary-red)]">{f.icon}</div>
                                <span className="text-[14px] font-medium">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">
                    © 2025 The Economic Times · AI Financial Companion
                </p>
            </div>

            {/* Right panel — auth form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="bg-[var(--primary-red)] text-white text-[18px] font-bold px-2 py-1 leading-none tracking-tighter">ET</div>
                        <span className="font-serif-et font-bold text-xl text-[var(--text-color)]">AI Concierge</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-[var(--hover-bg)] p-1 rounded-sm mb-6 border border-[var(--border-color)]">
                        {['login', 'register'].map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setError(''); }}
                                className={cn(
                                    'flex-1 py-2 text-sm font-bold rounded-sm transition-all capitalize',
                                    tab === t
                                        ? 'bg-[var(--primary-red)] text-white shadow'
                                        : 'text-gray-500 hover:text-[var(--text-color)]'
                                )}
                            >
                                {t === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {tab === 'login' ? (
                            <motion.form
                                key="login"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onSubmit={handleLogin}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={loginForm.email}
                                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                        placeholder="you@example.com"
                                        className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-sm px-4 py-3 text-[var(--text-color)] text-[15px] outline-none focus:border-[var(--primary-red)] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={loginForm.password}
                                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-sm px-4 py-3 text-[var(--text-color)] text-[15px] outline-none focus:border-[var(--primary-red)] transition-colors pr-11"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[var(--primary-red)] text-white py-3 rounded-sm font-bold text-[14px] hover:bg-red-800 transition-colors disabled:opacity-60 mt-2"
                                >
                                    {isLoading ? 'Signing in...' : 'Sign In →'}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="register"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onSubmit={handleRegister}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Full Name</label>
                                    <input type="text" required value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} placeholder="Virat Kohli" className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-sm px-4 py-3 text-[var(--text-color)] text-[15px] outline-none focus:border-[var(--primary-red)] transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Email</label>
                                    <input type="email" required value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} placeholder="you@example.com" className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-sm px-4 py-3 text-[var(--text-color)] text-[15px] outline-none focus:border-[var(--primary-red)] transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Password</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} required value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} placeholder="Min. 6 characters" className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-sm px-4 py-3 text-[var(--text-color)] text-[15px] outline-none focus:border-[var(--primary-red)] transition-colors pr-11" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Life Stage */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Life Stage</label>
                                    <select value={regForm.lifeStage} onChange={(e) => setRegForm({ ...regForm, lifeStage: e.target.value })} className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-sm px-4 py-3 text-[var(--text-color)] text-[15px] outline-none focus:border-[var(--primary-red)] transition-colors">
                                        {LIFE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                {/* Risk Tolerance */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Risk Tolerance</label>
                                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-sm',
                                            regForm.riskScore <= 3 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                regForm.riskScore <= 6 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-red-100 text-[var(--primary-red)] dark:bg-red-900/30'
                                        )}>
                                            {riskLabel(regForm.riskScore)} ({regForm.riskScore}/10)
                                        </span>
                                    </div>
                                    <input type="range" min="1" max="10" value={regForm.riskScore} onChange={(e) => setRegForm({ ...regForm, riskScore: Number(e.target.value) })} className="w-full accent-[var(--primary-red)]" />
                                    <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-semibold">
                                        <span>Safe</span><span>Balanced</span><span>Aggressive</span>
                                    </div>
                                </div>

                                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                                <button type="submit" disabled={isLoading} className="w-full bg-[var(--primary-red)] text-white py-3 rounded-sm font-bold text-[14px] hover:bg-red-800 transition-colors disabled:opacity-60 mt-2">
                                    {isLoading ? 'Creating account...' : 'Create Account →'}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <p className="text-center text-[11px] text-gray-400 mt-6">
                        {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }} className="text-[var(--primary-red)] font-bold underline underline-offset-2">
                            {tab === 'login' ? 'Create one' : 'Sign in'}
                        </button>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
