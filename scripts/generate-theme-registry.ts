import fs from "fs";
import path from "path";

import { defaultPresets } from "@/utils/theme-presets";

const THEMES_DIR = path.join(process.cwd(), "public", "r", "themes");

// Ensure the themes directory exists
if (!fs.existsSync(THEMES_DIR)) {
  fs.mkdirSync(THEMES_DIR, { recursive: true });
}

// Generate registry files for all presets
Object.keys(defaultPresets).forEach((name) => {
  const preset = defaultPresets[name];

  // Create a simplified registry item for build time
  const registryItem = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: "registry:style",
    css: {
      "@layer base": {
        body: {
          "letter-spacing": "var(--tracking-normal)",
        },
      },
    },
    cssVars: {
      theme: {
        "font-sans": preset.styles.light["font-sans"] || "Inter, sans-serif",
        "font-mono": preset.styles.light["font-mono"] || "monospace",
        "font-serif": preset.styles.light["font-serif"] || "serif",
        radius: preset.styles.light.radius || "0.5rem",
        "tracking-tighter": "calc(var(--tracking-normal) - 0.05em)",
        "tracking-tight": "calc(var(--tracking-normal) - 0.025em)",
        "tracking-wide": "calc(var(--tracking-normal) + 0.025em)",
        "tracking-wider": "calc(var(--tracking-normal) + 0.05em)",
        "tracking-widest": "calc(var(--tracking-normal) + 0.1em)",
      },
      light: {
        ...preset.styles.light,
        "tracking-normal": preset.styles.light["letter-spacing"] || "0em",
        spacing: preset.styles.light.spacing || "0.25rem",
      },
      dark: {
        ...preset.styles.dark,
      },
    },
  };

  const filePath = path.join(THEMES_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(registryItem, null, 2));
  console.log(`Generated registry file for theme: ${name}`);
});
