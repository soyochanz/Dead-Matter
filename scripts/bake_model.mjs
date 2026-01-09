import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Argument processing
const targetDir = process.argv[2];
if (!targetDir) {
    console.error("Usage: node scripts/bake_model.mjs <relative_path_to_model_folder>");
    process.exit(1);
}

const BASE_PATH = path.resolve(process.cwd(), targetDir);

async function bakeModel() {
    console.log(`Processing folder: ${BASE_PATH}`);

    // 1. Find the GLB file
    const files = fs.readdirSync(BASE_PATH);
    const glbFile = files.find(f => f.endsWith('.glb'));
    if (!glbFile) {
        console.error("No .glb file found in the target directory.");
        return;
    }
    const modelPath = path.join(BASE_PATH, glbFile);
    console.log(`Found model: ${glbFile}`);

    // 2. Find and parse material.json
    const materialJsonPath = path.join(BASE_PATH, 'Materials', 'material.json');
    if (!fs.existsSync(materialJsonPath)) {
        console.error("No Materials/material.json found.");
        return;
    }
    const materialConfig = JSON.parse(fs.readFileSync(materialJsonPath, 'utf8'));
    console.log("Loaded material configuration.");

    // 3. Initialize GLTF I/O
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
    const doc = await io.read(modelPath);
    const root = doc.getRoot();

    // 4. Texture Loader Helper
    const loadTex = (texName) => {
        if (!texName) return null;

        // Handle texture name cleaning (stripping path/extension if needed from JSON)
        let cleanName = path.basename(texName);
        if (!cleanName.endsWith('.png')) cleanName += '.png';

        // Search paths: Textures/ and Textures/Unique/
        const searchPaths = [
            path.join(BASE_PATH, 'Textures', cleanName),
            path.join(BASE_PATH, 'Textures', 'Unique', cleanName)
        ];

        for (const p of searchPaths) {
            if (fs.existsSync(p)) {
                console.log(`  Found texture: ${cleanName}`);
                return doc.createTexture(cleanName)
                    .setImage(fs.readFileSync(p))
                    .setMimeType('image/png');
            }
        }
        console.warn(`  Warning: Texture not found ${cleanName}`);
        return null;
    };

    // 5. Load standard textures from JSON
    const textures = materialConfig.Textures || {};
    const albedoEnv = loadTex(textures.Albedo || textures.PM_Diffuse);
    const normalEnv = loadTex(textures.Normal || textures.PM_Normals);
    const rmaEnv = loadTex(textures.RMA || textures.PM_SpecularMasks);

    // 6. Apply to Materials
    const materials = root.listMaterials();
    for (const mat of materials) {
        const matName = mat.getName();
        console.log(`Applying to material: ${matName}`);

        if (albedoEnv) mat.setBaseColorTexture(albedoEnv);
        if (normalEnv) mat.setNormalTexture(normalEnv);
        if (rmaEnv) mat.setMetallicRoughnessTexture(rmaEnv);

        // Standardize PBR defaults for baked look
        mat.setBaseColorFactor([1, 1, 1, 1]);

        // Logic for specific types (Glass vs Fabric/Standard)
        if (matName.toLowerCase().includes('glass')) {
            mat.setAlphaMode('BLEND');
            mat.setDoubleSided(true);
            mat.setTransmissionFactor(1.0);
            mat.setRoughnessFactor(0.1);
            mat.setMetallicFactor(0.0);
        } else {
            // Default "Fabric/Standard" look
            mat.setMetallicFactor(0.0); // Non-metallic (like backpack fabric)
            mat.setRoughnessFactor(0.8);
            mat.setDoubleSided(true); // Safe default for game assets
        }
    }

    // 7. Write back
    await io.write(modelPath, doc);
    console.log(`Success! Baked textures into ${glbFile}`);
}

bakeModel().catch(err => console.error(err));
