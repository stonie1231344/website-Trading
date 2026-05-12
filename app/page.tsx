"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; 

export default function Page() {
  const router = useRouter();
  const [menu, setMenu] = useState<"coins" | "accounts" | "tools" | "learn" | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async () => {
    if (!email || !password) return;
    
    setLoading(true);
    try {
      if (authMode === "register") {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        
        if (data.session) {
          router.push("/dashboard");
        } else {
          setAuthMode("login");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Auth Error:", error.message);
      if (!error.message.includes("already registered")) {
        alert(error.message);
      } else {
        setAuthMode("login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-[#0d0d0d] text-white overflow-hidden font-sans">
      
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* AUTH MODAL */}
      {authOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all">
          <div className="bg-[#161616] p-10 rounded-[2rem] border border-white/10 w-[420px] shadow-2xl relative">
            <button onClick={() => setAuthOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-all text-xl">✕</button>
            <h2 className="text-3xl font-bold mb-8 text-center tracking-tight">
              {authMode === "login" ? "Welcome Back" : "Join the Future"}
            </h2>
            <div className="space-y-5">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 p-4 rounded-xl outline-none border border-white/10 focus:border-green-500 transition-all text-white" />
              <input type="password" placeholder="Passwort" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 p-4 rounded-xl outline-none border border-white/10 focus:border-green-500 transition-all text-white" />
              <button onClick={handleAuthAction} disabled={loading} className="w-full py-4 bg-green-500 text-black font-black rounded-xl mt-4 hover:bg-green-400 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all transform active:scale-95">
                {loading ? "Processing..." : authMode === "login" ? "Login" : "Create Account"}
              </button>
              <p onClick={() => setAuthMode(authMode === "login" ? "register" : "login")} className="text-center text-sm text-gray-400 cursor-pointer hover:text-green-500 transition-all">
                {authMode === "login" ? "New here? Create account" : "Already have an account? Sign in"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER NAVIGATION */}
      <nav className="w-full max-w-7xl flex justify-between items-center px-12 py-8 z-50">
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-bold tracking-tighter">Trust</span>
          <span className="text-2xl font-bold tracking-tighter text-green-500">Capital</span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-400 uppercase tracking-widest">
          {["Coins", "Accounts", "Tools", "Learn"].map((item) => (
            <div key={item} className="relative group">
              <button onClick={() => item === "Accounts" ? setMenu(menu === "accounts" ? null : "accounts") : null} className="hover:text-white transition-colors relative">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-green-500 transition-all group-hover:w-full"></span>
              </button>

              {item === "Accounts" && menu === "accounts" && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 bg-[#161616] border border-white/10 p-2 rounded-xl shadow-2xl z-[60] animate-in fade-in zoom-in duration-200">
                  <Link href="/dashboard" className="block w-full text-center py-4 bg-white/5 text-white font-bold rounded-lg hover:bg-white/10 transition text-xs uppercase tracking-widest">
                    Dashboard
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button onClick={() => { setAuthMode("register"); setAuthOpen(true); }} className="px-6 py-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all font-bold">Register</button>
          <button onClick={() => { setAuthMode("login"); setAuthOpen(true); }} className="px-6 py-2 rounded-full bg-green-500 text-black font-bold hover:bg-green-400 transition-all shadow-lg shadow-green-500/20">Login</button>
        </div>
      </nav>

      {/* MAIN HERO SECTION */}
      <main className="flex flex-col items-center justify-center flex-grow text-center px-4 z-10">
        <div className="mb-6 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/5 text-green-400 text-xs font-bold tracking-[0.2em] uppercase animate-fade-in">
          Next Gen Digital Assets
        </div>

        <h1 className="text-7xl md:text-[10rem] font-black tracking-[-0.05em] leading-[0.85] mb-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          INVEST IN <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-700">FUTURE</span>
        </h1>

        <p className="max-w-xl text-gray-400 text-lg md:text-xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Entdecke das Ökosystem von Trust Capital. <br />
          Sicheres Trading und automatisiertes Staking in Sekunden.
        </p>

        <div className="flex flex-col md:flex-row gap-6 items-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
          <button onClick={() => { setAuthMode("register"); setAuthOpen(true); }} className="group relative px-12 py-5 bg-white text-black font-black text-xl rounded-2xl hover:scale-105 transition-all">
            GET STARTED
            <div className="absolute inset-0 bg-green-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-all -z-10"></div>
          </button>
          <button className="px-12 py-5 border border-white/10 bg-white/5 backdrop-blur-md text-white font-bold text-xl rounded-2xl hover:bg-white/10 transition-all">
            EXPLORE TOOLS
          </button>
        </div>

        <div className="mt-24 grid grid-cols-2 md:grid-cols-3 gap-12 text-left opacity-60">
            <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Active Users</p>
                <p className="text-2xl font-bold">12.4k+</p>
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Assets</p>
                <p className="text-2xl font-bold">$42.8M</p>
            </div>
            <div className="hidden md:block">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Live Profit</p>
                <p className="text-2xl font-bold text-green-500">+12.4%</p>
            </div>
        </div>
      </main>

      <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </div>
  );
}