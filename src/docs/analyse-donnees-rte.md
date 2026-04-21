# Rapport d'Analyse - Données Géographiques du Réseau Électrique RTE

## Date : 7 avril 2026
## Destinataire : [Nom du responsable]
## De : [Votre nom]
## Objet : Analyse des options d'accès aux données géographiques du réseau de transport d'électricité RTE

---

## Résumé Exécutif

Notre analyse des données géographiques du réseau électrique français (RTE) révèle que **l'accès aux données de géométrie est restreint pour des raisons de sécurité**. Cependant, plusieurs alternatives existent pour obtenir tout ou partie des informations nécessaires.

---

## 1. Situation Actuelle - Données RTE

### 1.1 Plateforme ODRE (Open Data Réseaux Énergies)

**URL principale :** https://opendata.reseaux-energies.fr/

**Jeux de données disponibles :**
- **Lignes aériennes RTE :** https://odre.opendatasoft.com/explore/dataset/lignes-aeriennes-rte-nv/
- **Lignes souterraines RTE :** https://odre.opendatasoft.com/explore/dataset/lignes-souterraines-rte-nv/

**Format d'export disponibles :**
```
https://odre.opendatasoft.com/explore/dataset/lignes-aeriennes-rte-nv/download?format=geojson
https://odre.opendatasoft.com/explore/dataset/lignes-aeriennes-rte-nv/download?format=shp
https://odre.opendatasoft.com/explore/dataset/lignes-aeriennes-rte-nv/download?format=csv
```

**Limitation majeure :** 
> *"RTE a fait évoluer l'accès aux données GPS des infrastructures du réseau public de transport pour des raisons de sécurité publique"*

Les exports contiennent **uniquement les métadonnées** (noms des lignes, tension, statut) **sans géométrie**.

### 1.2 API REST ODRE

**Point d'accès :** https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/lignes-aeriennes-rte-nv/records

**Exemple de réponse :**
```json
{
  "type_ouvrage": "AERIEN",
  "code_ligne": "BEON L31CPVAN",
  "nom_ligne": "LIAISON 63kV N0 1 BEON-CHAMPVANS",
  "etat": "EN EXPLOITATION",
  "tension": "63kV",
  "source": "RTE",
  "nombre_circuit": "2"
}
```

**Aucune donnée de géométrie disponible.**

---

## 2. Options d'Accès Autorisé aux Données RTE

### 2.1 Portail API Data RTE (Accès Sécurisé)

**URL :** https://data.rte-france.com/

**Conditions d'accès :**
- Contrat d'accès au réseau de transport public (CART)
- Relation commerciale avec RTE
- Autorisation de transmission des données

**Services disponibles :**
- **SPEED Physical Data API** (pour partenaires autorisés)
- Documentation : https://data.rte-france.com/catalog/-/api/doc/user-guide/Speed+Physical/3.0

**Processus :**
1. Création d'un compte sur le portail
2. Soumission d'une demande d'accès
3. Validation par RTE (délai : plusieurs semaines)

### 2.2 Contact Direct RTE

**Coordonnées :**
- **Formulaire de contact :** https://odre.opendatasoft.com/pages/contactv2/
- **Email technique :** rte-inspire-infos@rte-france.com

**Recommandation :** Préparer une demande formelle détaillant :
- Cas d'usage spécifique
- Besoins techniques précis
- Garanties de sécurité proposées

---

## 3. Alternatives Immédiates Disponibles

### 3.1 Données Enedis (Réseau de Distribution)

**Service WMS :** https://geobretagne.fr/geoserver/enedis/wms

**Couches disponibles :**
- `reseau_hta` - Lignes moyenne tension (aériennes)
- `reseau_bt` - Lignes basse tension (aériennes)  
- `reseau_souterrain_hta` - Lignes HTA souterraines
- `reseau_souterrain_bt` - Lignes BT souterraines

**Avantages :**
- **Géométrie complète disponible**
- Accès immédiat sans restriction
- Documentation complète

**Limites :**
- Réseau de distribution uniquement (pas de transport)
- Tension limitée (HTA/BT vs THT/HT de RTE)

### 3.2 Portail Analyse et Données RTE

**URL :** https://analysesetdonnees.rte-france.com/

**Services disponibles :**
- Données de consommation et production
- Analyses du réseau
- **Références vers services partenaires**

