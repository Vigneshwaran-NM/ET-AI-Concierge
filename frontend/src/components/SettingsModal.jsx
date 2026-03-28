import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const LIFE_STAGES = ['Student', 'Early Career', 'Mid Career', 'Pre-Retirement', 'Retired'];

const riskLabel = (score) => {
    if (score <= 3) return 'Conservative';
    if (score <= 6) return 'Moderate';
    return 'Aggressive';
};

export default function SettingsModal({ isOpen, onClose, currentUser, token, onProfileUpdated }) {
    const [lifeStage, setLifeStage] = useState('Early Career');
    const [riskScore, setRiskScore] = useState(5);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    // Sync form with current user when modal opens
    useEffect(() => {
        if (isOpen && currentUser) {
            setLifeStage(currentUser.lifeStage || 'Early Career');
            setRiskScore(currentUser.riskScore ?? 5);
            setSaveMsg('');
        }
    }, [isOpen, currentUser]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMsg('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ lifeStage, riskScore, riskLabel: riskLabel(riskScore) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setSaveMsg('✅ Profile updated! AI will use this from your next question.');
            onProfileUpdated(data.user); // bubble updated user up to App.jsx
            setTimeout(onClose, 1800);
        } catch (err) {
            setSaveMsg(`❌ ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const riskColor = riskScore <= 3
        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        : riskScore <= 6
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-red-100 text-[var(--primary-red)] dark:bg-red-900/30';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[var(--card-bg)] rounded-xl w-full max-w-md shadow-2xl border border-[var(--border-color)]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
                            <div>
                                <h2 className="font-serif-et font-bold text-lg text-[var(--text-color)]">Investment Profile</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Personalise how ET AI advises you</p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-[var(--text-color)] transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-6">
                            {/* User info (read-only) */}
                            {currentUser && (
                                <div className="bg-[var(--hover-bg)] rounded-sm p-3 border border-[var(--border-color)]">
                                    <div className="text-sm font-bold text-[var(--text-color)]">{currentUser.name}</div>
                                    <div className="text-xs text-gray-500">{currentUser.email}</div>
                                </div>
                            )}

                            {/* Life Stage */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Life Stage</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {LIFE_STAGES.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setLifeStage(s)}
                                            className={cn(
                                                'py-2 px-3 rounded-sm text-sm font-semibold border transition-all text-left',
                                                lifeStage === s
                                                    ? 'border-[var(--primary-red)] bg-red-50 dark:bg-red-900/20 text-[var(--primary-red)]'
                                                    : 'border-[var(--border-color)] text-gray-500 hover:border-gray-400'
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Risk Tolerance */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Risk Tolerance</label>
                                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-sm', riskColor)}>
                                        {riskLabel(riskScore)} ({riskScore}/10)
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={riskScore}
                                    onChange={(e) => setRiskScore(Number(e.target.value))}
                                    className="w-full accent-[var(--primary-red)]"
                                />
                                <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-semibold">
                                    <span>Conservative</span>
                                    <span>Moderate</span>
                                    <span>Aggressive</span>
                                </div>
                            </div>

                            {saveMsg && (
                                <p className={cn('text-sm font-medium', saveMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500')}>
                                    {saveMsg}
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-[var(--border-color)] flex justify-end gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-[var(--text-color)] transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-5 py-2 bg-[var(--primary-red)] text-white rounded-sm font-bold text-sm hover:bg-red-800 transition-colors disabled:opacity-60"
                            >
                                <Save size={15} />
                                {isSaving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
