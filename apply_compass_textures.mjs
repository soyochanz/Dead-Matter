import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_PATH = 'public/assets/models/Compass';
const TXT_PATH = path.join(BASE_PATH, 'Textures');

async function applyCompassTextures() {
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
    const modelPath = path.resolve(process.cwd(), path.join(BASE_PATH, 'SM_Compass.glb'));

    try {
        console.log(`Processing Compass: ${modelPath}`);
        const doc = await io.read(modelPath);
        const root = doc.getRoot();

        // Remove vertex colors for flat look
        for (const mesh of root.listMeshes()) {
            for (const prim of mesh.listPrimitives()) {
                if (prim.getAttribute('COLOR_0')) prim.setAttribute('COLOR_0', null);
            }
        }

        const materials = root.listMaterials();
        const loadTex = (name) => {
            const p = path.resolve(process.cwd(), TXT_PATH, name);
            if (fs.existsSync(p)) {
                return doc.createTexture(name).setImage(fs.readFileSync(p)).setMimeType('image/png');
            }
            return null;
        };

        const compassBase = loadTex('T_Compass_basecolor.png');
        const compassNormal = loadTex('T_Compass_normal.png');
        const compassORM = loadTex('T_Compass_R_AO_M_H.png');
        const compassEmissive = loadTex('T_Compass_emissive.png');

        const glassBase = loadTex('T_SharedCover_basecolor.png');
        const glassNormal = loadTex('T_SharedCover_normal.png');
        const glassORM = loadTex('T_SharedCover_R_AO_M_H.png');

        for (const mat of materials) {
            const name = mat.getName().toLowerCase();
            console.log(`- Material: ${name}`);

            if (name.includes('glass') || name.includes('cover')) {
                if (glassBase) mat.setBaseColorTexture(glassBase);
                if (glassNormal) mat.setNormalTexture(glassNormal);
                mat.setAlphaMode('BLEND');
                mat.setAlphaCutoff(0.5);
                mat.setDoubleSided(true);
                mat.setRoughnessFactor(0.2); // Glass is smoother
                mat.setMetallicFactor(0.0);
            } else {
                if (compassBase) mat.setBaseColorTexture(compassBase);
                if (compassNormal) mat.setNormalTexture(compassNormal);
                if (compassEmissive) {
                    mat.setEmissiveTexture(compassEmissive);
                    mat.setEmissiveFactor([1, 1, 1]);
                }

                // Flat Inventory Look for the compass body
                mat.setBaseColorFactor([1, 1, 1, 1]);
                mat.setMetallicFactor(0.0);
                mat.setRoughnessFactor(0.8);
            }
        }

        await io.write(modelPath, doc);
        console.log('Compass GLB updated with textures and matte look.');
    } catch (e) {
        console.error('Error processing compass:', e);
    }
}

applyCompassTextures();
