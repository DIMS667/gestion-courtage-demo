export type RoleBackoffice = "gestionnaire" | "admin" | "super_admin";
export type StatutBackoffice = "actif" | "bloque";
export type StatutCompteClient = "en_attente_verification" | "actif" | "bloque";

export type ClientBackoffice = {
  id: string;
  nom_complet: string;
  adresse_email: string;
  numero_telephone: string;
  adresse: string;
  ville: string;
  statut: StatutCompteClient;
  cree_le: string;
  nombre_demandes: number;
  nombre_sinistres: number;
  nombre_documents: number;
};

export type UtilisateurBackoffice = {
  id: string;
  nom_complet: string;
  adresse_email: string;
  numero_telephone: string;
  role: RoleBackoffice;
  statut: StatutBackoffice;
  mfa_active: boolean;
  doit_changer_mot_de_passe: boolean;
};

export type StatutDemande =
  | "nouvelle"
  | "en_analyse"
  | "propositions_disponibles"
  | "offre_selectionnee"
  | "documents_requis"
  | "paiement_en_attente"
  | "contrat_en_preparation"
  | "police_disponible"
  | "finalisee";

export type IntervenantDemande = {
  id: string;
  nom_complet: string;
  role: RoleBackoffice;
};

export type ResumeDemandeClient = {
  id: string;
  reference: string;
  produit: string;
  libelle_produit: string;
  sous_type: "voiture" | "moto_deux_trois_roues" | null;
  mode_preparation: "saisie_directe" | "delegation_courtier";
  statut: StatutDemande;
  responsable: IntervenantDemande | null;
  prise_en_charge_le: string | null;
  client: {
    id: string;
    nom_complet: string;
    adresse_email: string;
    numero_telephone: string;
  };
  cree_le: string;
  modifie_le: string;
};

export type DetailDemandeClient = ResumeDemandeClient & {
  donnees: Record<string, unknown>;
};

export type MessageConversationBackoffice = {
  id: string;
  demande_reference: string;
  type_auteur: "client" | "courtier";
  auteur_nom: string;
  contenu: string;
  cree_le: string;
};

export type OffreAssuranceBackoffice = {
  id: string;
  compagnie_id: string | null;
  origine: "manuelle" | "automatique";
  bareme_id: string | null;
  formule_tarifaire_code: string | null;
  detail_calcul: Record<string, unknown>;
  reference: string;
  demande_reference: string;
  produit: string;
  libelle_produit: string;
  assureur: string;
  prime_xaf: number;
  duree_mois: number;
  date_effet: string;
  franchise_xaf: number;
  garanties: string[];
  options: string[];
  exclusions: string[];
  documents_requis: string[];
  recommandee: boolean;
  conseil: string;
  transmise: boolean;
  publiee_le: string | null;
  selectionnee: boolean;
  cree_le: string;
};

export type CompagniePartenaireResume = {
  id: string;
  code: string;
  nom: string;
  sigle: string;
  statut: string;
  logo_url: string | null;
  nombre_baremes: number;
  nombre_offres: number;
  nombre_contrats: number;
  nombre_sinistres: number;
};

