#!/usr/bin/env node
import { Command } from "commander";
import { startServer } from "./server.js";

const program = new Command();

program
    .name("toybox")
    .description("Generate rojo mappings from a Roblox directory")
    .version("1.0.0");

program
    .command("serve")
    .description("Start Toybox server")
    .requiredOption("-p, --project <path>", "Path to .project.json")
    .action((options) => {
        startServer(options.project);
    });

program.parse(process.argv);
