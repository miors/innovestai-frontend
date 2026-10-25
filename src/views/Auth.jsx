import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

export const Auth = () => {
  const { login, signUp } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      if (isSignUp) {
        const data = await signUp(email, password);
        if (data.session) {
          navigate("/dashboard");
        } else {
          setMessage(
            "Account created. Check your email to confirm, then log in.",
          );
          setIsSignUp(false);
        }
      } else {
        await login(email, password);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setMessage("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-3 rounded-lg bg-slate-800 p-6"
      >
        <div className="mb-2 flex items-center justify-center gap-3">
          <Logo size={44} />
          <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-3xl font-extrabold text-transparent">
            InnovestAI
          </span>
        </div>
        <h1 className="text-xl font-bold">
          {isSignUp ? "Create account" : "Log in"}
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded bg-slate-700 px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          className="w-full rounded bg-slate-700 px-3 py-2"
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-600 py-2 hover:bg-blue-500"
        >
          {isSignUp ? "Sign up" : "Log in"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-green-400">{message}</p>}
        <p className="text-center text-sm text-slate-400">
          {isSignUp ? "Already have an account?" : "No account yet?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-blue-400 hover:underline"
          >
            {isSignUp ? "Log in" : "Sign up"}
          </button>
        </p>
      </form>
    </div>
  );
};
