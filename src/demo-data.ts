export type Client = {
  id: string;
  name: string;
  type: "Particulier" | "Entreprise";
  phone: string;
  email: string;
  advisor: string;
  status: "Actif" | "Prospect" | "Inactif";
  createdAt: string;
  annualPremium: number;
  balance: number;
  policyIds: string[];
};

export type Opportunity = {
  id: string;
  clientId: string;
  product: string;
  need: string;
  estimatedPremium: number;
  advisor: string;
  probability: number;
  stage: "Découverte" | "Étude" | "Proposition" | "Négociation" | "Gagné" | "Perdu";
  nextAction: string;
  commission: number;
  createdAt: string;
};

export type Offer = {
  id: string;
  companyId: string;
  netPremium: number;
  taxes: number;
  fees: number;
  total: number;
  deductible: number;
  guarantees: string[];
  commissionRate: number;
  recommended?: boolean;
};

export type Proposal = {
  id: string;
  opportunityId: string;
  clientId: string;
  product: string;
  date: string;
  advisor: string;
  status: "Brouillon" | "En préparation" | "Prête" | "Envoyée" | "Acceptée" | "Refusée";
  recommendation: string;
  offers: Offer[];
};

export type Policy = {
  id: string;
  proposalId?: string;
  clientId: string;
  insured: string;
  product: string;
  companyId: string;
  premium: number;
  startDate: string;
  endDate: string;
  advisor: string;
  status: "Active" | "Proche échéance" | "Expirée" | "Résiliée";
  risk: string;
  riskDetails: string;
  guarantees: string[];
};

export type Invoice = {
  id: string;
  clientId: string;
  policyId: string;
  amount: number;
  paid: number;
  date: string;
  dueDate: string;
  status: "Payée" | "Partiellement payée" | "Impayée" | "En attente";
};

export type Payment = {
  id: string;
  clientId: string;
  invoiceId: string;
  amount: number;
  method: "Espèces" | "Virement" | "Mobile Money" | "Orange Money" | "Carte bancaire";
  date: string;
  status: "Validé" | "En attente";
};

export type Commission = {
  id: string;
  clientId: string;
  policyId: string;
  companyId: string;
  premium: number;
  rate: number;
  expected: number;
  received: number;
  status: "Reçue" | "Partielle" | "Attendue";
};

export type Claim = {
  id: string;
  clientId: string;
  policyId: string;
  type: string;
  date: string;
  companyId: string;
  advisor: string;
  status: "Déclaré" | "Documents en attente" | "Transmis" | "Expertise" | "En traitement" | "Indemnisé" | "Clôturé";
  timeline: { date: string; label: string }[];
};

export type DemoData = {
  clients: Client[];
  opportunities: Opportunity[];
  proposals: Proposal[];
  policies: Policy[];
  invoices: Invoice[];
  payments: Payment[];
  commissions: Commission[];
  claims: Claim[];
  transmissions: Array<{ id: string; companyId: string; operationDate: string; sentDate: string; files: number; amount: number; status: string; policyIds: string[] }>;
  documents: Array<{ id: string; name: string; type: string; clientId: string; policyId?: string; date: string; addedBy: string }>;
  activities: Array<{ id: string; clientId: string; type: string; label: string; date: string; author: string }>;
};

export const companies = [
  { id: "COMP-A", name: "Compagnie A", contact: "Aline Mbarga", phone: "+237 699 100 101", email: "partenaires.a@demo.local", products: ["Automobile", "Habitation", "Voyage"], mode: "API", rate: 14 },
  { id: "COMP-B", name: "Compagnie B", contact: "Patrick Ewane", phone: "+237 699 200 202", email: "courtage.b@demo.local", products: ["Automobile", "Santé", "RC Pro"], mode: "Manuel", rate: 16 },
  { id: "COMP-C", name: "Compagnie C", contact: "Sarah Ndom", phone: "+237 699 300 303", email: "production.c@demo.local", products: ["Multirisque", "Transport", "Incendie"], mode: "API", rate: 12 },
  { id: "COMP-D", name: "Compagnie D", contact: "Nicolas Talla", phone: "+237 699 400 404", email: "reseau.d@demo.local", products: ["Santé", "Prévoyance", "Voyage"], mode: "Manuel", rate: 15 },
];

