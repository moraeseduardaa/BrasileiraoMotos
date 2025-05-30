import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export const getSessionAndSubscribe = (
  setUser: (user: User | null) => void
) => {
  supabase.auth.getSession().then(({ data }) => {
    setUser(data.session?.user ?? null);
  });

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () => {
    listener.subscription.unsubscribe();
  };
};
