// framer-motion's animation + layout features, in their own module so
// LazyMotion can load them as a separate chunk after first paint (see
// QuickActionStrip). domMax because the active pill uses layoutId.
export { domMax as default } from "framer-motion";
