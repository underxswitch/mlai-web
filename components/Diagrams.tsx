
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Activity, Cpu, BarChart2 } from 'lucide-react';

// --- SURFACE CODE DIAGRAM ---
export const SurfaceCodeDiagram: React.FC = () => {
  // 5x5 grid of data qubits for a more realistic distance-3 surface code
  const [errors, setErrors] = useState<number[]>([]);
  const [hoveredQubit, setHoveredQubit] = useState<number | null>(null);
  const [hoveredStab, setHoveredStab] = useState<number | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [syndromeHistory, setSyndromeHistory] = useState<{timestamp: number, type: string, count: number}[]>([]);
  
  const toggleError = (id: number) => {
    if (isDecoding) return;
    setErrors(prev => {
      const isAdding = !prev.includes(id);
      const nextErrors = isAdding ? [...prev, id] : prev.filter(e => e !== id);
      
      // Track history of syndrome weight changes
      const activeStabs = stabilizers.filter(s => {
        const errorCount = s.neighbors.filter(nId => nextErrors.includes(nId)).length;
        return errorCount % 2 !== 0;
      }).length;
      
      setSyndromeHistory(h => [{ timestamp: Date.now(), type: isAdding ? 'ERROR_INJECTED' : 'ERROR_REMOVED', count: activeStabs }, ...h].slice(0, 5));
      
      return nextErrors;
    });
  };

  const addRandomError = () => {
    if (isDecoding) return;
    const available = dataQubits.filter(q => !errors.includes(q.id));
    if (available.length === 0) return;
    const randomQ = available[Math.floor(Math.random() * available.length)];
    toggleError(randomQ.id);
  };

  const runDecoder = () => {
    if (errors.length === 0 || isDecoding) return;
    setIsDecoding(true);
    
    // Simulate AlphaQubit's neural decoding process
    setTimeout(() => {
      setShowCorrection(true);
      setTimeout(() => {
        setErrors([]);
        setIsDecoding(false);
        setShowCorrection(false);
      }, 1000);
    }, 1500);
  };

  // Simplified adjacency for visualization
  const stabilizers = [
    { id: 0, x: 25, y: 0, type: 'Z', color: 'bg-blue-500', neighbors: [0, 1] },
    { id: 1, x: 75, y: 0, type: 'Z', color: 'bg-blue-500', neighbors: [1, 2] },
    { id: 2, x: 0, y: 25, type: 'X', color: 'bg-red-500', neighbors: [0, 3, 5] },
    { id: 3, x: 50, y: 25, type: 'X', color: 'bg-red-500', neighbors: [1, 3, 4, 6] },
    { id: 4, x: 100, y: 25, type: 'X', color: 'bg-red-500', neighbors: [2, 4, 7] },
    { id: 5, x: 25, y: 50, type: 'Z', color: 'bg-blue-500', neighbors: [3, 5, 6, 8] },
    { id: 6, x: 75, y: 50, type: 'Z', color: 'bg-blue-500', neighbors: [4, 6, 7, 9] },
    { id: 7, x: 0, y: 75, type: 'X', color: 'bg-red-500', neighbors: [5, 8, 10] },
    { id: 8, x: 50, y: 75, type: 'X', color: 'bg-red-500', neighbors: [6, 8, 9, 11] },
    { id: 9, x: 100, y: 75, type: 'X', color: 'bg-red-500', neighbors: [7, 9, 12] },
    { id: 10, x: 25, y: 100, type: 'Z', color: 'bg-blue-500', neighbors: [8, 10, 11] },
    { id: 11, x: 75, y: 100, type: 'Z', color: 'bg-blue-500', neighbors: [9, 11, 12] },
  ];

  const dataQubits = [
    { id: 0, x: 0, y: 0 }, { id: 1, x: 50, y: 0 }, { id: 2, x: 100, y: 0 },
    { id: 3, x: 25, y: 25 }, { id: 4, x: 75, y: 25 },
    { id: 5, x: 0, y: 50 }, { id: 6, x: 50, y: 50 }, { id: 7, x: 100, y: 50 },
    { id: 8, x: 25, y: 75 }, { id: 9, x: 75, y: 75 },
    { id: 10, x: 0, y: 100 }, { id: 11, x: 50, y: 100 }, { id: 12, x: 100, y: 100 },
  ];

  const isStabActive = (stab: typeof stabilizers[0]) => {
    const errorCount = stab.neighbors.filter(id => errors.includes(id)).length;
    return errorCount % 2 !== 0;
  };

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl border border-stone-200 my-8 overflow-hidden">
      <div className="w-full flex justify-between items-center mb-6">
        <div>
          <h3 className="font-serif text-2xl text-stone-900">Surface Code Explorer</h3>
          <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mt-1">Interactive Diagnostic Tool</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={addRandomError}
            className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
            title="Inject Random Error"
            disabled={isDecoding}
          >
            <Activity size={20} />
          </button>
          <button 
            onClick={() => {
              setErrors([]);
              setSyndromeHistory([]);
            }}
            className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
            title="Reset System"
            disabled={isDecoding}
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="relative w-80 h-80 bg-[#F9F8F4] rounded-xl border border-stone-200 p-8 shadow-inner overflow-hidden">
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {stabilizers.map(s => s.neighbors.map(nId => {
            const n = dataQubits.find(dq => dq.id === nId);
            if (!n) return null;
            const isHighlighted = hoveredQubit === nId || hoveredStab === s.id;
            const isActive = isStabActive(s) && errors.includes(nId);
            
            return (
              <motion.line 
                key={`${s.id}-${nId}`}
                x1={`${s.x}%`} y1={`${s.y}%`}
                x2={`${n.x}%`} y2={`${n.y}%`}
                stroke="currentColor"
                initial={false}
                animate={{ 
                  strokeWidth: isHighlighted ? 3 : 1, 
                  opacity: isHighlighted ? 0.8 : (isActive ? 0.4 : 0.1),
                  color: isHighlighted ? '#D4AF37' : (isActive ? (s.type === 'Z' ? '#3B82F6' : '#EF4444') : '#A8A29E')
                }}
                className={isHighlighted ? 'text-nobel-gold' : (isActive ? (s.type === 'Z' ? 'text-blue-500' : 'text-red-500') : 'text-stone-400')}
              />
            );
          }))}
        </svg>

        {/* Decoding Overlay */}
        <AnimatePresence>
          {isDecoding && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-30 flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-2">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-nobel-gold"
                >
                  <Cpu size={32} />
                </motion.div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900">AlphaQubit Decoding...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stabilizers */}
        {stabilizers.map(stab => {
          const active = isStabActive(stab);
          const isHighlighted = hoveredStab === stab.id;
          
          return (
            <motion.div
              key={`stab-${stab.id}`}
              onMouseEnter={() => setHoveredStab(stab.id)}
              onMouseLeave={() => setHoveredStab(null)}
              className={`absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center text-[10px] font-bold rounded shadow-lg transition-all duration-300 z-10 cursor-help ${active ? stab.color + ' text-white scale-110 ring-4 ring-white' : 'bg-white text-stone-300 border border-stone-200'} ${isHighlighted ? 'ring-2 ring-nobel-gold' : ''}`}
              style={{ left: `${stab.x}%`, top: `${stab.y}%` }}
              animate={active ? { 
                scale: [1, 1.2, 1.1],
                boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 20px rgba(212,175,55,0.4)", "0px 0px 10px rgba(212,175,55,0.2)"]
              } : { scale: 1 }}
            >
              {stab.type}
              {active && (
                <motion.div 
                  className="absolute inset-0 rounded bg-white"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}

        {/* Data Qubits */}
        {dataQubits.map(q => {
          const hasError = errors.includes(q.id);
          const isBeingCorrected = showCorrection && hasError;
          
          return (
            <button
              key={`data-${q.id}`}
              onClick={() => toggleError(q.id)}
              onMouseEnter={() => setHoveredQubit(q.id)}
              onMouseLeave={() => setHoveredQubit(null)}
              disabled={isDecoding}
              className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-20 ${hasError ? 'bg-stone-900 border-stone-900 text-nobel-gold scale-110 shadow-lg' : 'bg-white border-stone-300 hover:border-stone-900'} ${isBeingCorrected ? 'ring-4 ring-emerald-500 ring-offset-2' : ''}`}
              style={{ left: `${q.x}%`, top: `${q.y}%` }}
            >
              {hasError && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Activity size={10} />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>

      <div className="w-full mt-6">
        <button
          onClick={runDecoder}
          disabled={errors.length === 0 || isDecoding}
          className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${errors.length > 0 && !isDecoding ? 'bg-stone-900 text-white hover:bg-black shadow-lg' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
        >
          <Play size={14} />
          Run AlphaQubit Decoder
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 w-full">
        <div className="p-4 bg-stone-50 rounded-lg border border-stone-100">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Active Errors</div>
          <div className="text-2xl font-serif text-stone-900">{errors.length}</div>
        </div>
        <div className="p-4 bg-stone-50 rounded-lg border border-stone-100">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Syndrome Weight</div>
          <div className="text-2xl font-serif text-stone-900">{stabilizers.filter(isStabActive).length}</div>
        </div>
      </div>

      {/* Syndrome History */}
      <div className="w-full mt-6 p-4 bg-stone-900 rounded-xl overflow-hidden">
        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">Live Syndrome Feed</div>
        <div className="space-y-2">
          {syndromeHistory.length === 0 ? (
            <div className="text-[10px] text-stone-600 italic">Waiting for parity checks...</div>
          ) : (
            syndromeHistory.map((h, i) => (
              <motion.div 
                key={h.timestamp}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between items-center text-[10px] font-mono"
              >
                <span className={h.type === 'ERROR_INJECTED' ? 'text-red-400' : 'text-emerald-400'}>
                  {h.type}
                </span>
                <span className="text-stone-400">WEIGHT: {h.count}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
      
      <p className="mt-6 text-xs text-stone-500 text-center italic">
        The syndrome pattern (colored squares) provides the "clues" that AlphaQubit uses to reconstruct the error chain.
      </p>
    </div>
  );
};

// --- TRANSFORMER DECODER DIAGRAM ---
export const TransformerDecoderDiagram: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % 5);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const stages = [
    { title: 'Syndrome History', icon: <Activity size={20} />, desc: 'Temporal sequence of parity checks' },
    { title: 'Embedding', icon: <Cpu size={20} />, desc: 'High-dimensional feature mapping' },
    { title: 'Self-Attention', icon: <RotateCcw size={20} />, desc: 'Spatial-temporal correlation analysis' },
    { title: 'MLP Head', icon: <Cpu size={20} />, desc: 'Error probability estimation' },
    { title: 'Correction', icon: <Play size={20} />, desc: 'Optimal logical recovery' },
  ];

  return (
    <div className="flex flex-col items-center p-8 bg-stone-50 rounded-2xl border border-stone-200 my-8 shadow-inner">
      <div className="w-full mb-8">
        <h3 className="font-serif text-2xl text-stone-900">Neural Decoding Pipeline</h3>
        <p className="text-sm text-stone-500 mt-1">Recurrent Transformer Architecture by MLAI</p>
      </div>

      <div className="relative w-full flex flex-col gap-4">
        {stages.map((stage, i) => (
          <motion.div
            key={i}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${step === i ? 'bg-white border-nobel-gold shadow-md scale-[1.02]' : 'bg-transparent border-transparent opacity-40'}`}
            animate={step === i ? { x: 10 } : { x: 0 }}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${step === i ? 'bg-nobel-gold text-white' : 'bg-stone-200 text-stone-400'}`}>
              {stage.icon}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400">Stage 0{i+1}</div>
              <div className="font-serif text-lg text-stone-900">{stage.title}</div>
              <AnimatePresence mode="wait">
                {step === i && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs text-stone-500 mt-1"
                  >
                    {stage.desc}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}

        {/* Connecting Line */}
        <div className="absolute left-10 top-6 bottom-6 w-0.5 bg-stone-200 -z-10"></div>
        <motion.div 
          className="absolute left-[39px] w-1 h-12 bg-nobel-gold -z-10 rounded-full"
          animate={{ top: `${step * 25}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>
    </div>
  );
};

// --- PERFORMANCE CHART ---
export const PerformanceMetricDiagram: React.FC = () => {
  const [distance, setDistance] = useState<3 | 5 | 11>(5);
  
  const data = {
    3: { mwpm: 3.5, alpha: 2.9, improvement: '17%' },
    5: { mwpm: 3.6, alpha: 2.75, improvement: '24%' },
    11: { mwpm: 0.0041, alpha: 0.0009, improvement: '78%' } 
  };

  const currentData = data[distance];
  const maxVal = Math.max(currentData.mwpm, currentData.alpha) * 1.3;
  
  const formatValue = (val: number) => {
    if (val < 0.01) return val.toFixed(4) + '%';
    return val.toFixed(2) + '%';
  }

  return (
    <div className="p-8 bg-white rounded-2xl border border-stone-200 shadow-xl my-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h3 className="font-serif text-3xl text-stone-900">Benchmark Results</h3>
          <p className="text-stone-500 mt-2">Logical Error Rate (LER) Comparison</p>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-lg">
          {[3, 5, 11].map((d) => (
            <button 
              key={d}
              onClick={() => setDistance(d as any)} 
              className={`px-4 py-2 rounded-md text-xs font-bold tracking-widest uppercase transition-all ${distance === d ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
              d={d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 h-64 flex items-end justify-around px-8 relative">
          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] font-mono text-stone-300 pointer-events-none">
            <span>MAX</span>
            <span>MID</span>
            <span>0.00</span>
          </div>

          {/* Threshold Line */}
          <div className="absolute left-8 right-8 bottom-[40%] border-t border-dashed border-stone-300 z-0">
            <span className="absolute right-0 -top-4 text-[8px] font-bold text-stone-300 uppercase tracking-widest">Practical Threshold</span>
          </div>

          {/* MWPM Bar */}
          <div className="w-24 flex flex-col items-center gap-4">
            <div className="w-full flex items-end justify-center h-48 bg-stone-50 rounded-t-lg relative">
              <motion.div 
                className="w-full bg-stone-200 rounded-t-lg border-t border-stone-300"
                initial={{ height: 0 }}
                animate={{ height: `${(currentData.mwpm / maxVal) * 100}%` }}
                transition={{ type: 'spring', stiffness: 50 }}
              />
              <div className="absolute -top-8 text-xs font-mono font-bold text-stone-400">{formatValue(currentData.mwpm)}</div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Standard (MWPM)</div>
          </div>

          {/* AlphaQubit Bar */}
          <div className="w-24 flex flex-col items-center gap-4">
            <div className="w-full flex items-end justify-center h-48 bg-stone-50 rounded-t-lg relative">
              <motion.div 
                className="w-full bg-nobel-gold rounded-t-lg shadow-lg"
                initial={{ height: 0 }}
                animate={{ height: `${(currentData.alpha / maxVal) * 100}%` }}
                transition={{ type: 'spring', stiffness: 50, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </motion.div>
              <div className="absolute -top-8 text-xs font-mono font-bold text-nobel-gold">{formatValue(currentData.alpha)}</div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold">AlphaQubit</div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-6">
          <div className="p-6 bg-stone-900 text-white rounded-xl shadow-lg">
            <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Performance Gain</div>
            <div className="text-4xl font-serif text-nobel-gold mb-2">+{currentData.improvement}</div>
            <p className="text-xs text-stone-400 leading-relaxed">
              AlphaQubit reduces the logical error rate by {currentData.improvement} compared to standard algorithms at distance {distance}.
            </p>
          </div>
          <div className="flex items-center gap-3 text-stone-500">
            <Activity size={16} className="text-nobel-gold" />
            <span className="text-xs italic">Verified on Google Sycamore Processor</span>
          </div>
        </div>
      </div>
    </div>
  );
};
