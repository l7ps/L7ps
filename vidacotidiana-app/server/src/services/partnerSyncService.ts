import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { VidaApiClient, VidaPartnerRaw } from "./vidaApiClient";

export function computeObjectHash(obj: unknown): string {
  const json = JSON.stringify(obj, Object.keys(obj as any).sort());
  return crypto.createHash("sha256").update(json).digest("hex");
}

function safeGet<T = any>(o: any, keys: string[], fallback?: T): T | undefined {
  let cur = o;
  for (const k of keys) {
    if (cur && typeof cur === "object" && k in cur) cur = cur[k];
    else return fallback;
  }
  return cur as T;
}

export function mapToPartner(raw: VidaPartnerRaw) {
  // Ajuste os caminhos conforme o schema real da API
  const remoteId = String(
    raw.id ?? raw.uuid ?? raw.partnerId ?? raw.codigo ?? raw.codigoPrestador ?? raw.cnpj ?? crypto.randomUUID()
  );
  const name = (raw.name ?? raw.nome ?? raw.razaoSocial ?? raw.nomeFantasia ?? "") as string | undefined;
  const fantasyName = (raw.nomeFantasia ?? raw.fantasyName) as string | undefined;
  const document = (raw.cnpj ?? raw.cpf ?? raw.document ?? raw.documento) as string | undefined;
  const email = (raw.email ?? safeGet(raw, ["contato", "email"])) as string | undefined;
  const phone = (raw.phone ?? raw.telefone ?? safeGet(raw, ["contato", "telefone"])) as string | undefined;
  const addressLine = (
    safeGet<string>(raw, ["endereco", "logradouro"]) ||
    safeGet<string>(raw, ["address", "street"]) ||
    (raw.endereco as string | undefined)
  );
  const city = (safeGet<string>(raw, ["endereco", "cidade"]) || raw.cidade || raw.city) as string | undefined;
  const state = (safeGet<string>(raw, ["endereco", "uf"]) || raw.uf || raw.estado || raw.state) as string | undefined;
  const zip = (safeGet<string>(raw, ["endereco", "cep"]) || raw.cep || raw.zip) as string | undefined;
  const specialty = (raw.especialidade ?? raw.specialty ?? safeGet<string>(raw, ["especialidade", "nome"])) as
    | string
    | undefined;

  const sourceUpdatedAtRaw = (raw.updatedAt ?? raw.dataAtualizacao ?? raw.lastUpdate) as string | undefined;
  const sourceUpdatedAt = sourceUpdatedAtRaw ? new Date(sourceUpdatedAtRaw) : undefined;

  const sourceHash = computeObjectHash(raw);

  return {
    remoteId,
    name,
    fantasyName,
    document,
    email,
    phone,
    addressLine,
    city,
    state,
    zip,
    specialty,
    sourceUpdatedAt,
    sourceHash,
    raw: JSON.stringify(raw),
  };
}

export async function syncPartners(): Promise<{ created: number; updated: number; totalFetched: number }> {
  const api = new VidaApiClient();
  const items = await api.fetchAllPartners();

  let created = 0;
  let updated = 0;

  for (const raw of items) {
    const p = mapToPartner(raw);

    const existing = await prisma.partner.findUnique({ where: { remoteId: p.remoteId } });
    if (!existing) {
      await prisma.partner.create({ data: p });
      created += 1;
    } else {
      if (existing.sourceHash !== p.sourceHash) {
        await prisma.partner.update({ where: { remoteId: p.remoteId }, data: p });
        updated += 1;
      }
    }
  }

  return { created, updated, totalFetched: items.length };
}