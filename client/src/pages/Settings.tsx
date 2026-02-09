import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe, Coins, Bell, Wallet } from "lucide-react";
import { useState, useEffect } from "react";

export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [balanceInput, setBalanceInput] = useState("");
  const [nicknameInput, setNicknameInput] = useState("");

  useEffect(() => {
    if (user) {
      setBalanceInput(user.balance.toString());
      setNicknameInput(user.nickname || "");
    }
  }, [user]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await apiRequest("PATCH", "/api/user/settings", updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: user?.language === "pt-BR" ? "Configurações Salvas" : "Settings Saved" });
    }
  });

  const handleLanguageChange = (val: string) => {
    updateSettingsMutation.mutate({ language: val });
  };

  const handleCurrencyChange = (val: string) => {
    updateSettingsMutation.mutate({ currency: val });
  };

  const handleNotificationsToggle = (val: boolean) => {
    updateSettingsMutation.mutate({ notificationsEnabled: val });
  };

  const handleUpdateBalance = () => {
    updateSettingsMutation.mutate({ balance: parseFloat(balanceInput) });
  };

  const handleUpdateNickname = () => {
    updateSettingsMutation.mutate({ nickname: nicknameInput });
  };

  const t = (en: string, pt: string) => user?.language === "pt-BR" ? pt : en;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">{t("Settings", "Configurações")}</h1>
        <p className="text-muted-foreground mt-2">{t("Manage your account preferences and financial goals.", "Gerencie suas preferências de conta e objetivos financeiros.")}</p>
      </div>

      <div className="grid gap-6">
        {/* Profile */}
        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/100 dark:bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-5 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <CardTitle>{t("Profile", "Perfil")}</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">{t("Update your public information.", "Atualize suas informações públicas.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <Label>{t("Nickname", "Apelido")}</Label>
                <p className="text-sm text-muted-foreground">{t("How you'd like to be called.", "Como você gostaria de ser chamado.")}</p>
                <div className="mt-2 flex gap-2">
                  <Input 
                    value={nicknameInput} 
                    onChange={(e) => setNicknameInput(e.target.value)}
                    className="max-w-[300px] rounded-xl"
                  />
                  <Button onClick={handleUpdateNickname} disabled={updateSettingsMutation.isPending} className="rounded-xl">
                    {updateSettingsMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {t("Update", "Atualizar")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/100 dark:bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="size-5 text-primary" />
              <CardTitle>{t("Localization", "Localização")}</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">{t("Choose your preferred language and date formats.", "Escolha seu idioma preferido e formatos de data.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>{t("Language", "Idioma")}</Label>
                <p className="text-sm text-muted-foreground">{t("Select the display language for the app.", "Selecione o idioma de exibição do aplicativo.")}</p>
              </div>
              <Select value={user?.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="pt-BR">Português (BR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Financial */}
        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/100 dark:bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Wallet className="size-5 text-primary" />
              <CardTitle>{t("Financial Settings", "Configurações Financeiras")}</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">{t("Configure your currency and initial balance.", "Configure sua moeda e saldo inicial.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>{t("Currency", "Moeda")}</Label>
                <p className="text-sm text-muted-foreground">{t("Select your primary currency.", "Selecione sua moeda principal.")}</p>
              </div>
              <Select value={user?.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="BRL">BRL (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <Label>{t("Available Balance", "Saldo Disponível")}</Label>
                <p className="text-sm text-muted-foreground">{t("Update your current salary or available funds.", "Atualize seu salário atual ou fundos disponíveis.")}</p>
                <div className="mt-2 flex gap-2">
                  <Input 
                    type="number" 
                    value={balanceInput} 
                    onChange={(e) => setBalanceInput(e.target.value)}
                    className="max-w-[200px] rounded-xl"
                  />
                  <Button onClick={handleUpdateBalance} disabled={updateSettingsMutation.isPending} className="rounded-xl">
                    {updateSettingsMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {t("Update", "Atualizar")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/100 dark:bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="size-5 text-primary" />
              <CardTitle>{t("Notifications", "Notificações")}</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">{t("Control how you receive alerts.", "Controle como você recebe alertas.")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("Enable Notifications", "Ativar Notificações")}</Label>
                <p className="text-sm text-muted-foreground">{t("Receive alerts for overdue bills and payments.", "Receba alertas para contas vencidas e pagamentos.")}</p>
              </div>
              <Switch checked={user?.notificationsEnabled} onCheckedChange={handleNotificationsToggle} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}