export type DetailCompagniePartenaire = CompagniePartenaireResume & {
  logo_modifie_le: string | null;
  baremes: Array<{
    id: string;
    code: string;
    produit: string;
    libelle: string;
    partenaire: string | null;
    statut: string;
    date_signature_document: string | null;
    valide_du: string | null;
    valide_au: string | null;
    paiement_autorise: boolean;
    raison_suspension: string;
    nombre_regles: number;
    nombre_franchises: number;
    nombre_reductions: number;
    nombre_formules: number;
    nombre_tarifs: number;
    nombre_prestations: number;
  }>;
  garanties_tarifaires: Array<{
    categorie: number;
    garantie_code: string;
    garantie_libelle: string;
    type_regle: string;
    taux_pourcent: string | null;
    montant_min_xaf: number | null;
    montant_max_xaf: number | null;
    assiette: string | null;
    note: string;
  }>;
  formules_sante: Array<{
    id: string;
    bareme_code: string;
    code: string;
    libelle: string;
    zone_couverture: string;
    reseau_soins: string;
    plafond_couverture_xaf: number;
    plafond_alternatif_xaf: number | null;
    plafond_note: string;
    responsabilite_civile_note: string;
    capital_assure_xaf: number;
    capital_conjoint_xaf: number;
    capital_enfant_xaf: number;
    assistance_xaf: number | null;
  }>;
  tarifs_sante: Array<{
    formule_code: string;
    formule_libelle: string;
    beneficiaire: string;
    prime_maladie_xaf: number;
    frais_funeraires_xaf: number;
    accessoires_xaf: number;
    tva_xaf: number;
    carte_biometrique_xaf: number;
    responsabilite_civile_xaf: number | null;
    assistance_xaf: number | null;
    prime_ttc_imprimee_xaf: number;
    ambiguite: boolean;
    note: string;
  }>;
  prestations_sante: Array<{
    formule_code: string;
    formule_libelle: string;
    code: string;
    libelle: string;
    montant_xaf: number | null;
    unite: string;
    taux_pourcent: string | null;
    note: string;
  }>;
  regles_age_sante: Array<{
    age_min: number;
    age_max: number | null;
    majoration_pourcent: string | null;
    exclu: boolean;
    note: string;
  }>;
  offres: Array<{
    id: string;
    reference: string;
    demande_reference: string;
    produit: string;
    origine: "manuelle" | "automatique";
    formule_tarifaire_code: string | null;
    prime_xaf: number;
    recommandee: boolean;
    transmise: boolean;
    selectionnee: boolean;
    cree_le: string;
  }>;
  contrats: Array<{
    id: string;
    reference: string;
    numero_police: string | null;
    demande_reference: string;
    produit: string;
    prime_xaf: number;
    statut: string;
    date_effet: string;
    date_expiration: string;
    cree_le: string;
  }>;
  paiements: Array<{
    id: string;
    reference: string;
    demande_reference: string;
    montant_xaf: number;
    statut: string;
    operateur: string | null;
    cree_le: string;
  }>;
  sinistres: Array<{
    id: string;
    reference: string;
    contrat_reference: string;
    produit: string;
    type_sinistre: string;
    date_sinistre: string;
    statut: string;
    cree_le: string;
  }>;
};

export type PaiementCampayBackoffice = {
  id: string;
  reference: string;
  reference_externe: string;
  demande_reference: string;
  offre_id: string;
  montant_xaf: number;
  numero_telephone: string;
  statut: "initialisation" | "en_attente" | "reussi" | "echoue" | "a_verifier";
  operateur: string | null;
  code_ussd: string | null;
  contrat_reference: string | null;
  cree_le: string;
  modifie_le: string;
};

export type ContratAssuranceBackoffice = {
  id: string;
  reference: string;
  numero_police: string | null;
  demande_reference: string;
  offre_id: string;
  offre_reference: string;
  paiement_id: string | null;
  produit: string;
  libelle_produit: string;
  assureur: string;
  prime_xaf: number;
  duree_mois: number;
  franchise_xaf: number;
  statut: "en_preparation" | "actif" | "expire";
  date_effet: string;
  date_expiration: string;
  garanties: string[];
  options: string[];
  exclusions: string[];
  documents_requis: string[];
  informations_police: {
    numero_attestation?: string | null;
    code_agence?: string | null;
    reseau_distribution?: string | null;
    code_apporteur?: string | null;
    lieu_emission?: string | null;
    date_emission?: string | null;
    prime_nette_xaf?: number;
    accessoires_xaf?: number;
    taxes_xaf?: number;
    observations?: string | null;
  };
  police_disponible: boolean;
  police_nom_fichier: string | null;
  police_televersee_le: string | null;
  cree_le: string;
};

export type StatutSinistre =
  | "declare"
  | "en_analyse"
  | "documents_en_attente"
  | "documents_verifies"
  | "transmis_assureur"
  | "expertise"
  | "decision"
  | "indemnisation_en_cours"
  | "indemnise"
  | "cloture";

export type ResumeSinistre = {
  id: string;
  reference: string;
  contrat_reference: string;
  produit: string;
  libelle_produit: string;
  type_sinistre: string;
  date_sinistre: string;
  lieu: string;
  description: string;
  statut: StatutSinistre;
  client: ResumeDemandeClient["client"];
  responsable: IntervenantDemande | null;
  prise_en_charge_le: string | null;
  cree_le: string;
  modifie_le: string;
};

