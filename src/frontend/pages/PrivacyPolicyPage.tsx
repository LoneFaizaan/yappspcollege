import { ShieldCheck, EyeOff, Lock, Server } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Privacy by Design</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Privacy Policy
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
          This platform was architected from the first line of code with one guiding principle: what we do not collect cannot be leaked, compromised, or weaponized against you.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-2">
          <EyeOff className="w-5 h-5 text-blue-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            No Student Accounts
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            We do not ask you to register, sign in, or link Google, Apple, or university email accounts. Anyone can submit feedback anonymously.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-2">
          <Lock className="w-5 h-5 text-emerald-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Zero IP Storage in Database
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Your IP address is never stored in our database alongside your feedback. There is no column for IP address, device ID, or user agent.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-2">
          <Server className="w-5 h-5 text-purple-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            No Trackers or Advertising Cookies
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            We use no third-party tracking pixels, Google Analytics, social media trackers, or advertising beacons. Your browsing activity is strictly private.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-2">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Random Record Identifiers
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Every submission is assigned a randomly generated UUID v4. No sequence numbers or identifiable timestamps link multiple submissions.
          </p>
        </div>
      </div>

      {/* Detailed Policy Sections */}
      <div className="space-y-8 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            1. Information We Do Not Collect
          </h2>
          <p>
            When using this service, you are never asked to provide:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Your real name or chosen alias</li>
            <li>Institutional or personal email addresses</li>
            <li>College roll number, student registration number, or departmental ID</li>
            <li>Phone or mobile numbers</li>
            <li>Passwords or security credentials</li>
            <li>Biometric or social media profiles</li>
          </ul>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            2. Technical Request Processing & Bot Protection
          </h2>
          <p>
            The application is hosted on Cloudflare's global edge network. When you interact with the site:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>
              <strong>Cloudflare Turnstile:</strong> We use Cloudflare Turnstile to protect against automated spam bots without requiring intrusive CAPTCHAs. Turnstile validates that a human is submitting the form.
            </li>
            <li>
              <strong>Transient Rate Limiting:</strong> To safeguard the platform from denial-of-service floods, request IPs are temporarily hashed and retained only in transient isolate memory for a short sliding window (up to 10 minutes) before being discarded. They are never written to disk or database.
            </li>
          </ul>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            3. What "Anonymous" Means
          </h2>
          <p>
            "Anonymous" means that your identity is completely shielded from other visitors, peers, faculty, and college administrators. No student author names are displayed on published feedback.
          </p>
          <p>
            We are committed to honest transparency: we do not promise mythical or untraceable anonymity for criminal activity. In compliance with applicable laws, infrastructure providers (such as Cloudflare and ISP networks) may retain standard edge connection logs for routing and network security.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            4. Content Removal & Doxxing Prevention
          </h2>
          <p>
            If a submitted post accidentally contains personal information (such as someone's contact number or name) that was overlooked during initial review, any visitor can click the "Report" button on the card. Reported posts are prioritized for immediate review and removal.
          </p>
        </section>
      </div>
    </div>
  );
}