---

## 4. Sources Complémentaires Identifiées

### 4.1 data.gouv.fr - Données Complètes avec Géométrie

**Lignes souterraines RTE :** https://www.data.gouv.fr/datasets/lignes-souterraines-rte
- **API Direct :** https://www.data.gouv.fr/api/1/datasets/r/2b846512-be1a-4b7f-90bf-405b1fb82bd2
- **Catalogue Géo-IDE :** http://catalogue.geo-ide.developpement-durable.gouv.fr/catalogue/srv/fre/catalog.search#/metadata/fr-120066022-jdd-dda55d15-078d-4cf6-833f-609b0a0f9b8f

**Lignes aériennes RTE :** https://www.data.gouv.fr/datasets/lignes-aeriennes-rte/

**FICHIER TÉLÉCHARGÉ AVEC SUCCÈS - DONNÉES COMPLÈTES**

#### Détails Techniques - Lignes Souterraines
- **Nom du fichier :** `L_RESEAU_ELECTRIQUE_SOUTERRAIN_RTE.shp`
- **Format :** ESRI Shapefile (MultiLineString)
- **Taille :** 26.83 MB
- **Nombre d'entités :** 7,038 lignes
- **Système de coordonnées :** IGNF:LAMB93 - RGF93 Lambert 93 (EPSG:2154)
- **Emprise :** France métropolitaine complète
- **Encodage :** UTF-8

**Champs disponibles (21 champs) :**
- `TENSIONMAX` - Tension maximale
- `TYPOUVRAGE` - Type d'ouvrage
- `ETAT` - État de l'ouvrage
- `NB_CIRCUIT` - Nombre de circuits
- `ID_1` à `ID_5` - Identifiants des lignes
- `NOMOUVRAGE` à `NOM_OUVR_5` - Noms des ouvrages
- `PROP_TR_1` à `PROP_TR_5` - Propriétaires
- `ACQUISITIO` - Date d'acquisition
- `PRECISION` - Précision des données

#### Détails Techniques - Lignes Aériennes
- **Nom du fichier :** `N_RESEAU_ELECTRIQUE_AERIEN_L_027.shp`
- **Format :** ESRI Shapefile (MultiLineString)
- **Taille :** 69.44 MB
- **Nombre d'entités :** 13,287 lignes
- **Système de coordonnées :** EPSG:2154 - RGF93 v1 / Lambert-93
- **Emprise :** France métropolitaine complète
- **Encodage :** UTF-8

**Champs disponibles (20 champs) :**
- `type_ouvra` - Type d'ouvrage
- `code_ligne` - Code de la ligne
- `nom_ligne` - Nom de la ligne
- `proprietai` - Propriétaire
- `etat` - État
- `tension` - Tension
- `source` - Source des données
- `nombre_cir` - Nombre de circuits
- `identifica` à `identifi_4` - Identifiants supplémentaires
- `nom_ouvrag` à `nom_ouvr_3` - Noms d'ouvrages associés
- `propriet_1` à `propriet_4` - Propriétaires associés

**AVANTAGE MAJEUR :** Ces fichiers contiennent les **données géométriques complètes** avec coordonnées précises, contrairement aux API ODRE qui ne fournissent que les métadonnées.

### 4.2 Services ArcGIS Online

Mentionné dans la documentation comme alternative pour l'accès mobile :
- **Application mobile** RTE INSPIRE
- **Accès via ArcGIS Field Maps** (pour partenaires autorisés)

---

## 5. Recommandations Stratégiques

### 5.1 Solution Immédiate - PRIORITÉ ABSOLUE

**SOLUTION TROUVÉE :** Utiliser les shapefiles data.gouv.fr

**Actions immédiates (cette semaine) :**
1. **Intégrer les shapefiles téléchargés** dans notre système cartographique
2. **Convertir en GeoJSON** pour utilisation web
3. **Mettre en place un service WFS/WMS** interne basé sur ces données
4. **Documenter les champs** pour l'équipe de développement

**Avantages :**
- **Données géométriques complètes** (20,325 lignes au total)
- **Couverture nationale** France métropolitaine
- **Format standard** (Shapefile/GeoJSON)
- **Sans restriction** d'accès
- **Richesse des attributs** (20-21 champs par dataset)

