import { useInvoices } from "@/hooks/use-invoices";
import { useAuth } from "@/hooks/use-auth";
import { format, isThisMonth, isPast } from "date-fns";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: invoices, isLoading } = useInvoices();

  if (isLoading) {
      return (
          <div className="space-y-6">
              <div className="h-20 w-1/3 bg-muted rounded-xl animate-pulse" />
              <div className="grid md:grid-cols-3 gap-6">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
              </div>
              <Skeleton className="h-96 rounded-2xl" />
          </div>
      )
  }

  const allInvoices = invoices || [];
  
  // Calculate Stats
  const totalDue = allInvoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + Number(inv.amount) - Number(inv.paidAmount), 0);

  const balance = user?.balance ? Number(user.balance) : 0;
  const formattedBalance = user?.currency === "BRL" 
    ? `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : `$${balance.toFixed(2)}`;

  const formatCurrency = (amount: number) => {
    return user?.currency === "BRL"
      ? `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : `$${amount.toFixed(2)}`;
  };
    
  const paidThisMonth = allInvoices
    .filter(inv => inv.status === 'paid' && isThisMonth(new Date(inv.dueDate)))
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const overdueCount = allInvoices
    .filter(inv => inv.status === 'overdue' || (inv.status === 'unpaid' && isPast(new Date(inv.dueDate))))
    .length;

  // Upcoming Invoices (Unpaid, sorted by due date, take 5)
  const upcomingInvoices = allInvoices
    .filter(inv => inv.status !== 'paid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
             {user?.language === "pt-BR" 
               ? `Bem-vindo de volta, ${user?.firstName || "Amigo"}` 
               : `Welcome back, ${user?.firstName || "Friend"}`}
           </h1>
           <p className="text-muted-foreground mt-2">
             {user?.language === "pt-BR" ? "Aqui está sua visão geral financeira de hoje." : "Here's your financial overview for today."}
           </p>
        </div>
        <div className="bg-card px-6 py-3 rounded-2xl border border-border/50 shadow-sm">
           <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
             {user?.language === "pt-BR" ? "Saldo Disponível" : "Available Balance"}
           </p>
           <p className="text-2xl font-display font-bold text-primary">{formattedBalance}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Total Due Card */}
         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden"
         >
            <div className="absolute top-0 right-0 p-6 opacity-5">
                <Calendar className="size-24" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {user?.language === "pt-BR" ? "Total Pendente" : "Total Outstanding"}
            </p>
            <h2 className="text-4xl font-display font-bold text-foreground">{formatCurrency(totalDue)}</h2>
            <div className="flex items-center gap-1 mt-4 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg w-fit">
               <ArrowUpRight className="size-4" />
               <span>{user?.language === "pt-BR" ? "Para pagar este mês" : "To pay this month"}</span>
            </div>
         </motion.div>

         {/* Paid Card */}
         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden"
         >
             <div className="absolute top-0 right-0 p-6 opacity-5">
                <CheckCircle2 className="size-24" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {user?.language === "pt-BR" ? "Pago este Mês" : "Paid This Month"}
            </p>
            <h2 className="text-4xl font-display font-bold text-primary">{formatCurrency(paidThisMonth)}</h2>
             <div className="flex items-center gap-1 mt-4 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg w-fit">
               <ArrowDownRight className="size-4" />
               <span>{user?.language === "pt-BR" ? "No caminho certo" : "On track"}</span>
            </div>
         </motion.div>

         {/* Overdue Card */}
         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden"
         >
             <div className="absolute top-0 right-0 p-6 opacity-5">
                <AlertCircle className="size-24" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {user?.language === "pt-BR" ? "Contas Atrasadas" : "Overdue Bills"}
            </p>
            <h2 className="text-4xl font-display font-bold text-destructive">{overdueCount}</h2>
             <div className="flex items-center gap-1 mt-4 text-sm text-destructive bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg w-fit">
               <AlertCircle className="size-4" />
               <span>{user?.language === "pt-BR" ? "Ação necessária" : "Action required"}</span>
            </div>
         </motion.div>
      </div>

      {/* Upcoming Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-border/50 flex justify-between items-center">
            <h3 className="font-display font-bold text-lg">
              {user?.language === "pt-BR" ? "Próximas Contas" : "Upcoming Bills"}
            </h3>
            <Button variant="ghost" size="sm" asChild>
                <Link href="/invoices" className="text-primary hover:text-primary/80">
                  {user?.language === "pt-BR" ? "Ver Tudo" : "View All"}
                </Link>
            </Button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-muted/30 text-left">
                        <th className="py-4 px-6 font-medium text-muted-foreground">
                          {user?.language === "pt-BR" ? "Beneficiário" : "Payee"}
                        </th>
                        <th className="py-4 px-6 font-medium text-muted-foreground">
                          {user?.language === "pt-BR" ? "Data de Vencimento" : "Due Date"}
                        </th>
                        <th className="py-4 px-6 font-medium text-muted-foreground">
                          {user?.language === "pt-BR" ? "Valor" : "Amount"}
                        </th>
                        <th className="py-4 px-6 font-medium text-muted-foreground">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {upcomingInvoices.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                {user?.language === "pt-BR" ? "Nenhuma conta próxima encontrada. Você está em dia!" : "No upcoming bills found. You're all caught up!"}
                            </td>
                        </tr>
                    ) : (
                        upcomingInvoices.map((inv) => (
                            <tr key={inv.id} className="group hover:bg-muted/30 transition-colors">
                                <td className="py-4 px-6 font-medium">{inv.payee}</td>
                                <td className="py-4 px-6 text-muted-foreground">{format(new Date(inv.dueDate), user?.language === "pt-BR" ? "dd/MM/yyyy" : "MMM dd, yyyy")}</td>
                                <td className="py-4 px-6 font-medium">{formatCurrency(Number(inv.amount))}</td>
                                <td className="py-4 px-6">
                                    <StatusBadge status={inv.status as any} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </motion.div>
    </div>
  );
}
