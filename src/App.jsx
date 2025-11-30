import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Browse from './pages/Browse';
import ProfileDetail from './pages/ProfileDetail';
import ProfileEdit from './pages/ProfileEdit';
import ChatList from './pages/ChatList';
import Chat from './pages/Chat';
import Connections from './pages/Connections';
import Help from './pages/Help';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Landing />} />
          <Route path="auth" element={<Auth />} />
          <Route path="help" element={<Help />} />

          {/* Protected Routes */}
          <Route path="browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
          <Route path="profile/:id" element={<ProtectedRoute><ProfileDetail /></ProtectedRoute>} />
          <Route path="profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
          <Route path="connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
          <Route path="chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
          <Route path="chat/:chatId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

          {/* 404 Route */}
          <Route path="*" element={<div className="card"><h2>404 - Page Not Found</h2></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;