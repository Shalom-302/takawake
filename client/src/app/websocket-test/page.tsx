"use client";

import { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Paper, List, ListItem, Divider } from '@mui/material';

export default function WebSocketTestPage() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Non connecté');

  // Créer une fonction pour se connecter au WebSocket de test
  const connect = () => {
    // Créer l'URL du WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // Essayer d'abord l'URL directe pour le test
    const wsUrl = `${protocol}//${host}/plugins/messaging-service/test`;
    
    try {
      // Fermer une connexion existante si nécessaire
      if (socket) {
        socket.close();
      }
      
      // Créer une nouvelle connexion
      console.log(`Connecting to test WebSocket: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      
      // Gestionnaire d'ouverture de connexion
      ws.onopen = () => {
        console.log('Test WebSocket connected!');
        setConnected(true);
        setConnectionStatus('Connecté');
        
        // Ajouter un message au log
        setMessages(prev => [...prev, `[System] Connexion établie à ${new Date().toISOString()}`]);
      };
      
      // Gestionnaire de messages
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Test WebSocket message received:', data);
          
          // Ajouter le message reçu au log
          setMessages(prev => [...prev, `[Reçu] ${JSON.stringify(data)}`]);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          setMessages(prev => [...prev, `[Erreur] Impossible de parser le message: ${event.data}`]);
        }
      };
      
      // Gestionnaire d'erreur
      ws.onerror = (error) => {
        console.error('Test WebSocket error:', error);
        setConnectionStatus('Erreur de connexion');
        setMessages(prev => [...prev, `[Erreur] Erreur WebSocket à ${new Date().toISOString()}`]);
      };
      
      // Gestionnaire de fermeture
      ws.onclose = (event) => {
        console.log(`Test WebSocket closed: ${event.code} ${event.reason}`);
        setConnected(false);
        setConnectionStatus(`Déconnecté (Code ${event.code})`);
        setMessages(prev => [...prev, `[System] Connexion fermée à ${new Date().toISOString()}, Code: ${event.code}`]);
      };
      
      // Stocker la connexion
      setSocket(ws);
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setConnectionStatus(`Erreur: ${error}`);
      setMessages(prev => [...prev, `[Erreur] Erreur de création WebSocket: ${error}`]);
    }
  };
  
  // Fonction pour envoyer un message
  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN && inputMessage) {
      socket.send(inputMessage);
      setMessages(prev => [...prev, `[Envoyé] ${inputMessage}`]);
      setInputMessage('');
    }
  };
  
  // Fonction pour se déconnecter
  const disconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };
  
  // Nettoyer à la fermeture du composant
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Test de connexion WebSocket
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            État de la connexion: <strong>{connectionStatus}</strong>
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={connect}
            disabled={connected}
          >
            Se connecter
          </Button>
          
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={disconnect}
            disabled={!connected}
          >
            Se déconnecter
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <TextField
            fullWidth
            label="Message à envoyer"
            variant="outlined"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!connected}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
          
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={!connected || !inputMessage}
          >
            Envoyer
          </Button>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, maxHeight: 400, overflow: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Journal de messages
        </Typography>
        
        <List>
          {messages.length === 0 ? (
            <ListItem>
              <Typography variant="body2" color="textSecondary">
                Aucun message
              </Typography>
            </ListItem>
          ) : (
            messages.map((msg, index) => (
              <Box key={index}>
                <ListItem>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {msg}
                  </Typography>
                </ListItem>
                {index < messages.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
}
