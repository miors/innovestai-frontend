import { supabase } from "../../supabaseClient";

export const getToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session.access_token;
};
