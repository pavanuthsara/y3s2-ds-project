import { Link } from "react-router-dom";
import { SiteHeader } from "../../../components/public/SiteHeader";
import { SiteFooter } from "../../../components/public/SiteFooter";
import { Heart, Globe, Lock, Lightbulb, ArrowRight } from "lucide-react";



const values = [
  { icon: Heart, title: "Patients first", desc: "Every product decision starts with a patient outcome — never a metric." },
  { icon: Lock, title: "Security by design", desc: "Encryption, granular access controls, and compliance baked into every layer." },
  { icon: Globe, title: "Care without borders", desc: "Telemedicine that closes the gap between rural homes and world-class specialists." },
  { icon: Lightbulb, title: "AI with judgment", desc: "Intelligence that supports clinicians — never replaces their expertise." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <section className="bg-hero">
        <div className="mx-auto max-w-5xl px-6 pt-24 pb-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            About NexaHealth
          </span>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            We're rebuilding healthcare on <span className="text-gradient">one secure cloud.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            NexaHealth was founded on a simple belief: technology should give doctors more time with patients, and give patients more confidence in their care.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 grid lg:grid-cols-2 gap-16 items-start">
        <div>
          <h2 className="font-display text-4xl font-bold tracking-tight">Our story</h2>
          <div className="mt-6 space-y-5 text-muted-foreground leading-relaxed">
            <p>
              NexaHealth started with a frustrating reality — patients juggling paper records, doctors lost in fragmented systems, and clinics held back by software built for a different decade.
            </p>
            <p>
              So we set out to build a single cloud-native platform that connects every part of the journey: profiles, appointments, telemedicine, payments, prescriptions, and intelligent triage.
            </p>
            <p>
              Today, NexaHealth powers thousands of clinicians and millions of patient interactions — securely, instantly, everywhere.
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-brand text-secondary-foreground p-10 shadow-glow">
          <h3 className="font-display text-2xl font-semibold">Our mission</h3>
          <p className="mt-4 text-secondary-foreground/85 leading-relaxed">
            To make high-quality healthcare accessible, secure, and intelligent — for every patient, every doctor, everywhere.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-secondary-foreground/15 pt-8">
            {[["2021", "Founded"], ["12", "Countries"], ["A+", "Security rating"]].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-2xl font-bold">{n}</div>
                <div className="text-xs text-secondary-foreground/70 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <h2 className="font-display text-4xl font-bold tracking-tight max-w-xl">
            What we <span className="text-gradient">stand for</span>
          </h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-background p-7 shadow-soft">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-gradient text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight">Build the future of care with us</h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Whether you're a clinician, a hospital, or a patient — there's a place for you in the NexaHealth network.
        </p>
        <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-3.5 text-sm font-semibold text-secondary-foreground shadow-soft hover:opacity-90 transition-base">
          Get in touch <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}

