// store/userStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import axios from "axios";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null, // will hold full student data
      token: null,
      loading: false,

      // Set user + auto-fetch full profile if only email/phone is given
      setUser: async (user, token) => {
        set({ loading: true });

        // Save token immediately
        if (token) {
          set({ token });
          Cookies.set("token", token, { expires: 21 });
          localStorage.setItem("token", token);
        }

        // If user has email or phone but not full data → fetch it
        if (user && (user.email || user.phone) && !user.semester) {
          try {
            const { email, phone } = user;
            const res = await axios.get("http://localhost:3000/api/student/profile", {
              params: { email, phone },
            });

            if (res.data.success) {
              set({ user: res.data.student }); // save full data
              Cookies.set("user", JSON.stringify(res.data.student), { expires: 21 });
            }
          } catch (err) {
            console.error("Auto-fetch failed:", err);
            set({ user: null });
          }
        } else {
          // Already have full data
          set({ user });
          if (user) Cookies.set("user", JSON.stringify(user), { expires: 21 });
        }

        set({ loading: false });
      },

      // Clear user and cookies
      clearUser: () => {
        set({ user: null, token: null });
        Cookies.remove("token");
        Cookies.remove("user");
        localStorage.removeItem("token");
      },

      // Manual fetch (e.g., on app load)
      fetchProfile: async () => {
        const token = get().token || Cookies.get("token") || localStorage.getItem("token");
        const cookieUser = Cookies.get("user");

        // Restore from cookie if available
        if (cookieUser && !get().user) {
          try {
            const parsed = JSON.parse(cookieUser);
            set({ user: parsed });
          } catch (e) {
            Cookies.remove("user");
          }
        }

        if (!token || get().user) return;

        set({ loading: true });
        try {
          const res = await axios.get("http://localhost:3000/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ user: res.data.user });
          console.log(res.data.user);
          Cookies.set("user", JSON.stringify(res.data.user), { expires: 21 });
        } catch (err) {
          console.error(err);
          set({ user: null, token: null });
          Cookies.remove("token");
          Cookies.remove("user");
          localStorage.removeItem("token");
        } finally {
          set({ loading: false });
        }
      },

      // Optional: force re-fetch
      refreshUser: async () => {
        const user = get().user;
        if (!user || (!user.email && !user.phone)) return;

        set({ loading: true });
        try {
          const res = await axios.get("http://localhost:3000/api/student/profile", {
            params: { email: user.email, phone: user.phone },
          });
          if (res.data.success) {
            set({ user: res.data.student });
            Cookies.set("user", JSON.stringify(res.data.student), { expires: 21 });
          }
        } catch (err) {
          console.error("Refresh failed:", err);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "user-storage",
      getStorage: () => localStorage, // persists user & token
    }
  )
);

export default useUserStore;
