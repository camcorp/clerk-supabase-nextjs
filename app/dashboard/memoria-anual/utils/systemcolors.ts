// Define color palette for the application
export const colors = {
  // Primary colors
  primary: {
    main: '#0F3460',
    light: '#1A7F8E',
    dark: '#0A2540',
    contrastText: '#FFFFFF'
  },
  
  // Secondary colors
  secondary: {
    main: '#E94560',
    light: '#FF6B81',
    dark: '#C62E42',
    contrastText: '#FFFFFF'
  },
  
  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    light: '#F8F9FC',
    medium: '#E9ECEF',
    gray: '#6C757D',
    dark: '#343A40',
    black: '#212529'
  },
  
  // Status colors
  status: {
    success: '#2ECC71',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB'
  },
  
  // Domain-specific colors
  companias: {
    primary: '#1A7F8E',
    secondary: '#3BACB6',
    light: '#82E0AA'
  },
  
  corredores: {
    primary: '#9B59B6',
    secondary: '#AF7AC5',
    light: '#D7BDE2'
  },
  
  ramos: {
    primary: '#E67E22',
    secondary: '#F39C12',
    light: '#FAD7A0'
  },
  
  // Colores específicos para tipos de seguros
  seguros: {
    generales: '#CC3040', // Dark Red para Seguros Generales
    vida: '#8A6DE8'       // Soft Violet para Seguros de Vida
  }
};

// Function to format text with colors (without JSX)
export interface TextPart {
  text: string;
  type: 'normal' | 'highlight' | 'emphasis';
  color?: string;
}

// This function should return a string with formatting instructions
// instead of trying to return JSX elements
export function formatColoredText(text: string): TextPart[] {
  // Parse the text and identify parts to format
  const parts: TextPart[] = [];
  
  // Simple parsing logic (can be enhanced)
  const regex = /\*\*(.*?)\*\*|\*(.*?)\*|__(.*?)__/g;
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    // Add normal text before the match
    if (match.index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, match.index),
        type: 'normal'
      });
    }
    
    // Determine the type of formatting
    if (match[1]) {
      // Bold text: **text**
      parts.push({
        text: match[1],
        type: 'emphasis',
        color: colors.primary.main
      });
    } else if (match[2]) {
      // Italic text: *text*
      parts.push({
        text: match[2],
        type: 'emphasis',
        color: colors.secondary.main
      });
    } else if (match[3]) {
      // Underlined text: __text__
      parts.push({
        text: match[3],
        type: 'highlight',
        color: colors.status.info
      });
    }
    
    lastIndex = regex.lastIndex;
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      type: 'normal'
    });
  }
  
  return parts;
}

// Helper function to get CSS styles for text parts (for client components)
export function getStyleForTextPart(part: TextPart): Record<string, string> {
  const style: Record<string, string> = {};
  
  if (part.type === 'normal') {
    // Default styling
    style.color = colors.neutral.dark;
  } else if (part.type === 'highlight') {
    style.backgroundColor = part.color || colors.status.info;
    style.color = colors.neutral.white;
    style.padding = '2px 4px';
    style.borderRadius = '4px';
  } else if (part.type === 'emphasis') {
    style.color = part.color || colors.primary.main;
    style.fontWeight = 'bold';
  }
  
  return style;
}

// Function to get trend color based on value
export function getTrendColor(trend: number): string {
  if (trend >= 0) {
    return 'text-[#2ECC71]'; // Success green
  } else {
    return 'text-[#E74C3C]'; // Alert red
  }
}