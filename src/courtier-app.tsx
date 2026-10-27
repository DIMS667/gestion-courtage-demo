"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BadgeCent,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileCheck2,
  FileClock,
  FilePlus2,
  FileText,
  Files,
  Gauge,
  Inbox,
  LoaderCircle,
  LogOut,
  LockKeyhole,
  PackageCheck,
  Plus,
  ReceiptText,
  RefreshCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Eye,
  TriangleAlert,
  UserCog,
  Users,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { Claim, Client, createDemoData, DemoData, Offer, Opportunity, Policy, Proposal, companies, products, users } from "@/src/demo-data";
import { apiBackoffice, DetailDemandeClient, DetailSinistre, enregistrerSession, IntervenantDemande, oublierSession, ReponseAuthentification, ResumeDemandeClient, ResumeSinistre, RoleBackoffice, StatutBackoffice, StatutDemande, StatutSinistre, UtilisateurBackoffice } from "@/src/services/api-backoffice";

const STORAGE_KEY = "gestion-courtage-demo-v1";
const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 });
const shortMoney = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1).replace(".0", "")} M FCFA` : money.format(value).replace("XAF", "FCFA");
const displayDate = (value: string) => new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));

const lireReferenceDemandeUrl = () => {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("demande");
};
const estVueDemandesUrl = () => typeof window !== "undefined" && (Boolean(lireReferenceDemandeUrl()) || new URLSearchParams(window.location.search).get("vue") === "demandes");
const lireReferenceSinistreUrl = () => typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("sinistre");
const estVueSinistresUrl = () => typeof window !== "undefined" && (Boolean(lireReferenceSinistreUrl()) || new URLSearchParams(window.location.search).get("vue") === "sinistres");

type ModuleId = "dashboard" | "requests" | "clients" | "opportunities" | "activities" | "proposals" | "policies" | "transactions" | "products" | "companies" | "transmissions" | "invoices" | "payments" | "commissions" | "documents" | "renewals" | "claims" | "reports" | "users" | "roles" | "settings";

const navGroups: Array<{ label: string; items: Array<{ id: ModuleId; label: string; icon: typeof Gauge }> }> = [
  { label: "", items: [{ id: "dashboard", label: "Tableau de bord", icon: Gauge }] },
  { label: "CRM", items: [{ id: "requests", label: "Demandes clients", icon: Inbox }, { id: "clients", label: "Clients", icon: Users }, { id: "opportunities", label: "Opportunités", icon: BriefcaseBusiness }, { id: "activities", label: "Activités", icon: Activity }] },
  { label: "Production", items: [{ id: "proposals", label: "Propositions", icon: FileCheck2 }, { id: "policies", label: "Polices", icon: ShieldCheck }, { id: "transactions", label: "Transactions", icon: ClipboardCheck }, { id: "products", label: "Produits", icon: PackageCheck }] },
  { label: "Partenaires", items: [{ id: "companies", label: "Compagnies", icon: Building2 }, { id: "transmissions", label: "Transmissions assureurs", icon: FileClock }] },
  { label: "Finance", items: [{ id: "invoices", label: "Factures", icon: ReceiptText }, { id: "payments", label: "Paiements", icon: WalletCards }, { id: "commissions", label: "Commissions", icon: BadgeCent }] },
  { label: "Gestion", items: [{ id: "documents", label: "Documents", icon: Files }, { id: "renewals", label: "Renouvellements", icon: CalendarClock }, { id: "claims", label: "Sinistres", icon: TriangleAlert }] },
  { label: "Pilotage", items: [{ id: "reports", label: "Rapports", icon: ChartNoAxesCombined }] },
  { label: "Administration", items: [{ id: "users", label: "Utilisateurs", icon: UserCog }] },
];

const moduleLabels = Object.fromEntries(navGroups.flatMap((group) => group.items.map((item) => [item.id, item.label]))) as Record<ModuleId, string>;
const stageList: Opportunity["stage"][] = ["Découverte", "Étude", "Proposition", "Négociation", "Gagné", "Perdu"];
const claimStatusList: Claim["status"][] = ["Déclaré", "Documents en attente", "Transmis", "Expertise", "En traitement", "Indemnisé", "Clôturé"];
const companyName = (id: string) => companies.find((company) => company.id === id)?.name ?? id;

function StatusBadge({ value }: { value: string }) {
  const key = value.toLowerCase();
  const tone = /actif|active|payée|validé|reçue|acceptée|gagné|traité|indemnisé/.test(key)
    ? "success"
    : /impayée|rejeté|refusée|perdu|résiliée|expirée/.test(key)
      ? "danger"
      : /attente|préparation|partielle|proche|expertise|étude|négociation/.test(key)
        ? "warning"
        : "info";
  return <span className={`status status--${tone}`}>{value}</span>;
}

function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="module-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

function TableCard({ children }: { children: React.ReactNode }) {
  return <Card className="table-card"><CardContent className="p-0">{children}</CardContent></Card>;
}

function NavItem({ item, current, onSelect, notification }: { item: { id: ModuleId; label: string; icon: typeof Gauge }; current: ModuleId; onSelect: (id: ModuleId) => void; notification?: number }) {
  const { isMobile, setOpenMobile } = useSidebar();
  return <SidebarMenuItem><SidebarMenuButton onClick={() => { onSelect(item.id); if (isMobile) setOpenMobile(false); }} isActive={current===item.id} tooltip={item.label} className="h-9 text-blue-100 hover:bg-white/10 hover:text-white data-[active=true]:bg-white data-[active=true]:text-[#15385f]"><item.icon/><span>{item.label}</span>{Boolean(notification)&&<span className="nav-notification">{notification!>99?"99+":notification}</span>}</SidebarMenuButton></SidebarMenuItem>;
}

function Login({ onConnect }: { onConnect: (utilisateur: UtilisateurBackoffice) => void }) {
  const [adresseEmail, setAdresseEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [code, setCode] = useState("");
  const [etape, setEtape] = useState<"connexion" | "mot_de_passe" | "mfa" | "configuration_mfa">("connexion");
  const [defi, setDefi] = useState("");
  const [secretTotp, setSecretTotp] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const traiter = (reponse: ReponseAuthentification) => {
    if (reponse.statut === "connecte") {
      enregistrerSession(reponse);
      onConnect(reponse.utilisateur);
      return;
    }
    setDefi(reponse.defi);
    if (reponse.statut === "mot_de_passe_a_changer") setEtape("mot_de_passe");
    if (reponse.statut === "mfa_requis") setEtape("mfa");
    if (reponse.statut === "configuration_mfa_requise") {
      setSecretTotp(reponse.secret_totp);
      setEtape("configuration_mfa");
    }
  };

  const executer = async (action: () => Promise<ReponseAuthentification>) => {
    setErreur("");
    setChargement(true);
    try {
      traiter(await action());
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : "La connexion a échoué.");
    } finally {
      setChargement(false);
    }
  };

  const soumettreConnexion = (event: React.FormEvent) => {
    event.preventDefault();
    void executer(() => apiBackoffice.connecter(adresseEmail, motDePasse));
  };

  const soumettreMotDePasse = (event: React.FormEvent) => {
    event.preventDefault();
    if (nouveauMotDePasse !== confirmation) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }
    void executer(() => apiBackoffice.changerMotDePasse(defi, nouveauMotDePasse));
  };

  const soumettreMfa = (event: React.FormEvent) => {
    event.preventDefault();
    void executer(() => apiBackoffice.verifierMfa(defi, code, etape === "configuration_mfa"));
  };

  return <main className="login-shell">
    <section className="login-story">
      <div className="brand-mark brand-mark--light">GC</div>
      <div className="login-story__copy"><p className="eyebrow eyebrow--light">Espace interne du courtier</p><h1>Une vision claire de toute l’activité de courtage.</h1><p>Clients, production, finance et sinistres réunis dans un même espace de travail.</p></div>
      <div className="login-proof"><span>184 clients actifs</span><span>267 polices suivies</span><span>42,6 M FCFA encaissés</span></div>
    </section>
    <section className="login-panel"><div className="login-card">
      <div className="brand-mobile"><div className="brand-mark">GC</div><span>Gestion du courtage</span></div>
      <p className="eyebrow">Accès sécurisé</p><h2>{etape === "connexion" ? "Bienvenue" : etape === "mot_de_passe" ? "Nouveau mot de passe" : "Vérification en deux étapes"}</h2>
      {etape === "connexion" && <form onSubmit={soumettreConnexion}>
        <p className="login-card__intro">Connectez-vous avec votre compte interne Follow-Up.</p>
        <Label>Adresse e-mail</Label><Input className="mb-4 mt-2 h-11" value={adresseEmail} onChange={(event)=>setAdresseEmail(event.target.value)} autoComplete="username" required type="email" />
        <Label>Mot de passe</Label><Input className="mb-5 mt-2 h-11" value={motDePasse} onChange={(event)=>setMotDePasse(event.target.value)} autoComplete="current-password" required type="password" />
        {erreur && <p className="auth-error">{erreur}</p>}
        <Button className="h-11 w-full" disabled={chargement} type="submit">{chargement ? <LoaderCircle className="animate-spin"/> : <LockKeyhole/>}Se connecter</Button>
      </form>}
      {etape === "mot_de_passe" && <form onSubmit={soumettreMotDePasse}>
        <p className="login-card__intro">Votre mot de passe temporaire doit être remplacé avant le premier accès.</p>
        <Label>Nouveau mot de passe</Label><Input className="mb-4 mt-2 h-11" minLength={10} value={nouveauMotDePasse} onChange={(event)=>setNouveauMotDePasse(event.target.value)} autoComplete="new-password" required type="password" />
        <Label>Confirmer le mot de passe</Label><Input className="mb-5 mt-2 h-11" minLength={10} value={confirmation} onChange={(event)=>setConfirmation(event.target.value)} autoComplete="new-password" required type="password" />
        {erreur && <p className="auth-error">{erreur}</p>}
        <Button className="h-11 w-full" disabled={chargement} type="submit">Continuer</Button>
      </form>}
      {(etape === "mfa" || etape === "configuration_mfa") && <form onSubmit={soumettreMfa}>
        <p className="login-card__intro">{etape === "configuration_mfa" ? "Ajoutez d’abord cette clé dans Google Authenticator, Microsoft Authenticator ou toute application TOTP, puis saisissez le code généré." : "Saisissez le code à 6 chiffres de votre application d’authentification."}</p>
        {etape === "configuration_mfa" && <div className="totp-secret"><span>Clé de configuration</span><strong>{secretTotp}</strong></div>}
        <Label>Code de sécurité</Label><Input className="mb-5 mt-2 h-11" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" value={code} onChange={(event)=>setCode(event.target.value.replace(/\D/g,""))} autoComplete="one-time-code" required />
        {erreur && <p className="auth-error">{erreur}</p>}
        <Button className="h-11 w-full" disabled={chargement} type="submit">Vérifier et continuer</Button>
      </form>}
      <p className="demo-note">Accès réservé aux collaborateurs autorisés.</p>
    </div></section>
  </main>;
}

const libellesRoles: Record<RoleBackoffice, string> = { courtier: "Courtier", admin: "Administrateur", super_admin: "Super-administrateur" };

function UsersView({ utilisateurCourantId }: { utilisateurCourantId: string }) {
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurBackoffice[]>([]);
  const [chargement, setChargement] = useState(true);
  const [dialogueCreation, setDialogueCreation] = useState(false);
  const [selection, setSelection] = useState<UtilisateurBackoffice | null>(null);
  const [nom, setNom] = useState(""); const [email, setEmail] = useState(""); const [telephone, setTelephone] = useState("");
  const [role, setRole] = useState<RoleBackoffice>("courtier"); const [statutCompte, setStatutCompte] = useState<StatutBackoffice>("actif"); const [motDePasse, setMotDePasse] = useState("");

  const charger = async () => {
    setChargement(true);
    try { setUtilisateurs(await apiBackoffice.listerUtilisateurs()); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "Impossible de charger les utilisateurs."); }
    finally { setChargement(false); }
  };
  useEffect(()=>{let actif=true;apiBackoffice.listerUtilisateurs().then((liste)=>{if(actif)setUtilisateurs(liste);}).catch((cause)=>{if(actif)toast.error(cause instanceof Error ? cause.message : "Impossible de charger les utilisateurs.");}).finally(()=>{if(actif)setChargement(false);});return()=>{actif=false};},[]);

  const ouvrirCreation = () => { setNom("");setEmail("");setTelephone("");setRole("courtier");setStatutCompte("actif");setMotDePasse("");setDialogueCreation(true); };
  const ouvrirModification = (utilisateur: UtilisateurBackoffice) => { setSelection(utilisateur);setNom(utilisateur.nom_complet);setTelephone(utilisateur.numero_telephone);setRole(utilisateur.role);setStatutCompte(utilisateur.statut);setMotDePasse(""); };
  const creer = async () => { try { await apiBackoffice.creerUtilisateur({nom_complet:nom,adresse_email:email,numero_telephone:telephone,role,mot_de_passe_temporaire:motDePasse});setDialogueCreation(false);toast.success("Compte créé avec un mot de passe temporaire.");await charger(); } catch(cause){toast.error(cause instanceof Error?cause.message:"Création impossible.");} };
  const modifier = async () => { if(!selection)return;try{await apiBackoffice.modifierUtilisateur(selection.id,{nom_complet:nom,numero_telephone:telephone,role,statut:statutCompte});setSelection(null);toast.success("Compte mis à jour.");await charger();}catch(cause){toast.error(cause instanceof Error?cause.message:"Modification impossible.");} };
  const reinitialiser = async () => { if(!selection||motDePasse.length<10)return;try{await apiBackoffice.reinitialiserMotDePasse(selection.id,motDePasse);setSelection(null);toast.success("Mot de passe temporaire enregistré. Les sessions actives ont été révoquées.");await charger();}catch(cause){toast.error(cause instanceof Error?cause.message:"Réinitialisation impossible.");} };

  const afficheMotDePasseTemporaire=dialogueCreation||selection?.id!==utilisateurCourantId;
  const formulaire = <div className="user-form"><Label>Nom complet</Label><Input value={nom} onChange={(e)=>setNom(e.target.value)}/>{dialogueCreation&&<><Label>Adresse e-mail</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}/></>}<Label>Numéro de téléphone</Label><Input value={telephone} onChange={(e)=>setTelephone(e.target.value)}/><Label>Rôle</Label><Select value={role} onValueChange={(valeur)=>setRole(valeur as RoleBackoffice)}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(libellesRoles).map(([valeur,libelle])=><SelectItem key={valeur} value={valeur}>{libelle}</SelectItem>)}</SelectContent></Select>{!dialogueCreation&&<><Label>Statut</Label><Select value={statutCompte} onValueChange={(valeur)=>setStatutCompte(valeur as StatutBackoffice)}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="bloque">Bloqué</SelectItem></SelectContent></Select></>}{afficheMotDePasseTemporaire&&<><Label>{dialogueCreation?"Mot de passe temporaire":"Réinitialiser avec un mot de passe temporaire (facultatif)"}</Label><Input type="password" minLength={10} value={motDePasse} onChange={(e)=>setMotDePasse(e.target.value)} placeholder="10 caractères minimum"/></>}</div>;

  return <><PageHeading eyebrow="Administration" title="Utilisateurs du Backoffice" subtitle="Créez les accès internes et attribuez les rôles autorisés." action={<Button onClick={ouvrirCreation}><Plus/>Ajouter un utilisateur</Button>}/>{chargement?<div className="loading-state"><LoaderCircle className="animate-spin"/>Chargement…</div>:<div className="user-grid">{utilisateurs.map((utilisateur)=><button type="button" className="user-card user-card--button" key={utilisateur.id} onClick={()=>ouvrirModification(utilisateur)}><div className="user-avatar">{utilisateur.nom_complet.split(" ").map((n)=>n[0]).join("").slice(0,2)}</div><div><strong>{utilisateur.nom_complet}</strong><span>{utilisateur.adresse_email}</span><Badge variant="secondary">{libellesRoles[utilisateur.role]}</Badge>{utilisateur.mfa_active&&<small>MFA actif</small>}</div><StatusBadge value={utilisateur.statut}/></button>)}</div>}
    <Dialog open={dialogueCreation} onOpenChange={setDialogueCreation}><DialogContent><DialogHeader><DialogTitle>Créer un accès Backoffice</DialogTitle><DialogDescription>L’utilisateur changera ce mot de passe lors de sa première connexion.</DialogDescription></DialogHeader>{formulaire}<DialogFooter><Button variant="outline" onClick={()=>setDialogueCreation(false)}>Annuler</Button><Button disabled={!nom||!email||motDePasse.length<10} onClick={()=>void creer()}>Créer le compte</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={Boolean(selection)} onOpenChange={(ouvert)=>!ouvert&&setSelection(null)}><DialogContent><DialogHeader><DialogTitle>Modifier l’utilisateur</DialogTitle><DialogDescription>{selection?.adresse_email}</DialogDescription></DialogHeader>{formulaire}<DialogFooter className="user-dialog-actions">{selection?.id!==utilisateurCourantId&&<Button variant="outline" disabled={motDePasse.length<10} onClick={()=>void reinitialiser()}>Attribuer le mot de passe temporaire</Button>}<Button onClick={()=>void modifier()}>Enregistrer</Button></DialogFooter></DialogContent></Dialog>
  </>;
}

const chaineStatutsDemandes: Array<{statut:StatutDemande;libelle:string;description:string}>=[
  {statut:"nouvelle",libelle:"À traiter",description:"La demande attend sa prise en charge."},
  {statut:"en_analyse",libelle:"Analyse du dossier",description:"Le responsable étudie les informations du client."},
  {statut:"documents_requis",libelle:"Informations à compléter",description:"Des informations ou documents du client sont attendus."},
  {statut:"propositions_disponibles",libelle:"Proposition disponible",description:"Une proposition a été transmise au client."},
  {statut:"offre_selectionnee",libelle:"Souscription en cours",description:"Le client a retenu une proposition."},
  {statut:"paiement_en_attente",libelle:"Paiement en attente",description:"Le règlement nécessaire est attendu."},
  {statut:"contrat_en_preparation",libelle:"Contrat en préparation",description:"La compagnie prépare les documents contractuels."},
  {statut:"police_disponible",libelle:"Police disponible",description:"La police d’assurance est à la disposition du client."},
  {statut:"finalisee",libelle:"Terminée",description:"Le parcours de souscription est achevé."},
];
const libellesStatutsDemandes=Object.fromEntries(chaineStatutsDemandes.map((etape)=>[etape.statut,etape.libelle])) as Record<StatutDemande,string>;
const chaineStatutsSinistres:Array<{statut:StatutSinistre;libelle:string;description:string}>=[
  {statut:"declare",libelle:"Déclaré",description:"La déclaration a été reçue."},
  {statut:"en_analyse",libelle:"En analyse",description:"Le responsable analyse les circonstances."},
  {statut:"documents_en_attente",libelle:"Documents en attente",description:"Des justificatifs complémentaires sont attendus."},
  {statut:"documents_verifies",libelle:"Documents vérifiés",description:"Les pièces du dossier ont été contrôlées."},
  {statut:"transmis_assureur",libelle:"Transmis à l’assureur",description:"Le dossier est entre les mains de la compagnie."},
  {statut:"expertise",libelle:"Expertise",description:"L’évaluation du sinistre est en cours."},
  {statut:"decision",libelle:"Décision",description:"La décision de l’assureur est attendue ou reçue."},
  {statut:"indemnisation_en_cours",libelle:"Indemnisation en cours",description:"Le règlement est en préparation."},
  {statut:"indemnise",libelle:"Indemnisé",description:"L’indemnisation a été effectuée."},
  {statut:"cloture",libelle:"Clôturé",description:"Le dossier est terminé."},
];
const libellesStatutsSinistres=Object.fromEntries(chaineStatutsSinistres.map((etape)=>[etape.statut,etape.libelle])) as Record<StatutSinistre,string>;
const libellesChamps:Record<string,string>={prenom:"Prénom",prenoms:"Prénoms",nom:"Nom",telephone:"Téléphone",adresse_email:"Adresse e-mail",adresse:"Adresse",ville:"Ville",est_souscripteur:"Même personne que le souscripteur",date_naissance:"Date de naissance",profession:"Profession",numero_permis:"Numéro de permis",categorie_permis:"Catégorie du permis",permis_delivre_le:"Permis délivré le",permis_valide_jusqu_au:"Permis valide jusqu’au",marque:"Marque",modele:"Modèle",annee:"Année",immatriculation:"Immatriculation",nombre_places:"Nombre de places",numero_chassis:"Numéro de châssis",energie:"Énergie",puissance_fiscale:"Puissance fiscale",cylindree_cm3:"Cylindrée",usage:"Usage",valeur_estimee:"Valeur estimée",transporte_matieres_inflammables:"Transport de matières inflammables",possede_remorque:"Remorque",duree_mois:"Durée de couverture",date_effet_souhaitee:"Date d’effet souhaitée",date_effet_inconnue:"Date d’effet inconnue",garanties:"Garanties",type_besoin:"Nature du besoin",precision_autre_besoin:"Précision",message_delegation:"Message confié au courtier",possede_vignette:"Vignette en cours de validité"};
const libellesValeurs:Record<string,string>={nouveau_vehicule:"Nouveau véhicule",renouvellement:"Renouvellement",autre:"Autre besoin",essence:"Essence",diesel:"Diesel",electrique:"Électrique",cat1_professionnel:"CAT1 · Usage professionnel",cat2_transport_produits:"CAT2 · Transport de produits",cat3_transport_marchandises_tiers:"CAT3 · Transport de marchandises appartenant à des tiers",cat5:"CAT5 · Véhicule motorisé à deux ou trois roues",cat5_bis:"CAT5 BIS · Transport payant de passagers",responsabilite_civile:"Responsabilité civile",defense_et_recours:"Défense et recours",ipt:"IPT",bris_glaces_tous_risques:"Bris de glaces en tous risques",bris_glaces_hors_tous_risques:"Bris de glaces hors tous risques",bris_glaces_blocs_feux:"Bris de glaces et blocs-feux",tierce_collision:"Tierce collision",dommages_tous_accidents:"Dommages tous accidents",incendie:"Incendie",incendie_risques_electriques:"Incendie et risques électriques",vol_braquage:"Vol et braquage",vol_total:"Vol total",vol_total_partiel:"Vol total ou partiel",assistance_reparation:"Assistance à réparation",avance_sur_recours:"Avance sur recours"};
const libelleChamp=(champ:string)=>libellesChamps[champ]??champ.replaceAll("_"," ").replace(/^./,(lettre)=>lettre.toUpperCase());
const objetDemande=(valeur:unknown):Record<string,unknown>=>typeof valeur==="object"&&valeur!==null&&!Array.isArray(valeur)?valeur as Record<string,unknown>:{};

function ValeurDemande({ valeur }: { valeur: unknown }) {
  if(valeur===null||valeur===undefined||valeur==="")return <span className="request-empty">Non renseigné</span>;
  if(typeof valeur==="boolean")return <strong>{valeur?"Oui":"Non"}</strong>;
  if(Array.isArray(valeur))return <div className="request-tags">{valeur.map((element,index)=><Badge variant="secondary" key={`${String(element)}-${index}`}>{libellesValeurs[String(element)]??libelleChamp(String(element))}</Badge>)}</div>;
  if(typeof valeur==="object")return <div className="request-fields">{Object.entries(valeur as Record<string,unknown>).map(([champ,contenu])=><div className="request-field" key={champ}><span>{libelleChamp(champ)}</span><ValeurDemande valeur={contenu}/></div>)}</div>;
  if(typeof valeur==="number")return <strong>{new Intl.NumberFormat("fr-FR").format(valeur)}</strong>;
  return <strong>{libellesValeurs[String(valeur)]??String(valeur)}</strong>;
}

function GroupeInformations({ titre, donnees }: { titre:string; donnees:Record<string,unknown> }) {
  const champs=Object.entries(donnees).filter(([,valeur])=>valeur!==null&&valeur!==undefined&&valeur!=="");
  if(champs.length===0)return null;
  return <article className="request-info-group"><h4>{titre}</h4><div className="request-info-grid">{champs.map(([champ,valeur])=><div className="request-info-item" key={champ}><span>{libelleChamp(champ)}</span><ValeurDemande valeur={valeur}/></div>)}</div></article>;
}

type DocumentDemandeClient = {
  id:string;
  titre:string;
  nom_fichier:string;
  type:string;
  dossier:string;
  statut:string;
  date?:string;
};

function normaliserDocumentDemande(valeur:unknown):DocumentDemandeClient|null {
  if(!valeur||typeof valeur!=="object"||Array.isArray(valeur))return null;
  const document=valeur as Record<string,unknown>;
  if(typeof document.id!=="string"||typeof document.titre!=="string")return null;
  return {
    id:document.id,
    titre:document.titre,
    nom_fichier:typeof document.nom_fichier==="string"?document.nom_fichier:"",
    type:typeof document.type==="string"?document.type:"Document",
    dossier:typeof document.dossier==="string"?document.dossier:"",
    statut:typeof document.statut==="string"?document.statut:"recu",
    date:typeof document.date==="string"?document.date:undefined,
  };
}

function ListeDocumentsClient({ documents }: { documents:unknown[] }) {
  const liste=documents.map(normaliserDocumentDemande).filter((document):document is DocumentDemandeClient=>document!==null&&Boolean(document.nom_fichier));
  const [documentActif,setDocumentActif]=useState<DocumentDemandeClient|null>(null);
  const [url,setUrl]=useState("");
  const [chargement,setChargement]=useState(false);

  const consulter=async(document:DocumentDemandeClient)=>{
    setDocumentActif(document);
    setUrl("");
    setChargement(true);
    try{
      const lien=await apiBackoffice.obtenirLienConsultationDocument(document.id);
      setUrl(lien.url);
    }catch(cause){
      toast.error(cause instanceof Error?cause.message:"Le document ne peut pas être consulté.");
      setDocumentActif(null);
    }finally{
      setChargement(false);
    }
  };

  if(liste.length===0)return <div className="request-documents-empty"><Files/><div><strong>Aucun document transmis</strong><span>Les documents déposés depuis le portail client apparaîtront ici dans son dossier.</span></div></div>;
  return <>
    <div className="request-document-table">{liste.map((document)=><div className="request-document-row" key={document.id}><span className="request-document-icon"><FileText/></span><div className="request-document-identity"><strong>{document.titre}</strong><span>{document.nom_fichier}</span></div><div className="request-document-meta"><Badge variant="secondary">{libellesValeurs[document.statut]??libelleChamp(document.statut)}</Badge>{document.date&&<small>{displayDate(document.date)}</small>}</div><Button variant="outline" size="sm" onClick={()=>void consulter(document)}><Eye/>Voir</Button></div>)}</div>
    <Dialog open={Boolean(documentActif)} onOpenChange={(ouvert)=>{if(!ouvert){setDocumentActif(null);setUrl("");}}}>
      <DialogContent className="document-viewer-dialog"><DialogHeader><DialogTitle>{documentActif?.titre}</DialogTitle><DialogDescription>{documentActif?.nom_fichier} · lien sécurisé temporaire</DialogDescription></DialogHeader>{chargement?<div className="document-viewer-skeleton" aria-label="Chargement du document"><span/><span/><span/></div>:url?<iframe className="document-viewer-frame" src={url} title={documentActif?.titre}/>:null}{url&&<DialogFooter><Button variant="outline" onClick={()=>window.open(url,"_blank","noopener,noreferrer")}>Ouvrir dans un nouvel onglet</Button></DialogFooter>}</DialogContent>
    </Dialog>
  </>;
}

function ParcoursDemande({ statut }: { statut:StatutDemande }) {
  const indexActuel=chaineStatutsDemandes.findIndex((etape)=>etape.statut===statut);
  return <div className="request-progress">{chaineStatutsDemandes.map((etape,index)=><div key={etape.statut} className={`${index<indexActuel?"is-done ":""}${index===indexActuel?"is-current":""}`}><span>{index<indexActuel?<Check/>:index+1}</span><div><strong>{etape.libelle}</strong><small>{etape.description}</small></div></div>)}</div>;
}

function ParcoursSinistre({ statut }: { statut:StatutSinistre }) {
  const indexActuel=chaineStatutsSinistres.findIndex((etape)=>etape.statut===statut);
  return <div className="request-progress">{chaineStatutsSinistres.map((etape,index)=><div key={etape.statut} className={`${index<indexActuel?"is-done ":""}${index===indexActuel?"is-current":""}`}><span>{index<indexActuel?<Check/>:index+1}</span><div><strong>{etape.libelle}</strong><small>{etape.description}</small></div></div>)}</div>;
}

function FicheDemandeClient({ demande }: { demande:DetailDemandeClient }) {
  const donnees=demande.donnees;
  const conducteur=objetDemande(donnees.conducteur);
  const vehicule=objetDemande(donnees.vehicule);
  const couverture=objetDemande(donnees.couverture);
  const documents=Array.isArray(donnees.documents)?donnees.documents:Array.isArray(donnees.pieces_jointes)?donnees.pieces_jointes:[];
  const besoin={type_besoin:donnees.type_besoin,precision_autre_besoin:donnees.precision_autre_besoin,message_delegation:donnees.message_delegation,possede_vignette:donnees.possede_vignette};
  const champsDejaAffiches=new Set(["souscripteur","assure","conducteur","vehicule","couverture","documents","pieces_jointes","type_besoin","precision_autre_besoin","message_delegation","possede_vignette"]);
  const informationsComplementaires=Object.fromEntries(Object.entries(donnees).filter(([champ])=>!champsDejaAffiches.has(champ)));
  return <div className="request-dossier-content"><section className="request-client-card"><div className="request-client-avatar">{demande.client.nom_complet.split(" ").slice(0,2).map((partie)=>partie[0]).join("")}</div><div><p className="eyebrow">Client</p><h3>{demande.client.nom_complet}</h3><span>{demande.client.adresse_email} · {demande.client.numero_telephone}</span></div></section><section><p className="eyebrow">Informations du client</p><div className="request-info-stack"><GroupeInformations titre="Souscripteur" donnees={objetDemande(donnees.souscripteur)}/><GroupeInformations titre="Assuré" donnees={objetDemande(donnees.assure)}/><GroupeInformations titre="Conducteur" donnees={conducteur}/><article className="request-info-group"><h4>Documents du client</h4><ListeDocumentsClient documents={documents}/></article></div></section><section><p className="eyebrow">Informations de la demande</p><div className="request-info-stack"><GroupeInformations titre="Besoin exprimé" donnees={besoin}/><GroupeInformations titre="Véhicule" donnees={vehicule}/><GroupeInformations titre="Couverture et garanties" donnees={couverture}/><GroupeInformations titre="Informations complémentaires" donnees={informationsComplementaires}/></div></section></div>;
}

function RequestsView({ version, utilisateur, onOpen }: { version: number; utilisateur: UtilisateurBackoffice; onOpen:(reference:string)=>void }) {
  const [demandes,setDemandes]=useState<ResumeDemandeClient[]>([]);
  const [chargement,setChargement]=useState(true);
  const [recherche,setRecherche]=useState("");
  const [filtre,setFiltre]=useState<"toutes"|StatutDemande>("toutes");

  useEffect(()=>{let actif=true;apiBackoffice.listerDemandes(filtre==="toutes"?undefined:{statut:filtre}).then((liste)=>{if(actif)setDemandes(liste);}).catch((cause)=>{if(actif)toast.error(cause instanceof Error?cause.message:"Impossible de charger les demandes.");}).finally(()=>{if(actif)setChargement(false);});return()=>{actif=false};},[version,filtre]);
  const lignes=demandes.filter((demande)=>`${demande.reference} ${demande.client.nom_complet} ${demande.client.adresse_email}`.toLowerCase().includes(recherche.toLowerCase()));

  return <><PageHeading eyebrow="CRM" title="Demandes clients" subtitle="Les demandes envoyées depuis le portail apparaissent ici automatiquement." action={<Badge variant="secondary">{demandes.filter((item)=>item.statut==="nouvelle").length} à traiter</Badge>}/>
    <div className="toolbar"><div className="filter-search"><Search/><Input value={recherche} onChange={(event)=>setRecherche(event.target.value)} placeholder="Référence, client ou e-mail…"/></div><Select value={filtre} onValueChange={(valeur)=>{setChargement(true);setFiltre(valeur as "toutes"|StatutDemande);}}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="toutes">Tous les statuts</SelectItem>{chaineStatutsDemandes.map((etape)=><SelectItem key={etape.statut} value={etape.statut}>{etape.libelle}</SelectItem>)}</SelectContent></Select><span className="result-count">{lignes.length} demande(s)</span></div>
    {chargement?<div className="loading-state"><LoaderCircle className="animate-spin"/>Chargement des demandes…</div>:<TableCard><Table><TableHeader><TableRow><TableHead>Référence</TableHead><TableHead>Client</TableHead><TableHead>Produit</TableHead><TableHead>Responsable</TableHead><TableHead>Reçue le</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{lignes.map((demande)=><TableRow key={demande.id} className="clickable-row" role="button" tabIndex={0} aria-label={`Ouvrir la demande ${demande.reference}`} onClick={()=>onOpen(demande.reference)} onKeyDown={(event)=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();onOpen(demande.reference);}}}><TableCell className="ref-cell">{demande.reference}</TableCell><TableCell><strong>{demande.client.nom_complet}</strong><small>{demande.client.adresse_email} · {demande.client.numero_telephone}</small></TableCell><TableCell><Badge variant="secondary">{demande.sous_type==="voiture"?"Automobile · Voiture":"Automobile · Moto"}</Badge></TableCell><TableCell>{demande.responsable?<><strong>{demande.responsable.id===utilisateur.id?"Vous":demande.responsable.nom_complet}</strong><small>{demande.responsable.role==="courtier"?"Courtier":"Administration"}</small></>:<Badge variant="outline">File commune</Badge>}</TableCell><TableCell>{new Date(demande.cree_le).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"})}</TableCell><TableCell><StatusBadge value={libellesStatutsDemandes[demande.statut]}/></TableCell></TableRow>)}</TableBody></Table>{lignes.length===0&&<div className="request-empty-state"><Inbox/><strong>Aucune demande pour ce filtre</strong><span>Les nouvelles demandes du portail apparaîtront ici en temps réel.</span></div>}</TableCard>}
  </>;
}

function RequestDetailView({ reference, version, utilisateur, onBack }: { reference:string; version:number; utilisateur:UtilisateurBackoffice; onBack:()=>void }) {
  const [detail,setDetail]=useState<DetailDemandeClient|null>(null);
  const [chargement,setChargement]=useState(true);
  const [erreur,setErreur]=useState("");
  const [actionEnCours,setActionEnCours]=useState<string|null>(null);
  const [intervenants,setIntervenants]=useState<IntervenantDemande[]>([]);
  const [responsableCible,setResponsableCible]=useState("");
  const [motifReaffectation,setMotifReaffectation]=useState("");
  const estGestionnaire=utilisateur.role==="admin"||utilisateur.role==="super_admin";
  const estResponsable=detail?.responsable?.id===utilisateur.id;

  useEffect(()=>{let actif=true;apiBackoffice.obtenirDemande(reference).then((demande)=>{if(!actif)return;setErreur("");setDetail(demande);setResponsableCible(demande.responsable?.id??"");}).catch((cause)=>{if(!actif)return;const message=cause instanceof Error?cause.message:"Impossible d’ouvrir la demande.";setErreur(message);toast.error(message);}).finally(()=>{if(actif)setChargement(false);});return()=>{actif=false};},[reference,version]);
  useEffect(()=>{if(!estGestionnaire)return;let actif=true;apiBackoffice.listerIntervenantsDemandes().then((liste)=>{if(actif)setIntervenants(liste);}).catch(()=>undefined);return()=>{actif=false};},[estGestionnaire]);

  const appliquer=(demande:DetailDemandeClient)=>{setDetail(demande);setResponsableCible(demande.responsable?.id??"");setMotifReaffectation("");};
  const executer=async(action:string,operation:()=>Promise<DetailDemandeClient>,message:string)=>{setActionEnCours(action);try{appliquer(await operation());toast.success(message);}catch(cause){toast.error(cause instanceof Error?cause.message:"Opération impossible.");try{appliquer(await apiBackoffice.obtenirDemande(reference));}catch{}}finally{setActionEnCours(null);}};
  const prendreEnCharge=()=>executer("prise",()=>apiBackoffice.prendreEnChargeDemande(reference),"La demande vous est maintenant affectée.");
  const liberer=()=>executer("liberation",()=>apiBackoffice.libererDemande(reference),"La demande est retournée dans la file commune.");
  const reaffecter=()=>responsableCible?executer("reaffectation",()=>apiBackoffice.reaffecterDemande(reference,responsableCible,motifReaffectation),"La demande a été réaffectée."):Promise.resolve();

  return <div className="request-page">
    <button type="button" className="request-page-back" onClick={onBack}><ArrowLeft/>Retour aux demandes</button>
    {chargement&&!detail?<div className="loading-state request-page-loading"><LoaderCircle className="animate-spin"/>Chargement du dossier…</div>:erreur&&!detail?<div className="request-page-error"><TriangleAlert/><div><strong>Le dossier n’a pas pu être chargé</strong><span>{erreur}</span></div><Button variant="outline" onClick={onBack}>Revenir à la liste</Button></div>:detail&&<>
      <header className="request-page-header"><div><p className="eyebrow">Dossier client</p><h1>{detail.reference}</h1><p>{detail.client.nom_complet} · reçu le {new Date(detail.cree_le).toLocaleString("fr-FR",{dateStyle:"long",timeStyle:"short"})}</p></div><div className="request-page-badges"><Badge variant="secondary">{detail.sous_type==="voiture"?"Automobile · Voiture":"Automobile · Moto"}</Badge><StatusBadge value={libellesStatutsDemandes[detail.statut]}/></div></header>
      <div className="request-page-grid"><main className="request-page-main"><FicheDemandeClient demande={detail}/></main><aside className="request-page-aside">
        <Card className="request-page-panel"><CardContent className="p-0"><p className="eyebrow">Prise en charge</p>{detail.responsable?<><div className="request-owner"><div><span>Responsable actuel</span><strong>{estResponsable?"Vous":detail.responsable.nom_complet}</strong><small>{detail.prise_en_charge_le&&`Depuis le ${new Date(detail.prise_en_charge_le).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"})}`}</small></div>{estGestionnaire&&<Button variant="outline" disabled={Boolean(actionEnCours)} onClick={()=>void liberer()}>{actionEnCours==="liberation"&&<LoaderCircle className="animate-spin"/>}Libérer</Button>}</div>{estResponsable&&!estGestionnaire&&<p className="request-lock-note"><LockKeyhole/>Cette prise en charge est définitive. Seul un administrateur peut libérer ou réaffecter la demande.</p>}</>:<div className="request-claim"><div><strong>Cette demande est dans la file commune.</strong><span>Le premier utilisateur qui la prend devient définitivement son responsable.</span></div><Button disabled={Boolean(actionEnCours)} onClick={()=>void prendreEnCharge()}>{actionEnCours==="prise"&&<LoaderCircle className="animate-spin"/>}Prendre en charge</Button></div>}{detail.responsable&&estGestionnaire&&<div className="request-reassign"><Label>Réaffectation exceptionnelle</Label><Select value={responsableCible} onValueChange={setResponsableCible}><SelectTrigger className="w-full"><SelectValue placeholder="Choisir un responsable"/></SelectTrigger><SelectContent>{intervenants.map((intervenant)=><SelectItem key={intervenant.id} value={intervenant.id}>{intervenant.nom_complet} · {intervenant.role==="courtier"?"Courtier":intervenant.role==="admin"?"Admin":"Super-admin"}</SelectItem>)}</SelectContent></Select><Textarea value={motifReaffectation} onChange={(event)=>setMotifReaffectation(event.target.value)} placeholder="Motif obligatoire de la réaffectation"/><Button disabled={!responsableCible||responsableCible===detail.responsable.id||motifReaffectation.trim().length<3||Boolean(actionEnCours)} onClick={()=>void reaffecter()}>{actionEnCours==="reaffectation"&&<LoaderCircle className="animate-spin"/>}Réaffecter</Button></div>}</CardContent></Card>
        <Card className="request-page-panel"><CardContent className="p-0"><p className="eyebrow">Avancement automatique</p><ParcoursDemande statut={detail.statut}/></CardContent></Card>
      </aside></div>
    </>}
  </div>;
}

