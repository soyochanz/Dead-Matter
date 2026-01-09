import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_PATH = 'public/assets/models/MP_Camping/Schoolbag';
const TXT_PATH = path.join(BASE_PATH, 'Textures/Unique');

async function applyBackpackTextures() {
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
    const modelPath = path.resolve(process.cwd(), path.join(BASE_PATH, 'SM_Bookbag_01a.glb'));

    try {
        console.log(`Processing Backpack: ${modelPath}`);
        if (!fs.existsSync(modelPath)) {
            console.error(`Model file not found at: ${modelPath}`);
            return;
        }

        const doc = await io.read(modelPath);
        const root = doc.getRoot();

        // Texture loader helper
        const loadTex = (name) => {
            const p = path.resolve(process.cwd(), TXT_PATH, name);
            if (fs.existsSync(p)) {
                console.log(`Loading texture: ${name}`);
                return doc.createTexture(name).setImage(fs.readFileSync(p)).setMimeType('image/png');
            }
            console.warn(`Texture not found: ${p}`);
            return null;
        };

        const albedo = loadTex('TX_Bookbag_01a_ALB.png');
        const normal = loadTex('TX_Bookbag_01a_NRM.png');
        const rma = loadTex('TX_Bookbag_01a_RMA.png');

        const materials = root.listMaterials();
        for (const mat of materials) {
            const name = mat.getName();
            console.log(`- Material: ${name}`);

            if (albedo) mat.setBaseColorTexture(albedo);
            if (normal) mat.setNormalTexture(normal);
            if (rma) mat.setMetallicRoughnessTexture(rma);

            // Set PBR factors for fabric (non-metallic, high roughness)
            mat.setBaseColorFactor([1, 1, 1, 1]);
            mat.setMetallicFactor(0.0);
            mat.setRoughnessFactor(0.8);

            // Ensure double sided if needed (backpack might have open parts)
            mat.setDoubleSided(true);
        }

        await io.write(modelPath, doc);
        console.log('Backpack GLB updated with textures permanently.');
    } catch (e) {
        console.error('Error processing backpack:', e);
    }
}

applyBackpackTextures();
