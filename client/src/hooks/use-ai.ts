import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type GenerateReportRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAiReports() {
  return useQuery({
    queryKey: [api.ai.listReports.path],
    queryFn: async () => {
      const res = await fetch(api.ai.listReports.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reports");
      return api.ai.listReports.responses[200].parse(await res.json());
    },
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: GenerateReportRequest) => {
      const res = await fetch(api.ai.generateReport.path, {
        method: api.ai.generateReport.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 402) {
           const error = api.ai.generateReport.responses[402].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to generate report");
      }
      return api.ai.generateReport.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ai.listReports.path] });
      // Also invalidate credits as generating a report costs a credit
      queryClient.invalidateQueries({ queryKey: [api.credits.get.path] });
      toast({ title: "Report Generated", description: "Your AI financial analysis is ready." });
    },
    onError: (error) => {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    }
  });
}
