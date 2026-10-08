import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
const server = new McpServer({
    name: "gdevelop-mcp-server",
    version: "1.0.0",
});
server.tool("read-project", "Inspects a GDevelop project file (.json) or folder layout and returns structure data.", {
    projectPath: z.string().describe("Absolute path to the project.json or project folder"),
}, async ({ projectPath }) => {
    try {
        let targetFile = projectPath;
        if (fs.statSync(projectPath).isDirectory()) {
            targetFile = path.join(projectPath, "project.json");
        }
        if (!fs.existsSync(targetFile)) {
            return { content: [{ type: "text", text: `Error: Could not find project file at ${targetFile}` }] };
        }
        const rawData = fs.readFileSync(targetFile, "utf-8");
        const project = JSON.parse(rawData);
        const summary = {
            name: project.properties?.name || "Untitled Game",
            orientation: project.properties?.orientation,
            layoutCount: project.layouts?.length || 0,
            scenes: project.layouts?.map((l) => l.name) || [],
        };
        return {
            content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
        };
    }
    catch (error) {
        return { content: [{ type: "text", text: `Failed to read GDevelop project: ${error.message}` }] };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
