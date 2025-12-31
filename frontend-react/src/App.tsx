import { useState } from 'react';
import ChatContainer from './components/ChatContainer';
import Layout from './components/Layout';
import { ThemeProvider } from './components/providers/theme-provider';

function App() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSessionUpdate = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        refreshTrigger={refreshTrigger}
      >
        <ChatContainer
          currentSessionId={currentSessionId}
          onSessionUpdate={handleSessionUpdate}
          onNewChat={handleNewChat}
        />
      </Layout>
    </ThemeProvider>
  );
}

export default App;