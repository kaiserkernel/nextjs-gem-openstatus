import type { WebVitalsConfig } from "./types";

export const webVitalEvents = [
  "CLS",
  "FCP",
  "FID",
  "INP",
  "LCP",
  "TTFB",
] as const;

export const webVitalsConfig: WebVitalsConfig = {
  CLS: {
    unit: "",
    label: "Cumulative Layout Shift",
    description:
      "CLS measures the sum of all individual layout shift scores for every unexpected layout shift that occurs during the entire lifespan of the page.",
    values: [
      {
        type: "good",
        label: "Good",
        min: 0,
        max: 0.1,
      },
      {
        type: "needs-improvement",
        label: "Needs Improvement",
        min: 0.1,
        max: 0.25,
      },
      {
        type: "poor",
        label: "Poor",
        min: 0.25,
        max: Number.POSITIVE_INFINITY,
      },
    ],
  },
  FCP: {
    unit: "ms",
    label: "First Contentful Paint",
    description:
      "FCP measures the time from when the page starts loading to when any part of the page's content is rendered on the screen.",
    values: [
      {
        type: "good",
        label: "Good",
        min: 0,
        max: 1800,
      },
      {
        type: "needs-improvement",
        label: "Needs Improvement",
        min: 1800,
        max: 3000,
      },
      {
        type: "poor",
        label: "Poor",
        min: 3000,
        max: Number.POSITIVE_INFINITY,
      },
    ],
  },
  FID: {
    unit: "ms",
    label: "First Input Delay",
    description:
      "FID measures the time from when a user first interacts with a page to the time when the browser is actually able to respond to that interaction.",
    values: [
      {
        type: "good",
        label: "Good",
        min: 0,
        max: 100,
      },
      {
        type: "needs-improvement",
        label: "Needs Improvement",
        min: 100,
        max: 300,
      },
      {
        type: "poor",
        label: "Poor",
        min: 300,
        max: Number.POSITIVE_INFINITY,
      },
    ],
  },
  INP: {
    unit: "ms",
    label: "Input Delay",
    description:
      "INP measures the time from when a user first interacts with a page to the time when the browser is actually able to respond to that interaction.",
    values: [
      {
        type: "good",
        label: "Good",
        min: 0,
        max: 200,
      },
      {
        type: "needs-improvement",
        label: "Needs Improvement",
        min: 200,
        max: 500,
      },
      {
        type: "poor",
        label: "Poor",
        min: 500,
        max: Number.POSITIVE_INFINITY,
      },
    ],
  },
  LCP: {
    unit: "ms",
    label: "Largest Contentful Paint",
    description:
      "LCP measures the time from when the page starts loading to when the largest content element is rendered on the screen.",
    values: [
      {
        type: "good",
        label: "Good",
        min: 0,
        max: 2500,
      },
      {
        type: "needs-improvement",
        label: "Needs Improvement",
        min: 2500,
        max: 4000,
      },
      {
        type: "poor",
        label: "Poor",
        min: 4000,
        max: Number.POSITIVE_INFINITY,
      },
    ],
  },
  TTFB: {
    unit: "ms",
    label: "Time to First Byte",
    description:
      "TTFB measures the time from when the browser starts requesting a page to when the first byte of the page is received by the browser.",
    values: [
      {
        type: "good",
        label: "Good",
        min: 0,
        max: 800,
      },
      {
        type: "needs-improvement",
        label: "Needs Improvement",
        min: 800,
        max: 1800,
      },
      {
        type: "poor",
        label: "Poor",
        min: 1800,
        max: Number.POSITIVE_INFINITY,
      },
    ],
  },
};
