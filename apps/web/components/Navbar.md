# Navbar

## Props
- onNavigate: (page: 'home' | 'dashboard' | 'intelligence' | 'rails' | 'rwa') => void
- currentPage: 'home' | 'dashboard' | 'intelligence' | 'rails' | 'rwa'
- loading: boolean
- error: string | null
- docsHref: string

## Usage

```tsx
import Navbar from './Navbar'

export default function AppShell() {
  const [page, setPage] = useState<'home' | 'dashboard' | 'intelligence' | 'rails' | 'rwa'>('home')
  return (
    <>
      <Navbar
        currentPage={page}
        onNavigate={setPage}
        docsHref="https://docs.example.com"
      />
      <main id="main">
        {/* content */}
      </main>
    </>
  )
}
```
