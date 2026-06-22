export const STATUSES = [
  "New lead",
  "Demo sent",
  "Follow-up 1 sent",
  "Follow-up 2 sent",
  "Replied",
  "Interested",
  "Meeting booked",
  "Won",
  "Lost",
  "Not now"
] as const;

export type ProspectStatus = (typeof STATUSES)[number];

export type Prospect = {
  id: string;
  companyName: string;
  trade: string;
  city: string;
  contactPerson: string;
  phone: string;
  email: string;
  websiteUrl: string;
  demoUrl: string;
  source: string;
  status: ProspectStatus;
  lastContactedDate: string;
  nextFollowUpDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Template = {
  id: string;
  name: string;
  type: string;
  body: string;
};

export type TimelineEntry = {
  id: string;
  prospectId: string;
  entryDate: string;
  actionType: string;
  messageSent: string;
  notes: string;
  createdAt: string;
};

export type ProspectFilters = {
  status?: string;
  city?: string;
  trade?: string;
  due?: string;
  sort?: string;
};

export type Stats = {
  totalProspects: number;
  demosSent: number;
  replies: number;
  interestedLeads: number;
  wonClients: number;
  followUpsDueToday: number;
  demoToReplyRate: number;
  replyToInterestedRate: number;
  interestedToWonRate: number;
};
