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

import {SigninValidation } from "@/lib/validation";
import { Link, useNavigate } from "react-router-dom";

import {
  useSignInAccount,
} from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";

// ----------------------
// Form Type
// ----------------------

type FormValues = z.infer<typeof SigninValidation>;

const SigninForm = () => {
  const { toast } = useToast();
  const { checkAuthUser,isLoading:isUserLoading}=useUserContext();
  const navigate = useNavigate();


  // React Query Mutations
  

   

  const { mutateAsync: signInAccount } =
    useSignInAccount();

  // ----------------------
  // React Hook Form
  // ----------------------

  const form = useForm<FormValues>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    
    },
  });

  // ----------------------
  // Submit Handler
  // ----------------------

  async function onSubmit(values: FormValues) {
   
    try{
      // Auto login after signup
      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });
      console.log("1.SESSION:", session);//add it to see where the problem
       
      if (!session) {
        return toast({
          title: "Login after signup failed",
        });
      }
      const isLoggedIn =await checkAuthUser();
      console.log("2. IS LOGGED IN:", isLoggedIn);  // ← add here
      console.log("3. COOKIE:", localStorage.getItem("cookieFallback"));  // ← add here


      if(isLoggedIn){
        
        form.reset();
        toast({ title: "Login successful!" });
      
        navigate("/");
       
      }else{
        toast({ title:'Login failed. Please try again.'})

      }
      
    
    } catch (error) {
      console.log("Error:",error);
    }
  }

  // ----------------------
  // UI
  // ----------------------

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <form 
        onSubmit={form.handleSubmit(onSubmit)}
        className="sm:w-420 flex-center flex-col"
        >
        <img
          src="/assets/images/log0.png"
          alt="Logo"
          className="mx-auto w-32"
        />
       
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
          Log in to your account
        </h2>

        <p className="text-light-3 small-medium md:base-regular mt-2">
          Welcome back! Please enter your details to log in.
        </p>

        
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

        

          {/* Submit Button */}
          <Button
            type="submit"
            className="shad-button_primary"
            disabled={isUserLoading }
          >
            {isUserLoading  ? (
              <div className="flex-center gap-2">
                <Loader />
                Loading...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>

          <p className="text-small-regular text-light-70 text-center mt-2">
           Don't have an account?
            <Link
              to="/sign-up"
              className="text-primary-500 text-small-semibold ml-1"
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