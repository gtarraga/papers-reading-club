import { db } from "../src/db";
import {
  cycleResults,
  cycles,
  groups,
  participants,
  rankingRules,
  submissions,
  tokenPatterns,
  voteRankings,
  votes,
} from "../src/db/schema";

/**
 * Production seed script - reads sensitive data from environment variables
 *
 * Required environment variables:
 * - TOKEN_PATTERN: The token pattern for the group (e.g., "papers-*-suffix")
 * - INITIAL_TOKEN: A valid token matching the pattern (e.g., "papers-firstname-lastname-suffix")
 * - INITIAL_FIRST_NAME: First name of initial participant
 * - INITIAL_LAST_NAME: Last name of initial participant
 */
async function seed() {
  console.log("🌱 Seeding production database...");

  // Validate required environment variables
  const requiredEnvVars = [
    "TOKEN_PATTERN",
    "INITIAL_TOKEN",
    "INITIAL_FIRST_NAME",
    "INITIAL_LAST_NAME",
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }

  const TOKEN_PATTERN = process.env.TOKEN_PATTERN!;
  const INITIAL_TOKEN = process.env.INITIAL_TOKEN!;
  const INITIAL_FIRST_NAME = process.env.INITIAL_FIRST_NAME!;
  const INITIAL_LAST_NAME = process.env.INITIAL_LAST_NAME!;

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

    // 2. Create token pattern from environment variable
    console.log("Creating token pattern...");
    const [pattern] = await db
      .insert(tokenPatterns)
      .values({
        groupId: group.id,
        pattern: TOKEN_PATTERN,
        isActive: true,
        createdAt: new Date(),
      })
      .returning();
    console.log(`✓ Created token pattern: ${pattern.pattern}`);

    // 3. Create ranking rules based on paper count
    console.log("Creating ranking rules...");
    const rules = [
      { minPapers: 1, maxPapers: 3, requiredRankings: 1 }, // 1-3 papers: rank 1
      { minPapers: 4, maxPapers: 6, requiredRankings: 3 }, // 4-9 papers: rank 3
      { minPapers: 10, maxPapers: null, requiredRankings: 5 }, // 10+ papers: rank 5
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

    // 4. Create initial participant from environment variables
    console.log("Creating initial participant...");
    const now = new Date();

    const [participant] = await db
      .insert(participants)
      .values({
        groupId: group.id,
        token: INITIAL_TOKEN,
        firstName: INITIAL_FIRST_NAME,
        lastName: INITIAL_LAST_NAME,
        registeredAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      })
      .returning();
    console.log(
      `✓ Created participant: ${participant.firstName} ${participant.lastName}`
    );

    // 5. Create completed cycle 0 (30-16 days ago)
    console.log("Creating cycle 0 (completed)...");
    const cycle0SubmissionStart = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000
    );
    const cycle0SubmissionEnd = new Date(
      now.getTime() - 23 * 24 * 60 * 60 * 1000
    );
    const cycle0VotingStart = cycle0SubmissionEnd;
    const cycle0VotingEnd = new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000);

    const [cycle0] = await db
      .insert(cycles)
      .values({
        groupId: group.id,
        cycleNumber: 0,
        submissionStart: cycle0SubmissionStart,
        submissionEnd: cycle0SubmissionEnd,
        votingStart: cycle0VotingStart,
        votingEnd: cycle0VotingEnd,
        createdAt: cycle0SubmissionStart,
      })
      .returning();
    console.log(`✓ Created cycle #${cycle0.cycleNumber} (completed)`);

    // 6. Create submission for cycle 0
    console.log("Creating submission for cycle 0...");
    const [winningSubmission] = await db
      .insert(submissions)
      .values({
        cycleId: cycle0.id,
        participantId: participant.id,
        title: "How to Read a Paper",
        url: "https://web.stanford.edu/class/ee384m/Handouts/HowtoReadPaper.pdf",
        publicationDate: new Date("2007-01-01"),
        recommendation:
          "Essential guide for efficiently reading academic papers. The three-pass approach is invaluable for literature reviews.",
        submittedAt: new Date(
          cycle0SubmissionStart.getTime() + 1 * 24 * 60 * 60 * 1000
        ),
      })
      .returning();
    console.log(`✓ Created submission: "${winningSubmission.title}"`);

    // 7. Create vote for cycle 0
    console.log("Creating vote for cycle 0...");
    const [vote] = await db
      .insert(votes)
      .values({
        cycleId: cycle0.id,
        participantId: participant.id,
        votedAt: new Date(
          cycle0VotingStart.getTime() + 1 * 24 * 60 * 60 * 1000
        ),
      })
      .returning();

    await db
      .insert(voteRankings)
      .values([
        { voteId: vote.id, submissionId: winningSubmission.id, rank: 1 },
      ]);

    console.log(`✓ Created 1 vote with ranking`);

    // 8. Create cycle result for cycle 0
    console.log("Creating cycle result for cycle 0...");
    await db.insert(cycleResults).values({
      cycleId: cycle0.id,
      winningSubmissionId: winningSubmission.id,
      totalVotes: 1,
      eliminationRounds: [
        {
          round: 1,
          eliminated: null,
          votes: {
            [winningSubmission.id]: 1,
          },
        },
      ],
      calculatedAt: cycle0VotingEnd,
    });
    console.log(`✓ Created cycle result (winner: "How to Read a Paper")`);

    console.log("\n✅ Production database seeded successfully!");
    console.log(
      '\n📖 Cycle 0 completed with "How to Read a Paper" as the winner!'
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seed function
seed();
