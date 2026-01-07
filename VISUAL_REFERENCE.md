# Visual Reference - Website Improvements

## 1. Dark Mode Toggle Button

### Location in Navbar
```
[Logo] [Nav Links...] [Dark Mode] [Get Demo Button]
                           ↓
                      [Moon Icon]
```

### Button States

#### Light Mode
```
┌─────────────┐
│  🌙 Moon    │  ← Click to activate dark mode
└─────────────┘
Background: rgba(255,255,255,0.1)
Border: 1px rgba(0,0,0,0.1)
Color: #374151
```

#### Dark Mode (After Click)
```
┌─────────────┐
│  ☀️  Sun     │  ← Click to return to light mode
└─────────────┘
Background: rgba(255,255,255,0.1)
Border: 1px rgba(255,255,255,0.2)
Color: #fbbf24
```

### Hover Effect
- Scale up to 1.05
- Background brightens
- Color changes to primary blue (light) or amber (dark)

---

## 2. Testimonials Navigation Buttons

### Layout
```
    ← [Prev]  [Next] →
     ↓                ↓
   50px × 50px    50px × 50px
  circle buttons  circle buttons
```

### Button Design
```
┌─────────────────┐
│    ◄ (or ►)     │
│                 │
│  Gradient Fill  │  ← Linear gradient blue
│  White Border   │  ← 2px white border
│  White Icon     │  ← fa-chevron-left/right
│                 │
│  Shadow         │  ← rgba(5,82,204,0.3)
└─────────────────┘
```

### Hover State
```
┌─────────────────┐
│    ◄ → ◄        │  ← Icon slides left (-4px)
│                 │    repeats every 0.6s
│  Darker Grad    │  ← Gradient darkens
│  White Border   │
│  White Icon     │
│                 │
│  Bigger Shadow  │  ← rgba(5,82,204,0.5)
│                 │  ↑ Lifts up (-4px)
└─────────────────┘
```

### Colors
- **Default:** Linear gradient #0052cc → #5b8dee
- **Hover:** Linear gradient #0041a3 → #0052cc
- **Icon:** White
- **Border:** White (2px)

---

## 3. Team Member Avatars

### Avatar Grid
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│          │  │          │  │          │  │          │
│ [Avatar] │  │ [Avatar] │  │ [Avatar] │  │ [Avatar] │
│          │  │          │  │          │  │          │
├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤
│  Name    │  │  Name    │  │  Name    │  │  Name    │
│  Role    │  │  Role    │  │  Role    │  │  Role    │
│   Bio    │  │   Bio    │  │   Bio    │  │   Bio    │
│          │  │          │  │          │  │          │
│  [Icons] │  │  [Icons] │  │  [Icons] │  │  [Icons] │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Avatar Details
```
        ╔════════════╗
        ║            ║
        ║  [Avatar]  ║  ← 140×140px
        ║            ║     Rounded (12px)
        ║            ║     Border: 3px white
        ║            ║     Shadow: soft drop
        ╚════════════╝

Colors by Person:
├─ Dr. James Mutua → Blue (#0052cc)
├─ Margaret Nakibuule → Cyan (#06b6d4)
├─ David Ouma → Green (#10b981)
└─ Dr. Grace Kamatenesi → Amber (#f59e0b)
```

### Avatar Hover
```
Before:                    After Hover:
┌─────────────┐           ╔═════════════╗
│   Avatar    │           ║   Avatar    ║  ← Scaled 1.08
│             │    ──→    ║             ║
│             │           ║  (Enlarged) ║
└─────────────┘           ╚═════════════╝
White border          Blue border tint
Subtle shadow         Expanded shadow
```

---

## 4. Customer Logos (Improved)

### Logo Grid (Before vs After)
```
BEFORE:                         AFTER:
┌─────┐  ┌─────┐  ┌─────┐     ┌──────────┐  ┌──────────┐  ┌──────────┐
│ 🏥  │  │ 🏥  │  │ 🏥  │     │ MRH      │  │ FPH      │  │ JRH      │
│     │  │     │  │     │     │(gradient)│  │(gradient)│  │(gradient)│
│     │  │     │  │     │  →  │          │  │          │  │          │
└─────┘  └─────┘  └─────┘     └──────────┘  └──────────┘  └──────────┘
Small      Generic    Limited    Large      Color-Coded   Professional
icons      design     appeal     badges     Beautiful     Looking
```

### Logo Specifications
```
Size: 120 × 120px (rounded 12px)

┌──────────────────────┐
│                      │
│   Logo Text (MRH)    │  ← Bold, white
│                      │     Font-size: 20px
│  (Gradient BG)       │     Letter-spacing: 1px
│                      │
└──────────────────────┘

Example Gradients:
├─ Blue:   #0052cc → #5b8dee
├─ Cyan:   #06b6d4 → #22d3ee
├─ Green:  #10b981 → #34d399
├─ Red:    #ef4444 → #f87171
├─ Amber:  #f59e0b → #fbbf24
└─ Teal:   #0891b2 → #06b6d4
```

