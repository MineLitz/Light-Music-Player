import React, { useMemo } from 'react';
import { EQSettings, EQBand } from '../types';
import { Power, RefreshCcw } from 'lucide-react';

interface EqualizerProps {
  settings: EQSettings;
  onUpdate: (settings: EQSettings) => void;
}

const PRESETS: Record<string, number[]> = {
  'Acoustic': [4, 2, 0, 2, 3, 4],
  'Electronic': [5, 3, 0, 2, 4, 5],
  'Hip Hop': [6, 4, 1, 0, 2, 3],
  'Jazz': [3, 2, 0, 2, 3, 4],
  'Rock': [5, 3, -1, 2, 4, 6],
  'Latin': [2, 1, 0, 2, 2, 3],
  'Bass Boost': [8, 5, 0, 0, 0, 0],
  'Bass Reduce': [-6, -4, 0, 0, 0, 0],
  'Treble Boost': [0, 0, 0, 2, 4, 6],
  'Treble Reduce': [0, 0, 0, -2, -4, -6],
  'Vocal': [-2, -1, 3, 5, 3, 0],
  'Flat': [0, 0, 0, 0, 0, 0],
};

const Equalizer: React.FC<EqualizerProps> = ({ settings, onUpdate }) => {
  
  const handleBandChange = (index: number, val: number) => {
    const newBands = [...settings.bands];
    newBands[index] = { ...newBands[index], gain: val };
    onUpdate({ ...settings, bands: newBands, presetName: 'Custom' });
  };

  const applyPreset = (name: string) => {
    const gains = PRESETS[name];
    if (!gains) return;
    
    const newBands = settings.bands.map((b, i) => ({
      ...b,
      gain: gains[i]
    }));
    onUpdate({ ...settings, bands: newBands, presetName: name });
  };

  const toggleEQ = () => {
    onUpdate({ ...settings, enabled: !settings.enabled });
  };

  // Create an SVG path string to visualize the curve
  const curvePath = useMemo(() => {
    const width = 100; // Percentage based
    const points = settings.bands.map((b, i) => {
      // Normalize gain (-12 to 12) to Y coordinates (0 to 100)
      // Gain 12 -> 0 (top), Gain -12 -> 100 (bottom)
      const y = 50 - (b.gain / 12) * 50; 
      const x = (i / (settings.bands.length - 1)) * 100;
      return `${x},${y}`;
    });

    return `M0,50 L${points.join(' L')} L100,50`;
  }, [settings.bands]);

  return (
    <div className="p-6 bg-[#181818] rounded-xl border border-white/10 shadow-xl max-w-3xl mx-auto mt-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
           Equalizer
        </h2>
        
        <div className="flex gap-4 items-center">
            <select 
              value={settings.presetName}
              onChange={(e) => applyPreset(e.target.value)}
              className="bg-[#282828] text-sm text-gray-200 p-2 rounded border border-white/5 outline-none focus:border-green-500"
              disabled={!settings.enabled}
            >
              <option value="Custom">Custom</option>
              {Object.keys(PRESETS).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <button 
              onClick={toggleEQ}
              className={`p-2 rounded-full transition-colors ${settings.enabled ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-400'}`}
              title={settings.enabled ? "Turn Off EQ" : "Turn On EQ"}
            >
              <Power size={18} />
            </button>
        </div>
      </div>

      <div className="relative h-48 mb-8 px-4">
         {/* Visual Curve */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none" viewBox="0 0 100 100">
             <path d={curvePath} fill="none" stroke="#1DB954" strokeWidth="2" vectorEffect="non-scaling-stroke" />
             <line x1="0" y1="50" x2="100" y2="50" stroke="#fff" strokeWidth="0.5" strokeDasharray="2" />
         </svg>

         <div className="flex justify-between h-full relative z-10">
           {settings.bands.map((band, index) => (
             <div key={index} className="flex flex-col items-center w-12 h-full justify-end group">
                <div className="relative h-full w-full flex justify-center">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={band.gain}
                    onChange={(e) => handleBandChange(index, parseFloat(e.target.value))}
                    disabled={!settings.enabled}
                    className="absolute h-full w-full appearance-none bg-transparent cursor-pointer z-20"
                    style={{
                       WebkitAppearance: 'slider-vertical', // Standard for vertical sliders
                       writingMode: 'bt-lr' as any
                    }}
                  />
                  {/* Custom Track Visual (since styling vertical range is hard cross-browser) */}
                  <div className="w-1 h-full bg-[#333] rounded absolute z-0 pointer-events-none">
                     <div 
                        className={`w-full rounded bg-green-500 transition-all duration-150 ${!settings.enabled && 'grayscale'}`}
                        style={{
                           height: `${Math.abs(band.gain / 12) * 50}%`,
                           bottom: band.gain >= 0 ? '50%' : 'auto',
                           top: band.gain < 0 ? '50%' : 'auto'
                        }}
                     />
                  </div>
                   {/* Thumb visual approximation */}
                  <div 
                     className="absolute w-4 h-4 bg-white rounded-full shadow-md pointer-events-none transition-all duration-75"
                     style={{
                        bottom: `${50 + (band.gain / 12) * 50}%`,
                        marginBottom: '-8px'
                     }}
                  />
                </div>
                <span className="text-xs text-gray-400 mt-3 font-mono">
                  {band.frequency >= 1000 ? `${band.frequency/1000}k` : band.frequency}
                </span>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
};

export default Equalizer;