function DashboardView({ data, goTo }: { data: DemoData; goTo: (id: ModuleId) => void }) {
  const activePolicies = data.policies.filter((policy) => policy.status === "Active" || policy.status === "Proche échéance").length;
  const paid = data.payments.filter((payment) => payment.status === "Validé").reduce((sum, payment) => sum + payment.amount, 0);
  const unpaid = data.invoices.reduce((sum, invoice) => sum + invoice.amount - invoice.paid, 0);
  const commissionMonth = data.commissions.slice(0, 36).reduce((sum, commission) => sum + commission.received, 0);
  const monthly = [
    { month: "Avr", production: 18.2, encaissements: 14.8 }, { month: "Mai", production: 22.4, encaissements: 19.6 },
    { month: "Juin", production: 20.8, encaissements: 18.2 }, { month: "Juil", production: 29.6, encaissements: 25.1 },
    { month: "Août", production: 27.4, encaissements: 22.8 }, { month: "Sept", production: 38.4, encaissements: 31.9 },
  ];
  const productData = products.slice(0, 5).map((product) => ({ name: product.name.split(" ")[0], value: data.policies.filter((policy) => policy.product === product.name).length }));
  const stats = [
    { label: "Clients actifs", value: data.clients.filter((client) => client.status === "Actif").length.toString(), note: "+12 ce mois", icon: Users, tone: "blue" },
    { label: "Opportunités en cours", value: data.opportunities.filter((opportunity) => !["Gagné", "Perdu"].includes(opportunity.stage)).length.toString(), note: shortMoney(data.opportunities.reduce((sum, opportunity) => sum + opportunity.estimatedPremium, 0)), icon: BriefcaseBusiness, tone: "violet" },
    { label: "Polices actives", value: activePolicies.toString(), note: `${data.policies.filter((policy) => policy.status === "Proche échéance").length} à renouveler`, icon: ShieldCheck, tone: "cyan" },
    { label: "Commissions du mois", value: shortMoney(commissionMonth), note: "+8,4 %", icon: CircleDollarSign, tone: "green" },
  ];
  return <>
    <PageHeading eyebrow="Jeudi 1 octobre 2026" title="Bonjour Sophie, voici l’essentiel." subtitle="Les chiffres et actions qui nécessitent votre attention aujourd’hui." action={<div className="period-pill">Ce mois</div>} />
    <section className="stat-grid" aria-label="Indicateurs clés">{stats.map((stat) => <Card key={stat.label} className="stat-card"><CardContent className="p-0"><div className={`stat-icon stat-icon--${stat.tone}`}><stat.icon /></div><p>{stat.label}</p><strong>{stat.value}</strong><span>{stat.note}</span></CardContent></Card>)}</section>
    <section className="dashboard-grid dashboard-grid--charts">
      <Card className="dashboard-panel"><CardContent className="p-0"><div className="section-title-row"><div><p className="eyebrow">Production</p><h2>Affaires nouvelles & encaissements</h2></div><strong>38,4 M FCFA</strong></div><div className="rechart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7edf4"/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><ChartTooltip/><Legend/><Bar dataKey="production" name="Production" fill="#1b6eb7" radius={[5,5,0,0]}/><Bar dataKey="encaissements" name="Encaissé" fill="#5fc4c6" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></CardContent></Card>
      <Card className="dashboard-panel"><CardContent className="p-0"><div className="section-title-row"><div><p className="eyebrow">Portefeuille</p><h2>Répartition par produit</h2></div></div><div className="rechart-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={productData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>{["#1b6eb7", "#43b6b7", "#6c66d8", "#e2a33a", "#80a1bd"].map((color) => <Cell key={color} fill={color}/>)}</Pie><ChartTooltip/><Legend/></PieChart></ResponsiveContainer></div></CardContent></Card>
    </section>
    <section className="dashboard-grid dashboard-grid--lower">
      <Card className="dashboard-panel"><CardContent className="p-0"><div className="section-title-row"><div><p className="eyebrow">À traiter aujourd’hui</p><h2>Actions prioritaires</h2></div><span className="priority-total">14</span></div><div className="priority-list">
        {[{ label: "Contrats à renouveler sous 30 jours", count: data.policies.filter((p) => p.status === "Proche échéance").length, icon: CalendarClock, target: "renewals" as ModuleId }, { label: "Propositions à relancer", count: 4, icon: BriefcaseBusiness, target: "proposals" as ModuleId }, { label: "Paiements en attente", count: data.payments.filter((p) => p.status === "En attente").length, icon: WalletCards, target: "payments" as ModuleId }].map((item) => <button key={item.label} type="button" onClick={() => goTo(item.target)}><span className="priority-icon"><item.icon /></span><span>{item.label}</span><strong>{item.count}</strong><ChevronRight /></button>)}
      </div></CardContent></Card>
      <Card className="dashboard-panel cash-card"><CardContent className="p-0"><p className="eyebrow">Trésorerie</p><h2>Situation des primes</h2><div className="cash-metric"><span>Encaissé</span><strong>{shortMoney(paid)}</strong></div><div className="cash-progress"><span style={{ width: `${Math.min(100, (paid / (paid + unpaid)) * 100)}%` }}/></div><div className="cash-footer"><span>Restant à encaisser</span><strong>{shortMoney(unpaid)}</strong></div></CardContent></Card>
    </section>
  </>;
}

