const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const BASE_URL = 'https://base-donnees-publique.medicaments.gouv.fr/telechargement.php';

const FILES = [
  'CIS_bdpm.txt',
  'CIS_CIP_bdpm.txt', 
  'CIS_COMPO_bdpm.txt',
  'CIS_HAS_SMR_bdpm.txt',
  'CIS_HAS_ASMR_bdpm.txt',
  'CIS_GENER_bdpm.txt',
  'CIS_CPD_bdpm.txt',
  'CIS_CIP_Dispo_Spec.txt',
  'CIS_MITM.txt'
];

async function downloadFile(filename) {
  const url = `${BASE_URL}?fichier=${filename}`;
  const filepath = path.join(DATA_DIR, filename);
  
  try {
    console.log(`Téléchargement de ${filename}...`);
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    });
    
    await fs.ensureDir(DATA_DIR);
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Erreur téléchargement ${filename}:`, error.message);
    throw error;
  }
}

function isFileOlderThan24Hours(filepath) {
  try {
    const stats = fs.statSync(filepath);
    const now = new Date();
    const fileTime = new Date(stats.mtime);
    const diffHours = (now - fileTime) / (1000 * 60 * 60);
    return diffHours > 24;
  } catch (error) {
    return true; // File doesn't exist, needs download
  }
}

async function downloadDataIfNeeded() {
  await fs.ensureDir(DATA_DIR);
  
  for (const filename of FILES) {
    const filepath = path.join(DATA_DIR, filename);
    
    if (!fs.existsSync(filepath) || isFileOlderThan24Hours(filepath)) {
      try {
        await downloadFile(filename);
        console.log(`✓ ${filename} téléchargé`);
      } catch (error) {
        console.error(`✗ Échec téléchargement ${filename}:`, error.message);
        if (!fs.existsSync(filepath)) {
          throw new Error(`Fichier requis ${filename} non disponible`);
        }
        console.log(`Utilisation de l'ancienne version de ${filename}`);
      }
    } else {
      console.log(`✓ ${filename} à jour`);
    }
  }
}

module.exports = { downloadDataIfNeeded };