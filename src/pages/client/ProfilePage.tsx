import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { User } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
  address: z.string().min(5, "Endereço inválido").optional().or(z.literal("")),
  number: z.string().optional().or(z.literal("")),
  complement: z.string().optional().or(z.literal("")),
  neighborhood: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "Cidade inválida").optional().or(z.literal("")),
  state: z.string().min(2, "Estado inválido").optional().or(z.literal("")),
  zipCode: z.string().min(8, "CEP inválido").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfilePage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<ProfileFormValues | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  async function loadUserProfile() {
    setLoading(true);

    const { data, error: authError } = await supabase.auth.getUser();
    const currentUser = data?.user;

    if (!currentUser || authError) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("nome_completo, telefone")
        .eq("id", currentUser.id)
        .single();

      const { data: addressData, error: addressError } = await supabase
        .from("enderecos")
        .select("rua, numero, complemento, bairro, cidade, estado, cep")
        .eq("usuario_id", currentUser.id)
        .eq("padrao", true)
        .single();

      if (userError) throw userError;
      if (addressError && addressError.code !== "PGRST116") throw addressError;

      const combinedData = {
        name: userData?.nome_completo || "",
        email: currentUser.email || "",
        phone: userData?.telefone || "",
        address: addressData?.rua || "",
        number: addressData?.numero || "",
        complement: addressData?.complemento || "",
        neighborhood: addressData?.bairro || "",
        city: addressData?.cidade || "",
        state: addressData?.estado || "",
        zipCode: addressData?.cep || "",
      };

      setUserData(combinedData);
      form.reset(combinedData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUserProfile();
  }, []);

  async function onSubmit(values: ProfileFormValues) {
    setIsSaving(true);

    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (!currentUser || authError) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    try {
      // Atualiza dados do usuário
      const { error: userError } = await supabase
        .from("usuarios")
        .update({
          nome_completo: values.name,
          telefone: values.phone,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", currentUser.id);

      if (userError) throw userError;

      // Verifica se já existe endereço padrão
      const { data: existingAddress, error: addressFetchError } = await supabase
        .from("enderecos")
        .select("id")
        .eq("usuario_id", currentUser.id)
        .eq("padrao", true)
        .single();

      if (addressFetchError && addressFetchError.code !== "PGRST116") {
        throw addressFetchError;
      }

      const enderecoData = {
        usuario_id: currentUser.id,
        rua: values.address,
        numero: values.number || null,
        complemento: values.complement || null,
        bairro: values.neighborhood || null,
        cidade: values.city,
        estado: values.state,
        cep: values.zipCode,
        padrao: true,
        atualizado_em: new Date().toISOString(),
      };

      let enderecoResult;
      if (existingAddress) {
        enderecoResult = await supabase
          .from("enderecos")
          .update(enderecoData)
          .eq("id", existingAddress.id);
      } else {
        enderecoResult = await supabase
          .from("enderecos")
          .insert({ id: crypto.randomUUID(), ...enderecoData });
      }

      if (enderecoResult.error) throw enderecoResult.error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      });

      setUserData(values);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-gray-600 text-lg">Carregando perfil...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-moto-red text-white flex items-center justify-center text-3xl font-bold mb-3">
                  {userData?.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <CardTitle style={{ textAlign: "center" }}>
                  {userData?.name}
                </CardTitle>
                <CardDescription>
                  {userData?.email ?? "sem email"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2 mt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/cliente/perfil" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/cliente/pedidos" className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <span>Meus Pedidos</span>
                  </a>
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="flex-grow">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço (Rua)</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua Exemplo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="complement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Apto, Bloco, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="Estado" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <CardFooter>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default ProfilePage;
