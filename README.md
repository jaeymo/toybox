# Toybox
Toybox scans a Roblox asset hierarchy and produces a Rojo mapping so all of your assets are statically represented

### Usage
Run the CLI to generate a Rojo mapping from Roblox `.rbxlx` file:
```console
node dist/cli.js generate -i ./toybox-test.rbxlx -o ./default.project.json -f Assets
```
- `-i` / --input – Path to the `.rbxlx` file.
- `-o` / --output – Path to your `.project.json` file.
- `-f` / --folder – Name of the folder in ReplicatedStorage to map (default: Assets).

### Example
If your ReplicatedStorage contains:
```JSON
ReplicatedStorage
└── Assets
    ├── Models
    └── SomeModel
```

Running the command would produce:
```JSON
"Asset": {
    "$className": "Folder",
    "Models": {
        "$className": "Folder",
        "SomeModel": {
            "$className": "Model",
        }
    },
}
```
