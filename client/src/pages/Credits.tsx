import { useCredits, useAddCredits } from "@/hooks/use-credits";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";

export default function Credits() {
  const { data: credits, isLoading } = useCredits();
  const addCredits = useAddCredits();

  const handleBuy = (amount: number) => {
    addCredits.mutate(amount);
  };

  const tiers = [
    { amount: 5, price: 5, label: "Starter", desc: "Perfect for monthly checkups" },
    { amount: 10, price: 9, label: "Pro", desc: "Best value for active users", popular: true },
    { amount: 25, price: 20, label: "Power", desc: "For detailed weekly analysis" },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-12">
           <h1 className="text-4xl font-display font-bold">Top Up Credits</h1>
           <p className="text-muted-foreground text-lg max-w-lg mx-auto">
               One credit = One detailed AI report. Credits never expire.
           </p>
           {!isLoading && (
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full text-sm font-medium">
                   Current Balance: <span className="text-primary font-bold">{credits?.balance || 0} Credits</span>
               </div>
           )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`
                        relative bg-card p-8 rounded-2xl border shadow-sm flex flex-col items-center text-center
                        ${tier.popular ? 'border-primary ring-2 ring-primary/10 shadow-lg scale-105 z-10' : 'border-border/50'}
                    `}
                >
                    {tier.popular && (
                        <div className="absolute -top-3 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                            Most Popular
                        </div>
                    )}
                    <h3 className="font-display font-bold text-xl mb-2">{tier.label}</h3>
                    <div className="text-4xl font-bold mb-2">${tier.price}</div>
                    <p className="text-sm text-muted-foreground mb-6">{tier.desc}</p>
                    
                    <div className="space-y-3 w-full mb-8 text-sm text-left">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-green-500" />
                            <span>{tier.amount} AI Reports</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-green-500" />
                            <span>Full Spending Analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-green-500" />
                            <span>Priority Generation</span>
                        </div>
                    </div>

                    <Button 
                        onClick={() => handleBuy(tier.amount)} 
                        className={`w-full rounded-xl ${tier.popular ? 'bg-primary' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
                        disabled={addCredits.isPending}
                    >
                        {addCredits.isPending ? <Loader2 className="animate-spin" /> : `Buy ${tier.amount} Credits`}
                    </Button>
                </motion.div>
            ))}
        </div>

        <div className="mt-12 p-6 bg-muted/20 rounded-2xl border border-dashed border-border text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
                <CreditCard className="size-4" />
                Payments are securely processed (simulated for demo). No real charges will be made.
            </p>
        </div>
    </div>
  );
}
