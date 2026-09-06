import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Miqrotek",
  description: "How Miqrotek collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white font-bold">
              M
            </div>
            <div>
              <p className="font-semibold leading-tight text-[var(--foreground)]">Miqrotek</p>
              <p className="text-xs text-[var(--muted)]">Learning Portal</p>
            </div>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-dark)]"
          >
            Back to login →
          </Link>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--white)] p-8 shadow-sm sm:p-12">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Privacy Policy</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Last updated: {new Date().getFullYear()}</p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--foreground)]">
            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">1. Introduction</h2>
              <p className="mt-2 text-[var(--muted)]">
                Miqrotek (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the learning portal at
                miqrotek.vercel.app (the &quot;Service&quot;). This Privacy Policy explains how we collect,
                use, and protect your personal information when you use our Service. By creating an
                account or using the Service, you agree to the practices described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">2. Information We Collect</h2>
              <p className="mt-2 text-[var(--muted)]">
                We collect the following types of information:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-[var(--muted)]">
                <li><strong>Account information:</strong> Your name, email address, phone number, and password (encrypted) when you register.</li>
                <li><strong>Google OAuth data:</strong> Your name, email, and profile picture if you sign in with Google.</li>
                <li><strong>Course data:</strong> Courses you enroll in, payment records, attendance, and submission history.</li>
                <li><strong>Messages:</strong> Messages exchanged between you and instructors or students within the platform.</li>
                <li><strong>Usage data:</strong> Browser type, device information, and pages visited for analytics and security.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">3. How We Use Your Information</h2>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-[var(--muted)]">
                <li>To create and manage your student or instructor account.</li>
                <li>To process course enrollments and payments through Moolre.</li>
                <li>To track attendance and academic progress.</li>
                <li>To send notifications about courses, messages, and platform updates.</li>
                <li>To provide messaging between students and instructors.</li>
                <li>To prevent fraud, abuse, and unauthorized access.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">4. Payment Processing</h2>
              <p className="mt-2 text-[var(--muted)]">
                Course payments are processed by Moolre, our third-party payment provider. We do not
                store your card or mobile money details. Payment transactions are handled securely by
                Moolre in accordance with their privacy policy. We only store the payment reference,
                amount, and status for record-keeping.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">5. Data Sharing</h2>
              <p className="mt-2 text-[var(--muted)]">
                We do not sell or rent your personal information. We share data only with:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-[var(--muted)]">
                <li><strong>Moolre</strong> — for processing payments.</li>
                <li><strong>Google</strong> — for authentication if you use Google Sign-In.</li>
                <li><strong>Neon (database hosting)</strong> — for storing your data securely.</li>
                <li><strong>Legal authorities</strong> — if required by law or to protect our rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">6. Data Security</h2>
              <p className="mt-2 text-[var(--muted)]">
                We protect your data using industry-standard measures including encrypted password
                hashing (bcrypt), secure session management (JWT), HTTPS for all connections, and
                role-based access control. Only authorized instructors and administrators can access
                student records relevant to their courses.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">7. Your Rights</h2>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-[var(--muted)]">
                <li><strong>Access:</strong> You can view your profile and enrollment data at any time.</li>
                <li><strong>Update:</strong> You can edit your name, phone, and profile picture in settings.</li>
                <li><strong>Deletion:</strong> You can request account deletion by contacting us.</li>
                <li><strong>Opt-out:</strong> You can disable message notifications in your settings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">8. Cookies</h2>
              <p className="mt-2 text-[var(--muted)]">
                We use essential cookies for authentication and session management. We do not use
                third-party advertising or tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">9. Children&apos;s Privacy</h2>
              <p className="mt-2 text-[var(--muted)]">
                The Service is intended for users aged 16 and above. We do not knowingly collect
                information from children under 16. If you believe a minor has registered, please
                contact us so we can remove the account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">10. Changes to This Policy</h2>
              <p className="mt-2 text-[var(--muted)]">
                We may update this Privacy Policy from time to time. We will notify users of significant
                changes via email or a platform notification. Continued use of the Service after changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">11. Contact Us</h2>
              <p className="mt-2 text-[var(--muted)]">
                If you have questions about this Privacy Policy, please contact us at{" "}
                <a
                  href="mailto:support@miqrotek.com"
                  className="font-medium text-[var(--accent)] hover:underline"
                >
                  support@miqrotek.com
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-8 border-t border-[var(--border)] pt-6">
            <Link
              href="/terms"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              View our Terms of Service →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
