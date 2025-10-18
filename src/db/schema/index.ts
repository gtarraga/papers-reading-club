import { relations } from "drizzle-orm";

// Import all tables
export { cycleResults } from "./cycle-results";
export { cycles } from "./cycles";
export { groups } from "./groups";
export { participants } from "./participants";
export { rankingRules } from "./ranking-rules";
export { submissions } from "./submissions";
export { tokenPatterns } from "./token-patterns";
export { voteRankings } from "./vote-rankings";
export { votes } from "./votes";

import { cycleResults } from "./cycle-results";
import { cycles } from "./cycles";
import { groups } from "./groups";
import { participants } from "./participants";
import { rankingRules } from "./ranking-rules";
import { submissions } from "./submissions";
import { tokenPatterns } from "./token-patterns";
import { voteRankings } from "./vote-rankings";
import { votes } from "./votes";

/**
 * Define relations between tables for Drizzle query API
 */

export const groupsRelations = relations(groups, ({ many }) => ({
  tokenPatterns: many(tokenPatterns),
  rankingRules: many(rankingRules),
  cycles: many(cycles),
  participants: many(participants),
}));

export const tokenPatternsRelations = relations(tokenPatterns, ({ one }) => ({
  group: one(groups, {
    fields: [tokenPatterns.groupId],
    references: [groups.id],
  }),
}));

export const rankingRulesRelations = relations(rankingRules, ({ one }) => ({
  group: one(groups, {
    fields: [rankingRules.groupId],
    references: [groups.id],
  }),
}));

export const cyclesRelations = relations(cycles, ({ one, many }) => ({
  group: one(groups, {
    fields: [cycles.groupId],
    references: [groups.id],
  }),
  submissions: many(submissions),
  votes: many(votes),
  result: one(cycleResults),
}));

export const participantsRelations = relations(
  participants,
  ({ one, many }) => ({
    group: one(groups, {
      fields: [participants.groupId],
      references: [groups.id],
    }),
    submissions: many(submissions),
    votes: many(votes),
  })
);

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  cycle: one(cycles, {
    fields: [submissions.cycleId],
    references: [cycles.id],
  }),
  participant: one(participants, {
    fields: [submissions.participantId],
    references: [participants.id],
  }),
  rankings: many(voteRankings),
  result: one(cycleResults),
}));

export const votesRelations = relations(votes, ({ one, many }) => ({
  cycle: one(cycles, {
    fields: [votes.cycleId],
    references: [cycles.id],
  }),
  participant: one(participants, {
    fields: [votes.participantId],
    references: [participants.id],
  }),
  rankings: many(voteRankings),
}));

export const voteRankingsRelations = relations(voteRankings, ({ one }) => ({
  vote: one(votes, {
    fields: [voteRankings.voteId],
    references: [votes.id],
  }),
  submission: one(submissions, {
    fields: [voteRankings.submissionId],
    references: [submissions.id],
  }),
}));

export const cycleResultsRelations = relations(cycleResults, ({ one }) => ({
  cycle: one(cycles, {
    fields: [cycleResults.cycleId],
    references: [cycles.id],
  }),
  winningSubmission: one(submissions, {
    fields: [cycleResults.winningSubmissionId],
    references: [submissions.id],
  }),
}));
