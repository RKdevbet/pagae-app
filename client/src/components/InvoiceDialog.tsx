import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertInvoiceSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useCreateInvoice, useUpdateInvoice } from "@/hooks/use-invoices";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Form schema with string-based inputs that we'll coerce
const formSchema = insertInvoiceSchema.omit({
    amount: true,
    paidAmount: true,
    dueDate: true,
    totalInstallments: true,
    currentInstallment: true,
}).extend({
  amount: z.string().min(1, "Amount is required"),
  paidAmount: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  totalInstallments: z.string().optional(),
  currentInstallment: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any; // Invoice type
}

export function InvoiceDialog({ open, onOpenChange, initialData }: InvoiceDialogProps) {
  const { user } = useAuth();
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  
  const isEditing = !!initialData;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payee: "",
      description: "",
      amount: "",
      paidAmount: "0",
      dueDate: new Date().toISOString().split("T")[0],
      recurrenceType: "none",
      totalInstallments: "1",
      currentInstallment: "1",
      status: "unpaid",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          payee: initialData.payee,
          description: initialData.description || "",
          amount: initialData.amount.toString(),
          paidAmount: initialData.paidAmount?.toString() || "0",
          dueDate: new Date(initialData.dueDate).toISOString().split("T")[0],
          recurrenceType: initialData.recurrenceType || "none",
          totalInstallments: initialData.totalInstallments?.toString() || "1",
          currentInstallment: initialData.currentInstallment?.toString() || "1",
          status: initialData.status as any,
        });
      } else {
        form.reset({
            payee: "",
            description: "",
            amount: "",
            paidAmount: "0",
            dueDate: new Date().toISOString().split("T")[0],
            recurrenceType: "none",
            totalInstallments: "1",
            currentInstallment: "1",
            status: "unpaid",
        });
      }
    }
  }, [open, initialData, form]);

  const onSubmit = async (values: FormData) => {
    try {
      // Manual coercion and validation to match API
      const payload = {
        ...values,
        amount: parseFloat(values.amount),
        paidAmount: values.paidAmount ? parseFloat(values.paidAmount) : 0,
        dueDate: new Date(values.dueDate),
        totalInstallments: values.totalInstallments ? parseInt(values.totalInstallments) : undefined,
        currentInstallment: values.currentInstallment ? parseInt(values.currentInstallment) : undefined,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: initialData.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const recurrenceType = form.watch("recurrenceType");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEditing 
              ? (user?.language === "pt-BR" ? "Editar Fatura" : "Edit Invoice") 
              : (user?.language === "pt-BR" ? "Adicionar Nova Fatura" : "Add New Invoice")}
          </DialogTitle>
          <DialogDescription>
             {isEditing 
               ? (user?.language === "pt-BR" ? "Atualize os detalhes da fatura abaixo." : "Update invoice details below.") 
               : (user?.language === "pt-BR" ? "Insira os detalhes da sua nova conta." : "Enter the details for your new bill.")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="payee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{user?.language === "pt-BR" ? "Beneficiário" : "Payee"}</FormLabel>
                  <FormControl>
                    <Input placeholder={user?.language === "pt-BR" ? "ex: Netflix, CPFL" : "e.g. Netflix, Utility Company"} {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{user?.language === "pt-BR" ? "Valor (R$)" : "Amount ($)"}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{user?.language === "pt-BR" ? "Data de Vencimento" : "Due Date"}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="recurrenceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{user?.language === "pt-BR" ? "Recorrência" : "Recurrence"}</FormLabel>
                  <select 
                    {...field} 
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background"
                  >
                    <option value="none">{user?.language === "pt-BR" ? "Nenhuma" : "No Recurrence"}</option>
                    <option value="monthly">{user?.language === "pt-BR" ? "Mensal" : "Monthly"}</option>
                    <option value="annual">{user?.language === "pt-BR" ? "Anual" : "Annual"}</option>
                    <option value="installment">{user?.language === "pt-BR" ? "Parcelamento" : "Installment"}</option>
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {recurrenceType === "installment" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentInstallment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{user?.language === "pt-BR" ? "Parcela Atual" : "Current"}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalInstallments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{user?.language === "pt-BR" ? "Total de Parcelas" : "Total"}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {isEditing && (
                 <FormField
                control={form.control}
                name="paidAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{user?.language === "pt-BR" ? "Valor Pago Até Agora (R$)" : "Amount Paid So Far ($)"}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{user?.language === "pt-BR" ? "Descrição (Opcional)" : "Description (Optional)"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={user?.language === "pt-BR" ? "Assinatura mensal..." : "Monthly subscription..."} 
                      {...field} 
                      value={field.value || ""}
                      className="rounded-xl" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                {user?.language === "pt-BR" ? "Cancelar" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isPending} className="rounded-xl bg-primary hover:bg-primary/90">
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEditing 
                  ? (user?.language === "pt-BR" ? "Salvar Alterações" : "Save Changes") 
                  : (user?.language === "pt-BR" ? "Criar Fatura" : "Create Invoice")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
