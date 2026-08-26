import JSZip from "jszip";
import { parseDocxArrayBuffer } from "../../docxParser.js";

async function runTests() {
  console.log("=== RUNNING DOCX PARSER UNIT TESTS ===");

  let passed = 0;
  let failed = 0;

  try {
    // 1. Create a dummy valid .docx ZIP archive in memory
    const zip = new JSZip();

    const sampleDocumentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:b/></w:rPr>
        <w:t>Sample Word Document Title</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>This is a paragraph inside the document.</w:t>
      </w:r>
    </w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Header A</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Header B</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Value 1</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Value 2</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>`;

    zip.file("word/document.xml", sampleDocumentXml);
    const mockArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });

    const result = await parseDocxArrayBuffer(mockArrayBuffer);

    if (result.success && result.elements.length >= 3) {
      console.log(`[PASS] DOCX Extraction (${result.elements.length} elements parsed successfully)`);
      passed++;
    } else {
      console.error("[FAIL] DOCX Extraction failed", result);
      failed++;
    }

    if (result.elements[0].type === "paragraph" && result.elements[0].style === "h1") {
      console.log("[PASS] Heading & Text Styling Extracted");
      passed++;
    } else {
      console.error("[FAIL] Heading extraction mismatch", result.elements[0]);
      failed++;
    }

    if (result.elements[2].type === "table" && result.elements[2].rows.length === 2) {
      console.log("[PASS] Table Grid Extracted");
      passed++;
    } else {
      console.error("[FAIL] Table grid extraction failed", result.elements[2]);
      failed++;
    }
  } catch (err) {
    console.error("[FAIL] Unexpected error during docxParser testing:", err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runTests();
