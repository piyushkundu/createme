export const playSound = (type: 'correct' | 'wrong') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const context = new AudioContext();
    const osc = context.createOscillator();
    const gainNode = context.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(context.destination);
    
    if (type === 'correct') {
      // Soft success sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, context.currentTime); // A4
      osc.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
      
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
      
      osc.start(context.currentTime);
      // Modern stop requires absolute time or context.currentTime offsets
      osc.stop(context.currentTime + 0.3);
    } else {
      // Error sound (Harsh buzz)
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, context.currentTime); 
      osc.frequency.setValueAtTime(120, context.currentTime + 0.1); 
      
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.02); // Louder
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.25);
      
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.25);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};