export type DetailSinistre = ResumeSinistre & {
  donnees: Record<string, unknown>;
  historique_statuts: Array<{ statut: StatutSinistre; cree_le: string }>;
  prochain_statut: StatutSinistre | null;
};

export type TableauDeBordBackoffice = {
  indicateurs: {
    clients_total: number;
    clients_actifs: number;
    nouveaux_clients_mois: number;
    demandes_total: number;
    demandes_en_cours: number;
    demandes_non_affectees: number;
    sinistres_ouverts: number;
    sinistres_non_affectes: number;
  };
  evolution_mensuelle: Array<{
    mois: string;
    clients: number;
    demandes: number;
    sinistres: number;
  }>;
  repartition_demandes: Array<{ libelle: string; valeur: number }>;
  demandes_nouvelles: number;
  sinistres_declares: number;
};

export type RapportActiviteBackoffice = {
  indicateurs: {
    clients_total: number;
    demandes_total: number;
    demandes_finalisees: number;
    sinistres_total: number;
    sinistres_ouverts: number;
    documents_total: number;
    documents_correction_requise: number;
  };
  evolution_mensuelle: Array<{
    mois: string;
    clients: number;
    demandes: number;
    sinistres: number;
  }>;
  repartition_demandes: Array<{ libelle: string; valeur: number }>;
  repartition_sinistres: Array<{ libelle: string; valeur: number }>;
  repartition_documents: Array<{ libelle: string; valeur: number }>;
};

export type LienConsultationDocument = {
  url: string;
  expire_dans_secondes: number;
};

export type DecisionDocument = "valider" | "demander_correction";
export type MotifCorrectionDocument =
  | "illisible"
  | "mauvais_document"
  | "incomplet"
  | "expire"
  | "informations_non_concordantes"
  | "autre";

export type ReponseAuthentification =
  | { statut: "connecte"; utilisateur: UtilisateurBackoffice; jeton_csrf: string }
  | { statut: "mot_de_passe_a_changer"; defi: string }
  | { statut: "mfa_requis"; defi: string }
  | {
      statut: "configuration_mfa_requise";
      defi: string;
      secret_totp: string;
      uri_configuration: string;
    };

const URL_API = (
  import.meta.env.VITE_API_BASE_URL ?? "https://api.followupassurance.com/api/v1"
).replace(/\/$/, "");
const CLE_CSRF = "followup_backoffice_csrf";

export class ErreurApi extends Error {
  constructor(
    message: string,
    public readonly statut: number,
  ) {
    super(message);
  }
}

function obtenirJetonCsrf() {
  return sessionStorage.getItem(CLE_CSRF) ?? "";
}

export function enregistrerSession(reponse: Extract<ReponseAuthentification, { statut: "connecte" }>) {
  sessionStorage.setItem(CLE_CSRF, reponse.jeton_csrf);
}

export function oublierSession() {
  sessionStorage.removeItem(CLE_CSRF);
}

async function appeler<T>(chemin: string, options: RequestInit = {}): Promise<T> {
  const entetes = new Headers(options.headers);
  const estFormulaire = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body && !estFormulaire) entetes.set("Content-Type", "application/json");
  const csrf = obtenirJetonCsrf();
  if (csrf) entetes.set("X-CSRF-Token", csrf);
  const reponse = await fetch(`${URL_API}${chemin}`, {
    ...options,
    headers: entetes,
    credentials: "include",
  });
  if (!reponse.ok) {
    let message = "Une erreur est survenue. Veuillez réessayer.";
    try {
      const corps = await reponse.json();
      message = corps?.erreur?.message ?? corps?.detail ?? message;
    } catch {
      // La réponse ne contient pas de JSON exploitable.
    }
    throw new ErreurApi(message, reponse.status);
  }
  if (reponse.status === 204) return undefined as T;
  return reponse.json() as Promise<T>;
}

async function appelerFichier(chemin: string): Promise<Blob> {
  const reponse = await fetch(`${URL_API}${chemin}`, { credentials: "include" });
  if (!reponse.ok) {
    let message = "Le document n’a pas pu être généré.";
    try {
      const corps = await reponse.json();
      message = corps?.erreur?.message ?? corps?.detail ?? message;
    } catch {
      // La réponse ne contient pas de JSON exploitable.
    }
    throw new ErreurApi(message, reponse.status);
  }
  return reponse.blob();
}

