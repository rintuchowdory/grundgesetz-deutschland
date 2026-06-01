import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { AIChatBox } from "@/components/AIChatBox";
import { getLoginUrl } from "@/const";
import { Loader2, Menu, X } from "lucide-react";

export default function GrundgesetzApp() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

  // Fetch all articles
  const { data: articles = [], isLoading: articlesLoading } = trpc.articles.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch user conversations
  const { data: conversations = [] } = trpc.conversations.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Get selected article
  const selectedArticle = useMemo(
    () => articles.find(a => a.id === selectedArticleId) || articles[0],
    [articles, selectedArticleId]
  );

  // Filter articles by search
  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(a =>
      a.number.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  // Generate suggested questions for current article
  const suggestedQuestions = useMemo(() => {
    if (!selectedArticle) return [];
    return [
      `Was bedeutet ${selectedArticle.number} im Alltag?`,
      `Gibt es Ausnahmen zu ${selectedArticle.number}?`,
      `Wie hat das BVerfG ${selectedArticle.number} ausgelegt?`,
    ];
  }, [selectedArticle]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            GrundgesetzGPT
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            KI-Assistent für das Grundgesetz der Bundesrepublik Deutschland
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-gold hover:bg-gold-dark text-ink"
          >
            Mit Manus anmelden
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-ink text-parchment-light border-b-4 border-gold px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-gold hover:text-gold-light"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gold-light" style={{ fontFamily: "'Playfair Display', serif" }}>
              🦅 GrundgesetzGPT
            </h1>
            <p className="text-xs text-gold tracking-widest font-mono">Deutsches Verfassungsrecht · KI-Assistent</p>
          </div>
        </div>
        <div className="text-xs text-parchment-light font-mono tracking-widest">
          {user?.name || "Benutzer"}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } md:w-64 bg-ink border-r-2 border-gold flex flex-col overflow-hidden transition-all duration-300 flex-shrink-0`}
        >
          {/* Search */}
          <div className="p-4 border-b border-gold/30">
            <p className="text-xs text-gold tracking-widest font-mono mb-2 uppercase">Artikel durchsuchen</p>
            <Input
              type="text"
              placeholder="Artikel suchen…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-ink/50 border-gold/50 text-parchment-light placeholder:text-muted-foreground"
            />
          </div>

          {/* Article List */}
          <div className="flex-1 overflow-y-auto">
            {articlesLoading ? (
              <div className="p-4 flex justify-center">
                <Spinner />
              </div>
            ) : (
              <div>
                {filteredArticles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => {
                      setSelectedArticleId(article.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-ink/50 transition-colors ${
                      selectedArticle?.id === article.id
                        ? "bg-ink/80 border-l-4 border-gold text-gold-light"
                        : "text-parchment-light hover:bg-ink/50"
                    }`}
                  >
                    <div className="text-xs font-mono text-gold mb-1">{article.number}</div>
                    <div className="text-sm line-clamp-2">{article.title}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Article Panel */}
          <div className="bg-parchment-light border-b-2 border-border flex-shrink-0 overflow-y-auto max-h-64 p-6">
            {selectedArticle ? (
              <div>
                <p className="text-xs text-muted-foreground tracking-widest font-mono mb-2 uppercase">
                  Grundgesetz für die Bundesrepublik Deutschland · 1949
                </p>
                <h2
                  className="text-2xl font-bold text-ink mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {selectedArticle.number} — {selectedArticle.title}
                </h2>
                <span className="inline-block bg-red-state text-parchment-light text-xs px-3 py-1 font-mono tracking-widest mb-4">
                  {selectedArticle.category}
                </span>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.body}
                </p>
                <Button
                  onClick={() => {
                    if (!currentConversationId) {
                      // Create new conversation
                      const title = `Frage zu ${selectedArticle.number}`;
                      setCurrentConversationId(-1); // Temporary ID, will be replaced
                    }
                  }}
                  className="mt-4 bg-ink text-gold border border-gold hover:bg-ink/80"
                  variant="outline"
                >
                  Diese Artikel befragen →
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">Wählen Sie einen Artikel aus</div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {currentConversationId && selectedArticle ? (
              <ChatInterface
                conversationId={currentConversationId}
                articleId={selectedArticle.id}
                articleNumber={selectedArticle.number}
                suggestedQuestions={suggestedQuestions}
                onConversationCreated={setCurrentConversationId}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-parchment p-6">
                <p className="text-lg text-muted-foreground mb-4">
                  Wählen Sie einen Artikel und klicken Sie "Diese Artikel befragen" um zu beginnen
                </p>
                <Button
                  onClick={() => {
                    if (selectedArticle) {
                      setCurrentConversationId(-1);
                    }
                  }}
                  className="bg-gold text-ink hover:bg-gold-dark"
                >
                  Gespräch starten
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

interface ChatInterfaceProps {
  conversationId: number | null;
  articleId: number;
  articleNumber: string;
  suggestedQuestions: string[];
  onConversationCreated: (id: number) => void;
}

function ChatInterface({
  conversationId: initialConvId,
  articleId,
  articleNumber,
  suggestedQuestions,
  onConversationCreated,
}: ChatInterfaceProps) {
  const [conversationId, setConversationId] = useState<number | null>(initialConvId);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>>([
    {
      role: "assistant",
      content: `Willkommen bei GrundgesetzGPT. Ich bin Ihr KI-Assistent für das Grundgesetz der Bundesrepublik Deutschland.\n\nWir diskutieren gerade ${articleNumber}. Stellen Sie mir Ihre Fragen!`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const createConvMutation = trpc.conversations.create.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message to UI
    setMessages(prev => [...prev, { role: "user", content: message }]);
    setIsLoading(true);

    try {
      let convId = conversationId;

      // Create conversation if needed
      if (!conversationId || conversationId === -1) {
        const conv = await createConvMutation.mutateAsync({
          title: `Frage zu ${articleNumber}`,
          articleId,
        });
        convId = conv.id;
        setConversationId(conv.id);
        onConversationCreated(conv.id);
      } else {
        convId = conversationId;
      }

      // Send message
      if (!convId) throw new Error("Conversation ID not set");
      const response = await sendMessageMutation.mutateAsync({
        conversationId: convId,
        message,
        articleId,
      });

      // Add AI response
      setMessages(prev => [...prev, { role: "assistant", content: response.response }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-parchment">
      {/* Suggested questions */}
      <div className="px-6 py-3 border-b border-border flex flex-wrap gap-2">
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="text-xs px-3 py-1 border border-border rounded hover:bg-parchment-light text-muted-foreground hover:text-foreground transition-colors italic"
          >
            {q}
          </button>
        ))}
      </div>
      <AIChatBox
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder="Stellen Sie eine Frage zum Grundgesetz…"
        height="100%"
      />
    </div>
  );
}
