import Link from 'next/link';
import { Button } from '@/components/ui/button';
// Header removed - using global header from layout
import Footer from '@/components/footer';

export const metadata = {
  title: 'Terms of Service — Manito Manita',
  description: 'Terms and conditions for using Manito Manita gift exchange platform.'
};

export default function TermsPage() {
  const lastUpdated = 'August 31, 2025';
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="w-full border-b bg-background/50">
          <div className="container px-4 md:px-6 py-12 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-headline">Terms of Service</h1>
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
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#acceptance">Acceptance</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#service">Service description</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#eligibility">Eligibility</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#account">Account responsibilities</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#usage">Acceptable use</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#prohibited">Prohibited conduct</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#content">User content</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#privacy">Privacy</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#intellectual">Intellectual property</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#termination">Termination</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#disclaimers">Disclaimers</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#limitation">Limitation of liability</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#indemnification">Indemnification</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#governing">Governing law</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#changes">Changes to terms</a>
                  <a className="block text-muted-foreground hover:text-foreground transition-colors" href="#contact">Contact</a>
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <article className="max-w-none">
              <div className="rounded-2xl bg-card/80 dark:bg-card/90 border p-8 shadow-lg">
                <div className="prose prose-neutral dark:prose-invert lg:prose-lg space-y-8 leading-relaxed">
              <section className="mb-6">
                <h2 id="acceptance" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Acceptance of Terms</h2>
                <p>
                  By accessing and using Manito Manita ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="service" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Service Description</h2>
                <p>
                  Manito Manita is a web-based platform that facilitates the organization and management of gift exchange events, 
                  including Secret Santa, White Elephant, and similar group activities. The Service allows users to:
                </p>
                <ul className="ml-6 space-y-2">
                  <li>Create and manage gift exchange groups</li>
                  <li>Set up participant matching and assignments</li>
                  <li>Create and share wishlists</li>
                  <li>Receive AI-powered gift suggestions</li>
                  <li>Communicate with group members</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 id="eligibility" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Eligibility</h2>
                <p>
                  You must be at least 13 years old to use this Service. By using the Service, you represent and warrant that:
                </p>
                <ul className="ml-6 space-y-2">
                  <li>You are at least 13 years of age</li>
                  <li>You have the legal capacity to enter into this agreement</li>
                  <li>Your use of the Service will not violate any applicable law or regulation</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 id="account" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Account Responsibilities</h2>
                <p>
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
                  You are responsible for:
                </p>
                <ul className="ml-6 space-y-2">
                  <li>Safeguarding the password and all activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use of your account</li>
                  <li>Ensuring your account information remains accurate and up-to-date</li>
                  <li>All activities that occur under your account</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 id="usage" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Acceptable Use</h2>
                <p>
                  You may use our Service only for lawful purposes and in accordance with these Terms. You agree to use the Service only for:
                </p>
                <ul className="ml-6 space-y-2">
                  <li>Organizing legitimate gift exchange events</li>
                  <li>Creating appropriate wishlists and gift suggestions</li>
                  <li>Communicating respectfully with other users</li>
                  <li>Sharing content that is appropriate for a family-friendly environment</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 id="prohibited" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Prohibited Conduct</h2>
                <p>
                  You may not use the Service to:
                </p>
                <ul className="ml-6 space-y-2">
                  <li>Violate any applicable local, state, national, or international law or regulation</li>
                  <li>Impersonate or attempt to impersonate another user, person, or entity</li>
                  <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
                  <li>Use the Service for any illegal or fraudulent purpose</li>
                  <li>Transmit any harassing, abusive, defamatory, obscene, or otherwise objectionable content</li>
                  <li>Attempt to gain unauthorized access to any portion of the Service</li>
                  <li>Use automated systems or software to extract data from the Service</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 id="content" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">User Content</h2>
                <p>
                  Our Service may allow you to post, link, store, share and otherwise make available certain information, text, graphics, 
                  or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, 
                  reliability, and appropriateness.
                </p>
                <p>
                  By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, 
                  reproduce, and distribute such Content on and through the Service for the purpose of operating and providing the Service.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="privacy" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Privacy</h2>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
                  to understand our practices. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="intellectual" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Intellectual Property Rights</h2>
                <p>
                  The Service and its original content, features, and functionality are and will remain the exclusive property of 
                  Manito Manita and its licensors. The Service is protected by copyright, trademark, and other laws. 
                  Our trademarks and trade dress may not be used without our prior written consent.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="termination" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Termination</h2>
                <p>
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, 
                  including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.
                </p>
                <p>
                  You may also terminate your account at any time by contacting us or using the account deletion features within the Service.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="disclaimers" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Disclaimers</h2>
                <p>
                  THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. MANITO MANITA AND ITS SUPPLIERS AND LICENSORS 
                  HEREBY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, STATUTORY, OR OTHERWISE.
                </p>
                <p>
                  We do not warrant that the Service will be uninterrupted, timely, secure, or error-free, or that defects will be corrected.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="limitation" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Limitation of Liability</h2>
                <p>
                  IN NO EVENT SHALL MANITO MANITA, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, 
                  BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, 
                  LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="indemnification" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Indemnification</h2>
                <p>
                  You agree to defend, indemnify, and hold harmless Manito Manita and its licensee and licensors, and their employees, 
                  contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, 
                  liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
                </p>
              </section>

              <section className="mb-6">
                <h2 id="governing" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Governing Law</h2>
                <p>
                  These Terms shall be interpreted and governed by the laws of the Philippines, without regard to its conflict of law provisions. 
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="changes" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Changes to Terms</h2>
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                  If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>
                <p>
                  By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                </p>
              </section>

              <section className="mb-6">
                <h2 id="contact" className="mt-8 mb-4 scroll-mt-28 text-2xl lg:text-3xl">Contact Information</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at: 
                  <a href="mailto:info@manitomanita.com" className="text-primary hover:underline"> info@manitomanita.com</a>
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
