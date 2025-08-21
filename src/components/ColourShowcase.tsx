"use client";

import React from 'react';

export default function ColourShowcase() {
  const colorSwatches = [
    {
      name: 'Primary',
      description: 'Electric Royal Blue - Navigation & Headers',
      bgClass: 'bg-primary',
      textClass: 'text-primary-foreground',
      borderClass: 'border-primary',
    },
    {
      name: 'Primary Light',
      description: 'Brilliant Sky Blue - Interactive Elements',
      bgClass: 'bg-primary-light',
      textClass: 'text-white',
      borderClass: 'border-primary-light',
    },
    {
      name: 'Primary Dark',
      description: 'Deep Royal Blue - Depth & Contrast',
      bgClass: 'bg-primary-dark',
      textClass: 'text-white',
      borderClass: 'border-primary-dark',
    },
    {
      name: 'Accent',
      description: 'Vibrant Sunset Orange - CTAs & Highlights',
      bgClass: 'bg-accent',
      textClass: 'text-accent-foreground',
      borderClass: 'border-accent',
    },
    {
      name: 'Accent Light',
      description: 'Pure Gold - Luxury Touches',
      bgClass: 'bg-accent-light',
      textClass: 'text-black',
      borderClass: 'border-accent-light',
    },
    {
      name: 'Accent Dark',
      description: 'Deep Orange - Strong Contrast',
      bgClass: 'bg-accent-dark',
      textClass: 'text-white',
      borderClass: 'border-accent-dark',
    },
    {
      name: 'Success',
      description: 'Electric Spring Green - Success States',
      bgClass: 'bg-success',
      textClass: 'text-black',
      borderClass: 'border-success',
    },
    {
      name: 'Success Light',
      description: 'Light Spring Green - Soft Success',
      bgClass: 'bg-success-light',
      textClass: 'text-black',
      borderClass: 'border-success-light',
    },
    {
      name: 'Success Dark',
      description: 'Deep Green - Strong Success',
      bgClass: 'bg-success-dark',
      textClass: 'text-white',
      borderClass: 'border-success-dark',
    },
    {
      name: 'Card',
      description: 'Clean Card Background',
      bgClass: 'bg-card',
      textClass: 'text-card-foreground',
      borderClass: 'border-border',
    },
    {
      name: 'Muted',
      description: 'Neutral Muted Background',
      bgClass: 'bg-muted',
      textClass: 'text-muted-foreground',
      borderClass: 'border-border',
    },
    {
      name: 'Neutral Cream',
      description: 'Lemon Chiffon - Breathing Room',
      bgClass: 'bg-neutral-cream',
      textClass: 'text-foreground',
      borderClass: 'border-border',
    },
    {
      name: 'Neutral Warm',
      description: 'Warm Cream - Cozy Backgrounds',
      bgClass: 'bg-neutral-warm',
      textClass: 'text-foreground',
      borderClass: 'border-border',
    },
  ];

  return (
    <div className="bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            NYC Tourist Info Colour Palette
          </h1>
          <p className="text-muted-foreground text-lg">
            Inspired by vibrant city energy and cozy comfort
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {colorSwatches.map((swatch) => (
            <div key={swatch.name} className="bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className={`${swatch.bgClass} ${swatch.textClass} h-24 flex items-center justify-center`}>
                <div className="text-center">
                  <div className="font-bold text-lg">{swatch.name}</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-card-foreground mb-2">{swatch.name}</h3>
                <p className="text-sm text-muted-foreground">{swatch.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sample Component Showcase */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">Component Examples</h2>
            
            <div className="space-y-4">
              {/* Buttons */}
              <div>
                <h3 className="font-semibold mb-2 text-card-foreground">Buttons</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Primary
                  </button>
                  <button className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors">
                    Accent
                  </button>
                  <button className="px-4 py-2 bg-success text-black rounded-lg hover:bg-success/90 transition-colors">
                    Success
                  </button>
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                    Secondary
                  </button>
                </div>
              </div>

              {/* Alerts */}
              <div>
                <h3 className="font-semibold mb-2 text-card-foreground">Alerts</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-success">
                    <strong>Success:</strong> Your trip has been saved successfully!
                  </div>
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                    <strong>Warning:</strong> Please check your network connection.
                  </div>
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary">
                    <strong>Info:</strong> Don&apos;t forget to apply for ESTA before travelling.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dark Mode Preview */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">Theme Features</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-card-foreground">Brand Colours</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Electric Royal Blue (#0066FF) - Primary navigation</li>
                  <li>• Brilliant Sky Blue (#00BFFF) - Interactive elements</li>
                  <li>• Vibrant Sunset Orange (#FF6B35) - Call-to-actions</li>
                  <li>• Pure Gold (#FFD700) - Premium highlights</li>
                  <li>• Electric Spring Green (#00FF7F) - Success states</li>
                  <li>• Lemon Chiffon (#FFFACD) - Breathing room</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-card-foreground">Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• OKLCH colour space for consistent perceptual brightness</li>
                  <li>• Automatic dark mode support</li>
                  <li>• Accessible contrast ratios</li>
                  <li>• Semantic colour naming</li>
                  <li>• Centralised theme management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
