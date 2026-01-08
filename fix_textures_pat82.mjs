import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixTextures() {
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
    const modelPath = path.resolve(process.cwd(), 'public/assets/models/SM_PAT82M_Hat.glb');
    const textureDir = path.resolve(process.cwd(), 'public/assets/models/PAT82');

    try {
        console.log(`Loading model from ${modelPath}...`);
        const document = await io.read(modelPath);
        const root = document.getRoot();
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
                // Ensure Base Color Texture is treated as sRGB (default in glTF)
            }
            if (normalTex) {
                material.setNormalTexture(normalTex);
            }
            if (ormTex) {
                // For a hat, we want a matte finish.
                // The ORM texture might have Metallic in the Blue channel.
                // We should probably force metallic factor to 0.0 unless it's strictly needed.
                material.setMetallicRoughnessTexture(ormTex);
                material.setOcclusionTexture(ormTex);
            }

            // CRITICAL: Force non-metallic for cloth
            material.setBaseColorFactor([1, 1, 1, 1]);
            material.setMetallicFactor(0.0);
            material.setRoughnessFactor(1.0); // Use texture roughness 1:1

            console.log(`Applied matte settings to ${material.getName()}`);
        }

        await io.write(modelPath, document);
        console.log(`Successfully fixed ${modelPath}`);

    } catch (error) {
        console.error('Error fixing textures:', error);
    }
}

fixTextures();
