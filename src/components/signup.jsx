"use client";

import React, { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import useUserStore from "../../Store/useUserStore";

export default function Signup() {
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1); // 1 = send OTP, 2 = verify OTP
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  const router = useRouter();
  const setUserStore = useUserStore((state) => state.setUser);
  const fetchProfile = useUserStore((state) => state.fetchProfile);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!contact) {
      toast.error("Please enter email or phone");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/signup", { contact, action: "signup" });
      if (res.data?.success) {
        setStep(2);
        toast.success(res.data.message || "OTP sent successfully");
        toast.success(`Use OTP: ${res.data.code} for testing`);
      } else {
        toast.error(res.data?.error || "Failed to send OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/signup", { contact, otp: otpCode });
      if (res.data.success) {
        // Save token to localStorage and cookies
        localStorage.setItem("token", res.data.token);
        Cookies.set("token", res.data.token, { expires: 21, sameSite: "Strict" });

        setUserStore(null, res.data.token); // set token first
        await fetchProfile(); // automatically fetch profile and store in Zustand

        toast.success("Signup successful");

        // Redirect to home page
        router.push("/");

        // Optional: Reset form (won't be visible due to redirect)
        setStep(1);
        setContact("");
        setOtp(["", "", "", "", "", ""]);
      } else {
        toast.error(res.data.error || "OTP verification failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1].focus();
    if (!value && index > 0) otpRefs.current[index - 1].focus();
  };

  return (
    <div className="mx-auto w-full max-w-md p-6">
      <h2 className="text-2xl font-bold text-center text-neutral-800 dark:text-neutral-100">Rollcall</h2>
      {/* <p className="mt-1 text-center text-sm text-neutral-600 dark:text-neutral-300">Smart Online Attendance System</p> */}

      {/* Step 1: Send OTP */}
      {step === 1 && (
        <form className="mt-6" onSubmit={handleSendOtp}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="contact">Email or Phone</Label>
            <Input
              id="contact"
              placeholder="Enter email or phone"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </LabelInputContainer>

          <button type="submit" disabled={loading} className="w-full rounded-md bg-black text-white p-2 font-medium">
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* Step 2: Verify OTP */}
      {step === 2 && (
        <form className="mt-6" onSubmit={handleVerifyOtp}>
          <Label className="mb-2 block text-sm">Enter OTP</Label>
          <div className="flex justify-between gap-2">
            {otp.map((value, index) => (
              <Input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                value={value}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                maxLength={1}
                className="w-12 h-12 text-center text-lg font-medium"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-md bg-black text-white p-2 font-medium"
          >
            {loading ? "Verifying..." : "Verify OTP & Signup"}
          </button>
        </form>
      )}

      {/* Footer Links */}
      <div className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-300">
        <p>
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

const LabelInputContainer = ({ children, className }) => {
  return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;
};
