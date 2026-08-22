import fs from "fs";
import path from "path";

const artifactPath = path.join(__dirname, "../artifacts/contracts/src/TraceDonate.sol/TraceDonate.json");
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

const outputPath = path.join(__dirname, "../src/config/bytecode.ts");
const content = `export const TRACEDONATE_BYTECODE = ${JSON.stringify(artifact.bytecode)} as \`0x\${string}\`;\n`;

fs.writeFileSync(outputPath, content, "utf-8");
console.log("Successfully generated src/config/bytecode.ts!");
