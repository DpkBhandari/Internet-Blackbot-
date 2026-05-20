export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-display text-4xl font-semibold">About Internet Black Box</h1>
      <p className="text-muted mt-4 text-lg leading-relaxed">
        We build the intelligence layer for the open internet. Our platform helps researchers,
        journalists, and analysts make sense of large volumes of content using state-of-the-art
        AI, transparent source verification, and rigorous citation.
      </p>
      <div className="prose prose-invert mt-10 text-muted space-y-4">
        <p>Our mission is simple: make research verifiable, traceable, and fast.</p>
        <p>Every claim our system surfaces is backed by sources you can audit.</p>
      </div>
    </div>
  );
}
