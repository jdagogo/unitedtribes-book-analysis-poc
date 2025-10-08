# Discovery Modal Styling Standards

## Overview
This document defines the standardized styling for all discovery modal content across the United Tribes Fresh application. Use these standards when adding new pages or updating existing discovery panels.

**Last Updated**: October 8, 2025
**Version**: 4.4
**Reference Commit**: 1ebae91

---

## 1. Featured Tab - Video Thumbnails

### Standard Video Card Styling

**Grid Layout**:
```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
```

**Card Container**:
```tsx
style={{
  cursor: 'pointer',
  borderRadius: '8px',
  overflow: 'hidden',
  background: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s, box-shadow 0.2s'
}}
```

**Thumbnail Image**:
```tsx
{video.thumbnail && (
  <img
    src={video.thumbnail}
    alt={video.title}
    style={{ width: '100%', height: 'auto', display: 'block' }}
  />
)}
```

**Text Content**:
```tsx
<div style={{ padding: '1rem' }}>
  <p style={{
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '0.5rem',
    lineHeight: '1.4',
    color: '#1f2937'
  }}>
    {video.title}
  </p>
  <p style={{
    fontSize: '16px',
    color: '#1f2937',
    fontWeight: '600'
  }}>
    {video.channel} • {video.duration}
  </p>
</div>
```

### ✅ Reference Implementation
- **Location**: `client/src/components/paginated-book-viewer.tsx`
- **Page 4**: Lines 7982-8021 (Blue Note Chiefs)
- **Page 9**: Lines 4169-4208 (Dexter Gordon - GO)

### Key Specs
| Element | Value | Notes |
|---------|-------|-------|
| Grid columns | `repeat(2, 1fr)` | Always 2 columns |
| Gap | `1rem` | Space between cards |
| Title font | `18px` / `700` weight | Bold, highly readable |
| Channel font | `16px` / `600` weight | Semi-bold |
| Card padding | `1rem` | Standard spacing |
| Box shadow | `0 2px 4px rgba(0,0,0,0.1)` | Subtle depth |
| Image height | `auto` | Maintains aspect ratio |

---

## 2. Read Tab - Book Cards

### Standard Book Card Styling

**Grid Layout**:
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
  gap: '1.5rem'
}}>
```

**Card Container**:
```tsx
<div style={{
  background: 'white',
  padding: '1rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}}>
```

**Book Cover Image**:
```tsx
<img
  src={bookCoverUrl}
  alt={bookTitle}
  style={{
    width: '100%',
    height: 'auto',
    aspectRatio: '2/3',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '0.75rem',
    backgroundColor: '#f3f4f6'
  }}
/>
```

**Book Title**:
```tsx
<h5 style={{
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '0.5rem',
  color: '#1f2937'
}}>
  {bookTitle}
</h5>
```

**Book Author**:
```tsx
<p style={{
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '0.75rem'
}}>
  by {authorName}
</p>
```

**Action Button (HarperCollins)**:
```tsx
<button
  onClick={handleClick}
  style={{
    display: 'block',
    width: '100%',
    padding: '0.75rem',
    background: '#00563f',
    color: 'white',
    textAlign: 'center',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer'
  }}
>
  Buy on HarperCollins
</button>
```

### ✅ Reference Implementation
- **Location**: `client/src/components/paginated-book-viewer.tsx`
- **Page 9**: Lines 4498-4650 (Kansas City Lightning, Strange Fruit, etc.)

### Key Specs
| Element | Value | Notes |
|---------|-------|-------|
| Grid minmax | `270px` minimum | Ensures readable size |
| Gap | `1.5rem` | Larger gap for books |
| Cover aspect ratio | `2/3` | Standard book proportion |
| Title font | `16px` / `bold` | Clear hierarchy |
| Author font | `14px` | Gray color `#6b7280` |
| Button color | `#00563f` | HarperCollins brand green |
| Card padding | `1rem` | Standard spacing |
| Box shadow | `0 2px 4px rgba(0,0,0,0.1)` | Consistent depth |

---

## 3. Common Design Patterns

### Hover Effects
```tsx
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'scale(1.02)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'scale(1)';
}}
```

### Tab Navigation Buttons
```tsx
<button
  onClick={() => setDiscoveryTab('featured')}
  style={{
    padding: '0.75rem 1.5rem',
    background: discoveryTab === 'featured' ? '#3b82f6' : 'transparent',
    color: discoveryTab === 'featured' ? 'white' : '#6b7280',
    border: 'none',
    borderBottom: discoveryTab === 'featured' ? '2px solid #3b82f6' : '2px solid transparent',
    borderRadius: '0',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
  }}
>
  Featured
</button>
```

### Section Headers
```tsx
<h4 style={{
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '1rem'
}}>
  Section Title
</h4>
```

---

## 4. Color Palette

| Usage | Color | Hex Code |
|-------|-------|----------|
| Primary blue (active tabs) | Blue | `#3b82f6` |
| Text primary | Dark gray | `#1f2937` |
| Text secondary | Medium gray | `#6b7280` |
| HarperCollins brand | Dark green | `#00563f` |
| Background light | Off-white | `#f9fafb` |
| Border light | Light gray | `#e5e7eb` |
| Card background | White | `white` |

---

## 5. Typography Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Video title | 18px | 700 | 1.4 |
| Video metadata | 16px | 600 | default |
| Book title | 16px | bold | default |
| Book author | 14px | normal | default |
| Section header | 18px | bold | default |
| Button text | 14px | 600 | default |

---

## 6. Spacing Scale

| Usage | Value |
|-------|-------|
| Card padding | 1rem |
| Grid gap (videos) | 1rem |
| Grid gap (books) | 1.5rem |
| Element margin bottom | 0.5rem - 1rem |

---

## 7. Implementation Checklist

When adding a new discovery panel, ensure:

- [ ] Video thumbnails use `repeat(2, 1fr)` grid
- [ ] Video titles are 18px / weight 700
- [ ] Video metadata is 16px / weight 600
- [ ] Book grid uses `minmax(270px, 1fr)`
- [ ] Book covers have 2/3 aspect ratio
- [ ] All cards have `boxShadow: '0 2px 4px rgba(0,0,0,0.1)'`
- [ ] Hover effects include scale(1.02) transform
- [ ] HarperCollins buttons use `#00563f` green
- [ ] Tab navigation follows standard pattern
- [ ] Section headers are 18px / bold

---

## 8. Anti-Patterns to Avoid

❌ **Don't use**:
- Fixed pixel heights for images (use `height: 'auto'`)
- Font sizes smaller than 14px for body text
- Gray text for primary content (use `#1f2937`)
- Border instead of boxShadow for cards
- `'1fr 1fr'` instead of `'repeat(2, 1fr)'` for consistency

✅ **Do use**:
- Responsive image sizing with `height: 'auto'`
- Clear type hierarchy (18px titles, 16px metadata)
- Dark text for readability
- Subtle shadows for depth
- Semantic grid patterns

---

## 9. Version History

| Date | Commit | Changes |
|------|--------|---------|
| Oct 8, 2025 | 1ebae91 | Standardized page 9 video thumbnails to match page 4 |
| Oct 8, 2025 | 1ebae91 | Updated page 9 book grid to 270px minmax |
| Oct 7, 2025 | ce2d5b5 | Fixed index page thumbnail images |

---

## Questions?

If unsure about styling for a new component:
1. Check page 4's Featured tab (lines 7982-8021) for video reference
2. Check page 9's Read tab (lines 4498-4650) for book reference
3. Follow the specs in this document exactly
4. Test on actual devices for readability
