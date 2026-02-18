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

function getOrCreate(obj: any, key: string) {
    if (!obj[key]) obj[key] = {};
    return obj[key];
}

export function startServer(projectPath: string) {
    if (!fs.existsSync(projectPath)) {
        console.error("Rojo project file not found.");
        process.exit(1);
    }

    const projectDir = path.dirname(projectPath);

    const app = express();
    app.use(express.json());

    app.post("/sync", (req, res) => {
        const body: SyncPayload = req.body;

        if (!body?.node) {
            console.error("Invalid payload.");
            return res.sendStatus(400);
        }

        const root = body.node;
        const tree = toRojo(root);

        const projectFile = fs.readFileSync(projectPath, "utf-8");
        const projectJSON = JSON.parse(projectFile);

        let parent: any;
        if (body.parentService) {
            parent = getOrCreate(projectJSON.tree, body.parentService);
            if (!parent.$className) {
                console.warn(
                    `Warning: parent ${body.parentService} has no $className; creating as Folder`,
                );
                parent.$className = "Folder";
            }
        } else {
            parent = projectJSON.tree;
        }

        parent[root.name] = tree;

        fs.writeFileSync(projectPath, JSON.stringify(projectJSON, null, 4));
        console.log(
            `Toybox synced ${root.name} under ${body.parentService || "root"}`,
        );

        res.sendStatus(200);
    });

    app.listen(3000, () => {
        console.log("Toybox server running on http://localhost:3000");
    });
}
