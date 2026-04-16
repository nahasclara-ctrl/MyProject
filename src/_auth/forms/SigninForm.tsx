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

import { SigninValidation } from "@/lib/validation";
import { Link, useNavigate } from "react-router-dom";

import { useSignInAccount } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";

// ----------------------
// Theme
// ----------------------

const T = {
  primary: "#4f9f75",
  primarySoft: "#7bbf9a",
  text: "#2f6e4f",
  muted: "#7bbf9a",
  border: "#d6ebe0",
};

// ----------------------

type FormValues = z.infer<typeof SigninValidation>;

const SigninForm = () => {
  const { toast } = useToast();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const navigate = useNavigate();

  const { mutateAsync: signInAccount } = useSignInAccount();

  const form = useForm<FormValues>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });

      if (!session) {
        return toast({
          title: "Login after signup failed",
        });
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        toast({ title: "Login successful!" });
        navigate("/");
      } else {
        toast({ title: "Login failed. Please try again." });
      }
    } catch (error) {
      console.log("Error:", error);
    }
  }

  return (
    <Form {...form}>
      <div
        className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, #7bbf9a55 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, #4f9f7555 0%, transparent 40%),
            linear-gradient(135deg, #1e4d3a 0%, #2f6e4f 50%, #4f9f75 100%)
          `,
        }}
      >
        {/* Card */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative w-full max-w-md flex flex-col gap-6 p-8 rounded-3xl"
          style={{
            backgroundColor: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 10px 50px rgba(0,0,0,0.25)",
          }}
        >
          {/* Logo */}
          <img
            src="/assets/images/logo1.jpeg"
            alt="Logo"
            className="mx-auto w-24 h-24 object-cover rounded-full shadow-lg"
          />

          {/* Title */}
          <h2 className="text-center text-2xl font-bold text-white">
            Log in to your account
          </h2>

          <p className="text-center text-sm text-white/70">
            Welcome back! Please enter your details to log in.
          </p>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/80">
                  Email / Phone
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    className="rounded-xl px-4 py-3 text-white placeholder:text-white/50"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/80">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    className="rounded-xl px-4 py-3 text-white placeholder:text-white/50"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Button */}
          <Button
            type="submit"
            disabled={isUserLoading}
            className="rounded-xl py-3 font-semibold transition-all"
            style={{
              background: `linear-gradient(135deg, ${T.primary}, ${T.primarySoft})`,
              color: "#fff",
              boxShadow: "0 6px 25px rgba(0,0,0,0.3)",
            }}
          >
            {isUserLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader />
                Loading...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Footer */}
          <p className="text-center text-sm text-white/70">
            Don't have an account?
            <Link
              to="/sign-up"
              className="ml-1 font-semibold text-white"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SigninForm;