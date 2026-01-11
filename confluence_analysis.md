# Comprehensive Technical Analysis: CPR0002783 - Trace Long-term Unavailable Products (DE/FR)

## 1. Contexte Commercial (Obligatoire)
Le présent CPR vise à étendre la logique de gestion des produits indisponibles à long terme, actuellement en vigueur sur le marché allemand (DE), au marché français (FR). L'objectif est d'automatiser l'exclusion de ces produits lors de la création des positions de livraison (`tkdauftragpos`). 

Cette initiative répond directement à un incident majeur survenu le **01.07.2025**, où l'absence de traçabilité des produits indisponibles en France a entraîné des erreurs de livraison critiques. L'intégration garantit la conformité avec les processus de distribution locaux et optimise la fiabilité de la chaîne d'approvisionnement.

## 2. Processus et Analyse Technique (Obligatoire)
Le processus repose sur l'identification d'articles "Long-Term Lack" (LTL) via plusieurs critères techniques, consolidés dans la table `longtermlack`.

### 2.1 Critères d'Indisponibilité (Hérités de DE)
- **Stock Nul** : Articles avec `sum(bestand) == 0`.
- **Substitution** : Articles alternatifs avec stock disponible.
- **Pseudo-Articles** : Exclusion basée sur des numéros de casier spécifiques (`lagerfachnr`).
- **Status Actif** : Vérification des tags d'activation (`kzaktivpassiv`).

### 2.2 Adaptations Spécifiques pour la France
Pour le marché français, les critères sont affinés pour inclure :
- **Gestion des PZN** : Identification spécifique des produits via le numéro national français.
- **Tags d'Activation Localisés** : Utilisation de `artikelaktiv` pour le filtrage spécifique aux branches FR.
- **Filtrage par Branche** : Contrairement à l'Allemagne, la France nécessite une granularité par branche pour éviter des exclusions globales non justifiées.

## 3. Modèle de Données et Infrastructure SQL
L'inspection des serveurs Informix (DE et FR) confirme l'architecture suivante :

### 3.1 Table `longtermlack`
- `articleno` (int) : Identifiant unique de l'article.
- `messagecode` (int) : Code d'erreur/raison de l'indisponibilité.
- `enabled` (smallint) : Flag d'activation (0 = Inactif, >0 = Actif).
*Note: Actuellement, la table ne contient pas de colonne `branch_code`, ce qui impose une logique applicative ou une extension de schéma.*

### 3.2 Tables de Référence
- `filiale` : Contient les informations de branche (`filialnr`, `regionno`).
- `kdauftragpos` : Table cible où l'exclusion doit être appliquée lors de la réservation de stock.

## 4. Architecture de l'Implémentation
L'implémentation suit un modèle de dépôt (Repository Pattern) découplé.

### 4.1 Détection du Pays (`pxSession`)
Utilisation des constantes `COUNTRY_FRANCE ("FR")` et `COUNTRY_FRANCE_PREWHOLE ("PF")` pour aiguiller la logique.

### 4.2 Composants Impactés
- **`itmstock.cpp`** : Point d'entrée de la logique de réservation. Injection du contrôle LTL si `RestrictionType == 3`.
- **`LongTermLackRepository`** : Extension de la méthode `isLongTermLack` pour supporter le contexte de branche/pays.
- **`LongTermLackSQLMapper`** : Mise à jour du mapping SQL pour inclure les filtres de branche.

## 5. Preuves du Code et Correspondance
| Exigence CPR | Preuve Technique / Fichier |
| :--- | :--- |
| **Extension à la France** | `session.cpp` (pxSession::COUNTRY_FRANCE = "FR") |
| **Exclusion Automatique** | `itmstock.cpp` (Retourne `Status_LongTermUnavailable`) |
| **Traçabilité SQL** | `longtermlacksqlmapper.cpp` (Query count sur `longtermlack`) |

## 6. Conclusion
L'analyse synthétisée confirme que l'infrastructure est prête pour le déploiement. L'approche choisie permet une cohabitation fluide entre les marchés DE et FR tout en résolvant les points de douleur identifiés lors de l'incident de juillet 2025.
