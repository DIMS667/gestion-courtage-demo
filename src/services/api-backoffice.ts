export type RoleBackoffice = "courtier" | "admin" | "super_admin";
export type StatutBackoffice = "actif" | "bloque";

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
  produit: "automobile";
  sous_type: "voiture" | "moto_deux_trois_roues";
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
  if (options.body) entetes.set("Content-Type", "application/json");
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

export const apiBackoffice = {
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
};
