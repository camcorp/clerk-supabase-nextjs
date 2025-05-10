// Design System - Color Palette and Typography

export const colors = {
  // Primary Colors
  primary: {
    deepBlue: '#0F3460', // Primary brand color
    teal: '#1A7F8E',     // Secondary accent
    lavender: '#8D7AE6'  // Tertiary accent
  },
  
  // Neutral Colors
  neutral: {
    offWhite: '#F8F9FC', // Background
    lightGray: '#E9ECEF', // Card backgrounds, borders
    mediumGray: '#6C757D', // Secondary text
    darkGray: '#343A40'  // Primary text
  },
  
  // Accent Colors
  accent: {
    success: '#2ECC71', // Positive metrics
    warning: '#F39C12', // Neutral metrics
    alert: '#E74C3C',   // Negative metrics
    info: '#3498DB'     // Informational elements
  }
};

export const typography = {
  // Font Families
  fontFamily: {
    primary: "'Inter', sans-serif",
    secondary: "'Space Grotesk', sans-serif"
  },
  
  // Font Sizes
  fontSize: {
    h1: '2.5rem',    // 40px - Main page titles
    h2: '2rem',      // 32px - Section titles
    h3: '1.5rem',    // 24px - Card titles
    bodyLarge: '1.125rem', // 18px - Important content
    body: '1rem',    // 16px - Regular content
    small: '0.875rem', // 14px - Secondary information
    micro: '0.75rem' // 12px - Labels, captions
  },
  
  // Font Weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};