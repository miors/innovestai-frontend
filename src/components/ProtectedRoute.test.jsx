import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));

const renderRoute = () =>
  render(
    <MemoryRouter initialEntries={["/secret"]}>
      <Routes>
        <Route path="/auth" element={<div>Login page</div>} />
        <Route
          path="/secret"
          element={
            <ProtectedRoute>
              <div>Secret content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  it("redirects to /auth when there is no user", () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    renderRoute();
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders children when a user exists", () => {
    useAuth.mockReturnValue({ user: { id: "1" }, loading: false });
    renderRoute();
    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });
});
