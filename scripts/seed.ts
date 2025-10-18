#!/usr/bin/env tsx

import { db } from "../src/db";
import { cycles, groups, rankingRules, tokenPatterns } from "../src/db/schema";

/**
 * Seed script for initial database data
 * Creates default group, token patterns, ranking rules, and first cycle
 */
async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // 1. Create default "main" group with 14-day cadence (7 days submission + 7 days voting)
    console.log("Creating default group...");
    const [group] = await db
      .insert(groups)
      .values({
        name: "main",
        cadenceDays: 14,
        submissionDays: 7,
        votingDays: 7,
        createdAt: new Date(),
      })
      .returning();
    console.log(`✓ Created group: ${group.name} (ID: ${group.id})`);

    // 2. Create token pattern "papers-*"
    console.log("Creating token pattern...");
    const [pattern] = await db
      .insert(tokenPatterns)
      .values({
        groupId: group.id,
        pattern: "papers-*",
        isActive: true,
        createdAt: new Date(),
      })
      .returning();
    console.log(`✓ Created token pattern: ${pattern.pattern}`);

    // 3. Create ranking rules based on paper count
    console.log("Creating ranking rules...");
    const rules = [
      { minPapers: 1, maxPapers: 3, requiredRankings: 1 }, // 1-3 papers: rank 1
      { minPapers: 4, maxPapers: 6, requiredRankings: 3 }, // 4-6 papers: rank 3
      { minPapers: 7, maxPapers: null, requiredRankings: 5 }, // 7+ papers: rank 5
    ];

    for (const rule of rules) {
      await db.insert(rankingRules).values({
        groupId: group.id,
        minPapers: rule.minPapers,
        maxPapers: rule.maxPapers,
        requiredRankings: rule.requiredRankings,
      });
    }
    console.log(`✓ Created ${rules.length} ranking rules`);

    // 4. Create first cycle starting today
    console.log("Creating first cycle...");
    const now = new Date();
    const submissionStart = now;
    const submissionEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
    const votingStart = submissionEnd;
    const votingEnd = new Date(
      submissionEnd.getTime() + 7 * 24 * 60 * 60 * 1000
    ); // 7 days after submission ends

    const [cycle] = await db
      .insert(cycles)
      .values({
        groupId: group.id,
        cycleNumber: 1,
        submissionStart,
        submissionEnd,
        votingStart,
        votingEnd,
        createdAt: now,
      })
      .returning();
    console.log(`✓ Created cycle #${cycle.cycleNumber}`);
    console.log(
      `  Submission: ${submissionStart.toLocaleDateString()} - ${submissionEnd.toLocaleDateString()}`
    );
    console.log(
      `  Voting: ${votingStart.toLocaleDateString()} - ${votingEnd.toLocaleDateString()}`
    );

    console.log("\n✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seed function
seed();
