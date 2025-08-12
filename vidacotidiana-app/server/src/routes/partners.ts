import { Router } from "express";
import { prisma } from "../lib/prisma";
import { syncPartners } from "../services/partnerSyncService";

export const partnersRouter = Router();

partnersRouter.post("/sync", async (req, res) => {
  try {
    const result = await syncPartners();
    res.json({ ok: true, ...result });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? "sync error" });
  }
});

partnersRouter.get("/stats", async (req, res) => {
  const total = await prisma.partner.count();
  const byState = await prisma.partner.groupBy({ by: ["state"], _count: { _all: true } });
  const bySpecialty = await prisma.partner.groupBy({ by: ["specialty"], _count: { _all: true } });
  res.json({ total, byState, bySpecialty });
});

partnersRouter.get("/", async (req, res) => {
  const {
    q,
    city,
    state,
    specialty,
    page = "1",
    pageSize = "20",
    sort = "name:asc",
  } = req.query as Record<string, string>;

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { fantasyName: { contains: q, mode: "insensitive" } },
      { document: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (state) where.state = { equals: state };
  if (specialty) where.specialty = { contains: specialty, mode: "insensitive" };

  const [sortField, sortDir] = sort.split(":");
  const orderBy: any = { [sortField || "name"]: (sortDir as any) === "desc" ? "desc" : "asc" };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const sizeNum = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 200);

  const [items, total] = await Promise.all([
    prisma.partner.findMany({ where, orderBy, skip: (pageNum - 1) * sizeNum, take: sizeNum }),
    prisma.partner.count({ where }),
  ]);

  res.json({ items, total, page: pageNum, pageSize: sizeNum });
});

partnersRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const item = await prisma.partner.findFirst({ where: { OR: [{ id: Number(id) }, { remoteId: id }] } });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});