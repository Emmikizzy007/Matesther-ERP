"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Crown,
  ClipboardList,
  Shirt,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { useAuth, Role } from "@/lib/auth";

const ROLES: {
  role: Role;
  title: string;
  desc: string;
  icon: any;
  name: string;
  email: string;
  demoPassword: string;
}[] = [
  {
    role: "OWNER",
    title: "Owner / Admin",
    desc: "Full access — dashboard, orders, production, materials, expenses, payments, reports & profitability.",
    icon: Crown,
    name: "Esther Adejugba",
    email: "estheradejugba@gmail.com",
    demoPassword: "owner123",
  },
  {
    role: "PRODUCTION_MANAGER",
    title: "Project Manager",
    desc: "Supervises production: assigns workers, inspects submitted work, approves / reworks / rejects. No financial figures.",
    icon: ClipboardList,
    name: "Itesh Justina",
    email: "iteshjustina@gmail.com",
    demoPassword: "manager123",
  },
  {
    role: "WORKER",
    title: "Worker",
    desc: "View assigned production tasks and update completed quantities.",
    icon: Shirt,
    name: "Oyeku Omolayo",
    email: "oyeku.omolayo@gmail.com",
    demoPassword: "worker123",
  },
];

export default function LoginPage() {
  const { login, loginWithPassword, user, loading } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState<Role | null>(null);

  // staff email + password form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [formErr, setFormErr] = useState("");

  // Already signed in? Go straight to the dashboard.
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  // Safety: clear spinners if navigation ever stalls.
  useEffect(() => {
    if (!signingIn && !formBusy) return;
    const t = setTimeout(() => {
      setSigningIn(null);
      setFormBusy(false);
    }, 8000);
    return () => clearTimeout(t);
  }, [signingIn, formBusy]);

  function quickSignIn(r: (typeof ROLES)[number]) {
    if (signingIn || formBusy) return;
    setSigningIn(r.role);
    login({ name: r.name, email: r.email, role: r.role });
  }

  function fillDemo(r: (typeof ROLES)[number]) {
    setEmail(r.email);
    setPassword(r.demoPassword);
    setFormErr("");
  }

  async function staffSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (formBusy || signingIn) return;
    setFormBusy(true);
    setFormErr("");
    try {
      await loginWithPassword(email.trim(), password);
    } catch (err: any) {
      setFormErr(err.message || "Sign-in failed.");
      setFormBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-matesther-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl">
        {/* Brand panel */}
        <div className="bg-matesther-900 p-8 md:p-10 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center">
                <Scissors className="w-6 h-6 text-matesther-950" />
              </div>
              <div>
                <p className="font-extrabold text-2xl tracking-wide">MATESTHER</p>
                <p className="text-xs text-matesther-100/80">
                  Uniform Production &amp; Business Management System
                </p>
              </div>
            </div>
            <div className="mt-10 space-y-4 text-sm text-matesther-100/90">
              <p className="text-base font-semibold text-white">
                One system for every uniform order — from cutting to delivery.
              </p>
              <ul className="space-y-2.5 text-[13px]">
                <li>✓ Track production stage by stage, worker by worker</li>
                <li>✓ Know exactly what was spent on each order</li>
                <li>✓ See customer payments &amp; outstanding balances</li>
                <li>✓ Know the true profit on every order</li>
              </ul>
            </div>
          </div>
          <p className="text-[11px] text-matesther-100/60 mt-10">
            Zone 7 behind Capital Hotel, Osogbo, Osun, Nigeria • estheradejugba@gmail.com
          </p>
        </div>

        {/* Login panel */}
        <div className="bg-white p-8 md:p-10 max-h-[92vh] overflow-y-auto slim-scroll">
          <h1 className="text-xl font-bold text-slate-900">Sign in to Matesther</h1>
          <p className="text-sm text-slate-500 mt-1 mb-5">
            Staff sign-in with your email and password.
          </p>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Preparing sign-in…
            </div>
          ) : (
            <>
              {/* Real email + password sign-in */}
              <form
                onSubmit={staffSignIn}
                className="rounded-xl border-2 border-matesther-700/30 bg-matesther-50/50 p-4 space-y-3"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Staff email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@matesther.ng"
                      className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-matesther-700/40 focus:border-matesther-700 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-matesther-700/40 focus:border-matesther-700 bg-white"
                    />
                  </div>
                </div>
                {formErr && (
                  <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formErr}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={formBusy || signingIn !== null}
                  className="w-full inline-flex items-center justify-center gap-2 bg-matesther-800 hover:bg-matesther-900 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {formBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {formBusy ? "Signing in…" : "Sign in with password"}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  or one-tap demo
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* One-tap demo cards */}
              <div className="space-y-3">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const busy = signingIn === r.role;
                  return (
                    <div
                      key={r.role}
                      className={`w-full rounded-xl border-2 p-4 transition-all ${
                        busy
                          ? "border-matesther-700 bg-matesther-50"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-matesther-800 text-white shrink-0">
                          {busy ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-slate-900">
                            {r.title}
                          </p>
                          <p className="text-xs text-slate-500">{r.name}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {r.desc}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        {r.email} • {r.demoPassword}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => quickSignIn(r)}
                          disabled={signingIn !== null || formBusy}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-matesther-800 hover:bg-matesther-900 disabled:opacity-60 text-white font-semibold py-2 rounded-lg text-xs transition-colors"
                        >
                          {busy ? "Signing in…" : "Tap to enter"}
                          {!busy && <ArrowRight className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => fillDemo(r)}
                          disabled={signingIn !== null || formBusy}
                          className="px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                          title="Fill the email + password form above with this demo account"
                        >
                          Fill login form
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          <p className="text-[11px] text-slate-400 text-center mt-6">
            Owner manages staff accounts and passwords in Settings → Users.
          </p>
        </div>
      </div>
    </div>
  );
}
