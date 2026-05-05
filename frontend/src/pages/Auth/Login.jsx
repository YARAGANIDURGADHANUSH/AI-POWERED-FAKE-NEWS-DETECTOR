import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      // Update global context using your existing AuthContext
      login({ name: data.email.split('@')[0], email: data.email });
      
      toast.success("Welcome back!");
      navigate("/detector");
    } catch (err) {
      toast.error("Invalid email or password.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🔐</div>
          <h2 className="auth-logo-title">Welcome Back</h2>
          <p className="auth-logo-sub">Log in to view your saved claims.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              className="input" 
              placeholder="name@example.com" 
              {...register("email")} 
            />
            {errors.email && <span style={{color: "var(--red)", fontSize: "12px", marginTop: "4px"}}>{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••" 
              {...register("password")} 
            />
            {errors.password && <span style={{color: "var(--red)", fontSize: "12px", marginTop: "4px"}}>{errors.password.message}</span>}
          </div>

          <button className="btn btn-primary btn-full" style={{marginTop: "24px"}} disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <span className="auth-link" onClick={() => navigate("/register")}>Sign up</span>
        </div>
      </div>
    </div>
  );
}
