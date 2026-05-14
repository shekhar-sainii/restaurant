import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg-dark">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-12 border-t border-white/5 text-center text-text-muted text-sm px-6">
        <p>© 2026 Pizza Kings. Culinary Excellence Redefined.</p>
      </footer>
    </div>
  );
};

export default MainLayout;
