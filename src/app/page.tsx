import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gift, Users, Bot, Crown, ArrowRight } from 'lucide-react';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1"> {/* Remove top padding since header is no longer fixed */}
        {/* Hero Section */}
        <section className="w-full h-screen flex items-center justify-center bg-secondary">
          <div className="container px-4 md:px-6 text-center animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl/none font-headline text-primary">
              The Modern Way to<br />Host Gift Exchanges.
            </h1>
            <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl mt-6">
              Organize secret santa events effortlessly. Manage groups, build wishlists, and let our smart matching and AI do the heavy lifting.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/register">Create Your First Group <ArrowRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Section 1: Group Management */}
        <section className="w-full py-24 md:py-32 lg:py-40 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-center">
              <div className="flex flex-col justify-center space-y-4 animate-fade-in-up animation-delay-200">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm self-start">Group Management</div>
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Create & Manage Groups with Ease.</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-lg">
                  Set up your gift exchange in minutes. Create a group, define the rules like spending minimums and exchange dates, and invite members with a single, shareable link.
                </p>
              </div>
              <div className="w-full h-[300px] md:h-[500px] bg-muted rounded-xl animate-fade-in-up animation-delay-400">
                <img
                  src="https://picsum.photos/800/600"
                  width="800"
                  height="600"
                  alt="Group Management Feature"
                  data-ai-hint="friends planning gift"
                  className="mx-auto aspect-[4/3] overflow-hidden rounded-xl object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Feature Section 2: Wishlists & Matching */}
        <section className="w-full py-24 md:py-32 lg:py-40 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-center">
               <div className="w-full h-[300px] md:h-[500px] bg-muted rounded-xl animate-fade-in-up animation-delay-200 lg:order-last">
                <img
                  src="https://picsum.photos/800/600"
                  width="800"
                  height="600"
                  alt="Wishlist Feature"
                  data-ai-hint="online shopping wishlist"
                  className="mx-auto aspect-[4/3] overflow-hidden rounded-xl object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col justify-center space-y-4 animate-fade-in-up animation-delay-400">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm self-start">Wishlists & Matching</div>
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Smart Wishlists & Fair Matching.</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-lg">
                  Members can easily create and share their wishlists, adding links from any online store. Our automated system ensures a fair and secret match for everyone in the group.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 3: AI Gift Suggester */}
        <section className="w-full py-24 md:py-32 lg:py-40 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-center">
              <div className="flex flex-col justify-center space-y-4 animate-fade-in-up animation-delay-200">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm self-start">AI-Powered</div>
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Never Run Out of Gift Ideas.</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-lg">
                  Stuck on what to give? Our AI gift suggester analyzes wishlists and profiles to provide thoughtful, personalized gift recommendations, complete with shopping links.
                </p>
              </div>
              <div className="w-full h-[300px] md:h-[500px] bg-muted rounded-xl animate-fade-in-up animation-delay-400">
                 <img
                  src="https://picsum.photos/800/600"
                  width="800"
                  height="600"
                  alt="AI Feature"
                  data-ai-hint="robot thinking gift"
                  className="mx-auto aspect-[4/3] overflow-hidden rounded-xl object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="w-full py-24 md:py-32 lg:py-40 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center animate-fade-in-up">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">How It Works in 3 Easy Steps</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Getting started with ManitoManita is simple and quick.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 pt-12 sm:grid-cols-3 sm:gap-12 animate-fade-in-up animation-delay-200">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center rounded-full bg-background p-4 mb-4 border">
                  <span className="text-2xl font-bold text-accent">1</span>
                </div>
                <h3 className="text-xl font-bold">Create Group</h3>
                <p className="text-muted-foreground">Set the rules and invite your friends, family, or colleagues.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center rounded-full bg-background p-4 mb-4 border">
                  <span className="text-2xl font-bold text-accent">2</span>
                </div>
                <h3 className="text-xl font-bold">Build Wishlist</h3>
                <p className="text-muted-foreground">Everyone adds items they'd love to receive from any online store.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center rounded-full bg-background p-4 mb-4 border">
                  <span className="text-2xl font-bold text-accent">3</span>
                </div>
                <h3 className="text-xl font-bold">Exchange Gifts</h3>
                <p className="text-muted-foreground">We handle the secret matching. You focus on the fun of giving!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-24 md:py-32 lg:py-40 bg-background">
           <div className="container px-4 md:px-6 text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
              Ready to Start?
            </h2>
            <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl mt-6">
             Create your first gift exchange group today and make this year's event unforgettable.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/register">Create Your Group Today</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
