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

    // --- 1. BULLET ---
    try {
        const bulletModelPath = path.resolve(process.cwd(), 'public/assets/models/SM_cal9mm_Full.glb');
        console.log(`Processing Bullet: ${bulletModelPath}`);
        const doc = await io.read(bulletModelPath);
        const root = doc.getRoot();
        const materials = root.listMaterials();

        const bulletTexDir = path.resolve(process.cwd(), TXT_PATH, 'SmallCalibres');
        const loadBulletTex = (name) => {
            const p = path.join(bulletTexDir, name);
            if (fs.existsSync(p)) return doc.createTexture(name).setImage(fs.readFileSync(p)).setMimeType('image/png');
            return null;
        };

        const bulletAlbedo = loadBulletTex('SmallCalibres_albedo.png');
        const bulletNormal = loadBulletTex('SmallCalibres_normal.png');
        const bulletRough = loadBulletTex('SmallCalibres_roughness.png');
        const bulletMetal = loadBulletTex('SmallCalibres_metallic.png');
        const bulletAO = loadBulletTex('SmallCalibres_ao.png');

        for (const mat of materials) {
            console.log(`- Applying to mat: ${mat.getName()}`);
            if (bulletAlbedo) mat.setBaseColorTexture(bulletAlbedo);
            if (bulletNormal) mat.setNormalTexture(bulletNormal);
            // We apply them but keep the "Flat" factors
            mat.setBaseColorFactor([1, 1, 1, 1]);
            mat.setMetallicFactor(0.0); // Flat look
            mat.setRoughnessFactor(0.8); // Matte
        }
        await io.write(bulletModelPath, doc);
        console.log('Bullet updated.');
    } catch (e) { console.error('Error Bullet:', e); }

    // --- 2. BOX ---
    try {
        const boxModelPath = path.resolve(process.cwd(), 'public/assets/models/SM_cal9mm_PaperBoxClosed.glb');
        console.log(`Processing Box: ${boxModelPath}`);
        const doc = await io.read(boxModelPath);
        const root = doc.getRoot();
        const materials = root.listMaterials();

        const boxTexDir = path.resolve(process.cwd(), TXT_PATH, 'PaperBox');
        const loadBoxTex = (name) => {
            const p = path.join(boxTexDir, name);
            if (fs.existsSync(p)) return doc.createTexture(name).setImage(fs.readFileSync(p)).setMimeType('image/png');
            return null;
        };

        const boxAlbedo = loadBoxTex('PaperBox_albedo.png');
        const boxNormal = loadBoxTex('PaperBox_normal.png');
        const labelAlbedo = loadBoxTex('cal9mm_PaperBox_Label_albedo.png');
        const labelNormal = loadBoxTex('PaperBox_Label_normals.png');

        for (const mat of materials) {
            const name = mat.getName().toLowerCase();
            console.log(`- Applying to mat: ${mat.getName()}`);

            if (name.includes('label')) {
                if (labelAlbedo) mat.setBaseColorTexture(labelAlbedo);
                if (labelNormal) mat.setNormalTexture(labelNormal);
            } else {
                if (boxAlbedo) mat.setBaseColorTexture(boxAlbedo);
                if (boxNormal) mat.setNormalTexture(boxNormal);
            }

            mat.setBaseColorFactor([1, 1, 1, 1]);
            mat.setMetallicFactor(0.0);
            mat.setRoughnessFactor(0.8);
        }
        await io.write(boxModelPath, doc);
        console.log('Box updated.');
    } catch (e) { console.error('Error Box:', e); }
}

applyAmmoTextures();
