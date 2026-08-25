import JSZip from "jszip";
import { DOMParser as XmlDomParser } from "@xmldom/xmldom";

function getDomParser() {
  if (typeof window !== "undefined" && window.DOMParser) {
    return new window.DOMParser();
  }
  if (typeof globalThis !== "undefined" && globalThis.DOMParser) {
    return new globalThis.DOMParser();
  }
  return new XmlDomParser();
}

function getElements(node, tagName) {
  if (!node || typeof node.getElementsByTagName !== "function") return [];
  let list = node.getElementsByTagName(tagName);
  if (list && list.length > 0) return Array.from(list);

  const localName = tagName.includes(":") ? tagName.split(":")[1] : tagName;
  list = node.getElementsByTagName(localName);
  if (list && list.length > 0) return Array.from(list);

  return [];
}

function getFirstElement(node, tagName) {
  const list = getElements(node, tagName);
  return list.length > 0 ? list[0] : null;
}

/**
 * Pure client-side PPTX parser utility.
 * Unpacks PowerPoint OpenXML archives (.pptx) in the browser using JSZip & DOMParser.
 * Extracts slide dimensions, background, text boxes, font styles, embedded images, and tables.
 *
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise<{
 *   slides: Array<{
 *     slideNumber: number,
 *     width: number,
 *     height: number,
 *     background: string,
 *     elements: Array<any>
 *   }>
 * }>}
 */
