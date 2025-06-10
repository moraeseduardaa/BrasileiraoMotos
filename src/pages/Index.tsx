import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Truck, CreditCard, MessageSquare } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import TestimonialsSection from "@/components/TestimonialsSection";

const testimonials = [
  {
    id: "1",
    name: "João Silva",
    rating: 5,
    text: "Excelente loja! Encontrei todas as peças que precisava para minha CG 160 com preços ótimos e entrega rápida.",
    date: "20/04/2023",
  },
  {
    id: "2",
    name: "Maria Oliveira",
    rating: 5,
    text: "Atendimento de primeira qualidade. O vendedor me ajudou a escolher as peças certas para minha moto.",
    date: "15/03/2023",
  },
  {
    id: "3",
    name: "Pedro Santos",
    rating: 4,
    text: "Produtos de qualidade e preço justo. Sempre compro nessa loja quando preciso de peças para minha moto.",
    date: "02/02/2023",
  },
];

const advantages = [
  {
    icon: <Truck className="h-10 w-10 text-moto-red" />,
    title: "Entrega Rápida",
    description: "Enviamos para todo o Brasil com agilidade e segurança.",
  },
  {
    icon: <CreditCard className="h-10 w-10 text-moto-red" />,
    title: "Pagamento Facilitado",
    description: "Aceitamos cartões, boleto, PIX e parcelamos em até 12x.",
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-moto-red" />,
    title: "Produtos Originais",
    description: "Garantia de peças originais ou de primeira linha.",
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-moto-red" />,
    title: "Atendimento Especializado",
    description: "Equipe técnica para tirar suas dúvidas sobre peças.",
  },
];

