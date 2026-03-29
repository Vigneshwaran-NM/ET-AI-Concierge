import { useState, useEffect } from 'react';
import { X, TrendingUp, Briefcase, AlertTriangle, PlusCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api';

const typeColors = {
  'Equity': 'bg-red-600',
  'Mutual Fund': 'bg-orange-500',
  'Gold': 'bg-yellow-500',
  'FD': 'bg-green-600',
  'Crypto': 'bg-purple-500',
  'Other': 'bg-gray-400',
};

export default function RightPanel({ isOpen, closePanel, token, userProfile }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', type: 'Equity', value: '' });

  // Load portfolio from API when panel opens
  useEffect(() => {
    if (!isOpen || !token) return;
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/portfolio`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPortfolio(data);
      } catch (err) {
        console.error('Failed to load portfolio:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [isOpen, token]);

  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.value) return;
    try {
      const res = await fetch(`${API_BASE}/portfolio/add`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAsset, value: parseFloat(newAsset.value) }),
      });
      const data = await res.json();
      setPortfolio(data.portfolio);
      setNewAsset({ name: '', type: 'Equity', value: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add asset:', err.message);
    }
  };

  const handleRemoveAsset = async (assetId) => {
    try {
      const res = await fetch(`${API_BASE}/portfolio/remove/${assetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPortfolio(data.portfolio);
    } catch (err) {
      console.error('Failed to remove asset:', err.message);
    }
  };

  const riskPct = `${(userProfile?.riskScore || 5) * 10}%`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="h-full bg-[var(--sidebar-bg)] border-l border-[var(--border-color)] flex flex-col overflow-y-auto shrink-0 shadow-lg absolute right-0 z-30 md:relative"
        >
          <div className="p-4 flex items-center justify-between border-b border-[var(--border-color)] sticky top-0 bg-[var(--sidebar-bg)] z-10">
            <h2 className="font-serif-et text-lg font-bold text-[var(--text-color)]">Portfolio Dashboard</h2>
            <button onClick={closePanel} className="p-1 rounded-sm text-gray-400 hover:text-[var(--text-color)] hover:bg-[var(--hover-bg)] transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-5">

            {/* Life Stage */}
            <div className="border border-[var(--border-color)] p-4 bg-[var(--hover-bg)] rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={16} className="text-[#d1131a]" />
                <h3 className="font-bold text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Life Stage</h3>
              </div>
              <p className="font-serif-et text-xl font-bold text-[var(--text-color)]">{userProfile?.lifeStage || 'Early Career'}</p>
            </div>

            {/* Risk Profile */}
            <div className="border border-[var(--border-color)] p-4 bg-[var(--card-bg)] rounded-sm shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-[#d1131a]" />
                <h3 className="font-bold text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Risk Profile</h3>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-[12px] font-bold text-[var(--text-color)]">{userProfile?.riskScore || 5}/10</span>
                <span className="text-[11px] font-bold text-[#d1131a]">{(userProfile?.riskLabel || 'MODERATE').toUpperCase()}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: riskPct }} transition={{ duration: 1 }} className="bg-[#d1131a] h-full" />
              </div>
            </div>

            {/* Portfolio Investments */}
            <div className="border border-[var(--border-color)] p-4 bg-[var(--card-bg)] rounded-sm shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-[var(--border-color)] pb-2">
                <h3 className="font-bold text-[13px] text-[var(--text-color)] uppercase tracking-wide">Investments</h3>
                <span className="text-[12px] font-bold text-green-600">
                  ₹{portfolio ? (portfolio.totalValue / 100000).toFixed(1) : '0.0'}L
                </span>
              </div>

              {loading ? (
                <p className="text-[12px] text-gray-400 text-center py-2">Loading...</p>
              ) : portfolio?.investments?.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {portfolio.investments.map((inv) => (
                    <div key={inv._id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${typeColors[inv.type] || 'bg-gray-400'}`} />
                        <div>
                          <p className="text-[12px] font-bold text-[var(--text-color)]">{inv.name}</p>
                          <p className="text-[10px] text-gray-400">{inv.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-[var(--text-color)]">₹{inv.value.toLocaleString('en-IN')}</span>
                        <button
                          onClick={() => handleRemoveAsset(inv._id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-gray-400 text-center py-2">No investments yet. Add one below!</p>
              )}

              {/* Add Investment Form */}
              {showAddForm ? (
                <form onSubmit={handleAddAsset} className="mt-3 space-y-2 border-t border-[var(--border-color)] pt-3">
                  <input
                    type="text" placeholder="Asset name (e.g. Reliance)" value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="w-full border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] rounded px-2 py-1 text-[12px] focus:outline-none focus:border-[#d1131a]"
                  />
                  <select
                    value={newAsset.type} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                    className="w-full border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] rounded px-2 py-1 text-[12px] focus:outline-none focus:border-[#d1131a]"
                  >
                    {['Equity', 'Mutual Fund', 'Gold', 'FD', 'Crypto', 'Other'].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    type="number" placeholder="Value in ₹" value={newAsset.value}
                    onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                    className="w-full border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] rounded px-2 py-1 text-[12px] focus:outline-none focus:border-[#d1131a]"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-[#d1131a] text-white text-[11px] font-bold py-1 rounded hover:bg-red-700 transition-colors">Add</button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 border border-[var(--border-color)] text-[11px] py-1 rounded text-gray-500 dark:text-gray-400 hover:bg-[var(--hover-bg)] transition-colors">Cancel</button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 w-full flex items-center justify-center gap-1 text-[11px] text-[#d1131a] font-bold border border-dashed border-[#d1131a] py-1.5 rounded hover:bg-[#fdf2f2] transition-colors"
                >
                  <PlusCircle size={12} /> Add Investment
                </button>
              )}
            </div>

            {/* ET Suggestions — dynamic based on real portfolio + risk profile */}
            {(() => {
              const investments = portfolio?.investments || [];
              const total = portfolio?.totalValue || 0;
              const risk = userProfile?.riskScore || 5;
              const lifeStage = userProfile?.lifeStage || 'Early Career';
              const types = [...new Set(investments.map(i => i.type))];

              const suggestions = [];

              // No investments at all
              if (investments.length === 0) {
                suggestions.push('Add your first investment below to start tracking your portfolio.');
                suggestions.push(`Based on your **${lifeStage}** stage, consider starting with index funds or blue-chip equities.`);
              } else {
                // Only one asset type — not diversified
                if (types.length === 1) {
                  suggestions.push(`Your entire portfolio is in **${types[0]}**. Consider diversifying across Equity, Mutual Funds, and Gold.`);
                }
                // High risk + no equity
                if (risk >= 7 && !types.includes('Equity')) {
                  suggestions.push('Your risk profile is **Aggressive** — adding direct equity could amplify growth.');
                }
                // Low risk + no FD/Gold
                if (risk <= 3 && !types.includes('FD') && !types.includes('Gold')) {
                  suggestions.push('Your **Conservative** risk profile suggests adding FDs or Gold for stability.');
                }
                // Large portfolio — suggest review
                if (total >= 500000) {
                  suggestions.push(`Your portfolio is ₹${(total / 100000).toFixed(1)}L — ask AI: *"Is my asset allocation optimal for ${lifeStage}?"*`);
                }
                // Generic prompt
                suggestions.push(`Ask ET AI: *"Should I rebalance my ${lifeStage.toLowerCase()} portfolio right now?"*`);
              }

              return (
                <div className="border-2 border-[#d1131a] p-4 bg-[var(--msg-user-bg)] rounded-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-[#d1131a]" />
                    <h3 className="font-bold text-[12px] text-[#d1131a] uppercase tracking-wider">ET AI Suggestions</h3>
                  </div>
                  <ul className="space-y-3 text-[13px] text-[var(--text-color)] leading-snug">
                    {suggestions.slice(0, 3).map((s, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#d1131a] mt-1.5 shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>') }} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
