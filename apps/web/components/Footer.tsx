import React from 'react';
import { ArrowRight, Bot, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative w-full py-20 bg-[#050505] overflow-hidden text-white">
        
      {/* Cosmic Background Effect */}
      <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute inset-0 bg-radial-gradient from-blue-900/20 via-black to-black"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                  <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-tight">
                      Automate your<br />
                      <span className="text-blue-500">on-chain finance</span>
                  </h2>
                  <p className="text-gray-400 text-lg max-w-md">
                      Join the future of treasury management. Built on Cronos with the AI Agent SDK.
                  </p>
              </div>
              <div className="flex justify-start md:justify-end">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-sm backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-4">
                          <Bot className="text-blue-400" />
                          <span className="font-semibold">Ready to upgrade?</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-6">
                          Integrate Kitabu into your workflow today.
                      </p>
                      <button className="w-full bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                          Get Early Access
                      </button>
                  </div>
              </div>
          </div>

          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                   <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white">
                        <Bot size={14} />
                   </div>
                   <span className="font-bold text-lg">Kitabu</span>
              </div>

              <div className="flex gap-8 text-sm text-gray-400">
                  <a href="#" className="hover:text-white">Features</a>
                  <a href="#" className="hover:text-white">Security</a>
                  <a href="#" className="hover:text-white">x402 Docs</a>
                  <a href="#" className="hover:text-white">Cronos</a>
              </div>

              <div className="flex gap-4">
                  <a href="#" className="text-gray-400 hover:text-white"><Twitter size={20} /></a>
                  <a href="#" className="text-gray-400 hover:text-white"><Github size={20} /></a>
              </div>
          </div>
          
          <div className="mt-10 text-center text-xs text-gray-600">
              © 2024 Kitabu. Built for the Cronos AI Hackathon.
          </div>
      </div>
    </footer>
  );
};

export default Footer;