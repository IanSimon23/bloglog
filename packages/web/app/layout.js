import './globals.css';

export const metadata = {
  title: 'BlogLog',
  description: 'Capture your development timeline and generate blog posts'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <a href="/" className="logo">BlogLog</a>
          <div className="nav-links">
            <a href="/init">Init</a>
            <a href="/capture">Capture</a>
            <a href="/timeline">Timeline</a>
            <a href="/generate">Generate</a>
            <a href="/scratchpad">Scratchpad</a>
          </div>
        </nav>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
