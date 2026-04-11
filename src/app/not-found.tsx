import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="font-display font-bold text-8xl text-slate-800 mb-4 select-none">404</div>
      <h1 className="font-display font-bold text-2xl text-slate-200 mb-2">Page not found</h1>
      <p className="text-slate-500 mb-8">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="px-5 py-2.5 text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors brand-glow"
      >
        Back to home
      </Link>
    </div>
  );
}
