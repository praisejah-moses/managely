
export function Greeting() {
  return (
    <section aria-labelledby="dashboard-greeting" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="rounded-2xl bg-linear-to-br from-blue-100/60 via-purple-100/60 to-pink-100/60 backdrop-blur-md py-16 px-8 border-2 border-purple-300 shadow-xl relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -mr-36 -mt-36 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-400/10 rounded-full blur-3xl -ml-36 -mb-36 animate-pulse" />
        
        <div className="text-center relative z-10">
          <h1 id="dashboard-greeting" className="text-4xl sm:text-2xl font-black tracking-tight bg-linear-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent mb-2">
            Welcome
          </h1>
          <div className="h-1 w-24 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto my-4 rounded-full" />
          <p className="mt-4 text-sm font-semibold text-slate-700 leading-relaxed">
            🚀 Manage your projects, tasks, and tags — stay organized and ship faster.
          </p>
       
        </div>
      </div>
    </section>
  );
}
