"use client";
import { Toaster } from "sonner";
import useUserStore from "../../Store/useUserStore";
import { useEffect } from "react";
import { NavbarComponent } from "../components/Navbar";

export default function ClientRoot({ children }) {
  const fetchProfile = useUserStore((state) => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <>
      {" "}
      <NavbarComponent />
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}
