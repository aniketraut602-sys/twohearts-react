// Validate currentUser exists
if (!currentUser || !currentUser.id) {
  return (
    <div className="card">
      <h2>Error</h2>
      <p>User data not available. Please log in again.</p>
    </div>
  );
}

// Validate chatId exists
if (!chatId) {
  return (
    <div className="card">
      );
      setNewMessage('');
  } catch (error) {
        console.error('Error sending message:', error);
  }
};

      return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="font-bold text-xl">Chat Room</h2>
          <p className={`text-sm ${isOpponentOnline ? 'text-green-500' : 'text-gray-500'}`}>
            {isOpponentOnline ? 'Online' : 'Offline'}
          </p>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              data-message-id={msg.id}
              className={`p-2 my-2 rounded max-w-lg ${msg.user_id === currentUser.id ? 'bg-blue-200 ml-auto' : 'bg-gray-200'}`}
            >
              <p className={msg.isDeleted ? 'text-gray-500 italic' : ''}>{msg.content}</p>
              <div className="flex justify-end items-center">
                <span className="text-xs text-gray-500 mr-2">{new Date(msg.created_at).toLocaleTimeString()}</span>
                <MessageStatus message={msg} currentUserId={currentUser.id} />
              </div>
            </div>
          ))}
          {typingUser && <div className="text-gray-500 italic">{typingUser.email} is typing...</div>}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            className="w-full p-2 border rounded"
            placeholder="Type a message..."
          />
        </form>
      </div>
      );
};

      export default Chat;