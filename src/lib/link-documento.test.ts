import { describe, expect, it } from "vitest";
import { lerLinkDocumento } from "./link-documento";

describe("lerLinkDocumento (ADR-0023)", () => {
  it("vazio é sem link", () => {
    expect(lerLinkDocumento("")).toBeNull();
    expect(lerLinkDocumento("  ")).toBeNull();
    expect(lerLinkDocumento(null)).toBeNull();
  });
  it("aceita https", () => {
    expect(lerLinkDocumento(" https://drive.google.com/file/d/abc ")).toBe("https://drive.google.com/file/d/abc");
  });
  it("recusa http, javascript e link longo demais", () => {
    expect(lerLinkDocumento("http://drive.google.com/x")).toBe("invalido");
    expect(lerLinkDocumento("javascript:alert(1)")).toBe("invalido");
    expect(lerLinkDocumento(`https://x.com/${"a".repeat(500)}`)).toBe("invalido");
  });
});
