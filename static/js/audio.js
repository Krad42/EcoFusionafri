// Audio Manager for EcoFusion
const AudioManager = (() => {
    // Audio context and sounds storage
    let audioContext = null;
    let isMuted = false;
    const sounds = {};
    
    // Initialize Web Audio API
    const initialize = () => {
        try {
            // Create audio context on first user interaction to comply with browser autoplay policies
            document.addEventListener('click', initializeAudioContext, { once: true });
            
            // Load user preferences
            loadPreferences();
            
            // Pre-load sounds
            preloadSounds();
        } catch (error) {
            console.error('Failed to initialize Web Audio API:', error);
        }
    };
    
    // Initialize audio context (needs to happen after user interaction)
    const initializeAudioContext = () => {
        if (audioContext) return;
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            console.log('Audio context initialized');
        } catch (error) {
            console.error('Failed to create audio context:', error);
        }
    };
    
    // Load user sound preferences
    const loadPreferences = () => {
        try {
            const userData = localStorage.getItem('ecoFusionUser');
            if (userData) {
                const user = JSON.parse(userData);
                isMuted = user.sound === false;
            }
        } catch (error) {
            console.error('Failed to load sound preferences:', error);
        }
    };
    
    // Preload all sound effects
    const preloadSounds = () => {
        // Define sound effects with their properties
        const soundEffects = {
            tap: { url: 'tap_sound', type: 'oscillator', frequency: 500, duration: 0.1 },
            welcome: { url: 'welcome_sound', type: 'oscillator', notes: [261.63, 329.63, 392], duration: 0.2 },
            achievement: { url: 'achievement_sound', type: 'oscillator', notes: [523.25, 659.25, 783.99], duration: 0.15 },
            upgrade: { url: 'upgrade_sound', type: 'oscillator', frequency: 800, duration: 0.3 },
            error: { url: 'error_sound', type: 'oscillator', frequency: 200, duration: 0.3 },
            complete: { url: 'complete_sound', type: 'oscillator', frequency: 600, duration: 0.1 },
            ui: { url: 'ui_sound', type: 'oscillator', frequency: 400, duration: 0.05 },
            tab: { url: 'tab_sound', type: 'oscillator', frequency: 350, duration: 0.08 },
            select: { url: 'select_sound', type: 'oscillator', frequency: 450, duration: 0.05 }
        };
        
        // Store sound definitions
        for (const [name, config] of Object.entries(soundEffects)) {
            sounds[name] = config;
        }
    };
    
    // Play a sound by name
    const play = (soundName) => {
        if (!audioContext) {
            initializeAudioContext();
        }
        
        if (isMuted || !audioContext || !sounds[soundName]) return;
        
        try {
            const sound = sounds[soundName];
            
            if (sound.type === 'oscillator') {
                if (sound.notes) {
                    // Play sequence of notes
                    playNoteSequence(sound.notes, sound.duration);
                } else {
                    // Play single tone
                    playTone(sound.frequency, sound.duration);
                }
            }
        } catch (error) {
            console.error(`Failed to play sound "${soundName}":`, error);
        }
    };
    
    // Play a single tone
    const playTone = (frequency, duration) => {
        if (!audioContext) return;
        
        // Create oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        // Create gain node for volume control and envelope
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0;
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Start oscillator
        oscillator.start();
        
        // Apply attack
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
        
        // Apply release
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
        
        // Stop oscillator after duration
        setTimeout(() => {
            oscillator.stop();
        }, duration * 1000);
    };
    
    // Play a sequence of notes
    const playNoteSequence = (notes, noteDuration) => {
        if (!audioContext) return;
        
        notes.forEach((note, index) => {
            setTimeout(() => {
                playTone(note, noteDuration);
            }, index * noteDuration * 1000);
        });
    };
    
    // Set mute state
    const setMuted = (muted) => {
        isMuted = muted;
        
        // Update user preferences
        try {
            const userData = localStorage.getItem('ecoFusionUser');
            if (userData) {
                const user = JSON.parse(userData);
                user.sound = !muted;
                localStorage.setItem('ecoFusionUser', JSON.stringify(user));
            }
        } catch (error) {
            console.error('Failed to save sound preferences:', error);
        }
    };
    
    // Toggle mute state
    const toggleMute = () => {
        setMuted(!isMuted);
        return !isMuted;
    };
    
    // Initialize audio system
    initialize();
    
    // Public API
    return {
        play,
        setMuted,
        toggleMute
    };
})();
