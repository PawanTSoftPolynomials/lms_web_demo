export default function AuthLayout({
  children,
  title,
  subtitle,
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-orange-500 tracking-tight leading-none">
            Orange Tree LMS
          </h1>
          {subtitle && (
            <p className="text-slate-400 mt-2 text-xs sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {title && (
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
              {title}
            </h2>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}