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

import {  useCreateUserAccount,} from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";

// ----------------------
// Form Type
// ----------------------

type FormValues = z.infer<typeof SignupValidation>;

const SignupForm = () => {
  const { toast } = useToast();
  const { checkAuthUser,isLoading:isUserLoading}=useUserContext();
  const navigate = useNavigate();

  // ----------------------
  // React Query Mutations
  // ----------------------

  const { mutateAsync: createUserAccount, isPending: isCreatingUser } =
    useCreateUserAccount();

  // ----------------------
  // React Hook Form
  // ----------------------

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

  // ----------------------
  // Submit Handler
  // ----------------------

  async function onSubmit(values: FormValues) {
    try {
      // Create account
      const newUser = await createUserAccount(values);

      if (!newUser) {
        return toast({
          title: "Signup failed. Please try again.",
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const isLoggedIn = await checkAuthUser();
     
      if(isLoggedIn){
        form.reset();
        toast({ title: "Account created successfully! Logging you in..." });
        navigate("/");
      }else{
        toast({ title:'Sign up failed.PLease try again.'})

      }
      
    } catch (error) {
      console.log(error);
    }
  }

  // ----------------------
  // UI
  // ----------------------

  return (
    <Form {...form}>
      <div className="sm:max-w-[420px] w-full> ">
        <img
          src="/assets/images/log0.png"
          alt="Logo"
          className="mx-auto w-32"
        />

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
          Create a new account
        </h2>

        <p className="text-light-3 small-medium md:base-regular mt-2">
          To use Bondley, please enter your account details
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-full mt-4"
        >
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email / Phone</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="shad-button_primary"
            disabled={isCreatingUser}
          >
            {isCreatingUser ? (
              <div className="flex-center gap-2">
                <Loader />
                Loading...
              </div>
            ) : (
              "Sign Up"
            )}
          </Button>

          <p className="text-small-regular text-light-70 text-center mt-2">
            Already have an account?
            <Link
              to="/sign-in"
              className="text-primary-500 text-small-semibold ml-1"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignupForm;