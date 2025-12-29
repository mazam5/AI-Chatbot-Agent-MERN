import ChatContainer from './components/ChatContainer'
import Layout from './components/Layout'
import { ThemeProvider } from './components/providers/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout>
        <ChatContainer />
      </Layout>
    </ThemeProvider>
  )
}

export default App
