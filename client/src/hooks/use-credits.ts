import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCredits() {
  return useQuery({
    queryKey: [api.credits.get.path],
    queryFn: async () => {
      const res = await fetch(api.credits.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch credits");
      return api.credits.get.responses[200].parse(await res.json());
    },
  });
}

export function useAddCredits() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch(api.credits.add.path, {
        method: api.credits.add.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add credits");
      return api.credits.add.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.credits.get.path], data);
      toast({ title: "Credits Added", description: `You now have ${data.balance} credits.` });
    },
     onError: (error) => {
      toast({ title: "Purchase Failed", description: error.message, variant: "destructive" });
    }
  });
}
