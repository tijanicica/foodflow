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
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Podaci iz tokena
  const tokenPayload = jwtDecode(localStorage.getItem("jwtToken"));
  const userId = tokenPayload.id;
  const userName = tokenPayload.name;

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Glavni useEffect za dohvatanje podataka i WebSocket konekciju
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getTicketDetails(ticketId);
        setTicket(data);
        setMessages(data.messages);
        //setTimeout(() => scrollToBottom("auto"), 100);
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

        if (receivedMessage.type === "READ_RECEIPT") {
          // Ako druga osoba pošalje "read" potvrdu, ažuriraj UI
          if (receivedMessage.readerId !== userId) {
            setLastReadByOther(true);
          }
        } else if (receivedMessage.type === "STATUS_UPDATE") {
          setTicket((prev) => ({ ...prev, status: receivedMessage.newStatus }));
        } else {
          // CHAT poruka
          setMessages((prev) => [...prev, receivedMessage]);
          // Kada stigne nova poruka od druge osobe, ona još nije pročitana
          if (receivedMessage.senderId !== userId) {
            setLastReadByOther(false);
            // Odmah pošalji potvrdu da si je video/la
            const readReceipt = { ticketId, readerId: userId };
            stompClientRef.current.send(
              "/app/chat.markAsRead",
              {},
              JSON.stringify(readReceipt)
            );
          }
        }
      });

      const initialReadReceipt = { ticketId, readerId: userId };
      client.send(
        "/app/chat.markAsRead",
        {},
        JSON.stringify(initialReadReceipt)
      );
    });

    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        console.log("Disconnecting WebSocket...");
        stompClientRef.current.disconnect();
        stompClientRef.current = null;
      }
    };
  }, [ticketId, userRole, userId]);

  //Efekat za skrolovanje
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    ticket?.status === "RESOLVED" || ticket?.status === "CLOSED";

  if (!ticket) {
    return (
      <div className="text-center p-10">Loading ticket information...</div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leva kolona - Chat interfejs */}
        <div
          className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border flex flex-col"
          style={{ height: "calc(100vh - 12rem)" }}
        >
          <h2 className="text-xl font-bold mb-4  flex-shrink-0">
            Chat with{" "}
            {userRole === "customer"
              ? ticket.operatorName
              : ticket.customerName}
          </h2>

          <div
            ref={messagesContainerRef}
            className="flex-grow overflow-y-auto mb-4 p-2 bg-gray-50/50 rounded-lg"
          >
            {messages.map((msg, index) => (
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
            ))}
            {/* <div ref={messagesEndRef} /> */}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 items-center flex-shrink-0"
          >
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isChatDisabled}
              placeholder={
                isChatDisabled
                  ? "This conversation has been closed."
                  : "Type your message..."
              }
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

        {/* Desna kolona - Detalji o tiketu */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border">
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