function ClientsView({ data, onSelect, onCreate }: { data: DemoData; onSelect: (client: Client) => void; onCreate: () => void }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("Tous");
  const rows = data.clients.filter((client) => (type === "Tous" || client.type === type) && `${client.id} ${client.name} ${client.email}`.toLowerCase().includes(search.toLowerCase())).slice(0, 32);
  return <><PageHeading eyebrow="CRM" title="Clients" subtitle="Une vue consolidée du portefeuille et de la relation client." action={<Button onClick={onCreate}><Plus/>Créer un client</Button>} />
    <div className="toolbar"><div className="filter-search"><Search/><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un client…" /></div><Select value={type} onValueChange={setType}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Tous">Tous les types</SelectItem><SelectItem value="Particulier">Particuliers</SelectItem><SelectItem value="Entreprise">Entreprises</SelectItem></SelectContent></Select><span className="result-count">{rows.length} affichés / {data.clients.length}</span></div>
    <TableCard><Table><TableHeader><TableRow><TableHead>Référence</TableHead><TableHead>Nom / raison sociale</TableHead><TableHead>Type</TableHead><TableHead>Polices</TableHead><TableHead>Prime annuelle</TableHead><TableHead>Solde</TableHead><TableHead>Conseiller</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{rows.map((client) => <TableRow key={client.id} className="clickable-row" onClick={() => onSelect(client)}><TableCell className="ref-cell">{client.id}</TableCell><TableCell><strong>{client.name}</strong><small>{client.email}</small></TableCell><TableCell>{client.type}</TableCell><TableCell>{client.policyIds.length}</TableCell><TableCell>{shortMoney(client.annualPremium)}</TableCell><TableCell className={client.balance > 0 ? "amount-due" : ""}>{shortMoney(client.balance)}</TableCell><TableCell>{client.advisor}</TableCell><TableCell><StatusBadge value={client.status}/></TableCell></TableRow>)}</TableBody></Table></TableCard>
  </>;
}

