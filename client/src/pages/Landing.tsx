import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, ShieldCheck, PieChart, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const features = [
  {
    icon: TrendingUp,
    title: "Smart Tracking",
    desc: "Visualize your spending habits with intuitive charts and real-time updates.",
    titlePt: "Acompanhamento Inteligente",
    descPt: "Visualize seus hábitos de gastos com gráficos intuitivos e atualizações em tempo real."
  },
  {
    icon: Sparkles,
    title: "AI Analysis",
    desc: "Generate monthly reports that identify savings opportunities and forecast trends.",
    titlePt: "Análise por IA",
    descPt: "Gere relatórios mensais que identificam oportunidades de economia e preveem tendências."
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    desc: "Bank-grade security ensures your financial data stays private and protected.",
    titlePt: "Seguro e Privado",
    descPt: "Segurança de nível bancário garante que seus dados financeiros permaneçam privados e protegidos."
  }
];

export default function Landing() {
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextFeature = () => setCurrentFeature((prev) => (prev + 1) % features.length);
  const prevFeature = () => setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);

  return (
    <div className="min-h-screen bg-background font-body selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="text-white size-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-primary">Pagaê</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex font-medium">
                <a href="/api/login">Entrar</a>
            </Button>
            <Button asChild className="rounded-full px-6 font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 bg-yellow-400 hover:bg-yellow-500 text-black border-none">
                <a href="/api/login">Começar Agora</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden flex flex-col items-center">
        {/* Background Gradients */}
        <div className="absolute top-0 -left-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 -right-10 w-[400px] h-[400px] bg-yellow-400/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
           >
             <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
               Novo: Insights com Inteligência Artificial
             </span>
             <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-600">
               Domine seu dinheiro com inteligência.
             </h1>
           </motion.div>
           
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
             Acompanhe contas, gerencie assinaturas e receba conselhos financeiros acionáveis com IA — tudo em um painel incrível.
           </motion.p>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
             <Button size="lg" className="rounded-full px-8 h-14 text-lg w-full sm:w-auto shadow-xl shadow-yellow-400/20 hover:shadow-yellow-400/30 bg-yellow-400 hover:bg-yellow-500 text-black border-none" asChild>
                <a href="/api/login">Teste Grátis</a>
             </Button>
             <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg w-full sm:w-auto" asChild>
                <a href="#features">Saiba Mais</a>
             </Button>
           </motion.div>
        </div>

        {/* Feature Carousel */}
        <div className="mt-24 w-full max-w-lg relative group px-4">
           <div className="overflow-hidden rounded-3xl border border-border/50 bg-card p-8 shadow-sm h-64 flex flex-col items-center text-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                      {(() => {
                        const Icon = features[currentFeature].icon;
                        return <Icon className="size-6" />;
                      })()}
                  </div>
                  <h3 className="text-xl font-display font-bold">{features[currentFeature].titlePt}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{features[currentFeature].descPt}</p>
                </motion.div>
              </AnimatePresence>
           </div>
           <button onClick={prevFeature} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 size-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="size-5" />
           </button>
           <button onClick={nextFeature} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 size-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="size-5" />
           </button>
           <div className="flex justify-center gap-2 mt-6">
              {features.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentFeature(i)}
                  className={`size-2 rounded-full transition-all ${currentFeature === i ? 'w-6 bg-primary' : 'bg-primary/20'}`}
                />
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Sparkles className="text-white size-5" />
                  </div>
                  <span className="font-display font-bold text-2xl tracking-tight">Pagaê</span>
                </div>
                <p className="text-green-50 text-lg max-w-md">
                  Simplificando sua vida financeira com inteligência artificial e controle intuitivo.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full">App Store</Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full">Google Play</Button>
                </div>
              </div>
              <div className="text-center md:text-right space-y-4">
                <p className="text-green-100 font-medium">© 2024 Pagaê. Todos os direitos reservados.</p>
                <div className="flex justify-center md:justify-end gap-6 text-sm text-green-200">
                  <a href="#" className="hover:text-white">Termos</a>
                  <a href="#" className="hover:text-white">Privacidade</a>
                  <a href="#" className="hover:text-white">Contato</a>
                </div>
              </div>
          </div>
      </footer>
    </div>
  );
}
