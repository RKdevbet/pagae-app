import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertInvoiceSchema } from "@shared/schema";
import { useCreateInvoice, useUpdateInvoice } from "@/hooks/use-invoices";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Form schema with string-based inputs that we'll coerce
const formSchema = insertInvoiceSchema.omit({
    amount: true,
    paidAmount: true,
    dueDate: true,
}).extend({
  amount: z.string().min(1, "Amount is required"),
  paidAmount: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
});

type FormData = z.infer<typeof formSchema>;

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any; // Invoice type
}

export function InvoiceDialog({ open, onOpenChange, initialData }: InvoiceDialogProps) {
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
      isRecurring: false,
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
          isRecurring: initialData.isRecurring || false,
          status: initialData.status as any,
        });
      } else {
        form.reset({
            payee: "",
            description: "",
            amount: "",
            paidAmount: "0",
            dueDate: new Date().toISOString().split("T")[0],
            isRecurring: false,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEditing ? "Edit Invoice" : "Add New Invoice"}
          </DialogTitle>
          <DialogDescription>
             {isEditing ? "Update invoice details below." : "Enter the details for your new bill."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="payee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payee</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Netflix, Utility Company" {...field} className="rounded-xl" />
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
                    <FormLabel>Amount ($)</FormLabel>
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
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {isEditing && (
                 <FormField
                control={form.control}
                name="paidAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Paid So Far ($)</FormLabel>
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Monthly subscription..." {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="rounded-xl bg-primary hover:bg-primary/90">
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
