"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Link from "next/link";

const authSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (formData: AuthFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: isSignUp ? "sign-up" : "sign-in",
          ...formData,
        }),
      });

      if (response.ok) {
        router.replace("/survey");
        return;
      }

      const result = await response.json();

      setError(result.error || "Authentication failed");
    } catch {
      setError("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (name: "email" | "password") => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex h-[78px] flex-col justify-center rounded-xl px-4 shadow-md">
            <div className="text-sm font-medium">
              {name === "email" ? "Email" : "Password"}
            </div>

            <FormControl>
              <Input
                placeholder={`Enter your ${name}`}
                type={name === "password" ? "password" : "text"}
                className="border-none  shadow-none p-0 focus:ring-transparent"
                {...field}
              />
            </FormControl>
          </div>

          <FormMessage className="text-red-500 ml-4" />
        </FormItem>
      )}
    />
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-[580px] space-y-6">
        <h1 className="text-3xl font-bold text-center">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderField("email")}
            {renderField("password")}

            {error && <p className="text-red-500 px-4">{error}</p>}

            <Button
              type="submit"
              className="w-full h-12 bg-red-500 hover:bg-red-700 rounded-full text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsSignUp(!isSignUp);
          }}
          className="block text-center text-red-500 hover:underline"
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Link>
      </div>
    </div>
  );
}
