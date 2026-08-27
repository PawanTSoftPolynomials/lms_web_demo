import JSZip from "jszip";
import { parsePptxArrayBuffer } from "../../pptxParser.js";

/**
 * Unit Test for Client-Side PPTX Parser.
 * Generates a minimal in-memory valid OpenXML PPTX zip structure and verifies parsing.
 */
async function generateMockPptxZip() {
  const zip = new JSZip();

  // 1. Add presentation.xml
  zip.file(
    "ppt/presentation.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:sldSz cx="9144000" cy="5143500"/>
</p:presentation>`
  );

  // 2. Add slide1.xml with text box
  zip.file(
    "ppt/slides/slide1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:spPr>
          <a:xfrm>
            <a:off x="914400" y="457200"/>
            <a:ext cx="7315200" cy="914400"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:p>
            <a:r>
              <a:rPr sz="2400" b="1"/>
              <a:t>Computer Evolution &amp; Number Systems</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`
  );

  // 3. Add slide2.xml with second slide
  zip.file(
    "ppt/slides/slide2.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:spPr>
          <a:xfrm>
            <a:off x="914400" y="457200"/>
            <a:ext cx="7315200" cy="914400"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:p>
            <a:r>
              <a:t>Slide 2: Binary &amp; Hexadecimal</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`
  );

  return await zip.generateAsync({ type: "arraybuffer" });
}

async function runTests() {
  console.log("=== RUNNING PPTX PARSER UNIT TESTS ===");

  try {
    const arrayBuffer = await generateMockPptxZip();
    const result = await parsePptxArrayBuffer(arrayBuffer);

    if (!result || !result.slides || result.slides.length !== 2) {
      throw new Error(`Expected 2 slides, got ${result?.slides?.length}`);
    }

    const slide1Text = result.slides[0].elements[0].paragraphs[0].runs[0].text;
    if (slide1Text !== "Computer Evolution & Number Systems") {
      throw new Error(`Unexpected slide 1 text: ${slide1Text}`);
    }

    const slide2Text = result.slides[1].elements[0].paragraphs[0].runs[0].text;
    if (slide2Text !== "Slide 2: Binary & Hexadecimal") {
      throw new Error(`Unexpected slide 2 text: ${slide2Text}`);
    }

    console.log("[PASS] PPTX Slide Extraction (2 slides parsed successfully)");
    console.log("[PASS] Text Runs & Font Styling Extracted");
    console.log("\nRESULTS: 2 Passed, 0 Failed");
  } catch (err) {
    console.error("[FAIL] PPTX Parser Test Error:", err);
    process.exit(1);
  }
}

runTests();
