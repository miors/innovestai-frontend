const API_URL = import.meta.env.VITE_API_URL;
import { getToken } from "./supabase";

export const apiFetch = async (
  path,
  errorMessage = "Request Failed",
  options = {},
) => {
  const res = await fetch(`${API_URL}/${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${await getToken()}`,
    },
  });
  if (!res.ok) throw new Error(errorMessage);
  return res.json();
};
