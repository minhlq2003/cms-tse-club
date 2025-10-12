"use client";

import { useTranslation } from "next-i18next";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { loginWithGoogle } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Image, message } from "antd";
import { Images } from "@/constant/image";
import { isTokenExpired } from "@/lib/utils";

function SignIn() {
  const { t } = useTranslation("common");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: email, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      const data = await response.json();
      if (data.accessToken != undefined) {
        router.push("/");
        toast.success("Login successful!");
      } else {
        toast.error("Login failed!");
      }
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("accessToken", data.accessToken);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user && user.id && token && !isTokenExpired(token)) {
        router.push("/");
      }
    }
  }, [router]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black overflow-hidden">
        <div className="flex w-[1000px]">
          <div className="hidden md:flex flex-col justify-center text-[#120e31] px-12 max-w-xl">
            <Image
              src={Images.logoTSE.src}
              preview={false}
              alt="Logo"
              className="w-32 mb-6"
            />
            <div className="flex justify-between">
              <p className="text-xl font-semibold mb-6">TSE Club CMS</p>
              <p> Version: 1.0.0 </p>
            </div>
            <p className="mb-2">E-MAIL: tseclub@iuh.edu.vn</p>
          </div>

          {/* Login box */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl p-8 mx-auto md:mr-20">
            <h2 className="text-2xl font-bold text-center text-[#120e31] mb-6">
              {t("LOGIN")}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Username or Email
                </label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4 relative">
                <label
                  htmlFor="password"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <span
                  className="absolute inset-y-0 right-0 top-8 flex items-center pr-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff color="gray" />
                  ) : (
                    <Eye color="gray" />
                  )}
                </span>
              </div>

              {error && <div className="text-red-500 mb-4">{error}</div>}

              <button
                type="submit"
                className="w-full bg-[#120e31] text-white font-medium py-2 px-4 rounded-md hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#120e31]"
                disabled={loading}
              >
                {loading ? "Logging in..." : t("LOG IN")}
              </button>
            </form>

            <div className="mt-4 text-center text-gray-500">
              <p>
                {t("Didn't remember your password ?")}{" "}
                <Link
                  href="/forgotpassword"
                  className="text-blue-500 hover:underline"
                >
                  {t("Click Here")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

export default SignIn;
