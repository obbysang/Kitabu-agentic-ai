import React, { useEffect, useRef } from 'react';
import { Send, Terminal, ShieldCheck, Zap } from 'lucide-react';
import gsap from 'gsap';

const Hero: React.FC = () => {
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const ctaRef = useRef(null);
  const badgesRef = useRef<HTMLDivElement[]>([]);

  const addToBadgesRef = (el: HTMLDivElement | null) => {
    if (el && !badgesRef.current.includes(el)) {
      badgesRef.current.push(el);
    }
  };

  useEffect(() => {
    const tl = gsap.timeline();

    // Text Animations
    tl.fromTo(titleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    )
    .fromTo(descRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    )
    .fromTo(ctaRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    );
    
    // Badge Entrance
    gsap.fromTo(badgesRef.current, 
       { scale: 0.5, opacity: 0, y: 20 },
       { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "back.out(1.7)", delay: 0.8 }
    );

    // Badge Floating Animation
    badgesRef.current.forEach((badge, i) => {
        gsap.to(badge, {
            y: -15,
            duration: 2.5 + i * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.5
        });
    });
  }, []);

  return (
    <section className="relative w-full h-[110vh] overflow-hidden bg-black text-white">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop")' // Abstract blockchain/tech
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-black/40 to-black"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center pt-20">
        
        {/* Main Headline */}
        <h1 ref={titleRef} className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.1] mb-8 max-w-5xl mx-auto opacity-0">
          The <span className="text-blue-500">AI CFO</span> for your<br />
          <span className="text-white">On-Chain Treasury</span>
        </h1>

        {/* Description */}
        <p ref={descRef} className="max-w-xl text-gray-300 text-lg mb-10 leading-relaxed text-center mx-auto opacity-0">
          Agentic intelligence meets <strong>x402 payment rails</strong>. Automate payroll, optimize yield, and settle invoices with natural language.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center gap-4 mt-4 opacity-0">
          <button className="bg-white text-black px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-200 transition-colors text-lg">
            <Terminal size={20} />
            Launch Command Dashboard
          </button>
          <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors text-lg">
            <Zap size={20} />
            View x402 Docs
          </button>
        </div>

        {/* Floating Elements (Features) */}
        
        {/* Safety Badge */}
        <div ref={addToBadgesRef} className="absolute top-[35%] right-[10%] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-2xl hidden md:flex opacity-0">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                <ShieldCheck size={20} />
            </div>
            <div className="text-left">
                <div className="text-xs text-gray-400">Security</div>
                <div className="text-sm font-semibold text-white">Daily Limit Active</div>
            </div>
        </div>

        {/* Activity Badge */}
         <div ref={addToBadgesRef} className="absolute top-[40%] left-[10%] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl py-3 px-5 flex items-center gap-3 shadow-2xl hidden md:flex opacity-0">
             <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">AI</div>
                 <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] border border-black">You</div>
             </div>
            <div className="text-xs font-semibold">Processing Batch Payroll...</div>
        </div>

      </div>

      {/* Bottom Navigation Pills */}
       <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-xs text-gray-400">
           <span className="w-2 h-2 rounded-full bg-green-500"></span>
           <span className="font-mono">System Operational</span>
           <span className="mx-2 opacity-30">|</span>
           <span>Cronos Mainnet</span>
           <span className="mx-2 opacity-30">|</span>
           <span>Gas: Low</span>
       </div>
    </section>
  );
};

export default Hero;