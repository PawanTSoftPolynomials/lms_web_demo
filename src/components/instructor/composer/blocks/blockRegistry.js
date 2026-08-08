import {
  FileText,
  Image as ImageIcon,
  Video,
  Presentation,
  BarChart3,
  AppWindow,
  ListChecks,
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

export const blockRegistry = {
  text: {
    label: "Text",
    icon: FileText,
    ViewComponent: TextBlockView,
    EditComponent: TextBlockEdit,
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
};

export const BLOCK_TYPE_ORDER = ["text", "image", "video", "slideshow", "chart", "interactive", "quiz"];
