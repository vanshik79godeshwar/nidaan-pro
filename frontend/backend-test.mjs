import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

// --- CONFIGURE YOUR TEST ---
const LOGIN_EMAIL = "tamannahvk001@gmail.com"; // Change to your test doctor's email
const LOGIN_PASSWORD = "vanshikmanav"; // Change to the password
const RECIPIENT_USER_ID = "c704b381-8470-46c3-9733-87dcdf908109"; // Change to the patient's UUID
const MESSAGE_TO_SEND = "Hello from backend test!";
// -------------------------

async function runTest() {
  let token;

  // 1. Authenticate to get a JWT
  try {
    console.log("Attempting to log in...");
    const response = await axios.post('http://localhost:9000/api/auth/login', {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD,
    });
    token = response.data.token;
    console.log("SUCCESS: Logged in and got JWT token.");
  } catch (error) {
    console.error("ERROR: Failed to log in.", error.response?.data || error.message);
    return;
  }

  // 2. Configure and connect the STOMP client
  const stompClient = new Client({
    webSocketFactory: () => new SockJS('http://localhost:9000/ws'),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (str) => {
      console.log(`STOMP DEBUG: ${str}`);
    },
    reconnectDelay: 5000,
  });

  stompClient.onConnect = (frame) => {
    console.log("SUCCESS: STOMP Client Connected!");

    // 3. Subscribe to personal message queue
    stompClient.subscribe(`/user/${frame.headers['user-name']}/queue/messages`, (message) => {
      console.log("SUCCESS: Received a message!", JSON.parse(message.body));
    });
    console.log("Subscribed to personal message queue.");

    // 4. Send a test message
    const chatMessage = {
      senderId: frame.headers['user-name'],
      recipientId: RECIPIENT_USER_ID,
      content: MESSAGE_TO_SEND,
    };
    stompClient.publish({
      destination: '/app/chat',
      body: JSON.stringify(chatMessage),
    });
    console.log("SUCCESS: Sent a test message.");
  };

  stompClient.onStompError = (frame) => {
    console.error('ERROR: Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
  };

  stompClient.activate();
}

runTest();