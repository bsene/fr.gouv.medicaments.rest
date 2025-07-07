const { downloadDataIfNeeded } = require('../services/dataDownloader');

async function downloadInitialData() {
  try {
    console.log('Téléchargement initial des données...');
    await downloadDataIfNeeded();
    console.log('✓ Téléchargement terminé');
  } catch (error) {
    console.error('Erreur téléchargement initial:', error);
    process.exit(1);
  }
}

downloadInitialData();