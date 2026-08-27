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
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { downloadConversationPdf } from "@/lib/conversation-export";
import { articleCatalog, articleSections, officialGrundgesetzUrl, type ArticleEntry } from "@/lib/article-catalog";

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

type ChatMessage = { role: "user" | "assistant"; content: string };



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
  const [articleSidebarOpen, setArticleSidebarOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleEntry>(articleCatalog[0]);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [localError, setLocalError] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [saveNotice, setSaveNotice] = useState("");
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const [localHistory, setLocalHistory] = useState<Array<{ title: string; messages: ChatMessage[]; savedAt: string }>>([]);
  const { isAuthenticated, user } = useAuth();
  const historyQuery = trpc.history.list.useQuery(undefined, { enabled: isAuthenticated });
  const saveHistoryMutation = trpc.history.save.useMutation({
    onSuccess: () => {
      setSaveNotice("Unterhaltung sicher im persönlichen Verlauf gespeichert.");
      historyQuery.refetch();
    },
    onError: () => setSaveNotice("Server-Speicherung benötigt eine aktive Anmeldung. Die Unterhaltung bleibt lokal verfügbar."),
  });
  const loadedHistoryQuery = trpc.history.get.useQuery(
    { id: selectedHistoryId ?? 0 },
    { enabled: selectedHistoryId !== null && isAuthenticated },
  );
  const removeHistoryMutation = trpc.history.remove.useMutation({
    onSuccess: () => {
      setSelectedHistoryId(null);
      historyQuery.refetch();
    },
  });
  useEffect(() => {
    try {
      const raw = localStorage.getItem("grundgesetz-chat-latest");
      if (raw) {
        const parsed = JSON.parse(raw) as { title: string; messages: ChatMessage[]; savedAt: string } | Array<{ title: string; messages: ChatMessage[]; savedAt: string }>;
        const savedItems = Array.isArray(parsed) ? parsed : [parsed];
        setLocalHistory(savedItems.filter(item => item?.title && Array.isArray(item.messages)).slice(0, 10));
      }
    } catch {
      setLocalHistory([]);
    }
  }, []);

  useEffect(() => {
    if (!articleSidebarOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setArticleSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [articleSidebarOpen]);

  useEffect(() => {
    const saved = loadedHistoryQuery.data;
    if (!saved) return;
    const messages = saved.messages.map(message => ({ role: message.role, content: message.content }));
    const lastQuestion = [...messages].reverse().find(message => message.role === "user");
    const lastAnswer = [...messages].reverse().find(message => message.role === "assistant");
    setChatMessages(messages);
    setAiQuestion(lastQuestion?.content || saved.title);
    setAiAnswer(lastAnswer?.content || null);
    setHasSearched(true);
    setSaveNotice("Gespeicherte Unterhaltung geladen.");
  }, [loadedHistoryQuery.data]);
  const askMutation = trpc.ai.ask.useMutation({
    onSuccess: (data) => {
      setAiAnswer(data.answer);
      setAiQuestion(data.question);
      setChatMessages([{ role: "user", content: data.question }, { role: "assistant", content: data.answer }]);
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

  const currentMessages = useMemo<ChatMessage[]>(() => {
    if (chatMessages.length > 0) return chatMessages;
    return [{ role: "user", content: aiQuestion || activeExample.question }, { role: "assistant", content: `${answer.title}\n\n${answer.body}` }];
  }, [activeExample.question, aiQuestion, answer.body, answer.title, chatMessages]);

  const saveConversation = () => {
    const title = (currentMessages.find(message => message.role === "user")?.content || "Grundgesetz-Gespräch").slice(0, 180);
    const savedConversation = { title, messages: currentMessages, savedAt: new Date().toISOString() };
    const nextLocalHistory = [savedConversation, ...localHistory.filter(item => item.title !== title)].slice(0, 10);
    localStorage.setItem("grundgesetz-chat-latest", JSON.stringify(nextLocalHistory));
    setLocalHistory(nextLocalHistory);
    if (isAuthenticated) {
      saveHistoryMutation.mutate({ title, messages: currentMessages });
      return;
    }
    setSaveNotice("Lokal in diesem Browser gespeichert. Für geräteübergreifenden Verlauf bitte anmelden.");
  };

  const downloadPdf = () => {
    const title = (currentMessages.find(message => message.role === "user")?.content || "Grundgesetz-Gespräch").slice(0, 180);
    downloadConversationPdf(title, currentMessages);
  };

  const loadHistory = (id: number) => {
    setSelectedHistoryId(id);
    setSaveNotice("");
  };

  const loadLocalConversation = (saved: { title: string; messages: ChatMessage[] }) => {
    const lastQuestion = [...saved.messages].reverse().find(message => message.role === "user");
    const lastAnswer = [...saved.messages].reverse().find(message => message.role === "assistant");
    setChatMessages(saved.messages);
    setAiQuestion(lastQuestion?.content || saved.title);
    setAiAnswer(lastAnswer?.content || null);
    setHasSearched(true);
    setSaveNotice("Lokale Unterhaltung geladen.");
  };

  const explainArticle = (article: ArticleEntry) => {
    setSelectedArticle(article);
    setArticleSidebarOpen(false);
    const question = `Erkläre ${article.label} GG Schritt für Schritt in einfacher Sprache. Nenne den Verfassungszweck, wichtige Begriffe, mögliche Grenzen und verweise auf den amtlichen Wortlaut.`;
    setQuery(question);
    setAiAnswer(null);
    setAiQuestion(question);
    setHasSearched(true);
    setLocalError("");
    askMutation.mutate({ question });
    scrollToAnswer();
  };

  const moveArticle = (direction: -1 | 1) => {
    const currentIndex = articleCatalog.findIndex(article => article.id === selectedArticle.id);
    const next = articleCatalog[Math.max(0, Math.min(articleCatalog.length - 1, currentIndex + direction))];
    if (next) explainArticle(next);
  };

  const chooseExample = (example: (typeof examples)[number]) => {
    setActiveExample(example);
    setAnswer(answers[example.article]);
    setAiAnswer(null);
    setChatMessages([]);
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
          {isAuthenticated ? <span className="header-user">{user?.name || "Angemeldet"}</span> : <button className="login-link" type="button" onClick={() => startLogin()}>Anmelden <ArrowUpRight size={15} strokeWidth={1.8} /></button>}
          <button className="menu-button" type="button" aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"} onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <button className={`article-drawer-toggle ${articleSidebarOpen ? "is-open" : ""}`} type="button" onClick={() => setArticleSidebarOpen(open => !open)} aria-expanded={articleSidebarOpen} aria-controls="article-sidebar"><BookOpen size={15} /> Artikel-Navigation</button>
      <aside id="article-sidebar" className={`article-sidebar ${articleSidebarOpen ? "is-open" : ""}`} aria-label="Alle Grundgesetz-Artikel">
        <div className="article-sidebar-top"><span className="section-kicker">Schritt für Schritt</span><strong>Alle Artikel</strong><button type="button" className="article-sidebar-close" onClick={() => setArticleSidebarOpen(false)} aria-label="Artikelnavigation schließen"><X size={16} /></button></div>
        <p className="article-sidebar-intro">Wähle einen Artikel aus. Die KI erklärt Zweck, Begriffe und Grenzen in verständlicher Sprache.</p>
        <div className="article-stepper"><button type="button" onClick={() => moveArticle(-1)} disabled={selectedArticle.id === articleCatalog[0].id} aria-label="Vorheriger Artikel">←</button><span>{selectedArticle.label} · {articleCatalog.findIndex(article => article.id === selectedArticle.id) + 1}/{articleCatalog.length}</span><button type="button" onClick={() => moveArticle(1)} disabled={selectedArticle.id === articleCatalog.at(-1)?.id} aria-label="Nächster Artikel">→</button></div>
        <div className="article-list">
          {articleSections.map(section => <div className="article-group" key={section}><span className="article-group-title">{section}</span>{articleCatalog.filter(article => article.section === section).map(article => <button type="button" className={`article-item ${selectedArticle.id === article.id ? "is-selected" : ""} ${article.fallen ? "is-fallen" : ""}`} key={article.id} onClick={() => explainArticle(article)}><span>{article.label}</span><em>{article.fallen ? "weggefallen" : article.title}</em></button>)}</div>)}
        </div>
        <a className="article-source-link" href={officialGrundgesetzUrl} target="_blank" rel="noreferrer">Amtlichen Wortlaut öffnen <ArrowUpRight size={14} /></a>
      </aside>

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
            <div className="conversation-actions">
              <button type="button" onClick={saveConversation} disabled={saveHistoryMutation.isPending}><BookOpen size={15} /> {saveHistoryMutation.isPending ? "Speichert …" : "Verlauf speichern"}</button>
              <button type="button" onClick={downloadPdf}><ArrowUpRight size={15} /> Als PDF drucken</button>
            </div>
            {saveNotice && <p className="save-notice" role="status">{saveNotice}</p>}
          </article>
          {chatMessages.length > 0 && (
            <div className="message-thread" aria-label="Aktueller Chatverlauf">
              {chatMessages.map((message, index) => (
                <div className={`thread-message ${message.role}`} key={`${message.role}-${index}`}>
                  <span>{message.role === "user" ? "Deine Frage" : "Grundgesetz GPT"}</span>
                  <div>{message.role === "assistant" ? <Streamdown>{message.content}</Streamdown> : message.content}</div>
                </div>
              ))}
            </div>
          )}
          {localHistory.length > 0 && (
            <aside className="history-panel" aria-label="Lokal gespeicherte Unterhaltung">
              <div className="history-panel-heading"><span className="section-kicker">Dieser Browser</span><strong>Lokaler Verlauf</strong></div>
              {localHistory.map((item, index) => <button className="local-history-button" type="button" key={`${item.savedAt}-${index}`} onClick={() => loadLocalConversation(item)}>{item.title}</button>)}
              <p className="history-loaded">Lokal gespeichert; nur auf diesem Gerät sichtbar.</p>
            </aside>
          )}
          {isAuthenticated && historyQuery.data && historyQuery.data.length > 0 && (
            <aside className="history-panel" aria-label="Gespeicherte Unterhaltungen">
              <div className="history-panel-heading"><span className="section-kicker">Persönlicher Verlauf</span><strong>Gespeicherte Gespräche</strong></div>
              {historyQuery.data.slice(0, 6).map(item => (
                <div className="history-row" key={item.id}>
                  <button type="button" onClick={() => loadHistory(item.id)}>{item.title}</button>
                  <button type="button" aria-label={`${item.title} löschen`} onClick={() => removeHistoryMutation.mutate({ id: item.id })}>×</button>
                </div>
              ))}
              {loadedHistoryQuery.data && <p className="history-loaded">{loadedHistoryQuery.data.messages.length} Nachrichten geladen. Öffne sie über den Verlaufseintrag.</p>}
            </aside>
          )}
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
