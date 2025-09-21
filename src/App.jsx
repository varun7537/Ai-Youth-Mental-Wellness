import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';

// Three.js Background Component
const ThreeBackground = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating particles
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      colors[i * 3] = 0.2 + Math.random() * 0.8;
      colors[i * 3 + 1] = 0.6 + Math.random() * 0.4;
      colors[i * 3 + 2] = 1.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 5;
    
    sceneRef.current = scene;
    rendererRef.current = renderer;
    particlesRef.current = particles;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (particlesRef.current) {
        particlesRef.current.rotation.x += 0.001;
        particlesRef.current.rotation.y += 0.002;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
};

// Motion wrapper for smooth transitions
const MotionDiv = ({ children, className, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// AI Mindfulness Coach Component
const AICoachView = () => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: "Hello! I'm your personal mindfulness coach. I can help you with meditation guidance, breathing exercises, stress management, and wellness tips. How are you feeling today?",
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    stressLevel: 5,
    experienceLevel: 'beginner',
    preferredDuration: 10,
    goals: []
  });
  const messagesEndRef = useRef(null);

  // AI Response Generator
  const generateAIResponse = useCallback((userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Stress and anxiety responses
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
      return {
        content: "I understand you're feeling stressed. Let's try a quick 4-7-8 breathing technique: Inhale for 4 counts, hold for 7, exhale for 8. This activates your parasympathetic nervous system and promotes calm. Would you like me to guide you through a longer meditation session?",
        suggestions: ["Start 4-7-8 breathing", "5-minute stress relief", "Progressive muscle relaxation"]
      };
    }
    
    // Sleep-related responses
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired')) {
      return {
        content: "Sleep troubles can be challenging. I recommend a bedtime routine: Try our Sleep Induction sound therapy with delta waves, practice body scan meditation, and avoid screens 1 hour before bed. Deep breathing helps signal your body it's time to rest.",
        suggestions: ["Sleep meditation guide", "Body scan exercise", "Bedtime routine tips"]
      };
    }
    
    // Focus and concentration
    if (lowerMessage.includes('focus') || lowerMessage.includes('concentrate') || lowerMessage.includes('distracted')) {
      return {
        content: "For better focus, try the Pomodoro technique with mindfulness: 25 minutes focused work, then 5 minutes of mindful breathing. Our Deep Focus sound therapy with beta waves can also enhance concentration. Regular meditation strengthens your attention muscle.",
        suggestions: ["Deep focus session", "Attention training", "Mindful work breaks"]
      };
    }
    
    // Meditation guidance
    if (lowerMessage.includes('meditat') || lowerMessage.includes('mindful')) {
      return {
        content: `Perfect! As a ${userProfile.experienceLevel}, I recommend starting with ${userProfile.preferredDuration}-minute sessions. Focus on breath awareness: notice the sensation of air flowing in and out. When thoughts arise, gently return to your breath without judgment.`,
        suggestions: ["Start guided meditation", "Breathing techniques", "Advanced practices"]
      };
    }
    
    // Mood and emotions
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
      return {
        content: "I hear that you're going through a difficult time. Mindfulness can help by creating space between you and difficult emotions. Try loving-kindness meditation: send compassion to yourself first, then others. Remember, emotions are temporary visitors.",
        suggestions: ["Loving-kindness meditation", "Emotional regulation", "Self-compassion practice"]
      };
    }
    
    // Anger management
    if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('irritated')) {
      return {
        content: "Anger is a natural emotion, but we can respond skillfully. Try the STOP technique: Stop what you're doing, Take a breath, Observe your feelings, Proceed mindfully. Box breathing for 2 minutes can also cool the emotional heat.",
        suggestions: ["Anger cooling meditation", "STOP technique guide", "Emotional awareness"]
      };
    }
    
    // Gratitude and positivity
    if (lowerMessage.includes('grateful') || lowerMessage.includes('happy') || lowerMessage.includes('positive')) {
      return {
        content: "Wonderful! Gratitude is a powerful practice for well-being. Try the 5-4-3-2-1 technique: Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This grounds you in the present moment and cultivates appreciation.",
        suggestions: ["Gratitude meditation", "Present moment awareness", "Joy cultivation"]
      };
    }
    
    // General wellness
    if (lowerMessage.includes('wellness') || lowerMessage.includes('health') || lowerMessage.includes('balance')) {
      return {
        content: "Holistic wellness includes mental, physical, and emotional health. Consider: regular meditation practice, gentle movement, healthy sleep, meaningful connections, and time in nature. Small, consistent steps create lasting change.",
        suggestions: ["Create wellness plan", "Mindful movement", "Life balance tips"]
      };
    }
    
    // Default responses for general queries
    const generalResponses = [
      {
        content: "That's interesting. In mindfulness, we often find that our challenges become our greatest teachers. What would it feel like to approach this situation with curiosity rather than judgment?",
        suggestions: ["Explore mindful curiosity", "Perspective shifting", "Acceptance practice"]
      },
      {
        content: "Thank you for sharing that with me. Mindfulness teaches us to meet each moment with presence and compassion. Would you like to explore a specific technique that might help with what you're experiencing?",
        suggestions: ["Breathing exercises", "Body awareness", "Thought observation"]
      },
      {
        content: "I appreciate your openness. Remember, mindfulness isn't about eliminating difficult experiences, but changing our relationship with them. What small step could you take today toward greater peace?",
        suggestions: ["Daily mindfulness habits", "Stress relief techniques", "Emotional wellness"]
      }
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }, [userProfile]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      type: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMsg = {
        type: 'ai',
        content: aiResponse.content,
        suggestions: aiResponse.suggestions || [],
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1500);
  }, [inputMessage, isLoading, generateAIResponse]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setInputMessage(suggestion);
  }, []);

  const handleQuickStart = useCallback((type) => {
    const quickStarts = {
      stress: "I'm feeling stressed and need help calming down",
      sleep: "I'm having trouble sleeping and need relaxation techniques",
      focus: "I need help improving my focus and concentration",
      mood: "I want to improve my mood and emotional well-being"
    };
    
    setInputMessage(quickStarts[type]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <MotionDiv className="flex flex-col w-full max-w-4xl mx-auto px-4 h-full">
      <div className="text-center mb-6 bg-slate-800/30 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-2xl sm:text-3xl font-light text-slate-200 mb-2">AI Mindfulness Coach</h2>
        <p className="text-sm sm:text-base text-slate-400">Your personal guide to mindfulness and well-being</p>
      </div>

      {/* Quick Start Options */}
      <div className="mb-6">
        <p className="text-sm text-slate-400 mb-3 text-center">Quick start options:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { key: 'stress', label: '😰 Stress Relief', color: 'from-red-400 to-orange-500' },
            { key: 'sleep', label: '😴 Sleep Help', color: 'from-indigo-400 to-purple-500' },
            { key: 'focus', label: '🎯 Focus Boost', color: 'from-green-400 to-blue-500' },
            { key: 'mood', label: '😊 Mood Lift', color: 'from-yellow-400 to-pink-500' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => handleQuickStart(option.key)}
              className={`p-3 rounded-xl bg-gradient-to-r ${option.color} bg-opacity-10 border border-slate-600/50 hover:bg-opacity-20 transition-all duration-200 text-xs sm:text-sm font-medium text-slate-300 hover:text-white`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-slate-800/20 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 mb-4 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 max-h-96">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs sm:max-w-md lg:max-w-lg p-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-400/30'
                  : 'bg-slate-700/50 text-slate-200 border border-slate-600/30'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-2 py-1 text-xs bg-slate-600/50 hover:bg-slate-500/50 rounded-lg border border-slate-500/30 transition-colors duration-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-slate-400 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700/50 text-slate-200 border border-slate-600/30 p-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-sm">AI Coach is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-4 flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Share how you're feeling or ask for guidance..."
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-3 bg-cyan-500/80 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-medium min-w-[80px]"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>

      {/* User Profile Settings */}
      <div className="bg-slate-800/20 backdrop-blur-md rounded-xl border border-slate-700/50 p-4">
        <h3 className="text-lg font-medium text-slate-200 mb-3">Personalize Your Experience</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Experience Level</label>
            <select
              value={userProfile.experienceLevel}
              onChange={(e) => setUserProfile(prev => ({ ...prev, experienceLevel: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Session Duration</label>
            <select
              value={userProfile.preferredDuration}
              onChange={(e) => setUserProfile(prev => ({ ...prev, preferredDuration: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Current Stress Level</label>
            <input
              type="range"
              min="1"
              max="10"
              value={userProfile.stressLevel}
              onChange={(e) => setUserProfile(prev => ({ ...prev, stressLevel: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-slate-400 text-center mt-1">{userProfile.stressLevel}/10</div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

// Enhanced Meditation Component
const MeditationView = () => {
  const [isMeditating, setIsMeditating] = useState(false);
  const [mode, setMode] = useState('ready');
  const [instruction, setInstruction] = useState('Press Play to Begin');
  const [cycleCount, setCycleCount] = useState(0);
  const timerRef = useRef(null);
  const cycleRef = useRef(0);

  const meditationCycle = useMemo(() => [
    { mode: 'inhale', instruction: 'Breathe In...', duration: 4000 },
    { mode: 'holdIn', instruction: 'Hold', duration: 4000 },
    { mode: 'exhale', instruction: 'Breathe Out...', duration: 4000 },
    { mode: 'holdOut', instruction: 'Hold', duration: 4000 },
  ], []);

  const startMeditation = useCallback(() => {
    setIsMeditating(true);
    cycleRef.current = 0;
    setCycleCount(0);
    setMode('inhale');
  }, []);

  const stopMeditation = useCallback(() => {
    setIsMeditating(false);
    setMode('ready');
    setInstruction('Press Play to Begin');
    clearTimeout(timerRef.current);
    cycleRef.current = 0;
  }, []);

  const handleToggleMeditation = useCallback(() => {
    if (isMeditating) {
      stopMeditation();
    } else {
      startMeditation();
    }
  }, [isMeditating, stopMeditation, startMeditation]);

  useEffect(() => {
    if (isMeditating) {
      const currentPhase = meditationCycle[cycleRef.current];
      setMode(currentPhase.mode);
      setInstruction(currentPhase.instruction);

      timerRef.current = setTimeout(() => {
        const nextCycle = (cycleRef.current + 1) % meditationCycle.length;
        if (nextCycle === 0) {
          setCycleCount(prev => prev + 1);
        }
        cycleRef.current = nextCycle;
        setMode(meditationCycle[nextCycle].mode);
      }, currentPhase.duration);

      return () => clearTimeout(timerRef.current);
    }
  }, [isMeditating, mode, meditationCycle]);

  const getCircleClass = useCallback(() => {
    const baseClasses = 'relative w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-2xl shadow-cyan-500/20 transition-all ease-in-out backdrop-blur-sm';
    switch (mode) {
      case 'inhale':
        return `${baseClasses} duration-[4000ms] scale-125 sm:scale-150`;
      case 'holdIn':
        return `${baseClasses} duration-1000 scale-125 sm:scale-150 ring-4 ring-cyan-300/50`;
      case 'exhale':
        return `${baseClasses} duration-[4000ms] scale-100`;
      case 'holdOut':
        return `${baseClasses} duration-1000 scale-100 ring-2 ring-purple-300/30`;
      default:
        return `${baseClasses} duration-1000 scale-100`;
    }
  }, [mode]);

  return (
    <MotionDiv className="flex flex-col items-center justify-center text-center w-full max-w-4xl mx-auto px-4">
      <div className="mb-8 bg-slate-800/30 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-2xl sm:text-3xl font-light text-slate-200 mb-2">Box Breathing</h2>
        <p className="text-sm sm:text-base text-slate-400">4-4-4-4 breathing pattern for deep relaxation</p>
        {cycleCount > 0 && (
          <p className="text-xs sm:text-sm text-cyan-400 mt-2">Cycles completed: {cycleCount}</p>
        )}
      </div>

      <div className="relative flex items-center justify-center w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 mb-12">
        {/* Outer breathing guide ring */}
        <div
          className={`absolute border-2 border-cyan-400/30 rounded-full transition-all ease-in-out ${
            mode === 'inhale' || mode === 'holdIn' 
              ? 'w-full h-full duration-[4000ms] animate-pulse' 
              : 'w-3/4 h-3/4 duration-[4000ms]'
          }`}
        />
        
        {/* Main breathing circle */}
        <div className={getCircleClass()}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-xl" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
        </div>
        
        {/* Progress indicators */}
        <div className="absolute -bottom-8 flex space-x-2">
          {meditationCycle.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                cycleRef.current === index && isMeditating
                  ? 'bg-cyan-400 scale-125'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>

      <MotionDiv className="mb-8">
        <p className="text-xl sm:text-2xl lg:text-3xl font-light text-slate-300 h-8 sm:h-10 tracking-wider transition-all duration-500">
          {instruction}
        </p>
      </MotionDiv>

      <button
        onClick={handleToggleMeditation}
        className="group w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800/80 backdrop-blur-md shadow-2xl hover:bg-slate-700/80 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 flex items-center justify-center transform hover:scale-105 border border-slate-600/50"
        aria-label={isMeditating ? 'Pause Meditation' : 'Start Meditation'}
      >
        <div className={`transition-transform duration-300 ${isMeditating ? 'scale-100' : 'group-hover:scale-110'}`}>
          {isMeditating ? (
            <svg className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm6 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </button>
    </MotionDiv>
  );
};

// Enhanced Sound Therapy Component
const SoundTherapyView = () => {
  const [playingSound, setPlayingSound] = useState(null);
  const [volume, setVolume] = useState(0.3);
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef({});
  const gainNodeRef = useRef(null);

  const soundTherapies = useMemo(() => [
    { 
      id: 'focus', 
      name: 'Deep Focus', 
      baseFreq: 140, 
      binauralBeat: 15, 
      desc: 'Beta waves for heightened concentration',
      color: 'from-orange-400 to-red-500',
      icon: '🎯'
    },
    { 
      id: 'relax', 
      name: 'Stress Relief', 
      baseFreq: 136.1, 
      binauralBeat: 8, 
      desc: 'Alpha waves for relaxation and calm',
      color: 'from-green-400 to-blue-500',
      icon: '🌿'
    },
    { 
      id: 'meditate', 
      name: 'Meditation Aid', 
      baseFreq: 120, 
      binauralBeat: 5, 
      desc: 'Theta waves for deep meditation',
      color: 'from-purple-400 to-pink-500',
      icon: '🧘'
    },
    { 
      id: 'sleep', 
      name: 'Sleep Induction', 
      baseFreq: 100, 
      binauralBeat: 2.5, 
      desc: 'Delta waves for restorative sleep',
      color: 'from-indigo-400 to-purple-600',
      icon: '🌙'
    },
  ], []);

  const stopSound = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      oscillatorsRef.current = {};
      gainNodeRef.current = null;
      setPlayingSound(null);
    }
  }, []);

  const playSound = useCallback((sound) => {
    stopSound();

    const context = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = context;

    const pannerL = context.createStereoPanner();
    pannerL.pan.value = -1;
    const pannerR = context.createStereoPanner();
    pannerR.pan.value = 1;

    const oscillatorL = context.createOscillator();
    oscillatorL.type = 'sine';
    oscillatorL.frequency.value = sound.baseFreq - sound.binauralBeat / 2;

    const oscillatorR = context.createOscillator();
    oscillatorR.type = 'sine';
    oscillatorR.frequency.value = sound.baseFreq + sound.binauralBeat / 2;

    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 2);
    gainNodeRef.current = gainNode;

    oscillatorL.connect(pannerL).connect(gainNode).connect(context.destination);
    oscillatorR.connect(pannerR).connect(gainNode).connect(context.destination);

    oscillatorL.start();
    oscillatorR.start();

    oscillatorsRef.current = { left: oscillatorL, right: oscillatorR, gain: gainNode };
    setPlayingSound(sound.id);
  }, [stopSound, volume]);

  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVolume, audioContextRef.current.currentTime);
    }
  }, []);

  const handleToggleSound = useCallback((sound) => {
    if (playingSound === sound.id) {
      stopSound();
    } else {
      playSound(sound);
    }
  }, [playingSound, stopSound, playSound]);

  useEffect(() => {
    return () => stopSound();
  }, [stopSound]);

  return (
    <MotionDiv className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4">
      <div className="text-center mb-8 bg-slate-800/30 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-2xl sm:text-3xl font-light text-slate-200 mb-2">Binaural Sound Therapy</h2>
        <p className="text-sm sm:text-base text-slate-400">Use headphones for the best experience</p>
      </div>

      {/* Volume Control */}
      <div className="mb-8 bg-slate-800/20 backdrop-blur-md rounded-xl p-4 border border-slate-700/30">
        <label className="block text-sm font-medium text-slate-300 mb-2">Volume: {Math.round(volume * 100)}%</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
        {soundTherapies.map((sound) => (
          <MotionDiv
            key={sound.id}
            className={`relative overflow-hidden bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border transition-all duration-500 hover:scale-105 cursor-pointer group ${
              playingSound === sound.id 
                ? 'border-cyan-400/50 shadow-lg shadow-cyan-500/20' 
                : 'border-slate-700/50 hover:border-slate-600/70'
            }`}
            onClick={() => handleToggleSound(sound)}
          >
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${sound.color} opacity-5 transition-opacity duration-500 ${
              playingSound === sound.id ? 'opacity-20' : 'group-hover:opacity-10'
            }`} />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl sm:text-3xl">{sound.icon}</div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-200 mb-1">{sound.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-400">{sound.desc}</p>
                </div>
              </div>
              
              <button
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                  playingSound === sound.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/60'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSound(sound);
                }}
              >
                {playingSound === sound.id ? (
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Playing indicator */}
            {playingSound === sound.id && (
              <div className="absolute bottom-2 left-2 flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-cyan-400 rounded-full animate-pulse"
                    style={{
                      height: '8px',
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
            )}
          </MotionDiv>
        ))}
      </div>
    </MotionDiv>
  );
};

// Enhanced Cognitive Exercise Component
const CognitiveExerciseView = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const leftPathRef = useRef([]);
  const rightPathRef = useRef([]);
  const [score, setScore] = useState({ left: 0, right: 0 });

  const loadScript = useCallback((src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }, []);

  const setupMediaPipe = useCallback(async () => {
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466002/camera_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1675466002/drawing_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675466002/hands.js');

      const hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675466002/${file}`,
      });
      
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });
      
      hands.onResults(onResults);
      handsRef.current = hands;

      if (videoRef.current) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720,
        });
        await camera.start();
        cameraRef.current = camera;
        setIsActive(true);
      }
      setLoading(false);
    } catch (err) {
      console.error('MediaPipe setup failed:', err);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found. Please connect a webcam and refresh.');
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access and refresh.');
      } else {
        setError('Failed to initialize. Please check your camera and refresh.');
      }
      setLoading(false);
    }
  }, [loadScript]);

  const onResults = useCallback((results) => {
    if (!canvasRef.current) return;
    
    const canvasCtx = canvasRef.current.getContext('2d');
    const canvasElement = canvasRef.current;
    canvasCtx.save();

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if (results.image) {
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    }

    // Enhanced shape drawing
    canvasCtx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    canvasCtx.lineWidth = 4;
    canvasCtx.shadowColor = 'rgba(56, 189, 248, 0.5)';
    canvasCtx.shadowBlur = 10;

    const squareSize = Math.min(canvasElement.height * 0.35, 200);
    const squareX = canvasElement.width * 0.25 - squareSize / 2;
    const squareY = canvasElement.height * 0.5 - squareSize / 2;
    canvasCtx.strokeRect(squareX, squareY, squareSize, squareSize);

    canvasCtx.strokeStyle = 'rgba(167, 139, 250, 0.6)';
    canvasCtx.shadowColor = 'rgba(167, 139, 250, 0.5)';
    
    const triSize = Math.min(canvasElement.height * 0.35, 200);
    const triX = canvasElement.width * 0.75;
    const triY = canvasElement.height * 0.5;
    canvasCtx.beginPath();
    canvasCtx.moveTo(triX, triY - triSize / 2);
    canvasCtx.lineTo(triX - triSize / 2, triY + triSize / 2);
    canvasCtx.lineTo(triX + triSize / 2, triY + triSize / 2);
    canvasCtx.closePath();
    canvasCtx.stroke();

    canvasCtx.shadowBlur = 0;

    let leftHandDetected = false;
    let rightHandDetected = false;

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i].label;
        const fingerTip = landmarks[8];

        const x = fingerTip.x * canvasElement.width;
        const y = fingerTip.y * canvasElement.height;

        if (handedness === 'Left') {
          leftPathRef.current.push({ x, y, timestamp: Date.now() });
          leftHandDetected = true;
          drawCursor(canvasCtx, x, y, '#38bdf8');
        } else if (handedness === 'Right') {
          rightPathRef.current.push({ x, y, timestamp: Date.now() });
          rightHandDetected = true;
          drawCursor(canvasCtx, x, y, '#a78bfa');
        }
      }
    }

    // Clean old path points
    const now = Date.now();
    leftPathRef.current = leftPathRef.current.filter(p => now - p.timestamp < 10000);
    rightPathRef.current = rightPathRef.current.filter(p => now - p.timestamp < 10000);

    drawPath(canvasCtx, leftPathRef.current, '#38bdf8');
    drawPath(canvasCtx, rightPathRef.current, '#a78bfa');

    if (!leftHandDetected) leftPathRef.current = [];
    if (!rightHandDetected) rightPathRef.current = [];

    canvasCtx.restore();
  }, []);

  const drawPath = useCallback((ctx, path, color) => {
    if (path.length < 2) return;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 5;
    
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, []);

  const drawCursor = useCallback((ctx, x, y, color) => {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  }, []);

  const clearDrawings = useCallback(() => {
    leftPathRef.current = [];
    rightPathRef.current = [];
    setScore({ left: 0, right: 0 });
  }, []);

  useEffect(() => {
    setupMediaPipe();
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [setupMediaPipe]);

  return (
    <MotionDiv className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-6 bg-slate-800/30 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-2xl sm:text-3xl font-light text-slate-200 mb-3">Dual-Task Challenge</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-cyan-400 rounded"></div>
            <span className="text-slate-300"><span className="font-bold">LEFT hand:</span> trace the SQUARE</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-purple-400 rounded"></div>
            <span className="text-slate-300"><span className="font-bold">RIGHT hand:</span> trace the TRIANGLE</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">Try to draw both shapes simultaneously!</p>
      </div>

      <div className="relative w-full max-w-4xl aspect-video bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-slate-800/80 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
            <p className="text-lg">Initializing Camera & AI Models...</p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-6 bg-slate-800/80 backdrop-blur-sm">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-lg text-center">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600/20 text-red-400 rounded-lg border border-red-500/50 hover:bg-red-600/30 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        )}

        {/* Status indicator */}
        {!loading && !error && (
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-xs text-slate-300">{isActive ? 'Camera Active' : 'Camera Inactive'}</span>
          </div>
        )}

        <video ref={videoRef} className="absolute w-full h-full object-cover opacity-0" playsInline />
        <canvas 
          ref={canvasRef} 
          width="1280" 
          height="720" 
          className="w-full h-full object-cover scale-x-[-1]" 
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-6">
        <button
          onClick={clearDrawings}
          className="px-6 py-3 bg-slate-700/80 backdrop-blur-md text-slate-200 rounded-xl border border-slate-600/50 hover:bg-slate-600/80 transition-all duration-200 font-medium transform hover:scale-105 shadow-lg"
        >
          Clear Drawings
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{score.left}</div>
            <div className="text-xs text-slate-400">Left Score</div>
          </div>
          <div className="w-px h-8 bg-slate-600"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{score.right}</div>
            <div className="text-xs text-slate-400">Right Score</div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

// Enhanced Navigation Component
const NavigationBar = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'meditation', label: 'Meditation', icon: '🧘' },
    { id: 'sound', label: 'Sound Therapy', icon: '🎵' },
    { id: 'cognitive', label: 'Cognitive', icon: '🧠' },
    { id: 'coach', label: 'AI Coach', icon: '🤖' }
  ];

  return (
    <nav className="flex items-center justify-center mb-8">
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-2 border border-slate-700/50 shadow-2xl">
        <div className="flex space-x-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`relative px-3 sm:px-4 lg:px-6 py-3 rounded-xl text-xs sm:text-sm lg:text-base font-medium transition-all duration-300 flex items-center space-x-2 ${
                activeView === item.id
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 transform scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="text-sm sm:text-lg">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden text-xs">{item.label.split(' ')[0]}</span>
              
              {activeView === item.id && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/20 to-blue-500/20 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// Main App Component
const App = () => {
  const [activeView, setActiveView] = useState('coach');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'meditation':
        return <MeditationView />;
      case 'sound':
        return <SoundTherapyView />;
      case 'cognitive':
        return <CognitiveExerciseView />;
      case 'coach':
        return <AICoachView />;
      default:
        return <AICoachView />;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden">
      {/* Three.js animated background */}
      <ThreeBackground />
      
      {/* Main content */}
      <div className={`relative z-10 flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 transition-all duration-1000 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* Header */}
        <header className="text-center my-6 sm:my-8 lg:my-12">
          <MotionDiv className="relative">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-3">
              Mindful Moments
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-slate-400 max-w-2xl mx-auto px-4">
              Your AI-powered companion for meditation, mindfulness, and mental wellness
            </p>
            
            {/* Subtle decorative elements */}
            <div className="absolute -top-4 -left-4 w-16 h-16 sm:w-24 sm:h-24 bg-cyan-400/5 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-4 -right-4 w-20 h-20 sm:w-32 sm:h-32 bg-purple-400/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          </MotionDiv>
        </header>

        {/* Navigation */}
        <NavigationBar activeView={activeView} setActiveView={setActiveView} />

        {/* Main content area */}
        <main className="w-full flex-grow flex items-start justify-center pb-8 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto pt-8 pb-4">
          <div className="text-center text-xs sm:text-sm text-slate-500">
            <p>🧘‍♀️ Find your balance • 🤖 AI-powered guidance • ✨ Transform your well-being</p>
          </div>
        </footer>
      </div>

      {/* Custom styles for slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0891b2;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0891b2;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
        }
      `}</style>
    </div>
  );
};

export default App;