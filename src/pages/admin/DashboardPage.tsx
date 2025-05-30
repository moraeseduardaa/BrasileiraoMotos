import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
} from "lucide-react";

// Dados mockados para demonstração
const salesData = [
  { name: "Jan", vendas: 4000 },
  { name: "Fev", vendas: 3000 },
  { name: "Mar", vendas: 5000 },
  { name: "Abr", vendas: 4500 },
  { name: "Mai", vendas: 6000 },
  { name: "Jun", vendas: 5500 },
  { name: "Jul", vendas: 7000 },
];

const productPerformance = [
  { name: "Kit Relação", vendas: 120 },
  { name: "Óleo Motor", vendas: 98 },
  { name: "Pastilhas", vendas: 86 },
  { name: "Filtro de Ar", vendas: 75 },
  { name: "Bateria", vendas: 65 },
];

const categoryData = [
  { name: "Transmissão", value: 30 },
  { name: "Filtros", value: 25 },
  { name: "Lubrificantes", value: 20 },
  { name: "Freios", value: 15 },
  { name: "Elétrica", value: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF"];

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalSales: 0,
    salesChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    averageOrder: 0,
    averageOrderChange: 0,
    newCustomers: 0,
    newCustomersChange: 0,
  });

  useEffect(() => {
    // Simulação de carregamento de dados
    const timer = setTimeout(() => {
      setSummary({
        totalSales: 45750.5,
        salesChange: 12.5,
        totalOrders: 128,
        ordersChange: 8.2,
        averageOrder: 357.42,
        averageOrderChange: 4.3,
        newCustomers: 24,
        newCustomersChange: -2.8,
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const renderSummaryCard = (
    title: string,
    value: string,
    change: number,
    icon: React.ReactNode
  ) => (
    <Card>
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
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
            </div>
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div
              className={`text-sm flex items-center ${
                change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span>{Math.abs(change)}% em relação ao mês anterior</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {renderSummaryCard(
          "Vendas Totais",
          isLoading
            ? "-"
            : `R$ ${summary.totalSales.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`,
          summary.salesChange,
          <DollarSign className="h-5 w-5 text-green-600" />
        )}

        {renderSummaryCard(
          "Total de Pedidos",
          isLoading ? "-" : summary.totalOrders.toString(),
          summary.ordersChange,
          <ShoppingCart className="h-5 w-5 text-blue-600" />
        )}

        {renderSummaryCard(
          "Ticket Médio",
          isLoading
            ? "-"
            : `R$ ${summary.averageOrder.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`,
          summary.averageOrderChange,
          <Package className="h-5 w-5 text-purple-600" />
        )}

        {renderSummaryCard(
          "Novos Clientes",
          isLoading ? "-" : summary.newCustomers.toString(),
          summary.newCustomersChange,
          <Users className="h-5 w-5 text-orange-600" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas Mensais</CardTitle>
            <CardDescription>Total de vendas por mês</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <div className="animate-pulse h-full w-full bg-gray-100 rounded"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`R$ ${value}`, "Vendas"]}
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="vendas"
                    stroke="#ef4444"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="Vendas (R$)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desempenho de Produtos</CardTitle>
            <CardDescription>Produtos mais vendidos</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <div className="animate-pulse h-full w-full bg-gray-100 rounded"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformance}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value} unidades`, "Vendas"]}
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Legend />
                  <Bar
                    dataKey="vendas"
                    fill="#ef4444"
                    name="Vendas (unidades)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
            <CardDescription>Distribuição de vendas</CardDescription>
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
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
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
                    formatter={(value: any) => [`${value}%`, "Porcentagem"]}
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Rápidas</CardTitle>
            <CardDescription>Resumo de operações</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-5 w-full bg-gray-100 rounded mb-2"></div>
                    <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 p-2">
                <div>
                  <h3 className="font-medium mb-2">
                    Produtos com estoque baixo
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Kit Cilindro CG 160 (3 unidades)</li>
                    <li>Bateria 5Ah (5 unidades)</li>
                    <li>Amortecedor Traseiro (2 unidades)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">
                    Pedidos aguardando processamento
                  </h3>
                  <p className="text-sm text-gray-600">
                    7 pedidos precisam ser processados
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Vendas da semana</h3>
                  <p className="text-sm text-gray-600">
                    R$ 7.850,00 (22 pedidos)
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Avaliações recentes</h3>
                  <p className="text-sm text-gray-600">
                    12 novas avaliações (média 4.7/5)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
