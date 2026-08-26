/*
 * Verfassungsblatt page: an editorial question-to-source journey, with warm paper,
 * a red rule as the connective motif, and source signals that remain visible.
 */
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Menu,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";

const heroImage = "/manus-storage/verfassungsblatt-hero_52fa1064.png";
const archiveImage = "/manus-storage/verfassungsblatt-archive_d78ab496.png";
const sourceImage = "/manus-storage/verfassungsblatt-source_7552d79d.png";
const markImage = "/manus-storage/verfassungsblatt-mark.svg_0a001e3e.png";

const examples = [
  {
    article: "Art. 5 GG",
    label: "Meinungsfreiheit",
    question: "Was schützt die Meinungsfreiheit — und wo liegen ihre Grenzen?",
  },
  {
    article: "Art. 3 GG",
    label: "Gleichheit",
    question: "Wie ist der Gleichheitsgrundsatz im Alltag zu verstehen?",
  },
  {
    article: "Art. 20 GG",
    label: "Staatsprinzipien",
    question: "Welche Staatsprinzipien stehen in Artikel 20?",
  },
];

const answers: Record<string, { article: string; title: string; body: string; source: string }> = {
  "Art. 5 GG": {
    article: "Artikel 5 · Absatz 1",
    title: "Meinungen dürfen frei entstehen und geäußert werden.",
    body: "Das Grundgesetz schützt, seine Meinung in Wort, Schrift und Bild frei zu äußern und zu verbreiten. Geschützt ist auch der Zugang zu allgemein zugänglichen Quellen. Der Schutz endet nicht bei unbequemen oder mehrheitlich unerwünschten Ansichten.",
    source: "Grundgesetz für die Bundesrepublik Deutschland, Art. 5 Abs. 1",
  },
  "Art. 3 GG": {
    article: "Artikel 3 · Absatz 1",
    title: "Gleiches ist gleich, Ungleiches darf begründet verschieden behandelt werden.",
    body: "Der allgemeine Gleichheitssatz bindet staatliches Handeln. Ob eine unterschiedliche Behandlung zulässig ist, hängt vom sachlichen Grund und von der Intensität der Ungleichbehandlung ab. Die konkrete Prüfung bleibt eine juristische Einzelfallfrage.",
    source: "Grundgesetz für die Bundesrepublik Deutschland, Art. 3",
  },
  "Art. 20 GG": {
    article: "Artikel 20 · Absatz 1",
    title: "Deutschland ist ein demokratischer und sozialer Bundesstaat.",
    body: "Artikel 20 beschreibt zentrale Grundlagen der staatlichen Ordnung: Demokratie, Sozialstaat, Bundesstaat und Rechtsstaatlichkeit. Die Staatsgewalt geht vom Volke aus und wird durch Wahlen, Abstimmungen sowie besondere Organe ausgeübt.",
    source: "Grundgesetz für die Bundesrepublik Deutschland, Art. 20",
  },
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeExample, setActiveExample] = useState(examples[0]);
  const [answer, setAnswer] = useState(answers["Art. 5 GG"]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [localError, setLocalError] = useState("");
  const askMutation = trpc.ai.ask.useMutation({
    onSuccess: (data) => {
      setAiAnswer(data.answer);
      setAiQuestion(data.question);
      setLocalError("");
    },
    onError: (error) => {
      setLocalError(error.message);
    },
  });

  const scrollToAnswer = () => {
    window.setTimeout(() => {
      document.getElementById("antwort")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  };

  const askQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuestion = query.trim();
    if (trimmedQuestion.length < 3) {
      setLocalError("Bitte formuliere eine etwas ausführlichere Frage.");
      return;
    }
    setLocalError("");
    setAiAnswer(null);
    setAiQuestion(trimmedQuestion);
    setHasSearched(true);
    askMutation.mutate({ question: trimmedQuestion });
    scrollToAnswer();
  };

  const chooseExample = (example: (typeof examples)[number]) => {
    setActiveExample(example);
    setAnswer(answers[example.article]);
    setAiAnswer(null);
    setAiQuestion("");
    setLocalError("");
    setQuery(example.question);
    setHasSearched(true);
    scrollToAnswer();
  };

  return (
    <main className="site-shell">
      <div className="topline">
        <div className="topline-inner">
          <span>Ein unabhängiges Recherchefenster zum Grundgesetz</span>
          <span className="topline-status"><span className="status-dot" /> Öffentliches Projekt · Beta</span>
        </div>
      </div>

      <header className="site-header">
        <a className="brand" href="#start" aria-label="Grundgesetz Deutschland — Startseite">
          <img src={markImage} alt="" className="brand-mark" />
          <span className="brand-wordmark"><strong>Grundgesetz</strong><em>Deutschland</em></span>
        </a>
        <nav className={`main-nav ${mobileMenuOpen ? "is-open" : ""}`} aria-label="Hauptnavigation">
          <a href="#fragen" onClick={() => setMobileMenuOpen(false)}>Fragen</a>
          <a href="#antwort" onClick={() => setMobileMenuOpen(false)}>Antworten</a>
          <a href="#quellen" onClick={() => setMobileMenuOpen(false)}>Quellen</a>
          <a href="#ueber" onClick={() => setMobileMenuOpen(false)}>Über das Projekt</a>
        </nav>
        <div className="header-actions">
          <a className="header-link" href="#hinweis">Nutzungshinweis <ArrowUpRight size={15} strokeWidth={1.8} /></a>
          <button className="menu-button" type="button" aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"} onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <section className="hero" id="start">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-rule" /> Verfassungswissen, verständlich gemacht</div>
          <h1>Stelle eine Frage.<br /><span>Finde den Maßstab.</span></h1>
          <p className="hero-lede">Grundgesetz Deutschland hilft dir, verfassungsrechtliche Fragen zu sortieren — mit klarer Sprache, sichtbaren Quellen und dem nötigen Abstand zur Gewissheit.</p>
          <form className="question-form" onSubmit={askQuestion}>
            <label htmlFor="question">Deine Frage zum Grundgesetz</label>
            <div className="question-input-wrap">
              <Search size={20} aria-hidden="true" />
              <input id="question" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="z. B. Was bedeutet Artikel 5?" aria-describedby="question-note" />
              <button type="submit" aria-label="Frage untersuchen" disabled={askMutation.isPending}><ArrowUpRight size={21} /></button>
            </div>
            <p className="form-note" id="question-note"><span className="red-line" /> Manus KI · keine Rechtsberatung · Quellen immer prüfen</p>
            {localError && <p className="form-error" role="alert">{localError}</p>}
          </form>
        </div>
        <div className="hero-visual" aria-label="Archivisches Gesetzbuch auf einem Lesetisch">
          <img src={heroImage} alt="Offenes Gesetzbuch mit rotem Lesezeichen auf einem dunklen Holztisch" />
          <div className="hero-caption"><span>01 / 03</span><span>Vom Wortlaut zur Einordnung</span></div>
          <div className="hero-side-note">GG<br /><span>1949</span></div>
        </div>
      </section>

      <section className="question-rail" id="fragen">
        <div className="rail-margin"><span>Kapitel 01</span><strong>Fragen, die bleiben</strong></div>
        <div className="rail-content">
          <div className="section-intro">
            <div>
              <span className="section-kicker">Einsteigen</span>
              <h2>Wo möchtest du<br /><i>genauer hinsehen?</i></h2>
            </div>
            <p>Beginne mit einer Frage, einem Artikel oder einem Begriff. Die Beispiele führen dich direkt in den passenden Kontext.</p>
          </div>
          <div className="example-grid">
            {examples.map((example, index) => (
              <button className={`example-card ${activeExample.article === example.article ? "is-active" : ""}`} key={example.article} onClick={() => chooseExample(example)} type="button">
                <span className="card-index">0{index + 1}</span>
                <span className="card-article">{example.article}</span>
                <strong>{example.label}</strong>
                <span className="card-question">{example.question}</span>
                <span className="card-action">Frage öffnen <ArrowUpRight size={16} /></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={`answer-section ${hasSearched ? "has-searched" : ""}`} id="antwort">
        <div className="answer-margin"><span>Kapitel 02</span><strong>Die Antwort</strong></div>
        <div className="answer-layout">
          <div className="answer-heading">
            <span className="section-kicker">Orientierung, nicht Urteil</span>
            <h2>Eine erste<br /><i>Einordnung.</i></h2>
            <div className="answer-meta"><span className="verified-mark"><Check size={13} /></span> Aus dem Wortlaut entwickelt</div>
          </div>
          <article className="answer-card">
            <div className="answer-card-top"><span>{aiAnswer ? "Live-Antwort · Manus LLM" : answer.article}</span><span className="answer-type"><Sparkles size={14} /> {aiAnswer ? "serverseitig geschützt" : "Beispiel-Einordnung"}</span></div>
            {askMutation.isPending ? (
              <div className="answer-loading" role="status"><span className="loading-pulse" /> Deine Frage wird eingeordnet …</div>
            ) : aiAnswer ? (
              <div className="ai-answer-markdown"><Streamdown>{aiAnswer}</Streamdown></div>
            ) : (
              <h3>{answer.title}</h3>
            )}
            {!aiAnswer && !askMutation.isPending && <p>{answer.body}</p>}
            <div className="answer-source"><BookOpen size={18} /><div><span>{aiAnswer ? "Quellenhinweis" : "Primärquelle"}</span><strong>{aiAnswer ? "Bitte den genannten Artikel am aktuellen amtlichen Wortlaut prüfen." : answer.source}</strong></div><ArrowUpRight size={17} /></div>
            <div className="answer-card-footer"><span>Frage: „{aiQuestion || activeExample.question}“</span><button type="button" onClick={() => document.getElementById("quellen")?.scrollIntoView({ behavior: "smooth" })}>Quellenweg ansehen <ArrowUpRight size={15} /></button></div>
          </article>
        </div>
      </section>

      <section className="source-section" id="quellen">
        <div className="source-margin"><span>Kapitel 03</span><strong>Der Quellenweg</strong></div>
        <div className="source-body">
          <div className="source-intro">
            <span className="section-kicker">Drei Schritte zurück zur Quelle</span>
            <h2>Verstehen heißt<br /><i>nachvollziehen.</i></h2>
            <p>Jede gute Antwort braucht einen Weg, den du selbst gehen kannst. Deshalb bleibt sichtbar, worauf eine Einordnung aufbaut.</p>
          </div>
          <div className="source-steps">
            <div className="source-step"><span>01</span><div><strong>Wortlaut</strong><p>Was steht tatsächlich im Artikel?</p></div></div>
            <div className="source-step"><span>02</span><div><strong>Kontext</strong><p>Wie ist die Regel grundsätzlich einzuordnen?</p></div></div>
            <div className="source-step"><span>03</span><div><strong>Prüfen</strong><p>Welche Grenzen und Streitfragen bleiben?</p></div></div>
          </div>
          <div className="source-images">
            <figure className="archive-figure"><img src={archiveImage} alt="Archivpapier, blaue Mappe und roter Faden" /><figcaption><span>Archivnotiz / 03</span><strong>Jede Frage beginnt<br />mit einem Rand.</strong></figcaption></figure>
            <figure className="source-figure"><img src={sourceImage} alt="Referenzkarten, Bleistift und Lesezeichen" /><figcaption><span>Arbeitsprinzip</span><strong>Quellen zuerst.<br />Sicherheit danach.</strong></figcaption></figure>
          </div>
        </div>
      </section>

      <section className="about-section" id="ueber">
        <div className="about-seal"><Scale size={24} strokeWidth={1.3} /><span>GG<br />DE</span></div>
        <div className="about-copy"><span className="section-kicker">Über das Projekt</span><h2>Ein ruhiger Ort<br /><i>für schwierige Fragen.</i></h2></div>
        <div className="about-text"><p>Grundgesetz Deutschland macht verfassungsrechtliche Orientierung zugänglich, ohne die Komplexität des Rechts zu verstecken. Das Projekt trennt Originaltext, Einordnung und offene Fragen — damit aus einer schnellen Antwort ein nachvollziehbarer Anfang wird.</p><a href="#hinweis">Mehr über Quellen und Grenzen <ArrowUpRight size={16} /></a></div>
      </section>

      <section className="notice-section" id="hinweis">
        <div className="notice-icon"><ShieldCheck size={24} strokeWidth={1.4} /></div>
        <div><span className="section-kicker">Hinweis zur Nutzung</span><h2>Orientierung ersetzt<br /><i>keine Beratung.</i></h2></div>
        <p>Die Anwendung ist ein Recherchewerkzeug. KI-generierte Antworten können Fehler enthalten, sind nicht verbindlich und sollten immer mit dem aktuellen amtlichen Gesetzestext abgeglichen werden. Bitte gib keine vertraulichen oder personenbezogenen Informationen ein.</p>
      </section>

      <footer className="site-footer">
        <div className="footer-brand"><img src={markImage} alt="" /><span><strong>Grundgesetz</strong><em>Deutschland</em></span></div>
        <div className="footer-links"><a href="#start">Nach oben <ChevronDown size={15} className="rotate-up" /></a><a href="https://github.com/rintuchowdory/grundgesetz-deutschland" target="_blank" rel="noreferrer">Projekt auf GitHub <ArrowUpRight size={15} /></a></div>
        <div className="footer-legal"><span>© 2026 Grundgesetz Deutschland</span><span>CC BY-NC-ND · No-AI-Richtlinie</span></div>
      </footer>
    </main>
  );
}
