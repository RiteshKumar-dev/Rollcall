import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import axios from "axios";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      userdetails: null, // synced with user
      profileType: null,
      token: null,
      loading: false,

      // Set user + auto-fetch full profile
      setUser: async (user, token) => {
        set({ loading: true });

        if (token) {
          set({ token });
          Cookies.set("token", token, { expires: 21 });
          localStorage.setItem("token", token);
        }

        if (user && (user.email || user.phone)) {
          try {
            const res = await axios.post("/api/getUserDetails", {
              email: user.email,
              phone: user.phone,
            });

            if (res.data.success) {
              const profile = res.data.profile;
              const userType = res.data.userType;

              // ✅ Update both user and userdetails in one set()
              set({
                user: profile,
                userdetails: profile,
                profileType: userType,
              });

              Cookies.set("userdetails", JSON.stringify(profile), { expires: 21 });
              Cookies.set("profileType", userType, { expires: 21 });
            } else {
              set({ user: null, userdetails: null, profileType: null });
            }
          } catch (err) {
            console.error("Auto-fetch failed:", err);
            set({ user: null, userdetails: null, profileType: null });
          }
        } else {
          // Already have full data
          set({
            user,
            userdetails: user,
            profileType: user?.teacherId ? "teacher" : "student",
          });

          if (user) {
            Cookies.set("userdetails", JSON.stringify(user), { expires: 21 });
            Cookies.set("profileType", user.teacherId ? "teacher" : "student", { expires: 21 });
          }
        }

        set({ loading: false });
      },

      clearUser: () => {
        set({ user: null, userdetails: null, token: null, profileType: null });
        Cookies.remove("token");
        Cookies.remove("userdetails");
        Cookies.remove("profileType");
        localStorage.removeItem("token");
      },

      fetchProfile: async () => {
        const token = get().token || Cookies.get("token") || localStorage.getItem("token");
        const cookieUser = Cookies.get("userdetails");
        const cookieProfileType = Cookies.get("profileType");

        if (cookieUser && !get().user) {
          try {
            const parsed = JSON.parse(cookieUser);
            set({
              user: parsed,
              userdetails: parsed,
              profileType: cookieProfileType || (parsed.teacherId ? "teacher" : "student"),
            });
          } catch (e) {
            Cookies.remove("userdetails");
          }
        }

        if (!token || get().user) return;

        set({ loading: true });
        try {
          const res = await axios.get("/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.success) {
            const userData = res.data.user;
            set({
              user: userData,
              userdetails: userData,
              profileType: userData.teacherId ? "teacher" : "student",
            });
            Cookies.set("userdetails", JSON.stringify(userData), { expires: 21 });
            Cookies.set("profileType", userData.teacherId ? "teacher" : "student", { expires: 21 });
          }
        } catch (err) {
          console.error(err);
          set({ user: null, userdetails: null, token: null, profileType: null });
          Cookies.remove("token");
          Cookies.remove("userdetails");
          Cookies.remove("profileType");
          localStorage.removeItem("token");
        } finally {
          set({ loading: false });
        }
      },

      refreshUser: async () => {
        const user = get().user;
        if (!user || (!user.email && !user.phone)) return;

        set({ loading: true });
        try {
          const res = await axios.post("/api/getUserDetails", {
            email: user.email,
            phone: user.phone,
          });

          if (res.data.success) {
            const profile = res.data.profile;
            const userType = res.data.userType;

            // ✅ Single set() to keep everything in sync
            set({
              user: profile,
              userdetails: profile,
              profileType: userType,
            });

            Cookies.set("userdetails", JSON.stringify(profile), { expires: 21 });
            Cookies.set("profileType", userType, { expires: 21 });
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
      getStorage: () => localStorage,
    }
  )
);

export default useUserStore;
