# AI Customer Support Chat

A full-stack application featuring an AI-powered customer support chat interface for an e-commerce store. The system uses Google's Gemini AI to provide intelligent responses based on a predefined knowledge base of store policies.

## Quick Start

### Prerequisites

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org) and npm
- [PostgreSQL](https://www.postgresql.org)
- [Google Gemini API key](https://console.cloud.google.com/apis/credentials)

### 1. Clone the Repository

```bash
# Clone repository
git clone https://github.com/mazam5/AI-Chatbot-Agent-MERN
cd AI-Chatbot-Agent-MERN
```

### 2. Environment Configuration

Create `.env` files in the `backend/` and `frontend/` directories.

```bash
# Backend (.env file in backend/)
PORT=3001
DATABASE_URL=postgresql://db_username:db_password@localhost:5432/db_name?schema=public
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key_here
CORS_ORIGIN=http://localhost:5173

# Frontend (.env file in frontend/)
VITE_API_URL=http://localhost:3001
```

### 3. Database Setup

```bash
# Run migrations from backend directory
cd backend
# make sure you have postgresql installed and username and password are correct
npx prisma migrate dev
```

### 4. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend-react
npm install
```

### 5. Start the Application

```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd ../frontend-react
npm start
```

The application will be available at:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3001](http://localhost:3001)
- API Documentation: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

## Architecture Overview

### Backend Structure (Node.js/Express)

The backend follows a layered architecture:

```doc
backend/
├── prisma/          # Prisma database client
├── src/
    ├── config/          # Environment configuration
    ├── controllers/     # Request handlers (ChatController)
    ├── services/        # Business logic (ChatService, LLMService)
    ├── routes/          # Express route definitions
    ├── utils/           # Types and utilities
    └── app.ts           # Express app setup
    └── server.ts        # Server entry point
    └── swagger.ts       # Swagger documentation
```

**Key Design Decisions:**

- **Service Layer Separation**: Business logic is isolated from controllers
- **Conversation Management**: Each chat session is tracked with a unique ID
- **Input Sanitization**: Automatic truncation of long strings (10k chars)
- **Graceful Error Handling**: Timeout protection and comprehensive error responses
- **Swagger Documentation**: Auto-generated API docs

### Frontend Structure (React)

```doc
frontend-react/
├── src/
│   ├── components/ # React components (ChatInterface, MessageList, etc.)
│   ├── services/   # API service calls
│   └── types/      # Type definitions
├── public/
│   └── fonts/      # Font files
```

## LLM Implementation

### Provider & Model

- **Provider**: Google Generative AI (Gemini)
- **Model**: `gemini-2.0-flash-exp`
- **API**: Official `@google/genai` SDK

### Prompt Engineering

The system prompt includes:

1. **Role Definition**: Customer support agent for "Azamon" e-commerce
2. **Tone Guidelines**: Friendly, professional, concise (2-3 sentences)
3. **Knowledge Base**: Embedded FAQ covering:
   - Shipping policies and rates
   - Return & refund procedures
   - Support hours and contact methods
   - Payment options and warranty information

**Context Management**:

- Maintains conversation history (last 10 messages)
- Includes system prompt with each request
- Formats conversation as "Customer:" / "Support Agent:" dialogue

## Trade-offs & Future Improvements

### Current Trade-offs

1. **Database Simplicity**: Using basic PostgreSQL tables without advanced indexing or connection pooling optimization
2. **Memory Management**: In-memory conversation history limited to 10 messages for context
3. **Error Handling**: Basic retry logic; no circuit breaker pattern implemented
4. **Security**: No rate limiting or advanced input validation beyond basic sanitization

### If I Had More Time...

**Immediate Improvements:**

- [ ] **Rate Limiting**: Implement API rate limiting per user/IP
- [ ] **Caching**: Add Redis for session caching and response caching
- [ ] **Monitoring**: Integrate OpenTelemetry for distributed tracing
- [ ] **Testing**: Add comprehensive unit/integration tests with >90% coverage

**Enhanced Features:**

- [ ] **Multi-provider Fallback**: Support OpenAI/Anthropic as fallback if Gemini fails
- [ ] **Streaming Responses**: Implement server-sent events for real-time token streaming
- [ ] **Advanced Analytics**: Track conversation metrics, common questions, response times
- [ ] **Sentiment Analysis**: Detect customer frustration and escalate to human agents
- [ ] **Knowledge Base Updates**: Admin interface to update FAQ without redeployment

**Scalability:**

- [ ] **Database Optimization**: Add connection pooling, read replicas, and proper indexing
- [ ] **Microservices**: Split chat, user management, and analytics into separate services
- [ ] **Queue System**: Implement message queue for handling high-volume chat requests
- [ ] **Containerization**: Dockerize with Docker Compose for easy deployment

**User Experience:**

- [ ] **File Uploads**: Allow customers to upload images/receipts
- [ ] **Suggested Responses**: AI-generated quick reply options
- [ ] **Typing Indicators**: Visual feedback during AI response generation
- [ ] **Dark Mode**: Theme customization options

## Database Schema

```sql
conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW()
)

messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  sender VARCHAR(10) CHECK (sender IN ('user', 'ai')),
  text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

## API Endpoints

- `POST /api/chat/message` - Send a message and get AI response
- `GET /api/chat/history/:sessionId` - Retrieve conversation history
- `GET /api/chat/sessions` - List all chat sessions
- `DELETE /api/chat/session/:sessionId` - Delete a session

## Development Scripts

```doc
# Backend
npm run dev          # Development with hot reload
npm start           # Production start
npm run format      # Run prettier formatter

# Frontend
npm start           # Start development server
npm build           # Production build
npm run format      # Run prettier formatter
```
