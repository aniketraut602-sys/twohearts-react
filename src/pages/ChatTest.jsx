/* eslint-disable react-refresh/only-export-components */
import ReactDOM from 'react-dom/client';
import Chat from '../components/Chat';

function ChatTestApp() {
  const sampleMatch = { id: 'm1', name: 'Asha' };
  return (
    <div style={{ padding: 20 }}>
      <h1>Chat test page (dev only)</h1>
      <Chat
        match={sampleMatch}
        onClose={() => {
          window.history.back();
        }}
      />
    </div>
  );
}

const rootEl =
  document.getElementById('root') ||
  (() => {
    const el = document.createElement('div');
    el.id = 'root';
    document.body.appendChild(el);
    return el;
  })();

const root = ReactDOM.createRoot(rootEl);
root.render(<ChatTestApp />);
