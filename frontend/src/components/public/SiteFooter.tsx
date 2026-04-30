import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground mt-20">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-gradient">
              <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </span>
            <span className="font-display text-xl font-bold">NexaHealth</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-secondary-foreground/70 leading-relaxed">
            A cloud-native healthcare platform connecting patients, doctors, and care — securely, instantly, and intelligently.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/70">
            <li>Patient management</li>
            <li>Doctor portal</li>
            <li>Telemedicine</li>
            <li>AI symptom checker</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/70">
            <li><Link to="/about" className="hover:text-secondary-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-secondary-foreground">Contact</Link></li>
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-secondary-foreground/10">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-secondary-foreground/60">
          © {new Date().getFullYear()} NexaHealth. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
