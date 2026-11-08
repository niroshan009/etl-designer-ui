import assert from "node:assert/strict";
import test from "node:test";
import { normalizeGeneratedScript } from "../normalizeGeneratedScript.ts";

test("joins Flux events without adding event-separator blank lines", () => {
  assert.equal(
    normalizeGeneratedScript("data:```python\ndata:\n\ndata:\n\ndata:from pyspark.sql import SparkSession\n\n"),
    "```python\nfrom pyspark.sql import SparkSession",
  );
});

test("preserves line breaks in an event's multiline data", () => {
  assert.equal(normalizeGeneratedScript("data:first\ndata:second\n\n"), "first\nsecond");
});

test("leaves non-SSE responses unchanged", () => {
  assert.equal(normalizeGeneratedScript("print('hello')"), "print('hello')");
});
