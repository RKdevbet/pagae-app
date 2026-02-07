import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, ShieldCheck, PieChart } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-body selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="text-white size-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Pagaê</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex font-medium">
                <a href="/api/login">Log In</a>
            </Button>
            <Button asChild className="rounded-full px-6 font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                <a href="/api/login">Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 -left-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 -right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
           >
             <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
               New: AI-Powered Insights
             </span>
             <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
               Master your money with intelligent tracking.
             </h1>
           </motion.div>
           
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
             Track bills, manage subscriptions, and get actionable financial advice powered by AI—all in one beautiful dashboard.
           </motion.p>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
             <Button size="lg" className="rounded-full px-8 h-14 text-lg w-full sm:w-auto shadow-xl shadow-primary/20 hover:shadow-primary/30" asChild>
                <a href="/api/login">Start Free Trial</a>
             </Button>
             <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg w-full sm:w-auto" asChild>
                <a href="#features">Learn More</a>
             </Button>
           </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    {
                        icon: TrendingUp,
                        title: "Smart Tracking",
                        desc: "Visualise your spending habits with intuitive charts and real-time updates."
                    },
                    {
                        icon: Sparkles,
                        title: "AI Analysis",
                        desc: "Generate monthly reports that identify savings opportunities and forecast trends."
                    },
                    {
                        icon: ShieldCheck,
                        title: "Secure & Private",
                        desc: "Bank-grade security ensures your financial data stays private and protected."
                    }
                ].map((feature, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                            <feature.icon className="size-6" />
                        </div>
                        <h3 className="text-xl font-display font-bold mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
              <p>&copy; 2024 Pagaê. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}
