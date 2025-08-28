import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Logo from '@/components/logo'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
        <Card className="w-full max-w-sm">
            <CardHeader className="space-y-2 text-center">
                <div className="flex justify-center py-4">
                    <Logo />
                </div>
                <CardTitle className="text-2xl font-headline">Create an account</CardTitle>
                <CardDescription>Enter your information to create an account</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" placeholder="Alex Doe" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" />
                </div>
                <Button type="submit" className="w-full asChild">
                  <Link href="/dashboard">Create account</Link>
                </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline text-accent">
                    Login
                </Link>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