export const products = [
  { id: "PRD-AUTO", name: "Automobile", category: "Dommages", policies: 92, premium: 84500000 },
  { id: "PRD-SANTE", name: "Santé collective", category: "Personnes", policies: 48, premium: 61400000 },
  { id: "PRD-MRH", name: "Multirisque habitation", category: "Dommages", policies: 46, premium: 28900000 },
  { id: "PRD-RCP", name: "Responsabilité civile pro", category: "Entreprise", policies: 33, premium: 47200000 },
  { id: "PRD-TRANS", name: "Transport marchandises", category: "Entreprise", policies: 28, premium: 53300000 },
  { id: "PRD-VOY", name: "Voyage", category: "Personnes", policies: 20, premium: 8900000 },
];

export const users = [
  { name: "Sophie N.", email: "sophie@demo.local", role: "Responsable courtage", status: "Actif" },
  { name: "Marc T.", email: "marc@demo.local", role: "Conseiller", status: "Actif" },
  { name: "Claudine E.", email: "claudine@demo.local", role: "Production", status: "Actif" },
  { name: "Paul M.", email: "paul@demo.local", role: "Comptabilité", status: "Actif" },
  { name: "Nadia F.", email: "nadia@demo.local", role: "Sinistres", status: "Actif" },
  { name: "Admin Démo", email: "admin@demo.local", role: "Administrateur", status: "Actif" },
];

const names = [
  "Jean Dupont", "Marie Ngono", "Alain Tchoumi", "Société Alpha SARL", "Transport Horizon SARL", "Cabinet Médical Espoir",
  "Clarisse Mvondo", "Boris Etoundi", "Nadia Fopa", "Gérard Mballa", "Entreprise Nova SARL", "Groupe Savanes SA",
  "Centre Optique Lumière", "Hôtel Rivage SARL", "Coopérative Verte", "Éric Noubissi", "Stéphanie Biloa", "Martin Kenfack",
];
const advisors = ["Sophie N.", "Marc T.", "Claudine E.", "Arnaud K."];
const productNames = products.map((product) => product.name);
const companyIds = companies.map((company) => company.id);
const stages: Opportunity["stage"][] = ["Découverte", "Étude", "Proposition", "Négociation", "Gagné", "Perdu"];
const claimStatuses: Claim["status"][] = ["Déclaré", "Documents en attente", "Transmis", "Expertise", "En traitement", "Indemnisé", "Clôturé"];

