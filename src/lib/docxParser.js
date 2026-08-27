import JSZip from "jszip";
import { DOMParser } from "@xmldom/xmldom";

/**
 * Client-Side OpenXML DOCX Parser
 * Extract paragraphs, headings, text formatting, lists, tables, and embedded images
 * from a .docx file ArrayBuffer in the browser.
 *
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise<{
 *   success: boolean,
 *   elements: Array<
 *     | { type: "paragraph", style: string, alignment: string, runs: Array<{ text: string, bold: boolean, italic: boolean, underline: boolean, color: string, fontSize: number }> }
 *     | { type: "table", rows: Array<Array<string>> }
 *     | { type: "image", id: string, src: string }
 *   >
 * }>}
 */
export async function parseDocxArrayBuffer(arrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error("Empty document file buffer.");
  }

  const zip = await JSZip.loadAsync(arrayBuffer);

  const docXmlFile = zip.file("word/document.xml");
  if (!docXmlFile) {
    throw new Error("Invalid .docx file structure: missing word/document.xml");
  }

  const docXmlText = await docXmlFile.async("string");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXmlText, "text/xml");

  // Load Relationships for embedded media images
  const mediaMap = new Map(); // rId -> base64DataUri
  const relsFile = zip.file("word/_rels/document.xml.rels");
  if (relsFile) {
    try {
      const relsXmlText = await relsFile.async("string");
      const relsDoc = parser.parseFromString(relsXmlText, "text/xml");
      const relationshipNodes = relsDoc.getElementsByTagName("Relationship");

      for (let i = 0; i < relationshipNodes.length; i++) {
        const node = relationshipNodes[i];
        const rId = node.getAttribute("Id");
        const target = node.getAttribute("Target");
        const type = node.getAttribute("Type") || "";

        if (rId && target && type.includes("image")) {
          // Clean target path (word/media/image1.png)
          let mediaPath = target.startsWith("word/") ? target : `word/${target.replace(/^\//, "")}`;
          const imageZipFile = zip.file(mediaPath);

          if (imageZipFile) {
            const base64Data = await imageZipFile.async("base64");
            const ext = mediaPath.split(".").pop().toLowerCase();
            const mime = ext === "png" ? "image/png" : ext === "svg" ? "image/svg+xml" : "image/jpeg";
            mediaMap.set(rId, `data:${mime};base64,${base64Data}`);
          }
        }
      }
    } catch (relsErr) {
      console.warn("[DOCX PARSER] Error parsing relationships:", relsErr);
    }
  }

  const elements = [];
  const body = xmlDoc.getElementsByTagName("w:body")[0];
  if (!body) {
    throw new Error("Invalid .docx document body.");
  }

  const childNodes = body.childNodes;
  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i];

    // 1. PARAGRAPHS (<w:p>)
    if (node.nodeName === "w:p") {
      const parsedP = parseParagraphNode(node, mediaMap);
      if (parsedP) {
        elements.push(parsedP);
      }
    }

    // 2. TABLES (<w:tbl>)
    else if (node.nodeName === "w:tbl") {
      const parsedTbl = parseTableNode(node);
      if (parsedTbl) {
        elements.push(parsedTbl);
      }
    }
  }

  return {
    success: true,
    elements,
  };
}

function parseParagraphNode(pNode, mediaMap) {
  let styleName = "normal"; // "normal" | "h1" | "h2" | "h3"
  let alignment = "left";

  // Paragraph Properties (<w:pPr>)
  const pPrList = pNode.getElementsByTagName("w:pPr");
  if (pPrList.length > 0) {
    const pPr = pPrList[0];

    // Style (<w:pStyle w:val="Heading1"/>)
    const pStyleList = pPr.getElementsByTagName("w:pStyle");
    if (pStyleList.length > 0) {
      const val = (pStyleList[0].getAttribute("w:val") || "").toLowerCase();
      if (val.includes("heading1") || val.includes("h1") || val.includes("title")) {
        styleName = "h1";
      } else if (val.includes("heading2") || val.includes("h2")) {
        styleName = "h2";
      } else if (val.includes("heading3") || val.includes("h3")) {
        styleName = "h3";
      }
    }

    // Justification (<w:jc w:val="center"/>)
    const jcList = pPr.getElementsByTagName("w:jc");
    if (jcList.length > 0) {
      alignment = jcList[0].getAttribute("w:val") || "left";
    }
  }

  // Check for Embedded Images in Drawing (<w:drawing>)
  const drawingList = pNode.getElementsByTagName("w:drawing");
  if (drawingList.length > 0) {
    for (let d = 0; d < drawingList.length; d++) {
      const blipList = drawingList[d].getElementsByTagName("a:blip");
      if (blipList.length > 0) {
        const embedId = blipList[0].getAttribute("r:embed");
        if (embedId && mediaMap.has(embedId)) {
          return {
            type: "image",
            id: embedId,
            src: mediaMap.get(embedId),
          };
        }
      }
    }
  }

  // Text Runs (<w:r>)
  const runs = [];
  const rNodes = pNode.getElementsByTagName("w:r");
  for (let j = 0; j < rNodes.length; j++) {
    const rNode = rNodes[j];

    // Extract Text Content (<w:t>)
    const tNodes = rNode.getElementsByTagName("w:t");
    let runText = "";
    for (let t = 0; t < tNodes.length; t++) {
      runText += tNodes[t].textContent || "";
    }

    if (!runText) continue;

    let bold = false;
    let italic = false;
    let underline = false;
    let color = "";
    let fontSize = styleName === "h1" ? 22 : styleName === "h2" ? 18 : styleName === "h3" ? 16 : 14;

    // Run Properties (<w:rPr>)
    const rPrList = rNode.getElementsByTagName("w:rPr");
    if (rPrList.length > 0) {
      const rPr = rPrList[0];
      if (rPr.getElementsByTagName("w:b").length > 0) bold = true;
      if (rPr.getElementsByTagName("w:i").length > 0) italic = true;
      if (rPr.getElementsByTagName("w:u").length > 0) underline = true;

      const colorList = rPr.getElementsByTagName("w:color");
      if (colorList.length > 0) {
        const hex = colorList[0].getAttribute("w:val");
        if (hex && hex !== "auto") color = `#${hex}`;
      }

      const szList = rPr.getElementsByTagName("w:sz");
      if (szList.length > 0) {
        const halfPts = parseInt(szList[0].getAttribute("w:val") || "28", 10);
        if (!isNaN(halfPts)) fontSize = Math.max(10, Math.round(halfPts / 2));
      }
    }

    runs.push({
      text: runText,
      bold,
      italic,
      underline,
      color,
      fontSize,
    });
  }

  if (runs.length === 0) {
    return null; // Empty paragraph spacer
  }

  return {
    type: "paragraph",
    style: styleName,
    alignment,
    runs,
  };
}

function parseTableNode(tblNode) {
  const rows = [];
  const trNodes = tblNode.getElementsByTagName("w:tr");

  for (let r = 0; r < trNodes.length; r++) {
    const tr = trNodes[r];
    const rowCells = [];
    const tcNodes = tr.getElementsByTagName("w:tc");

    for (let c = 0; c < tcNodes.length; c++) {
      const tc = tcNodes[c];
      let cellText = "";
      const tNodes = tc.getElementsByTagName("w:t");

      for (let t = 0; t < tNodes.length; t++) {
        cellText += tNodes[t].textContent || "";
      }
      rowCells.push(cellText.trim());
    }

    if (rowCells.length > 0) {
      rows.push(rowCells);
    }
  }

  if (rows.length === 0) return null;

  return {
    type: "table",
    rows,
  };
}
