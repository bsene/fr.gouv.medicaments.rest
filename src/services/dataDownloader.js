import axios from "axios";
import * as path from "jsr:@std/path";
import { exists } from "jsr:@std/fs/exists";

const dirname = import.meta.dirname;

const DATA_DIR = path.join(dirname, "../../data");
const META_FILE = path.join(DATA_DIR, "meta.json");
const BASE_URL =
  "https://base-donnees-publique.medicaments.gouv.fr/telechargement.php";

const FILES = [
  "CIS_bdpm.txt",
  "CIS_CIP_bdpm.txt",
  "CIS_COMPO_bdpm.txt",
  "CIS_HAS_SMR_bdpm.txt",
  "CIS_HAS_ASMR_bdpm.txt",
  "CIS_GENER_bdpm.txt",
  "CIS_CPD_bdpm.txt",
  "CIS_CIP_Dispo_Spec.txt",
  "CIS_MITM.txt",
];

async function loadMetadata() {
  try {
    if (await exists(META_FILE)) {
      const file = await Deno.readTextFile(META_FILE);
      const data = JSON.parse(file);
      return data;
    }
  } catch (error) {
    console.error("Erreur lors du chargement des métadonnées:", error.message);
  }
  return {};
}

async function saveMetadata(metadata) {
  try {
    Deno, readDir(DATA_DIR);
    await Deno.writeTextFile(META_FILE, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error(
      "Erreur lors de la sauvegarde des métadonnées:",
      error.message,
    );
  }
}

async function checkAndConvertToUTF8(filepath) {
  try {
    // Vérifier l'encodage du fichier
    const command = new Deno.command(`file -b --mime-encoding "${filepath}"`);
    const { stdout } = command.output();
    const encoding = new TextDecoder().decode(stdout).trim();

    if (encoding !== "utf-8" && encoding !== "us-ascii") {
      console.log(
        `  → Conversion de ${
          path.basename(filepath)
        } de ${encoding} vers UTF-8...`,
      );

      // Créer une copie temporaire
      const tempFile = filepath + ".tmp";

      // Déterminer l'encodage source
      let sourceEncoding = encoding;
      if (encoding === "unknown-8bit" || encoding === "binary") {
        // Essayer de détecter si c'est du latin1 ou windows-1252
        sourceEncoding = "ISO-8859-1";
      }

      try {
        // Convertir le fichier en UTF-8
        new Deno.command(
          `iconv -f ${sourceEncoding} -t UTF-8 "${filepath}" > "${tempFile}"`,
        );

        // Remplacer le fichier original
        await Deno.rename(tempFile, filepath);
        console.log(`  ✓ Conversion réussie`);
      } catch (_) {
        console.log(`  → Tentative avec encodage windows-1252...`);
        try {
          new Deno.command(
            `iconv -f windows-1252 -t UTF-8 "${filepath}" > "${tempFile}"`,
          );
          await Deno, rename(tempFile, filepath);
          console.log(`  ✓ Conversion réussie avec windows-1252`);
        } catch (_) {
          console.error(
            `  ✗ Impossible de convertir le fichier, il sera utilisé tel quel`,
          );
          // Nettoyer le fichier temporaire s'il existe
          await Deno.remove(tempFile).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error(
      `  ✗ Erreur lors de la vérification/conversion de l'encodage:`,
      error.message,
    );
  }
}

async function downloadFile(filename) {
  const url = `${BASE_URL}?fichier=${filename}`;
  const filepath = path.join(DATA_DIR, filename);

  try {
    console.log(`Téléchargement de ${filename}...`);
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 30000,
    });

    Deno.readDir(DATA_DIR);
    const file = await Deno.open(filepath, {
      create: true,
      append: true,
    });

    const writer = file.writable.getWriter();
    writer.ready;
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Vérifier et convertir en UTF-8 si nécessaire
    await checkAndConvertToUTF8(filepath);
  } catch (error) {
    console.error(`Erreur téléchargement ${filename}:`, error.message);
    throw error;
  }
}

async function isFileOlderThan24Hours(filepath, filename) {
  const metadata = await loadMetadata();

  // Vérifier d'abord dans les métadonnées
  if (metadata[filename] && metadata[filename].downloadedAt) {
    const downloadTime = new Date(metadata[filename].downloadedAt);
    const now = new Date();
    const diffHours = (now - downloadTime) / (1000 * 60 * 60);
    return diffHours > 24;
  }

  // Si pas de métadonnées, vérifier le fichier physique
  try {
    const stats = Deno.statSync(filepath);
    const now = new Date();
    const fileTime = new Date(stats.mtime);
    const diffHours = (now - fileTime) / (1000 * 60 * 60);
    return diffHours > 24;
  } catch (_) {
    return true; // File doesn't exist, needs download
  }
}

export async function downloadDataIfNeeded() {
  Deno.readDir(DATA_DIR);
  const metadata = await loadMetadata();
  let metadataUpdated = false;

  for (const filename of FILES) {
    const filepath = path.join(DATA_DIR, filename);

    if (
      !(await exists(filepath)) ||
      await isFileOlderThan24Hours(filepath, filename)
    ) {
      try {
        await downloadFile(filename);
        console.log(`✓ ${filename} téléchargé`);

        // Mettre à jour les métadonnées
        metadata[filename] = {
          downloadedAt: new Date().toISOString(),
          source: "remote",
          encoding: "utf-8", // Le fichier a été converti lors du téléchargement
        };
        metadataUpdated = true;
      } catch (error) {
        console.error(`✗ Échec téléchargement ${filename}:`, error.message);
        if (!(await exists(filepath))) {
          console.log(
            `Le fichier ${filename} n'existe pas localement et le téléchargement a échoué`,
          );
          console.log(
            `Le service utilisera les fichiers inclus dans le repository`,
          );
        } else {
          console.log(`Utilisation de l'ancienne version de ${filename}`);
        }
      }
    } else {
      console.log(`✓ ${filename} à jour`);

      // S'assurer que les métadonnées existent
      if (!metadata[filename]) {
        // Première fois qu'on voit ce fichier, vérifier l'encodage
        await checkAndConvertToUTF8(filepath);
        metadata[filename] = {
          downloadedAt: new Date(Deno.statSync(filepath).mtime).toISOString(),
          source: "existing",
          encoding: "utf-8", // Après conversion
        };
        metadataUpdated = true;
      } else if (
        !metadata[filename].encoding || metadata[filename].encoding !== "utf-8"
      ) {
        // Le fichier existe mais n'a pas été converti en UTF-8
        await checkAndConvertToUTF8(filepath);
        metadata[filename].encoding = "utf-8";
        metadataUpdated = true;
      }
      // Si les métadonnées existent et l'encodage est UTF-8, on ne fait rien
    }
  }

  // Sauvegarder les métadonnées si nécessaire
  if (metadataUpdated) {
    await saveMetadata(metadata);
  }
}
