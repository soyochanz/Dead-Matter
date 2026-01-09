import React, { useEffect, useRef } from 'react';

/**
 * Shared 3D Model Viewer for Wiki Items
 * Automatically applies textures from /textures or /Textures subfolders using a material.json or [ModelName].json file.
 */
const Wiki3DViewer = ({
    src,
    alt,
    className = '',
    exposure = 1,
    shadowIntensity = "0.2",
    shadowSoftness = "1",
    fieldOfView = "35deg",
    ...props
}) => {
    const modelViewerRef = useRef(null);

    useEffect(() => {
        if (!src || !modelViewerRef.current) return;

        const applyTextures = async () => {
            const modelViewer = modelViewerRef.current;

            // Wait for model load
            if (!modelViewer.model) {
                modelViewer.addEventListener('load', applyTextures, { once: true });
                return;
            }

            try {
                // Derive base folder and filename from src
                const urlParts = src.split('/');
                const fileNameWithExt = urlParts.pop();
                const fileName = fileNameWithExt.split('.')[0];
                const baseDir = urlParts.join('/') + '/';

                // Flexible material JSON lookup
                const possibleJsonPaths = [
                    `${baseDir}material.json`,
                    `${baseDir}${fileName}.json`,
                    `${baseDir}Materials/material.json`,
                    `${baseDir}Materials/${fileName}.json`,

                ];

                let materialData = null;
                for (const path of possibleJsonPaths) {
                    try {
                        const response = await fetch(path);
                        if (response.ok) {
                            materialData = await response.json();
                            console.log(`[Wiki3DViewer] Found material configuration at: ${path}`);
                            break;
                        }
                    } catch (e) {
                        // Continue to next path
                    }
                }

                if (!materialData || !materialData.Textures) {
                    console.log(`[Wiki3DViewer] No valid material configuration found for ${src}, using model defaults.`);
                    return;
                }

                const textures = materialData.Textures;
                const material = modelViewer.model.materials[0];
                if (!material) return;

                // Load textures helper - checks both 'textures' and 'Textures' subfolders
                const loadAndSet = async (textureName, setter) => {
                    if (textureName) {
                        // Extract filename from Unreal-style path
                        // e.g. "path/to/Texture.Texture" -> "Texture.png"
                        let fileName = textureName;
                        if (fileName.includes('.')) {
                            fileName = fileName.split('.').pop();
                        }
                        // Add .png extension if not present
                        if (!fileName.toLowerCase().endsWith('.png')) {
                            fileName += '.png';
                        }

                        // Try common texture subfolders
                        const subfolders = ['textures/', 'Textures/', ''];
                        for (const folder of subfolders) {
                            const fullUrl = `${baseDir}${folder}${fileName}`;
                            try {
                                const texture = await modelViewer.createTexture(fullUrl);
                                if (texture) {
                                    setter(texture);
                                    return; // Success
                                }
                            } catch (e) {
                                // Try next folder
                            }
                        }
                        console.warn(`[Wiki3DViewer] Failed to load texture: ${textureName}`);
                    }
                };

                // Mapping based on standard naming (Albedo/Diffuse, Normal, RMA/SpecularMasks)

                // Albedo / Base Color
                const albedoPath = textures.Albedo || textures.PM_Diffuse || textures.Diffuse;
                if (albedoPath) {
                    await loadAndSet(albedoPath, (t) => {
                        if (material.pbrMetallicRoughness.baseColorTexture) {
                            material.pbrMetallicRoughness.baseColorTexture.setTexture(t);
                        }
                    });
                }

                // Normal Map
                const normalPath = textures.Normal || textures.PM_Normals;
                if (normalPath) {
                    await loadAndSet(normalPath, (t) => {
                        if (material.normalTexture) {
                            material.normalTexture.setTexture(t);
                        }
                    });
                }

                // RMA (Roughness, Metallic, AO)
                const rmaPath = textures.RMA || textures.PM_SpecularMasks;
                if (rmaPath) {
                    await loadAndSet(rmaPath, (t) => {
                        if (material.pbrMetallicRoughness.metallicRoughnessTexture) {
                            material.pbrMetallicRoughness.metallicRoughnessTexture.setTexture(t);
                        }
                    });
                }

            } catch (error) {
                console.error("[Wiki3DViewer] Error in automatic texture application:", error);
            }
        };

        applyTextures();
    }, [src]);

    return (
        <model-viewer
            ref={modelViewerRef}
            src={src}
            alt={alt}
            auto-rotate
            camera-controls
            shadow-intensity={shadowIntensity}
            shadow-softness={shadowSoftness}
            exposure={exposure}
            environment-image="neutral"
            tone-mapping="neutral"
            render-scale="2"
            field-of-view={fieldOfView}
            interaction-prompt="none"
            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
            className={`relative z-10 ${className}`}
            {...props}
        />
    );
};


export default Wiki3DViewer;
