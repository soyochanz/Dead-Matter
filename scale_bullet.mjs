import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import path from 'path';

async function scaleBullet() {
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
    const modelPath = path.resolve(process.cwd(), 'public/assets/models/SM_cal9mm_Full.glb');

    try {
        console.log(`Scaling ${modelPath}...`);
        const doc = await io.read(modelPath);
        const root = doc.getRoot();

        // Target scale: 0.6 (40% smaller)
        const scale = 0.6;

        for (const node of root.listNodes()) {
            // Apply scale to root-level nodes or all nodes
            const currentScale = node.getScale();
            node.setScale([currentScale[0] * scale, currentScale[1] * scale, currentScale[2] * scale]);
        }

        await io.write(modelPath, doc);
        console.log('Bullet model scaled by 0.6');
    } catch (e) {
        console.error('Error scaling bullet:', e);
    }
}

scaleBullet();
