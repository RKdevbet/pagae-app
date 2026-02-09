import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

type Status = "paid" | "unpaid" | "overdue";

export function StatusBadge({ status }: { status: Status }) {
  const { user } = useAuth();
  const isPtBR = user?.language === "pt-BR";

  const styles = {
    paid: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    unpaid: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    overdue: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  };

  const labels = {
    paid: isPtBR ? "Pago" : "Paid",
    unpaid: isPtBR ? "Pendente" : "Pending",
    overdue: isPtBR ? "Atrasado" : "Overdue",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm",
      styles[status]
    )}>
      <span className={cn("size-1.5 rounded-full mr-1.5", 
         status === 'paid' ? 'bg-green-500' : 
         status === 'unpaid' ? 'bg-yellow-500' : 'bg-red-500'
      )} />
      {labels[status]}
    </span>
  );
}
