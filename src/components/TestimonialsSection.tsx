import React, { useState, useEffect } from "react";
import { Star, User, MessageCircle, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const TestimonialsSection = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newTestimonial, setNewTestimonial] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientTestimonials, setClientTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from("avaliacoes")
          .select("id, comentario, nota, criado_em, usuario_id")
          .eq("aprovado", true);

        if (error) {
          console.error("Erro ao buscar depoimentos:", error.message);
          console.error("Detalhes do erro:", error.details);
          console.error("Sugestões de correção:", error.hint);
          return;
        }

        const formattedTestimonials = await Promise.all(
          data.map(async (item) => {
            let userName = "Cliente Anônimo";
            if (item.usuario_id) {
              try {
                const { data: userData, error: userError } = await supabase
                  .from("usuarios")
                  .select("nome_completo")
                  .eq("id", item.usuario_id)
                  .single();

                if (userError) {
                  console.error(
                    `Erro ao buscar nome do usuário com ID ${item.usuario_id}:`,
                    userError.message
                  );
                } else if (userData) {
                  userName =
                    userData.nome_completo.length > 20
                      ? `${userData.nome_completo.slice(0, 20)}...`
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
      } catch (err) {
        console.error("Erro inesperado ao buscar depoimentos:", err);
      }
    };

    fetchTestimonials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !newTestimonial.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Erro ao obter usuário autenticado:", authError.message);
        alert("Erro ao obter informações do usuário. Tente novamente.");
        setIsSubmitting(false);
        return;
      }

      const newEntry = {
        id: crypto.randomUUID(),
        usuario_id: isAnonymous ? null : user?.user?.id || null,
        nota: rating,
        comentario: newTestimonial,
        aprovado: false,
      };

      const { error } = await supabase.from("avaliacoes").insert([newEntry]);
      if (error) {
        console.error("Erro ao enviar depoimento:", error.message);
        alert("Erro ao enviar depoimento. Tente novamente.");
      } else {
        alert("Depoimento enviado com sucesso! Aguarde aprovação.");
        setNewTestimonial("");
        setRating(0);
        setIsAnonymous(false);
      }
    } catch (err) {
      console.error("Erro inesperado ao enviar depoimento:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating) => {
    const texts = {
      1: "Muito insatisfeito",
      2: "Insatisfeito",
      3: "Neutro",
      4: "Satisfeito",
      5: "Muito satisfeito",
    };
    return texts[rating] || "";
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-gray-600 text-lg">
            Sua opinião é muito importante para nós
          </p>
        </div>

        {/* Formulário de Depoimento */}
        <div className="mb-12 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-white w-6 h-6" />
              <h3 className="text-xl font-semibold text-white">
                Compartilhe sua experiência
              </h3>
            </div>
            <p className="text-red-100 mt-2">
              Ajude outros clientes com seu feedback
            </p>
          </div>

          <div className="p-8">
            {!isSubmitted ? (
              <div className="space-y-6">
                {/* Campo Nome */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4" />
                    Como você gostaria de aparecer?
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Digite seu nome"
                      disabled={isAnonymous}
                      className={`w-full p-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        isAnonymous
                          ? "bg-gray-50 text-gray-400"
                          : "bg-white border-gray-300"
                      }`}
                    />
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-600">
                        Prefiro manter meu nome em anonimato
                      </span>
                    </label>
                  </div>
                </div>

                {/* Avaliação por Estrelas */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Star className="w-4 h-4" />
                    Como você avalia nossa loja?
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform duration-150 hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors duration-150 ${
                            star <= (hoverRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 hover:text-yellow-200"
                          }`}
                        />
                      </button>
                    ))}
                    {(rating > 0 || hoverRating > 0) && (
                      <span className="ml-3 text-sm font-medium text-gray-600">
                        {getRatingText(hoverRating || rating)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Textarea para depoimento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Conte-nos sobre sua experiência
                  </label>
                  <textarea
                    value={newTestimonial}
                    onChange={(e) => setNewTestimonial(e.target.value)}
                    placeholder="O que você achou do nosso atendimento, produtos e serviços? Sua opinião é muito valiosa para nós..."
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-xl resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Mínimo 10 caracteres</span>
                    <span>{newTestimonial.length}/500</span>
                  </div>
                </div>

                {/* Botão de Envio */}
                <button
                  onClick={handleSubmit}
                  disabled={
                    !rating || newTestimonial.trim().length < 10 || isSubmitting
                  }
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Depoimento
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Obrigado pelo seu depoimento!
                </h3>
                <p className="text-gray-600">
                  Sua opinião foi enviada com sucesso e será avaliada pela nossa
                  equipe.
                </p>
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-green-700 text-sm">
                    ⭐ Você avaliou nossa loja com {rating} estrela
                    {rating !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Carousel de Depoimentos */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-center text-gray-800">
            Veja o que outros clientes falam
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-800">
                      {testimonial.name}
                    </h4>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="text-sm text-gray-500">{testimonial.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
