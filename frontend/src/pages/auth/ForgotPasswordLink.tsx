import { Link } from "react-router-dom";

export default function ForgotPasswordLink() {
  return (
    <div className="flex justify-end">
      <Link
        to="/forgot-password"
        className="text-sm text-black hover:underline "
      >
        Quên mật khẩu?
      </Link>
    </div>
  );
}
