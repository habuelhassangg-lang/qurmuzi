/**
 * Mock ZATCA (Saudi e-invoicing) QR payload: TLV-encoded fields, base64.
 * Tags: 1 seller name, 2 VAT number, 3 timestamp, 4 total with VAT, 5 VAT.
 * This is a demo: the VAT number is fake and nothing is reported to ZATCA.
 */
export type ZatcaFields = {
  sellerName: string;
  vatNumber: string;
  timestamp: Date;
  totalWithVat: string;
  vatAmount: string;
};

function tlv(tag: number, value: string): Uint8Array {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length > 255)
    throw new RangeError(`TLV value for tag ${tag} is too long`);
  return Uint8Array.from([tag, bytes.length, ...bytes]);
}

export function encodeZatcaTlv(fields: ZatcaFields): string {
  const parts = [
    tlv(1, fields.sellerName),
    tlv(2, fields.vatNumber),
    tlv(3, fields.timestamp.toISOString()),
    tlv(4, fields.totalWithVat),
    tlv(5, fields.vatAmount),
  ];
  const all = Uint8Array.from(parts.flatMap((part) => [...part]));
  return Buffer.from(all).toString("base64");
}

/** Decodes a TLV base64 payload back into tag → value (used by tests). */
export function decodeZatcaTlv(base64: string): Record<number, string> {
  const bytes = Buffer.from(base64, "base64");
  const result: Record<number, string> = {};
  let i = 0;
  while (i < bytes.length) {
    const tag = bytes[i];
    const length = bytes[i + 1];
    result[tag] = new TextDecoder().decode(
      bytes.subarray(i + 2, i + 2 + length),
    );
    i += 2 + length;
  }
  return result;
}
