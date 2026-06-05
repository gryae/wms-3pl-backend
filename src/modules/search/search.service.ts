import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SearchResult {
  id: string;
  type: 'PRODUCT' | 'INBOUND' | 'OUTBOUND' | 'RETURN' | 'MANIFEST' | 'SELLER';
  title: string;
  subtitle: string;
  link: string;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, sellerId?: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const term = query.trim();
    const results: SearchResult[] = [];

    // Parallel searches
    const [products, inbounds, outbounds, returns, manifests, sellers] = await Promise.all([
      // 1. PRODUCT Search
      this.prisma.product.findMany({
        where: {
          deletedAt: null,
          sellerId: sellerId || undefined,
          OR: [
            { sku: { contains: term, mode: 'insensitive' } },
            { barcode: { contains: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
          ],
        },
        include: { seller: { select: { name: true } } },
        take: 5,
      }),
      // 2. INBOUND Search
      this.prisma.inbound.findMany({
        where: {
          deletedAt: null,
          sellerId: sellerId || undefined,
          OR: [
            { inboundNo: { contains: term, mode: 'insensitive' } },
            { referenceNo: { contains: term, mode: 'insensitive' } },
          ],
        },
        include: { seller: { select: { name: true } } },
        take: 5,
      }),
      // 3. OUTBOUND Search
      this.prisma.outbound.findMany({
        where: {
          deletedAt: null,
          sellerId: sellerId || undefined,
          OR: [
            { outboundNo: { contains: term, mode: 'insensitive' } },
            { trackingNumber: { contains: term, mode: 'insensitive' } },
            { recipientName: { contains: term, mode: 'insensitive' } },
          ],
        },
        include: { seller: { select: { name: true } } },
        take: 5,
      }),
      // 4. RETURN Search
      this.prisma.return.findMany({
        where: {
          sellerId: sellerId || undefined,
          OR: [
            { returnNo: { contains: term, mode: 'insensitive' } },
            { reason: { contains: term, mode: 'insensitive' } },
          ],
        },
        include: { seller: { select: { name: true } } },
        take: 5,
      }),
      // 5. MANIFEST Search (Bypassed entirely for seller users)
      !sellerId
        ? this.prisma.manifest.findMany({
            where: {
              OR: [
                { manifestNo: { contains: term, mode: 'insensitive' } },
                { courier: { name: { contains: term, mode: 'insensitive' } } },
              ],
            },
            include: { courier: { select: { name: true } } },
            take: 5,
          })
        : Promise.resolve([]),
      // 6. SELLER Search (Bypassed entirely for seller users)
      !sellerId
        ? this.prisma.seller.findMany({
            where: {
              deletedAt: null,
              OR: [
                { code: { contains: term, mode: 'insensitive' } },
                { name: { contains: term, mode: 'insensitive' } },
              ],
            },
            take: 5,
          })
        : Promise.resolve([]),
    ]);

    // Format products
    products.forEach((p) => {
      results.push({
        id: p.id,
        type: 'PRODUCT',
        title: p.name,
        subtitle: `SKU: ${p.sku} | Barcode: ${p.barcode || '-'} | Seller: ${p.seller.name}`,
        link: `/products?id=${p.id}`,
      });
    });

    // Format inbounds
    inbounds.forEach((i) => {
      results.push({
        id: i.id,
        type: 'INBOUND',
        title: i.inboundNo,
        subtitle: `Inbound shipment (${i.status}) | Ref: ${i.referenceNo || '-'} | Seller: ${i.seller.name}`,
        link: `/inbound/${i.id}`,
      });
    });

    // Format outbounds
    outbounds.forEach((o) => {
      results.push({
        id: o.id,
        type: 'OUTBOUND',
        title: o.outboundNo,
        subtitle: `Outbound order (${o.status}) | Recipient: ${o.recipientName} | Tracking: ${o.trackingNumber || '-'}`,
        link: `/outbound/${o.id}`,
      });
    });

    // Format returns
    returns.forEach((r) => {
      results.push({
        id: r.id,
        type: 'RETURN',
        title: r.returnNo,
        subtitle: `Customer Return (${r.status}) | Reason: ${r.reason} | Seller: ${r.seller.name}`,
        link: `/returns/${r.id}`,
      });
    });

    // Format manifests
    manifests.forEach((m) => {
      results.push({
        id: m.id,
        type: 'MANIFEST',
        title: m.manifestNo,
        subtitle: `Dispatch Manifest (${m.status}) | Courier: ${m.courier.name}`,
        link: `/manifests?id=${m.id}`,
      });
    });

    // Format sellers
    sellers.forEach((s) => {
      results.push({
        id: s.id,
        type: 'SELLER',
        title: s.name,
        subtitle: `Registered Seller Partner | Code: ${s.code}`,
        link: `/sellers?id=${s.id}`,
      });
    });

    return results;
  }
}
