# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **EVA A2A Chat Client**, a React Router v7 application that provides a chat interface for Agent-to-Agent (A2A) communication using the `@a2a-js/sdk`. The app demonstrates A2A protocol integration with features like task management, artifact handling, and real-time streaming.

## Development Commands

### Core Commands
- `npm run dev` - Start development server at http://localhost:5173
- `npm run build` - Create production build
- `npm run deploy` - Build and deploy to Cloudflare Workers
- `npm run typecheck` - Run TypeScript type checking and generate types
- `npm run preview` - Preview production build locally

### Type Generation
- `npm run cf-typegen` - Generate Cloudflare Workers types (runs automatically after install)

## Architecture

### Frontend Architecture
- **Framework**: React Router v7 with SSR enabled
- **State Management**: Client-side database using Dexie (IndexedDB wrapper)
- **Styling**: TailwindCSS v4 with Radix UI components
- **A2A Integration**: `@a2a-js/sdk/client` for A2A protocol communication

### Key Directories
- `app/` - Main application code
  - `components/` - React components including chat UI, settings, and dialogs
  - `lib/` - Business logic and utilities
  - `db/` - Dexie database schema and management
  - `hooks/` - Custom React hooks
  - `routes/` - React Router route definitions
- `workers/` - Cloudflare Workers deployment code
- `public/` - Static assets

### Database Schema (Dexie/IndexedDB)
```typescript
// ChatRecord
{
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  contextId: string; // A2A context ID
}

// MessageRecord  
{
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  taskId?: string; // A2A task ID for assistant messages
  taskStatus?: "submitted" | "working" | "completed" | "failed" | "canceled";
}
```

## A2A Integration Details

### Client Configuration
The A2A client is configured in `app/lib/get-a2a-client.ts`:
- **Default Agent Card URL**: `http://localhost:9999/.well-known/agent-card.json`
- **Authentication**: Custom `eva` token-based auth scheme
- **Configurable**: URL and auth token can be modified at runtime

### Key A2A Components
- **Chat Management**: `app/lib/chat-manager.ts` - CRUD operations for chats
- **Message Handling**: `app/lib/message-handler.ts` - Message creation and management
- **Streaming**: `app/lib/a2a-stream-handler.ts` - Real-time message streaming from A2A agents
- **Chat Loading**: `app/lib/chat-loader.ts` - Data loading for chat routes

### A2A Protocol Features
- **Task Support**: Messages can be associated with A2A tasks with status tracking
- **Artifacts**: Support for task artifacts and file attachments
- **Streaming**: Real-time message streaming from agents
- **Context Management**: Each chat has an A2A context ID for continuity

## Development Notes

### Configuration Files
- `react-router.config.ts` - React Router configuration (SSR enabled)
- `wrangler.jsonc` - Cloudflare Workers configuration
- `vite.config.ts` - Vite build configuration
- `components.json` - Shadcn UI components configuration

### Path Aliases
- `~/*` maps to `./app/*` (configured in tsconfig.json)

### Deployment
The app is configured for Cloudflare Workers deployment via React Router's built-in adapter. The `npm run deploy` command builds and deploys to Cloudflare.

## Important Implementation Details

### Message Flow
1. User sends message via `clientAction` in `app/routes/home.tsx`
2. User message created via `createUserMessage()`
3. Assistant placeholder created via `createAssistantPlaceholder()`  
4. A2A streaming initiated via `streamMessage()`
5. Real-time updates populate assistant message content and task status

### Authentication
The app uses a custom authentication scheme where auth tokens are prefixed with `eva ` in the Authorization header when communicating with A2A agents.

### Local Development Setup
For full functionality, you need:
1. An A2A agent server running at `http://localhost:9999` (or configure different URL)
2. The agent server should implement the A2A protocol with task and artifact support