function PipelineView({ data, onChangeStage, onSelect, onCreate }: { data: DemoData; onChangeStage: (id: string, stage: Opportunity["stage"]) => void; onSelect: (opportunity: Opportunity) => void; onCreate: () => void }) {
  const [dragged, setDragged] = useState<string | null>(null);
  return <><PageHeading eyebrow="CRM" title="Pipeline commercial" subtitle="Déplacez les cartes pour simuler l’avancement des opportunités." action={<Button onClick={onCreate}><Plus/>Nouvelle opportunité</Button>} />
    <div className="pipeline" aria-label="Pipeline des opportunités">{stageList.map((stage) => { const items = data.opportunities.filter((opportunity) => opportunity.stage === stage); return <section key={stage} className="kanban-column" onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragged) onChangeStage(dragged, stage); setDragged(null); }}><header><span>{stage}</span><Badge variant="secondary">{items.length}</Badge></header><div className="kanban-list">{items.map((opportunity) => { const client = data.clients.find((item) => item.id === opportunity.clientId); return <button draggable onDragStart={() => setDragged(opportunity.id)} onClick={() => onSelect(opportunity)} key={opportunity.id} className="opportunity-card"><span className="opportunity-card__top"><small>{opportunity.id}</small><strong>{opportunity.probability}%</strong></span><b>{client?.name}</b><span>{opportunity.product}</span><strong className="opportunity-value">{shortMoney(opportunity.estimatedPremium)}</strong><span className="opportunity-card__meta"><span>{opportunity.advisor}</span><span>{displayDate(opportunity.nextAction)}</span></span></button>; })}{items.length === 0 && <div className="kanban-empty">Déposez une opportunité ici</div>}</div></section>; })}</div>
  </>;
}

function ProposalsView({ data, onSelect, onCreate }: { data: DemoData; onSelect: (proposal: Proposal) => void; onCreate: () => void }) {
  return <><PageHeading eyebrow="Production" title="Propositions" subtitle="Préparez, comparez et recommandez les meilleures offres." action={<Button onClick={onCreate}><FilePlus2/>Préparer une proposition</Button>} />
    <TableCard><Table><TableHeader><TableRow><TableHead>N° proposition</TableHead><TableHead>Client</TableHead><TableHead>Produit</TableHead><TableHead>Date</TableHead><TableHead>Offres</TableHead><TableHead>Conseiller</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{data.proposals.map((proposal) => <TableRow key={proposal.id} className="clickable-row" onClick={() => onSelect(proposal)}><TableCell className="ref-cell">{proposal.id}</TableCell><TableCell><strong>{data.clients.find((client) => client.id === proposal.clientId)?.name}</strong></TableCell><TableCell>{proposal.product}</TableCell><TableCell>{displayDate(proposal.date)}</TableCell><TableCell>{proposal.offers.length}</TableCell><TableCell>{proposal.advisor}</TableCell><TableCell><StatusBadge value={proposal.status}/></TableCell></TableRow>)}</TableBody></Table></TableCard>
  </>;
}

function PoliciesView({ data, onSelect }: { data: DemoData; onSelect: (policy: Policy) => void }) {
  const [status, setStatus] = useState("Toutes");
  const rows = data.policies.filter((policy) => status === "Toutes" || policy.status === status).slice(0, 45);
  return <><PageHeading eyebrow="Production" title="Portefeuille de polices" subtitle="Suivez les contrats, les garanties et les prochaines échéances." />
    <div className="toolbar"><Select value={status} onValueChange={setStatus}><SelectTrigger><SlidersHorizontal/><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Toutes">Toutes les polices</SelectItem>{["Active", "Proche échéance", "Expirée", "Résiliée"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><span className="result-count">{rows.length} affichées / {data.policies.length}</span></div>
    <TableCard><Table><TableHeader><TableRow><TableHead>N° police</TableHead><TableHead>Client</TableHead><TableHead>Produit</TableHead><TableHead>Compagnie</TableHead><TableHead>Prime</TableHead><TableHead>Effet</TableHead><TableHead>Expiration</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{rows.map((policy) => <TableRow key={policy.id} className="clickable-row" onClick={() => onSelect(policy)}><TableCell className="ref-cell">{policy.id}</TableCell><TableCell><strong>{data.clients.find((client) => client.id === policy.clientId)?.name}</strong></TableCell><TableCell>{policy.product}</TableCell><TableCell>{companyName(policy.companyId)}</TableCell><TableCell>{shortMoney(policy.premium)}</TableCell><TableCell>{displayDate(policy.startDate)}</TableCell><TableCell>{displayDate(policy.endDate)}</TableCell><TableCell><StatusBadge value={policy.status}/></TableCell></TableRow>)}</TableBody></Table></TableCard>
  </>;
}

function FinanceView({ kind, data, onPayment, onCreateInvoice }: { kind: "invoices" | "payments" | "commissions"; data: DemoData; onPayment: () => void; onCreateInvoice: () => void }) {
  if (kind === "commissions") {
    const expected = data.commissions.reduce((sum, item) => sum + item.expected, 0); const received = data.commissions.reduce((sum, item) => sum + item.received, 0); const premiums = data.commissions.reduce((sum, item) => sum + item.premium, 0);
    return <><PageHeading eyebrow="Finance" title="Commissions" subtitle="Suivi des montants attendus et reçus auprès des compagnies."/><section className="summary-grid"><Summary label="Primes totales" value={shortMoney(premiums)}/><Summary label="Commission attendue" value={shortMoney(expected)}/><Summary label="Commission reçue" value={shortMoney(received)}/><Summary label="Commission restante" value={shortMoney(expected-received)} alert/></section><TableCard><Table><TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Police</TableHead><TableHead>Compagnie</TableHead><TableHead>Prime</TableHead><TableHead>Taux</TableHead><TableHead>Attendue</TableHead><TableHead>Reçue</TableHead><TableHead>Solde</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{data.commissions.slice(0,45).map((item) => <TableRow key={item.id}><TableCell>{data.clients.find((c) => c.id === item.clientId)?.name}</TableCell><TableCell className="ref-cell">{item.policyId}</TableCell><TableCell>{companyName(item.companyId)}</TableCell><TableCell>{shortMoney(item.premium)}</TableCell><TableCell>{item.rate}%</TableCell><TableCell>{shortMoney(item.expected)}</TableCell><TableCell>{shortMoney(item.received)}</TableCell><TableCell>{shortMoney(item.expected-item.received)}</TableCell><TableCell><StatusBadge value={item.status}/></TableCell></TableRow>)}</TableBody></Table></TableCard></>;
  }
  if (kind === "payments") return <><PageHeading eyebrow="Finance" title="Paiements" subtitle="Encaissements fictifs et affectation aux factures." action={<Button onClick={onPayment}><Plus/>Enregistrer un paiement</Button>}/><TableCard><Table><TableHeader><TableRow><TableHead>Référence</TableHead><TableHead>Client</TableHead><TableHead>Facture</TableHead><TableHead>Montant</TableHead><TableHead>Mode</TableHead><TableHead>Date</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{data.payments.slice(0,45).map((item) => <TableRow key={item.id}><TableCell className="ref-cell">{item.id}</TableCell><TableCell>{data.clients.find((c) => c.id === item.clientId)?.name}</TableCell><TableCell>{item.invoiceId}</TableCell><TableCell>{shortMoney(item.amount)}</TableCell><TableCell>{item.method}</TableCell><TableCell>{displayDate(item.date)}</TableCell><TableCell><StatusBadge value={item.status}/></TableCell></TableRow>)}</TableBody></Table></TableCard></>;
  return <><PageHeading eyebrow="Finance" title="Factures" subtitle="Montants facturés, échéances et soldes clients." action={<Button onClick={onCreateInvoice}><Plus/>Créer une facture</Button>}/><TableCard><Table><TableHeader><TableRow><TableHead>N° facture</TableHead><TableHead>Client</TableHead><TableHead>Police</TableHead><TableHead>Montant</TableHead><TableHead>Payé</TableHead><TableHead>Solde</TableHead><TableHead>Échéance</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{data.invoices.slice(0,45).map((item) => <TableRow key={item.id}><TableCell className="ref-cell">{item.id}</TableCell><TableCell>{data.clients.find((c) => c.id === item.clientId)?.name}</TableCell><TableCell>{item.policyId}</TableCell><TableCell>{shortMoney(item.amount)}</TableCell><TableCell>{shortMoney(item.paid)}</TableCell><TableCell className={item.amount-item.paid > 0 ? "amount-due" : ""}>{shortMoney(item.amount-item.paid)}</TableCell><TableCell>{displayDate(item.dueDate)}</TableCell><TableCell><StatusBadge value={item.status}/></TableCell></TableRow>)}</TableBody></Table></TableCard></>;
}

function Summary({ label, value, alert }: { label: string; value: string; alert?: boolean }) { return <Card className="summary-card"><CardContent><span>{label}</span><strong className={alert ? "amount-due" : ""}>{value}</strong></CardContent></Card>; }

function RenewalsView({ data, onPrepare }: { data: DemoData; onPrepare: (policy: Policy) => void }) {
  const due = data.policies.filter((policy) => policy.status === "Proche échéance");
  const groups = [{ label: "Échéance dans 7 jours", rows: due.filter((_, index) => index % 3 === 0) }, { label: "Échéance dans 15 jours", rows: due.filter((_, index) => index % 3 === 1) }, { label: "Échéance dans 30 jours", rows: due.filter((_, index) => index % 3 === 2) }];
  return <><PageHeading eyebrow="Gestion" title="Renouvellements" subtitle="Anticipez les échéances et organisez les relances clients."/><div className="renewal-grid">{groups.map((group, groupIndex) => <section className={`renewal-group renewal-group--${groupIndex}`} key={group.label}><header><h2>{group.label}</h2><Badge>{group.rows.length}</Badge></header>{group.rows.map((policy) => <article key={policy.id}><div><strong>{data.clients.find((client) => client.id === policy.clientId)?.name}</strong><span>{policy.id} · {policy.product}</span></div><div><b>{displayDate(policy.endDate)}</b><Button size="sm" variant="outline" onClick={() => onPrepare(policy)}>Préparer</Button></div></article>)}</section>)}</div></>;
}

function ClaimsView({ version, utilisateur, onOpen }: { version:number; utilisateur:UtilisateurBackoffice; onOpen:(reference:string)=>void }) {
  const [sinistres,setSinistres]=useState<ResumeSinistre[]>([]);
  const [chargement,setChargement]=useState(true);
  const [recherche,setRecherche]=useState("");
  const [filtre,setFiltre]=useState<"tous"|StatutSinistre>("tous");
  useEffect(()=>{let actif=true;apiBackoffice.listerSinistres(filtre==="tous"?undefined:{statut:filtre}).then((liste)=>{if(actif)setSinistres(liste);}).catch((cause)=>{if(actif)toast.error(cause instanceof Error?cause.message:"Impossible de charger les sinistres.");}).finally(()=>{if(actif)setChargement(false);});return()=>{actif=false};},[version,filtre]);
  const lignes=sinistres.filter((sinistre)=>`${sinistre.reference} ${sinistre.client.nom_complet} ${sinistre.client.adresse_email} ${sinistre.contrat_reference}`.toLowerCase().includes(recherche.toLowerCase()));
  return <><PageHeading eyebrow="Gestion" title="Sinistres" subtitle="Les déclarations du portail apparaissent ici automatiquement." action={<Badge variant="secondary">{sinistres.filter((item)=>item.statut==="declare").length} à prendre en charge</Badge>}/><div className="toolbar"><div className="filter-search"><Search/><Input value={recherche} onChange={(event)=>setRecherche(event.target.value)} placeholder="Référence, client ou police…"/></div><Select value={filtre} onValueChange={(valeur)=>{setChargement(true);setFiltre(valeur as "tous"|StatutSinistre);}}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="tous">Tous les statuts</SelectItem>{chaineStatutsSinistres.map((etape)=><SelectItem key={etape.statut} value={etape.statut}>{etape.libelle}</SelectItem>)}</SelectContent></Select><span className="result-count">{lignes.length} sinistre(s)</span></div>{chargement?<div className="loading-state"><LoaderCircle className="animate-spin"/>Chargement des sinistres…</div>:<TableCard><Table><TableHeader><TableRow><TableHead>Référence</TableHead><TableHead>Client</TableHead><TableHead>Police</TableHead><TableHead>Sinistre</TableHead><TableHead>Date</TableHead><TableHead>Responsable</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{lignes.map((sinistre)=><TableRow key={sinistre.id} className="clickable-row" role="button" tabIndex={0} onClick={()=>onOpen(sinistre.reference)} onKeyDown={(event)=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();onOpen(sinistre.reference);}}}><TableCell className="ref-cell">{sinistre.reference}</TableCell><TableCell><strong>{sinistre.client.nom_complet}</strong><small>{sinistre.client.adresse_email} · {sinistre.client.numero_telephone}</small></TableCell><TableCell>{sinistre.contrat_reference}</TableCell><TableCell><strong>{sinistre.type_sinistre}</strong><small>{sinistre.libelle_produit} · {sinistre.lieu}</small></TableCell><TableCell>{displayDate(sinistre.date_sinistre)}</TableCell><TableCell>{sinistre.responsable?<><strong>{sinistre.responsable.id===utilisateur.id?"Vous":sinistre.responsable.nom_complet}</strong><small>{sinistre.responsable.role==="courtier"?"Courtier":"Administration"}</small></>:<Badge variant="outline">File commune</Badge>}</TableCell><TableCell><StatusBadge value={libellesStatutsSinistres[sinistre.statut]}/></TableCell></TableRow>)}</TableBody></Table>{lignes.length===0&&<div className="request-empty-state"><TriangleAlert/><strong>Aucun sinistre pour ce filtre</strong><span>Les nouvelles déclarations apparaîtront ici en temps réel.</span></div>}</TableCard>}</>;
}

