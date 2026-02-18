import express from "express";
import fs from "fs";
import path from "path";

interface AssetNode {
    name: string;
    className: string;
    children: AssetNode[];
}

interface SyncPayload {
    parentService?: string;
    node: AssetNode;
}

function toRojo(node: AssetNode): any {
    const result: Record<string, any> = {
        $className: node.className,
    };

    for (const child of node.children) {
        result[child.name] = toRojo(child);
    }

    return result;
}

export function startServer(projectPath: string) {
    if (!fs.existsSync(projectPath)) {
        console.error("Rojo project file not found.");
        process.exit(1);
    }

    const projectDir = path.dirname(projectPath);
    const outputPath = path.join(projectDir, "toybox.generated.json");

    const app = express();
    app.use(express.json());

    app.post("/sync", (req, res) => {
        const body: SyncPayload = req.body;

        if (!body?.node) {
            console.error("Invalid payload.");
            return res.sendStatus(400);
        }

        const root = body.node;

        console.log(`Received root: ${root.name}`);

        const mapping = {
            [root.name]: toRojo(root),
        };

        const newContent = JSON.stringify(mapping, null, 4);

        if (fs.existsSync(outputPath)) {
            const existing = fs.readFileSync(outputPath, "utf-8");
            if (existing === newContent) {
                console.log("No changes detected. Skipping write.");
                return res.sendStatus(200);
            }
        }

        fs.writeFileSync(outputPath, newContent);

        console.log("Updated toybox.generated.json");
        res.sendStatus(200);
    });

    app.listen(3000, () => {
        console.log("Toybox server running on http://localhost:3000");
        console.log("Output file:", outputPath);
    });
}
