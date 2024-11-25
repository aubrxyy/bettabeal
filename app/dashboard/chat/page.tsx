'use client';

import { useEffect, useState, useRef } from 'react';
import { getCookie } from '@/app/_utils/cookies';

interface Message {
  message_id: number;
  room_id: number;
  sender_type: string;
  sender_id: number;
  receiver_type: string;
  receiver_id: number;
  message: string;
  status: string;
  created_at: string;
}

interface ChatRoom {
  room_id: number;
  seller: {
    user: {
      username: string;
    };
  };
}

export default function Chat() {
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      const token = getCookie('USR');
      if (!token) {
        setError('User is not authenticated');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(`Error fetching chat room: ${text}`);
          setError(`Error: ${response.status} - ${text}`);
          return;
        }

        const data = await response.json();
        if (data.status === 'success' && data.data.data.length > 0) {
          setRoom(data.data.data[0]);
          fetchMessages(data.data.data[0].room_id);
        } else {
          // Create a new chat room if none is found
          const createRoomResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              seller_id: 1, // Replace with the actual seller ID
            }),
          });

          if (!createRoomResponse.ok) {
            const text = await createRoomResponse.text();
            console.error(`Error creating chat room: ${text}`);
            setError(`Error: ${createRoomResponse.status} - ${text}`);
            return;
          }

          const createRoomData = await createRoomResponse.json();
          if (createRoomData.status === 'success') {
            setRoom(createRoomData.data);
            fetchMessages(createRoomData.data.room_id);
          } else {
            setError(`Error: ${createRoomData.message}`);
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(`Fetch error: ${(error as Error).message}`);
      }
    };

    fetchRoom();
  }, []);

  const fetchMessages = async (room_id: number) => {
    const token = getCookie('USR');
    if (!token) {
      setError('User is not authenticated');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/${room_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Error fetching messages: ${text}`);
        setError(`Error: ${response.status} - ${text}`);
        return;
      }

      const data = await response.json();
      if (data.status === 'success') {
        setMessages(data.data);
        scrollToBottom();
      } else {
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`Fetch error: ${(error as Error).message}`);
    }
  };

  const handleSendMessage = async () => {
    const token = getCookie('USR');
    if (!token) {
      setError('User is not authenticated');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/send-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: room?.room_id,
          message: newMessage,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Error sending message: ${text}`);
        setError(`Error: ${response.status} - ${text}`);
        return;
      }

      const data = await response.json();
      if (data.status === 'success') {
        setMessages((prevMessages) => [...prevMessages, data.data]);
        setNewMessage('');
        scrollToBottom();
      } else {
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`Fetch error: ${(error as Error).message}`);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col h-full border rounded-lg shadow-lg">
        <div className="flex-1 p-4 overflow-y-auto">
          {room ? (
            <>
              <h2 className="text-xl font-bold mb-4">Chat with {room.seller.user.username}</h2>
              <div className="flex flex-col space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.message_id}
                    className={`p-2 rounded-lg ${
                      message.sender_type === 'App\\Models\\Seller' ? 'bg-blue-100 self-start' : 'bg-green-100 self-end'
                    }`}
                  >
                    <div className="font-bold">{message.sender_type === 'App\\Models\\Seller' ? 'Seller' : 'Customer'}</div>
                    <div>{message.message}</div>
                    <div className="text-xs text-gray-400">{new Date(message.created_at).toLocaleString()}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            <div>No chat room found</div>
          )}
        </div>
        <div className="p-4 border-t">
          <div className="flex">
            <input
              type="text"
              className="flex-1 border p-2 rounded-lg"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}