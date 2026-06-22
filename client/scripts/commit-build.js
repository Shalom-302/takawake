#!/usr/bin/env ts-node

import { execSync } from "child_process";

const commitMessage = process.argv[2];

if (!commitMessage) {
    console.error("❌ Please provide a commit message.");
    console.error('Usage: npm run cb "your commit message"');
    process.exit(1);
}

try {
    console.log("🔧 Formatting code...");
    execSync("npm run format", { stdio: "inherit" });

    console.log("📦 Staging files...");
    execSync("git add .", { stdio: "inherit" });

    console.log(`📝 Committing with message: "${commitMessage}"`);
    execSync(`git commit -m "${commitMessage}"`, { stdio: "inherit" });

    console.log("🏗️  Building the project...");
    execSync("npm run build", { stdio: "inherit" });

    console.log("✅ Build succeeded. You can now push your code!");
} catch (error) {
    console.error("\n❌ Build failed. Error details:");
    console.error(error.message);
    process.exit(1);
}
