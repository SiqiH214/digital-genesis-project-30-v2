# Design System - Second Life Onboarding

## Overview
Terminal-inspired design system with black background and neon green/cyan accents, mimicking a consciousness upload interface.

## Colors

### Primary Colors
- **Primary (Terminal Green)**: `hsl(150 100% 45%)` - Main actions, buttons, highlights
- **Secondary (Purple/Lavender)**: `hsl(270 65% 75%)` - Secondary UI elements, accents
- **Accent (Cyan)**: `hsl(180 100% 50%)` - Terminal accent, highlights

### Background & Surfaces
- **Background**: `hsl(0 0% 0%)` - Pure black for terminal feel
- **Card/Surface**: `hsl(0 0% 8%)` - Slightly elevated dark surface
- **Foreground**: `hsl(0 0% 100%)` - White text

### Utility Colors
- **Muted**: `hsl(0 0% 20%)` - Muted backgrounds
- **Muted Foreground**: `hsl(0 0% 60%)` - Secondary text
- **Border**: `hsl(0 0% 20%)` - Borders and dividers
- **Destructive**: `hsl(0 85% 60%)` - Error states, warnings
- **Warning**: `hsl(35 95% 65%)` - Warning messages
- **Success**: `hsl(150 60% 60%)` - Success states

## Typography

### Fonts
- **Primary**: JetBrains Mono
- **Secondary**: Space Mono
- **Fallback**: Courier New, monospace

### Usage
```tsx
// Body text
className="font-mono"

// Terminal-style text
className="font-terminal"
```

## Components

### Buttons

#### Primary Button (Big Actions)
```tsx
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
  Start Experience
</Button>
```

#### Secondary Button
```tsx
<Button variant="secondary" className="bg-secondary hover:bg-secondary/90">
  Continue
</Button>
```

### Text Styles

#### Loading/Terminal Text
```tsx
<p className="text-muted-foreground font-mono text-sm">
  Loading consciousness upload system...
</p>
```

#### Terminal Command
```tsx
<div className="text-terminal-green text-glow">
  > initialize
</div>
```

#### Warning Text
```tsx
<p className="text-warning">
  ⚠ YOU MUST DO THIS NOW
</p>
```

## Effects

### Glows
```tsx
// Green glow
className="border-glow"

// Intense green glow
className="border-glow-intense"

// Purple shadow
style={{ boxShadow: 'var(--shadow-purple)' }}
```

### Text Glows
```tsx
// Green text glow
className="text-glow"

// Purple text glow
className="text-glow-purple"

// Cyan text glow
className="text-glow-cyan"
```

### Animations
```tsx
// Fade in
className="animate-fade-in"

// Pulse glow
className="pulse-glow"

// Glitch effect
className="glitch"
```

## Layouts

### Phone Frame
- Max width: 393px
- Height: 700px (or 85vh max)
- Border: Terminal green with glow
- Border radius: 3rem

### Terminal Screen
- Background: Pure black
- Scanlines overlay for retro effect
- Monospace font throughout

## Best Practices

1. **Always use semantic tokens** - Never hardcode colors like `text-white` or `bg-black`
2. **Use design tokens** - Reference `--terminal-green`, `--terminal-cyan`, etc.
3. **Maintain terminal aesthetic** - Use monospace fonts, green/cyan colors
4. **Add subtle glows** - Use glow effects sparingly for emphasis
5. **Keep it minimal** - Terminal-inspired means clean and focused
