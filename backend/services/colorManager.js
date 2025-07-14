/**
 * Color Manager Service
 * Provides methods for generating colors with good contrast for black text
 * Ensures readability in timetable displays
 */

class ColorManager {
  constructor() {
    // Improved color palette with excellent contrast for black text
    // All colors are light/medium brightness to ensure black text is readable
    this.colorPalette = [
      '#FFE6E6', // Light pink
      '#E6F3FF', // Light blue
      '#E6FFE6', // Light green
      '#F0E6FF', // Light purple
      '#FFE6F0', // Light magenta
      '#E6E6FA', // Lavender
      '#E0FFFF', // Light cyan
      '#F5F5DC', // Beige (keep if not too light)
      '#F0F8FF', // Alice blue (optional, can remove if too light)
      // Removed all white and near-white colors
      '#C0C0C0', // Silver
      '#A0A0A0', // Light gray
      '#909090', // Light gray
      '#808080', // Gray
      '#606060', // Light gray
      '#505050', // Light gray
      '#404040', // Light gray
      '#303030', // Light gray
    ];

    // Filter out colors that don't have good contrast
    this.colorPalette = this.colorPalette.filter(color => this.hasGoodContrast(color));

    // Used colors to avoid duplicates
    this.usedColors = new Set();
  }

  /**
   * Get a random color from the predefined palette
   * @returns {string} Hex color code
   */
  getRandomColor() {
    const availableColors = this.colorPalette.filter(color => !this.usedColors.has(color));
    
    // If all colors are used, reset the used colors set
    if (availableColors.length === 0) {
      this.usedColors.clear();
      return this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
    }
    
    const color = availableColors[Math.floor(Math.random() * availableColors.length)];
    this.usedColors.add(color);
    return color;
  }

  /**
   * Generate HSL color with guaranteed contrast for black text
   * @returns {string} HSL color string
   */
  getContrastSafeHSLColor() {
    const hue = Math.floor(Math.random() * 360); // Random hue (0-359)
    const saturation = Math.floor(Math.random() * 30) + 20; // 20-50% saturation
    const lightness = Math.floor(Math.random() * 30) + 60; // 60-90% lightness (ensures light colors)
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * Generate RGB color with guaranteed contrast for black text
   * @returns {string} RGB color string
   */
  getContrastSafeRGBColor() {
    // Generate RGB values that ensure light colors (high values)
    const r = Math.floor(Math.random() * 100) + 155; // 155-255 (light red)
    const g = Math.floor(Math.random() * 100) + 155; // 155-255 (light green)
    const b = Math.floor(Math.random() * 100) + 155; // 155-255 (light blue)
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Convert HSL to Hex color
   * @param {number} h - Hue (0-360)
   * @param {number} s - Saturation (0-100)
   * @param {number} l - Lightness (0-100)
   * @returns {string} Hex color code
   */
  hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c/2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  }

  /**
   * Generate HSL color and convert to Hex
   * @returns {string} Hex color code
   */
  getContrastSafeHexColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 30) + 20;
    const lightness = Math.floor(Math.random() * 30) + 60;
    
    return this.hslToHex(hue, saturation, lightness);
  }

  /**
   * Get a color based on module name (consistent colors for same modules)
   * @param {string} moduleName - The name of the module
   * @returns {string} Hex color code
   */
  getColorForModule(moduleName) {
    // Simple hash function to generate consistent colors
    let hash = 0;
    for (let i = 0; i < moduleName.length; i++) {
      const char = moduleName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use hash to select from palette
    const index = Math.abs(hash) % this.colorPalette.length;
    return this.colorPalette[index];
  }

  /**
   * Check if a color has good contrast with black text
   * @param {string} color - Hex color code
   * @returns {boolean} True if good contrast
   */
  hasGoodContrast(color) {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return true if luminance is high enough for black text
    // Using a higher threshold (0.6) to ensure better readability
    return luminance > 0.6;
  }

  /**
   * Get all available colors
   * @returns {Array} Array of hex color codes
   */
  getAllColors() {
    return [...this.colorPalette];
  }

  /**
   * Reset used colors tracking
   */
  resetUsedColors() {
    this.usedColors.clear();
  }

  /**
   * Get color statistics
   * @returns {Object} Statistics about color usage
   */
  getColorStats() {
    return {
      totalColors: this.colorPalette.length,
      usedColors: this.usedColors.size,
      availableColors: this.colorPalette.length - this.usedColors.size
    };
  }
}

// Create singleton instance
const colorManager = new ColorManager();

module.exports = colorManager; 