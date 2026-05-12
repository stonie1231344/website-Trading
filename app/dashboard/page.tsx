"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; // Importiert für Redirect
import { createChart, ColorType } from "lightweight-charts";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [menu, setMenu] = useState<"Coins" | "Accounts" | "Tools" | "Learn" | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [percent, setPercent] = useState<number>(0);

  const [balance, setBalance] = useState<number>(0); 
  const [dailyProfit, setDailyProfit] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  const usdToEur = 0.92;

  const formatEuro = (val: number) => {
    return val.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "€";
  };

  // --- LOGOUT FUNKTION ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setBalance(0);
    setDailyProfit(0);
    router.push("/");
  };

  // --- BACKEND LOGIK ---
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from("profiles").select("balance, daily_profit").eq("id", user.id).single();
        if (data) {
          setBalance(Number(data.balance) || 0);
          setDailyProfit(Number(data.daily_profit) || 0);
        }
      } else {
        setUserId(null);
        setBalance(0);
        setDailyProfit(0);
      }
      setIsLoaded(true);
    };
    fetchUserData();
  }, []);

  const handleBuy = async () => {
    if (!userId) return;
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && btcPrice && userId) {
      const buyValueEur = numAmount * btcPrice * usdToEur;
      const newBalance = balance + buyValueEur;
      const { error } = await supabase.from("profiles").update({ balance: newBalance }).eq("id", userId);
      if (!error) {
        setBalance(newBalance);
        setAmount("");
        // Alert entfernt
      }
    }
  };

  useEffect(() => {
    if (!isLoaded || !userId || balance <= 0) return;
    const growthInterval = setInterval(async () => {
      const growthPerStep = 0.000333; 
      const addedValue = balance * growthPerStep;
      const newBalance = balance + addedValue;
      const newProfit = dailyProfit + addedValue;
      setBalance(newBalance);
      setDailyProfit(newProfit);
      await supabase.from("profiles").update({ balance: newBalance, daily_profit: newProfit }).eq("id", userId);
    }, 120000); 
    return () => clearInterval(growthInterval);
  }, [isLoaded, userId, balance, dailyProfit]);

  // --- CHART SETUP ---
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 500,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#6b7280" },
      grid: { vertLines: { color: "rgba(255,255,255,0.05)" }, horzLines: { color: "rgba(255,255,255,0.05)" } },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.1)" },
      timeScale: { borderColor: "rgba(255,255,255,0.1)" },
    });
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#22c55e", downColor: "#ef4444", borderVisible: false,
      wickUpColor: "#22c55e", wickDownColor: "#ef4444",
    });
    fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=60")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((c: any) => ({
          time: c[0] / 1000, open: +c[1], high: +c[2], low: +c[3], close: +c[4],
        }));
        candleSeries.setData(formatted);
        setBtcPrice(formatted[formatted.length - 1].close);
      });
    return () => chart.remove();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-900/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* HEADER NAVIGATION */}
      <nav className="w-full max-w-7xl mx-auto flex justify-between items-center px-8 py-8 z-50 relative">
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-bold tracking-tighter">Trust</span>
          <span className="text-2xl font-bold tracking-tighter text-green-500">Capital</span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-xs font-medium text-gray-400 uppercase tracking-widest">
          {["Coins", "Accounts", "Tools", "Learn"].map((item) => (
            <button key={item} className="hover:text-white transition-colors relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-green-500 transition-all group-hover:w-full"></span>
            </button>
          ))}
        </div>

        <div className="flex gap-4 items-center">
            {isLoaded && userId && (
                <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                   <Image src="/snake-svgrepo-com.svg" alt="Nutzer" width={24} height={24} />
                </div>
            )}
            <button 
              onClick={handleLogout} 
              className="px-6 py-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all font-bold text-sm"
            >
              Abmelden
            </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] shadow-2xl group hover:border-green-500/30 transition-all">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Portfolio Guthaben</span>
                <span className="text-green-500">🛡️</span>
              </div>
              <div className="text-4xl font-black tracking-tighter mb-2">{formatEuro(balance)}</div>
              <div className="text-green-400 text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                +{formatEuro(dailyProfit)} (+1% / Std.)
              </div>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] shadow-2xl group hover:border-green-500/30 transition-all">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Auto-Staking Profit</span>
                <div className="w-5 h-5 border border-gray-600 rounded-full flex items-center justify-center text-[10px]">i</div>
              </div>
              <div className="text-4xl font-black tracking-tighter mb-2">+{formatEuro(dailyProfit)}</div>
              <div className="text-gray-500 text-sm font-bold uppercase tracking-widest">Tägliche Zinseszinsen</div>
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl">
                        <Image src="/btc.svg" alt="BTC" width={32} height={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">Bitcoin / USDT</h2>
                        <p className="text-green-500 font-mono font-bold">{btcPrice ? `$ ${btcPrice.toLocaleString()}` : "Lädt..."}</p>
                    </div>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl">
                    {["1S", "4S", "1T", "1W"].map(t => (
                        <button key={t} className={`px-4 py-2 rounded-lg text-[10px] font-black transition ${t === '1T' ? 'bg-green-500 text-black' : 'text-gray-500 hover:text-white'}`}>{t}</button>
                    ))}
                </div>
            </div>
            <div ref={chartRef} className="w-full" />
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] shadow-2xl sticky top-8">
            <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8">
              <button className="flex-1 py-3 bg-green-500 text-black font-black rounded-xl text-sm transition transform active:scale-95 uppercase tracking-widest">Kaufen</button>
              <button className="flex-1 py-3 text-gray-500 font-bold text-sm uppercase tracking-widest">Verkaufen</button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Marktpreis (USDT)</label>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 focus-within:border-green-500/50 transition-all">
                   <input type="text" value={btcPrice?.toFixed(2) || ""} className="bg-transparent text-white font-black text-xl outline-none w-full" readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Menge (BTC)</label>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 focus-within:border-green-500/50 transition-all">
                   <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-transparent text-white font-black text-xl outline-none w-full" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map(p => (
                  <button key={p} onClick={() => setPercent(p)} className={`py-2 rounded-xl text-[10px] font-black border transition ${percent === p ? 'bg-green-500 border-green-500 text-black' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>{p}%</button>
                ))}
              </div>

              <div className="pt-6 border-t border-white/5">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Gesamtwert</span>
                    <span className="text-2xl font-black text-green-500 tracking-tighter">
                       {amount && btcPrice ? formatEuro(parseFloat(amount) * btcPrice * usdToEur) : "0,00€"}
                    </span>
                 </div>
                 <button 
                  onClick={handleBuy}
                  className="w-full py-5 bg-green-500 text-black font-black text-lg rounded-[1.5rem] hover:bg-green-400 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all transform active:scale-95 uppercase tracking-widest"
                 >
                  Kauf bestätigen
                 </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </div>
  );
}