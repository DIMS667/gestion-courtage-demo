"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  FileBadge,
  ImageUp,
  LoaderCircle,
  ReceiptText,
  ShieldCheck,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  apiBackoffice,
  CompagniePartenaireResume,
  DetailCompagniePartenaire,
  UtilisateurBackoffice,
} from "@/src/services/api-backoffice";

const money = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

const afficherDate = (valeur: string | null | undefined) => {
  if (!valeur) return "Non renseignée";
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(valeur) ? `${valeur}T12:00:00` : valeur);
  if (Number.isNaN(date.getTime())) return "Non renseignée";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const libelleStatut = (valeur: string) =>
  valeur
    .replaceAll("_", " ")
    .replace(/^./, (lettre) => lettre.toUpperCase());

function LogoCompagnie({ compagnie, grand = false }: { compagnie: CompagniePartenaireResume; grand?: boolean }) {
  const dimensions = grand ? "h-24 w-24 text-2xl" : "h-16 w-16 text-lg";
  if (compagnie.logo_url) {
    return (
      <div className={`${dimensions} shrink-0 overflow-hidden rounded-2xl border bg-white p-2 shadow-sm`}>
        {/* L'URL signée provient du stockage privé R2 configuré par l'API. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={compagnie.logo_url} alt={`Logo ${compagnie.nom}`} className="h-full w-full object-contain" />
      </div>
    );
  }
  return (
    <div
      className={`${dimensions} flex shrink-0 items-center justify-center rounded-2xl bg-[#10294b] font-bold text-white shadow-sm`}
      aria-label={`Logo non renseigné pour ${compagnie.nom}`}
    >
      {compagnie.sigle}
    </div>
  );
}

function Indicateur({ label, valeur }: { label: string; valeur: number }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <p className="text-2xl font-semibold text-[#10294b]">{valeur}</p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
      </CardContent>
    </Card>
  );
}

function EtatVide({ texte }: { texte: string }) {
  return <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">{texte}</div>;
}

function ListePartenaires({
  compagnies,
  chargement,
  onOuvrir,
}: {
  compagnies: CompagniePartenaireResume[];
  chargement: boolean;
  onOuvrir: (compagnie: CompagniePartenaireResume) => void;
}) {
  return (
    <>
      <div className="module-heading">
        <div>
          <p className="eyebrow">Réseau assureurs</p>
          <h1>Partenaires</h1>
          <p>Consultez chaque compagnie, ses barèmes et toute son activité liée.</p>
        </div>
      </div>
      {chargement ? (
        <div className="dashboard-skeleton" aria-label="Chargement des partenaires">
          <div className="skeleton skeleton--panel" />
        </div>
      ) : compagnies.length ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {compagnies.map((compagnie) => (
            <button
              type="button"
              key={compagnie.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => onOuvrir(compagnie)}
            >
              <div className="flex items-start gap-4">
                <LogoCompagnie compagnie={compagnie} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-semibold text-[#10294b]">{compagnie.nom}</h2>
                      <p className="text-sm text-slate-500">{compagnie.code}</p>
                    </div>
                    <Badge variant="outline">{libelleStatut(compagnie.statut)}</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2 border-t pt-4 text-center">
                <div><strong className="block text-[#10294b]">{compagnie.nombre_baremes}</strong><span className="text-xs text-slate-500">Barèmes</span></div>
                <div><strong className="block text-[#10294b]">{compagnie.nombre_offres}</strong><span className="text-xs text-slate-500">Offres</span></div>
                <div><strong className="block text-[#10294b]">{compagnie.nombre_contrats}</strong><span className="text-xs text-slate-500">Contrats</span></div>
                <div><strong className="block text-[#10294b]">{compagnie.nombre_sinistres}</strong><span className="text-xs text-slate-500">Sinistres</span></div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EtatVide texte="Aucune compagnie d’assurance n’est enregistrée." />
      )}
    </>
  );
}

function DetailPartenaire({
  compagnie,
  utilisateur,
  chargementLogo,
  onRetour,
  onLogo,
}: {
  compagnie: DetailCompagniePartenaire;
  utilisateur: UtilisateurBackoffice;
  chargementLogo: boolean;
  onRetour: () => void;
  onLogo: (fichier: File) => void;
}) {
  const champLogo = useRef<HTMLInputElement>(null);
  const choisirLogo = (fichier: File | undefined) => {
    if (!fichier) return;
    onLogo(fichier);
    if (champLogo.current) champLogo.current.value = "";
  };
  return (
    <>
      <Button variant="ghost" className="mb-4" onClick={onRetour}><ArrowLeft />Toutes les compagnies</Button>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-5">
            <LogoCompagnie compagnie={compagnie} grand />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-[#10294b]">{compagnie.nom}</h1>
                <Badge variant="outline">{libelleStatut(compagnie.statut)}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">{compagnie.sigle} · {compagnie.code}</p>
              {compagnie.logo_modifie_le && <p className="mt-2 text-xs text-slate-400">Logo modifié le {afficherDate(compagnie.logo_modifie_le)}</p>}
            </div>
          </div>
          {utilisateur.role === "super_admin" && (
            <>
              <input
                ref={champLogo}
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => choisirLogo(event.target.files?.[0])}
              />
              <Button disabled={chargementLogo} onClick={() => champLogo.current?.click()}>
                {chargementLogo ? <LoaderCircle className="animate-spin" /> : <ImageUp />}
                Changer le logo
              </Button>
            </>
          )}
        </div>
      </section>

      <div className="my-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Indicateur label="Barèmes tarifaires" valeur={compagnie.nombre_baremes} />
        <Indicateur label="Offres liées" valeur={compagnie.nombre_offres} />
        <Indicateur label="Contrats liés" valeur={compagnie.nombre_contrats} />
        <Indicateur label="Sinistres liés" valeur={compagnie.nombre_sinistres} />
      </div>

      <Tabs defaultValue="baremes" className="space-y-4">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="baremes"><FileBadge />Barèmes</TabsTrigger>
          <TabsTrigger value="offres"><ReceiptText />Offres</TabsTrigger>
          <TabsTrigger value="contrats"><ShieldCheck />Contrats</TabsTrigger>
          <TabsTrigger value="paiements"><WalletCards />Paiements</TabsTrigger>
          <TabsTrigger value="sinistres"><TriangleAlert />Sinistres</TabsTrigger>
        </TabsList>

        <TabsContent value="baremes" className="space-y-4">
          {compagnie.baremes.length ? compagnie.baremes.map((bareme) => (
            <Card key={bareme.id} className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{bareme.produit}</p>
                    <h2 className="mt-1 text-lg font-semibold text-[#10294b]">{bareme.code}</h2>
                    <p className="text-sm text-slate-500">{bareme.libelle}</p>
                  </div>
                  <Badge variant="outline">{libelleStatut(bareme.statut)}</Badge>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div><dt className="text-slate-500">Partenaire indiqué</dt><dd className="font-medium">{bareme.partenaire ?? "Aucun"}</dd></div>
                  <div><dt className="text-slate-500">Document signé</dt><dd className="font-medium">{afficherDate(bareme.date_signature_document)}</dd></div>
                  <div><dt className="text-slate-500">Période de validité</dt><dd className="font-medium">{bareme.valide_du ? `${afficherDate(bareme.valide_du)} — ${afficherDate(bareme.valide_au)}` : "Non indiquée"}</dd></div>
                </dl>
                {!bareme.paiement_autorise && bareme.raison_suspension && (
                  <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span><strong>Paiement suspendu :</strong> {bareme.raison_suspension}</span>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
                  <span><strong>{bareme.nombre_regles}</strong> règles</span>
                  <span><strong>{bareme.nombre_franchises}</strong> franchises</span>
                  <span><strong>{bareme.nombre_reductions}</strong> réductions</span>
                  <span><strong>{bareme.nombre_formules}</strong> formules</span>
                  <span><strong>{bareme.nombre_tarifs}</strong> tarifs</span>
                  <span><strong>{bareme.nombre_prestations}</strong> prestations</span>
                </div>
              </CardContent>
            </Card>
          )) : <EtatVide texte="Aucun barème n’est rattaché à cette compagnie." />}

          {compagnie.garanties_tarifaires.length > 0 && (
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <CardContent className="p-0">
                <div className="border-b p-5"><h2 className="font-semibold text-[#10294b]">Détail des règles tarifaires</h2><p className="text-sm text-slate-500">Chaque règle reste exclusivement rattachée à cette compagnie.</p></div>
                <div className="max-h-[34rem] overflow-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Cat.</TableHead><TableHead>Garantie</TableHead><TableHead>Règle</TableHead><TableHead>Taux</TableHead><TableHead>Assiette</TableHead></TableRow></TableHeader>
                    <TableBody>{compagnie.garanties_tarifaires.map((regle) => (
                      <TableRow key={`${regle.categorie}-${regle.garantie_code}`}>
                        <TableCell>{regle.categorie}</TableCell>
                        <TableCell className="font-medium">{regle.garantie_libelle}</TableCell>
                        <TableCell>{libelleStatut(regle.type_regle)}</TableCell>
                        <TableCell>{regle.taux_pourcent === null ? "—" : `${Number(regle.taux_pourcent).toLocaleString("fr-FR")} %`}</TableCell>
                        <TableCell>{regle.assiette ? libelleStatut(regle.assiette) : "—"}</TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {compagnie.formules_sante.length > 0 && (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-4">
                  <h2 className="font-semibold text-[#10294b]">Formules santé B-CARE</h2>
                  <p className="text-sm text-slate-500">Couvertures rattachées exclusivement à PRUDENTIAL BENEFICIAL.</p>
                </div>
                <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
                  {compagnie.formules_sante.map((formule) => (
                    <div key={formule.id} className="rounded-xl border border-slate-200 p-4">
                      <h3 className="font-semibold text-[#10294b]">{formule.libelle}</h3>
                      <p className="mt-2 text-sm"><span className="text-slate-500">Zone :</span> {formule.zone_couverture}</p>
                      <p className="mt-1 text-sm"><span className="text-slate-500">Réseau :</span> {formule.reseau_soins}</p>
                      <p className="mt-1 text-sm"><span className="text-slate-500">Plafond :</span> {money.format(formule.plafond_couverture_xaf)}{formule.plafond_alternatif_xaf ? ` / ${money.format(formule.plafond_alternatif_xaf)}` : ""}</p>
                      <div className="mt-3 border-t pt-3 text-xs text-slate-600">
                        <p>Capitaux décès : assuré {money.format(formule.capital_assure_xaf)}, conjoint {money.format(formule.capital_conjoint_xaf)}, enfant {money.format(formule.capital_enfant_xaf)}</p>
                        <p className="mt-1">RC chef de famille : {formule.responsabilite_civile_note}</p>
                        {formule.plafond_note && <p className="mt-2 text-amber-700">{formule.plafond_note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {compagnie.tarifs_sante.length > 0 && (
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <CardContent className="p-0">
                <div className="border-b p-5">
                  <h2 className="font-semibold text-[#10294b]">Primes annuelles TTC B-CARE</h2>
                  <p className="text-sm text-slate-500">Les PTTC sont repris tels qu’imprimés dans le document source.</p>
                </div>
                <div className="overflow-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Formule</TableHead><TableHead>Bénéficiaire</TableHead><TableHead>Maladie</TableHead><TableHead>Frais funéraires</TableHead><TableHead>TVA</TableHead><TableHead>Carte</TableHead><TableHead>RC</TableHead><TableHead>Assistance</TableHead><TableHead>PTTC imprimé</TableHead><TableHead>État</TableHead></TableRow></TableHeader>
                    <TableBody>{compagnie.tarifs_sante.map((tarif) => (
                      <TableRow key={`${tarif.formule_code}-${tarif.beneficiaire}`}>
                        <TableCell className="font-medium">{tarif.formule_libelle}</TableCell>
                        <TableCell>{libelleStatut(tarif.beneficiaire)}</TableCell>
                        <TableCell>{money.format(tarif.prime_maladie_xaf)}</TableCell>
                        <TableCell>{money.format(tarif.frais_funeraires_xaf)}</TableCell>
                        <TableCell>{money.format(tarif.tva_xaf)}</TableCell>
                        <TableCell>{money.format(tarif.carte_biometrique_xaf)}</TableCell>
                        <TableCell>{tarif.responsabilite_civile_xaf === null ? "—" : money.format(tarif.responsabilite_civile_xaf)}</TableCell>
                        <TableCell>{tarif.assistance_xaf === null ? "Exclue" : money.format(tarif.assistance_xaf)}</TableCell>
                        <TableCell className="font-semibold">{money.format(tarif.prime_ttc_imprimee_xaf)}</TableCell>
                        <TableCell>{tarif.ambiguite ? <Badge className="border-amber-300 bg-amber-50 text-amber-800" variant="outline">Ambigu</Badge> : <Badge variant="outline">Imprimé</Badge>}</TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {compagnie.prestations_sante.length > 0 && (
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <CardContent className="p-0">
                <div className="border-b p-5"><h2 className="font-semibold text-[#10294b]">Prestations B-CARE</h2></div>
                <div className="overflow-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Formule</TableHead><TableHead>Prestation</TableHead><TableHead>Couverture</TableHead></TableRow></TableHeader>
                    <TableBody>{compagnie.prestations_sante.map((prestation) => (
                      <TableRow key={`${prestation.formule_code}-${prestation.code}`}>
                        <TableCell className="font-medium">{prestation.formule_libelle}</TableCell>
                        <TableCell>{prestation.libelle}</TableCell>
                        <TableCell>{prestation.taux_pourcent !== null ? `${Number(prestation.taux_pourcent)} %` : prestation.montant_xaf !== null ? `${money.format(prestation.montant_xaf)}${prestation.unite === "par_jour" ? " / jour" : ""}` : prestation.note || libelleStatut(prestation.unite)}</TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {compagnie.regles_age_sante.length > 0 && (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <h2 className="font-semibold text-[#10294b]">Règles d’âge B-CARE</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {compagnie.regles_age_sante.map((regle) => (
                    <div key={regle.age_min} className="rounded-xl border p-3 text-sm">
                      <p className="font-medium">{regle.age_max === null ? `${regle.age_min} ans et plus` : `${regle.age_min} à ${regle.age_max} ans`}</p>
                      <p className={`mt-1 ${regle.exclu ? "text-red-700" : "text-slate-600"}`}>{regle.exclu ? "Exclu" : regle.majoration_pourcent && Number(regle.majoration_pourcent) > 0 ? `Majoration de ${Number(regle.majoration_pourcent)} %` : "Tarif normal"}</p>
                      {regle.note && <p className="mt-2 text-xs text-slate-500">{regle.note}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="offres">
          {compagnie.offres.length ? <Card className="overflow-hidden"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Offre</TableHead><TableHead>Demande</TableHead><TableHead>Produit</TableHead><TableHead>Origine</TableHead><TableHead>Prime</TableHead><TableHead>État</TableHead></TableRow></TableHeader><TableBody>{compagnie.offres.map((offre) => <TableRow key={offre.id}><TableCell className="font-medium">{offre.reference}</TableCell><TableCell>{offre.demande_reference}</TableCell><TableCell>{offre.produit}{offre.formule_tarifaire_code ? ` · ${offre.formule_tarifaire_code}` : ""}</TableCell><TableCell><Badge variant={offre.origine === "automatique" ? "secondary" : "outline"}>{offre.origine === "automatique" ? "Automatique" : "Manuelle"}</Badge></TableCell><TableCell>{money.format(offre.prime_xaf)}</TableCell><TableCell>{offre.selectionnee ? "Sélectionnée" : !offre.transmise ? "Brouillon" : offre.recommandee ? "Recommandée" : "Envoyée au client"}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card> : <EtatVide texte="Aucune offre n’est encore liée à cette compagnie." />}
        </TabsContent>

        <TabsContent value="contrats">
          {compagnie.contrats.length ? <Card className="overflow-hidden"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Contrat</TableHead><TableHead>Demande</TableHead><TableHead>Produit</TableHead><TableHead>Prime</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{compagnie.contrats.map((contrat) => <TableRow key={contrat.id}><TableCell className="font-medium">{contrat.numero_police ?? contrat.reference}</TableCell><TableCell>{contrat.demande_reference}</TableCell><TableCell>{contrat.produit}</TableCell><TableCell>{money.format(contrat.prime_xaf)}</TableCell><TableCell>{libelleStatut(contrat.statut)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card> : <EtatVide texte="Aucun contrat n’est encore lié à cette compagnie." />}
        </TabsContent>

        <TabsContent value="paiements">
          {compagnie.paiements.length ? <Card className="overflow-hidden"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Paiement</TableHead><TableHead>Demande</TableHead><TableHead>Montant</TableHead><TableHead>Opérateur</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{compagnie.paiements.map((paiement) => <TableRow key={paiement.id}><TableCell className="font-medium">{paiement.reference}</TableCell><TableCell>{paiement.demande_reference}</TableCell><TableCell>{money.format(paiement.montant_xaf)}</TableCell><TableCell>{paiement.operateur ?? "—"}</TableCell><TableCell>{libelleStatut(paiement.statut)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card> : <EtatVide texte="Aucun paiement n’est encore lié à cette compagnie." />}
        </TabsContent>

        <TabsContent value="sinistres">
          {compagnie.sinistres.length ? <Card className="overflow-hidden"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Sinistre</TableHead><TableHead>Contrat</TableHead><TableHead>Produit</TableHead><TableHead>Date</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{compagnie.sinistres.map((sinistre) => <TableRow key={sinistre.id}><TableCell className="font-medium">{sinistre.reference}</TableCell><TableCell>{sinistre.contrat_reference}</TableCell><TableCell>{sinistre.produit}</TableCell><TableCell>{afficherDate(sinistre.date_sinistre)}</TableCell><TableCell>{libelleStatut(sinistre.statut)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card> : <EtatVide texte="Aucun sinistre n’est encore lié à cette compagnie." />}
        </TabsContent>
      </Tabs>
    </>
  );
}

export function PartenairesView({ utilisateur }: { utilisateur: UtilisateurBackoffice }) {
  const [compagnies, setCompagnies] = useState<CompagniePartenaireResume[]>([]);
  const [detail, setDetail] = useState<DetailCompagniePartenaire | null>(null);
  const [chargement, setChargement] = useState(true);
  const [chargementDetail, setChargementDetail] = useState(false);
  const [chargementLogo, setChargementLogo] = useState(false);

  const chargerListe = async () => {
    const liste = await apiBackoffice.listerPartenaires();
    setCompagnies(liste);
  };

  useEffect(() => {
    let actif = true;
    apiBackoffice.listerPartenaires()
      .then((liste) => { if (actif) setCompagnies(liste); })
      .catch((cause) => { if (actif) toast.error(cause instanceof Error ? cause.message : "Chargement des partenaires impossible."); })
      .finally(() => { if (actif) setChargement(false); });
    return () => { actif = false; };
  }, []);

  const ouvrir = async (compagnie: CompagniePartenaireResume) => {
    setChargementDetail(true);
    try {
      setDetail(await apiBackoffice.obtenirPartenaire(compagnie.id));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Chargement de la compagnie impossible.");
    } finally {
      setChargementDetail(false);
    }
  };

  const changerLogo = async (fichier: File) => {
    if (!detail) return;
    setChargementLogo(true);
    try {
      const misAJour = await apiBackoffice.modifierLogoPartenaire(detail.id, fichier);
      setDetail(misAJour);
      await chargerListe();
      toast.success("Le logo de la compagnie a été mis à jour.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Modification du logo impossible.");
    } finally {
      setChargementLogo(false);
    }
  };

  if (chargementDetail) return <div className="dashboard-skeleton" aria-label="Chargement de la compagnie"><div className="skeleton skeleton--panel" /></div>;
  if (detail) return <DetailPartenaire compagnie={detail} utilisateur={utilisateur} chargementLogo={chargementLogo} onRetour={() => setDetail(null)} onLogo={(fichier) => void changerLogo(fichier)} />;
  return <ListePartenaires compagnies={compagnies} chargement={chargement} onOuvrir={(compagnie) => void ouvrir(compagnie)} />;
}