const Index = () => {
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState("");
  const [clientTestimonials, setClientTestimonials] = useState(testimonials);
  const [rating, setRating] = useState(5);
  const [faqs, setFaqs] = useState([]);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportDescription, setSupportDescription] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function fetchCatalogProducts() {
      try {
        const { data, error } = await supabase
          .from("produtos")
          .select("*")
          .limit(4); // Limita a 4 produtos

        if (error) {
          console.error("Erro ao buscar produtos:", error);
        } else {
          setCatalogProducts(data || []);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
      }
    }

    fetchCatalogProducts();
  }, []);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const { data, error } = await supabase
          .from("avaliacoes")
          .select("id, comentario, nota, criado_em, usuario_id")
          .eq("aprovado", true);

        if (error) {
          console.error("Erro ao buscar depoimentos:", error);
        } else {
          const formattedTestimonials = await Promise.all(
            data.map(async (item) => {
              let userName = "Cliente Anônimo";
              if (item.usuario_id) {
                try {
                  const { data: userData, error: userError } = await supabase
                    .from("usuarios")
                    .select("nome_completo") // Corrigido para usar "nome_completo"
                    .eq("id", item.usuario_id)
                    .single();

                  if (userError) {
                    console.error(
                      `Erro ao buscar nome do usuário com ID ${item.usuario_id}:`,
                      userError
                    );
                  } else if (userData) {
                    userName =
                      userData.nome_completo.length > 20
                        ? `${userData.nome_completo.slice(0, 20)}...` // Corta nomes longos
                        : userData.nome_completo;
                  }
                } catch (fetchError) {
                  console.error(
                    `Erro inesperado ao buscar nome do usuário com ID ${item.usuario_id}:`,
                    fetchError
                  );
                }
              }

              return {
                id: item.id,
                name: userName,
                rating: item.nota,
                text: item.comentario,
                date: new Date(item.criado_em).toLocaleDateString("pt-BR"),
              };
            })
          );
          setClientTestimonials(formattedTestimonials);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
      }
    }

    fetchTestimonials();
  }, []);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const { data, error } = await supabase
          .from("faq")
          .select("*")
          .eq("ativo", true)
          .order("ordem", { ascending: true });

        if (error) {
          console.error("Erro ao buscar FAQs:", error);
        } else {
          setFaqs(data || []);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
      }
    }

    fetchFaqs();
  }, []);

  const handleAddTestimonial = async () => {
    if (newTestimonial.trim()) {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser(); // Obtém o usuário autenticado

        if (authError) {
          console.error("Erro ao obter usuário autenticado:", authError);
          alert("Erro ao obter informações do usuário. Tente novamente.");
          return;
        }

        const newEntry = {
          id: uuidv4(),
          usuario_id: user?.id || null, // Usa o ID do usuário autenticado, se disponível
          produto_id: null, // Sempre envia null para produto_id
          nota: rating, // Nota selecionada
          comentario: newTestimonial,
          aprovado: false, // Depoimento aguardará aprovação
        };

        const { error } = await supabase.from("avaliacoes").insert([newEntry]); // Insere o depoimento

        if (error) {
          console.error("Erro ao enviar depoimento:", error);
        } else {
          alert("Depoimento enviado com sucesso! Aguarde aprovação.");
          setNewTestimonial("");
          setRating(5);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
      }
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  const handleCreateSupportTicket = async () => {
    if (supportSubject.trim() && supportDescription.trim()) {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Erro ao obter usuário autenticado:", authError);
          alert("Erro ao obter informações do usuário. Tente novamente.");
          return;
        }

        const newTicket = {
          usuario_id: user?.id || null,
          assunto: supportSubject,
          descricao: supportDescription,
        };

        const { error } = await supabase
          .from("tickets_suporte")
          .insert([newTicket]);

        if (error) {
          console.error("Erro ao criar ticket de suporte:", error);
        } else {
          alert("Ticket de suporte criado com sucesso!");
          setSupportSubject("");
          setSupportDescription("");
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
      }
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section
        className="hero-section relative h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: `url('/src/pages/client/img/LogoBrasileirao.png')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-80" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-start justify-center h-full">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fadeIn">
            Brasileirão Motos <span className="text-moto-red">044</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-lg animate-slideIn">
            Peças e acessórios de qualidade para sua moto, com foco especial em
            motos 160cc. Encontre tudo o que você precisa com os melhores
            preços!
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 animate-slideIn"
            style={{ animationDelay: "0.2s" }}
          >
            <Button className="btn-moto px-8 py-6 text-lg" asChild>
              <Link to="/catalogo">Ver Catálogo</Link>
            </Button>
            <Button
              variant="outline"
              className="btn-outline-moto px-8 py-6 text-lg"
              asChild
            >
              <Link to="/auth/registro">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Vantagens */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Por que escolher a Brasileirão Motos?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                {advantage.icon}
                <h3 className="text-xl font-semibold mt-4 mb-2">
                  {advantage.title}
                </h3>
                <p className="text-gray-600">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Produtos em Destaque</h2>
            <Link
              to="/catalogo"
              className="text-moto-red hover:underline font-medium"
            >
              Ver todos
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {catalogProducts.map((product) => (
              <div
                key={product.id}
                className="product-card group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-4 overflow-hidden rounded-t-lg">
                  <img
                    src={product.imagem_url}
                    alt={product.nome}
                    className="w-full h-[20rem] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mb-2">
                    {product.categoria}
                  </span>
                  <h3 className="font-medium text-lg mb-2">{product.nome}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-moto-red">
                      {product.preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="btn-outline-moto"
                      asChild
                    >
                      <Link to={`/catalogo`}>Ver produto</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <TestimonialsSection />

      {/* FAQ e Suporte */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Dúvidas Frequentes (FAQ)
          </h2>

          <div className="space-y-6 max-w-3xl mx-auto">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b pb-4">
                <h3 className="text-xl font-semibold">{faq.pergunta}</h3>
                <p className="text-gray-700 mt-2">{faq.resposta}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Ainda com dúvidas?</h3>
            <p className="text-gray-700 mb-6">
              Entre em contato com nosso time de suporte. Estamos prontos para
              te ajudar!
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Assunto"
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                className="w-full border rounded px-4 py-2"
              />
              <textarea
                placeholder="Descrição"
                value={supportDescription}
                onChange={(e) => setSupportDescription(e.target.value)}
                className="w-full border rounded px-4 py-2"
              />
              <Button
                className="btn-moto px-8 py-4 text-lg"
                onClick={handleCreateSupportTicket}
              >
                Enviar Ticket
              </Button>
              <Button
                variant="outline"
                className="btn-outline-moto px-8 py-4 text-lg"
                asChild
              >
                <Link to="/cliente/suporte">Ver Meus Tickets</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-moto-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Encontre as melhores peças para sua moto
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Registre-se agora para receber ofertas exclusivas e acompanhar seus
            pedidos online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-moto-red hover:bg-red-700 text-white px-8 py-6 text-lg"
              asChild
            >
              <Link to="/catalogo">Explorar Catálogo</Link>
            </Button>
            <Button
              variant="outline"
              className="border-white text-moto-red hover:bg-white hover:text-black px-8 py-6 text-lg"
              asChild
            >
              <Link to="/auth/registro">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
