import {
  FileText,
  Image as ImageIcon,
  Video,
  Presentation,
  BarChart3,
  AppWindow,
  ListChecks,
  Music,
  FileBadge,
  Link as LinkIcon,
  Code2,
  AlertTriangle,
} from "lucide-react";

import TextBlockView from "./TextBlockView";
import TextBlockEdit from "./TextBlockEdit";
import ImageBlockView from "./ImageBlockView";
import ImageBlockEdit from "./ImageBlockEdit";
import VideoBlockView from "./VideoBlockView";
import VideoBlockEdit from "./VideoBlockEdit";
import SlideshowBlockView from "./SlideshowBlockView";
import SlideshowBlockEdit from "./SlideshowBlockEdit";
import ChartBlockView from "./ChartBlockView";
import ChartBlockEdit from "./ChartBlockEdit";
import InteractiveBlockView from "./InteractiveBlockView";
import InteractiveBlockEdit from "./InteractiveBlockEdit";
import QuizBlockView from "./quiz/QuizBlockView";
import QuizBlockEdit from "./quiz/QuizBlockEdit";
import AudioBlockView from "./AudioBlockView";
import AudioBlockEdit from "./AudioBlockEdit";
import DocumentBlockView from "./DocumentBlockView";
import DocumentBlockEdit from "./DocumentBlockEdit";
import LinkBlockView from "./LinkBlockView";
import LinkBlockEdit from "./LinkBlockEdit";
import CodeBlockView from "./CodeBlockView";
import CodeBlockEdit from "./CodeBlockEdit";
import UnknownBlockView from "./UnknownBlockView";

export const blockRegistry = {
  text: {
    label: "Text",
    icon: FileText,
    ViewComponent: TextBlockView,
    EditComponent: TextBlockEdit,
    capabilities: { nestable: true },
    defaultData: () => ({ blockType: "text", title: "", cssStyles: "", markdown: "" }),
  },
  image: {
    label: "Image",
    icon: ImageIcon,
    ViewComponent: ImageBlockView,
    EditComponent: ImageBlockEdit,
    defaultData: () => ({ blockType: "image", title: "", cssStyles: "", url: "", caption: "" }),
  },
  video: {
    label: "Video",
    icon: Video,
    ViewComponent: VideoBlockView,
    EditComponent: VideoBlockEdit,
    defaultData: () => ({ blockType: "video", title: "", cssStyles: "", url: "", caption: "" }),
  },
  slideshow: {
    label: "Slideshow",
    icon: Presentation,
    ViewComponent: SlideshowBlockView,
    EditComponent: SlideshowBlockEdit,
    capabilities: { nestable: true },
    defaultData: () => ({
      blockType: "slideshow",
      title: "",
      cssStyles: "",
      markdown: "# Slide 1\n\nContent\n\n---\n\n# Slide 2\n\nMore content",
    }),
  },
  chart: {
    label: "Chart",
    icon: BarChart3,
    ViewComponent: ChartBlockView,
    EditComponent: ChartBlockEdit,
    defaultData: () => ({
      blockType: "chart",
      title: "",
      cssStyles: "",
      rows: [{ label: "Item 1", value: 50 }],
    }),
  },
  interactive: {
    label: "Interactive",
    icon: AppWindow,
    ViewComponent: InteractiveBlockView,
    EditComponent: InteractiveBlockEdit,
    defaultData: () => ({ blockType: "interactive", title: "", cssStyles: "", url: "" }),
  },
  quiz: {
    label: "Quiz",
    icon: ListChecks,
    ViewComponent: QuizBlockView,
    EditComponent: QuizBlockEdit,
    defaultData: () => ({
      blockType: "quiz",
      title: "",
      cssStyles: "",
      answerType: "chooseOne",
      question: "",
      options: ["Option A", "Option B"],
      correctAnswer: [0],
      pairs: [],
      explanation: "",
      points: 10,
      allowedTime: "",
    }),
  },
  audio: {
    label: "Audio",
    icon: Music,
    ViewComponent: AudioBlockView,
    EditComponent: AudioBlockEdit,
    defaultData: () => ({ blockType: "audio", title: "", cssStyles: "", url: "", caption: "" }),
  },
  document: {
    label: "Document",
    icon: FileBadge,
    ViewComponent: DocumentBlockView,
    EditComponent: DocumentBlockEdit,
    defaultData: () => ({ blockType: "document", title: "", cssStyles: "", url: "" }),
  },
  link: {
    label: "Link",
    icon: LinkIcon,
    ViewComponent: LinkBlockView,
    EditComponent: LinkBlockEdit,
    defaultData: () => ({ blockType: "link", title: "", cssStyles: "", url: "" }),
  },
  code: {
    label: "Code",
    icon: Code2,
    ViewComponent: CodeBlockView,
    EditComponent: CodeBlockEdit,
    defaultData: () => ({ blockType: "code", title: "", cssStyles: "", language: "", code: "" }),
  },
  // Importer-only artifact — deliberately excluded from BLOCK_TYPE_ORDER so
  // it never appears in AddBlockModal; read-only in both view and edit mode.
  unknown: {
    label: "Unmapped",
    icon: AlertTriangle,
    ViewComponent: UnknownBlockView,
    EditComponent: UnknownBlockView,
    defaultData: () => ({ blockType: "unknown", title: "", cssStyles: "", status: "UNMAPPED", original: {} }),
  },
};

export const BLOCK_TYPE_ORDER = ["text", "image", "video", "slideshow", "chart", "interactive", "quiz", "audio", "document", "link", "code"];
