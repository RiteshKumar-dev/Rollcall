"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "../components/ui/resizable-navbar";
import { useState } from "react";
import useUserStore from "../../Store/useUserStore";
import { useRouter } from "next/navigation";

export function NavbarComponent() {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser); // Logout action
  const router = useRouter();

  const navItems = [
    { name: "Features", link: "/features" },
    { name: "Pricing", link: "/pricing" },
    { name: "Contact", link: "/contact" },
    { name: "Account", link: "/account" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearUser();
    router.push("/login");
  };

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <NavbarButton variant="primary" onClick={() => router.push("/create-session")}>
                  Create a session
                </NavbarButton>
                <NavbarButton variant="primary" onClick={handleLogout}>
                  Logout
                </NavbarButton>
              </>
            ) : (
              <NavbarButton variant="secondary" onClick={() => router.push("/login")}>
                Login
              </NavbarButton>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}

            <div className="flex w-full flex-col gap-4 mt-4">
              {user ? (
                <>
                  <NavbarButton
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      router.push("/create-session");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Create a session
                  </NavbarButton>
                  <NavbarButton
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </NavbarButton>
                </>
              ) : (
                <NavbarButton
                  href="/login"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
