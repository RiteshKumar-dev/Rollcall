import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import axios from "axios";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      setUser: (user, token) => {
        set({ user, token });
        if (token) Cookies.set("token", token, { expires: 21 });
      },

      clearUser: () => {
        set({ user: null, token: null });
        Cookies.remove("token");
        localStorage.removeItem("token"); // <-- remove token from localStorage
      },

      fetchProfile: async () => {
        const token = get().token || Cookies.get("token") || localStorage.getItem("token");
        if (!token) return;

        set({ loading: true });
        try {
          const res = await axios.get("/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ user: res.data.user });
        } catch (err) {
          console.error(err);
          set({ user: null, token: null });
          Cookies.remove("token");
          localStorage.removeItem("token"); // <-- also remove here if token invalid
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "user-storage",
      getStorage: () => localStorage,
    }
  )
);

export default useUserStore;
