import { useState } from "react";
import { isValidEmail } from "../Utils/Validator";
import { forgotPasswordAPI } from "../../services/operations/authOps";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    // ✅ Validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await forgotPasswordAPI(email); // backend request
      setEmail(""); // ✅ clear input after success
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-700 text-white flex justify-center">
      <div className="w-[50%] mt-10">
        <div className="text-xl text-center">
          Don’t worry — we’re here to help you reset your password.
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full p-4 flex flex-col items-center rounded-lg gap-y-3 mt-10 bg-gray-500"
        >
          <label>Please enter your email address</label>

          <input
            type="email"
            value={email} // ✅ controlled input
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg p-2 w-[70%] outline-none bg-gray-700"
            placeholder="Enter your email"
            disabled={loading}
          />

          {errors.email && (
            <span className="text-red-400 text-xs">{errors.email}</span>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-300 outline-none disabled:opacity-50 rounded-full w-[20%] p-2"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