function ClaimDetailView({ reference, version, utilisateur, onBack }: { reference:string; version:number; utilisateur:UtilisateurBackoffice; onBack:()=>void }) {
  const [detail,setDetail]=useState<DetailSinistre|null>(null);
  const [chargement,setChargement]=useState(true);
  const [erreur,setErreur]=useState("");
  const [actionEnCours,setActionEnCours]=useState<string|null>(null);
  const [intervenants,setIntervenants]=useState<IntervenantDemande[]>([]);
  const [responsableCible,setResponsableCible]=useState("");
  const [motif,setMotif]=useState("");
  const estGestionnaire=utilisateur.role==="admin"||utilisateur.role==="super_admin";
  const estResponsable=detail?.responsable?.id===utilisateur.id;
  useEffect(()=>{let actif=true;apiBackoffice.obtenirSinistre(reference).then((sinistre)=>{if(!actif)return;setErreur("");setDetail(sinistre);setResponsableCible(sinistre.responsable?.id??"");}).catch((cause)=>{if(!actif)return;setErreur(cause instanceof Error?cause.message:"Impossible d’ouvrir le sinistre.");}).finally(()=>{if(actif)setChargement(false);});return()=>{actif=false};},[reference,version]);
  useEffect(()=>{if(!estGestionnaire)return;let actif=true;apiBackoffice.listerIntervenantsDemandes().then((liste)=>{if(actif)setIntervenants(liste);}).catch(()=>undefined);return()=>{actif=false};},[estGestionnaire]);
  const appliquer=(sinistre:DetailSinistre)=>{setDetail(sinistre);setResponsableCible(sinistre.responsable?.id??"");setMotif("");};
  const executer=async(action:string,operation:()=>Promise<DetailSinistre>,message:string)=>{setActionEnCours(action);try{appliquer(await operation());toast.success(message);}catch(cause){toast.error(cause instanceof Error?cause.message:"Opération impossible.");try{appliquer(await apiBackoffice.obtenirSinistre(reference));}catch{}}finally{setActionEnCours(null);}};
  const declaration=objetDemande(detail?.donnees.declaration_automobile);
  const pieces=Array.isArray(detail?.donnees.pieces_jointes)?detail.donnees.pieces_jointes:[];
  return <div className="request-page"><button type="button" className="request-page-back" onClick={onBack}><ArrowLeft/>Retour aux sinistres</button>{chargement&&!detail?<div className="loading-state request-page-loading"><LoaderCircle className="animate-spin"/>Chargement du sinistre…</div>:erreur&&!detail?<div className="request-page-error"><TriangleAlert/><div><strong>Le sinistre n’a pas pu être chargé</strong><span>{erreur}</span></div><Button variant="outline" onClick={onBack}>Revenir à la liste</Button></div>:detail&&<><header className="request-page-header"><div><p className="eyebrow">Dossier sinistre</p><h1>{detail.reference}</h1><p>{detail.client.nom_complet} · déclaré le {new Date(detail.cree_le).toLocaleString("fr-FR",{dateStyle:"long",timeStyle:"short"})}</p></div><div className="request-page-badges"><Badge variant="secondary">{detail.libelle_produit}</Badge><StatusBadge value={libellesStatutsSinistres[detail.statut]}/></div></header><div className="request-page-grid"><main className="request-page-main"><div className="request-dossier-content"><section className="request-client-card"><div className="request-client-avatar">{detail.client.nom_complet.split(" ").slice(0,2).map((partie)=>partie[0]).join("")}</div><div><p className="eyebrow">Client</p><h3>{detail.client.nom_complet}</h3><span>{detail.client.adresse_email} · {detail.client.numero_telephone}</span></div></section><section><p className="eyebrow">Événement déclaré</p><div className="request-info-stack"><GroupeInformations titre="Informations principales" donnees={{contrat:detail.contrat_reference,produit:detail.libelle_produit,type_sinistre:detail.type_sinistre,date_sinistre:detail.date_sinistre,lieu:detail.lieu,description:detail.description}}/>{Object.keys(declaration).length>0&&<GroupeInformations titre="Déclaration automobile complète" donnees={declaration}/>}<article className="request-info-group"><h4>Pièces signalées</h4>{pieces.length?<div className="request-document-list">{pieces.map((piece,index)=><div key={index}><Files/><ValeurDemande valeur={piece}/></div>)}</div>:<div className="request-documents-empty"><Files/><div><strong>Aucune pièce signalée</strong><span>Les documents déposés par le client seront rattachés ici.</span></div></div>}</article></div></section></div></main><aside className="request-page-aside"><Card className="request-page-panel"><CardContent className="p-0"><p className="eyebrow">Prise en charge</p>{detail.responsable?<><div className="request-owner"><div><span>Responsable actuel</span><strong>{estResponsable?"Vous":detail.responsable.nom_complet}</strong><small>{detail.prise_en_charge_le&&`Depuis le ${new Date(detail.prise_en_charge_le).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"})}`}</small></div>{estGestionnaire&&<Button variant="outline" disabled={Boolean(actionEnCours)} onClick={()=>void executer("liberation",()=>apiBackoffice.libererSinistre(reference),"Le sinistre est retourné dans la file commune.")}>{actionEnCours==="liberation"&&<LoaderCircle className="animate-spin"/>}Libérer</Button>}</div>{estResponsable&&!estGestionnaire&&<p className="request-lock-note"><LockKeyhole/>Cette prise en charge est définitive. Seul un administrateur peut libérer ou réaffecter ce sinistre.</p>}</>:<div className="request-claim"><div><strong>Ce sinistre est dans la file commune.</strong><span>Le premier utilisateur qui le prend devient son responsable.</span></div><Button disabled={Boolean(actionEnCours)} onClick={()=>void executer("prise",()=>apiBackoffice.prendreEnChargeSinistre(reference),"Le sinistre vous est maintenant affecté.")}>{actionEnCours==="prise"&&<LoaderCircle className="animate-spin"/>}Prendre en charge</Button></div>}{detail.responsable&&estGestionnaire&&<div className="request-reassign"><Label>Réaffectation exceptionnelle</Label><Select value={responsableCible} onValueChange={setResponsableCible}><SelectTrigger className="w-full"><SelectValue placeholder="Choisir un responsable"/></SelectTrigger><SelectContent>{intervenants.map((intervenant)=><SelectItem key={intervenant.id} value={intervenant.id}>{intervenant.nom_complet}</SelectItem>)}</SelectContent></Select><Textarea value={motif} onChange={(event)=>setMotif(event.target.value)} placeholder="Motif obligatoire"/><Button disabled={!responsableCible||responsableCible===detail.responsable.id||motif.trim().length<3||Boolean(actionEnCours)} onClick={()=>void executer("reaffectation",()=>apiBackoffice.reaffecterSinistre(reference,responsableCible,motif),"Le sinistre a été réaffecté.")}>Réaffecter</Button></div>}</CardContent></Card><Card className="request-page-panel"><CardContent className="p-0"><p className="eyebrow">Avancement automatique</p><ParcoursSinistre statut={detail.statut}/>{detail.prochain_statut&&detail.responsable&&(estResponsable||estGestionnaire)&&<Button className="w-full" disabled={Boolean(actionEnCours)} onClick={()=>void executer("avancement",()=>apiBackoffice.avancerSinistre(reference),`Le sinistre passe à l’étape « ${libellesStatutsSinistres[detail.prochain_statut!] } ».`)}>{actionEnCours==="avancement"&&<LoaderCircle className="animate-spin"/>}Passer à l’étape suivante</Button>}</CardContent></Card></aside></div></>}</div>;
}

function ReportsView({ data }: { data: DemoData }) {
  const byCompany = companies.map((company) => ({ name: company.name, prime: Math.round(data.policies.filter((policy) => policy.companyId === company.id).reduce((sum, policy) => sum + policy.premium, 0) / 1_000_000), commission: Math.round(data.commissions.filter((item) => item.companyId === company.id).reduce((sum, item) => sum + item.received, 0) / 1_000_000) }));
  const trend = [17,22,19,26,31,28,36,34,42,39,45,51].map((value,index)=>({month:["O","N","D","J","F","M","A","M","J","J","A","S"][index],value}));
  return <><PageHeading eyebrow="Pilotage" title="Rapports" subtitle="Indicateurs alimentés par le même jeu de données que les modules opérationnels."/><div className="report-grid"><Card className="report-card"><CardContent><div className="section-title-row"><div><p className="eyebrow">Production</p><h2>Évolution mensuelle</h2></div></div><div className="report-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="month"/><YAxis/><ChartTooltip/><Line type="monotone" dataKey="value" stroke="#1b6eb7" strokeWidth={3}/></LineChart></ResponsiveContainer></div></CardContent></Card><Card className="report-card"><CardContent><div className="section-title-row"><div><p className="eyebrow">Partenaires</p><h2>Primes & commissions</h2></div></div><div className="report-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={byCompany}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis/><ChartTooltip/><Legend/><Bar dataKey="prime" name="Primes (M)" fill="#1b6eb7"/><Bar dataKey="commission" name="Commissions (M)" fill="#51b9b7"/></BarChart></ResponsiveContainer></div></CardContent></Card></div><section className="kpi-strip"><span><b>{data.policies.length}</b>polices suivies</span><span><b>{data.invoices.filter((i)=>i.status==="Impayée").length}</b>factures impayées</span><span><b>{data.claims.filter((c)=>c.status!=="Clôturé").length}</b>sinistres ouverts</span><span><b>{data.transmissions.filter((t)=>t.status==="Traité").length}</b>transmissions traitées</span></section></>;
}

