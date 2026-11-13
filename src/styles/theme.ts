export const THEME_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

  :root {
    --background: #1A1A1A;
    --foreground: #FFFFFF;
    --primary: #FF4D12;
    --secondary: #FFA489;
    --muted: #A0A0A0;
    --border: #222222;
    --chart-revenue: #FF4D12;
    --chart-expenses: #FFA489;
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .font-display {
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: -0.025em;
  }

  .font-mono-tech {
    font-family: 'JetBrains Mono', monospace;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #141414;
  }
  ::-webkit-scrollbar-thumb {
    background: #2C2C2C;
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #FF4D12;
  }
`;

