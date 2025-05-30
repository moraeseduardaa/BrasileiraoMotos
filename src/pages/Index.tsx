import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Truck, CreditCard, MessageSquare } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const featuredProducts = [
  {
    id: "1",
    name: "Kit Relação Honda CG 160",
    price: 169.9,
    imageUrl: "https://via.placeholder.com/300x300?text=Kit+Relação",
    category: "Transmissão",
  },
  {
    id: "2",
    name: "Jogo de Pastilhas de Freio",
    price: 45.9,
    imageUrl: "https://via.placeholder.com/300x300?text=Pastilhas+Freio",
    category: "Freios",
  },
  {
    id: "3",
    name: "Óleo Motor 10W30 1L",
    price: 32.9,
    imageUrl: "https://via.placeholder.com/300x300?text=Óleo+Motor",
    category: "Lubrificantes",
  },
  {
    id: "4",
    name: "Filtro de Ar CG 160",
    price: 39.9,
    imageUrl: "https://via.placeholder.com/300x300?text=Filtro+Ar",
    category: "Filtros",
  },
];

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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card group">
                <div className="mb-4 overflow-hidden rounded-md">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mb-2">
                  {product.category}
                </span>
                <h3 className="font-medium text-lg mb-2">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-moto-red">
                    {product.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="btn-outline-moto"
                  >
                    Ver produto
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            O que nossos clientes dizem
          </h2>

          <Carousel className="w-full">
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem
                  key={testimonial.id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="h-full bg-gray-50 rounded-lg p-6 shadow-sm border flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-full bg-moto-red text-white flex items-center justify-center font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">{testimonial.name}</h3>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < testimonial.rating
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 flex-grow">
                      {testimonial.text}
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                      {testimonial.date}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
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
