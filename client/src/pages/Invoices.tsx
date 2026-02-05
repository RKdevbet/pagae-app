import { useInvoices, useDeleteInvoice, useUpdateInvoice } from "@/hooks/use-invoices";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal, Pencil, Trash2, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { InvoiceDialog } from "@/components/InvoiceDialog";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices();
  const deleteMutation = useDeleteInvoice();
  const updateMutation = useUpdateInvoice();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingInvoice(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
        await deleteMutation.mutateAsync(id);
    }
  };

  const handleMarkPaid = async (invoice: any) => {
    await updateMutation.mutateAsync({
        id: invoice.id,
        status: "paid",
        paidAmount: Number(invoice.amount)
    });
  };

  const filteredInvoices = invoices?.filter(inv => {
    if (filter === "all") return true;
    return inv.status === filter;
  }) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl md:text-4xl font-display font-bold">Invoices</h1>
           <p className="text-muted-foreground mt-2">Manage your bills, subscriptions, and payments.</p>
        </div>
        <Button onClick={handleCreate} className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            <Plus className="mr-2 size-4" />
            Add Invoice
        </Button>
      </div>

      <div className="flex items-center gap-4">
          <Tabs defaultValue="all" onValueChange={setFilter} className="w-full sm:w-auto">
            <TabsList className="bg-card border border-border/50 p-1 rounded-xl h-auto">
                <TabsTrigger value="all" className="rounded-lg px-4 py-2">All</TabsTrigger>
                <TabsTrigger value="unpaid" className="rounded-lg px-4 py-2">Pending</TabsTrigger>
                <TabsTrigger value="overdue" className="rounded-lg px-4 py-2">Overdue</TabsTrigger>
                <TabsTrigger value="paid" className="rounded-lg px-4 py-2">Paid</TabsTrigger>
            </TabsList>
          </Tabs>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
            <div className="p-8 space-y-4">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-muted/30 text-left text-sm border-b border-border/50">
                            <th className="py-4 px-6 font-medium text-muted-foreground">Payee</th>
                            <th className="py-4 px-6 font-medium text-muted-foreground">Due Date</th>
                            <th className="py-4 px-6 font-medium text-muted-foreground">Amount</th>
                            <th className="py-4 px-6 font-medium text-muted-foreground w-48">Progress</th>
                            <th className="py-4 px-6 font-medium text-muted-foreground">Status</th>
                            <th className="py-4 px-6 font-medium text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                         <AnimatePresence>
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                    No invoices found.
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((inv) => {
                                const percent = Math.min(100, Math.round((Number(inv.paidAmount) / Number(inv.amount)) * 100));
                                return (
                                <motion.tr 
                                    key={inv.id} 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }}
                                    className="group hover:bg-muted/30 transition-colors"
                                >
                                    <td className="py-4 px-6">
                                        <p className="font-medium text-foreground">{inv.payee}</p>
                                        {inv.description && <p className="text-xs text-muted-foreground truncate max-w-[150px]">{inv.description}</p>}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-muted-foreground">{format(new Date(inv.dueDate), "MMM dd, yyyy")}</td>
                                    <td className="py-4 px-6 font-medium">${Number(inv.amount).toFixed(2)}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <Progress value={percent} className="h-2 w-24 bg-muted" indicatorClassName={percent === 100 ? "bg-green-500" : "bg-primary"} />
                                            <span className="text-xs text-muted-foreground w-8">{percent}%</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <StatusBadge status={inv.status as any} />
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <MoreHorizontal className="size-4" />
                                                </DropdownMenuTrigger>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                                <DropdownMenuItem onClick={() => handleEdit(inv)}>
                                                    <Pencil className="mr-2 size-4" /> Edit
                                                </DropdownMenuItem>
                                                {inv.status !== 'paid' && (
                                                    <DropdownMenuItem onClick={() => handleMarkPaid(inv)} className="text-green-600 focus:text-green-600">
                                                        <Check className="mr-2 size-4" /> Mark Paid
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => handleDelete(inv.id)} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 size-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </motion.tr>
                            )})
                        )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        )}
      </div>

      <InvoiceDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        initialData={editingInvoice}
      />
    </div>
  );
}
