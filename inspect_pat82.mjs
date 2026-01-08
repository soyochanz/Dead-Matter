import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import path from 'path';

async function inspect() {
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
    const modelPath = path.resolve(process.cwd(), 'public/assets/models/SM_PAT82M_Hat.glb');

    try {
        const document = await io.read(modelPath);
        const root = document.getRoot();
        const materials = root.listMaterials();

        console.log(`Model: ${modelPath}`);
        console.log(`Materials found: ${materials.length}`);

        materials.forEach((mat, i) => {
            console.log(`\nMaterial ${i}: ${mat.getName()}`);
            console.log(`- BaseColorTexture: ${mat.getBaseColorTexture() ? mat.getBaseColorTexture().getName() : 'NONE'}`);
            console.log(`- BaseColorFactor: ${mat.getBaseColorFactor()}`);
            console.log(`- NormalTexture: ${mat.getNormalTexture() ? mat.getNormalTexture().getName() : 'NONE'}`);
            console.log(`- MetallicRoughnessTexture: ${mat.getMetallicRoughnessTexture() ? mat.getMetallicRoughnessTexture().getName() : 'NONE'}`);
        });

        const meshes = root.listMeshes();
        meshes.forEach((mesh, i) => {
            console.log(`\nMesh ${i}: ${mesh.getName()}`);
            mesh.listPrimitives().forEach((prim, j) => {
                const mat = prim.getMaterial();
                console.log(`  Primitive ${j} material: ${mat ? mat.getName() : 'NONE'}`);
            });
        });

    } catch (error) {
        console.error('Error inspecting:', error);
    }
}

inspect();
