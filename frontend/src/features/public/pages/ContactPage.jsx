
import { useState } from "react";
import { SiteHeader } from "../../../components/public/SiteHeader";
import { SiteFooter } from "../../../components/public/SiteFooter";
import { Mail, Phone, MapPin, MessageSquare, Send } from "lucide-react";



export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <section className="bg-hero">
        <div className="mx-auto max-w-5xl px-6 pt-24 pb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            Contact us
          </span>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Let's <span className="text-gradient">talk</span> about your care.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Questions, partnerships, support, or just curious — our team usually replies within a few hours.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-5 gap-10">
        {/* INFO */}
        <aside className="lg:col-span-2 space-y-4">
          {[
            { icon: Mail, title: "Email", value: "hello@nexahealth.io", sub: "General & support" },
            { icon: Phone, title: "Phone", value: "+1 (415) 555-0199", sub: "Mon–Fri, 9am–6pm" },
            { icon: MapPin, title: "Headquarters", value: "1 Market Street, San Francisco", sub: "California, USA" },
            { icon: MessageSquare, title: "Live chat", value: "Available in-app", sub: "24/7 for verified clinicians" },
          ].map(({ icon: Icon, title, value, sub }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-soft flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-gradient text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
                <div className="font-display text-lg font-semibold mt-0.5">{value}</div>
                <div className="text-sm text-muted-foreground">{sub}</div>
              </div>
            </div>
          ))}
        </aside>

        {/* FORM */}
        <div className="lg:col-span-3">
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-card"
          >
            <h2 className="font-display text-2xl font-bold">Send us a message</h2>
            <p className="mt-1 text-sm text-muted-foreground">We'll get back to you shortly.</p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <Field label="Full name" name="name" required />
              <Field label="Email" name="email" type="email" required />
            </div>
            <div className="mt-4">
              <Field label="Subject" name="subject" required />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                required
                rows={5}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-base"
                placeholder="How can we help?"
              />
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-3.5 text-sm font-semibold text-secondary-foreground shadow-soft hover:opacity-90 transition-base"
            >
              {sent ? "Message sent ✓" : (<>Send message <Send className="h-4 w-4" /></>)}
            </button>
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Field({ label, name, type = "text", required }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-2">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-base"
      />
    </div>
  );
}

