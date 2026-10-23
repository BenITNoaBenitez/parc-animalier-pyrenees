# Parc animalier des Pyrénées

Prototype de présentation en quatre parties :

1. Schéma interactif du fonctionnement du site.
2. Les huit ambiances de calendrier originales pour La Tanière, avec le widget D-EDGE.
3. Calendrier commun des quatre logements, pour **une nuit et deux adultes**.
4. **Les sept calendriers du site, refaits à notre charte**, chacun sous forme de balise HTML `<parc-calendrier>`.

Une page à part, `calendriers.html`, regroupe ces sept calendriers avec la balise à copier à côté de chacun, en trois designs (cases pleines, cercles, lignes fines) et deux modes (clair, sombre).

Dans la troisième partie, le choix des logements, leurs prix et les boutons de réservation remplacent le mois **dans la même carte calendrier**. Le bouton « Changer de date » réaffiche le mois ; aucun panneau de choix n’est ajouté sous le calendrier. Les sources des anciens calendriers sont conservées dans `src/legacy/`.

Le calendrier interroge le service public du widget D-EDGE séparément pour La Tanière (140910), Le Refuge (140908), La Cabane du Trappeur (140907) et Asian Lodge (163456). Une seule disponibilité suffit à rendre une date sélectionnable. Le calendrier affiche le prix minimum ; les cartes affichent les prix individuels. Une date sélectionnée est revérifiée avant de proposer les liens de réservation.

Un séjour minimum supérieur à une nuit est exclu. Une panne ou une réponse manquante n’est jamais présentée comme « complet ». Le bouton « Autres voyageurs » ouvre le moteur officiel pour une autre composition du séjour.

- `index.html` est autonome : photographies, polices, styles et interactions sont intégrés.
- Une connexion Internet reste nécessaire pour les disponibilités et les tarifs D-EDGE.
- Les réservations se poursuivent sur le moteur officiel du parc ; ce dépôt ne traite aucun paiement.
- Les photos et le logo proviennent du Parc Animalier des Pyrénées. Ce prototype n'est pas le site officiel.

## Les sept calendriers du site et la balise `<parc-calendrier>`

Relevé du 15 octobre 2026 sur parc-animalier-pyrenees.com : sept pages embarquent un calendrier D-EDGE, toutes sur le même compte (`JLPH-28870`). Les autres pages (billetterie, Soigneur d’un jour, bon cadeau) renvoient vers des services externes sans calendrier intégré.

| Page du site | Calendrier | Identifiant D-EDGE | Voyageurs max. (widget officiel) |
|---|---|---|---|
| `/page/hebergements` | Vue d’ensemble (le widget du site mélange lodges et gîtes ; la balise `tous` se limite aux quatre lodges) | aucun filtre | 10 adultes, 10 enfants |
| `/page/dormir-avec-les-ours-bruns` | La Tanière | 140910 | 2 adultes, 1 enfant |
| `/page/dormir-avec-les-loups-noirs` | Le Refuge | 140908 | 5 adultes, 4 enfants |
| `/page/nuits-insolites` | La Cabane du Trappeur | 140907 | 4 adultes, 3 enfants |
| `/page/dormir-avec-les-pandas-roux` | Asian Lodge | 163456 | 5 adultes, 4 enfants |
| `/page/la-grange` | Gîte La Grange (Pyrénées Prestige) | 140905 | 10 adultes, 9 enfants |
| `/page/le-moulin` | Gîte Le Moulin (Pyrénées Prestige) | 140906 | 5 adultes, 4 enfants |

La quatrième partie du prototype affiche ces sept calendriers dans la charte du prototype (DM Sans, Barlow Condensed, vert `#91ab2a`, bleu nuit `#00212d`), avec les disponibilités en direct, et montre pour chacun la balise à copier.

### Installation sur une page

<!-- install:start -->
```html
<script src="https://benitnoabenitez.github.io/parc-animalier-pyrenees/parc-calendrier-1.0.2.js" integrity="sha384-KUH2UnyXEcMmBskiKPZh4672duSpm21NgF5sdhF7j1O5LvvMLoOG/WtCDPDXJYbe" crossorigin="anonymous" defer></script>

<parc-calendrier logement="taniere"></parc-calendrier>
```
<!-- install:end -->

