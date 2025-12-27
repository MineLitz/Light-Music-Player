import { EQBand } from '../types';

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private audioEl: HTMLAudioElement;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private filters: BiquadFilterNode[] = [];
  
  constructor() {
    this.audioEl = new Audio();
    this.audioEl.crossOrigin = "anonymous";
  }

  init() {
    if (this.audioCtx) return;
    
    // Create AudioContext only on user interaction if needed, but here we init early
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    this.audioCtx = new AudioContextClass();

    this.sourceNode = this.audioCtx.createMediaElementSource(this.audioEl);
    this.gainNode = this.audioCtx.createGain();

    // Create 6 bands: 60, 150, 400, 1k, 2.4k, 15k
    const frequencies = [60, 150, 400, 1000, 2400, 15000];
    const types: BiquadFilterType[] = ['lowshelf', 'peaking', 'peaking', 'peaking', 'peaking', 'highshelf'];

    this.filters = frequencies.map((freq, i) => {
      const filter = this.audioCtx!.createBiquadFilter();
      filter.type = types[i];
      filter.frequency.value = freq;
      filter.gain.value = 0;
      return filter;
    });

    // Chain: Source -> Filter1 -> Filter2 ... -> Filter6 -> Gain -> Destination
    let currentNode: AudioNode = this.sourceNode;
    this.filters.forEach(filter => {
      currentNode.connect(filter);
      currentNode = filter;
    });
    
    currentNode.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);
  }

  playBlob(blob: Blob) {
    if (!this.audioCtx) this.init();
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    const url = URL.createObjectURL(blob);
    // Revoke previous URL if exists to free memory could be handled by react effect, 
    // but here we just set the new one.
    this.audioEl.src = url;
    this.audioEl.play().catch(e => console.error("Playback failed", e));
  }

  togglePlay() {
    if (!this.audioCtx) this.init();
    if (this.audioEl.paused) {
      if (this.audioCtx?.state === 'suspended') this.audioCtx.resume();
      this.audioEl.play();
    } else {
      this.audioEl.pause();
    }
  }

  setVolume(val: number) {
    this.audioEl.volume = val;
  }

  seek(time: number) {
    if(isFinite(time)) {
      this.audioEl.currentTime = time;
    }
  }

  updateEQ(bands: EQBand[], enabled: boolean) {
    if (!this.audioCtx) return;
    
    this.filters.forEach((filter, index) => {
      if (enabled && index < bands.length) {
        // Smooth transition
        filter.gain.setTargetAtTime(bands[index].gain, this.audioCtx!.currentTime, 0.1);
      } else {
        filter.gain.setTargetAtTime(0, this.audioCtx!.currentTime, 0.1);
      }
    });
  }

  getElement() {
    return this.audioEl;
  }
}

export const audioEngine = new AudioEngine();