export const apiBackoffice = {
  obtenirTableauDeBord() {
    return appeler<TableauDeBordBackoffice>("/backoffice/tableau-de-bord");
  },

  obtenirRapportActivite() {
    return appeler<RapportActiviteBackoffice>("/backoffice/rapports");
  },

  listerPartenaires() {
    return appeler<CompagniePartenaireResume[]>("/backoffice/partenaires");
  },

  obtenirPartenaire(compagnieId: string) {
    return appeler<DetailCompagniePartenaire>(
      `/backoffice/partenaires/${encodeURIComponent(compagnieId)}`,
    );
  },

  modifierLogoPartenaire(compagnieId: string, fichier: File) {
    const formulaire = new FormData();
    formulaire.append("fichier", fichier);
    return appeler<DetailCompagniePartenaire>(
      `/backoffice/partenaires/${encodeURIComponent(compagnieId)}/logo`,
      { method: "PUT", body: formulaire },
    );
  },

  connecter(adresse_email: string, mot_de_passe: string) {
    return appeler<ReponseAuthentification>("/backoffice/authentification/connexions", {
      method: "POST",
      body: JSON.stringify({ adresse_email, mot_de_passe }),
    });
  },

  changerMotDePasse(defi: string, nouveau_mot_de_passe: string) {
    return appeler<ReponseAuthentification>(
      "/backoffice/authentification/mots-de-passe/changements-initiaux",
      {
        method: "POST",
        body: JSON.stringify({
          defi,
          nouveau_mot_de_passe,
          confirmation_mot_de_passe: nouveau_mot_de_passe,
        }),
      },
    );
  },

  verifierMfa(defi: string, code: string, activation: boolean) {
    const action = activation ? "activations" : "verifications";
    return appeler<Extract<ReponseAuthentification, { statut: "connecte" }>>(
      `/backoffice/authentification/mfa/${action}`,
      { method: "POST", body: JSON.stringify({ defi, code }) },
    );
  },

  obtenirSession() {
    return appeler<Extract<ReponseAuthentification, { statut: "connecte" }>>(
      "/backoffice/authentification/moi",
    );
  },

  deconnecter() {
    return appeler<void>("/backoffice/authentification/deconnexion", { method: "POST" });
  },

  listerUtilisateurs() {
    return appeler<UtilisateurBackoffice[]>("/backoffice/utilisateurs");
  },

  listerClients(parametres?: { recherche?: string }) {
    const recherche = new URLSearchParams();
    if (parametres?.recherche) recherche.set("recherche", parametres.recherche);
    const suffixe = recherche.size ? `?${recherche.toString()}` : "";
    return appeler<ClientBackoffice[]>(`/backoffice/clients${suffixe}`);
  },

  creerClient(entree: {
    nom_complet: string;
    adresse_email: string;
    numero_telephone: string;
    adresse: string;
    ville: string;
    mot_de_passe_initial: string;
  }) {
    return appeler<ClientBackoffice>("/backoffice/clients", {
      method: "POST",
      body: JSON.stringify(entree),
    });
  },

  creerUtilisateur(entree: {
    nom_complet: string;
    adresse_email: string;
    numero_telephone: string;
    role: RoleBackoffice;
    mot_de_passe_temporaire: string;
  }) {
    return appeler<UtilisateurBackoffice>("/backoffice/utilisateurs", {
      method: "POST",
      body: JSON.stringify(entree),
    });
  },

  modifierUtilisateur(
    id: string,
    entree: {
      nom_complet: string;
      numero_telephone: string;
      role: RoleBackoffice;
      statut: StatutBackoffice;
    },
  ) {
    return appeler<UtilisateurBackoffice>(`/backoffice/utilisateurs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(entree),
    });
  },

  reinitialiserMotDePasse(id: string, mot_de_passe_temporaire: string) {
    return appeler<UtilisateurBackoffice>(
      `/backoffice/utilisateurs/${id}/mot-de-passe-temporaire`,
      { method: "POST", body: JSON.stringify({ mot_de_passe_temporaire }) },
    );
  },

  listerDemandes(parametres?: { statut?: StatutDemande; recherche?: string }) {
    const recherche = new URLSearchParams();
    if (parametres?.statut) recherche.set("statut_demande", parametres.statut);
    if (parametres?.recherche) recherche.set("recherche", parametres.recherche);
    const suffixe = recherche.size ? `?${recherche.toString()}` : "";
    return appeler<ResumeDemandeClient[]>(`/backoffice/demandes-clients${suffixe}`);
  },

  obtenirDemande(reference: string) {
    return appeler<DetailDemandeClient>(
      `/backoffice/demandes-clients/${encodeURIComponent(reference)}`,
    );
  },

  listerMessagesDemande(reference: string) {
    return appeler<MessageConversationBackoffice[]>(
      `/backoffice/messagerie/${encodeURIComponent(reference)}`,
    );
  },

  envoyerMessageDemande(reference: string, contenu: string) {
    return appeler<MessageConversationBackoffice>(
      `/backoffice/messagerie/${encodeURIComponent(reference)}`,
      { method: "POST", body: JSON.stringify({ contenu }) },
    );
  },

  creerFluxMessages() {
    return new EventSource(`${URL_API}/backoffice/messagerie/flux`, {
      withCredentials: true,
    });
  },

  listerOffresDemande(reference: string) {
    return appeler<OffreAssuranceBackoffice[]>(
      `/backoffice/demandes-clients/${encodeURIComponent(reference)}/offres`,
    );
  },

  creerOffreDemande(reference: string, entree: {
    compagnie_id: string;
    prime_xaf: number;
    duree_mois: number;
    date_effet: string;
    franchise_xaf: number;
    garanties: string[];
    options: string[];
    exclusions: string[];
    documents_requis: string[];
    recommandee: boolean;
    conseil: string;
  }) {
    return appeler<OffreAssuranceBackoffice>(
      `/backoffice/demandes-clients/${encodeURIComponent(reference)}/offres`,
      { method: "POST", body: JSON.stringify(entree) },
    );
  },

  transmettreOffresDemande(reference: string, offreIds: string[]) {
    return appeler<OffreAssuranceBackoffice[]>(
      `/backoffice/demandes-clients/${encodeURIComponent(reference)}/offres/transmission`,
      { method: "POST", body: JSON.stringify({ offre_ids: offreIds }) },
    );
  },

  listerPaiementsReels() {
    return appeler<PaiementCampayBackoffice[]>("/backoffice/souscriptions/paiements");
  },

  rapprocherPaiement(paiementId: string, referenceCampay: string) {
    return appeler<PaiementCampayBackoffice>(
      `/backoffice/souscriptions/paiements/${encodeURIComponent(paiementId)}/rapprochement`,
      { method: "POST", body: JSON.stringify({ reference_campay: referenceCampay }) },
    );
  },

  listerContratsReels() {
    return appeler<ContratAssuranceBackoffice[]>("/backoffice/souscriptions/contrats");
  },

  preparerContrat(referenceDemande: string) {
    return appeler<ContratAssuranceBackoffice>(
      "/backoffice/souscriptions/contrats/preparation",
      { method: "POST", body: JSON.stringify({ demande_reference: referenceDemande }) },
    );
  },

  activerContrat(contratId: string, numeroPolice: string) {
    return appeler<ContratAssuranceBackoffice>(
      `/backoffice/souscriptions/contrats/${encodeURIComponent(contratId)}/activation`,
      { method: "POST", body: JSON.stringify({ numero_police: numeroPolice }) },
    );
  },

  mettreAJourPreparationContrat(
    contratId: string,
    entree: {
      numero_police: string | null;
      numero_attestation: string | null;
      code_agence: string | null;
      reseau_distribution: string | null;
      code_apporteur: string | null;
      lieu_emission: string | null;
      date_emission: string | null;
      date_effet: string;
      date_expiration: string;
      prime_nette_xaf: number;
      accessoires_xaf: number;
      taxes_xaf: number;
      observations: string | null;
    },
  ) {
    return appeler<ContratAssuranceBackoffice>(
      `/backoffice/souscriptions/contrats/${encodeURIComponent(contratId)}/preparation`,
      { method: "PUT", body: JSON.stringify(entree) },
    );
  },

  telechargerProjetContrat(contratId: string) {
    return appelerFichier(
      `/backoffice/souscriptions/contrats/${encodeURIComponent(contratId)}/projet`,
    );
  },

  televerserPoliceContrat(contratId: string, fichier: File) {
    const formulaire = new FormData();
    formulaire.append("fichier", fichier);
    return appeler<ContratAssuranceBackoffice>(
      `/backoffice/souscriptions/contrats/${encodeURIComponent(contratId)}/police`,
      { method: "PUT", body: formulaire },
    );
  },

  obtenirLienPoliceContrat(contratId: string) {
    return appeler<LienConsultationDocument>(
      `/backoffice/souscriptions/contrats/${encodeURIComponent(contratId)}/police/consultation`,
    );
  },

  obtenirLienConsultationDocument(documentId: string) {
    return appeler<LienConsultationDocument>(
      `/backoffice/documents/${encodeURIComponent(documentId)}/consultation`,
    );
  },

  deciderDocument(
    documentId: string,
    entree: {
      demande_reference: string;
      decision: DecisionDocument;
      motif?: MotifCorrectionDocument;
      commentaire?: string;
    },
  ) {
    return appeler<Record<string, unknown>>(
      `/backoffice/documents/${encodeURIComponent(documentId)}/decision`,
      { method: "POST", body: JSON.stringify(entree) },
    );
  },

  prendreEnChargeDemande(reference: string) {
    return appeler<DetailDemandeClient>(
      `/backoffice/demandes-clients/${encodeURIComponent(reference)}/prise-en-charge`,
      { method: "POST" },
    );
  },

  libererDemande(reference: string) {
    return appeler<DetailDemandeClient>(
      `/backoffice/demandes-clients/${encodeURIComponent(reference)}/liberation`,
      { method: "POST" },
    );
  },

  listerIntervenantsDemandes() {
    return appeler<IntervenantDemande[]>("/backoffice/demandes-clients/intervenants");
  },

  reaffecterDemande(reference: string, responsable_id: string, motif: string) {
    return appeler<DetailDemandeClient>(
      `/backoffice/demandes-clients/${encodeURIComponent(reference)}/reaffectation`,
      { method: "POST", body: JSON.stringify({ responsable_id, motif }) },
    );
  },

  creerFluxDemandes() {
    return new EventSource(`${URL_API}/backoffice/demandes-clients/flux`, {
      withCredentials: true,
    });
  },

  listerSinistres(parametres?: { statut?: StatutSinistre; recherche?: string }) {
    const recherche = new URLSearchParams();
    if (parametres?.statut) recherche.set("statut_sinistre", parametres.statut);
    if (parametres?.recherche) recherche.set("recherche", parametres.recherche);
    const suffixe = recherche.size ? `?${recherche.toString()}` : "";
    return appeler<ResumeSinistre[]>(`/backoffice/sinistres${suffixe}`);
  },

  obtenirSinistre(reference: string) {
    return appeler<DetailSinistre>(`/backoffice/sinistres/${encodeURIComponent(reference)}`);
  },

  prendreEnChargeSinistre(reference: string) {
    return appeler<DetailSinistre>(
      `/backoffice/sinistres/${encodeURIComponent(reference)}/prise-en-charge`,
      { method: "POST" },
    );
  },

  libererSinistre(reference: string) {
    return appeler<DetailSinistre>(
      `/backoffice/sinistres/${encodeURIComponent(reference)}/liberation`,
      { method: "POST" },
    );
  },

  reaffecterSinistre(reference: string, responsable_id: string, motif: string) {
    return appeler<DetailSinistre>(
      `/backoffice/sinistres/${encodeURIComponent(reference)}/reaffectation`,
      { method: "POST", body: JSON.stringify({ responsable_id, motif }) },
    );
  },

  avancerSinistre(reference: string) {
    return appeler<DetailSinistre>(
      `/backoffice/sinistres/${encodeURIComponent(reference)}/avancement`,
      { method: "POST" },
    );
  },

  creerFluxSinistres() {
    return new EventSource(`${URL_API}/backoffice/sinistres/flux`, {
      withCredentials: true,
    });
  },
};
