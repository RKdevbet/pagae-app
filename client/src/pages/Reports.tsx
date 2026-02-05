import { useAiReports, useGenerateReport } from "@/hooks/use-ai";
import { useCredits } from "@/hooks/use-credits";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, FileText, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { data: reports, isLoading } = useAiReports();
  const { data: credits } = useCredits();
  const generateMutation = useGenerateReport();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if ((credits?.balance || 0) <= 0) {
        toast({ title: "Insufficient Credits", description: "Please top up your balance to generate a report.", variant: "destructive" });
        return;
    }
    await generateMutation.mutateAsync({});
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl md:text-4xl font-display font-bold">AI Financial Reports</h1>
           <p className="text-muted-foreground mt-2">Deep insights into your spending habits and financial health.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 gap-2">
                    <Sparkles className="size-4" />
                    Generate New Report
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-display">Generate Monthly Analysis</DialogTitle>
                    <DialogDescription>
                        This will use <span className="font-bold text-foreground">1 Credit</span>. You have {credits?.balance} remaining.
                        Our AI will analyze your invoices, payment history, and overdue bills to provide actionable recommendations.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 flex justify-center">
                   <div className="bg-primary/5 p-4 rounded-xl flex flex-col items-center text-center">
                        <Sparkles className="size-8 text-primary mb-2" />
                        <p className="text-sm font-medium text-primary">Powered by GPT-4o Analysis</p>
                   </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
                    <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="rounded-xl">
                        {generateMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Confirm & Generate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
            <div className="col-span-full py-12 flex justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        ) : reports?.length === 0 ? (
            <div className="col-span-full bg-card p-12 rounded-2xl border border-dashed border-border flex flex-col items-center text-center">
                <div className="size-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <FileText className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Reports Yet</h3>
                <p className="text-muted-foreground max-w-sm mb-6">Generate your first report to start tracking your financial health with AI intelligence.</p>
                <Button onClick={() => setIsDialogOpen(true)}>Create First Report</Button>
            </div>
        ) : (
            reports?.map((report, i) => (
                <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Link href={`/reports/${report.id}`}>
                        <div className="group bg-card hover:border-primary/50 transition-all p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md cursor-pointer h-full flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <FileText className="size-5" />
                                </div>
                                <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                                    {format(new Date(report.createdAt), "MMM dd, yyyy")}
                                </span>
                            </div>
                            <h3 className="font-display font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                                Financial Health Summary
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                                {(report.content as any).summary}
                            </p>
                            <div className="flex items-center text-primary text-sm font-medium mt-auto">
                                View Analysis <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))
        )}
      </div>
    </div>
  );
}