const pad = (value: number, size = 3) => String(value).padStart(size, "0");
const date = (offsetDays: number) => {
  const d = new Date(Date.UTC(2026, 9, 1));
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

function clientName(index: number) {
  if (index < names.length) return names[index];
  const first = ["Loïc", "Carine", "Yves", "Sandrine", "Franck", "Aïcha", "Brice", "Estelle"][index % 8];
  const last = ["Mbarga", "Nana", "Fotso", "Etoa", "Njoya", "Bekolo", "Manga", "Talla"][Math.floor(index / 8) % 8];
  return index % 9 === 0 ? `${last} Services SARL` : `${first} ${last}`;
}

export function createDemoData(): DemoData {
  const clients: Client[] = Array.from({ length: 184 }, (_, index) => {
    const name = clientName(index);
    const enterprise = /SARL|SA|Groupe|Cabinet|Centre|Coopérative|Hôtel|Transport|Société|Entreprise/.test(name);
    return {
      id: `CL-${pad(index + 1)}`,
      name,
      type: enterprise ? "Entreprise" : "Particulier",
      phone: `+237 6${pad(70 + (index % 29), 2)} ${pad(110 + index, 3)} ${pad(200 + index, 3)}`,
      email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "")}@demo.local`,
      advisor: advisors[index % advisors.length],
      status: index % 17 === 0 ? "Prospect" : index % 41 === 0 ? "Inactif" : "Actif",
      createdAt: date(-680 + index * 3),
      annualPremium: 0,
      balance: 0,
      policyIds: [],
    };
  });

  const opportunities: Opportunity[] = Array.from({ length: 42 }, (_, index) => {
    const client = clients[index % clients.length];
    const stage = index === 0 ? "Gagné" : stages[index % stages.length];
    const premium = 180000 + (index % 9) * 145000;
    return {
      id: `OPP-${pad(index + 1)}`,
      clientId: client.id,
      product: productNames[index % productNames.length],
      need: index % 2 === 0 ? "Sécuriser les risques principaux avec une couverture étendue." : "Optimiser le coût tout en maintenant les garanties essentielles.",
      estimatedPremium: premium,
      advisor: client.advisor,
      probability: stage === "Gagné" ? 100 : stage === "Perdu" ? 0 : 20 + (index % 4) * 20,
      stage,
      nextAction: date(2 + (index % 16)),
      commission: Math.round(premium * (0.12 + (index % 4) * 0.01)),
      createdAt: date(-70 + index),
    };
  });

  const proposals: Proposal[] = opportunities.slice(0, 28).map((opportunity, index) => {
    const base = opportunity.estimatedPremium;
    const statuses: Proposal["status"][] = ["Brouillon", "En préparation", "Prête", "Envoyée", "Acceptée", "Refusée"];
    const status = index === 0 ? "Acceptée" : statuses[index % statuses.length];
    return {
      id: `PROP-${pad(index + 1)}`,
      opportunityId: opportunity.id,
      clientId: opportunity.clientId,
      product: opportunity.product,
      date: date(-36 + index),
      advisor: opportunity.advisor,
      status,
      recommendation: "Cette offre présente le meilleur équilibre entre niveau de couverture, qualité de service et coût pour le client.",
      offers: companyIds.slice(0, 3).map((companyId, offerIndex) => {
        const net = Math.round((base * (0.82 + offerIndex * 0.07)) / 500) * 500;
        const taxes = Math.round(net * 0.085);
        const fees = 5000 + offerIndex * 2500;
        return {
          id: `OFF-${pad(index + 1)}-${offerIndex + 1}`,
          companyId,
          netPremium: net,
          taxes,
          fees,
          total: net + taxes + fees,
          deductible: 50000 + offerIndex * 25000,
          guarantees: offerIndex === 0 ? ["Responsabilité civile", "Vol", "Incendie", "Assistance"] : ["Responsabilité civile", "Dommages", "Vol", "Bris de glace", "Assistance"],
          commissionRate: 12 + offerIndex * 2,
          recommended: offerIndex === 1,
        };
      }),
    };
  });

  const policies: Policy[] = Array.from({ length: 267 }, (_, index) => {
    const client = clients[index % clients.length];
    const product = productNames[index % productNames.length];
    const near = index < 24;
    const expired = index >= 24 && index < 35;
    const cancelled = index >= 35 && index < 41;
    const expiryOffset = near ? 5 + (index % 27) : expired ? -(index - 18) : 70 + (index % 250);
    const status: Policy["status"] = near ? "Proche échéance" : expired ? "Expirée" : cancelled ? "Résiliée" : "Active";
    const premium = 95000 + (index % 17) * 42500;
    return {
      id: `POL-${pad(index + 1)}`,
      proposalId: index < proposals.length ? proposals[index].id : undefined,
      clientId: client.id,
      insured: client.name,
      product,
      companyId: companyIds[index % companyIds.length],
      premium,
      startDate: date(expiryOffset - 365),
      endDate: date(expiryOffset),
      advisor: client.advisor,
      status,
      risk: product === "Automobile" ? `Toyota Corolla ${2020 + (index % 6)}` : product === "Santé collective" ? `${8 + (index % 45)} bénéficiaires` : `Risque ${product.toLowerCase()}`,
      riskDetails: product === "Automobile" ? `Immatriculation LT-${pad(180 + index, 3)}-CM · Usage privé · Valeur ${12 + (index % 15)} M FCFA` : "Évaluation réalisée et pièces justificatives validées.",
      guarantees: ["Responsabilité civile", "Dommages", "Vol", "Incendie", "Assistance"].slice(0, 3 + (index % 3)),
    };
  });

  const invoices: Invoice[] = policies.map((policy, index) => {
    const status: Invoice["status"] = index % 8 === 0 ? "Impayée" : index % 6 === 0 ? "Partiellement payée" : index % 11 === 0 ? "En attente" : "Payée";
    const paid = status === "Payée" ? policy.premium : status === "Partiellement payée" ? Math.round(policy.premium * 0.55) : 0;
    return { id: `FAC-${pad(index + 1)}`, clientId: policy.clientId, policyId: policy.id, amount: policy.premium, paid, date: policy.startDate, dueDate: date(-20 + (index % 70)), status };
  });

  const payments: Payment[] = invoices.filter((invoice) => invoice.paid > 0).map((invoice, index) => ({
    id: `PAY-${pad(index + 1)}`,
    clientId: invoice.clientId,
    invoiceId: invoice.id,
    amount: invoice.paid,
    method: (["Espèces", "Virement", "Mobile Money", "Orange Money", "Carte bancaire"] as Payment["method"][])[index % 5],
    date: date(-18 + (index % 45)),
    status: index % 19 === 0 ? "En attente" : "Validé",
  }));

  const commissions: Commission[] = policies.map((policy, index) => {
    const rate = companies.find((company) => company.id === policy.companyId)?.rate ?? 12;
    const expected = Math.round(policy.premium * rate / 100);
    const received = index % 7 === 0 ? 0 : index % 5 === 0 ? Math.round(expected * 0.6) : expected;
    return { id: `COM-${pad(index + 1)}`, clientId: policy.clientId, policyId: policy.id, companyId: policy.companyId, premium: policy.premium, rate, expected, received, status: received === 0 ? "Attendue" : received < expected ? "Partielle" : "Reçue" };
  });

  policies.forEach((policy) => clients.find((client) => client.id === policy.clientId)?.policyIds.push(policy.id));
  clients.forEach((client) => {
    client.annualPremium = policies.filter((policy) => policy.clientId === client.id && policy.status !== "Résiliée").reduce((sum, policy) => sum + policy.premium, 0);
    client.balance = invoices.filter((invoice) => invoice.clientId === client.id).reduce((sum, invoice) => sum + invoice.amount - invoice.paid, 0);
  });

  const claims: Claim[] = Array.from({ length: 18 }, (_, index) => {
    const policy = policies[(index * 7) % policies.length];
    return {
      id: `SIN-${pad(index + 1)}`,
      clientId: policy.clientId,
      policyId: policy.id,
      type: ["Accident matériel", "Bris de glace", "Dégât des eaux", "Vol", "Hospitalisation"][index % 5],
      date: date(-52 + index * 2),
      companyId: policy.companyId,
      advisor: policy.advisor,
      status: claimStatuses[index % claimStatuses.length],
      timeline: [
        { date: date(-52 + index * 2), label: "Déclaration enregistrée" },
        { date: date(-50 + index * 2), label: "Pièces justificatives vérifiées" },
        { date: date(-47 + index * 2), label: "Dossier transmis à la compagnie" },
      ],
    };
  });

  const transmissions = Array.from({ length: 16 }, (_, index) => ({
    id: `TRS-${pad(index + 1)}`,
    companyId: companyIds[index % companyIds.length],
    operationDate: date(-40 + index * 2),
    sentDate: date(-39 + index * 2),
    files: 2 + (index % 7),
    amount: policies.slice(index * 3, index * 3 + 4).reduce((sum, policy) => sum + policy.premium, 0),
    status: ["Préparation", "Transmis", "Accusé réception", "Traité", "Rejeté"][index % 5],
    policyIds: policies.slice(index * 3, index * 3 + 4).map((policy) => policy.id),
  }));

  const documents = policies.slice(0, 72).map((policy, index) => ({
    id: `DOC-${pad(index + 1)}`,
    name: `${["Police", "Attestation", "Quittance", "Carte grise", "Proposition"][index % 5]}_${policy.id}.pdf`,
    type: ["Police", "Attestation", "Quittance", "Carte grise", "Proposition"][index % 5],
    clientId: policy.clientId,
    policyId: policy.id,
    date: date(-90 + index),
    addedBy: advisors[index % advisors.length],
  }));

  const activities = clients.slice(0, 50).flatMap((client, index) => [
    { id: `ACT-${pad(index * 2 + 1)}`, clientId: client.id, type: "Appel", label: "Échange sur le besoin et les garanties prioritaires", date: date(-index), author: client.advisor },
    { id: `ACT-${pad(index * 2 + 2)}`, clientId: client.id, type: index % 3 === 0 ? "Paiement" : "Document", label: index % 3 === 0 ? "Paiement enregistré" : "Document reçu et validé", date: date(-index - 2), author: client.advisor },
  ]);

  return { clients, opportunities, proposals, policies, invoices, payments, commissions, claims, transmissions, documents, activities };
}
