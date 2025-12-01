import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Browse from './pages/Browse';
          <Route index element={<Landing />} />
          <Route path="auth" element={<Auth />} />
          <Route path="help" element={<Help />} />

{/* Protected Routes */ }
          <Route path="browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
          <Route path="profile/:id" element={<ProtectedRoute><ProfileDetail /></ProtectedRoute>} />
          <Route path="profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
          <Route path="connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
          <Route path="chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
          <Route path="chat/:chatId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="global-chat" element={<ProtectedRoute><GlobalChat /></ProtectedRoute>} />

{/* 404 Route */ }
<Route path="*" element={<div className="card"><h2>404 - Page Not Found</h2></div>} />
        </Route >
      </Routes >
    </BrowserRouter >
  );
}

export default App;