function GenericView({ module, data }: { module: ModuleId; data: DemoData }) {
  if (module === "activities") return <><PageHeading eyebrow="CRM" title="Activités" subtitle="Historique récent des échanges et actions de l’équipe."/><TableCard><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Client</TableHead><TableHead>Type</TableHead><TableHead>Activité</TableHead><TableHead>Responsable</TableHead></TableRow></TableHeader><TableBody>{data.activities.slice(0,45).map((item) => <TableRow key={item.id}><TableCell>{displayDate(item.date)}</TableCell><TableCell>{data.clients.find((c)=>c.id===item.clientId)?.name}</TableCell><TableCell><StatusBadge value={item.type}/></TableCell><TableCell>{item.label}</TableCell><TableCell>{item.author}</TableCell></TableRow>)}</TableBody></Table></TableCard></>;
  if (module === "products") return <><PageHeading eyebrow="Production" title="Produits" subtitle="Catalogue de produits proposés par les compagnies partenaires."/><div className="product-grid">{products.map((product)=><Card key={product.id} className="product-card"><CardContent><span className="product-icon"><ShieldCheck/></span><p>{product.category}</p><h2>{product.name}</h2><div><span>{product.policies} polices</span><strong>{shortMoney(product.premium)}</strong></div></CardContent></Card>)}</div></>;
  if (module === "companies") return <><PageHeading eyebrow="Partenaires" title="Compagnies" subtitle="Contacts, portefeuilles et modes de traitement simulés."/><TableCard><Table><TableHeader><TableRow><TableHead>Compagnie</TableHead><TableHead>Contact</TableHead><TableHead>Téléphone</TableHead><TableHead>Produits</TableHead><TableHead>Polices</TableHead><TableHead>Prime totale</TableHead><TableHead>Commission moyenne</TableHead><TableHead>Traitement</TableHead></TableRow></TableHeader><TableBody>{companies.map((company)=>{const policies=data.policies.filter((p)=>p.companyId===company.id);return <TableRow key={company.id}><TableCell><strong>{company.name}</strong></TableCell><TableCell>{company.contact}<small>{company.email}</small></TableCell><TableCell>{company.phone}</TableCell><TableCell>{company.products.join(", ")}</TableCell><TableCell>{policies.length}</TableCell><TableCell>{shortMoney(policies.reduce((s,p)=>s+p.premium,0))}</TableCell><TableCell>{company.rate}%</TableCell><TableCell><StatusBadge value={company.mode}/></TableCell></TableRow>})}</TableBody></Table></TableCard></>;
  if (module === "transmissions") return <><PageHeading eyebrow="Partenaires" title="Transmissions assureurs" subtitle="Bordereaux et dossiers transmis aux compagnies."/><TableCard><Table><TableHeader><TableRow><TableHead>Référence</TableHead><TableHead>Compagnie</TableHead><TableHead>Date opération</TableHead><TableHead>Date transmission</TableHead><TableHead>Dossiers</TableHead><TableHead>Montant</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{data.transmissions.map((item)=><TableRow key={item.id}><TableCell className="ref-cell">{item.id}</TableCell><TableCell>{companyName(item.companyId)}</TableCell><TableCell>{displayDate(item.operationDate)}</TableCell><TableCell>{displayDate(item.sentDate)}</TableCell><TableCell>{item.files}</TableCell><TableCell>{shortMoney(item.amount)}</TableCell><TableCell><StatusBadge value={item.status}/></TableCell></TableRow>)}</TableBody></Table></TableCard></>;
  if (module === "documents") return <><PageHeading eyebrow="Gestion" title="Documents" subtitle="Bibliothèque documentaire fictive, sans donnée sensible réelle."/><div className="document-grid">{data.documents.slice(0,30).map((doc)=><button className="document-card" key={doc.id}><span><Files/></span><div><strong>{doc.name}</strong><small>{doc.type} · {data.clients.find((c)=>c.id===doc.clientId)?.name}</small><small>Ajouté le {displayDate(doc.date)} par {doc.addedBy}</small></div></button>)}</div></>;
  if (module === "users") return <><PageHeading eyebrow="Administration" title="Utilisateurs" subtitle="Équipe fictive et rôles affectés dans la démonstration." action={<Button><Plus/>Ajouter un utilisateur</Button>}/><div className="user-grid">{users.map((user)=><Card className="user-card" key={user.email}><CardContent><div className="user-avatar">{user.name.split(" ").map((n)=>n[0]).join("").slice(0,2)}</div><div><strong>{user.name}</strong><span>{user.email}</span><Badge variant="secondary">{user.role}</Badge></div><StatusBadge value={user.status}/></CardContent></Card>)}</div></>;
  if (module === "roles") { const roles=["Administrateur","Responsable courtage","Conseiller","Production","Comptabilité","Sinistres"]; return <><PageHeading eyebrow="Administration" title="Rôles & permissions" subtitle="Vue de démonstration des autorisations par profil."/><TableCard><Table><TableHeader><TableRow><TableHead>Rôle</TableHead>{["Clients","Production","Finance","Sinistres","Administration"].map((h)=><TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>{roles.map((role,i)=><TableRow key={role}><TableCell><strong>{role}</strong></TableCell>{[0,1,2,3,4].map((p)=><TableCell key={p}>{i===0 || p===i-1 || (i===1&&p<4) ? <Check className="permission-check"/> : <span className="permission-empty">—</span>}</TableCell>)}</TableRow>)}</TableBody></Table></TableCard></> }
  if (module === "settings") return <><PageHeading eyebrow="Administration" title="Paramètres" subtitle="Préférences générales de la démonstration."/><Card className="settings-card"><CardContent><div><Label>Nom affiché</Label><Input defaultValue="Gestion du courtage"/></div><div><Label>Devise</Label><Input defaultValue="FCFA (XAF)" disabled/></div><div><Label>Délai d’alerte renouvellement</Label><Input defaultValue="30 jours"/></div><div><Label>Adresse de notification</Label><Input defaultValue="direction@demonstration.local"/></div><Button onClick={()=>toast.success("Paramètres de démonstration enregistrés")}>Enregistrer les paramètres</Button></CardContent></Card></>;
  return <><PageHeading eyebrow="Production" title="Transactions de police" subtitle="Souscriptions, avenants, modifications et renouvellements."/><TableCard><Table><TableHeader><TableRow><TableHead>Référence</TableHead><TableHead>Police</TableHead><TableHead>Client</TableHead><TableHead>Type</TableHead><TableHead>Date d’effet</TableHead><TableHead>Prime associée</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{data.policies.slice(0,35).map((policy,index)=><TableRow key={policy.id}><TableCell className="ref-cell">TRX-{String(index+1).padStart(3,"0")}</TableCell><TableCell>{policy.id}</TableCell><TableCell>{data.clients.find((c)=>c.id===policy.clientId)?.name}</TableCell><TableCell>{["Nouvelle souscription","Avenant","Modification","Renouvellement","Suspension","Résiliation"][index%6]}</TableCell><TableCell>{displayDate(policy.startDate)}</TableCell><TableCell>{shortMoney(policy.premium)}</TableCell><TableCell><StatusBadge value={index%7===0?"En préparation":"Validée"}/></TableCell></TableRow>)}</TableBody></Table></TableCard></>;
}

function ClientSheet({ client, data, onClose }: { client: Client | null; data: DemoData; onClose: () => void }) {
  if (!client) return null; const policies=data.policies.filter((p)=>p.clientId===client.id); const invoices=data.invoices.filter((i)=>i.clientId===client.id); const payments=data.payments.filter((p)=>p.clientId===client.id); const claims=data.claims.filter((c)=>c.clientId===client.id); const activities=data.activities.filter((a)=>a.clientId===client.id);
  return <Sheet open={!!client} onOpenChange={(open)=>!open&&onClose()}><SheetContent className="detail-sheet"><SheetHeader><div className="detail-kicker">{client.id} · {client.type}</div><SheetTitle>{client.name}</SheetTitle><SheetDescription>{client.email} · {client.phone}</SheetDescription></SheetHeader><div className="sheet-body"><section className="detail-stats"><Summary label="Polices" value={String(policies.length)}/><Summary label="Prime annuelle" value={shortMoney(client.annualPremium)}/><Summary label="Solde restant" value={shortMoney(client.balance)} alert={client.balance>0}/><Summary label="Sinistres ouverts" value={String(claims.filter((c)=>c.status!=="Clôturé").length)}/></section><Tabs defaultValue="overview"><TabsList variant="line" className="detail-tabs"><TabsTrigger value="overview">Vue d’ensemble</TabsTrigger><TabsTrigger value="policies">Polices</TabsTrigger><TabsTrigger value="finance">Finance</TabsTrigger><TabsTrigger value="claims">Sinistres</TabsTrigger><TabsTrigger value="activities">Activités</TabsTrigger></TabsList><TabsContent value="overview" className="detail-tab-content"><div className="info-grid"><Info label="Conseiller" value={client.advisor}/><Info label="Statut" value={client.status}/><Info label="Créé le" value={displayDate(client.createdAt)}/><Info label="Opportunités" value={String(data.opportunities.filter((o)=>o.clientId===client.id).length)}/></div><Timeline rows={activities.slice(0,6).map((a)=>({date:a.date,label:a.label,meta:a.author}))}/></TabsContent><TabsContent value="policies"><MiniTable headers={["Police","Produit","Prime","Statut"]} rows={policies.map((p)=>[p.id,p.product,shortMoney(p.premium),p.status])}/></TabsContent><TabsContent value="finance"><MiniTable headers={["Facture","Montant","Payé","Statut"]} rows={invoices.map((i)=>[i.id,shortMoney(i.amount),shortMoney(i.paid),i.status])}/><p className="detail-note">{payments.length} paiement(s) affecté(s) à ce client.</p></TabsContent><TabsContent value="claims"><MiniTable headers={["Sinistre","Type","Date","Statut"]} rows={claims.map((c)=>[c.id,c.type,displayDate(c.date),c.status])}/></TabsContent><TabsContent value="activities"><Timeline rows={activities.map((a)=>({date:a.date,label:a.label,meta:`${a.type} · ${a.author}`}))}/></TabsContent></Tabs></div></SheetContent></Sheet>;
}

function PolicySheet({ policy, data, onClose }: { policy: Policy | null; data: DemoData; onClose: () => void }) {
  if(!policy)return null; const client=data.clients.find((c)=>c.id===policy.clientId); const invoice=data.invoices.find((i)=>i.policyId===policy.id); const claimRows=data.claims.filter((c)=>c.policyId===policy.id);
  return <Sheet open={!!policy} onOpenChange={(open)=>!open&&onClose()}><SheetContent className="detail-sheet"><SheetHeader><div className="detail-kicker">{policy.id} · {companyName(policy.companyId)}</div><SheetTitle>{policy.product}</SheetTitle><SheetDescription>{client?.name} · échéance {displayDate(policy.endDate)}</SheetDescription></SheetHeader><div className="sheet-body"><section className="policy-hero"><div><span>Prime annuelle</span><strong>{shortMoney(policy.premium)}</strong></div><StatusBadge value={policy.status}/></section><Tabs defaultValue="overview"><TabsList variant="line" className="detail-tabs"><TabsTrigger value="overview">Vue d’ensemble</TabsTrigger><TabsTrigger value="risk">Risques & garanties</TabsTrigger><TabsTrigger value="finance">Factures & paiements</TabsTrigger><TabsTrigger value="claims">Sinistres</TabsTrigger></TabsList><TabsContent value="overview"><div className="info-grid"><Info label="Assuré" value={policy.insured}/><Info label="Conseiller" value={policy.advisor}/><Info label="Date d’effet" value={displayDate(policy.startDate)}/><Info label="Expiration" value={displayDate(policy.endDate)}/><Info label="Compagnie" value={companyName(policy.companyId)}/><Info label="Proposition" value={policy.proposalId ?? "Souscription directe"}/></div><Timeline rows={[{date:policy.startDate,label:"Nouvelle souscription créée",meta:policy.advisor},{date:policy.startDate,label:"Police émise par la compagnie",meta:companyName(policy.companyId)},{date:policy.startDate,label:"Facture générée",meta:invoice?.id??""}]}/></TabsContent><TabsContent value="risk"><Card className="risk-card"><CardContent><p className="eyebrow">Risque assuré</p><h3>{policy.risk}</h3><p>{policy.riskDetails}</p></CardContent></Card><div className="guarantee-list">{policy.guarantees.map((g,index)=><div key={g}><span><Check/></span><div><strong>{g}</strong><small>Montant garanti : {shortMoney(5_000_000+index*3_500_000)} · Franchise : {shortMoney(50_000+index*10_000)}</small></div></div>)}</div></TabsContent><TabsContent value="finance">{invoice&&<MiniTable headers={["Facture","Montant","Payé","Solde","Statut"]} rows={[[invoice.id,shortMoney(invoice.amount),shortMoney(invoice.paid),shortMoney(invoice.amount-invoice.paid),invoice.status]]}/>}</TabsContent><TabsContent value="claims"><MiniTable headers={["Sinistre","Type","Date","Statut"]} rows={claimRows.map((c)=>[c.id,c.type,displayDate(c.date),c.status])}/></TabsContent></Tabs></div></SheetContent></Sheet>;
}

function Info({ label, value }: { label:string; value:string }) { return <div className="info-item"><span>{label}</span><strong>{value}</strong></div>; }
function MiniTable({ headers, rows }: { headers:string[]; rows:string[][] }) { return <div className="mini-table"><div>{headers.map((h)=><strong key={h}>{h}</strong>)}</div>{rows.length?rows.map((row,index)=><div key={index}>{row.map((cell,i)=><span key={`${cell}-${i}`}>{cell}</span>)}</div>):<p>Aucun élément pour cette section.</p>}</div>; }
function Timeline({ rows }: { rows:Array<{date:string;label:string;meta:string}> }) { return <div className="timeline"><h3>Historique récent</h3>{rows.map((row,index)=><div key={`${row.date}-${index}`}><span/><div><strong>{row.label}</strong><small>{displayDate(row.date)} · {row.meta}</small></div></div>)}</div>; }

function ProposalDialog({ proposal, data, onClose, onRecommend, onAddOffer, onConvert }: { proposal:Proposal|null; data:DemoData; onClose:()=>void; onRecommend:(proposalId:string,offerId:string)=>void; onAddOffer:(proposalId:string)=>void; onConvert:(proposal:Proposal)=>void }) {
  if(!proposal)return null; const client=data.clients.find((c)=>c.id===proposal.clientId); return <Dialog open={!!proposal} onOpenChange={(open)=>!open&&onClose()}><DialogContent className="proposal-dialog"><DialogHeader><DialogTitle>{proposal.id} · {client?.name}</DialogTitle><DialogDescription>{proposal.product} · {displayDate(proposal.date)} · {proposal.advisor}</DialogDescription></DialogHeader><div className="proposal-meta"><StatusBadge value={proposal.status}/><span>{proposal.offers.length} offres comparées</span></div><div className="comparison-table"><div className="comparison-row comparison-row--head"><span>Compagnie</span><span>Prime nette</span><span>Taxes & frais</span><span>Prime totale</span><span>Franchise</span><span>Garanties</span><span>Commission</span><span>Choix</span></div>{proposal.offers.map((offer)=><div className={`comparison-row ${offer.recommended?"is-recommended":""}`} key={offer.id}><span><strong>{companyName(offer.companyId)}</strong>{offer.recommended&&<small>Recommandée</small>}</span><span>{shortMoney(offer.netPremium)}</span><span>{shortMoney(offer.taxes+offer.fees)}</span><span><strong>{shortMoney(offer.total)}</strong></span><span>{shortMoney(offer.deductible)}</span><span>{offer.guarantees.length} garanties</span><span>{offer.commissionRate}%</span><span><Button size="sm" variant={offer.recommended?"secondary":"outline"} onClick={()=>onRecommend(proposal.id,offer.id)}>{offer.recommended?<Check/>:"Choisir"}</Button></span></div>)}</div><div className="recommendation"><Sparkles/><div><strong>Recommandation du courtier</strong><p>{proposal.recommendation}</p></div></div><DialogFooter className="justify-between"><Button variant="outline" onClick={()=>onAddOffer(proposal.id)}><Plus/>Ajouter une offre</Button><div className="flex gap-2"><Button variant="outline" onClick={onClose}>Fermer</Button><Button onClick={()=>onConvert(proposal)}>Transformer en police</Button></div></DialogFooter></DialogContent></Dialog>;
}

function OpportunityDialog({ opportunity, data, onClose, onStage }: { opportunity:Opportunity|null; data:DemoData; onClose:()=>void; onStage:(stage:Opportunity["stage"])=>void }) {
  if(!opportunity)return null; const client=data.clients.find((c)=>c.id===opportunity.clientId); return <Dialog open={!!opportunity} onOpenChange={(open)=>!open&&onClose()}><DialogContent className="wide-dialog"><DialogHeader><DialogTitle>{opportunity.id} · {client?.name}</DialogTitle><DialogDescription>{opportunity.product} · créée le {displayDate(opportunity.createdAt)}</DialogDescription></DialogHeader><div className="detail-stats"><Summary label="Prime estimée" value={shortMoney(opportunity.estimatedPremium)}/><Summary label="Probabilité" value={`${opportunity.probability}%`}/><Summary label="Commission estimée" value={shortMoney(opportunity.commission)}/></div><div className="info-grid"><Info label="Conseiller" value={opportunity.advisor}/><Info label="Statut" value={opportunity.stage}/><Info label="Prochaine relance" value={displayDate(opportunity.nextAction)}/><Info label="Besoin" value={opportunity.need}/></div><Tabs defaultValue="info"><TabsList><TabsTrigger value="info">Informations</TabsTrigger><TabsTrigger value="documents">Documents</TabsTrigger><TabsTrigger value="activities">Activités</TabsTrigger><TabsTrigger value="notes">Notes</TabsTrigger></TabsList><TabsContent value="info"><p className="dialog-copy">Le client souhaite comparer plusieurs niveaux de couverture avant décision.</p></TabsContent><TabsContent value="documents"><p className="dialog-copy">3 documents de préparation sont disponibles.</p></TabsContent><TabsContent value="activities"><Timeline rows={[{date:opportunity.createdAt,label:"Opportunité créée",meta:opportunity.advisor},{date:opportunity.nextAction,label:"Relance planifiée",meta:"À venir"}]}/></TabsContent><TabsContent value="notes"><Textarea defaultValue="Privilégier une offre avec assistance et franchise maîtrisée."/></TabsContent></Tabs><DialogFooter><Button variant="outline" onClick={()=>onStage("Perdu")}>Marquer comme perdue</Button><Button variant="outline" onClick={()=>toast.success("Activité ajoutée")}>Ajouter une activité</Button><Button onClick={()=>onStage("Gagné")}>Marquer comme gagnée</Button></DialogFooter></DialogContent></Dialog>;
}

function ClaimDialog({ claim, data, onClose, onStatus }: { claim:Claim|null; data:DemoData; onClose:()=>void; onStatus:(status:Claim["status"])=>void }) {
  if(!claim)return null; return <Dialog open={!!claim} onOpenChange={(open)=>!open&&onClose()}><DialogContent className="wide-dialog"><DialogHeader><DialogTitle>{claim.id} · {claim.type}</DialogTitle><DialogDescription>{data.clients.find((c)=>c.id===claim.clientId)?.name} · {claim.policyId}</DialogDescription></DialogHeader><div className="claim-status-row"><StatusBadge value={claim.status}/><Select value={claim.status} onValueChange={(value)=>onStatus(value as Claim["status"])}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{claimStatusList.map((status)=><SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div><Timeline rows={claim.timeline.map((item)=>({...item,meta:claim.advisor}))}/><DialogFooter><Button variant="outline" onClick={()=>toast.success("Relance sinistre enregistrée")}>Ajouter une relance</Button><Button onClick={onClose}>Terminer</Button></DialogFooter></DialogContent></Dialog>;
}

function CreateClientDialog({ open, onClose, onCreate }: { open:boolean; onClose:()=>void; onCreate:(name:string,type:Client["type"])=>void }) { const [name,setName]=useState("");const [type,setType]=useState<Client["type"]>("Particulier");return <Dialog open={open} onOpenChange={(value)=>!value&&onClose()}><DialogContent><DialogHeader><DialogTitle>Créer un client</DialogTitle><DialogDescription>Ajoutez une fiche fictive au portefeuille de démonstration.</DialogDescription></DialogHeader><Label>Nom / raison sociale</Label><Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Ex. Entreprise Démo SARL"/><Label>Type de client</Label><Select value={type} onValueChange={(v)=>setType(v as Client["type"])}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Particulier">Particulier</SelectItem><SelectItem value="Entreprise">Entreprise</SelectItem></SelectContent></Select><DialogFooter><Button variant="outline" onClick={onClose}>Annuler</Button><Button disabled={!name.trim()} onClick={()=>{onCreate(name.trim(),type);setName("");}}>Créer le client</Button></DialogFooter></DialogContent></Dialog> }

function CreateOpportunityDialog({ open, data, onClose, onCreate }: { open:boolean; data:DemoData; onClose:()=>void; onCreate:(clientId:string,product:string)=>void }) { const [clientId,setClientId]=useState(data.clients[0].id);const [product,setProduct]=useState(products[0].name);return <Dialog open={open} onOpenChange={(value)=>!value&&onClose()}><DialogContent><DialogHeader><DialogTitle>Nouvelle opportunité</DialogTitle><DialogDescription>Créez une affaire commerciale dans l’étape Découverte.</DialogDescription></DialogHeader><Label>Client</Label><Select value={clientId} onValueChange={setClientId}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent>{data.clients.slice(0,40).map((c)=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><Label>Produit</Label><Select value={product} onValueChange={setProduct}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent>{products.map((p)=><SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select><DialogFooter><Button variant="outline" onClick={onClose}>Annuler</Button><Button onClick={()=>onCreate(clientId,product)}>Créer l’opportunité</Button></DialogFooter></DialogContent></Dialog> }

function ProposalWizard({ open, data, onClose, onCreate }: { open:boolean; data:DemoData; onClose:()=>void; onCreate:(clientId:string,product:string)=>void }) { const [step,setStep]=useState(1);const [clientId,setClientId]=useState(data.clients[0].id);const [product,setProduct]=useState(products[0].name);const labels=["Client et produit","Risques","Garanties","Assureurs","Prime","Vérification"];return <Dialog open={open} onOpenChange={(value)=>!value&&onClose()}><DialogContent className="wizard-dialog"><DialogHeader><DialogTitle>Préparer une proposition</DialogTitle><DialogDescription>Étape {step} sur 6 · {labels[step-1]}</DialogDescription></DialogHeader><div className="wizard-steps">{labels.map((label,index)=><span key={label} className={index+1<=step?"is-active":""}>{index+1}<small>{label}</small></span>)}</div><div className="wizard-body">{step===1&&<><Label>Client</Label><Select value={clientId} onValueChange={setClientId}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent>{data.clients.slice(0,50).map((c)=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><Label>Produit</Label><Select value={product} onValueChange={setProduct}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent>{products.map((p)=><SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select></>}{step===2&&<><Label>Description du risque</Label><Textarea defaultValue="Risque principal à assurer selon les informations fournies par le client."/><Label>Valeur déclarée</Label><Input defaultValue="15 000 000 FCFA"/></>}{step===3&&<div className="choice-grid">{["Responsabilité civile","Dommages","Vol","Incendie","Bris de glace","Assistance"].map((item)=><label key={item}><input type="checkbox" defaultChecked={item!=="Bris de glace"}/>{item}</label>)}</div>}{step===4&&<div className="choice-grid">{companies.map((c)=><label key={c.id}><input type="checkbox" defaultChecked={c.id!=="COMP-D"}/>{c.name}<small>{c.products.join(" · ")}</small></label>)}</div>}{step===5&&<div className="offer-preview">{companies.slice(0,3).map((c,i)=><div key={c.id}><strong>{c.name}</strong><span>Prime totale</span><b>{shortMoney(98500+i*10750)}</b></div>)}</div>}{step===6&&<div className="verification-box"><Check/><div><strong>Proposition prête à créer</strong><p>3 offres seront ajoutées avec leurs primes, taxes, frais, garanties et franchises.</p></div></div>}</div><DialogFooter className="justify-between"><Button variant="outline" disabled={step===1} onClick={()=>setStep((s)=>s-1)}>Précédent</Button>{step<6?<Button onClick={()=>setStep((s)=>s+1)}>Continuer</Button>:<Button onClick={()=>{onCreate(clientId,product);setStep(1);}}>Créer la proposition</Button>}</DialogFooter></DialogContent></Dialog> }

function PaymentDialog({ open, data, onClose, onCreate }: { open:boolean; data:DemoData; onClose:()=>void; onCreate:(invoiceId:string,amount:number)=>void }) { const candidates=data.invoices.filter((i)=>i.amount>i.paid).slice(0,40);const [invoiceId,setInvoiceId]=useState(candidates[0]?.id??"");const invoice=data.invoices.find((i)=>i.id===invoiceId);const [amount,setAmount]=useState(invoice?invoice.amount-invoice.paid:0);useEffect(()=>{if(invoice)setAmount(invoice.amount-invoice.paid)},[invoiceId]);return <Dialog open={open} onOpenChange={(value)=>!value&&onClose()}><DialogContent><DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle><DialogDescription>Affectez un encaissement fictif à une facture existante.</DialogDescription></DialogHeader><Label>Facture</Label><Select value={invoiceId} onValueChange={setInvoiceId}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent>{candidates.map((i)=><SelectItem key={i.id} value={i.id}>{i.id} · {data.clients.find((c)=>c.id===i.clientId)?.name} · solde {shortMoney(i.amount-i.paid)}</SelectItem>)}</SelectContent></Select><Label>Montant</Label><Input type="number" value={amount} onChange={(e)=>setAmount(Number(e.target.value))}/><Label>Mode</Label><Select defaultValue="Mobile Money"><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent>{["Espèces","Virement","Mobile Money","Orange Money","Carte bancaire"].map((m)=><SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select><DialogFooter><Button variant="outline" onClick={onClose}>Annuler</Button><Button disabled={!invoiceId||amount<=0} onClick={()=>onCreate(invoiceId,amount)}>Affecter le paiement</Button></DialogFooter></DialogContent></Dialog> }

export function CourtierApp() {
  const [utilisateurConnecte,setUtilisateurConnecte]=useState<UtilisateurBackoffice|null|undefined>(undefined);
  const [active,setActive]=useState<ModuleId>(()=>estVueDemandesUrl()?"requests":estVueSinistresUrl()?"claims":"dashboard");
  const [referenceDemandeOuverte,setReferenceDemandeOuverte]=useState<string|null>(lireReferenceDemandeUrl);
  const [referenceSinistreOuvert,setReferenceSinistreOuvert]=useState<string|null>(lireReferenceSinistreUrl);
  const [versionDemandes,setVersionDemandes]=useState(0);
  const [versionSinistres,setVersionSinistres]=useState(0);
  const [nouvellesDemandes,setNouvellesDemandes]=useState(0);
  const [nouveauxSinistres,setNouveauxSinistres]=useState(0);
  const [data,setData]=useState<DemoData>(()=>createDemoData());
  const [hydrated,setHydrated]=useState(false);
  const [selectedClient,setSelectedClient]=useState<Client|null>(null); const [selectedPolicy,setSelectedPolicy]=useState<Policy|null>(null); const [selectedProposal,setSelectedProposal]=useState<Proposal|null>(null); const [selectedOpportunity,setSelectedOpportunity]=useState<Opportunity|null>(null); const [selectedClaim,setSelectedClaim]=useState<Claim|null>(null);
  const [clientDialog,setClientDialog]=useState(false); const [opportunityDialog,setOpportunityDialog]=useState(false); const [proposalWizard,setProposalWizard]=useState(false); const [paymentDialog,setPaymentDialog]=useState(false);

  useEffect(()=>{const synchroniser=()=>{setReferenceDemandeOuverte(lireReferenceDemandeUrl());setReferenceSinistreOuvert(lireReferenceSinistreUrl());if(estVueDemandesUrl())setActive("requests");else if(estVueSinistresUrl())setActive("claims");};window.addEventListener("popstate",synchroniser);return()=>window.removeEventListener("popstate",synchroniser);},[]);

  const ouvrirListeDemandes=()=>{window.history.pushState({},"","/?vue=demandes");setReferenceDemandeOuverte(null);setActive("requests");setNouvellesDemandes(0);};
  const revenirListeDemandes=()=>{window.history.replaceState({},"","/?vue=demandes");setReferenceDemandeOuverte(null);setActive("requests");setNouvellesDemandes(0);window.scrollTo({top:0,behavior:"smooth"});};
  const ouvrirDemande=(reference:string)=>{window.history.pushState({},"",`/?demande=${encodeURIComponent(reference)}`);setReferenceDemandeOuverte(reference);setActive("requests");setNouvellesDemandes(0);window.scrollTo({top:0,behavior:"smooth"});};
  const ouvrirListeSinistres=()=>{window.history.pushState({},"","/?vue=sinistres");setReferenceSinistreOuvert(null);setActive("claims");setNouveauxSinistres(0);};
  const revenirListeSinistres=()=>{window.history.replaceState({},"","/?vue=sinistres");setReferenceSinistreOuvert(null);setActive("claims");setNouveauxSinistres(0);window.scrollTo({top:0,behavior:"smooth"});};
  const ouvrirSinistre=(reference:string)=>{window.history.pushState({},"",`/?sinistre=${encodeURIComponent(reference)}`);setReferenceSinistreOuvert(reference);setActive("claims");setNouveauxSinistres(0);window.scrollTo({top:0,behavior:"smooth"});};

  useEffect(()=>{let actif=true;apiBackoffice.obtenirSession().then((reponse)=>{if(!actif)return;enregistrerSession(reponse);setUtilisateurConnecte(reponse.utilisateur);}).catch(()=>{if(actif){oublierSession();setUtilisateurConnecte(null);}});return()=>{actif=false};},[]);

  const utilisateurConnecteId=utilisateurConnecte?.id;
  useEffect(()=>{if(!utilisateurConnecteId)return;let actif=true;apiBackoffice.listerDemandes({statut:"nouvelle"}).then((demandes)=>{if(actif)setNouvellesDemandes(demandes.length);}).catch(()=>undefined);const flux=apiBackoffice.creerFluxDemandes();const evenementDemande=(evenement:Event)=>{if(!actif)return;let type="";try{type=JSON.parse((evenement as MessageEvent<string>).data)?.type??"";}catch{type="";}setVersionDemandes((version)=>version+1);if(type==="nouvelle_demande"){setNouvellesDemandes((total)=>total+1);toast.info("Une nouvelle demande client vient d’être reçue.",{action:{label:"Consulter",onClick:ouvrirListeDemandes}});}};flux.addEventListener("demande",evenementDemande);return()=>{actif=false;flux.removeEventListener("demande",evenementDemande);flux.close();};},[utilisateurConnecteId]);
  useEffect(()=>{if(!utilisateurConnecteId)return;let actif=true;apiBackoffice.listerSinistres({statut:"declare"}).then((sinistres)=>{if(actif)setNouveauxSinistres(sinistres.length);}).catch(()=>undefined);const flux=apiBackoffice.creerFluxSinistres();const evenementSinistre=(evenement:Event)=>{if(!actif)return;let type="";try{type=JSON.parse((evenement as MessageEvent<string>).data)?.type??"";}catch{type="";}setVersionSinistres((version)=>version+1);if(type==="nouveau_sinistre"){setNouveauxSinistres((total)=>total+1);toast.info("Un nouveau sinistre vient d’être déclaré.",{action:{label:"Consulter",onClick:ouvrirListeSinistres}});}};flux.addEventListener("sinistre",evenementSinistre);return()=>{actif=false;flux.removeEventListener("sinistre",evenementSinistre);flux.close();};},[utilisateurConnecteId]);

  useEffect(()=>{const saved=localStorage.getItem(STORAGE_KEY);if(saved){try{setData(JSON.parse(saved));}catch{localStorage.removeItem(STORAGE_KEY)}}setHydrated(true);},[]);
  useEffect(()=>{if(hydrated)localStorage.setItem(STORAGE_KEY,JSON.stringify(data));},[data,hydrated]);

  useEffect(()=>{
    const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options?:{signal?:AbortSignal})=>void|Promise<void>}}).modelContext;
    if(!context?.registerTool)return; const lifecycle=new AbortController();
    const tools=[
      {name:"create_demo_client",title:"Créer un client fictif",description:"Crée un client dans la démonstration et met à jour la liste visible.",inputSchema:{type:"object",properties:{name:{type:"string"},type:{type:"string",enum:["Particulier","Entreprise"]}},required:["name","type"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input:any)=>{if(!input?.name||!["Particulier","Entreprise"].includes(input.type))throw new Error("Entrée invalide");const id=`CL-${String(data.clients.length+1).padStart(3,"0")}`;setData((prev)=>({...prev,clients:[{id,name:input.name,type:input.type,phone:"+237 600 000 000",email:"nouveau.client@demo.local",advisor:"Sophie N.",status:"Prospect",createdAt:"2026-10-01",annualPremium:0,balance:0,policyIds:[]},...prev.clients]}));return {id,status:"créé"};}},
      {name:"update_demo_opportunity_stage",title:"Mettre à jour une opportunité",description:"Déplace une opportunité existante vers une étape du pipeline.",inputSchema:{type:"object",properties:{opportunityId:{type:"string"},stage:{type:"string",enum:stageList}},required:["opportunityId","stage"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input:any)=>{if(!stageList.includes(input?.stage)||!data.opportunities.some((o)=>o.id===input.opportunityId))throw new Error("Opportunité ou étape invalide");setData((prev)=>({...prev,opportunities:prev.opportunities.map((o)=>o.id===input.opportunityId?{...o,stage:input.stage,probability:input.stage==="Gagné"?100:input.stage==="Perdu"?0:o.probability}:o)}));return {id:input.opportunityId,stage:input.stage};}},
    ]; tools.forEach((tool)=>{try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>undefined)}catch{}});return()=>lifecycle.abort();
  },[data.clients.length,data.opportunities]);

  const updateStage=(id:string,stage:Opportunity["stage"])=>{setData((prev)=>({...prev,opportunities:prev.opportunities.map((o)=>o.id===id?{...o,stage,probability:stage==="Gagné"?100:stage==="Perdu"?0:o.probability}:o)}));setSelectedOpportunity((current)=>current?.id===id?{...current,stage,probability:stage==="Gagné"?100:stage==="Perdu"?0:current.probability}:current);toast.success(`Opportunité déplacée vers « ${stage} »`);};
  const createClient=(name:string,type:Client["type"])=>{const id=`CL-${String(data.clients.length+1).padStart(3,"0")}`;const client:Client={id,name,type,phone:"+237 600 000 000",email:"nouveau.client@demo.local",advisor:"Sophie N.",status:"Prospect",createdAt:"2026-10-01",annualPremium:0,balance:0,policyIds:[]};setData((prev)=>({...prev,clients:[client,...prev.clients]}));setClientDialog(false);toast.success(`${name} a été ajouté au portefeuille`);};
  const createOpportunity=(clientId:string,product:string)=>{const index=data.opportunities.length+1;const opportunity:Opportunity={id:`OPP-${String(index).padStart(3,"0")}`,clientId,product,need:"Nouvelle demande créée pendant la démonstration.",estimatedPremium:450000,advisor:"Sophie N.",probability:20,stage:"Découverte",nextAction:"2026-10-08",commission:63000,createdAt:"2026-10-01"};setData((prev)=>({...prev,opportunities:[opportunity,...prev.opportunities]}));setOpportunityDialog(false);setActive("opportunities");toast.success("Opportunité créée dans l’étape Découverte");};
  const createProposal=(clientId:string,product:string)=>{const index=data.proposals.length+1;const opp=data.opportunities.find((o)=>o.clientId===clientId);const offers:Offer[]=companies.slice(0,3).map((c,i)=>({id:`OFF-${index}-${i+1}`,companyId:c.id,netPremium:90000+i*9000,taxes:8000+i*700,fees:5000,total:103000+i*9700,deductible:50000+i*25000,guarantees:["Responsabilité civile","Vol","Incendie","Assistance"],commissionRate:12+i*2,recommended:i===1}));const proposal:Proposal={id:`PROP-${String(index).padStart(3,"0")}`,opportunityId:opp?.id??`OPP-${String(data.opportunities.length+1).padStart(3,"0")}`,clientId,product,date:"2026-10-01",advisor:"Sophie N.",status:"Prête",recommendation:"Cette offre présente le meilleur équilibre entre niveau de couverture et coût pour le client.",offers};setData((prev)=>({...prev,proposals:[proposal,...prev.proposals]}));setProposalWizard(false);setActive("proposals");toast.success("Proposition créée avec 3 offres comparables");};
  const recommendOffer=(proposalId:string,offerId:string)=>{setData((prev)=>({...prev,proposals:prev.proposals.map((p)=>p.id===proposalId?{...p,offers:p.offers.map((o)=>({...o,recommended:o.id===offerId}))}:p)}));setSelectedProposal((p)=>p?.id===proposalId?{...p,offers:p.offers.map((o)=>({...o,recommended:o.id===offerId}))}:p);toast.success("Offre recommandée mise à jour");};
  const addOffer=(proposalId:string)=>{setData((prev)=>({...prev,proposals:prev.proposals.map((p)=>p.id===proposalId?{...p,offers:[...p.offers,{id:`OFF-${p.offers.length+1}-${Date.now()}`,companyId:"COMP-D",netPremium:94000,taxes:8200,fees:6000,total:108200,deductible:65000,guarantees:["Responsabilité civile","Vol","Assistance"],commissionRate:15}]}:p)}));setSelectedProposal((p)=>p?.id===proposalId?{...p,offers:[...p.offers,{id:`OFF-${Date.now()}`,companyId:"COMP-D",netPremium:94000,taxes:8200,fees:6000,total:108200,deductible:65000,guarantees:["Responsabilité civile","Vol","Assistance"],commissionRate:15}]}:p);toast.success("Offre de la Compagnie D ajoutée");};
  const convertProposal=(proposal:Proposal)=>{if(data.policies.some((p)=>p.proposalId===proposal.id)){toast.info("Cette proposition est déjà rattachée à une police");return;}const offer=proposal.offers.find((o)=>o.recommended)??proposal.offers[0];const id=`POL-${String(data.policies.length+1).padStart(3,"0")}`;const policy:Policy={id,proposalId:proposal.id,clientId:proposal.clientId,insured:data.clients.find((c)=>c.id===proposal.clientId)?.name??"Client",product:proposal.product,companyId:offer.companyId,premium:offer.total,startDate:"2026-10-01",endDate:"2027-09-30",advisor:proposal.advisor,status:"Active",risk:`Risque ${proposal.product.toLowerCase()}`,riskDetails:"Informations validées lors de la proposition.",guarantees:offer.guarantees};setData((prev)=>({...prev,policies:[policy,...prev.policies],proposals:prev.proposals.map((p)=>p.id===proposal.id?{...p,status:"Acceptée"}:p)}));setSelectedProposal(null);toast.success(`Police ${id} créée à partir de la proposition`);};
  const createInvoice=()=>{const policy=data.policies[0];const id=`FAC-${String(data.invoices.length+1).padStart(3,"0")}`;setData((prev)=>({...prev,invoices:[{id,clientId:policy.clientId,policyId:policy.id,amount:policy.premium,paid:0,date:"2026-10-01",dueDate:"2026-10-15",status:"En attente"},...prev.invoices]}));toast.success(`Facture ${id} créée`);};
  const createPayment=(invoiceId:string,amount:number)=>{const invoice=data.invoices.find((i)=>i.id===invoiceId);if(!invoice)return;const id=`PAY-${String(data.payments.length+1).padStart(3,"0")}`;setData((prev)=>({...prev,payments:[{id,clientId:invoice.clientId,invoiceId,amount,method:"Mobile Money",date:"2026-10-01",status:"Validé"},...prev.payments],invoices:prev.invoices.map((i)=>{if(i.id!==invoiceId)return i;const paid=Math.min(i.amount,i.paid+amount);return{...i,paid,status:paid>=i.amount?"Payée":"Partiellement payée"}})}));setPaymentDialog(false);toast.success(`Paiement ${id} affecté à ${invoiceId}`);};
  const prepareRenewal=(policy:Policy)=>{const opportunity:Opportunity={id:`OPP-${String(data.opportunities.length+1).padStart(3,"0")}`,clientId:policy.clientId,product:policy.product,need:`Renouvellement de la police ${policy.id}`,estimatedPremium:policy.premium,advisor:policy.advisor,probability:70,stage:"Étude",nextAction:"2026-10-05",commission:Math.round(policy.premium*.14),createdAt:"2026-10-01"};setData((prev)=>({...prev,opportunities:[opportunity,...prev.opportunities]}));toast.success(`Renouvellement préparé : ${opportunity.id}`);};
  const updateClaim=(id:string,status:Claim["status"])=>{setData((prev)=>({...prev,claims:prev.claims.map((c)=>c.id===id?{...c,status,timeline:[...c.timeline,{date:"2026-10-01",label:`Statut modifié : ${status}`}]}:c)}));setSelectedClaim((c)=>c?.id===id?{...c,status,timeline:[...c.timeline,{date:"2026-10-01",label:`Statut modifié : ${status}`}]}:c);toast.success("Statut du sinistre mis à jour");};
  const resetData=()=>{const fresh=createDemoData();setData(fresh);localStorage.setItem(STORAGE_KEY,JSON.stringify(fresh));window.history.pushState({},"","/");setReferenceDemandeOuverte(null);setReferenceSinistreOuvert(null);setActive("dashboard");toast.success("Données de démonstration réinitialisées");};

  if(utilisateurConnecte===undefined)return <main className="auth-loading"><LoaderCircle className="animate-spin"/><span>Vérification de votre session…</span></main>;
  if(!utilisateurConnecte)return <Login onConnect={setUtilisateurConnecte}/>;
  const groupesNavigation=navGroups.filter((groupe)=>groupe.label!=="Administration"||utilisateurConnecte.role==="super_admin");
  const selectionnerModule=(module:ModuleId)=>{if(module==="requests"){ouvrirListeDemandes();return;}if(module==="claims"){ouvrirListeSinistres();return;}if(estVueDemandesUrl()||estVueSinistresUrl())window.history.pushState({},"","/");setReferenceDemandeOuverte(null);setReferenceSinistreOuvert(null);setActive(module);};
  let content:React.ReactNode;
  if(active==="dashboard")content=<DashboardView data={data} goTo={selectionnerModule}/>; else if(active==="requests"&&referenceDemandeOuverte)content=<RequestDetailView reference={referenceDemandeOuverte} version={versionDemandes} utilisateur={utilisateurConnecte} onBack={revenirListeDemandes}/>; else if(active==="requests")content=<RequestsView version={versionDemandes} utilisateur={utilisateurConnecte} onOpen={ouvrirDemande}/>; else if(active==="clients")content=<ClientsView data={data} onSelect={setSelectedClient} onCreate={()=>setClientDialog(true)}/>; else if(active==="opportunities")content=<PipelineView data={data} onChangeStage={updateStage} onSelect={setSelectedOpportunity} onCreate={()=>setOpportunityDialog(true)}/>; else if(active==="proposals")content=<ProposalsView data={data} onSelect={setSelectedProposal} onCreate={()=>setProposalWizard(true)}/>; else if(active==="policies")content=<PoliciesView data={data} onSelect={setSelectedPolicy}/>; else if(["invoices","payments","commissions"].includes(active))content=<FinanceView kind={active as "invoices"|"payments"|"commissions"} data={data} onPayment={()=>setPaymentDialog(true)} onCreateInvoice={createInvoice}/>; else if(active==="renewals")content=<RenewalsView data={data} onPrepare={prepareRenewal}/>; else if(active==="claims"&&referenceSinistreOuvert)content=<ClaimDetailView reference={referenceSinistreOuvert} version={versionSinistres} utilisateur={utilisateurConnecte} onBack={revenirListeSinistres}/>; else if(active==="claims")content=<ClaimsView version={versionSinistres} utilisateur={utilisateurConnecte} onOpen={ouvrirSinistre}/>; else if(active==="reports")content=<ReportsView data={data}/>; else content=<GenericView module={active} data={data}/>;
  if(active==="users"&&utilisateurConnecte.role==="super_admin")content=<UsersView utilisateurCourantId={utilisateurConnecte.id}/>;

  const deconnecter=async()=>{try{await apiBackoffice.deconnecter();}catch{}finally{oublierSession();window.history.pushState({},"","/");setReferenceDemandeOuverte(null);setReferenceSinistreOuvert(null);setUtilisateurConnecte(null);setActive("dashboard");}};

  return <SidebarProvider><Sidebar collapsible="icon" className="border-r-0 bg-[#10294b] text-white"><SidebarHeader className="border-b border-white/10 px-4 py-5"><div className="flex items-center gap-3 overflow-hidden"><div className="brand-mark brand-mark--sidebar">GC</div><div className="min-w-0 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-semibold">Gestion du courtage</p><p className="truncate text-xs text-blue-200">Espace interne</p></div></div></SidebarHeader><SidebarContent className="px-2 py-3">{groupesNavigation.map((group)=><SidebarGroup key={group.label||"main"} className="py-1"><SidebarGroupLabel className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-blue-300">{group.label}</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{group.items.map((item)=><NavItem key={item.id} item={item} current={active} onSelect={selectionnerModule} notification={item.id==="requests"?nouvellesDemandes:item.id==="claims"?nouveauxSinistres:0}/>)}</SidebarMenu></SidebarGroupContent></SidebarGroup>)}</SidebarContent><SidebarFooter className="border-t border-white/10 p-3"><div className="flex items-center gap-3 rounded-xl bg-white/8 p-2"><div className="avatar">{utilisateurConnecte.nom_complet.split(" ").map((partie)=>partie[0]).join("").slice(0,2)}</div><div className="min-w-0 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-medium">{utilisateurConnecte.nom_complet}</p><p className="truncate text-xs text-blue-200">{libellesRoles[utilisateurConnecte.role]}</p></div></div></SidebarFooter></Sidebar><SidebarInset className="min-w-0 bg-[#f4f7fb]"><header className="app-topbar"><div className="flex min-w-0 items-center gap-3"><SidebarTrigger aria-label="Ouvrir le menu"/><div className="mobile-title">{moduleLabels[active]}</div><div className="topbar-search"><Search/><input aria-label="Recherche globale" placeholder="Rechercher un client, une police…"/></div></div><div className="flex items-center gap-2"><Button className="notification-button" size="icon" variant="ghost" aria-label="Notifications" onClick={()=>selectionnerModule(nouveauxSinistres>0?"claims":"requests")}><Bell/>{nouvellesDemandes+nouveauxSinistres>0&&<span>{nouvellesDemandes+nouveauxSinistres>99?"99+":nouvellesDemandes+nouveauxSinistres}</span>}</Button><Button onClick={()=>{selectionnerModule("opportunities");setOpportunityDialog(true)}}><Plus/>Nouvelle affaire</Button><AlertDialog><AlertDialogTrigger asChild><Button size="icon" variant="ghost" aria-label="Réinitialiser les données"><RefreshCcw/></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Réinitialiser la démonstration ?</AlertDialogTitle><AlertDialogDescription>Toutes les modifications locales seront remplacées par les données fictives initiales.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={resetData}>Réinitialiser</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><Button size="icon" variant="ghost" aria-label="Se déconnecter" onClick={()=>void deconnecter()}><LogOut/></Button></div></header><main className="dashboard-wrap app-content">{content}</main></SidebarInset>
    <ClientSheet client={selectedClient} data={data} onClose={()=>setSelectedClient(null)}/><PolicySheet policy={selectedPolicy} data={data} onClose={()=>setSelectedPolicy(null)}/><ProposalDialog proposal={selectedProposal} data={data} onClose={()=>setSelectedProposal(null)} onRecommend={recommendOffer} onAddOffer={addOffer} onConvert={convertProposal}/><OpportunityDialog opportunity={selectedOpportunity} data={data} onClose={()=>setSelectedOpportunity(null)} onStage={(stage)=>selectedOpportunity&&updateStage(selectedOpportunity.id,stage)}/><ClaimDialog claim={selectedClaim} data={data} onClose={()=>setSelectedClaim(null)} onStatus={(status)=>selectedClaim&&updateClaim(selectedClaim.id,status)}/><CreateClientDialog open={clientDialog} onClose={()=>setClientDialog(false)} onCreate={createClient}/><CreateOpportunityDialog open={opportunityDialog} data={data} onClose={()=>setOpportunityDialog(false)} onCreate={createOpportunity}/><ProposalWizard open={proposalWizard} data={data} onClose={()=>setProposalWizard(false)} onCreate={createProposal}/><PaymentDialog open={paymentDialog} data={data} onClose={()=>setPaymentDialog(false)} onCreate={createPayment}/><Toaster richColors position="bottom-right"/>
  </SidebarProvider>;
}
