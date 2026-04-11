import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";

const EXAMPLE_APPS = [
  { name: "VLC Media Player", id: "9NBLGGH4VVNH" },
  { name: "WhatsApp",         id: "9NKSQGP7F2NH" },
  { name: "Spotify",          id: "9NCBCSZSJRSB" },
  { name: "Windows Terminal", id: "9N0DX20HK701" },
  { name: "Telegram",         id: "9NZTWSQNTD0S" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[400px] rounded-full bg-brand-500/5 blur-3xl" />
        </div>

        {/* Grid lines decoration */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,45,61,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(37,45,61,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
            Powered by AdGuard Store API
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight text-slate-100 mb-4 animate-slide-up">
            Download any{" "}
            <span className="text-brand-400">Microsoft Store</span>{" "}
            app directly
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mb-10 leading-relaxed animate-slide-up stagger-1 opacity-0 [animation-fill-mode:forwards]">
            Paste a Product ID or Store URL. Get direct download links for every
            package variant — MSIX, AppX, bundles, and more.
          </p>

          <div className="w-full animate-slide-up stagger-2 opacity-0 [animation-fill-mode:forwards]">
            <SearchBar />
          </div>

          <div className="mt-8 animate-slide-up stagger-3 opacity-0 [animation-fill-mode:forwards]">
            <p className="text-xs text-slate-500 mb-3">Try an example:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_APPS.map((app) => (
                <a
                  key={app.id}
                  href={`/results?q=${app.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs text-slate-400 hover:text-slate-200 hover:border-slate-500 hover:bg-surface-hover transition-all"
                >
                  <span>{app.name}</span>
                  <span className="font-mono text-slate-600">{app.id}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-surface-border bg-surface-muted/40 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-center text-slate-200 mb-10">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                title: "Paste a link or ID",
                desc: "Copy a Microsoft Store URL or grab the Product ID from the store page.",
              },
              {
                n: "02",
                title: "Server fetches packages",
                desc: "Our proxy queries the AdGuard Store API server-side — no CORS, no leaks, no rate-limit exposure.",
              },
              {
                n: "03",
                title: "Download your files",
                desc: "Browse all package variants, filter by architecture or type, and grab direct download links.",
              },
            ].map((s) => (
              <div key={s.n} className="bg-surface-card border border-surface-border rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 font-display font-bold text-4xl text-slate-800 select-none">
                  {s.n}
                </div>
                <div className="relative">
                  <h3 className="font-semibold text-slate-200 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-surface-border px-4 py-6 text-center">
        <p className="text-xs text-slate-600">
          SoftMicro is not affiliated with Microsoft. Package links are served by the AdGuard Store API.
        </p>
      </footer>
    </div>
  );
}
