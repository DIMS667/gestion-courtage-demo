import { useEffect, useState } from "react";
import { Inbox, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiBackoffice, type ResumeDemandeClient } from "./services/api-backoffice";

export function UnassignedRequests({ version, onOpen }: { version: number; onOpen: (reference: string) => void }) {
  const [result, setResult] = useState<{ version: number; retry: number; requests: ResumeDemandeClient[]; error: string } | null>(null);
  const [retry, setRetry] = useState(0);
  const loading = result?.version !== version || result.retry !== retry;
  const requests = result?.requests ?? [];
  const error = result?.error ?? "";

  useEffect(() => {
    let active = true;
    apiBackoffice.listerDemandes().then(list => {
      if (active) setResult({ version, retry, error: "", requests: list.filter(request => request.responsable === null)
        .sort((a, b) => Date.parse(a.cree_le) - Date.parse(b.cree_le)) });
    }).catch(cause => {
      if (active) setResult({ version, retry, requests: [], error: cause instanceof Error ? cause.message : "Impossible de charger les demandes." });
    });
    return () => { active = false; };
  }, [version, retry]);

  return <section aria-labelledby="unassigned-requests-title">
    <div className="section-title-row"><div><p className="eyebrow">File commune</p><h2 id="unassigned-requests-title">Demandes non prises en charge</h2></div></div>
    <Card className="table-card"><CardContent className="p-0">
      {loading ? <div className="loading-state" role="status"><LoaderCircle className="animate-spin" />Chargement des demandes…</div>
        : error ? <div className="request-empty-state" role="alert"><strong>{error}</strong><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Réessayer</Button></div>
        : <><Table><TableHeader><TableRow><TableHead>Référence</TableHead><TableHead>Client</TableHead><TableHead>Produit</TableHead><TableHead>Reçue le</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{requests.map(request => <TableRow key={request.id}>
            <TableCell className="ref-cell">{request.reference}</TableCell>
            <TableCell><strong>{request.client.nom_complet}</strong><small>{request.client.adresse_email}</small></TableCell>
            <TableCell>{request.libelle_produit}</TableCell>
            <TableCell>{new Date(request.cree_le).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</TableCell>
            <TableCell><Button variant="outline" size="sm" onClick={() => onOpen(request.reference)} aria-label={`Ouvrir la demande ${request.reference}`}>Ouvrir le dossier</Button></TableCell>
          </TableRow>)}</TableBody></Table>
          {requests.length === 0 && <div className="request-empty-state"><Inbox /><strong>Aucune demande en attente de prise en charge</strong></div>}
        </>}
    </CardContent></Card>
  </section>;
}
