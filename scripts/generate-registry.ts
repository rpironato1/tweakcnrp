import fs from "fs";
import path from "path";
import { defaultPresets } from "../utils/theme-presets";

interface ThemeRegistry {
  $schema: string;
  name: string;
  homepage: string;
  items: unknown[];
}

function generateRegistry() {
  const registry: ThemeRegistry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "tweakcn-theme-registry",
    homepage: "https://tweakcn.com",
    items: [],
  };

  // Convert defaultPresets to registry items
  for (const [name, preset] of Object.entries(defaultPresets)) {
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

    const item = {
      name,
      type: "registry:style",
      title: preset.label || name,
      description: `A theme based on the ${
        preset.label || name
      } color palette.`,
      css: registryItem.css,
      cssVars: registryItem.cssVars,
    };
    registry.items.push(item);
  }

  // Create public/r directory if it doesn't exist
  const publicDir = path.join(process.cwd(), "public", "r", "themes");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write the registry file
  const registryPath = path.join(publicDir, "registry.json");
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  console.log(`Registry file generated at ${registryPath}`);
}

generateRegistry();
