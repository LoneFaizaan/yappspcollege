import { CheckCircle2, XCircle, Shield, ArrowRight } from 'lucide-react';

interface GuidelinesPageProps {
  onNavigate: (path: string) => void;
}

export function GuidelinesPage({ onNavigate }: GuidelinesPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
          <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Platform Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Community Guidelines
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
          This platform was built to give students a safe, constructive, and anonymous space to voice thoughts about their college experience. For this space to remain trusted and effective, all submissions must adhere to the following principles.
        </p>
      </div>

      {/* Welcomed Content */}
      <section className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            What We Welcome
          </h2>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Feedback that highlights opportunities for educational, structural, and administrative improvement:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-700 dark:text-neutral-300">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <span><strong>Constructive criticism</strong> regarding curriculum, lecture pacing, syllabus relevance, or lab sessions.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <span><strong>Campus facilities</strong> feedback regarding library hours, WiFi, dormitories, cleanliness, or canteens.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <span><strong>Administration feedback</strong> on registration processes, fee payments, office responsiveness, or student support.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <span><strong>Positive experiences</strong> that highlight departments, courses, or initiatives that deserve recognition.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <span><strong>Actionable suggestions</strong> offering realistic recommendations for institution leadership.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <span><strong>Examination processes</strong> concerns regarding schedules, grading criteria clarity, or hall conditions.</span>
          </li>
        </ul>
      </section>

      {/* Prohibited Content */}
      <section className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-4">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <XCircle className="w-5 h-5 shrink-0" />
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            What Is Strictly Prohibited
          </h2>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Submissions containing any of the following will be rejected by moderators:
        </p>
        <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <div>
              <strong>Personal attacks and named harassment:</strong> Direct attacks, slander, or abusive language targeting specific students, teachers, or staff by name. Focus your feedback on the role, course, system, or policy.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <div>
              <strong>Doxxing and personal information (PII):</strong> Disclosing personal email addresses, phone numbers, roll numbers, social media profiles, or home addresses of yourself or others.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <div>
              <strong>Hate speech and discrimination:</strong> Dehumanizing remarks, slurs, or harassment based on race, gender, sexual orientation, religion, disability, or nationality.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <div>
              <strong>Threats of violence or illegal activity:</strong> Any incitement of harm, vandalism, cheating services promotion, or unlawful behavior.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <div>
              <strong>Commercial spam or bot content:</strong> Advertisements, affiliate links, repetitive promotional text, or random gibberish.
            </div>
          </li>
        </ul>
      </section>

      {/* Moderation Process */}
      <section className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          How Moderation Works
        </h3>
        <p>
          Every feedback submission enters a secure, confidential moderation queue before appearing publicly. Submissions are vetted by moderators solely to filter out harassment, hate speech, spam, and personal identifying information.
        </p>
        <p>
          Critical or negative opinions about institutions, systems, or policies are <strong>never</strong> rejected simply for being critical. Honest, pointed, and respectful criticism is the core reason this platform exists.
        </p>
      </section>

      {/* CTA */}
      <div className="pt-4 flex items-center justify-between border-t border-border-subtle-light dark:border-border-subtle-dark">
        <span className="text-xs text-neutral-500">Ready to share your constructive perspective?</span>
        <button
          onClick={() => onNavigate('/submit')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90"
        >
          <span>Share feedback</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
