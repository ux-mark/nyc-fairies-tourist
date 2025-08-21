"use client";

export default function ColourTest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Colour Test Page</h1>
      
      {/* Test Primary colours */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Primary Colours</h2>
        <div className="flex gap-2">
          <div className="w-20 h-20 bg-primary flex items-center justify-center text-primary-foreground text-xs">
            primary
          </div>
          <div className="w-20 h-20 bg-primary-light flex items-center justify-center text-white text-xs">
            primary-light
          </div>
          <div className="w-20 h-20 bg-primary-dark flex items-center justify-center text-white text-xs">
            primary-dark
          </div>
        </div>
      </div>

      {/* Test Accent colours */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Accent Colours</h2>
        <div className="flex gap-2">
          <div className="w-20 h-20 bg-accent flex items-center justify-center text-accent-foreground text-xs">
            accent
          </div>
          <div className="w-20 h-20 bg-accent-light flex items-center justify-center text-black text-xs">
            accent-light
          </div>
          <div className="w-20 h-20 bg-accent-dark flex items-center justify-center text-white text-xs">
            accent-dark
          </div>
        </div>
      </div>

      {/* Test Success colours */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Success Colours</h2>
        <div className="flex gap-2">
          <div className="w-20 h-20 bg-success flex items-center justify-center text-black text-xs">
            success
          </div>
          <div className="w-20 h-20 bg-success-light flex items-center justify-center text-black text-xs">
            success-light
          </div>
          <div className="w-20 h-20 bg-success-dark flex items-center justify-center text-white text-xs">
            success-dark
          </div>
        </div>
      </div>

      {/* Test Neutral colours */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Neutral Colours</h2>
        <div className="flex gap-2">
          <div className="w-20 h-20 bg-neutral-cream flex items-center justify-center text-black text-xs border">
            neutral-cream
          </div>
          <div className="w-20 h-20 bg-neutral-warm flex items-center justify-center text-black text-xs border">
            neutral-warm
          </div>
        </div>
      </div>

      {/* Test Semantic colours */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Semantic Colours</h2>
        <div className="flex gap-2">
          <div className="w-20 h-20 bg-card border border-border flex items-center justify-center text-card-foreground text-xs">
            card
          </div>
          <div className="w-20 h-20 bg-muted flex items-center justify-center text-muted-foreground text-xs">
            muted
          </div>
          <div className="w-20 h-20 bg-destructive flex items-center justify-center text-destructive-foreground text-xs">
            destructive
          </div>
        </div>
      </div>
    </div>
  );
}
