import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">This page could not be found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The link you tried to open is invalid, expired, or does not exist.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Go home
          </Link>
          <a href="https://www.example.com" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Visit example.com
          </a>
        </div>
      </div>
    </div>
  );
}
