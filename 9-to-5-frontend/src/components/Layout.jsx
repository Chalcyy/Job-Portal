import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ChatBot from './ChatBot';

export default function Layout() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} 9-to-5. Your career, simplified.</p>
        </div>
      </footer>
      <ChatBot />
    </div>
  );
}
