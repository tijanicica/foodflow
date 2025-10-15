// src/components/ChatInterface.jsx

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getTicketDetails, markTicketAsResolved } from "@/services/api";
import Stomp from "stompjs";
import SockJS from "sockjs-client";
import { Send, CheckCircle, Info, Check, CheckCheck } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { RateOperatorModal } from "@/components/modals/RateOperatorModal";

export const ChatInterface = ({ userRole }) => {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  // State
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRatingModalOpen, setRatingModalOpen] = useState(false);
  const [lastReadByOther, setLastReadByOther] = useState(false);

  // Refs
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref za skrolovanje
  const messagesContainerRef = useRef(null); // Ref za chat kontejner

  // Podaci iz tokena
  const token = localStorage.getItem("jwtToken");
  const tokenPayload = token ? jwtDecode(token) : {};
  const userId = tokenPayload.id;
  const userName = tokenPayload.name || "Admin";

  // Glavni useEffect za dohvatanje podataka i WebSocket konekciju
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getTicketDetails(ticketId);
        setTicket(data);
        setMessages(data.messages);

        // Provera da li je poslednja poruka pročitana pri inicijalnom učitavanju
        const lastMessage = data.messages[data.messages.length - 1];
        if (
          lastMessage &&
          lastMessage.senderId === userId &&
          lastMessage.read
        ) {
          setLastReadByOther(true);
        }
      } catch (error) {
        toast.error("Failed to load ticket details.");
        console.error(error);
      }
    };
    fetchDetails();

    if (stompClientRef.current) {
      return;
    }

    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = null;
    stompClientRef.current = client;

    client.connect({}, () => {
      console.log("WebSocket connected!");

      client.subscribe(`/topic/ticket/${ticketId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);

        switch (receivedMessage.type) {
          case "STATUS_UPDATE":
            setTicket((prev) => ({
              ...prev,
              status: receivedMessage.newStatus,
            }));
            break;

          case "READ_RECEIPT":
            if (receivedMessage.readerId !== userId) {
              setLastReadByOther(true);
            }
            break;

          case "REASSIGNMENT":
            // Ažuriraj stanje tiketa sa novim podacima o operateru
            setTicket((prev) => ({
              ...prev,
              operatorId: receivedMessage.newOperatorId,
              operatorName: receivedMessage.newOperatorName,
            }));
            // Dodaj sistemsku poruku u chat
            setMessages((prev) => [
              ...prev,
              {
                type: "system", // Specijalan tip za renderovanje
                text: `You have been connected to a new operator: ${receivedMessage.newOperatorName}.`,
              },
            ]);
            toast.info("Connecting to a new operator...");
            break;

          case "NO_OPERATORS_AVAILABLE":
            // Ažuriraj status i dodaj sistemsku poruku
            setTicket((prev) => ({ ...prev, status: "CLOSED" }));
            setMessages((prev) => [
              ...prev,
              {
                type: "system",
                text: "Unfortunately, all operators are currently busy. Please try creating a new ticket later.",
              },
            ]);
            toast.error("No available operators at the moment.");
            break;

          default: // Podrazumevano je CHAT
            setMessages((prev) => [...prev, receivedMessage]);
            if (
              receivedMessage.type === "CHAT" && // Proveravaš 'type' ponovo, a već si u 'default' bloku
              receivedMessage.senderId !== userId && // Proveravaš 'senderId' ponovo
              userRole !== "support_administrator"
            ) {
              if (document.visibilityState === "visible") {
                const readReceipt = { ticketId, readerId: userId };
                stompClientRef.current.send(
                  "/app/chat.markAsRead",
                  {},
                  JSON.stringify(readReceipt)
                );
              }
            }
            break;
        }
      });

      // Šaljemo "read" na početku samo ako je stranica već vidljiva
      if (
        document.visibilityState === "visible" &&
        userRole !== "support_administrator"
      ) {
        const initialReadReceipt = { ticketId, readerId: userId };
        client.send(
          "/app/chat.markAsRead",
          {},
          JSON.stringify(initialReadReceipt)
        );
      }
    });

    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        console.log("Disconnecting WebSocket...");
        stompClientRef.current.disconnect();
        stompClientRef.current = null;
      }
    };
  }, [ticketId, userRole, userId]);

  // Efekat koji reaguje na promenu statusa za otvaranje modala
  useEffect(() => {
    if (ticket?.status === "RESOLVED" && userRole === "customer") {
      setRatingModalOpen(true);
    }
  }, [ticket, userRole]);

  // Efekat za praćenje fokusa stranice ("Seen" status)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        stompClientRef.current?.connected
      ) {
        console.log("Tab is in focus. Sending read receipt.");
        const readReceipt = { ticketId, readerId: userId };
        stompClientRef.current.send(
          "/app/chat.markAsRead",
          {},
          JSON.stringify(readReceipt)
        );
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [ticketId, userId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && stompClientRef.current) {
      const chatMessage = {
        ticketId,
        text: newMessage,
        senderId: userId,
        senderRole: userRole.toUpperCase(),
        senderName: userName,
      };
      stompClientRef.current.send(
        "/app/chat.sendMessage",
        {},
        JSON.stringify(chatMessage)
      );
      setNewMessage("");
      setLastReadByOther(false); // Resetuj seen status
    }
  };

  const handleMarkAsResolved = async () => {
    try {
      await markTicketAsResolved(ticketId);
      toast.success("Ticket marked as resolved.");
      navigate("/operator/dashboard");
    } catch (error) {
      toast.error("Failed to resolve ticket.");
    }
  };

  const isChatDisabled =
    ticket?.status === "RESOLVED" ||
    ticket?.status === "CLOSED" ||
    userRole === "support_administrator"; // <-- KLJUČNI USLOV

  const placeholderText = () => {
    if (userRole === "support_administrator") {
      return "Viewing as an administrator. Sending messages is disabled.";
    }
    if (ticket?.status === "RESOLVED" || ticket?.status === "CLOSED") {
      return "This conversation has been closed.";
    }
    return "Type your message...";
  };

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading ticket details...</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border flex flex-col h-full">
          <h2 className="text-xl font-bold mb-4 flex-shrink-0">
            {userRole === "support_administrator"
              ? `Chat between ${ticket?.customerName} and ${ticket?.operatorName}`
              : `Chat with ${
                  userRole === "customer"
                    ? ticket?.operatorName
                    : ticket?.customerName
                }`}
          </h2>

          <div
            ref={messagesContainerRef}
            className="flex-grow overflow-y-auto mb-4 p-2 bg-gray-50/50 rounded-lg"
          >
            {messages.map((msg, index) => {
              // --- NOVI BLOK ZA RENDER SISTEMSKE PORUKE ---
              if (msg.type === "system") {
                return (
                  <div key={index} className="text-center my-4">
                    <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className={`flex flex-col my-2 ${
                    msg.senderId === userId ? "items-end" : "items-start"
                  }`}
                >
                  <span
                    className={`text-xs text-gray-500 px-2 ${
                      msg.senderId === userId ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.senderName}
                  </span>
                  <div
                    className={`inline-block p-3 rounded-2xl max-w-md ${
                      msg.senderId === userId
                        ? "bg-brand-primary text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {index === messages.length - 1 && msg.senderId === userId && (
                    <div className="flex items-center gap-1 text-xs mt-1 px-2 text-gray-500">
                      {lastReadByOther ? (
                        <>
                          <CheckCheck size={14} className="text-blue-500" />
                          <span>Seen</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          <span>Sent</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 items-center flex-shrink-0"
          >
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isChatDisabled}
              placeholder={placeholderText()}
              className="flex-grow"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={isChatDisabled || !newMessage.trim()}
            >
              <Send />
            </Button>
          </form>
        </div>

        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border overflow-y-auto h-full">
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <Info className="mr-2" /> Ticket Details
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Ticket #:</strong> {ticket.id}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className="font-semibold">
                {ticket.status.replace("_", " ")}
              </span>
            </p>
            <p>
              <strong>Category:</strong> {ticket.problemCategoryName}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {format(new Date(ticket.creationTime), "MMM d, yyyy HH:mm")}
            </p>
            <p>
              <strong>Description:</strong> {ticket.initialDescription}
            </p>
          </div>
          <hr className="my-4" />
          <h4 className="font-bold mb-2">Order #{ticket.orderId}</h4>
          <p className="text-sm font-semibold">{ticket.restaurantName}</p>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {ticket.orderItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          {userRole === "operator" && (
            <Button
              className="w-full mt-6 bg-green-600 hover:bg-green-700"
              onClick={handleMarkAsResolved}
              disabled={isChatDisabled}
            >
              <CheckCircle className="mr-2" /> Mark as Resolved
            </Button>
          )}
        </div>
      </div>

      <RateOperatorModal
        isOpen={isRatingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        ticketId={ticketId}
      />
    </>
  );
};
