import test from "node:test";
import assert from "node:assert/strict";
import { memberPosterWhere, validatePosterFile } from "../src/services/posterService.js";

const file = (mimetype, buffer, size = buffer.length) => ({ mimetype, buffer, size });

test("poster uploads reject wrong MIME type, empty files, oversize files, and invalid signatures", () => {
  assert.throws(() => validatePosterFile(file("text/plain", Buffer.from("text"))), /Only PNG/);
  assert.throws(() => validatePosterFile(file("image/png", Buffer.alloc(0))), /non-empty/);
  assert.throws(() => validatePosterFile(file("image/png", Buffer.from("not a png"))), /does not match/);
  assert.throws(() => validatePosterFile(file("application/pdf", Buffer.from("%PDF-1.7"), 5 * 1024 * 1024 + 1)), /5 MB/);
});

test("NEW_MEMBERS posters are excluded for established members", () => {
  assert.deepEqual(memberPosterWhere(false), { isPublished: true, OR: [{ audience: "ALL_MEMBERS" }] });
  assert.deepEqual(memberPosterWhere(true), { isPublished: true, OR: [{ audience: "ALL_MEMBERS" }, { audience: "NEW_MEMBERS" }] });
});
