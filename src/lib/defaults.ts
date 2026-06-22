import type { Template } from "./types";

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "initial-demo",
    name: "Initial demo message",
    type: "Initial",
    body: "Hi {company}, I put together a quick website demo for your {trade} business in {city}: {demoUrl}\n\nI noticed a few places where a sharper site could help turn more local visitors into calls. Would you be open to taking a look?\n\nBest,\n{myName}"
  },
  {
    id: "follow-up-1",
    name: "Follow-up 1",
    type: "Follow-up",
    body: "Hi {company}, just checking that you saw the demo I made for your {trade} business: {demoUrl}\n\nHappy to adjust it around your services or preferred style if useful.\n\n{myName}"
  },
  {
    id: "follow-up-2",
    name: "Follow-up 2",
    type: "Follow-up",
    body: "Hi {company}, quick follow-up from me. The demo for your {trade} business in {city} is still here: {demoUrl}\n\nIf improving the site is on your radar, I can walk you through what I changed and why.\n\n{myName}"
  },
  {
    id: "final-soft-follow-up",
    name: "Final soft follow-up",
    type: "Final",
    body: "Hi {company}, I do not want to crowd your inbox, so this is my last note for now.\n\nIf you ever want to revisit the demo for your {trade} business, it is here: {demoUrl}\n\nThanks,\n{myName}"
  }
];
