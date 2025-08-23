// src/components/ChatInterface.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getTicketDetails, markTicketAsResolved } from "@/services/api";
import Stomp from "stompjs";
import SockJS from "sockjs-client";
import { Send, CheckCircle } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export const ChatInterface = ({ userRole }) => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const userId = jwtDecode(localStorage.getItem("jwtToken")).id;

  useEffect(() => {
    // Dohvatanje detalja i inicijalnih poruka
    const fetchDetails = async () => {
      const data = await getTicketDetails(ticketId);
      setTicket(data);
      setMessages(data.messages);
    };
    fetchDetails();

    // WebSocket konekcija
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = null;
    client.connect({}, () => {
      client.subscribe(`/topic/ticket/${ticketId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, receivedMessage]);
      });
      setStompClient(client);
    });

    return () => {
      if (client && client.connected) client.disconnect();
    };
  }, [ticketId]);

  const handleSendMessage = () => {
    if (newMessage.trim() && stompClient) {
      const chatMessage = {
        ticketId,
        text: newMessage,
        senderId: userId,
        senderRole: userRole.toUpperCase(),
      };
      stompClient.send(
        "/app/chat.sendMessage",
        {},
        JSON.stringify(chatMessage)
      );
      setNewMessage("");
    }
  };

  // ... ostala logika (npr. handleMarkAsResolved)

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white p-4 rounded-lg border">
        {/* Prikaz poruka */}
        <div className="h-96 overflow-y-auto mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 my-2 ${
                msg.senderId === userId ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block p-2 rounded-lg ${
                  msg.senderId === userId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        {/* Unos poruke */}
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button onClick={handleSendMessage}>
            <Send />
          </Button>
        </div>
      </div>
      <div className="col-span-1 bg-white p-4 rounded-lg border">
        {/* Detalji o tiketu */}
        <h3 className="font-bold">Ticket #{ticket?.id}</h3>
        <p>Status: {ticket?.status}</p>
        <p>Category: {ticket?.problemCategoryName}</p>
        <hr className="my-4" />
        <h4 className="font-bold">Order #{ticket?.orderId}</h4>
        <p>{ticket?.restaurantName}</p>
        <ul>
          {ticket?.orderItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        {userRole === "operator" && (
          <Button
            className="w-full mt-4"
            onClick={() => markTicketAsResolved(ticketId)}
          >
            <CheckCircle className="mr-2" /> Mark as Resolved
          </Button>
        )}
      </div>
    </div>
  );
};
