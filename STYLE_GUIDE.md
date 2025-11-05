# Tuto App - Style Guide

## Color Palette

### Primary Colors
- **Primary Blue**: `#1E88E5` - `hsl(207, 79%, 51%)`
- **Primary Dark**: `#0D47A1` - `hsl(215, 87%, 33%)`
- **Primary Gradient**: `linear-gradient(135deg, #1E88E5 0%, #0D47A1 100%)`

### Dark Mode (Default)
- **Background**: `#0F1113` - `hsl(216, 28%, 7%)`
- **Card Surface**: `#121416` - `hsl(217, 33%, 9%)`
- **Elevated Card**: `#1A1C1E` - `hsl(217, 33%, 11%)`
- **Border**: `#2A2C2E` - `hsl(215, 20%, 17%)`
- **Text Primary**: `#FFFFFF` - `hsl(0, 0%, 98%)`
- **Text Secondary**: `#A0A0A0` - `hsl(215, 20.2%, 65.1%)`

### Light Mode
- **Background**: `#FFFFFF` - `hsl(0, 0%, 100%)`
- **Card Surface**: `#FFFFFF` - `hsl(0, 0%, 100%)`
- **Border**: `#E0E4E8` - `hsl(214.3, 31.8%, 91.4%)`
- **Text Primary**: `#1A1C1E` - `hsl(222.2, 84%, 4.9%)`
- **Text Secondary**: `#6B7280` - `hsl(215.4, 16.3%, 46.9%)`

### Accent Colors
- **Success**: `#10B981` - `hsl(142, 71%, 45%)` - Green
- **Warning**: `#F59E0B` - `hsl(38, 92%, 50%)` - Amber
- **Error**: `#EF4444` - `hsl(0, 84.2%, 60.2%)` - Red
- **Info**: `#3B82F6` - `hsl(217.2, 91.2%, 59.8%)` - Blue

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Type Scale
- **Heading 1**: 2rem (32px) / Bold
- **Heading 2**: 1.5rem (24px) / Semibold
- **Heading 3**: 1.25rem (20px) / Semibold
- **Body Large**: 1rem (16px) / Regular
- **Body**: 0.875rem (14px) / Regular
- **Caption**: 0.75rem (12px) / Medium
- **Small**: 0.625rem (10px) / Regular

## Spacing Tokens

### Base Unit: 4px

- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 12px (0.75rem)
- **lg**: 16px (1rem)
- **xl**: 24px (1.5rem)
- **2xl**: 32px (2rem)
- **3xl**: 48px (3rem)
- **4xl**: 64px (4rem)

## Component Specifications

### Buttons

#### Primary Button
```css
background: linear-gradient(135deg, #1E88E5 0%, #0D47A1 100%);
color: #FFFFFF;
border-radius: 12px;
padding: 12px 24px;
font-size: 16px;
font-weight: 600;
box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
transition: all 200ms ease;

hover {
  box-shadow: 0 8px 16px rgba(30, 136, 229, 0.4);
  transform: translateY(-2px);
}
```

#### Secondary Button (Outline)
```css
background: transparent;
border: 2px solid #1E88E5;
color: #1E88E5;
border-radius: 12px;
padding: 12px 24px;
font-size: 16px;
font-weight: 600;
```

#### Ghost Button
```css
background: transparent;
color: #1E88E5;
padding: 12px 24px;
font-size: 16px;
```

### Cards
```css
background: #121416; /* Dark mode */
border-radius: 16px;
box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
padding: 16px;
border: 1px solid #2A2C2E;
transition: all 300ms ease;

hover {
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  transform: translateY(-4px);
}
```

### Avatar with Story Ring
```css
size: 48px;
border: 3px solid;
border-color: linear-gradient(135deg, #1E88E5, #0D47A1);
border-radius: 50%;
```

### Bottom Navigation
```css
height: 64px;
background: #121416;
border-top: 1px solid #2A2C2E;
padding-bottom: env(safe-area-inset-bottom);

/* Active Tab */
active-tab {
  background: linear-gradient(135deg, #1E88E5 0%, #0D47A1 100%);
  border-radius: 24px;
  padding: 8px 16px;
  color: #FFFFFF;
}

/* Inactive Tab */
inactive-tab {
  color: #A0A0A0;
}
```

### Chat Bubbles

#### Outgoing Message
```css
background: linear-gradient(135deg, #1E88E5 0%, #0D47A1 100%);
color: #FFFFFF;
border-radius: 16px;
border-bottom-right-radius: 4px;
padding: 12px 16px;
max-width: 80%;
align-self: flex-end;
margin-bottom: 8px;
```

#### Incoming Message
```css
background: #1C1D1F;
color: #FFFFFF;
border-radius: 16px;
border-bottom-left-radius: 4px;
padding: 12px 16px;
max-width: 80%;
align-self: flex-start;
margin-bottom: 8px;
```

### FAB (Floating Action Button)
```css
size: 56px;
border-radius: 50%;
background: linear-gradient(135deg, #1E88E5 0%, #0D47A1 100%);
box-shadow: 0 8px 24px rgba(30, 136, 229, 0.4);
position: fixed;
bottom: 80px;
right: 16px;
transition: all 300ms ease;

hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(30, 136, 229, 0.5);
}
```

## Animations

### Like Animation (Pop + Burst)
```css
@keyframes like-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

duration: 200ms;
timing-function: ease-out;
```

### Navigation Transition
```css
duration: 300ms;
timing-function: ease-in-out;

enter {
  opacity: 0 → 1;
  transform: translateX(100%) → translateX(0);
}

exit {
  opacity: 1 → 0;
  transform: translateX(0) → translateX(-100%);
}
```

### Shimmer (Skeleton Loader)
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

background: linear-gradient(90deg, #1A1C1E 0%, #2A2C2E 50%, #1A1C1E 100%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
```

### Fade In
```css
@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

duration: 600ms;
timing-function: ease-out;
```

## Border Radius

- **Small**: 8px
- **Medium**: 12px
- **Large**: 16px
- **XL**: 24px
- **Full**: 50% (Circles)

## Shadows

### Small
```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
```

### Medium
```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
```

### Large
```css
box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
```

### Primary (Blue Glow)
```css
box-shadow: 0 8px 24px rgba(30, 136, 229, 0.4);
```

## Accessibility

### Touch Targets
- Minimum size: 48px × 48px
- Spacing between targets: 8px

### Color Contrast
- Text on background: 4.5:1 minimum
- Large text on background: 3:1 minimum
- Primary button text: White on blue gradient (7:1+)

### Focus States
```css
outline: none;
ring: 2px solid #1E88E5;
ring-offset: 2px;
```

## Responsive Breakpoints

- **Mobile**: 0 - 428px (default)
- **Tablet**: 429px - 768px
- **Desktop**: 769px+

## Icon Sizes

- **Small**: 16px
- **Medium**: 20px
- **Large**: 24px
- **XL**: 32px

## Usage Guidelines

1. **Always use semantic tokens** from `index.css` and `tailwind.config.ts`
2. **Never use hard-coded colors** - use HSL variables
3. **Apply glassmorphic effects** with `.glass` utility class
4. **Use gradient backgrounds** with `.gradient-primary` class
5. **Ensure dark mode compatibility** for all components
6. **Apply smooth transitions** (200-300ms) to all interactive elements
7. **Use skeleton loaders** with `.skeleton-shimmer` for loading states
8. **Maintain 48px touch targets** for all tappable elements
9. **Add safe-area padding** with `.mobile-safe-area` for bottom elements
10. **Test on both light and dark modes** before deployment
