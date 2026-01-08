import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_PATH = 'public/assets/models/Ammo';
const TXT_PATH = path.join(BASE_PATH, 'Textures/Ammo');

async function applyAmmoTextures() {
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

    const bulletPath = 'public/assets/models/SM_cal9mm_Full.glb';
    const boxPath = 'public/assets/models/SM_cal9mm_PaperBoxClosed.glb';

    for (const modelRelPath of [bulletPath, boxPath]) {
        try {
            const modelPath = path.resolve(process.cwd(), modelRelPath);
            console.log(`Processing: ${modelPath}`);
            const doc = await io.read(modelPath);
            const root = doc.getRoot();

            // Remove vertex colors
            for (const mesh of root.listMeshes()) {
                for (const prim of mesh.listPrimitives()) {
                    if (prim.getAttribute('COLOR_0')) prim.setAttribute('COLOR_0', null);
                }
            }

            const materials = root.listMaterials();
            const isBox = modelRelPath.includes('Box');
            const texDir = path.resolve(process.cwd(), TXT_PATH, isBox ? 'PaperBox' : 'SmallCalibres');

            const loadTex = (name) => {
                const p = path.join(texDir, name);
                if (fs.existsSync(p)) return doc.createTexture(name).setImage(fs.readFileSync(p)).setMimeType('image/png');
                return null;
            };

            for (const mat of materials) {
                const name = mat.getName().toLowerCase();
                if (isBox) {
                    if (name.includes('label')) {
                        const albedo = loadTex('cal9mm_PaperBox_Label_albedo.png');
                        const normal = loadTex('PaperBox_Label_normals.png');
                        if (albedo) mat.setBaseColorTexture(albedo);
                        if (normal) mat.setNormalTexture(normal);
                    } else {
                        const albedo = loadTex('PaperBox_albedo.png');
                        const normal = loadTex('PaperBox_normal.png');
                        if (albedo) mat.setBaseColorTexture(albedo);
                        if (normal) mat.setNormalTexture(normal);
                    }
                } else {
                    const albedo = loadTex('SmallCalibres_albedo.png');
                    const normal = loadTex('SmallCalibres_normal.png');
                    if (albedo) mat.setBaseColorTexture(albedo);
                    if (normal) mat.setNormalTexture(normal);
                }

                mat.setBaseColorFactor([1, 1, 1, 1]);
                mat.setMetallicFactor(0.0);
                mat.setRoughnessFactor(0.8);
            }
            await io.write(modelPath, doc);
            console.log(`Updated ${modelRelPath}`);
        } catch (e) { console.error(`Error ${modelRelPath}:`, e); }
    }
}

applyAmmoTextures();
