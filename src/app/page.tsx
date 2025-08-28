import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Gift, Users, Bot, Crown } from 'lucide-react';
import Logo from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background border-b">
        <Link href="/" className="flex items-center justify-center">
          <Logo />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Seamless Gift Exchanges with ManitoManita
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Organize your secret santa events effortlessly. Manage groups, create wishlists, and let our smart matching and AI do the rest.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/dashboard">Get Started for Free</Link>
                  </Button>
                </div>
              </div>
              <img
                src="https://picsum.photos/600/600"
                width="600"
                height="600"
                alt="Hero"
                data-ai-hint="gift exchange friends"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need to Host the Perfect Gift Exchange</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From group management to AI-powered suggestions, we've got you covered.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 mt-12">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="text-accent" /> Group Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Easily create groups, set spending limits, and invite members with a unique link. Keep track of everything in one place.</CardDescription>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Gift className="text-accent" /> Wishlists & Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Members can create their own wishlists with links. Our fair, automated system ensures everyone gets a secret match.</CardDescription>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bot className="text-accent" /> AI Gift Suggester</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Stuck on what to give? Our AI analyzes wishlists and profiles to suggest the perfect gifts, complete with shopping links.</CardDescription>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Crown className="text-accent" /> PRO Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Unlock advanced features like anonymous comments, event reminders, and enhanced group statistics by upgrading your group to PRO.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 ManitoManita. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
