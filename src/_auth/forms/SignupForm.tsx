import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import "../../globals.css";
import Loader from "@/components/shared/Loader";

import { SignupValidation } from "@/lib/validation";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { createUserAccount } from "@/lib/appwrite/api";
import { useUserContext } from "@/context/AuthContext";


const STYLES = `

@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes nodePulse {
  0%,100% { transform: scale(1); opacity:0.4; }
  50% { transform: scale(1.5); opacity:0.9; }
}

.b-wrap * { box-sizing: border-box; }

.b-wrap {
  font-family: 'Nunito', sans-serif;
  min-height: 100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:2rem 1rem;
  background-color:#eef2e6;
  position:relative;
  overflow:hidden;
}

.b-node {
  position:absolute;
  border-radius:50%;
  background:#4f9f75;
  animation:nodePulse 3s ease-in-out infinite;
  pointer-events:none;
}

.b-node.n1{width:10px;height:10px;top:7%;left:5%;}
.b-node.n2{width:8px;height:8px;top:13%;left:16%;}
.b-node.n3{width:10px;height:10px;top:5%;left:28%;}
.b-node.n4{width:8px;height:8px;top:7%;right:7%;}
.b-node.n5{width:10px;height:10px;top:18%;right:18%;}
.b-node.n6{width:8px;height:8px;bottom:9%;left:7%;}
.b-node.n7{width:10px;height:10px;bottom:15%;left:20%;}
.b-node.n8{width:8px;height:8px;bottom:7%;right:9%;}
.b-node.n9{width:10px;height:10px;bottom:18%;right:21%;}

.b-svg{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  pointer-events:none;
}
.b-svg line{stroke:#4f9f75;opacity:0.2;}

.b-card{
  position:relative;
  z-index:10;
  width:100%;
  max-width:420px;
  background:#fff;
  border-radius:24px;
  padding:2.5rem 2.25rem;
  box-shadow:0 20px 60px rgba(47,110,79,0.14);
  animation:fadeUp 0.5s ease both;
}

.b-logo-area{
  display:flex;
  flex-direction:column;
  align-items:center;
  margin-bottom:1rem;
}

.b-logo-img{
  width:78px;height:78px;border-radius:50%;
  object-fit:cover;
}

.b-brand-name{
  font-size:1.55rem;
  font-weight:800;
  color:#2f6e4f;
}

.b-brand-tag{
  font-size:0.64rem;
  color:#7bbf9a;
}

.b-headline{
  text-align:center;
  font-weight:700;
  margin-bottom:0.3rem;
}

.b-sub{
  text-align:center;
  font-size:0.82rem;
  color:#8aab96;
  margin-bottom:1.4rem;
}

.b-field{
  display:flex;
  flex-direction:column;
  gap:0.35rem;
  margin-bottom:1rem;
}

.b-label{
  font-size:0.78rem;
  font-weight:700;
  color:#2f6e4f;
}

.b-field input{
  width:100%;
  background:#f3f8f5 !important;
  border:1.5px solid #cce5d8 !important;
  border-radius:12px !important;
  padding:0.72rem 1rem !important;
}

.b-btn{
  width:100%;
  padding:0.85rem;
  border-radius:14px;
  font-weight:700;
  color:#fff;
  background:linear-gradient(135deg,#2f6e4f,#4f9f75);
}

.b-footer{
  text-align:center;
  font-size:0.82rem;
  margin-top:1rem;
}
`;


type FormValues = z.infer<typeof SignupValidation>;

const SignupForm = () => {
  const { toast } = useToast();
  const { checkAuthUser } = useUserContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const newUser = await createUserAccount({
        name: values.name,
        username: values.username,
        email: values.email,
        password: values.password,
        bio: "",
      });

      if (!newUser)
        return toast({ title: "Sign up failed" });

      const isLoggedIn = await checkAuthUser();
      if (isLoggedIn) {
        form.reset();
        toast({ title: "Account created!" });
        navigate("/");
      }
    } catch (err) {
      toast({ title: "Something went wrong" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>

      <Form {...form}>
        <div className="b-wrap">

          {["n1","n2","n3","n4","n5","n6","n7","n8","n9"].map(n => (
            <div key={n} className={`b-node ${n}`} />
          ))}

          <svg className="b-svg" viewBox="0 0 100 100">
            <line x1="5" y1="7" x2="16" y2="13" />
            <line x1="16" y1="13" x2="28" y2="5" />
          </svg>

          <form onSubmit={form.handleSubmit(onSubmit)} className="b-card">

            <div className="b-logo-area">
              <img src="/assets/images/logo1.jpeg" className="b-logo-img" />
              <div className="b-brand-name">Bondley</div>
              <div className="b-brand-tag">Social Networking Platform</div>
            </div>

            <h2 className="b-headline">Create account ✨</h2>
            <p className="b-sub">Join us today</p>

            
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem className="b-field">
                <FormLabel className="b-label">Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

           
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem className="b-field">
                <FormLabel className="b-label">Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem className="b-field">
                <FormLabel className="b-label">Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem className="b-field">
                <FormLabel className="b-label">Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

           
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem className="b-field">
                <FormLabel className="b-label">Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <button className="b-btn" disabled={isLoading}>
              {isLoading ? <Loader /> : "Sign Up"}
            </button>

            <p className="b-footer">
  Already have an account?
  <Link
    to="/sign-in"
    style={{
      color: "#4f9f75",
      fontWeight: 800,
      marginLeft: "0.35rem",
      textDecoration: "none",
      transition: "0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
  >
    Log in
  </Link>
</p>

          </form>
        </div>
      </Form>
    </>
  );
};

export default SignupForm;