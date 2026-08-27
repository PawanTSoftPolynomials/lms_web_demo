import { resolveExternalFile } from "../resolveExternalFile.js";

/**
 * Unit test suite for resolveExternalFile utility.
 * Verifies resolution logic for:
 * 1. Google Drive file view URLs
 * 2. Google Drive open URLs
 * 3. Google Drive uc URLs
 * 4. Google Docs document URLs
 * 5. Google Slides presentation URLs
 * 6. Direct PDF, DOC, DOCX, PPT, PPTX URLs
 * 7. Unsupported URLs
 * 8. Invalid URL inputs
 */

function runTests() {
  const testCases = [
    {
      name: "Google Drive view link",
      input: "https://drive.google.com/file/d/ABC123/view",
      expected: {
        isValid: true,
        provider: "GOOGLE_DRIVE",
        fileType: "UNKNOWN",
        sourceUrl: "https://drive.google.com/file/d/ABC123/view",
        viewerUrl: "https://drive.google.com/file/d/ABC123/preview",
        fileId: "ABC123",
      },
    },
    {
      name: "Google Drive open link",
      input: "https://drive.google.com/open?id=ABC123",
      expected: {
        isValid: true,
        provider: "GOOGLE_DRIVE",
        fileType: "UNKNOWN",
        sourceUrl: "https://drive.google.com/open?id=ABC123",
        viewerUrl: "https://drive.google.com/file/d/ABC123/preview",
        fileId: "ABC123",
      },
    },
    {
      name: "Google Drive uc link",
      input: "https://drive.google.com/uc?id=ABC123",
      expected: {
        isValid: true,
        provider: "GOOGLE_DRIVE",
        fileType: "UNKNOWN",
        sourceUrl: "https://drive.google.com/uc?id=ABC123",
        viewerUrl: "https://drive.google.com/file/d/ABC123/preview",
        fileId: "ABC123",
      },
    },
    {
      name: "Google Docs document link",
      input: "https://docs.google.com/document/d/ABC123/edit",
      expected: {
        isValid: true,
        provider: "GOOGLE_DRIVE",
        fileType: "UNKNOWN",
        sourceUrl: "https://docs.google.com/document/d/ABC123/edit",
        viewerUrl: "https://docs.google.com/document/d/ABC123/preview",
        fileId: "ABC123",
      },
    },
    {
      name: "Google Slides presentation link",
      input: "https://docs.google.com/presentation/d/ABC123/edit",
      expected: {
        isValid: true,
        provider: "GOOGLE_DRIVE",
        fileType: "UNKNOWN",
        sourceUrl: "https://docs.google.com/presentation/d/ABC123/edit",
        viewerUrl: "https://docs.google.com/presentation/d/ABC123/preview",
        fileId: "ABC123",
      },
    },
    {
      name: "Direct PDF link",
      input: "https://example.com/course.pdf",
      expected: {
        isValid: true,
        provider: "DIRECT_URL",
        fileType: "PDF",
        sourceUrl: "https://example.com/course.pdf",
        viewerUrl: "https://example.com/course.pdf",
        fileId: null,
      },
    },
    {
      name: "Direct DOC link",
      input: "https://example.com/course.doc",
      expected: {
        isValid: true,
        provider: "DIRECT_URL",
        fileType: "DOC",
        sourceUrl: "https://example.com/course.doc",
        viewerUrl: "https://example.com/course.doc",
        fileId: null,
      },
    },
    {
      name: "Direct DOCX link",
      input: "https://example.com/course.docx",
      expected: {
        isValid: true,
        provider: "DIRECT_URL",
        fileType: "DOCX",
        sourceUrl: "https://example.com/course.docx",
        viewerUrl: "https://example.com/course.docx",
        fileId: null,
      },
    },
    {
      name: "Direct PPT link",
      input: "https://example.com/course.ppt",
      expected: {
        isValid: true,
        provider: "DIRECT_URL",
        fileType: "PPT",
        sourceUrl: "https://example.com/course.ppt",
        viewerUrl: "https://example.com/course.ppt",
        fileId: null,
      },
    },
    {
      name: "Direct PPTX link",
      input: "https://example.com/course.pptx",
      expected: {
        isValid: true,
        provider: "DIRECT_URL",
        fileType: "PPTX",
        sourceUrl: "https://example.com/course.pptx",
        viewerUrl: "https://example.com/course.pptx",
        fileId: null,
      },
    },
    {
      name: "Unsupported image link",
      input: "https://example.com/image.jpg",
      expected: {
        isValid: true,
        provider: "DIRECT_URL",
        fileType: "UNSUPPORTED",
        sourceUrl: "https://example.com/image.jpg",
        viewerUrl: "https://example.com/image.jpg",
        fileId: null,
      },
    },
    {
      name: "Invalid URL string",
      input: "not-a-url",
      expected: {
        isValid: false,
        provider: "UNKNOWN",
        fileType: "UNKNOWN",
        sourceUrl: "not-a-url",
        viewerUrl: "",
        fileId: null,
      },
    },
    {
      name: "Null URL input",
      input: null,
      expected: {
        isValid: false,
        provider: "UNKNOWN",
        fileType: "UNKNOWN",
        sourceUrl: "",
        viewerUrl: "",
        fileId: null,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  console.log("=== RUNNING RESOLVE EXTERNAL FILE TESTS ===");
  testCases.forEach((tc) => {
    const result = resolveExternalFile(tc.input);
    const matches =
      result.isValid === tc.expected.isValid &&
      result.provider === tc.expected.provider &&
      result.fileId === tc.expected.fileId &&
      result.fileType === tc.expected.fileType &&
      result.sourceUrl === tc.expected.sourceUrl &&
      result.viewerUrl === tc.expected.viewerUrl;

    if (matches) {
      console.log(`[PASS] ${tc.name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${tc.name}`);
      console.error("  Expected:", tc.expected);
      console.error("  Actual:  ", result);
      failed++;
    }
  });

  console.log(`\nRESULTS: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
