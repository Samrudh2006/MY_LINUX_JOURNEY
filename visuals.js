// SAMRUDH SOC ANALYST - Visual SVG Flowcharts & Attack Graph Generator

const VISUAL_DIAGRAMS = {
  killchain: `
    <svg viewBox="0 0 800 160" xmlns="http://www.w3.org/2000/svg" class="svg-diagram">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1565c0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0d47a1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="8" fill="#0d1117" />
      
      <!-- Stage 1 -->
      <g transform="translate(10, 30)">
        <rect width="100" height="100" rx="6" fill="url(#grad1)" stroke="#00f2fe" stroke-width="2"/>
        <text x="50" y="45" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">1. RECON</text>
        <text x="50" y="65" fill="#90caf9" font-size="10" text-anchor="middle">Nmap/Phishing</text>
      </g>
      <path d="M 115 80 L 135 80" stroke="#00f2fe" stroke-width="3" marker-end="url(#arrow)"/>

      <!-- Stage 2 -->
      <g transform="translate(140, 30)">
        <rect width="100" height="100" rx="6" fill="url(#grad1)" stroke="#00f2fe" stroke-width="2"/>
        <text x="50" y="45" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">2. WEAPON</text>
        <text x="50" y="65" fill="#90caf9" font-size="10" text-anchor="middle">Payload Build</text>
      </g>
      <path d="M 245 80 L 265 80" stroke="#00f2fe" stroke-width="3"/>

      <!-- Stage 3 -->
      <g transform="translate(270, 30)">
        <rect width="100" height="100" rx="6" fill="url(#grad1)" stroke="#00f2fe" stroke-width="2"/>
        <text x="50" y="45" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">3. DELIVER</text>
        <text x="50" y="65" fill="#90caf9" font-size="10" text-anchor="middle">Web/Email</text>
      </g>
      <path d="M 375 80 L 395 80" stroke="#00f2fe" stroke-width="3"/>

      <!-- Stage 4 -->
      <g transform="translate(400, 30)">
        <rect width="100" height="100" rx="6" fill="url(#grad1)" stroke="#ff5252" stroke-width="2"/>
        <text x="50" y="45" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">4. EXPLOIT</text>
        <text x="50" y="65" fill="#ff8a80" font-size="10" text-anchor="middle">Zero-Day/CVE</text>
      </g>
      <path d="M 505 80 L 525 80" stroke="#ff5252" stroke-width="3"/>

      <!-- Stage 5 -->
      <g transform="translate(530, 30)">
        <rect width="100" height="100" rx="6" fill="url(#grad1)" stroke="#ff5252" stroke-width="2"/>
        <text x="50" y="45" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">5. C2 BEACON</text>
        <text x="50" y="65" fill="#ff8a80" font-size="10" text-anchor="middle">Reverse Shell</text>
      </g>
      <path d="M 635 80 L 655 80" stroke="#ff5252" stroke-width="3"/>

      <!-- Stage 6 -->
      <g transform="translate(660, 30)">
        <rect width="120" height="100" rx="6" fill="#b71c1c" stroke="#ff1744" stroke-width="2"/>
        <text x="60" y="45" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">6. OBJECTIVES</text>
        <text x="60" y="65" fill="#ff8a80" font-size="10" text-anchor="middle">Data Exfil / Lock</text>
      </g>
    </svg>
  `,

  webshellFlow: `
    <svg viewBox="0 0 750 180" xmlns="http://www.w3.org/2000/svg" class="svg-diagram">
      <rect width="100%" height="100%" rx="8" fill="#121820" stroke="#1c2533" stroke-width="2"/>
      
      <!-- Attacker Node -->
      <rect x="20" y="40" width="140" height="90" rx="6" fill="#1e2836" stroke="#ff5252" stroke-width="2"/>
      <text x="90" y="75" fill="#ff5252" font-size="13" font-weight="bold" text-anchor="middle">ATTACKER IP</text>
      <text x="90" y="100" fill="#aaa" font-size="11" text-anchor="middle">45.33.32.156</text>
      
      <!-- Arrow 1 -->
      <path d="M 160 85 L 230 85" stroke="#ff5252" stroke-width="2" stroke-dasharray="4"/>
      <text x="195" y="75" fill="#ff5252" font-size="10" text-anchor="middle">POST /uploads/cmd.php</text>

      <!-- Web Server Node -->
      <rect x="230" y="40" width="160" height="90" rx="6" fill="#1e2836" stroke="#00d2ff" stroke-width="2"/>
      <text x="310" y="75" fill="#00d2ff" font-size="13" font-weight="bold" text-anchor="middle">APACHE/NGINX</text>
      <text x="310" y="100" fill="#aaa" font-size="11" text-anchor="middle">User: www-data</text>

      <!-- Arrow 2 -->
      <path d="M 390 85 L 460 85" stroke="#ff5252" stroke-width="3"/>
      <text x="425" y="75" fill="#ff5252" font-size="10" font-weight="bold" text-anchor="middle">SPAWNS</text>

      <!-- Bash Shell Node -->
      <rect x="460" y="40" width="140" height="90" rx="6" fill="#b71c1c" stroke="#ff1744" stroke-width="2"/>
      <text x="530" y="75" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">/bin/bash</text>
      <text x="530" y="100" fill="#ff8a80" font-size="11" text-anchor="middle">PID: 4512</text>

      <!-- SOC Alert Badge -->
      <rect x="620" y="40" width="110" height="90" rx="6" fill="#00e676" stroke="#00c853" stroke-width="2"/>
      <text x="675" y="75" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">SOC ALERT</text>
      <text x="675" y="100" fill="#000" font-size="10" text-anchor="middle">CRITICAL IR</text>
    </svg>
  `
};

if (typeof module !== 'undefined') {
  module.exports = { VISUAL_DIAGRAMS };
}