### Logo Card Hover
```
Default:                     Hover State:
┌────────────────┐           ╔════════════════╗
│  ┌──────────┐  │           ║  ┌──────────┐  ║
│  │ LOGO     │  │           ║  │ LOGO     │  ║
│  │(gradient)│  │    ──→    ║  │(gradient)│  ║
│  └──────────┘  │           ║  └──────────┘  ║
│                │           ║                ║
│ Organization   │           ║ Organization   ║
│ Name           │           ║ Name           ║
└────────────────┘           ╚════════════════╝
Shadow: light               Shadow: expanded
Position: normal            Position: lifted (-8px)
Logo scale: 1.0             Logo scale: 1.1
```

---

## Animation Timings

### Dark Mode Toggle
- **Total Duration:** 0.3s
- **Easing:** ease
- **Effect:** Scale 0.9 → 1.0 on click
- **Icon Transition:** Instant change

### Testimonial Buttons
- **Hover Scale:** 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- **Icon Slide:** 0.6s ease infinite (on hover)
- **Shadow Change:** 0.3s ease
- **Active State:** Instant feedback

### Team Avatars
- **Scale on Hover:** 0.3s ease
- **Border Change:** 0.3s ease
- **Shadow Expansion:** 0.3s ease
- **Combined Effect:** Smooth, cohesive

### Logo Cards
- **Card Lift:** 0.3s ease
- **Logo Scale:** 0.3s ease
- **Shadow Expansion:** 0.3s ease
- **All Together:** Smooth cascade

---

## Dark Mode Color Mapping

### Light Mode → Dark Mode
```
Background:
Light: #ffffff    →  Dark: #111827

Text:
#374151 (dark)    →  #f9fafb (light)

Cards (Light):
#ffffff           →  #374151

Cards (Dark):
Already dark      →  Stays dark

Sections:
Light gray        →  Dark gray (#1f2937)

Borders:
Dark              →  Light
```

### Dark Mode Specific Colors
- **Section Background:** #1f2937
- **Card Background:** #374151
- **Border Color:** rgba(255, 255, 255, 0.1)
- **Text Primary:** #f9fafb
- **Text Secondary:** rgba(255, 255, 255, 0.75)
- **Accent (Dark Mode):** #5b8dee

---

## Responsive Behavior

### Desktop (1200px+)
```
Navbar:     [Logo] [Full Nav] [Dark Toggle] [Get Demo]
Testimonials: Full width, circular buttons visible
Team:       4 columns with large avatars (140×140)
Logos:      6 columns with large badges (120×120)
```

### Tablet (768px - 1199px)
```
Navbar:     [Logo] [Collapsed Nav] [Dark Toggle] [Get Demo]
Testimonials: Full width, buttons slightly smaller
Team:       2 columns with medium avatars
Logos:      3 columns with medium badges
```

### Mobile (<768px)
```
Navbar:     [Logo] [Hamburger] [Dark Toggle]
            [Expanded Nav Below]

Testimonials: Carousel, circular buttons accessible
Team:       1 column, full width cards
Logos:      2 columns with scrollable grid
```

---

## Accessibility Features

### Dark Mode Toggle
- ✅ Title attribute: "Toggle Dark Mode"
- ✅ Keyboard accessible (button element)
- ✅ Color independent (icon + contrast)
- ✅ Sufficient size (36px minimum)

### Testimonial Buttons
- ✅ Title attribute: "Previous/Next Testimonial"
- ✅ Large touch targets (50px)
- ✅ High contrast (white on blue)
- ✅ Clear purpose (chevron icons)

### Team Avatars
- ✅ Alt text for images
- ✅ Name visible below avatar
- ✅ Role label below name
- ✅ Color contrast sufficient

### Customer Logos
- ✅ Organization name displayed
- ✅ Abbreviations are meaningful
- ✅ High contrast text
- ✅ Sufficient size for readability

---

## Performance Metrics

### File Size Impact
- **CSS Added:** ~185 lines (≈4KB)
- **JavaScript Modified:** ~35 lines (minimal)
- **HTML Changes:** ~35 lines (minimal)
- **Total Impact:** <10KB additional

### Animation Performance
- **Dark Mode Toggle:** GPU accelerated (transform)
- **Button Hover:** GPU accelerated (transform, shadow)
- **Avatar Scale:** GPU accelerated (transform)
- **Logo Animations:** GPU accelerated (transform)
- **Impact:** Negligible (60fps maintained)

### Image Loading
- **Team Avatars:** Dynamic URL-based (loads on demand)
- **Logo Images:** None (CSS only)
- **Total Image Requests:** +4 (team avatars)
- **Impact:** Minimal (small images, cached)

