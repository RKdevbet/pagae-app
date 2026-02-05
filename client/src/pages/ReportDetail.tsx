import { useRoute, Link } from "wouter";
import { useAiReports } from "@/hooks/use-ai";
import { Loader2, ArrowLeft, TrendingUp, Lightbulb, PieChart as PieIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function ReportDetail() {
  const [, params] = useRoute("/reports/:id");
  const { data: reports, isLoading } = useAiReports();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const report = reports?.find(r => r.id === Number(params?.id));
  if (!report) return <div>Report not found</div>;

  const content = report.content as any;
  const pieData = [
    { name: "Paid", value: content.totalSpent - content.remainingDue },
    { name: "Remaining", value: content.remainingDue }
  ];
  const COLORS = ['#10b981', '#f59e0b']; // Green, Amber

  // Mock bar data for visualization since API might not return timeseries yet
  const barData = [
    { name: 'Week 1', amount: content.totalSpent * 0.2 },
    { name: 'Week 2', amount: content.totalSpent * 0.3 },
    { name: 'Week 3', amount: content.totalSpent * 0.1 },
    { name: 'Week 4', amount: content.totalSpent * 0.4 },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
            <Link href="/reports"><ArrowLeft className="size-5" /></Link>
        </Button>
        <h1 className="text-2xl font-display font-bold">Analysis Report</h1>
      </div>

      <div className="grid gap-6">
        {/* Summary Card */}
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <TrendingUp className="size-5" />
                </div>
                <h2 className="text-xl font-bold font-display">Executive Summary</h2>
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground">
                {content.summary}
            </p>
        </motion.div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
             <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm"
             >
                <h3 className="font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" /> Spending Trend
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                                cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </motion.div>

             <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm"
             >
                <h3 className="font-bold mb-6 flex items-center gap-2">
                    <PieIcon className="size-4 text-primary" /> Payment Status
                </h3>
                <div className="h-[250px] w-full flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                 <div className="flex justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-emerald-500"/>Paid</div>
                    <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-amber-500"/>Remaining</div>
                </div>
             </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm"
        >
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-600">
                    <Lightbulb className="size-5" />
                </div>
                <h2 className="text-xl font-bold font-display">AI Recommendations</h2>
            </div>
            <ul className="space-y-4">
                {content.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                            {i + 1}
                        </span>
                        <span className="text-muted-foreground">{rec}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
      </div>
    </div>
  );
}
