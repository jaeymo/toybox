import fs from "fs";
import { XMLParser } from "fast-xml-parser";

interface AssetNode {
    name: string;
    className: string;
    children?: Record<string, AssetNode>;
}

function getItemName(item: any): string | null {
    if (!item.Properties || !item.Properties.string) return null;

    const strings = Array.isArray(item.Properties.string)
        ? item.Properties.string
        : [item.Properties.string];

    for (const str of strings) {
        if (str.name === "Name") {
            if (typeof str === "string") return str;
            if ("#text" in str) return str["#text"];
        }
    }

    return null;
}

function findFolderByName(item: any, name: string): any | null {
    const itemName = getItemName(item);
    if (itemName === name) return item;

    const children = item.Item
        ? Array.isArray(item.Item)
            ? item.Item
            : [item.Item]
        : [];
    for (const child of children) {
        const found = findFolderByName(child, name);
        if (found) return found;
    }

    return null;
}

function traverse(item: any): AssetNode {
    const name = getItemName(item) || "Unnamed";
    const node: AssetNode = {
        name,
        className: item.class,
        children: {},
    };

    const children = item.Item
        ? Array.isArray(item.Item)
            ? item.Item
            : [item.Item]
        : [];
    for (const child of children) {
        const childNode = traverse(child);
        node.children![childNode.name] = childNode;
    }

    return node;
}

function toRojo(node: AssetNode): Record<string, any> {
    const result: Record<string, any> = { $className: node.className };
    if (node.children && Object.keys(node.children).length > 0) {
        for (const [name, child] of Object.entries(node.children)) {
            result[name] = toRojo(child as AssetNode);
        }
    }
    return result;
}

export function buildTreeFromRbxlx(
    filePath: string,
    rootName: string,
): Record<string, any> {
    const xmlData = fs.readFileSync(filePath, "utf-8");
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
    });
    const jsonObj = parser.parse(xmlData);

    const items = Array.isArray(jsonObj.roblox.Item)
        ? jsonObj.roblox.Item
        : [jsonObj.roblox.Item];
    const rootItem = findFolderByName({ Item: items }, rootName);
    if (!rootItem) throw new Error(`Folder '${rootName}' not found in .rbxlx`);

    const rootNode = traverse(rootItem);
    return { [rootNode.name]: toRojo(rootNode) };
}

export function generateMapping(
    input: string,
    rojoPath: string,
    folderName: string,
) {
    if (!fs.existsSync(input)) {
        console.error("Input file does not exist");
        process.exit(1);
    }

    if (!fs.existsSync(rojoPath)) {
        console.error("Rojo project file does not exist");
        process.exit(1);
    }

    const project = JSON.parse(fs.readFileSync(rojoPath, "utf-8"));
    if (!project.tree || !project.tree.ReplicatedStorage) {
        console.error(
            "Invalid Rojo project structure (is there a ReplicatedStorage?)",
        );
        process.exit(1);
    }

    const mapping = buildTreeFromRbxlx(input, folderName);
    project.tree.ReplicatedStorage[folderName] = mapping[folderName];
    fs.writeFileSync(rojoPath, JSON.stringify(project, null, 4));
    console.log(`Mapping generated for '${folderName}'`);
}
