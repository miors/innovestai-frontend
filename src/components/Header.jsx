import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <Link to="/dashboard" className="flex items-center gap-3">
        <Logo size={40} />
        <h1 className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          Innovest<span className="font-black">AI</span>
        </h1>
      </Link>
      <nav className="flex gap-4 text-sm">
        <Link to="/dashboard" className="hover:text-blue-400">
          Dashboard
        </Link>
        <Link to="/portfolio" className="hover:text-blue-400">
          Portfolio
        </Link>
      </nav>
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden sm:inline">{user.email}</span>
        <button
          onClick={logout}
          className="rounded bg-slate-700 px-3 py-1 hover:bg-slate-600"
        >
          Log out
        </button>
      </div>
    </header>
  );
};
