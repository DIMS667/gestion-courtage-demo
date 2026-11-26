import type { OffreAssisteeCreation } from "./api-backoffice";

export type FormulaireOffreAssistee = {
  compagnieId: string; usage: string; energie: "" | "essence" | "diesel";
  puissanceFiscale: string; nombrePlaces: string; zone: "" | "A" | "B" | "C";
  possedeRemorque: boolean; dureeMois: string; dateEffet: string;
  categorieProfession: OffreAssisteeCreation["conducteur"]["categorie_professionnelle"] | "";
  professionAutre: string; dateNaissance: string; permisDelivreLe: string;
  garanties: string[]; recommandee: boolean;
};

export const formulaireOffreAssisteeVide = (): FormulaireOffreAssistee => ({
  compagnieId: "", usage: "", energie: "", puissanceFiscale: "", nombrePlaces: "", zone: "",
  possedeRemorque: false, dureeMois: "", dateEffet: "", categorieProfession: "",
  professionAutre: "", dateNaissance: "", permisDelivreLe: "", garanties: [], recommandee: true,
});

const objet = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const texte = (value: unknown) => typeof value === "string" ? value.trim() : "";
const nombre = (value: unknown) => typeof value === "number" && Number.isInteger(value) && value > 0 ? String(value) : "";

export function preremplirOffreAssistee(donnees: Record<string, unknown>, conducteurHistorique: Record<string, unknown> = {}): FormulaireOffreAssistee {
  const vehicule = objet(donnees.vehicule);
  const couverture = objet(donnees.couverture);
  const conducteur = { ...conducteurHistorique, ...objet(donnees.conducteur) };
  const zone = texte(vehicule.zone_circulation_principale).toUpperCase().replace("ZONE", "").trim();
  const usage = texte(vehicule.usage);
  const aliases: Record<string, string> = { cat1_professionnel: "cat1_tourisme", cat4b_transport_urbain: "cat4a_taxi_ville" };
  return {
    ...formulaireOffreAssisteeVide(),
    usage: aliases[usage] ?? usage,
    energie: vehicule.energie === "essence" || vehicule.energie === "diesel" ? vehicule.energie : "",
    puissanceFiscale: nombre(vehicule.puissance_fiscale),
    nombrePlaces: nombre(vehicule.nombre_places),
    zone: zone === "A" || zone === "B" || zone === "C" ? zone : "",
    possedeRemorque: vehicule.possede_remorque === true,
    dureeMois: nombre(couverture.duree_mois),
    dateEffet: couverture.date_effet_inconnue === true ? "" : texte(couverture.date_effet_souhaitee),
    categorieProfession: texte(conducteur.categorie_professionnelle) as FormulaireOffreAssistee["categorieProfession"],
    professionAutre: texte(conducteur.profession),
    dateNaissance: texte(conducteur.date_naissance),
    permisDelivreLe: texte(conducteur.permis_delivre_le),
    garanties: Array.isArray(couverture.garanties) ? [...new Set(couverture.garanties.filter((value): value is string => typeof value === "string"))] : [],
  };
}
