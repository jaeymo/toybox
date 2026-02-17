#!/usr/bin/env node

import { Command } from "commander";
import { generateMapping } from "./generator.js";

const program = new Command();

program
    .name("toybox")
    .description("Generate rojo mappings from a Roblox directory")
    .version("1.0.0");

program
    .command("generate")
    .requiredOption("-i, --input <path>", "Input roblox directory")
    .option("-f, --folder <name>", "Folder inside Roblox to map", "Asset")
    .requiredOption("-o, --output <path>", "Path to .project.json")
    .action((options) => {
        generateMapping(options.input, options.output, options.folder);
    });

program.parse(process.argv);
