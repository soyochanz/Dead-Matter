import { NodeIO } from '@gltf-transform/core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimize(filePath) {
    try {
        console.log(`Reading ${filePath}...`);
        const io = new NodeIO();
        const document = await io.read(filePath);

        const materials = document.getRoot().listMaterials();
        console.log(`Found ${materials.length} materials.`);

        for (const material of materials) {
            console.log(`Optimizing material: ${material.getName() || 'unnamed'}`);

            // 1. Reduce roughness to 0.4 (range 0.3 - 0.5)
            material.setRoughnessFactor(0.4);

            // 2. Base Color Factor RGB 1,1,1
            material.setBaseColorFactor([1, 1, 1, 1]);

            // 3. Metallic ≤ 0.2 if not clearly metal
            const currentMetallic = material.getMetallicFactor();
            if (currentMetallic < 0.7) {
                material.setMetallicFactor(0.2);
            }
        }

        await io.write(filePath, document);
        console.log(`Successfully optimized ${filePath}`);
    } catch (error) {
        console.error(`Error optimizing ${filePath}:`, error);
    }
}

const models = [
    'public/assets/models/SM_M9Bayonet.glb',
    'public/assets/models/SM_PAT82M_Hat.glb'
];

(async () => {
    for (const model of models) {
        const fullPath = path.resolve(process.cwd(), model);
        if (fs.existsSync(fullPath)) {
            await optimize(fullPath);
        } else {
            console.error(`File not found: ${fullPath}`);
        }
    }
})();
