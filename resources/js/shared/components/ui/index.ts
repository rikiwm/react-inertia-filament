/**
 * @file shared/components/ui/index.ts
 *
 * Barrel export for all generic UI primitives.
 * Consolidates Components/UI, Components/ShadCN, and Components/Inputs.
 */

// ShadCN / Radix primitives
export * from "./button";
export * from "./navigation-menu";
export * from "./sheet";
export * from "./dialog";
export * from "./table";
export { FloatingDock } from "./floating-dock";
export { default as Breadcrumb } from "./breadcrumb";

// Form inputs
export { default as Input } from "./input";
export { default as TextArea } from "./text-area";

// Custom styled button (from Inputs layer)
export { default as CustomButton } from "./custom-button";
