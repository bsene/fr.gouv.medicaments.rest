const express = require('express');
const { getData, searchInData, getMetadata } = require('../services/dataLoader');

const router = express.Router();

function paginate(data, page = 1, limit = 100) {
  const offset = (page - 1) * limit;
  const paginatedData = data.slice(offset, offset + limit);
  const metadata = getMetadata();
  
  return {
    data: paginatedData,
    pagination: {
      total: data.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(data.length / limit)
    },
    metadata: {
      last_updated: metadata.last_updated,
      source: metadata.source
    }
  };
}

function sendResponse(res, data, pretty = false) {
  if (pretty === 'true' || pretty === '1') {
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(data, null, 2));
  } else {
    res.json(data);
  }
}

// GET /api/medicaments/specialites
router.get('/specialites', (req, res) => {
  const { q, page = 1, limit = 100, pretty } = req.query;
  let data = getData('specialites');
  
  if (q) {
    data = searchInData(data, q, ['denomination', 'forme_pharma', 'titulaire']);
  }
  
  sendResponse(res, paginate(data, page, limit), pretty);
});

// GET /api/medicaments/specialites/:cis
router.get('/specialites/:cis', (req, res) => {
  const { cis } = req.params;
  const { pretty } = req.query;
  const specialite = getData('specialites').find(item => item.cis === cis);
  
  if (!specialite) {
    return res.status(404).json({ error: 'Spécialité non trouvée' });
  }
  
  // Enrichir avec les données liées
  const presentations = getData('presentations').filter(p => p.cis === cis);
  const compositions = getData('compositions').filter(c => c.cis === cis);
  const avis_smr = getData('avis_smr').filter(a => a.cis === cis);
  const avis_asmr = getData('avis_asmr').filter(a => a.cis === cis);
  const conditions = getData('conditions').filter(c => c.cis === cis);
  
  const metadata = getMetadata();
  sendResponse(res, {
    ...specialite,
    presentations,
    compositions,
    avis_smr,
    avis_asmr,
    conditions,
    metadata: {
      last_updated: metadata.last_updated,
      source: metadata.source
    }
  }, pretty);
});

// GET /api/medicaments/presentations
router.get('/presentations', (req, res) => {
  const { q, page = 1, limit = 100, pretty } = req.query;
  let data = getData('presentations');
  
  if (q) {
    data = searchInData(data, q, ['libelle', 'cip7', 'cip13']);
  }
  
  sendResponse(res, paginate(data, page, limit), pretty);
});

// GET /api/medicaments/compositions
router.get('/compositions', (req, res) => {
  const { q, page = 1, limit = 100, pretty } = req.query;
  let data = getData('compositions');
  
  if (q) {
    data = searchInData(data, q, ['denomination_substance', 'dosage']);
  }
  
  sendResponse(res, paginate(data, page, limit), pretty);
});

// GET /api/medicaments/avis-smr
router.get('/avis-smr', (req, res) => {
  const { q, page = 1, limit = 100, pretty } = req.query;
  let data = getData('avis_smr');
  
  if (q) {
    data = searchInData(data, q, ['valeur_smr', 'libelle_smr']);
  }
  
  sendResponse(res, paginate(data, page, limit), pretty);
});

// GET /api/medicaments/avis-asmr
router.get('/avis-asmr', (req, res) => {
  const { q, page = 1, limit = 100, pretty } = req.query;
  let data = getData('avis_asmr');
  
  if (q) {
    data = searchInData(data, q, ['valeur_asmr', 'libelle_asmr']);
  }
  
  sendResponse(res, paginate(data, page, limit), pretty);
});

// GET /api/medicaments/groupes-generiques
router.get('/groupes-generiques', (req, res) => {
  const { q, page = 1, limit = 100, pretty } = req.query;
  let data = getData('generiques');
  
  if (q) {
    data = searchInData(data, q, ['libelle_groupe']);
  }
  
  sendResponse(res, paginate(data, page, limit), pretty);
});

// GET /api/medicaments/conditions
router.get('/conditions', (req, res) => {
  const { q, page = 1, limit = 100, pretty } = req.query;
  let data = getData('conditions');
  
  if (q) {
    data = searchInData(data, q, ['condition']);
  }
  
  sendResponse(res, paginate(data, page, limit), pretty);
});

// GET /api/medicaments/disponibilite
router.get('/disponibilite', (req, res) => {
  const { q, page = 1, limit = 100, pretty } = req.query;
  let data = getData('ruptures');
  
  if (q) {
    data = searchInData(data, q, ['libelle', 'motif']);
  }
  
  sendResponse(res, paginate(data, page, limit), pretty);
});

// GET /api/medicaments/interet-therapeutique-majeur
router.get('/interet-therapeutique-majeur', (req, res) => {
  const { q, page = 1, limit = 100, pretty } = req.query;
  let data = getData('mitm');
  
  if (q) {
    data = searchInData(data, q, ['denomination']);
  }
  
  sendResponse(res, paginate(data, page, limit), pretty);
});

// GET /api/medicaments/search - Recherche globale
router.get('/search', (req, res) => {
  const { q, page = 1, limit = 50, pretty } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Paramètre de recherche "q" requis' });
  }
  
  const specialites = searchInData(getData('specialites'), q, ['denomination', 'forme_pharma', 'titulaire']);
  const presentations = searchInData(getData('presentations'), q, ['libelle']);
  const compositions = searchInData(getData('compositions'), q, ['denomination_substance']);
  
  const results = [
    ...specialites.map(item => ({ ...item, type: 'specialite' })),
    ...presentations.map(item => ({ ...item, type: 'presentation' })),
    ...compositions.map(item => ({ ...item, type: 'composition' }))
  ];
  
  sendResponse(res, paginate(results, page, limit), pretty);
});

module.exports = router;