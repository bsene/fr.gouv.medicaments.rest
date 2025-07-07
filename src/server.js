const express = require('express');
const cors = require('cors');
const path = require('path');
const { downloadDataIfNeeded } = require('./services/dataDownloader');
const { loadData } = require('./services/dataLoader');
const medicamentRoutes = require('./routes/medicaments');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/medicaments', medicamentRoutes);

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Médicaments France</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .container { max-width: 900px; margin: 0 auto; }
            h1 { color: #2c5aa0; border-bottom: 3px solid #2c5aa0; padding-bottom: 10px; }
            h2 { color: #333; margin-top: 30px; }
            .endpoint { background: #f4f4f4; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .method { background: #4CAF50; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
            .url { font-family: monospace; background: #e8e8e8; padding: 2px 6px; border-radius: 3px; }
            .param { background: #fff3cd; padding: 2px 6px; border-radius: 3px; }
            .attribution { background: #d1ecf1; border-left: 4px solid #bee5eb; padding: 15px; margin: 20px 0; }
            .example { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 10px 0; }
            pre { background: #282c34; color: #abb2bf; padding: 15px; border-radius: 5px; overflow-x: auto; }
            .demo-section {
                margin-top: 10px;
                padding: 10px;
                background: #f8f9fa;
                border-left: 3px solid #007bff;
                border-radius: 0 5px 5px 0;
            }
            .demo-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 10px;
                background: #e9ecef;
                padding: 8px 12px;
                border-radius: 3px;
            }
            .demo-url { 
                font-family: monospace; 
                font-size: 14px;
                flex: 1;
                margin-right: 10px;
            }
            .demo-url::before {
                content: "Exemple: ";
                font-weight: bold;
                color: #007bff;
                font-family: Arial, sans-serif;
            }
            .run-button { 
                background: #28a745; 
                color: white; 
                border: none; 
                padding: 6px 12px; 
                border-radius: 3px; 
                cursor: pointer; 
                font-size: 12px;
                font-weight: bold;
            }
            .close-button {
                position: absolute;
                top: 5px;
                right: 5px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                border: none;
                padding: 2px 6px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                z-index: 10;
            }
            .run-button:hover { background: #218838; }
            .close-button:hover { background: rgba(0, 0, 0, 1); }
            .demo-content { 
                display: none; 
                margin-top: 10px;
            }
            .demo-result { 
                background: #282c34; 
                color: #abb2bf; 
                padding: 10px; 
                border-radius: 3px; 
                overflow-x: auto; 
                font-family: monospace; 
                font-size: 12px;
                max-height: 300px;
                overflow-y: auto;
                white-space: pre-wrap;
                position: relative;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏥 API Base de Données Publique des Médicaments</h1>
            
            <p>API REST publique pour accéder aux données officielles des médicaments en France.</p>
            
            <div class="attribution">
                <strong>Attribution:</strong> Cette API utilise la <a href="http://base-donnees-publique.medicaments.gouv.fr/" target="_blank">"base de données publique des médicaments"</a> fournie par le gouvernement français.
            </div>

            <h2>📋 Endpoints disponibles</h2>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/health</span><br>
                Status de l'API et informations de base
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/specialites</span><br>
                Liste des spécialités pharmaceutiques<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span> (recherche), 
                <span class="param">page</span> (défaut: 1), 
                <span class="param">limit</span> (défaut: 100),
                <span class="param">pretty</span> (formatage JSON)
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/specialites?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo1')">▶ Run</button>
                    </div>
                    <div id="demo1" class="demo-content">
                        <div class="demo-result" id="result1">
                            <button class="close-button" onclick="closeExample('demo1')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/specialites/:cis</span><br>
                Détail complet d'une spécialité avec toutes les données liées<br>
                <strong>Paramètres:</strong> <span class="param">pretty</span> (formatage JSON)
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/specialites/61266250?pretty=true</div>
                        <button class="run-button" onclick="runExample('demo2')">▶ Run</button>
                    </div>
                    <div id="demo2" class="demo-content">
                        <div class="demo-result" id="result2">
                            <button class="close-button" onclick="closeExample('demo2')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/presentations</span><br>
                Liste des présentations (conditionnements)<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/presentations?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo3')">▶ Run</button>
                    </div>
                    <div id="demo3" class="demo-content">
                        <div class="demo-result" id="result3">
                            <button class="close-button" onclick="closeExample('demo3')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/compositions</span><br>
                Compositions et principes actifs<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/compositions?q=paracetamol&limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo4')">▶ Run</button>
                    </div>
                    <div id="demo4" class="demo-content">
                        <div class="demo-result" id="result4">
                            <button class="close-button" onclick="closeExample('demo4')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/avis-smr</span><br>
                Avis SMR de la HAS<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/avis-smr?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo5')">▶ Run</button>
                    </div>
                    <div id="demo5" class="demo-content">
                        <div class="demo-result" id="result5">
                            <button class="close-button" onclick="closeExample('demo5')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/avis-asmr</span><br>
                Avis ASMR de la HAS<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/avis-asmr?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo6')">▶ Run</button>
                    </div>
                    <div id="demo6" class="demo-content">
                        <div class="demo-result" id="result6">
                            <button class="close-button" onclick="closeExample('demo6')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/groupes-generiques</span><br>
                Groupes génériques<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/groupes-generiques?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo7')">▶ Run</button>
                    </div>
                    <div id="demo7" class="demo-content">
                        <div class="demo-result" id="result7">
                            <button class="close-button" onclick="closeExample('demo7')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/conditions</span><br>
                Conditions de prescription et délivrance<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/conditions?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo8')">▶ Run</button>
                    </div>
                    <div id="demo8" class="demo-content">
                        <div class="demo-result" id="result8">
                            <button class="close-button" onclick="closeExample('demo8')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/disponibilite</span><br>
                Disponibilité et ruptures d'approvisionnement<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/disponibilite?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo9')">▶ Run</button>
                    </div>
                    <div id="demo9" class="demo-content">
                        <div class="demo-result" id="result9">
                            <button class="close-button" onclick="closeExample('demo9')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/interet-therapeutique-majeur</span><br>
                Médicaments d'intérêt thérapeutique majeur (MITM)<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/interet-therapeutique-majeur?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo10')">▶ Run</button>
                    </div>
                    <div id="demo10" class="demo-content">
                        <div class="demo-result" id="result10">
                            <button class="close-button" onclick="closeExample('demo10')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/search</span><br>
                Recherche globale dans toutes les données<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span> (requis), <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/search?q=doliprane&limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo11')">▶ Run</button>
                    </div>
                    <div id="demo11" class="demo-content">
                        <div class="demo-result" id="result11">
                            <button class="close-button" onclick="closeExample('demo11')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <h2>🔍 Recherche avec wildcards</h2>
            <p>Vous pouvez utiliser des wildcards dans vos recherches :</p>
            <ul>
                <li><strong>*</strong> - remplace plusieurs caractères</li>
                <li><strong>?</strong> - remplace un seul caractère</li>
            </ul>

            <h2>✨ Formatage JSON</h2>
            <p>Ajoutez le paramètre <span class="param">pretty=true</span> ou <span class="param">pretty=1</span> pour obtenir un JSON formaté et indenté, idéal pour la lecture humaine.</p>

            <h2>📝 Exemples d'utilisation</h2>

            <div class="example">
                <strong>Rechercher tous les médicaments contenant "doliprane" :</strong><br>
                <span class="url">GET /api/medicaments/specialites?q=doliprane*</span>
            </div>

            <div class="example">
                <strong>Rechercher des comprimés :</strong><br>
                <span class="url">GET /api/medicaments/presentations?q=*comprimé*</span>
            </div>

            <div class="example">
                <strong>Rechercher du paracétamol :</strong><br>
                <span class="url">GET /api/medicaments/compositions?q=paracetamol</span>
            </div>

            <div class="example">
                <strong>Voir les ruptures de stock :</strong><br>
                <span class="url">GET /api/medicaments/disponibilite?q=rupture</span>
            </div>

            <div class="example">
                <strong>Recherche globale :</strong><br>
                <span class="url">GET /api/medicaments/search?q=aspirine</span>
            </div>

            <div class="example">
                <strong>Avec formatage JSON :</strong><br>
                <span class="url">GET /api/medicaments/specialites?q=doliprane&pretty=true</span>
            </div>

            <h2>📄 Format de réponse</h2>
            <p>Toutes les réponses sont au format JSON avec pagination et métadonnées :</p>
            <pre>{
  "data": [...],
  "pagination": {
    "total": 1234,
    "page": 1,
    "limit": 100,
    "pages": 13
  },
  "metadata": {
    "last_updated": "2024-07-07T10:30:00.000Z",
    "source": "base de données publique des médicaments - gouv.fr"
  }
}</pre>

            <h2>ℹ️ Informations techniques</h2>
            <ul>
                <li><strong>Format :</strong> JSON</li>
                <li><strong>Authentification :</strong> Aucune</li>
                <li><strong>CORS :</strong> Activé</li>
                <li><strong>Mise à jour :</strong> Automatique toutes les 24h</li>
                <li><strong>Limite par page :</strong> 1000 maximum</li>
            </ul>

            <h2>🔗 Liens utiles</h2>
            <ul>
                <li><a href="/api/health">Status de l'API</a></li>
                <li><a href="/api/medicaments/specialites?limit=5">Exemple: 5 spécialités</a></li>
                <li><a href="/api/medicaments/specialites?limit=3&pretty=true">Exemple: 3 spécialités (formaté)</a></li>
                <li><a href="/api/medicaments/disponibilite?limit=5">Exemple: Disponibilité</a></li>
                <li><a href="/api/medicaments/avis-smr?limit=3">Exemple: Avis SMR</a></li>
                <li><a href="/api/medicaments/search?q=doliprane">Exemple: Recherche Doliprane</a></li>
                <li><a href="http://base-donnees-publique.medicaments.gouv.fr/" target="_blank">Source officielle des données</a></li>
            </ul>
        </div>
        
        <script>
            const demoUrls = {
                'demo1': '/api/medicaments/specialites?limit=2&pretty=true',
                'demo2': '/api/medicaments/specialites/61266250?pretty=true',
                'demo3': '/api/medicaments/presentations?limit=2&pretty=true',
                'demo4': '/api/medicaments/compositions?q=paracetamol&limit=2&pretty=true',
                'demo5': '/api/medicaments/avis-smr?limit=2&pretty=true',
                'demo6': '/api/medicaments/avis-asmr?limit=2&pretty=true',
                'demo7': '/api/medicaments/groupes-generiques?limit=2&pretty=true',
                'demo8': '/api/medicaments/conditions?limit=2&pretty=true',
                'demo9': '/api/medicaments/disponibilite?limit=2&pretty=true',
                'demo10': '/api/medicaments/interet-therapeutique-majeur?limit=2&pretty=true',
                'demo11': '/api/medicaments/search?q=doliprane&limit=2&pretty=true'
            };

            function runExample(demoId) {
                const demoContent = document.getElementById(demoId);
                const resultDiv = document.getElementById('result' + demoId.replace('demo', ''));
                
                // Afficher le contenu s'il est caché
                if (demoContent.style.display === 'none' || demoContent.style.display === '') {
                    demoContent.style.display = 'block';
                }
                
                // Charger l'exemple
                loadExample(demoId, resultDiv);
            }

            function closeExample(demoId) {
                const demoContent = document.getElementById(demoId);
                demoContent.style.display = 'none';
            }

            async function loadExample(demoId, resultDiv) {
                try {
                    resultDiv.textContent = 'Chargement...';
                    const response = await fetch(demoUrls[demoId]);
                    
                    if (!response.ok) {
                        throw new Error(\`HTTP \${response.status}\`);
                    }
                    
                    // Récupérer le JSON et le formater proprement
                    const jsonData = await response.json();
                    // Utiliser innerText pour préserver les retours à la ligne
                    resultDiv.innerText = JSON.stringify(jsonData, null, 2);
                } catch (error) {
                    resultDiv.textContent = \`Erreur: \${error.message}\`;
                }
            }
        </script>
    </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  const { getMetadata } = require('./services/dataLoader');
  const metadata = getMetadata();
  const { pretty } = req.query;
  
  const responseData = { 
    status: 'ok', 
    message: 'API des médicaments française',
    attribution: 'base de données publique des médicaments - gouv.fr',
    metadata: {
      last_updated: metadata.last_updated,
      source: metadata.source
    }
  };

  if (pretty === 'true' || pretty === '1') {
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(responseData, null, 2));
  } else {
    res.json(responseData);
  }
});

async function startServer() {
  try {
    console.log('Vérification et téléchargement des données...');
    await downloadDataIfNeeded();
    
    console.log('Chargement des données en mémoire...');
    await loadData();
    
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Erreur au démarrage:', error);
    process.exit(1);
  }
}

startServer();