import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { SignupValidation } from "@/lib/validation";
import { Link } from "react-router-dom";

// ----------------------
// STYLES
// ----------------------
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes nodePulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.5); opacity: 0.9; }
}

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

.b-card {
  width: 100%;
  max-width: 440px;
  background: #fff;
  border-radius: 24px;
  padding: 2.4rem 2rem;
  box-shadow: 0 20px 60px rgba(47,110,79,0.15);
  animation: fadeUp 0.5s ease;
}

.b-logo-area {
  text-align: center;
  margin-bottom: 1rem;
}
.b-logo-img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
}
.b-brand {
  font-weight: 800;
  color: #2f6e4f;
  margin-top: 0.4rem;
}

.b-title {
  text-align: center;
  font-weight: 700;
  margin-bottom: 0.2rem;
}
.b-sub {
  text-align: center;
  font-size: 0.8rem;
  color: #8aab96;
  margin-bottom: 1.2rem;
}

.b-field {
  margin-bottom: 0.9rem;
}
.b-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #2f6e4f;
}

.b-field input {
  background: #f3f8f5 !important;
  border: 1.5px solid #cce5d8 !important;
  border-radius: 12px !important;
  padding: 0.6rem 0.8rem !important;
}
.b-field input:focus {
  border-color: #4f9f75 !important;
  box-shadow: 0 0 0 4px rgba(79,159,117,0.15);
}

.b-btn {
  width: 100%;
  margin-top: 0.6rem;
  padding: 0.8rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #2f6e4f, #4f9f75, #7bbf64);
  color: white;
  font-weight: 700;
}

.b-footer {
  text-align: center;
  font-size: 0.8rem;
  margin-top: 1rem;
}
.b-footer a {
  color: #2f6e4f;
  font-weight: 700;
}
`;

// ----------------------
// TYPES
// ----------------------
type FormValues = z.infer<typeof SignupValidation>;

// ----------------------
// COMPONENT
// ----------------------
const SignupForm = () => {
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

  return (
    <>
      <style>{STYLES}</style>

      <Form {...form}>
        <div className="b-wrap">

          {["n1","n2","n3","n4","n5","n6","n7","n8","n9"].map(n => (
            <div key={n} className={`b-node ${n}`} />
          ))}

          <form className="b-card">

            <div className="b-logo-area">
              <img src="/assets/images/logo1.jpeg" className="b-logo-img" />
              <div className="b-brand">Bondley</div>
            </div>

            <h2 className="b-title">Create account ✨</h2>
            <p className="b-sub">Start your journey with us</p>

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem className="b-field">
                <FormLabel className="b-label">Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem className="b-field">
                <FormLabel className="b-label">Username</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem className="b-field">
                <FormLabel className="b-label">Email</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem className="b-field">
                <FormLabel className="b-label">Password</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem className="b-field">
                <FormLabel className="b-label">Confirm Password</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button className="b-btn">
              <Loader /> Sign Up
            </Button>

            <p className="b-footer">
              Already have an account?
              <Link to="/sign-in"> Log in</Link>
            </p>

          </form>
        </div>
      </Form>
    </>
  );
};

export default SignupForm;