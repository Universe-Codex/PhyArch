import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Plus, 
  Code, 
  Settings, 
  Cpu, 
  Atom, 
  Box as BoxIcon, 
  Circle as CircleIcon,
  Terminal,
  Download,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initPhysics, addBox, addCircle, PhysicsState } from './services/physicsEngine';
import { cn } from './utils/cn';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const ARCHITECT_SHELL_PROMPT = `Role: You are the "Master Builder" Core (App 1). Your goal is to generate clean, offline-ready Python code for App 2.
Behavior:
Output Format: Output ONLY raw Python code. Do not explain the code or say "Here is your script." No markdown backticks.
Architecture:
1. Use KivyMD for all UI elements.
2. All physics math must be encapsulated in a class called SandboxSim.
3. Privacy Shield: You are strictly forbidden from using import os, import subprocess, or import requests.
4. Error Prevention: Include basic try-except blocks in the code you generate to prevent the sandbox from crashing if the physics math fails.`;

const PHYSICS_LIBRARY_CONSTRAINT = `Constraint: You are strictly limited to the following pre-bundled libraries: numpy, scipy, sympy, and qutip.
Standard:
For orbital mechanics: Use scipy.integrate.solve_ivp.
For quantum states: Use qutip.Qobj and qutip.mesolve.
For geometric rendering: Use Kivy Canvas instructions (Line, Ellipse, Mesh).
Privacy Shield: Do not attempt to read from /data/ or /sdcard/ unless the user provides a specific local file path.`;

const EVOLUTION_LOGIC_PROMPT = `Evolution Task: You will be provided with a previous Python script. Your task is to modify it based on the user's "Evolution Request" while keeping the core class structure intact.
Rules:
Consistency: Retain the original variable names for the physics states (self.state, self.velocity).
AST Compliance: The updated code must be validatable by the ast module.
Efficiency: Only update the specific functions requested (e.g., changing the gravity constant or adding a new plot type) to save processing power on-device.`;

