import { Link } from "react-router-dom";
import { SiteHeader } from "../../../components/public/SiteHeader";
import { SiteFooter } from "../../../components/public/SiteFooter";
import { Users, Stethoscope, Calendar, Video, CreditCard, Bell, Brain, ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import heroImg from "../../../assets/hero.jpg";



const services = [
  { icon: Users, title: "Patient Management", desc: "Register, manage profiles, upload medical reports, and access full medical history & past prescriptions in one place." },
  { icon: Stethoscope, title: "Doctor Portal", desc: "Manage your profile, set availability, conduct video consultations, and issue digital prescriptions effortlessly." },
  { icon: Calendar, title: "Smart Appointments", desc: "Search by specialty, book in seconds, modify or cancel, and track status in real time." },
  { icon: Video, title: "Telemedicine", desc: "End-to-end secure video consultations that connect patients and doctors instantly, from anywhere." },
  { icon: CreditCard, title: "Secure Payments", desc: "Frictionless online checkout with a hardened payment gateway and transparent invoicing." },
  { icon: Bell, title: "Smart Notifications", desc: "Real-time reminders for appointments, prescriptions, follow-ups and lab results — never miss a beat." },
  { icon: Brain, title: "AI Symptom Checker", desc: "AI-powered triage that helps patients understand symptoms and choose the right care path." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-28 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Cloud-native · HIPAA-ready
            </span>
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
              Healthcare,<br />
              <span className="text-gradient">re-engineered</span> for everyone.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              NexaHealth unifies patients, doctors, appointments, telemedicine, payments, and AI triage into one secure cloud platform — built for the next decade of care.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#" className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-3.5 text-sm font-semibold text-secondary-foreground shadow-soft hover:opacity-90 transition-base">
                Start free <ArrowRight className="h-4 w-4" />
              </a>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold hover:bg-muted transition-base">
                Learn more
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-8 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> End-to-end encrypted</div>
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Real-time everywhere</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -m-6 bg-accent-gradient blur-3xl opacity-30 rounded-full" />
            <img
              src={heroImg}
              alt="Abstract healthcare network visualization"
              width={1536}
              height={1024}
              className="relative rounded-3xl shadow-glow border border-border"
            />
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card shadow-card border border-border p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent-gradient flex items-center justify-center">
                <Video className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Live consult</div>
                <div className="text-sm font-semibold">Dr. Mehta · Cardiology</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[["2.4M+", "Patients served"], ["18k", "Verified doctors"], ["99.99%", "Uptime SLA"], ["48 sec", "Avg. booking time"]].map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-3xl md:text-4xl font-bold text-gradient">{n}</div>
              <div className="mt-1 text-sm text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            One platform. <span className="text-gradient">Every layer of care.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            From the first symptom search to a prescription delivered — NexaHealth handles it end to end.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="group relative rounded-2xl border border-border bg-card p-7 shadow-soft hover:shadow-card transition-base hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground group-hover:bg-accent-gradient group-hover:text-primary-foreground transition-base">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-brand p-12 md:p-16 text-secondary-foreground">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-gradient opacity-30 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
              Ready to bring your practice into the cloud?
            </h2>
            <p className="mt-4 text-secondary-foreground/80 text-lg">
              Join thousands of clinicians and patients building a smarter, kinder healthcare experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#" className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-7 py-3.5 text-sm font-semibold text-secondary hover:opacity-90 transition-base">
                Get started <ArrowRight className="h-4 w-4" />
              </a>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-secondary-foreground/30 px-7 py-3.5 text-sm font-semibold hover:bg-secondary-foreground/10 transition-base">
                Talk to sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

