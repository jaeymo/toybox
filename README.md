# Toybox
Toybox scans a Roblox asset hierarchy and produces a Rojo-compatible mapping so your assets are statically represented in your project configuration.

### Usage
Start the Toybox server:
```console
toybox serve --project toybox.generated.json
```
Then click a directory in Roblox Studio with the plugin and hit "Watch". Your changes will now sync!

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
