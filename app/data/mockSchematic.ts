const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const buildMockSchematicDataUrl = (partName: string, fuelType: string) => {
  const label = escapeXml(partName || "Unknown Part");
  const fuel = escapeXml(fuelType || "Unknown Fuel");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="grid" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#0b0f14"/>
      <stop offset="100%" stop-color="#0a0c10"/>
    </linearGradient>
    <linearGradient id="engineGlow" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#00f3ff" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#00f3ff" stop-opacity="0.2"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#grid)"/>
  <g stroke="#0cf3ff" stroke-opacity="0.15" stroke-width="1">
    ${Array.from({ length: 24 })
      .map((_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="800"/>`)
      .join("")}
    ${Array.from({ length: 16 })
      .map((_, i) => `<line x1="0" y1="${i * 50}" x2="1200" y2="${i * 50}"/>`)
      .join("")}
  </g>
  <g stroke="#00f3ff" stroke-width="2" fill="none" opacity="0.95">
    <!-- Engine nacelle -->
    <rect x="160" y="260" width="880" height="280" rx="90"/>
    <rect x="220" y="300" width="760" height="200" rx="70"/>
    <!-- Intake ring -->
    <circle cx="260" cy="400" r="120"/>
    <circle cx="260" cy="400" r="90"/>
    <!-- Exhaust cone -->
    <path d="M1000 320 L1120 400 L1000 480 Z" />
    <path d="M960 340 L1040 400 L960 460 Z" />
    <!-- Fan blades -->
    ${Array.from({ length: 16 })
      .map((_, i) => {
        const angle = (i * Math.PI) / 8;
        const x1 = 260 + Math.cos(angle) * 20;
        const y1 = 400 + Math.sin(angle) * 20;
        const x2 = 260 + Math.cos(angle) * 85;
        const y2 = 400 + Math.sin(angle) * 85;
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
      })
      .join("")}
  </g>
  <g fill="url(#engineGlow)" opacity="0.35">
    <circle cx="260" cy="400" r="105"/>
  </g>
  <g fill="#ff4d00" opacity="0.85">
    <rect x="160" y="190" width="220" height="32" rx="6"/>
    <rect x="820" y="190" width="220" height="32" rx="6"/>
  </g>
  <g fill="#e2e8f0" font-family="monospace" font-size="22">
    <text x="180" y="214">ENGINE SCHEMATIC</text>
    <text x="840" y="214">DEMO ONLY</text>
  </g>
  <g fill="#00f3ff" font-family="monospace" font-size="28">
    <text x="120" y="120">PART: ${label}</text>
    <text x="120" y="680">FUEL: ${fuel}</text>
  </g>
  <g fill="#94a3b8" font-family="monospace" font-size="18">
    <text x="120" y="720">AI OUTPUT UNAVAILABLE - USING LOCAL BLUEPRINT</text>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
