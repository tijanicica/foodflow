import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

// 1. Kreiramo Context koji će komponente koristiti
const NotificationContext = createContext();

// Helper funkcija za čitanje korisnika iz localStorage
const getUserFromStorage = () => {
  const userString = localStorage.getItem('user');
  if (!userString) return null;
  try {
    return JSON.parse(userString); 
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    return null;
  }
};



// 2. Glavna komponenta ("Provider") koja radi sav posao
export const NotificationProvider = ({ children }) => {
  // 'notification' je "bela tabla" na kojoj pišemo poslednju poruku
  const [notification, setNotification] = useState(null);
  const stompClientRef = useRef(null);

  // Funkcija za konektovanje
  const connect = () => {
    // Ako smo već konektovani, ne radi ništa
    if (stompClientRef.current?.connected) return;

    const user = getUserFromStorage();
    if (user && user.role) {
      const serverUrl = 'http://localhost:8088/ws';
      const socket = new SockJS(serverUrl);
      const client = Stomp.over(socket);
      client.debug = () => {}; 
      stompClientRef.current = client;

      client.connect({}, (frame) => {
        console.log(`[NotificationProvider] WebSocket for ${user.role} successful.`);
        const userEmail = user.sub;
        if (userEmail) {
          const cleanedEmail = userEmail.replace("@", "-at-").replace(".", "-dot-");
          const topic = `/topic/user/${cleanedEmail}`;
          
          console.log(`[NotificationProvider] Subscribing to: ${topic}`);
          
          client.subscribe(topic, (message) => {
            const receivedNotif = JSON.parse(message.body);
            console.log("[NotificationProvider] Received message, updating context:", receivedNotif);
            
            // KLJUČNA STVAR: Umesto vikanja (dispatchEvent), pišemo na "belu tablu" (setNotification)
            setNotification(receivedNotif);
          });
        }
      });
    }
  };

  // Funkcija za diskonektovanje
  const disconnect = () => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.disconnect(() => {
        console.log("[NotificationProvider] WebSocket disconnected.");
      });
      stompClientRef.current = null;
    }
  };

  // useEffect se brine o životnom ciklusu konekcije
  useEffect(() => {
    const handleLogin = () => {
      disconnect();
      connect();
    };

    handleLogin(); // Poveži se odmah
    window.addEventListener('userLoggedIn', handleLogin); // Slušaj i za buduće login-e

    // Kada se komponenta uništi, obavezno se diskonektuj
    return () => {
      window.removeEventListener('userLoggedIn', handleLogin);
      disconnect();
    };
  }, []);



  // Vraćamo Provider koji "obmotava" ostatak aplikacije
  return (
    <NotificationContext.Provider value={notification}>
      {children}
    </NotificationContext.Provider>
  );
};

// 3. Custom hook koji komponente lako koriste da pročitaju poruku sa "bele table"
export const useNotification = () => {
  return useContext(NotificationContext);
};