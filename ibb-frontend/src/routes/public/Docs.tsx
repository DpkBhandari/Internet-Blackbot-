export default function Docs() {
  const sections = [
    { id: "quickstart", title: "Quickstart", body: "Sign up, upload a document, and run your first analysis." },
    { id: "uploads", title: "Uploads", body: "We support PDF, DOCX, TXT and CSV. Files are extracted, chunked and embedded automatically." },
    { id: "ai", title: "AI Assistant", body: "Streaming responses with retrieval over your workspace and verified web sources." },
    { id: "api", title: "API", body: "Full REST API for programmatic access. JWT-based authentication." },
    { id: "webhooks", title: "Webhooks", body: "Real-time delivery for analysis events." },
  ];
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-[200px_1fr] gap-10">
      <nav className="text-sm space-y-2 sticky top-24 self-start">
        {sections.map((s) => <a key={s.id} href={`#${s.id}`} className="block text-muted hover:text-text">{s.title}</a>)}
      </nav>
      <div className="space-y-12">
        {sections.map((s) => (
          <section key={s.id} id={s.id}>
            <h2 className="font-display text-2xl font-semibold">{s.title}</h2>
            <p className="text-muted mt-3 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
