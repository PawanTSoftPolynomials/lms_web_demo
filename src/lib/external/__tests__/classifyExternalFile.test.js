import { classifyExternalFile } from "../classifyExternalFile.js";

/**
 * Lightweight test suite for classifyExternalFile utility.
 * Verifies all requirement test cases:
 * 1. Google Drive /file/d/ABC123/view
 * 2. Google Drive /open?id=ABC123
 * 3. Direct PDF
 * 4. Direct DOC
 * 5. Direct DOCX
 * 6. Direct PPT
 * 7. Direct PPTX
 * 8. Unsupported (image.jpg, file.zip)
 * 9. Invalid input
 */

function runTests() {
  const testCases = [
    {
      name: "Google Drive view link",
      input: "https://drive.google.com/file/d/ABC123/view",
      expected: {
        isValid: true,
        provider: "GOOGLE_DRIVE",
        fileId: "ABC123",
        fileType: "UNKNOWN",
        url: "https://drive.google.com/file/d/ABC123/view",
      },
    },
    {
      name: "Google Drive open link",
      input: "https://drive.google.com/open?id=ABC123",
      expected: {
        isValid: true,
        provider: "GOOGLE_DRIVE",
        fileId: "ABC123",
        fileType: "UNKNOWN",
        url: "https://drive.google.com/open?id=ABC123",
      },
    },
    {
      name: "Direct PDF link",
      input: "https://example.com/course.pdf",
      expected: {
        isValid: true,
        provider: "DIRECT_URL",
        fileId: null,
        fileType: "PDF",
        url: "https://example.com/course.pdf",
      },
    },
    {
      name: "Direct DOC link",
      input: "https://example.com/course.doc",
      expected: {
        isValid: true,
        provider: "DIRECT_URL",
        fileId: null,
        fileType: "DOC",
        url: "https://example.com/course.doc",
      },
    },
    {
      name: "Direct DOCX link",
      input: "https://example.com/course.docx",
      expected: {
        isValid: true,
        provider: "DIRECT_URL",
        fileId: null,
        fileType: "DOCX",
        url: "https://example.com/course.docx",
      },
    },
    {
      name: "Direct PPT link",
      input: "https://example.com/course.ppt",
      expected: {
        isValid: true,
        provider: "DIRECT_URL",
        fileId: null,
        fileType: "PPT",
        url: "https://example.com/course.ppt",
      },
    },
    {
      name: "Direct PPTX link",
      input: "https://example.com/course.pptx",
      expected: {
        isValid: true,
        provider: "DIRECT_URL",
        fileId: null,
        fileType: "PPTX",
        url: "https://example.com/course.pptx",
      },
    },
    {
      name: "Unsupported image link",
      input: "https://example.com/image.jpg",
      expected: {
        isValid: true,
        provider: "DIRECT_URL",
        fileId: null,
        fileType: "UNSUPPORTED",
        url: "https://example.com/image.jpg",
      },
    },
    {
      name: "Unsupported zip link",
      input: "https://example.com/archive.zip",
      expected: {
        isValid: true,
        provider: "DIRECT_URL",
        fileId: null,
        fileType: "UNSUPPORTED",
        url: "https://example.com/archive.zip",
      },
    },
    {
      name: "Invalid string input",
      input: "not-a-url",
      expected: {
        isValid: false,
        provider: "UNKNOWN",
        fileType: "UNKNOWN",
        url: "not-a-url",
        fileId: null,
      },
    },
    {
      name: "Null input",
      input: null,
      expected: {
        isValid: false,
        provider: "UNKNOWN",
        fileType: "UNKNOWN",
        url: "",
        fileId: null,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  console.log("=== RUNNING CLASSIFY EXTERNAL FILE TESTS ===");
  testCases.forEach((tc) => {
    const result = classifyExternalFile(tc.input);
    const matches =
      result.isValid === tc.expected.isValid &&
      result.provider === tc.expected.provider &&
      result.fileId === tc.expected.fileId &&
      result.fileType === tc.expected.fileType &&
      result.url === tc.expected.url;

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
