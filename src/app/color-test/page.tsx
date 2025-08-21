export default function SimpleColorTest() {
  return (
    <div className="p-8 space-y-4 min-h-screen bg-background text-foreground">
      <h1 className="text-3xl font-bold">Simple Color Test</h1>
      
      {/* Test basic semantic colors */}
      <div className="space-y-4">
        <div className="p-4 bg-primary text-primary-foreground rounded">
          Primary Background - Electric Royal Blue (#0066FF)
        </div>
        
        <div className="p-4 bg-accent text-accent-foreground rounded">
          Accent Background - Vibrant Sunset Orange (#FF6B35)
        </div>
        
        <div className="p-4 bg-success text-success-foreground rounded">
          Success Background - Electric Spring Green (#00FF7F)
        </div>
        
        <div className="p-4 bg-card text-card-foreground border border-border rounded">
          Card Background with Border
        </div>
        
        <div className="p-4 bg-muted text-muted-foreground rounded">
          Muted Background
        </div>
        
        <div className="p-4 bg-destructive text-destructive-foreground rounded">
          Destructive Background - For errors/warnings
        </div>
      </div>

      {/* Test custom Tailwind colors */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Custom Tailwind Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <div className="w-24 h-24 bg-primary rounded flex items-center justify-center text-primary-foreground text-xs">
            primary
          </div>
          <div className="w-24 h-24 bg-primary-light rounded flex items-center justify-center text-white text-xs">
            primary-light
          </div>
          <div className="w-24 h-24 bg-primary-dark rounded flex items-center justify-center text-white text-xs">
            primary-dark
          </div>
          <div className="w-24 h-24 bg-accent rounded flex items-center justify-center text-accent-foreground text-xs">
            accent
          </div>
          <div className="w-24 h-24 bg-accent-light rounded flex items-center justify-center text-black text-xs">
            accent-light
          </div>
          <div className="w-24 h-24 bg-accent-dark rounded flex items-center justify-center text-white text-xs">
            accent-dark
          </div>
          <div className="w-24 h-24 bg-success rounded flex items-center justify-center text-success-foreground text-xs">
            success
          </div>
          <div className="w-24 h-24 bg-success-light rounded flex items-center justify-center text-black text-xs">
            success-light
          </div>
          <div className="w-24 h-24 bg-success-dark rounded flex items-center justify-center text-white text-xs">
            success-dark
          </div>
          <div className="w-24 h-24 bg-neutral-cream rounded flex items-center justify-center text-black text-xs border">
            neutral-cream
          </div>
          <div className="w-24 h-24 bg-neutral-warm rounded flex items-center justify-center text-black text-xs border">
            neutral-warm
          </div>
        </div>
      </div>

      {/* Test buttons */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Interactive Elements</h2>
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
            Primary Button
          </button>
          <button className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90">
            Accent Button
          </button>
          <button className="px-4 py-2 bg-success text-success-foreground rounded hover:bg-success/90">
            Success Button
          </button>
          <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90">
            Destructive Button
          </button>
        </div>
      </div>

      {/* Test text colors */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Text Colors</h2>
        <div className="space-y-1">
          <p className="text-primary">Primary text color</p>
          <p className="text-accent">Accent text color</p>
          <p className="text-success">Success text color</p>
          <p className="text-destructive">Destructive text color</p>
          <p className="text-muted-foreground">Muted foreground text</p>
        </div>
      </div>
    </div>
  );
}