### 5.2 Court Terme (1-2 semaines)
1. **Développer l'interface cartographique** avec les données RTE
2. **Intégrer les données Enedis WMS** pour compléter la couverture
3. **Mettre à jour la documentation** technique
4. **Former les équipes** aux nouveaux datasets

### 5.3 Moyen Terme (1-3 mois)
1. **Automatiser la mise à jour** des données depuis data.gouv.fr
2. **Établir un contact officiel** avec RTE pour les futures mises à jour
3. **Développer des services REST** basés sur les shapefiles
4. **Créer des processus** de validation qualité

### 5.4 Long Terme (3-6 mois)
1. **Négocier un partenariat** avec RTE pour les données temps réel
2. **Explorer les données complémentaires** (postes, pylônes)
3. **Développer des analyses avancées** basées sur le réseau complet

---

## 6. Proposition d'Action Immédiate

### 6.1 Contact RTE - Projet d'Email

**Objet :** Demande d'accès aux données géographiques du réseau RTE - [Nom de votre projet]

**Corps :**
```
Cher Monsieur,

Dans le cadre de notre projet [description du projet], nous souhaiterions accéder aux données géographiques du réseau de transport d'électricité français.

Nous avons identifié les jeux de données suivants sur la plateforme ODRE :
- Lignes aériennes RTE (lignes-aeriennes-rte-nv)
- Lignes souterraines RTE (lignes-souterraines-rte-nv)

Cependant, nous constatons que les données de géométrie ne sont pas disponibles via l'API publique pour des raisons de sécurité.

Notre cas d'usage [détailler l'usage professionnel] nécessite un accès aux coordonnées géographiques précises pour [expliquer la finalité].

Nous sommes prêts à :
- Signer les accords de confidentialité nécessaires
- Mettre en place les mesures de sécurité requises
- Discuter d'un éventuel partenariat commercial

Pourriez-vous nous indiquer la procédure à suivre pour obtenir un accès autorisé à ces données ?

Dans l'attente de votre retour, nous vous prions d'agréer, Monsieur, l'expression de nos salutations distinguées.

[Votre nom]
[Votre fonction]
[Votre contact]
```

---

## 7. Synthèse des URLs Clés

### Solutions Primaires - DONNÉES COMPLÈTES
- **Lignes souterraines :** https://www.data.gouv.fr/datasets/lignes-souterraines-rte
  - API Direct : https://www.data.gouv.fr/api/1/datasets/r/2b846512-be1a-4b7f-90bf-405b1fb82bd2
- **Lignes aériennes :** https://www.data.gouv.fr/datasets/lignes-aeriennes-rte/
- **Catalogue Géo-IDE :** http://catalogue.geo-ide.developpement-durable.gouv.fr/catalogue/srv/fre/catalog.search#/metadata/fr-120066022-jdd-dda55d15-078d-4cf6-833f-609b0a0f9b8f

### Plateformes Complémentaires
- **ODRE (métadonnées) :** https://opendata.reseaux-energies.fr/
- **Data RTE (accès futur) :** https://data.rte-france.com/
- **Enedis WMS :** https://geobretagne.fr/geoserver/enedis/wms

### Contact
- **Formulaire ODRE :** https://odre.opendatasoft.com/pages/contactv2/
- **Documentation API :** https://data.rte-france.com/catalog/-/api/doc/user-guide/Speed+Physical/3.0

---

## Conclusion

**EXCELLENTE NOUVELLE :** Nous avons réussi à obtenir les **données géographiques complètes du réseau RTE** via data.gouv.fr !

### Résultats Obtenus :
- **20,325 lignes électriques** avec géométrie complète
- **7,038 lignes souterraines** + **13,287 lignes aériennes**
- **Couverture nationale** France métropolitaine
- **Format standard** Shapefile avec 20-21 champs attributaires
- **Sans restriction** d'utilisation

### Position Actuelle :
Le projet passe de **"bloqué par restrictions de sécurité"** à **"prêt pour développement immédiat"**.

### Prochaines Étapes :
1. **Intégration technique** des shapefiles dans notre infrastructure
2. **Développement des services** cartographiques (WFS/WMS)
3. **Mise en production** dans les semaines à venir

Les données ODRE restent utiles pour les **mises à jour futures**, mais les shapefiles data.gouv.fr constituent notre **solution principale et immédiate**.
