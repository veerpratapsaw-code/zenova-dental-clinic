import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, Zap, AlertTriangle } from 'lucide-react';

export type PriorityTier = 'standard' | 'priority' | 'emergency';

interface PriorityUpgradeProps {
  selectedTier: PriorityTier;
  onSelectTier: (tier: PriorityTier) => void;
}

export default function PriorityUpgrade({ selectedTier, onSelectTier }: PriorityUpgradeProps) {
  const [queueStatus, setQueueStatus] = useState({ standard: 0, priority: 0 });
  const [settings, setSettings] = useState({ priorityPrice: 1000, emergencyPrice: 3500 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/appointments/queue-status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQueueStatus({
            standard: data.data.standardCount,
            priority: data.data.priorityCount
          });
        }
      })
      .catch(console.error);

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Calculate dynamic wait times
  // Assume each standard appointment takes ~45 mins. 
  // Wait time in days: standard / 8 per day (roughly)
  const standardWaitDays = Math.max(1, Math.ceil(queueStatus.standard / 8));
  
  return (
    <div className="w-full mt-6 mb-8">
      <h3 className="text-xl font-medium text-white mb-1">Select Priority Tier</h3>
      <p className="text-sm text-slate-400 mb-6">Live Queue: {queueStatus.standard} standard, {queueStatus.priority} priority waiting.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Standard Tier */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectTier('standard')}
          className={`relative p-5 rounded-xl border cursor-pointer transition-all ${
            selectedTier === 'standard' 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : 'border-white/10 bg-black/40 hover:border-white/20'
          }`}
        >
          {selectedTier === 'standard' && (
            <div className="absolute top-4 right-4 text-indigo-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <Clock className={`w-8 h-8 mb-4 ${selectedTier === 'standard' ? 'text-indigo-400' : 'text-slate-500'}`} />
          <h4 className="text-lg font-bold text-white mb-1">Standard</h4>
          <p className="text-2xl font-light text-slate-300 mb-2">Free</p>
          <div className="h-[1px] w-full bg-white/10 mb-4" />
          <ul className="space-y-2 text-sm text-slate-400">
            <li>• Join standard queue</li>
            <li>• Est. Wait: ~{standardWaitDays} {standardWaitDays === 1 ? 'Day' : 'Days'}</li>
            <li>• Regular updates</li>
          </ul>
        </motion.div>

        {/* Priority Tier */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectTier('priority')}
          className={`relative p-5 rounded-xl border cursor-pointer transition-all ${
            selectedTier === 'priority' 
              ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
              : 'border-purple-500/30 bg-black/40 hover:border-purple-500/50'
          }`}
        >
          {selectedTier === 'priority' && (
            <div className="absolute top-4 right-4 text-purple-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-lg">
            Recommended
          </div>
          <Zap className={`w-8 h-8 mb-4 ${selectedTier === 'priority' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'text-purple-500/70'}`} />
          <h4 className="text-lg font-bold text-white mb-1">Priority Skip</h4>
          <p className="text-2xl font-light text-purple-300 mb-2">+₹{settings.priorityPrice}</p>
          <div className="h-[1px] w-full bg-white/10 mb-4" />
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="text-purple-300 font-medium">• Skip standard queue</li>
            <li>• Est. Wait: Next Available</li>
            <li>• VIP Reception</li>
          </ul>
        </motion.div>

        {/* Emergency Tier */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectTier('emergency')}
          className={`relative p-5 rounded-xl border cursor-pointer transition-all ${
            selectedTier === 'emergency' 
              ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
              : 'border-red-500/20 bg-black/40 hover:border-red-500/40'
          }`}
        >
          {selectedTier === 'emergency' && (
            <div className="absolute top-4 right-4 text-red-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <AlertTriangle className={`w-8 h-8 mb-4 ${selectedTier === 'emergency' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-red-500/60'}`} />
          <h4 className="text-lg font-bold text-white mb-1">Emergency</h4>
          <p className="text-2xl font-light text-red-300 mb-2">+₹{settings.emergencyPrice}</p>
          <div className="h-[1px] w-full bg-white/10 mb-4" />
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="text-red-300 font-medium">• Immediate Attention</li>
            <li>• Bypasses all queues</li>
            <li>• Walk-in accepted</li>
          </ul>
        </motion.div>

      </div>
      <p className="text-xs text-center text-slate-500 mt-4">
        * Priority fees are collected in-person upon arrival at the clinic.
      </p>
    </div>
  );
}
