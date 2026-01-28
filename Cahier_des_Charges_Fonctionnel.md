# CAHIER DES CHARGES FONCTIONNEL (CdCF)

**Projet :** Wrapper AI
**Date :** 26/01/2026
**Version :** 2.0 (Enrichie)

---

## 1. OBJECTIF DE L'ÉTUDE

### 1.1 Besoin de l'étude

L'entreprise **Tech Build Solutions** fait face à une perte de productivité de ses ingénieurs commerciaux (30% du temps perdu en recherche) et à une sous-exploitation de son capital vidéo ("Dark Data").

L'objectif est de fournir un assistant IA (Wrapper) capable de rechercher l'information et de transformer les formats multimédias.

### 1.2 Objectifs chiffrés

*   **Productivité :** Diviser par 8 le temps de recherche (4h -> 30min).
*   **Fiabilité :** 100% des réponses sourcées.
*   **Résilience :** 99% de disponibilité technique.

---

## 2. ANALYSE FONCTIONNELLE ET SITUATIONS DE VIE

### SITUATIONS DE VIE

Pour structurer l'analyse (inspiré de la méthode APTE), nous identifions trois situations principales :

1.  **Situation d'Exploitation (Chat & Repurpose)** : L'utilisateur final interagit avec l'IA pour obtenir des réponses ou du contenu.
2.  **Situation d'Alimentation (Ingest)** : L'administrateur ou le système enrichit la base de connaissance.
3.  **Situation de Maintenance** : Les développeurs assurent la pérennité et l'évolution du code.

### LISTE DES FONCTIONS DE SERVICE

| Repère | Fonction | Énoncé de la fonction | Situation |
| :--- | :--- | :--- | :--- |
| **FP1** | **INTERROGER** | Le système permet à l'utilisateur d'interroger la base documentaire en langage naturel (RAG). | Exploitation |
| **FP2** | **TRANSFORMER** | Le système permet de transformer du contenu vidéo/audio en texte structuré (Repurposing). | Exploitation |
| **FP3** | **ADMINISTRER** | Le système permet de gérer (ajouter/supprimer) les documents de la base de connaissances. | Alimentation |
| **FC1** | **S'ADAPTER** | Le système doit s'adapter aux formats de fichiers hétérogènes (PDF, YouTube, Web). | Alimentation |
| **FC2** | **GARANTIR** | Le système doit garantir la continuité de service (Résilience/Fallback). | Exploitation |
| **FC3** | **PROTÉGER** | Le système doit protéger la confidentialité des données (Sécurité & Auth). | Toutes |
| **FC4** | **ERGONOMIE** | Le système doit être ergonomique et facile à prendre en main (UI/UX). | Exploitation |
| **FC5** | **DÉPLOYER** | Le système doit être facilement déployable sur le cloud (CI/CD). | Maintenance |
| **FC6** | **INTEROPÉRER**| Le système doit s'interfacer avec plusieurs modèles d'IA (Multi-LLM). | Maintenance |
| **FC7** | **OPTIMISER** | Le système doit optimiser les coûts liés à la consommation de tokens. | Exploitation |

---

## 3. DÉTAIL DES FONCTIONS

### FP1 LE SYSTÈME PERMET À L'UTILISATEUR D' [INTERROGER] LA BASE

**CRITÈRES D'USAGE**

*   **Intention :** L'utilisateur pose une question technique complexe ou contextuelle.
*   **Contexte :** Corpus documentaire spécifique (CCTP, Normes, Docs internes).
*   **Sourcing :** Chaque fait énoncé doit être prouvé par une citation explicite.
*   **Mode de réponse :** Streaming (affichage progressif du texte).

**CRITÈRES D'ESTIME**

*   **Clarté :** Réponse structurée (Markdown : titres, listes, gras).
*   **Ton :** Expert, synthétique et professionnel.

**CRITÈRE D'ECHANGE :**

| Critère | Niveau | Flexibilité |
| :--- | :--- | :--- |
| Temps de réponse (TTFT) | < 2 secondes (1er token) | Moyenne |
| Taux de sourcing | 100% des faits cités avec lien vers source | Nulle |
| Taux d'hallucination | < 2% | Faible |
| Fenêtre de contexte | Capacité de traiter > 10 pages de contexte | Faible |

---

### FP2 LE SYSTÈME PERMET DE [TRANSFORMER] DU CONTENU VIDÉO

**CRITÈRES D'USAGE**

*   **Entrée :** URL YouTube valide (publique ou non répertoriée).
*   **Traitement :** Extraction de transcript, analyse sémantique.
*   **Sortie :** Texte structuré selon des templates (Article LinkedIn, Thread Twitter, Résumé Exécutif).

**CRITÈRES D'ESTIME**

*   **Adaptabilité :** Ton adapté au format cible (Viral, Informatif, Pédagogique).

**CRITÈRE D'ECHANGE :**

| Critère | Niveau | Flexibilité |
| :--- | :--- | :--- |
| Durée vidéo max | 60 minutes | Moyenne |
| Qualité Transcription | > 90% (Word Error Rate) | Moyenne |
| Délai traitement | < 2 min (pour 30min vidéo) | Moyenne |
| Langues supportées | Français, Anglais | Faible |

---

