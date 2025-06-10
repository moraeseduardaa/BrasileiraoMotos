import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  Star,
  AlertCircle,
  Calendar,
  Eye,
  MessageSquare,
} from "lucide-react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28DFF",
  "#FF6B9D",
];

interface DashboardSummary {
  totalSales: number;
  totalOrders: number;
  averageOrder: number;
  newCustomers: number;
  lowStockProducts: number;
  conversionRate: number;
  totalViews: number;
  averageRating: number;
}

interface SalesData {
  date: string;
  vendas: number;
  pedidos: number;
}

interface ProductPerformance {
  name: string;
  vendas: number;
  estoque: number;
  views: number;
}

interface CategoryData {
  name: string;
  value: number;
  revenue: number;
}

interface Testimonial {
  id: string;
  comentario: string;
  nota: number;
  criado_em: string;
  usuarios?: {
    nome_completo: string;
    email: string;
  };
  produtos?: {
    nome: string;
  };
}

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalSales: 0,
    totalOrders: 0,
    averageOrder: 0,
    newCustomers: 0,
    lowStockProducts: 0,
    conversionRate: 0,
    totalViews: 0,
    averageRating: 0,
  });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productPerformance, setProductPerformance] = useState<
    ProductPerformance[]
  >([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [pendingTestimonials, setPendingTestimonials] = useState<Testimonial[]>(
    []
  );
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState({
    codigo: "",
    tipo_desconto: "porcentagem",
    valor_desconto: 0,
    valor_minimo_pedido: 0,
    data_inicio: "",
    data_fim: "",
    descricao: "",
  });
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [newResponse, setNewResponse] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);

      // Vendas e pedidos com data
      const { data: orders, error: ordersError } = await supabase
        .from("pedidos")
        .select("valor_total, criado_em, status")
        .order("criado_em", { ascending: false });

      if (ordersError) throw ordersError;

      const totalSales = orders.reduce(
        (sum, order) => sum + (order.valor_total || 0),
        0
      );
      const totalOrders = orders.length;
      const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Vendas por data (últimos 30 dias)
      const last30Days = orders
        .filter((order) => {
          const orderDate = new Date(order.criado_em);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return orderDate >= thirtyDaysAgo;
        })
        .reduce(
          (acc: Record<string, { vendas: number; pedidos: number }>, order) => {
            const date = new Date(order.criado_em).toLocaleDateString("pt-BR");
            if (!acc[date]) {
              acc[date] = { vendas: 0, pedidos: 0 };
            }
            acc[date].vendas += order.valor_total || 0;
            acc[date].pedidos += 1;
            return acc;
          },
          {}
        );

      const salesDataArray = Object.entries(last30Days)
        .map(([date, data]) => ({ date, ...data }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      // Produtos com desempenho baseado nos itens vendidos
      const { data: productSales, error: productSalesError } =
        await supabase.from("itens_pedido").select(`
          quantidade,
          preco_unitario,
          produtos(nome, estoque)
        `);

      if (productSalesError) throw productSalesError;

      // Agregar vendas por produto
      const productMap = new Map();
      productSales.forEach((item) => {
        if (item.produtos) {
          const productName = item.produtos.nome;
          if (!productMap.has(productName)) {
            productMap.set(productName, {
              name: productName,
              vendas: 0,
              estoque: item.produtos.estoque || 0,
              revenue: 0,
            });
          }
          const product = productMap.get(productName);
          product.vendas += item.quantidade || 0;
          product.revenue +=
            (item.quantidade || 0) * (item.preco_unitario || 0);
        }
      });

      const productPerformanceData = Array.from(productMap.values())
        .sort((a, b) => b.vendas - a.vendas)
        .slice(0, 10);

      // Produtos com estoque baixo
      const { data: allProducts, error: allProductsError } = await supabase
        .from("produtos")
        .select("estoque");

      if (allProductsError) throw allProductsError;

      const lowStockProducts = allProducts.filter(
        (product) => (product.estoque || 0) < 10
      ).length;

      // Categorias com dados
      const { data: categories, error: categoriesError } = await supabase.from(
        "categorias"
      ).select(`
          nome,
          produtos(id, preco)
        `);

      if (categoriesError) throw categoriesError;

      const categoryDataArray = categories
        .map((category) => {
          const totalProducts = category.produtos?.length || 0;

          // Calcular receita da categoria baseada nas vendas
          let categoryRevenue = 0;
          if (category.produtos) {
            category.produtos.forEach((product) => {
              const productSalesData = productSales.filter(
                (sale) =>
                  sale.produtos &&
                  sale.produtos.nome &&
                  category.produtos.some((p) => p.id === product.id)
              );
              productSalesData.forEach((sale) => {
                categoryRevenue +=
                  (sale.quantidade || 0) * (sale.preco_unitario || 0);
              });
            });
          }

          return {
            name: category.nome,
            value: totalProducts,
            revenue: categoryRevenue,
          };
        })
        .filter((cat) => cat.value > 0);

      // Novos clientes (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: newUsers, error: usersError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("papel", "cliente")
        .gte("criado_em", thirtyDaysAgo.toISOString());

      if (usersError) throw usersError;

      // Avaliações médias
      const { data: ratings, error: ratingsError } = await supabase
        .from("avaliacoes")
        .select("nota")
        .eq("aprovado", true);

      if (ratingsError) throw ratingsError;

      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + (rating.nota || 0), 0) /
            ratings.length
          : 0;

      // Simulação de dados de visualização (já que não temos tabela específica)
      const totalViewsCount = totalOrders * 10; // Simulação: 10 visualizações por pedido
      const conversionRate =
        totalViewsCount > 0 ? (totalOrders / totalViewsCount) * 100 : 0;

      setSummary({
        totalSales,
        totalOrders,
        averageOrder,
        newCustomers: newUsers.length,
        lowStockProducts,
        conversionRate,
        totalViews: totalViewsCount,
        averageRating,
      });

      setSalesData(salesDataArray);
      setProductPerformance(productPerformanceData);
      setCategoryData(categoryDataArray);
    } catch (err) {
      console.error("Erro ao buscar dados do dashboard:", err);
      setError("Erro ao carregar dados do dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPendingTestimonials = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("avaliacoes")
        .select(
          `
          *,
          usuarios(nome_completo, email),
          produtos(nome)
        `
        )
        .eq("aprovado", false)
        .order("criado_em", { ascending: false })
        .limit(10);

      if (error) throw error;
      setPendingTestimonials(data || []);
    } catch (err) {
      console.error("Erro ao buscar depoimentos pendentes:", err);
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    try {
      const { data: recentOrders, error } = await supabase
        .from("pedidos")
        .select(
          `
          id,
          valor_total,
          status,
          criado_em,
          usuarios(nome_completo)
        `
        )
        .order("criado_em", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentActivity(recentOrders || []);
    } catch (err) {
      console.error("Erro ao buscar atividade recente:", err);
    }
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("cupons")
        .select("*")
        .order("criado_em", { ascending: false });
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error("Erro ao buscar cupons:", err);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("tickets_suporte")
        .select(
          `
          id, 
          assunto, 
          descricao, 
          status, 
          prioridade, 
          criado_em, 
          usuarios:usuarios!tickets_suporte_usuario_id_fkey(nome_completo)
          `
        )
        .order("criado_em", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error("Erro ao buscar tickets:", err);
    }
  }, []);

  const handleUpdateTicketStatus = async (
    ticketId: string,
    newStatus: string
  ) => {
    try {
      const { error } = await supabase
        .from("tickets_suporte")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (error) throw error;

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
      alert("Status do ticket atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar status do ticket:", err);
      alert("Erro ao atualizar status do ticket");
    }
  };

  const fetchTicketResponses = useCallback(async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from("respostas_ticket")
        .select("mensagem, is_admin, criado_em, usuarios(nome_completo)")
        .eq("ticket_id", ticketId)
        .order("criado_em", { ascending: true });

      if (error) throw error;
      setSelectedTicket((prev) => ({ ...prev, respostas: data || [] }));
    } catch (err) {
      console.error("Erro ao buscar respostas do ticket:", err);
    }
  }, []);

  const handleSendResponse = async () => {
    if (
      !selectedTicket ||
      !newResponse.trim() ||
      selectedTicket.status === "fechado"
    )
      return;

    try {
      const { error } = await supabase.from("respostas_ticket").insert([
        {
          ticket_id: selectedTicket.id,
          usuario_id: null, // Substitua pelo ID do admin logado, se aplicável
          mensagem: newResponse,
          is_admin: true,
        },
      ]);

      if (error) throw error;

      alert("Resposta enviada com sucesso!");
      setNewResponse("");
      fetchTicketResponses(selectedTicket.id);
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
      alert("Erro ao enviar resposta");
    }
  };

  const handleCreateCoupon = async () => {
    try {
      const { error } = await supabase.from("cupons").insert([newCoupon]);
      if (error) throw error;
      alert("Cupom criado com sucesso!");
      setNewCoupon({
        codigo: "",
        tipo_desconto: "porcentagem",
        valor_desconto: 0,
        valor_minimo_pedido: 0,
        data_inicio: "",
        data_fim: "",
        descricao: "",
      });
      fetchCoupons();
    } catch (err) {
      console.error("Erro ao criar cupom:", err);
      alert("Erro ao criar cupom");
    }
  };

  useEffect(() => {
    Promise.all([
      fetchDashboardData(),
      fetchPendingTestimonials(),
      fetchRecentActivity(),
      fetchCoupons(),
      fetchTickets(),
    ]);
  }, [
    fetchDashboardData,
    fetchPendingTestimonials,
    fetchRecentActivity,
    fetchCoupons,
    fetchTickets,
  ]);

  const handleApproveTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from("avaliacoes")
        .update({ aprovado: true })
        .eq("id", id);

      if (error) throw error;

      setPendingTestimonials((prev) => prev.filter((t) => t.id !== id));
      alert("Depoimento aprovado com sucesso!");
    } catch (err) {
      console.error("Erro ao aprovar depoimento:", err);
      alert("Erro ao aprovar depoimento");
    }
  };

  const handleRejectTestimonial = async (id: string) => {
    try {
      const { error } = await supabase.from("avaliacoes").delete().eq("id", id);

      if (error) throw error;

      setPendingTestimonials((prev) => prev.filter((t) => t.id !== id));
      alert("Depoimento rejeitado com sucesso!");
    } catch (err) {
      console.error("Erro ao rejeitar depoimento:", err);
      alert("Erro ao rejeitar depoimento");
    }
  };

  const renderSummaryCard = (
    title: string,
    value: string,
    icon: React.ReactNode,
    trend?: { value: number; isPositive: boolean }
  ) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-3"></div>
            <div className="h-8 w-3/4 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <div className="p-2 bg-blue-50 rounded-full">{icon}</div>
            </div>
            <div className="text-2xl font-bold mb-1 text-gray-900">{value}</div>
            {trend && (
              <div
                className={`flex items-center text-sm ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp
                  className={`h-4 w-4 mr-1 ${
                    trend.isPositive ? "" : "rotate-180"
                  }`}
                />
                {Math.abs(trend.value).toFixed(1)}% vs mês anterior
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">
              Erro ao carregar dashboard
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          Atualizado agora
        </Badge>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {renderSummaryCard(
          "Vendas Totais",
          isLoading
            ? "-"
            : `R$ ${summary.totalSales.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`,
          <DollarSign className="h-5 w-5 text-green-600" />
        )}

        {renderSummaryCard(
          "Total de Pedidos",
          isLoading ? "-" : summary.totalOrders.toString(),
          <ShoppingCart className="h-5 w-5 text-blue-600" />
        )}

        {renderSummaryCard(
          "Ticket Médio",
          isLoading
            ? "-"
            : `R$ ${summary.averageOrder.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`,
          <Package className="h-5 w-5 text-purple-600" />
        )}

        {renderSummaryCard(
          "Novos Clientes",
          isLoading ? "-" : summary.newCustomers.toString(),
          <Users className="h-5 w-5 text-orange-600" />
        )}
      </div>

      {/* Cards Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {renderSummaryCard(
          "Produtos Estoque Baixo",
          isLoading ? "-" : summary.lowStockProducts.toString(),
          <AlertCircle className="h-5 w-5 text-red-600" />
        )}

        {renderSummaryCard(
          "Taxa de Conversão",
          isLoading ? "-" : `${summary.conversionRate.toFixed(2)}%`,
          <TrendingUp className="h-5 w-5 text-indigo-600" />
        )}

        {renderSummaryCard(
          "Total de Visualizações",
          isLoading ? "-" : summary.totalViews.toLocaleString("pt-BR"),
          <Eye className="h-5 w-5 text-cyan-600" />
        )}

        {renderSummaryCard(
          "Avaliação Média",
          isLoading ? "-" : `${summary.averageRating.toFixed(1)} ⭐`,
          <Star className="h-5 w-5 text-yellow-600" />
        )}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas dos Últimos 30 Dias</CardTitle>
            <CardDescription>
              Evolução diária de vendas e pedidos
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <div className="animate-pulse h-full w-full bg-gray-100 rounded"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === "vendas" ? `R$ ${value}` : value,
                      name === "vendas" ? "Vendas" : "Pedidos",
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="vendas"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef444433"
                    name="Vendas (R$)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pedidos"
                    stackId="2"
                    stroke="#3b82f6"
                    fill="#3b82f633"
                    name="Pedidos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Produtos</CardTitle>
            <CardDescription>Produtos mais vendidos</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <div className="animate-pulse h-full w-full bg-gray-100 rounded"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="vendas" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Categoria</CardTitle>
            <CardDescription>Distribuição de receita</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <div className="animate-pulse h-full w-full bg-gray-100 rounded"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="revenue"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`R$ ${value}`, "Receita"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimos pedidos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-gray-600">Nenhuma atividade recente.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        Pedido #{activity.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.usuarios?.nome_completo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        R$ {activity.valor_total?.toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          activity.status === "concluido"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Depoimentos Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Depoimentos Pendentes
            {pendingTestimonials.length > 0 && (
              <Badge variant="destructive">{pendingTestimonials.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Aprove ou rejeite os depoimentos enviados pelos clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingTestimonials.length === 0 ? (
            <p className="text-gray-600">Nenhum depoimento pendente.</p>
          ) : (
            <div className="space-y-4">
              {pendingTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="p-4 border rounded-lg shadow-sm bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">
                        {testimonial.usuarios?.nome_completo || "Anônimo"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {testimonial.usuarios?.email}
                      </p>
                      {testimonial.produtos && (
                        <p className="text-sm text-blue-600">
                          {testimonial.produtos.nome}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.nota
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-800 mb-3">{testimonial.comentario}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(testimonial.criado_em).toLocaleDateString(
                        "pt-BR"
                      )}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveTestimonial(testimonial.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => handleRejectTestimonial(testimonial.id)}
                        size="sm"
                        variant="destructive"
                      >
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Seção de Cupons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gerenciar Cupons
          </CardTitle>
          <CardDescription>
            Adicione ou visualize cupons disponíveis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mb-4">Adicionar Cupom</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Cupom</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Código do Cupom"
                  value={newCoupon.codigo}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, codigo: e.target.value })
                  }
                />
                <select
                  className="w-full p-2 border rounded"
                  value={newCoupon.tipo_desconto}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      tipo_desconto: e.target.value,
                    })
                  }
                >
                  <option value="porcentagem">Porcentagem</option>
                  <option value="valor_fixo">Valor Fixo</option>
                </select>
                <Input
                  type="number"
                  placeholder="Valor do Desconto"
                  value={newCoupon.valor_desconto}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      valor_desconto: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Valor Mínimo do Pedido"
                  value={newCoupon.valor_minimo_pedido}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      valor_minimo_pedido: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  type="date"
                  placeholder="Data de Início"
                  value={newCoupon.data_inicio}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, data_inicio: e.target.value })
                  }
                />
                <Input
                  type="date"
                  placeholder="Data de Fim"
                  value={newCoupon.data_fim}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, data_fim: e.target.value })
                  }
                />
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Descrição"
                  value={newCoupon.descricao}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, descricao: e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button onClick={handleCreateCoupon}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="p-4 border rounded-lg shadow-sm bg-white"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{coupon.codigo}</p>
                    <p className="text-sm text-gray-500">{coupon.descricao}</p>
                  </div>
                  <Badge variant={coupon.ativo ? "default" : "secondary"}>
                    {coupon.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {coupon.tipo_desconto === "porcentagem"
                    ? `${coupon.valor_desconto}%`
                    : `R$ ${coupon.valor_desconto.toFixed(2)}`}{" "}
                  de desconto
                </p>
                <p className="text-sm text-gray-600">
                  Válido de{" "}
                  {new Date(coupon.data_inicio).toLocaleDateString("pt-BR")} até{" "}
                  {new Date(coupon.data_fim).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Cupons Utilizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Cupons Utilizados
          </CardTitle>
          <CardDescription>
            Histórico de cupons aplicados em pedidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Aqui você pode adicionar a lógica para buscar e exibir os cupons utilizados */}
            <p className="text-gray-600">
              Nenhum cupom utilizado encontrado no momento.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Tickets de Suporte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Tickets de Suporte
          </CardTitle>
          <CardDescription>
            Visualize e responda aos tickets enviados pelos clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Tickets</h3>
              <div className="space-y-4">
                {tickets.length === 0 ? (
                  <p className="text-gray-600">Nenhum ticket encontrado.</p>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-4 border rounded-lg shadow-sm bg-white cursor-pointer ${
                        selectedTicket?.id === ticket.id
                          ? "border-blue-500"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        fetchTicketResponses(ticket.id);
                      }}
                    >
                      <p className="font-medium">{ticket.assunto}</p>
                      <p className="text-sm text-gray-600">
                        {ticket.usuarios?.nome_completo || "Anônimo"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(ticket.criado_em).toLocaleDateString("pt-BR")}
                      </p>
                      <select
                        className="mt-2 p-2 border rounded"
                        value={ticket.status}
                        onChange={(e) =>
                          handleUpdateTicketStatus(ticket.id, e.target.value)
                        }
                      >
                        <option value="aberto">Aberto</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="resolvido">Resolvido</option>
                        <option value="fechado">Fechado</option>
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              {selectedTicket ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">
                    Respostas para: {selectedTicket.assunto}
                  </h3>
                  <div className="space-y-4 mb-4">
                    {selectedTicket.respostas?.map((resposta, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          resposta.is_admin
                            ? "bg-blue-50 text-blue-900"
                            : "bg-gray-50 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{resposta.mensagem}</p>
                        <p className="text-xs text-gray-500">
                          {resposta.usuarios?.nome_completo || "Admin"} -{" "}
                          {new Date(resposta.criado_em).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                  {selectedTicket.status !== "resolvido" &&
                    selectedTicket.status !== "fechado" && (
                      <>
                        <Textarea
                          placeholder="Digite sua resposta..."
                          value={newResponse}
                          onChange={(e) => setNewResponse(e.target.value)}
                          className="mb-4"
                        />
                        <Button onClick={handleSendResponse}>
                          Enviar Resposta
                        </Button>
                      </>
                    )}
                </>
              ) : (
                <p className="text-gray-600">
                  Selecione um ticket para visualizar.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
