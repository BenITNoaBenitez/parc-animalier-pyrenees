# Parc animalier des Pyrénées

Prototype de présentation : schéma interactif et calendrier commun des quatre logements, pour **une nuit et deux adultes**.

Le calendrier interroge le service public du widget D-EDGE séparément pour La Tanière (140910), Le Refuge (140908), La Cabane du Trappeur (140907) et Asian Lodge (163456). Une seule disponibilité suffit à rendre une date sélectionnable. Le calendrier affiche le prix minimum ; les cartes affichent les prix individuels. Une date sélectionnée est revérifiée avant de proposer les liens de réservation.

Un séjour minimum supérieur à une nuit est exclu. Une panne ou une réponse manquante n’est jamais présentée comme « complet ». Le bouton « Autres voyageurs » ouvre le moteur officiel pour une autre composition du séjour.

- `index.html` est autonome : photographies, polices, styles et interactions sont intégrés.
- Une connexion Internet reste nécessaire pour les disponibilités et les tarifs D-EDGE.
- Les réservations se poursuivent sur le moteur officiel du parc ; ce dépôt ne traite aucun paiement.
- Les photos et le logo proviennent du Parc Animalier des Pyrénées. Ce prototype n'est pas le site officiel.

## Développement

Sources dans `src/`, photographies officielles et polices dans `assets/`.

```sh
node build.mjs
node --test tests/calendar.test.cjs
```

La construction produit un seul HTML autonome. Le jeton dans `src/widget-config.json` est celui du widget public embarqué sur les pages officielles, déjà exposé aux navigateurs ; il ne donne pas accès à l’administration. Cette intégration dépend de la disponibilité du service D-EDGE, de ce jeton et de ses règles CORS. Pour une mise en production commerciale, faire valider l’intégration et la pérennité de cet accès par D-EDGE. Le moteur officiel confirme toujours le prix et les conditions.

## Publication

GitHub Pages publie la racine de la branche `main`. Une modification de `index.html` poussée sur cette branche déclenche la mise à jour du site.

Le fichier peut aussi être ouvert directement dans un navigateur en local.
