# Analyse du CPR0002783 - Détails de l'Analyse - NTTD

## Contexte Commercial (obligatoire) :

Le présent CPR vise à étendre la logique de gestion des produits indisponibles à long terme, actuellement en vigueur en Allemagne, au marché français. L'objectif est d'empêcher l'utilisation de ces produits pour les livraisons ultérieures, garantissant ainsi la conformité avec les réglementations locales et optimisant la gestion des stocks. Cette adaptation est cruciale suite à un incident majeur survenu le 01.07.2025, nécessitant une traçabilité et une gestion plus rigoureuse des produits.

## Processus (obligatoire) :

Le processus implique l'identification des articles considérés comme "indisponibles à long terme" et leur exclusion des circuits de livraison ultérieure. La logique existante en Allemagne repose sur plusieurs critères pour déterminer cette indisponibilité. Pour la France, des adaptations seront nécessaires pour intégrer des critères spécifiques au marché, tels que la gestion des PZN (numéros d'identification des produits pharmaceutiques) et des tags d'activation.

Le processus actuel en Allemagne, tel qu'identifié dans le code, inclut les étapes suivantes :

1.  **Identification des articles sans stock :** Les articles dont la somme du stock (`sum(bestand)`) est égale à zéro sont considérés comme indisponibles. (Référence : `ArticlesWithoutStockPreparer` dans `longtermlackacc.cpp`)
2.  **Identification des articles de substitution avec stock :** Les articles alternatifs qui ont du stock sont également pris en compte. (Référence : `SubstitutionArticlesWithStockPreparer` dans `longtermlackacc.cpp`)
3.  **Identification des articles "pseudo" :** Certains articles avec des numéros de casier spécifiques (`lagerfachnr`) sont traités comme des articles "pseudo" et peuvent être exclus. (Référence : `PseudoArticlesPreparer` dans `longtermlackacc.cpp`)
4.  **Identification des articles avec tag d'activation :** Les articles avec un tag d'activation spécifique (`artikelaktiv`) sont également considérés. (Référence : `ArticlesWithActivationTagPreparer` dans `longtermlackacc.cpp`)
5.  **Identification des articles réimportés :** Les articles réimportés avec un statut actif (`kzaktivpassiv = 1`) sont également traités. (Référence : `ArticlesReImportPreparer` dans `longtermlackacc.cpp`)
6.  **Identification des articles réservés :** Les articles ayant une quantité réservée (`reservedqty > 0`) et un type de réservation spécifique (`reservtype = 0` ou `reservtype = 2`) sont également pris en compte. (Référence : `ReservedArticlesPreparer` dans `longtermlackacc.cpp`)

Ces articles sont ensuite insérés dans la table `longtermlack` ou supprimés de celle-ci en fonction de leur statut. (Référence : `LongTermLackInserter` et `LongTermLackEraser` dans `longtermlackacc.cpp`)

## Modèle de Données / Tables de Base de Données (facultatif si la base de données est impliquée et/ou doit être modifiée) :

La table principale impliquée est `longtermlack`, qui stocke les numéros d'articles (`articleno`), un code de message (`messagecode`) et un indicateur d'activation (`enabled`).

Les requêtes SQL utilisées pour gérer cette table sont définies dans `longtermlacksqlmapper.cpp` et `longtermlackacc.cpp` :

*   **`getDeleteSQL` :** Supprime les entrées de `longtermlack` pour un `articleno` donné. (Référence : `longtermlacksqlmapper.cpp`)
*   **`getSelectSQL` :** Compte le nombre d'articles indisponibles à long terme pour un `articleno` donné, en excluant ceux dont le statut est `ARTICLE_UNPROCESSIBLE`. (Référence : `longtermlacksqlmapper.cpp`)
*   **`LongTermLackEraser` :** Supprime les articles de la table `longtermlack` qui ne sont pas présents dans une table source temporaire, ou tronque la table `longtermlack` si une stratégie de persistance est activée. (Référence : `longtermlackacc.cpp`)
*   **`LongTermLackInserter` :** Insère de nouveaux articles dans la table `longtermlack` à partir d'une table source temporaire. (Référence : `longtermlackacc.cpp`)

Les tables `artikellokal`, `artikel_alternative`, `artikel_reimport` et `article_reservation` sont également utilisées pour identifier les articles à inclure ou exclure de la table `longtermlack`.

## Frontend - Windows/Citrix (facultatif si un Frontend est impliqué et/ou doit être modifié) :

Non applicable directement pour cette analyse, car le CPR concerne principalement la logique métier backend. Cependant, toute modification de la logique d'indisponibilité des produits pourrait avoir un impact sur l'affichage des produits dans les applications frontend.

## Backend - AIX / Serveur Web Windows (facultatif si un Backend est impliqué et/ou doit être modifié) :

Le composant `cscservice` utilise la fonction `isLongTermLack` via `itmstock.cpp` et `pxstockbulkinquiry.cpp` pour vérifier si un article est indisponible à long terme. Si c'est le cas, la quantité commandée (`MengeBestellt_`) est ajustée et un drapeau d'erreur (`FehlerMenge_ |= QStateNotOnHand`) est défini, indiquant que l'article n'est pas en stock. (Référence : `itmstock.cpp`)

Le `longtermlackloader` est une application qui gère le chargement et la mise à jour de la table `longtermlack`. Il utilise divers préparateurs SQL pour identifier les articles selon les critères mentionnés ci-dessus.

## Contributions des départements dépendants (facultatif si un département externe à PHARMOS est impliqué) :

*   **PINT :** Potentiellement impliqué pour la définition des critères spécifiques à la France pour l'indisponibilité à long terme.
*   **Citrix :** Impacté si des modifications sont nécessaires au niveau de l'affichage des produits dans l'environnement Citrix.
*   **Infrastructure Env :** Pour le déploiement des modifications et la gestion des environnements.
*   **Schedule/Batch :** Le processus de chargement de `longtermlack` est probablement exécuté via des tâches planifiées.
*   **BI :** Pour le reporting et l'analyse des impacts des produits indisponibles.
*   **GxP (en cas de pertinence GxP) :** Si les modifications ont une incidence sur la conformité GxP, une validation sera nécessaire.

## Documents (Analyse et Spécification de la Solution) :

*   `CPR0002783 - Analysis Details - NTTD.doc` (Ce document)
*   `CPR0002783 - INT - trace long-term unavailable products.doc` (Document d'implémentation et de traçabilité)

## Références :

[1] `CPR0002783 - Analysis Details - NTTD.doc`
[2] `CPR0002783 - INT - trace long-term unavailable products.doc`
[3] `https://github.com/haythem-dev/cscload_core_discount06/tree/main/SOURCES/ph.out.csc_core_apps_initial_bef_cpr` (Dépôt GitHub du code source impacté)
