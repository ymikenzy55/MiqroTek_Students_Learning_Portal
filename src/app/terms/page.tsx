import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Miqrotek",
  description: "The terms and conditions for using Miqrotek.",
};

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Terms of Service</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Last updated: {new Date().getFullYear()}</p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--foreground)]">
            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">1. Acceptance of Terms</h2>
              <p className="mt-2 text-[var(--muted)]">
                By creating an account, enrolling in courses, or using the Miqrotek Learning Portal
                (the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not
                agree to these terms, you may not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">2. Eligibility</h2>
              <p className="mt-2 text-[var(--muted)]">
                You must be at least 16 years old to use the Service. By registering, you confirm that
                you meet this age requirement and that the information you provide is accurate and
                complete.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">3. User Accounts</h2>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-[var(--muted)]">
                <li>You are responsible for keeping your password secure and confidential.</li>
                <li>You may not share your account with others or allow unauthorized access.</li>
                <li>Student accounts are for personal learning use only.</li>
                <li>Instructor accounts are assigned by administrators and may be revoked at any time.</li>
                <li>You must provide accurate information during registration.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">4. Course Enrollment and Payments</h2>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-[var(--muted)]">
                <li>Course prices are displayed in Ghana Cedis (GHS) unless otherwise stated.</li>
                <li>Payments are processed securely through Moolre.</li>
                <li>Once payment is confirmed, you will be enrolled and granted access to course materials.</li>
                <li>Course access is granted for the duration of the course or as specified by the instructor.</li>
                <li>Refunds are subject to the instructor&apos;s or institution&apos;s refund policy.</li>
                <li>Free courses do not require payment but still require enrollment.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">5. Acceptable Use</h2>
              <p className="mt-2 text-[var(--muted)]">You agree not to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-[var(--muted)]">
                <li>Use the Service for any unlawful purpose.</li>
                <li>Harass, abuse, or threaten other users through the messaging system.</li>
                <li>Copy, redistribute, or sell course materials without permission.</li>
                <li>Attempt to access accounts, courses, or data you are not authorized to access.</li>
                <li>Disrupt or interfere with the Service&apos;s security or functionality.</li>
                <li>Upload malicious files or content through the platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">6. Attendance and Bundles</h2>
              <p className="mt-2 text-[var(--muted)]">
                Instructors track attendance manually. Bundle eligibility is determined by the instructor
                based on the number of sessions a student has attended. Miqrotek is not responsible for
                disputes over attendance records — these should be resolved with your instructor.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">7. Intellectual Property</h2>
              <p className="mt-2 text-[var(--muted)]">
                All course content, materials, and platform design are owned by Miqrotek or the
                respective instructors. You may not reproduce, distribute, or create derivative works
                without explicit written permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">8. Messaging</h2>
              <p className="mt-2 text-[var(--muted)]">
                The messaging feature is intended for communication between students and instructors
                regarding coursework and the platform. Messages are not encrypted end-to-end. Do not
                share sensitive personal or financial information through the messaging system.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">9. Termination</h2>
              <p className="mt-2 text-[var(--muted)]">
                We reserve the right to suspend or terminate accounts that violate these Terms.
                Instructors may be removed by administrators at any time. Students may request account
                deletion by contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">10. Disclaimer of Warranties</h2>
              <p className="mt-2 text-[var(--muted)]">
                The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
                uninterrupted access, and the Service may be temporarily unavailable for maintenance or
                updates.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">11. Limitation of Liability</h2>
              <p className="mt-2 text-[var(--muted)]">
                Miqrotek shall not be liable for any indirect, incidental, or consequential damages
                arising from the use of the Service, including loss of data, course access, or payment
                disputes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">12. Changes to Terms</h2>
              <p className="mt-2 text-[var(--muted)]">
                We may update these Terms from time to time. Continued use of the Service after changes
                are posted constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">13. Contact</h2>
              <p className="mt-2 text-[var(--muted)]">
                For questions about these Terms, contact us at{" "}
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
              href="/privacy"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              View our Privacy Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