### FP3 LE SYSTÈME PERMET D' [ADMINISTRER] LA BASE DE CONNAISSANCES

**CRITÈRES D'USAGE**

*   **Action :** Upload de fichiers, suppression de fichiers obsolètes.
*   **Visualisation :** Liste des documents indexés avec métadonnées.

**CRITÈRE D'ECHANGE :**

| Critère | Niveau | Flexibilité |
| :--- | :--- | :--- |
| Mise à jour index | Immédiate (< 10s après upload) | Faible |
| Gestion des doublons | Détection automatique par hash ou nom | Moyenne |

---

### FC1 LE SYSTÈME DOIT [S'ADAPTER] AUX FORMATS

**CRITÈRES D'USAGE**

*   **Formats supportés :** PDF (texte sélectionnable), TXT, MD, Liens YouTube.
*   **Vectorisation :** Conversion automatique en embeddings (Modèle : text-embedding-004 ou équivalent).

**CRITÈRE D'ECHANGE :**

| Critère | Niveau | Flexibilité |
| :--- | :--- | :--- |
| Taille max fichier | 10 Mo | Faible |
| Dimensions vecteur | 768 dimensions (Standard Gemini) | Nulle |
| Taux de rejet (formats valides) | 0% | Nulle |

---

### FC2 LE SYSTÈME DOIT [GARANTIR] LA CONTINUITÉ DE SERVICE

**CRITÈRES D'USAGE**

*   **Transparence :** Bascule invisible pour l'utilisateur en cas de panne d'un fournisseur d'IA.
*   **Stratégie Fallback :** Si Gemini échoue -> Groq (Llama 3) -> OpenAI (GPT-4o).

**CRITÈRE D'ECHANGE :**

| Critère | Niveau | Flexibilité |
| :--- | :--- | :--- |
| Taux de succès requêtes | > 99% | Faible |
| Bascule Fallback | Automatique et silencieuse | Nulle |
| Timeout API | 30 secondes max avant bascule | Moyenne |

---

### FC3 LE SYSTÈME DOIT [PROTÉGER] LA CONFIDENTIALITÉ

**CRITÈRES D'USAGE**

*   **Cloisonnement (Multi-tenant) :** Un utilisateur ne voit que ses propres documents (Row Level Security).
*   **Authentification :** Connexion sécurisée requise avant tout accès.

**CRITÈRE D'ECHANGE :**

| Critère | Niveau | Flexibilité |
| :--- | :--- | :--- |
| Fuite de données entre utilisateurs | 0% | Nulle |
| Technologie Auth | Supabase Auth (Email/Password, OAuth) | Nulle |
| Technologie DB | PostgreSQL + pgvector | Nulle |

---

### FC4 LE SYSTÈME DOIT ÊTRE [ERGONOMIQUE]

**CRITÈRES D'USAGE**

*   Interface Web responsive (Mobile/Desktop).
*   Feedback visuel immédiat (Streaming, Skeleton loaders, Toasts de notification).
*   Navigation intuitive (Menu latéral, Actions claires).

**CRITÈRES D'ESTIME**

*   Design épuré, moderne ("Clean UI"), utilisant des composants standards (Shadcn/UI, Tailwind).

**CRITÈRE D'ECHANGE :**

| Critère | Niveau | Flexibilité |
| :--- | :--- | :--- |
| Prise en main | < 5 minutes sans formation | Moyenne |
| Compatibilité | Chrome, Firefox, Safari, Edge | Faible |
| Accessibilité | Contraste suffisant, navigation clavier | Moyenne |

---

### FC5 LE SYSTÈME DOIT ÊTRE FACILEMENT [DÉPLOYABLE]

**CRITÈRES D'USAGE**

*   Déploiement automatisé via Git.
*   Architecture Serverless privilégiée.

**CRITÈRE D'ECHANGE :**

| Critère | Niveau | Flexibilité |
| :--- | :--- | :--- |
| Environnement | Vercel (Frontend/API) + Supabase (Backend) | Nulle |
| Configuration | Variables d'environnement (.env) centralisées | Faible |
| Stack Technique | Next.js 15+, React 19, TypeScript | Faible |

---

### FC6 LE SYSTÈME DOIT [INTEROPÉRER] AVEC PLUSIEURS IA

**CRITÈRES D'USAGE**

*   Architecture modulaire permettant de changer de fournisseur LLM facilement.
*   Utilisation de SDKs officiels ou unifiés.

**CRITÈRE D'ECHANGE :**

| Critère | Niveau | Flexibilité |
| :--- | :--- | :--- |
| Fournisseurs intégrés | Google (Gemini), Groq, OpenAI | Moyenne |
| Abstraction | Interface unique pour l'appel de chat | Faible |

---

### FC7 LE SYSTÈME DOIT [OPTIMISER] LES COÛTS

**CRITÈRES D'USAGE**

*   Choix intelligent du modèle selon la complexité de la tâche (Routing).
*   Modèles "Flash" ou "Mini" pour les tâches simples, modèles "Pro" pour le raisonnement complexe.

**CRITÈRE D'ECHANGE :**

| Critère | Niveau | Flexibilité |
| :--- | :--- | :--- |
| Coût par requête simple | Minimisé (usage de Gemini Flash / Llama 8b) | Moyenne |
| Suivi consommation | Logs basiques des appels API | Moyenne |