export default function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [physics, setPhysics] = useState<PhysicsState | null>(null);
  const [activeTab, setActiveTab] = useState<'simulation' | 'script'>('simulation');
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [evolutionRequest, setEvolutionRequest] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>(['System initialized...', 'Ready for architectural design.']);

  useEffect(() => {
    if (canvasRef.current && !physics) {
      const state = initPhysics(canvasRef.current);
      setPhysics(state);
    }
  }, [canvasRef]);

  const handleAddBox = () => {
    if (physics) {
      addBox(physics.engine, 100 + Math.random() * 200, 50);
      addLog('Added structural box element.');
    }
  };

  const handleAddCircle = () => {
    if (physics) {
      addCircle(physics.engine, 100 + Math.random() * 200, 50);
      addLog('Added dynamic sphere element.');
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const generateKivyScript = async (isEvolution: boolean = false) => {
    setIsGenerating(true);
    addLog(isEvolution ? 'Evolving existing script...' : 'Synthesizing KivyMD Physics Script...');
    
    try {
      let prompt = `${ARCHITECT_SHELL_PROMPT}\n\n${PHYSICS_LIBRARY_CONSTRAINT}\n\n`;
      
      if (isEvolution && generatedScript) {
        prompt += `${EVOLUTION_LOGIC_PROMPT}\n\nPrevious Script:\n${generatedScript}\n\nEvolution Request: ${evolutionRequest}`;
      } else {
        prompt += "Task: Generate a comprehensive Android Physics Architect tool. It must include a SciPy-based trajectory calculator and a QuTiP-based quantum state visualizer. All physics logic must reside within the SandboxSim class. Ensure it uses KivyMD widgets for all UI elements.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const newScript = response.text || '# Error generating script';
      setGeneratedScript(newScript);
      setActiveTab('script');
      addLog(isEvolution ? 'Evolution complete.' : 'Script synthesis complete.');
      if (isEvolution) setEvolutionRequest('');
    } catch (error) {
      addLog(`Error: ${isEvolution ? 'Evolution' : 'Synthesis'} failed.`);
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e4e4e4] font-mono selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-white/10 p-4 flex items-center justify-between bg-[#0f0f0f]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Atom className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tighter uppercase">Physics Architect <span className="text-blue-500">v3.14</span></h1>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Quantum-Classical Hybrid Sandbox</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={generateKivyScript}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-all text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {isGenerating ? <RotateCcw className="animate-spin" size={14} /> : <Cpu size={14} />}
            Synthesize Script
          </button>
          <button className="p-2 hover:bg-white/5 rounded-md text-white/60 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[1fr_350px] h-[calc(100vh-73px)] overflow-hidden">
        {/* Main Viewport */}
        <div className="relative flex flex-col border-r border-white/10">
          {/* Tabs */}
          <div className="flex border-b border-white/10 bg-[#0f0f0f]">
            <button 
              onClick={() => setActiveTab('simulation')}
              className={cn(
                "px-6 py-3 text-[11px] uppercase tracking-widest transition-all border-b-2",
                activeTab === 'simulation' ? "border-blue-500 text-white bg-blue-500/5" : "border-transparent text-white/40 hover:text-white/60"
              )}
            >
              Simulation View
            </button>
            <button 
              onClick={() => setActiveTab('script')}
              className={cn(
                "px-6 py-3 text-[11px] uppercase tracking-widest transition-all border-b-2",
                activeTab === 'script' ? "border-blue-500 text-white bg-blue-500/5" : "border-transparent text-white/40 hover:text-white/60"
              )}
            >
              Exported Script
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:20px_20px]">
            <AnimatePresence mode="wait">
              {activeTab === 'simulation' ? (
                <motion.div 
                  key="sim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col"
                >
                  <div ref={canvasRef} className="flex-1 w-full h-full" />
                  
                  {/* Floating Controls */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-[#151515]/90 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
                    <button onClick={handleAddBox} className="p-3 hover:bg-white/5 rounded-full text-blue-400 transition-colors" title="Add Box">
                      <BoxIcon size={20} />
                    </button>
                    <button onClick={handleAddCircle} className="p-3 hover:bg-white/5 rounded-full text-red-400 transition-colors" title="Add Circle">
                      <CircleIcon size={20} />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <button className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors shadow-lg shadow-blue-600/20">
                      <Play size={20} fill="currentColor" />
                    </button>
                    <button className="p-3 hover:bg-white/5 rounded-full text-white/60 transition-colors">
                      <RotateCcw size={20} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="script"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="w-full h-full p-6 overflow-auto bg-[#050505]"
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Terminal size={16} />
                        <span className="text-xs uppercase tracking-widest">physics_architect_kivy.py</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/5 rounded text-white/60 hover:text-white transition-colors">
                          <Download size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded text-white/60 hover:text-white transition-colors">
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                    <pre className="text-xs leading-relaxed text-white/80 font-mono bg-white/5 p-6 rounded-lg border border-white/10 overflow-x-auto">
                      {generatedScript || "# No script generated yet. Click 'Synthesize Script' to begin."}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar / Inspector */}
        <aside className="bg-[#0f0f0f] flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">Architectural Inspector</h2>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 border border-white/5 rounded-md">
                <label className="text-[10px] uppercase text-white/40 block mb-2">Evolution Request</label>
                <textarea 
                  value={evolutionRequest}
                  onChange={(e) => setEvolutionRequest(e.target.value)}
                  placeholder="e.g., Add a gravity slider or change plot colors..."
                  className="w-full bg-black/40 border border-white/10 rounded p-2 text-[10px] text-white/80 focus:outline-none focus:border-blue-500/50 min-h-[80px] resize-none"
                />
                <button 
                  onClick={() => generateKivyScript(true)}
                  disabled={isGenerating || !generatedScript || !evolutionRequest.trim()}
                  className="w-full mt-2 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[10px] uppercase tracking-widest rounded border border-blue-500/30 transition-all disabled:opacity-30"
                >
                  Evolve Script
                </button>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-md">
                <label className="text-[10px] uppercase text-white/40 block mb-2">Gravity Constant</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-400">9.81 m/s²</span>
                  <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-blue-500" />
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-md">
                <label className="text-[10px] uppercase text-white/40 block mb-2">Quantum Coherence</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-400">0.984 ψ</span>
                  <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[90%] h-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">System Console</h2>
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={i} className="text-[10px] text-white/60 border-l border-blue-500/30 pl-2 py-1">
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Engine: Matter.js + Gemini Core
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
