// Réglages propres aux applis, appliqués après « npx cap add » :
// autorisations (position, appareil photo, photos), numéro de version, chiffrement déclaré.
// Usage : node scripts/native-config.mjs android|ios [numéro de build]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const base = join(here, "..");
const [platform, buildArg] = process.argv.slice(2);
const build = Number(buildArg || process.env.GITHUB_RUN_NUMBER || 1);
const version = JSON.parse(readFileSync(join(base, "package.json"), "utf8")).version;

function edit(file, fn) {
  if (!existsSync(file)) throw new Error("Fichier introuvable : " + file);
  const before = readFileSync(file, "utf8");
  const after = fn(before);
  writeFileSync(file, after);
  console.log("Modifié :", file);
}

if (platform === "android") {
  edit(join(base, "android/app/src/main/AndroidManifest.xml"), (s) => {
    const perms = [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.CAMERA",
      "android.permission.VIBRATE",
    ].filter((p) => !s.includes(p))
      .map((p) => `    <uses-permission android:name="${p}" />`).join("\n");
    const feats = [
      '    <uses-feature android:name="android.hardware.location.gps" android:required="false" />',
      '    <uses-feature android:name="android.hardware.camera" android:required="false" />',
    ].filter((f) => !s.includes(f.split('"')[1])).join("\n");
    return s.replace("</manifest>", `${perms}\n${feats}\n</manifest>`);
  });
  edit(join(base, "android/app/build.gradle"), (s) =>
    s.replace(/versionCode \d+/, `versionCode ${build}`).replace(/versionName "[^"]*"/, `versionName "${version}"`));
} else if (platform === "ios") {
  edit(join(base, "ios/App/App/Info.plist"), (s) => {
    const keys = {
      NSLocationWhenInUseUsageDescription: "Votre position sert au SOS, à la carte, à la météo et aux horaires de tir. Elle n’est partagée que si vous le décidez.",
      NSCameraUsageDescription: "L’appareil photo sert au viseur 30° et aux photos de vos publications, prises et prélèvements.",
      NSPhotoLibraryUsageDescription: "Vos photos servent à illustrer vos publications, prises et prélèvements.",
      NSPhotoLibraryAddUsageDescription: "Pour enregistrer les visuels que vous créez dans l’appli.",
      NSMicrophoneUsageDescription: "Le micro sert au son des vidéos que vous publiez.",
      ITSAppUsesNonExemptEncryption: false,
    };
    let add = "";
    for (const [k, v] of Object.entries(keys)) {
      if (s.includes(`<key>${k}</key>`)) continue;
      add += `\t<key>${k}</key>\n\t${typeof v === "boolean" ? (v ? "<true/>" : "<false/>") : `<string>${v}</string>`}\n`;
    }
    s = s.replace(/<\/dict>\s*<\/plist>\s*$/, `${add}</dict>\n</plist>\n`);
    return s;
  });
  edit(join(base, "ios/App/App.xcodeproj/project.pbxproj"), (s) =>
    s.replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${build};`)
     .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`));
} else {
  console.error("Usage : node scripts/native-config.mjs android|ios [build]");
  process.exit(1);
}
