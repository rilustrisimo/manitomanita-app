import Link from 'next/link';
import { Button } from '@/components/ui/button';
// Header removed - using global header from layout
import Footer from '@/components/footer';

export const metadata = {
  title: 'Privacy Policy — Manito Manita',
  description: 'How Manito Manita collects, uses, and protects your information.'
};

export default function PrivacyPage() {
  const lastUpdated = 'August 30, 2025';
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="w-full border-b bg-background/50">
          <div className="container px-4 md:px-6 py-12 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-headline">Privacy Policy</h1>
            <p className="text-muted-foreground mt-3 text-sm">Last updated: {lastUpdated}</p>
          </div>
        </section>

        {/* Content with TOC */}
        <section className="w-full py-12">
          <div className="container px-4 md:px-6 grid gap-10 lg:grid-cols-[220px_1fr] items-start">
            {/* TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-lg border bg-card p-4 shadow-sm">
                <p className="text-sm font-medium mb-3 text-muted-foreground">On this page</p>
                <nav className="space-y-2 text-sm">
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#overview">Overview</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#info">Information we collect</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#use">How we use information</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#legal">Legal bases</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#sharing">Sharing</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#cookies">Cookies & sessions</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#retention">Data retention</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#security">Security</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#transfers">International transfers</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#rights">Your rights</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#children">Children</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#third">Third‑party services</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#contact">Contact</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#changes">Changes</a>
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <article className="max-w-none">
              <div className="rounded-2xl bg-card/80 dark:bg-card/90 border p-8 shadow-lg">
                <div className="prose prose-neutral dark:prose-invert lg:prose-lg space-y-8 leading-relaxed">
              <section className="mb-6">
                <h2 id="overview" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Overview</h2>
                <p>
                  Manito Manita helps groups run gift exchanges. This policy explains what information we collect, how we use it,
                  and the choices you have. By using the service, you agree to this policy.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="info" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Information we collect</h2>
                <ul className="ml-6 space-y-2">
                  <li><strong>Account and profile:</strong> Email address, display/screen name, and optional contact details.</li>
                  <li><strong>Auth data:</strong> When using Google sign in, we receive your name and email from Google (via Supabase Auth).</li>
                  <li><strong>Group data:</strong> Group names, memberships/roles, wishlist items, comments, and matching assignments.</li>
                  <li><strong>Technical:</strong> Basic logs for security and troubleshooting (timestamps, IP/Country, user agent).</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 id="use" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">How we use information</h2>
                <ul className="ml-6 space-y-2">
                  <li>Provide and operate the app (authentication, group membership, matching, wishlists).</li>
                  <li>Send transactional emails (e.g., matching notifications, group updates).</li>
                  <li>Maintain security, prevent abuse, and troubleshoot.</li>
                  <li>Comply with legal obligations.</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 id="legal" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Legal bases (EEA/UK)</h2>
                <ul className="ml-6 space-y-2">
                  <li><strong>Contract:</strong> To provide the service you request.</li>
                  <li><strong>Legitimate interests:</strong> Secure, improve, and support the service.</li>
                  <li><strong>Consent:</strong> Where required (e.g., certain emails or integrations).</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 id="sharing" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Sharing</h2>
                <ul className="ml-6 space-y-2">
                  <li><strong>Within your group:</strong> Members may see names, screen names, wishlists, comments, and matching state.</li>
                  <li><strong>Service providers:</strong> We use Supabase (Auth, Postgres, Edge Functions) and AWS SES (email). Providers act on our instructions.</li>
                  <li><strong>Legal:</strong> If required by law, security, or to protect rights.</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 id="cookies" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Cookies and sessions</h2>
                <p>
                  We use an httpOnly session cookie to keep you signed in. It is not used for advertising and is cleared on sign out or expiration.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="retention" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Data retention</h2>
                <p>
                  We retain information for as long as your account or groups are active or as needed to provide the service and meet legal requirements.
                  You may request deletion (subject to retention needs) using the contact below.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="security" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Security</h2>
                <p>
                  We apply technical and organizational measures appropriate for a small SaaS, including role-based access (RLS) in Supabase Postgres,
                  server-side matching logic, and https-only communication. No method is 100% secure.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="transfers" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">International transfers</h2>
                <p>
                  Data may be processed and stored in regions where our providers operate (e.g., Supabase cloud infrastructure, AWS SES regions).
                  We rely on provider safeguards and standard contractual mechanisms where applicable.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="rights" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Your rights</h2>
                <ul className="ml-6 space-y-2">
                  <li>Access, correct, or delete certain personal information.</li>
                  <li>Object to or restrict processing in some cases.</li>
                  <li>Portability (receive a copy) when applicable.</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 id="children" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Children</h2>
                <p>
                  The service is not intended for children under 13 (or the age required by your region). Do not use the service if you do not meet the minimum age.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="third" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Third‑party services</h2>
                <ul className="ml-6 space-y-2">
                  <li><strong>Supabase:</strong> Authentication (including Google), database (Postgres), Storage, and Edge Functions.</li>
                  <li><strong>Google:</strong> OAuth sign in. We receive your name and email for account creation and sign in.</li>
                  <li><strong>AWS SES:</strong> Transactional email delivery (e.g., matching notifications).</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 id="contact" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Contact</h2>
                <p>
                  Questions or requests: <a href="mailto:info@manitomanita.com">info@manitomanita.com</a>
                </p>
              </section>

              <section className="mb-6">
                <h2 id="changes" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Changes</h2>
                <p>
                  We may update this policy from time to time. Continued use means you accept the updated policy.
                </p>
              </section>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