export async function parsePptxArrayBuffer(arrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error("Empty ArrayBuffer provided for PPTX parsing.");
  }

  const domParser = getDomParser();

  let zip;
  try {
    zip = await JSZip.loadAsync(arrayBuffer);
  } catch (err) {
    throw new Error(`Failed to decompress PPTX archive: ${err?.message || "Invalid file format"}`);
  }

  // 1. Determine presentation slide dimensions (EMUs -> CSS Pixels)
  let slideWidthEmu = 9144000; // Default 16:9 widescreen (10 inches)
  let slideHeightEmu = 5143500; // Default 16:9 widescreen (5.625 inches)

  const presFile = zip.file("ppt/presentation.xml");
  if (presFile) {
    try {
      const presXmlText = await presFile.async("string");
      const presDoc = domParser.parseFromString(presXmlText, "text/xml");
      const sldSz = getFirstElement(presDoc, "p:sldSz");
      if (sldSz) {
        const cx = parseInt(sldSz.getAttribute("cx") || "0", 10);
        const cy = parseInt(sldSz.getAttribute("cy") || "0", 10);
        if (cx > 0 && cy > 0) {
          slideWidthEmu = cx;
          slideHeightEmu = cy;
        }
      }
    } catch {
      // Use defaults if presentation.xml parsing fails
    }
  }

  // Base canvas dimensions in CSS pixels (960px x 540px standard canvas ratio)
  const slideWidthPx = 960;
  const slideHeightPx = Math.round((slideHeightEmu / slideWidthEmu) * 960);

  // 2. Discover and sort slide files (ppt/slides/slide1.xml, slide2.xml, etc.)
  const slideFiles = [];
  zip.forEach((relativePath) => {
    if (/^ppt\/slides\/slide\d+\.xml$/i.test(relativePath)) {
      slideFiles.push(relativePath);
    }
  });

  // Sort slides numerically (slide1.xml, slide2.xml, slide10.xml...)
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)\.xml/i)?.[1] || "0", 10);
    const numB = parseInt(b.match(/slide(\d+)\.xml/i)?.[1] || "0", 10);
    return numA - numB;
  });

  if (slideFiles.length === 0) {
    throw new Error("No slide XML files found in PowerPoint presentation archive.");
  }

  // 3. Cache media files as Data URLs
  const mediaCache = {};
  const mediaFiles = [];
  zip.forEach((relativePath) => {
    if (relativePath.startsWith("ppt/media/")) {
      mediaFiles.push(relativePath);
    }
  });

  await Promise.all(
    mediaFiles.map(async (mediaPath) => {
      try {
        const file = zip.file(mediaPath);
        if (!file) return;
        const ext = mediaPath.split(".").pop()?.toLowerCase() || "";
        let mimeType = "image/png";
        if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
        if (ext === "gif") mimeType = "image/gif";
        if (ext === "svg") mimeType = "image/svg+xml";

        const base64 = await file.async("base64");
        const filename = mediaPath.split("/").pop() || "";
        const dataUrl = `data:${mimeType};base64,${base64}`;
        mediaCache[filename] = dataUrl;
        mediaCache[mediaPath] = dataUrl;
      } catch (err) {
        console.warn(`[PPTX PARSER] Failed to load media ${mediaPath}:`, err);
      }
    })
  );

  // 4. Parse each slide
  const slides = [];

  for (let index = 0; index < slideFiles.length; index++) {
    const slidePath = slideFiles[index];
    const slideXmlText = await zip.file(slidePath).async("string");
    const slideDoc = domParser.parseFromString(slideXmlText, "text/xml");

    // Parse slide relationship file for images (ppt/slides/_rels/slideX.xml.rels)
    const relsPath = slidePath.replace("ppt/slides/", "ppt/slides/_rels/").concat(".rels");
    const relsMap = {};
    const relsFile = zip.file(relsPath);
    if (relsFile) {
      try {
        const relsXmlText = await relsFile.async("string");
        const relsDoc = domParser.parseFromString(relsXmlText, "text/xml");
        const relationships = getElements(relsDoc, "Relationship");
        relationships.forEach((rel) => {
          const id = rel.getAttribute("Id");
          const target = rel.getAttribute("Target");
          if (id && target) {
            const filename = target.split("/").pop() || "";
            relsMap[id] = mediaCache[filename] || mediaCache[`ppt/media/${filename}`] || target;
          }
        });
      } catch {
        // Skip relationship file if missing
      }
    }

    const elements = [];

    // Helper to extract transform position/size percentages
    const parseTransform = (node) => {
      const off = getFirstElement(node, "a:off");
      const ext = getFirstElement(node, "a:ext");

      if (!off || !ext) return null;

      const x = parseInt(off.getAttribute("x") || "0", 10);
      const y = parseInt(off.getAttribute("y") || "0", 10);
      const cx = parseInt(ext.getAttribute("cx") || "0", 10);
      const cy = parseInt(ext.getAttribute("cy") || "0", 10);

      return {
        left: Math.max(0, Math.min(100, (x / slideWidthEmu) * 100)),
        top: Math.max(0, Math.min(100, (y / slideHeightEmu) * 100)),
        width: Math.max(5, Math.min(100, (cx / slideWidthEmu) * 100)),
        height: Math.max(3, Math.min(100, (cy / slideHeightEmu) * 100)),
      };
    };

    // Helper to extract color string
    const parseColor = (node) => {
      if (!node) return null;
      const srgb = getFirstElement(node, "a:srgbClr");
      if (srgb) {
        const val = srgb.getAttribute("val");
        if (val) return `#${val}`;
      }
      return null;
    };

    // A. Parse Pictures (<p:pic>)
    const picNodes = getElements(slideDoc, "p:pic");
    picNodes.forEach((pic) => {
      const transform = parseTransform(pic);
      const blip = getFirstElement(pic, "a:blip");
      const embedId = blip?.getAttribute("r:embed");

      if (transform && embedId && relsMap[embedId]) {
        elements.push({
          type: "image",
          id: `img_${elements.length}`,
          ...transform,
          src: relsMap[embedId],
        });
      }
    });

    // B. Parse Shapes & Text Boxes (<p:sp>)
    const spNodes = getElements(slideDoc, "p:sp");
    spNodes.forEach((sp) => {
      const transform = parseTransform(sp);
      if (!transform) return;

      const pNodes = getElements(sp, "a:p");
      const paragraphs = [];

      pNodes.forEach((p) => {
        const pPr = getFirstElement(p, "a:pPr");
        const align = pPr?.getAttribute("algn");
        let textAlign = "left";
        if (align === "ctr") textAlign = "center";
        if (align === "r") textAlign = "right";
        if (align === "j") textAlign = "justify";

        const runs = [];
        const rNodes = getElements(p, "a:r");
        rNodes.forEach((r) => {
          const tNode = getFirstElement(r, "a:t");
          const text = tNode?.textContent;
          if (!text) return;

          const rPr = getFirstElement(r, "a:rPr");
          const sz = rPr?.getAttribute("sz");
          const bold = rPr?.getAttribute("b") === "1";
          const italic = rPr?.getAttribute("i") === "1";
          const color = parseColor(rPr);

          runs.push({
            text,
            fontSize: sz ? Math.max(12, Math.round(parseInt(sz, 10) / 100)) : 16,
            bold,
            italic,
            color: color || "#FFFFFF",
          });
        });

        if (runs.length > 0) {
          paragraphs.push({ textAlign, runs });
        }
      });

      const spPr = getFirstElement(sp, "p:spPr");
      const bgColor = parseColor(spPr);

      if (paragraphs.length > 0 || bgColor) {
        elements.push({
          type: "text",
          id: `sp_${elements.length}`,
          ...transform,
          bgColor,
          paragraphs,
        });
      }
    });

    // C. Parse Tables (<a:tbl>)
    const tblNodes = getElements(slideDoc, "a:tbl");
    tblNodes.forEach((tbl) => {
      const transform = parseTransform(tbl);
      if (!transform) return;

      const rows = [];
      const trNodes = getElements(tbl, "a:tr");
      trNodes.forEach((tr) => {
        const cells = [];
        const tcNodes = getElements(tr, "a:tc");
        tcNodes.forEach((tc) => {
          const text = tc.textContent?.trim() || "";
          cells.push(text);
        });
        rows.push(cells);
      });

      elements.push({
        type: "table",
        id: `tbl_${elements.length}`,
        ...transform,
        rows,
      });
    });

    // Fallback: If no elements extracted, grab raw slide text so no content is missed
    if (elements.length === 0) {
      const rawText = slideDoc.textContent?.trim();
      if (rawText) {
        elements.push({
          type: "text",
          id: `raw_0`,
          left: 5,
          top: 10,
          width: 90,
          height: 80,
          paragraphs: [
            {
              textAlign: "left",
              runs: [{ text: rawText, fontSize: 18, color: "#FFFFFF" }],
            },
          ],
        });
      }
    }

    slides.push({
      slideNumber: index + 1,
      width: slideWidthPx,
      height: slideHeightPx,
      background: "#0D1021",
      elements,
    });
  }

  return { slides };
}

export default parsePptxArrayBuffer;
