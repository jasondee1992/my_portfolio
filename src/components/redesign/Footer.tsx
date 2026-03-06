export default function Footer() {
  return (
    <footer className="container-page mt-14 pb-10">
      <div className="h-px w-full bg-white/10" />

      <div className="mt-6 flex flex-col items-center justify-between gap-4 text-sm text-white/45 md:flex-row">
        <div>© 2026 Jasond Delos Santos. All rights reserved.</div>

        <div className="flex items-center gap-5 text-white/60">
          <span>✉</span>
          <span>⌘</span>
          <span>in</span>
          <span>💬</span>
        </div>
      </div>
    </footer>
  );
}