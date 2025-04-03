"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { BookOpen, Eye, EyeOff, Mail, User } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Separator } from "@workspace/ui/components/separator"
import { HttpStatus, RegisterRequest } from "@workspace/contracts"
import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { redirect } from "next/navigation"
import { COOKIE_KEY_ACCESS_TOKEN, COOKIE_KEY_REFRESH_TOKEN } from "@/lib/constants"
import { setCookie } from "cookies-next"
import { isDev } from "@/lib/env"

const formSchema = RegisterRequest.extend({
  confirmPassword: z.string().min(6),
  agreeTerms: z.boolean().refine(val => val, {
    message: "You must accept terms",
  }),
}).refine(data => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords must match",
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: isDev ? {
      name: "John Doe",
      email: "user@fluentify.com",
      password: "Password123",
      confirmPassword: "Password123",
      agreeTerms: true
    } : {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof RegisterRequest>) => api.auth.register({ body: data }),
    onSuccess: async (response) => {
      switch (response.status) {
        case HttpStatus.CREATED:
          const { accessToken, refreshToken } = response.body;
          await setCookie(COOKIE_KEY_ACCESS_TOKEN, accessToken, { path: '/' });
          await setCookie(COOKIE_KEY_REFRESH_TOKEN, refreshToken, { path: '/' });
          toast("Account created successfully")
          redirect("/")
        case HttpStatus.UNPROCESSABLE_ENTITY:
          for (const issue of response.body.issues) {
            const path = issue.path.join('.')
            form.setError(path as any, {
              type: String(response.status),
              message: issue.message,
            })
          }
          break
        case HttpStatus.CONFLICT:
          form.setError("email", {
            type: String(response.status),
            message: response.body.message,
          })
          break
        default:
          form.setError("root", {
            type: String(response.status),
            message: "Registration failed",
          })
      }
    },
    onError: (err: any) => {
      form.setError("root", {
        type: "server",
        message: err?.response?.data?.message ?? "Registration failed",
      })
    },
  })

  const onSubmit = form.handleSubmit(({ confirmPassword, agreeTerms, ...data }) => {
    mutation.mutate(data)
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-4 flex items-center gap-2 text-2xl font-bold">
        <BookOpen className="h-6 w-6 text-primary" />
        <span>TOEIC Master</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">Enter your information to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input {...field} placeholder="John Doe" className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input {...field} type="email" placeholder="name@example.com" className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} type={showPassword ? "text" : "password"} placeholder="••••••••" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">Toggle Password</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">Toggle Confirm Password</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agreeTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-wrap items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      I agree to the{" "}
                      <Link href="/terms" className="font-medium text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="font-medium text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </FormLabel>
                    <FormMessage className="w-full" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Create account</Button>
              {form.formState.errors.root && (
                <p className="text-sm text-destructive text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" type="button">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">{/* Google SVG here */}</svg>
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">&copy; 2023 TOEIC Master. All rights reserved.</p>
    </div>
  )
}
