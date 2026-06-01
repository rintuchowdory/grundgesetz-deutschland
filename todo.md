# GrundgesetzGPT v2 — Project TODO

## Database & Schema
- [x] Create articles table with number, title, category, body
- [x] Create conversations table for per-user chat history
- [x] Create messages table for conversation messages
- [x] Seed articles table with complete Grundgesetz data (18 articles)

## Server-Side Implementation
- [x] Add database query helpers in `server/db.ts` for articles, conversations, messages
- [x] Create tRPC procedure `articles.list` to fetch all articles with optional category filter
- [x] Create tRPC procedure `articles.getById` to fetch single article by ID
- [x] Create tRPC procedure `chat.sendMessage` (protected) to handle AI chat with server-side LLM call
- [x] Create tRPC procedure `conversations.list` (protected) to fetch user's conversation history
- [x] Create tRPC procedure `conversations.create` (protected) to start new conversation
- [x] Create tRPC procedure `conversations.getMessages` (protected) to fetch messages for a conversation
- [x] Implement system prompt that includes current article context for AI responses
- [x] Add error handling and validation for all procedures

## Frontend UI — Design System & Layout
- [x] Define parchment-and-gold color palette in `client/src/index.css`
- [x] Set up custom fonts (Playfair Display, Source Serif 4, JetBrains Mono)
- [x] Create main layout structure: header, sidebar, article panel, chat area
- [x] Implement responsive sidebar collapse on mobile (<640px)
- [x] Create custom layout for editorial design

## Frontend UI — Article Browser
- [x] Build article sidebar component with live search
- [x] Implement category filtering in sidebar
- [x] Create article list rendering with active state highlighting
- [x] Add article detail panel showing full text and metadata
- [x] Implement "Ask about this article" button in detail panel
- [x] Style all components to match parchment-and-gold aesthetic

## Frontend UI — Chat Interface
- [x] Integrate AIChatBox component from template
- [x] Connect AIChatBox to `chat.sendMessage` tRPC procedure
- [x] Implement dynamic suggested questions that update per article
- [x] Add markdown rendering for AI responses (via Streamdown in AIChatBox)
- [x] Implement typing indicator while awaiting response (via AIChatBox)
- [x] Add error states and retry logic

## Frontend UI — User Experience
- [x] Implement authentication check and redirect to login if needed
- [x] Add user profile/logout in header
- [ ] Display conversation history in sidebar or separate panel
- [ ] Allow switching between conversations
- [x] Add loading states and empty states throughout

## Testing & Refinement
- [x] Unit tests for articles, conversations, and auth procedures (10 tests passing)
- [ ] Integration test for AI chat with article context
- [ ] Test conversation history persistence and retrieval
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Test authentication flow and session persistence
- [x] Verify API key is never exposed client-side (server-side LLM only)
- [ ] Performance testing with full article database

## Deployment & Delivery
- [ ] Final visual polish and design refinement
- [ ] Create checkpoint before publishing
- [ ] Deploy to Manus platform
