// src/hooks/useWebSocket.jsx

import { useEffect, useState, useRef } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

// Pomoćna funkcija koja čita korisnika iz localStorage.
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

export const useWebSocket = () => {
  const [notification, setNotification] = useState(null);
  const stompClientRef = useRef(null);

  useEffect(() => {
    // Izdvojena funkcija za uspostavljanje konekcije
    const connect = () => {
      // Proveravamo da li je konekcija već uspostavljena
      if (stompClientRef.current?.connected) {
        console.log("WebSocket is already connected.");
        return;
      }

      const user = getUserFromStorage();
      console.log("Attempting to connect with user:", user);

      if (user && user.role) {
        const serverUrl = 'http://localhost:8088/ws';
        const socket = new SockJS(serverUrl);
        const client = Stomp.over(socket);
        client.debug = () => {};
        stompClientRef.current = client;

        client.connect({}, (frame) => {
          console.log(`WebSocket for ${user.role} successful:`, frame);
          
          // === KLJUČNA IZMENA: KORISTIMO EMAIL (iz 'sub' polja) ZA KREIRANJE KANALA ===
          const userEmail = user.sub;

          if (userEmail) {
            // Kreiramo ISTU putanju kao i na backendu
            const cleanedEmail = userEmail.replace("@", "-at-").replace(".", "-dot-");
            let topic = null;

            // Nema potrebe za 'if (user.role)', jer svi korisnici idu na isti tip kanala
            topic = `/topic/user/${cleanedEmail}`;
            
            console.log(`FRONTEND SUBSCRIBING TO: ${topic}`);
            
            client.subscribe(topic, (message) => {
              const receivedNotif = JSON.parse(message.body);
              console.log("MESSAGE RECEIVED IN HOOK:", receivedNotif);
                window.dispatchEvent(new CustomEvent('new-notification', { detail: receivedNotif }));
              setNotification(receivedNotif);
            });
          }
          // =========================================================================
        });
      }
    };

    // Izdvojena funkcija za prekid konekcije
    const disconnect = () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect(() => {});
        stompClientRef.current = null;
      }
    };
    
    // Funkcija koja se poziva kada se desi login ili refresh stranice
    const handleLogin = () => {
        console.log("Login event detected or page loaded, attempting to connect WebSocket.");
        disconnect(); // Osiguraj da nema starih konekcija
        connect();
    };

    // 1. Pokušaj da se povežeš odmah
    handleLogin();

    // 2. Slušaj za naš custom 'userLoggedIn' događaj
    window.addEventListener('userLoggedIn', handleLogin);

    // Cleanup funkcija
    return () => {
      window.removeEventListener('userLoggedIn', handleLogin);
      disconnect();
    };
  }, []); // Prazan niz osigurava da se sve ovo postavi samo jednom

  return notification;
};