import React from 'react';
import { PageHeader } from '../components/PageHeader';

const SECURITY_TOPICS = [
  {
    title: 'What this deployment is',
    body: [
      'A defensive login gateway and investigation console for an application the operator owns. The only protected application included is a synthetic sample portal local to this deployment.',
      'No exploit tooling, credential-stuffing tooling, password collection, external scanning or callbacks exist anywhere in this product.',
    ],
  },
  {
    title: 'What is never stored',
    body: [
      'Passwords, one-time codes, recovery secrets and full request bodies are excluded before any event is constructed. Credentials are handled transiently by the authentication adapter and compared in constant time.',
      'Submitted account identifiers are not stored. Telemetry keeps a keyed digest that rotates weekly, so it cannot be reversed or linked across the rotation boundary.',
      'No IP address, no browser fingerprint, no keystroke stream. Request metadata is limited to a coarse user-agent family label.',
    ],
  },
  {
    title: 'How decisions are made',
    body: [
      'A transparent weighted model combines several independent signals. Each contribution — weight × intensity — is stored with the event, alongside the policy version, so any decision can be reconstructed.',
      'A single signal can never route a session to the decoy: the high tier requires at least two strong, independent signals. Scores are estimates about session behaviour, never certainty about a person.',
    ],
  },
  {
    title: 'The deception boundary',
    body: [
      'Low risk continues through ordinary authentication. Uncertain sessions get bounded neutral throttling and the configured step-up factor. High risk is served an isolated decoy: a synthetic identity and a synthetic dataset, never a real session, real token or real record.',
      'Decoy and real channels are separate code paths in both data selection and authorisation checks. Only the decoy channel is instrumented for artifact access.',
    ],
  },
  {
    title: 'Locking a real user out',
    body: [
      'A high-risk decision is not a permanent lock. The owner can recover the session with the account’s separate strong recovery factor, and an analyst can label the session for follow-up.',
      'Repeating the password is never a way past a challenge, and no bypass is derived from the submitted credential alone.',
    ],
  },
  {
    title: 'When infrastructure fails',
    body: [
      'If the policy or telemetry store is unavailable, the gateway never issues real access tokens. Fails closed on core authentication, preventing unmonitored bypass.',
      'Telemetry failure never leads to an accidental compromise of the real customer workspace.',
    ],
  },
];

export function SecurityPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Govern"
        title="Trust boundaries"
        description="Architectural boundaries, privacy principles and fail-closed security guarantees enforced throughout this gateway."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {SECURITY_TOPICS.map((topic) => (
          <div key={topic.title} className="panel p-5 space-y-3">
            <h2 className="text-[14px] font-semibold tracking-tight text-foreground">
              {topic.title}
            </h2>
            <div className="space-y-2 text-[12.5px] leading-relaxed text-muted-foreground">
              {topic.body.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
