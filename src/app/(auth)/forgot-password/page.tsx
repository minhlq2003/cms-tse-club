"use client";

import { useTranslation } from "next-i18next";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Image } from "antd";
import { Images } from "@/constant/image";
import { forgotPassword } from "@/modules/services/userService";
import { ArrowLeft, Mail } from "lucide-react";

function ForgotPassword() {
  const { t } = useTranslation("common");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await forgotPassword(email);
      console.log(res);

      if (res.status === 500) {
        setError("Không tim thấy email trong hệ thống.");
        toast.error("Không tim thấy email trong hệ thống.");
      } else {
        setSuccess(true);
        toast.success("Mật khẩu mới đã được gửi đến email của bạn!");
        setTimeout(() => {
          router.push("/signin");
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại!");
      toast.error("Gửi email thất bại. Vui lòng kiểm tra lại email!");
    } finally {
      setLoading(false);
    }
  };

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

          {/* Forgot Password box */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl p-8 mx-auto md:mr-20">
            <Link
              href="/signin"
              className="flex items-center text-gray-600 hover:text-[#120e31] mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back to Login")}
            </Link>

            <h2 className="text-2xl font-bold text-center text-[#120e31] mb-2">
              {t("Forgot Password")}
            </h2>
            <p className="text-center text-gray-600 text-sm mb-6">
              {t(
                "Enter your email address and we'll send you a link to reset your password"
              )}
            </p>

            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-green-800 font-medium">
                      Email đã được gửi!
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="block text-gray-700 text-sm font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#120e31] text-white font-medium py-2 px-4 rounded-md hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#120e31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={loading}
                >
                  {loading ? "Đang gửi..." : t("Send Reset Link")}
                </button>
              </form>
            )}

            <div className="mt-6 text-center text-gray-500 text-sm">
              <p>
                {t("Remember your password?")}{" "}
                <Link
                  href="/signin"
                  className="text-blue-500 hover:underline font-medium"
                >
                  {t("Sign In")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

export default ForgotPassword;
