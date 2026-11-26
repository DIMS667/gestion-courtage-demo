import catalogue from "../data/metiers.json";

export type CategorieMetierTarifaire =
  | "delegue_medical" | "delegue_inspecteur_commercial" | "publicite"
  | "agent_attache_delegue_commercial" | "inspecteur_voyageur_commerce"
  | "representant_inspecteur_ventes" | "photographe_reporter" | "gardiennage_securite"
  | "boulangerie" | "clerge" | "autre";

export interface Metier { code: string; libelle: string; categorie: CategorieMetierTarifaire; }

export const normaliserRechercheMetier = (value: string) => value.normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/’/g, "'").trim().replace(/\s+/g, " ").toLocaleLowerCase("fr");

const ordreFrancais = new Intl.Collator("fr", { sensitivity: "base" });
export const metiers: readonly Metier[] = [...catalogue as Metier[]]
  .sort((a, b) => ordreFrancais.compare(a.libelle, b.libelle));

export function trouverMetier(value: string | undefined): Metier | undefined {
  if (!value) return undefined;
  const normalise = normaliserRechercheMetier(value);
  return metiers.find(metier => metier.code === value || normaliserRechercheMetier(metier.libelle) === normalise);
}

export function metierDuProfil(profession: string, categorie?: string): Metier | undefined {
  return trouverMetier(profession) ?? (categorie && categorie !== "autre" ? trouverMetier(categorie) : undefined);
}

export function filtrerMetiers(query: string): readonly Metier[] {
  const mots = normaliserRechercheMetier(query).split(/\s+/).filter(Boolean);
  return mots.length ? metiers.filter(metier => mots.every(mot => normaliserRechercheMetier(metier.libelle).includes(mot))) : metiers;
}
