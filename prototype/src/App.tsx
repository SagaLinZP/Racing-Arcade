import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from '@/app/AppProvider'
import { AppRouter } from '@/app/AppRouter'
import './i18n'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/Racing-Arcade">
        <AppRouter />
      </BrowserRouter>
    </AppProvider>
  )
}
