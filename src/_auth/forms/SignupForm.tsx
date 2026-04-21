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

// ─── Styles (exact copy from SigninForm) ──────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nodePulse {
    0%, 100% { transform: scale(1); opacity: 0.4; }
    50%       { transform: scale(1.5); opacity: 0.9; }
  }

  .b-wrap * { box-sizing: border-box; }

  .b-wrap {
    font-family: 'Nunito', sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background-color: #eef2e6;
    background-image:
      radial-gradient(ellipse 55% 45% at 10% 15%, rgba(79,159,117,0.15) 0%, transparent 60%),
      radial-gradient(ellipse 50% 55% at 90% 80%, rgba(122,191,100,0.13) 0%, transparent 60%);
    position: relative;
    overflow: hidden;
  }

  .b-node {
    position: absolute;
    border-radius: 50%;
    background: #4f9f75;
    animation: nodePulse 3s ease-in-out infinite;
    pointer-events: none;
  }
  .b-node.n1  { width:10px; height:10px; top:7%;   left:5%;   background:#7bbf64; animation-delay:0s; }
  .b-node.n2  { width: 8px; height: 8px; top:13%;  left:16%;  animation-delay:0.5s; }
  .b-node.n3  { width:10px; height:10px; top:5%;   left:28%;  background:#7bbf64; animation-delay:0.9s; }
  .b-node.n4  { width: 8px; height: 8px; top:7%;   right:7%;  animation-delay:0.3s; }
  .b-node.n5  { width:10px; height:10px; top:18%;  right:18%; background:#7bbf64; animation-delay:0.7s; }
  .b-node.n6  { width: 8px; height: 8px; bottom:9%;  left:7%;  animation-delay:1.1s; }
  .b-node.n7  { width:10px; height:10px; bottom:15%; left:20%; background:#7bbf64; animation-delay:0.4s; }
  .b-node.n8  { width: 8px; height: 8px; bottom:7%;  right:9%; animation-delay:0.8s; }
  .b-node.n9  { width:10px; height:10px; bottom:18%; right:21%;background:#7bbf64; animation-delay:1.3s; }

  .b-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .b-svg line {
    stroke: #4f9f75;
    stroke-width: 0.8;
    opacity: 0.2;
  }

  .b-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 420px;
    background: #ffffff;
    border-radius: 24px;
    padding: 2.5rem 2.25rem 2rem;
    display: flex;
    flex-direction: column;
    box-shadow:
      0 2px 4px rgba(47,110,79,0.06),
      0 20px 60px rgba(47,110,79,0.14);
    animation: fadeUp 0.5s ease both;
  }

  .b-logo-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.4rem;
    animation: fadeUp 0.5s 0.06s ease both;
    opacity: 0;
  }
  .b-logo-img {
    width: 78px;
    height: 78px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 4px 18px rgba(79,159,117,0.28);
  }
  .b-brand-name {
    font-size: 1.55rem;
    font-weight: 800;
    color: #2f6e4f;
    margin-top: 0.65rem;
    letter-spacing: -0.01em;
  }
  .b-brand-tag {
    font-size: 0.64rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #7bbf9a;
    margin-top: 0.1rem;
  }

  .b-headline {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e3d2f;
    text-align: center;
    margin: 0 0 0.3rem;
    animation: fadeUp 0.5s 0.11s ease both;
    opacity: 0;
  }
  .b-sub {
    font-size: 0.82rem;
    color: #8aab96;
    text-align: center;
    margin: 0 0 1.6rem;
    animation: fadeUp 0.5s 0.15s ease both;
    opacity: 0;
  }

  .b-row2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .b-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-bottom: 1.1rem;
  }

  .b-label {
    font-size: 0.78rem;
    font-weight: 700;
    color: #2f6e4f;
  }

  .b-field input {
    width: 100%;
    background: #f3f8f5 !important;
    border: 1.5px solid #cce5d8 !important;
    border-radius: 12px !important;
    color: #1e3d2f !important;
    font-family: 'Nunito', sans-serif !important;
    font-size: 0.92rem !important;
    font-weight: 500 !important;
    padding: 0.72rem 1rem !important;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .b-field input::placeholder { color: #b0ccbc !important; font-weight: 400 !important; }
  .b-field input:focus {
    border-color: #4f9f75 !important;
    background: #fff !important;
    box-shadow: 0 0 0 4px rgba(79,159,117,0.13) !important;
  }
  .b-field p, .b-field [role="alert"] {
    font-size: 0.72rem; color: #d9534f; margin-top: 0.15rem;
  }

  .b-btn-wrap {
    margin-top: 0.4rem;
    margin-bottom: 1.2rem;
    animation: fadeUp 0.5s 0.31s ease both;
    opacity: 0;
  }
  .b-btn {
    width: 100%;
    padding: 0.85rem 1rem !important;
    border-radius: 14px !important;
    font-family: 'Nunito', sans-serif !important;
    font-size: 0.95rem !important;
    font-weight: 700 !important;
    color: #fff !important;
    background: linear-gradient(135deg, #2f6e4f 0%, #4f9f75 55%, #7bbf64 100%) !important;
    border: none !important;
    cursor: pointer;
    box-shadow: 0 6px 22px rgba(47,110,79,0.3) !important;
    transition: filter 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .b-btn:hover:not(:disabled) {
    filter: brightness(1.08);
    transform: translateY(-1px);
    box-shadow: 0 10px 30px rgba(47,110,79,0.38) !important;
  }
  .b-btn:active:not(:disabled) { transform: translateY(0); }
  .b-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .b-footer {
    text-align: center;
    font-size: 0.82rem;
    font-weight: 500;
    color: #8aab96;
    animation: fadeUp 0.5s 0.37s ease both;
    opacity: 0;
  }
  .b-footer a {
    color: #2f6e4f;
    font-weight: 700;
    text-decoration: none;
    margin-left: 0.25rem;
    transition: color 0.2s;
  }
  .b-footer a:hover { color: #4f9f75; }
`;

// ─── Types ────────────────────────────────────────────────────────────────────
type FormValues = z.infer<typeof SignupValidation>;

// ─── Component ────────────────────────────────────────────────────────────────
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

      if (!newUser) return toast({ title: "Sign up failed. Please try again." });

      const isLoggedIn = await checkAuthUser();
      if (isLoggedIn) {
        form.reset();
        toast({ title: "Account created successfully!" });
        navigate("/");
      } else {
        toast({ title: "Login after signup failed. Please sign in." });
      }
    } catch (error: any) {
      toast({ title: error.message || "Something went wrong." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <Form {...form}>
        <div className="b-wrap">

          {/* Network nodes */}
          {["n1","n2","n3","n4","n5","n6","n7","n8","n9"].map(n => (
            <div key={n} className={`b-node ${n}`} />
          ))}

          {/* Connection lines */}
          <svg className="b-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="5" y1="7" x2="16" y2="13" />
            <line x1="16" y1="13" x2="28" y2="5" />
            <line x1="5" y1="7" x2="28" y2="5" />
            <line x1="93" y1="7" x2="82" y2="18" />
            <line x1="7" y1="91" x2="20" y2="85" />
            <line x1="20" y1="85" x2="7" y2="91" />
            <line x1="93" y1="93" x2="79" y2="82" />
            <line x1="16" y1="13" x2="82" y2="18" />
            <line x1="20" y1="85" x2="79" y2="82" />
          </svg>

          <form onSubmit={form.handleSubmit(onSubmit)} className="b-card">

            <div className="b-logo-area">
              <img src="/assets/images/logo1.jpeg" alt="Bondley Logo" className="b-logo-img" />
              <span className="b-brand-name">Bondley</span>
              <span className="b-brand-tag">Social Networking Platform</span>
            </div>

            <h2 className="b-headline">Create your account ✨</h2>
            <p className="b-sub">Fill in your details to get started</p>

            {/* Name + Username side by side */}
            <div className="b-row2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="b-field">
                  <FormLabel className="b-label">Name</FormLabel>
                  <FormControl><Input placeholder="Alex Carter" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem className="b-field">
                  <FormLabel className="b-label">Username</FormLabel>
                  <FormControl><Input placeholder="alexc" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem className="b-field">
                <FormLabel className="b-label">Email</FormLabel>
                <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem className="b-field">
                <FormLabel className="b-label">Password</FormLabel>
                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem className="b-field">
                <FormLabel className="b-label">Confirm Password</FormLabel>
                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="b-btn-wrap">
              <Button type="submit" disabled={isLoading} className="b-btn">
                {isLoading ? (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
                    <Loader /> Creating account…
                  </div>
                ) : "Sign Up"}
              </Button>
            </div>

            <p className="b-footer">
              Already have an account?
              <Link to="/sign-in">Log in</Link>
            </p>

          </form>
        </div>
      </Form>
    </>
  );
};

export default SignupForm;