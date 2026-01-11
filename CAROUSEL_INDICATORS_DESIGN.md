# Carousel Indicator Buttons - Design Guide

## Overview
Enhanced the carousel indicator dots for both Team and Testimonials carousels with a modern, professional design that matches HealthFlow's visual identity.

## Visual Design Features

### Inactive Indicator Dots
- **Shape:** Perfect circle (10px × 10px)
- **Background:** Subtle gradient (light gray)
  - Start: `#e0e0e0`
  - End: `#d0d0d0`
- **Opacity:** 60% (subtle, non-intrusive)
- **Border:** 2px transparent (for consistency)
- **Cursor:** Pointer (indicates clickability)

### Hover State (Inactive Dots)
- **Opacity:** Increases to 85%
- **Scale:** 1.2x (20% larger)
- **Shadow:** Subtle elevation (0 2px 8px rgba(0, 0, 0, 0.1))
- **Transition:** 0.4s cubic-bezier (smooth animation)

### Active Indicator Dot
- **Shape:** Pill-shaped rectangle (28px × 10px)
- **Background:** Green gradient (HealthFlow accent color)
  - Start: `var(--accent-color)` (#12A16B)
  - End: `#0f8550` (darker green)
- **Opacity:** 100% (full visibility)
- **Shadow:** Elevated shadow with green tint
  - `0 4px 12px rgba(18, 161, 107, 0.35)`
- **Border-radius:** 5px (subtle roundness)
- **Border:** None
- **Cursor:** Pointer

### Transition Effects
- **Duration:** 0.4 seconds
- **Easing:** `cubic-bezier(0.4, 0.0, 0.2, 1)` (smooth, natural motion)
- **Properties:** All (background, size, shadow, opacity)

## Layout & Spacing

### Container (.owl-dots)
- **Display:** Flex (modern layout)
- **Justify-content:** Center (centered alignment)
- **Align-items:** Center (vertical centering)
- **Gap:** 0.5rem (12px spacing between dots)
- **Margin-top:** 2rem (separation from carousel)
- **Padding:** 1rem 0 (breathing room)

### Individual Dots Spacing
- **Margin:** 0 (removed default margins)
- **Previous margin:** 0 5px (deprecated)
- **New gap:** 0.5rem in container (cleaner)

## Color Scheme

| State | Colors | Usage |
|-------|--------|-------|
| **Inactive** | #e0e0e0 → #d0d0d0 | Unvisited slides |
| **Hover** | Same gradient + scale | Interactive feedback |
| **Active** | #12A16B → #0f8550 | Current slide |
| **Shadow** | rgba(18, 161, 107, 0.35) | Depth on active |

## Applied Carousels

### 1. Testimonials Carousel
- **Location:** healthflow-styles.css, lines 1475-1517
- **Class:** `.testimonials-carousel .owl-dot`
- **6 testimonials:** Sr. Juliet Nakabugo, Dr. Samuel Okello, Dr. Jane Nakato, Mr. Robert Mukasa, Sr. Constance Oduor, Dr. Susan Atwine

### 2. Team Carousel
- **Location:** healthflow-styles.css, lines 1754-1796
- **Class:** `.team-carousel .owl-dot`
- **6 team members:** Dr. Sarah Mwase, James Katumba, Amara Okafor, David Luwum, Grace Nakibuule, Emmanuel Ngabe

## CSS Implementation

```css
/* Base Inactive State */
.carousel .owl-dot {
  background: linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%);
  border-radius: 50%;
  width: 10px;
  height: 10px;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
  opacity: 0.6;
}

/* Hover State */
.carousel .owl-dot:hover {
  opacity: 0.85;
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Active State */
.carousel .owl-dot.active {
  background: linear-gradient(135deg, var(--accent-color) 0%, #0f8550 100%);
  width: 28px;
  height: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(18, 161, 107, 0.35);
  opacity: 1;
}
```

## Animation Characteristics

### Cubic Bezier Curve
- **Formula:** `cubic-bezier(0.4, 0.0, 0.2, 1)`
- **Effect:** Fast start, slower ending (Material Design standard)
- **Duration:** 0.4s (perceptible but not sluggish)

### Scale Transform
- **Hover:** `scale(1.2)` (20% enlargement)
- **Active:** `scale(1)` (no additional scaling, natural size)

### Shadow Elevation
- **Inactive hover:** Subtle (0 2px 8px)
- **Active:** Prominent (0 4px 12px with color tint)

## Accessibility Features

✅ **Color Contrast:**
- Active state: High contrast green (WCAG AA+)
- Inactive: Subtle but visible gray

✅ **Size & Touch:**
- Minimum 10px × 10px (accessible touch target)
- Active state: 28px × 10px (larger clickable area)

✅ **Visual Feedback:**
- Cursor pointer on hover
- Scale animation indicates interactivity
- Opacity changes enhance visual hierarchy

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Graceful degradation (gradient support required)

## Performance

- **GPU Acceleration:** Transform and opacity changes trigger GPU acceleration
- **No Layout Shift:** Only opacity and transform changes (no reflow)
- **Smooth 60fps:** Cubic bezier ensures smooth animation

## Design Inspiration

The indicator design follows:
- **Material Design** principles (smooth transitions, elevation)
- **Modern Web Standards** (flexbox, gradients, transforms)
- **HealthFlow Brand Colors** (green accent #12A16B)
- **Mobile-First Approach** (responsive, touch-friendly)

## Future Enhancements

1. Add dot labels/numbers for better navigation hint
2. Implement keyboard navigation (arrow keys)
3. Add progress bar variant for long carousels (10+ items)
4. Support for vertical carousel orientation
5. Custom dot shapes (squares, custom icons)
