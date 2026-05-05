import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// 1. Define the Validation Schema using Zod
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function Register() {
  const navigate = useNavigate();
  
  // 2. Initialize React Hook Form
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  // 3. Handle Form Submission
  const onSubmit = async (data) => {
    try {
      // TODO: Replace with actual backend API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      console.log("Registration Payload:", data);
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err) {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">✨</div>
          <h2 className="auth-logo-title">Create Account</h2>
          <p className="auth-logo-sub">Join FakeNews AI to save your checks.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="input-label">Name</label>
            <input 
              className={`input ${errors.name ? 'input-error' : ''}`} 
              placeholder="John Doe" 
              {...register("name")} 
            />
            {errors.name && <span style={{color: "var(--red)", fontSize: "12px", marginTop: "4px"}}>{errors.name.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              className={`input ${errors.email ? 'input-error' : ''}`} 
              placeholder="name@example.com" 
              {...register("email")} 
            />
            {errors.email && <span style={{color: "var(--red)", fontSize: "12px", marginTop: "4px"}}>{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className={`input ${errors.password ? 'input-error' : ''}`} 
              placeholder="••••••••" 
              {...register("password")} 
            />
            {errors.password && <span style={{color: "var(--red)", fontSize: "12px", marginTop: "4px"}}>{errors.password.message}</span>}
          </div>

          <button className="btn btn-primary btn-full" style={{marginTop: "24px"}} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <span className="auth-link" onClick={() => navigate("/login")}>Log in</span>
        </div>
      </div>
    </div>
  );
}
