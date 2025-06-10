import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const SupportTicketsPage = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Erro ao obter usuário autenticado:", authError);
          return;
        }

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
            respostas_ticket(mensagem, is_admin, criado_em)
            `
          )
          .eq("usuario_id", user?.id)
          .order("criado_em", { ascending: false });

        if (error) {
          console.error("Erro ao buscar tickets:", error);
        } else {
          setTickets(data || []);
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar tickets:", err);
      }
    };

    fetchTickets();
  }, []);

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Erro ao obter usuário autenticado:", authError);
        return;
      }

      const { error } = await supabase.from("respostas_ticket").insert([
        {
          ticket_id: selectedTicket.id,
          usuario_id: user?.id || null,
          mensagem: newMessage,
          is_admin: false,
        },
      ]);

      if (error) {
        console.error("Erro ao enviar mensagem:", error);
      } else {
        alert("Mensagem enviada com sucesso!");
        setNewMessage("");
        setSelectedTicket((prev) => ({
          ...prev,
          respostas_ticket: [
            ...(prev?.respostas_ticket || []),
            {
              mensagem: newMessage,
              is_admin: false,
              criado_em: new Date().toISOString(),
            },
          ],
        }));
      }
    } catch (err) {
      console.error("Erro inesperado ao enviar mensagem:", err);
    }
  };

  const handleFinalizeTicket = async () => {
    if (!selectedTicket) return;

    try {
      const { error } = await supabase
        .from("tickets_suporte")
        .update({ status: "fechado" }) // Alterado de 'finalizado' para 'fechado'
        .eq("id", selectedTicket.id);

      if (error) {
        console.error("Erro ao finalizar o ticket:", error);
      } else {
        alert("Ticket fechado com sucesso!"); // Alterado o texto para refletir o status correto
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === selectedTicket.id
              ? { ...ticket, status: "fechado" }
              : ticket
          )
        );
        setSelectedTicket(null);
      }
    } catch (err) {
      console.error("Erro inesperado ao finalizar o ticket:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Meus Tickets de Suporte</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Tickets</h2>
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <p className="text-gray-600">Nenhum ticket encontrado.</p>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 border rounded-lg shadow-sm bg-white cursor-pointer ${
                    selectedTicket?.id === ticket.id ? "border-blue-500" : ""
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <p className="font-medium">{ticket.assunto}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(ticket.criado_em).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-sm text-gray-500">{ticket.status}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          {selectedTicket ? (
            <>
              <h2 className="text-lg font-semibold mb-4">
                Respostas para: {selectedTicket.assunto}
              </h2>
              <div className="space-y-4 mb-4">
                {selectedTicket.respostas_ticket?.map((resposta, index) => (
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
                      {resposta.is_admin ? "Admin" : "Você"} -{" "}
                      {new Date(resposta.criado_em).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))}
              </div>
              {selectedTicket.status !== "fechado" ? (
                <div className="flex space-x-4">
                  <Button
                    onClick={handleFinalizeTicket}
                    className="bg-green-500"
                  >
                    Finalizar Ticket
                  </Button>
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>Enviar Mensagem</Button>
                </div>
              ) : (
                <p className="text-gray-600">Este ticket já foi fechado.</p>
              )}
            </>
          ) : (
            <p className="text-gray-600">
              Selecione um ticket para visualizar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketsPage;
