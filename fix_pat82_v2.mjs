import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixPat82() {
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
    const modelPath = path.resolve(process.cwd(), 'public/assets/models/SM_PAT82M_Hat.glb');
    const textureDir = path.resolve(process.cwd(), 'public/assets/models/PAT82');

    try {
        console.log(`Loading model from ${modelPath}...`);
        const document = await io.read(modelPath);
        const root = document.getRoot();

        // 1. Remove all vertex colors as they might be black/wrong and multiplying with texture
        const meshes = root.listMeshes();
        for (const mesh of meshes) {
            for (const prim of mesh.listPrimitives()) {
                if (prim.getAttribute('COLOR_0')) {
                    console.log(`Removing vertex colors from mesh: ${mesh.getName()}`);
                    prim.setAttribute('COLOR_0', null);
                }
            }
        }

        // 2. Fix materials
        const materials = root.listMaterials();
        for (const material of materials) {
            console.log(`Fixing material: ${material.getName()}`);

            const loadTexture = (name) => {
                const p = path.join(textureDir, name);
                if (fs.existsSync(p)) {
                    return document.createTexture(name).setImage(fs.readFileSync(p)).setMimeType('image/png');
                }
                return null;
            };

            const baseColorTex = loadTexture('T_pat82_hat_BaseColor.png');
            const normalTex = loadTexture('T_pat82_hat_Normal.png');
            const ormTex = loadTexture('T_pat82_hat_OcclusionRoughnessMetallic.png');

            if (baseColorTex) {
                material.setBaseColorTexture(baseColorTex);
            }
            if (normalTex) {
                material.setNormalTexture(normalTex);
            }
            if (ormTex) {
                material.setMetallicRoughnessTexture(ormTex);
                material.setOcclusionTexture(ormTex);
            }

            // Clean factors
            material.setBaseColorFactor([1, 1, 1, 1]);
            material.setMetallicFactor(0.0); // Hats are not metal
            material.setRoughnessFactor(1.0); // Use texture roughness

            // Just in case double-sided is needed for a hat
            material.setDoubleSided(true);
        }

        await io.write(modelPath, document);
        console.log(`Successfully fixed ${modelPath}`);

    } catch (error) {
        console.error('Error fixing textures:', error);
    }
}

fixPat82();