Le script est publié sous un nom versionné (`parc-calendrier-1.0.2.js`) qui ne change jamais une fois en ligne, avec son empreinte d’intégrité (`integrity`) : le navigateur refuse d’exécuter un fichier qui ne correspond pas exactement. Toute modification de la balise passe par une nouvelle version dans `build.mjs`, un nouveau fichier et une nouvelle empreinte ; les balises déjà copiées continuent de fonctionner avec l’ancienne version. `parc-calendrier.js` sans numéro reste la dernière version, sans empreinte, pour les essais. Hébergement temporaire sur GitHub Pages : pour la mise en ligne définitive, copier le fichier versionné sur le domaine du parc et adapter l’adresse. Aucune bibliothèque requise ; les polices Google sont chargées seulement si la page ne les déclare pas déjà.

### Attributs

| Attribut | Valeurs | Rôle |
|---|---|---|
| `logement` | `tous`, `taniere`, `refuge`, `trappeur`, `asian`, `grange`, `moulin` | Calendrier à afficher (`tous` par défaut : les quatre lodges, meilleur prix par date). |
| `chambre` | identifiant D-EDGE, ex. `140910` | Alternative à `logement`. |
| `adultes`, `enfants`, `ages` | nombres, âges séparés par des virgules | Composition de départ ; le visiteur la modifie dans les limites du logement. |
| `mois` | `1` ou `2` | Nombre de mois affichés côte à côte. |
| `photo`, `titre`, `sous-titre` | texte / URL | En-tête de la carte ; par défaut, la photo officielle du logement. |
| `design` | `cases`, `cercles`, `lignes` | Trois designs ; `cases` par défaut. |
| `theme` | `clair`, `sombre` | Mode clair par défaut ; `sombre` : fond bleu nuit, sélection dorée (`nuit` reste accepté). |
| `compact` | présent ou non | Sans en-tête. |

La balise émet l’événement `parc-calendrier:selection` (détail : date, départ, nuits, prix, logement, lien) et expose `element.selection` et `element.refresh()`.

### Comportement

- Tarif « dès » par nuit pour la composition choisie, revérifié au clic sur une date.
- Un clic choisit une nuit et affiche ses deux jours, arrivée et départ ; le séjour minimum est annoncé sous le prix, au-dessus du calendrier et dans le panneau ; un clic plus loin déplace le départ si toutes les nuits intermédiaires sont disponibles, dans la limite du séjour maximum. Les boutons − et + font de même. Le total du séjour est confirmé sur le moteur officiel.
- Les gîtes imposent un séjour minimum : la date de départ et le lien de réservation en tiennent compte.
- Le lien « Réserver » ouvre le moteur officiel avec logement, dates et voyageurs préremplis ; le prix final et les conditions y sont confirmés.
- Un service qui ne répond pas n’est jamais affiché comme complet ; un bouton permet de réessayer.
- La vue d’ensemble (`tous`) interroge les quatre lodges séparément, La Tanière, Le Refuge, La Cabane du Trappeur et Asian Lodge : un point par logement disponible dans chaque case, le meilleur prix affiché, et au clic le mois glisse pour laisser place aux logements disponibles cette nuit, avec photo, prix et bouton de réservation. Un lodge qui ne répond pas rend ses dates « à vérifier », jamais « complet ». Les gîtes ont leurs propres calendriers.

## Développement

Sources dans `src/`, photographies officielles et polices dans `assets/`, balise dans `src/embed/`.

```sh
node build.mjs
node --test tests/calendar.test.cjs tests/embed.test.cjs
```

La construction produit deux HTML autonomes, `index.html` et `calendriers.html`, le fichier versionné `parc-calendrier-<version>.js` avec son empreinte, et `parc-calendrier.js` (dernière version). Elle refuse d’écraser un fichier versionné déjà publié avec un contenu différent. Le jeton dans `src/widget-config.json` est celui du widget public embarqué sur les pages officielles, déjà exposé aux navigateurs ; il ne donne pas accès à l’administration. Cette intégration dépend de la disponibilité du service D-EDGE, de ce jeton et de ses règles CORS. Pour une mise en production commerciale, faire valider l’intégration et la pérennité de cet accès par D-EDGE. Le moteur officiel confirme toujours le prix et les conditions.

## Publication

GitHub Pages publie la racine de la branche `main`. Une modification de `index.html`, `calendriers.html` ou des fichiers `parc-calendrier*.js` poussée sur cette branche déclenche la mise à jour du site.

Le fichier peut aussi être ouvert directement dans un navigateur en local.
