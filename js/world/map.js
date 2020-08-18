let completeTerrain = new THREE.Group();
function loadTerrain(posX, posY, posZ) {
    let terrainScene, decoratedTerrain, blend;
    let loader = new THREE.TextureLoader();

    loader.load('./res/terrain/grass1.jpg', function (grass) {
        loader.load('./res/terrain/stone1.jpg', function (stone) {
            blend = THREE.Terrain.generateBlendedMaterial([
                {texture: grass},
                {texture: grass, levels: [-80, -35, 20, 50]},
                {texture: stone, levels: [23, 24, 25, 25]},
                {texture: stone, glsl: '1.0 - smoothstep(65.0 + smoothstep(-256.0, 256.0, vPosition.x) * 10.0, 80.0, vPosition.z)'},
                {texture: stone, glsl: 'slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2'},
            ]);

            // Number of tiles per terrain chunk
            var tileAmount = 5;
            terrainScene = THREE.Terrain({ 
                easing: THREE.Terrain.EaseOut,
                frequency: 1.5,
                heightmap: THREE.Terrain.DiamondSquare,
                material: blend, //new THREE.MeshPhongMaterial({ color: 0x57e637, emissive: 0x000000, specular: 0x111111, shininess: 10 }),
                maxHeight: 25,
                minHeight: -30,
                steps: 1,
                useBufferGeometry: false,
                xSegments: tileAmount,
                xSize: 1000,
                ySegments: tileAmount,
                ySize: 1000,
            });

            terrainScene.position.set(posX, posY, posZ);

            loadOBJMesh("TestTree", "test", function(loadedObj) {
                let treeMesh = loadedObj.children[0];

                //loadEntities(1000, posX, posY, posZ, terrainScene, treeMesh);

                let treeScale = Math.random() * (20 - 15) + 15;

                treeMesh.scale.set(treeScale, treeScale, treeScale);
                treeMesh.name = "TestTree";
                treeMesh.userData.tag = "selectable";

                let terrainGeometry = terrainScene.children[0].geometry;
                terrainGeometry.computeBoundingBox();

                decoratedTerrain = THREE.Terrain.ScatterMeshes(terrainGeometry, {
                    mesh: treeMesh,
                    w: tileAmount,
                    h: tileAmount,
                    sizeVariance: 0,
                    spread: 0.002,
                    randomness: Math.random,  
                });

                terrainScene.add(decoratedTerrain);
                completeTerrain.add(terrainScene)
                worldMapScene.add(completeTerrain);
            });

        });
    });
}

function loadEntities(mapSize, posX, posY, posZ, terrain, loadedObject) {
    let mapObjects = [];
    let entitySize = 1;

    for(let x = 0; x < (mapSize / entitySize); x++) {
        for(let z = 0; z < (mapSize / entitySize); z++) {
            let clonedObj = loadedObject.clone();
            clonedObj.position.copy((x * entitySize), 0, (x * entitySize));
            clonedObj.rotation.x += 90 / 180 * Math.PI;
            clonedObj.rotateY(Math.random() * 2 * Math.PI);
            mapObjects.push(clonedObj);
        }
    }

    let k, l;
    let g = new THREE.Geometry();
    for (k = 0, l = mapObjects.length; k < l; k++) {
        let m = mapObjects[k];
        m.updateMatrix();
        g.merge(m.geometry, m.matrix);
    }

    worldMapScene.add(new THREE.Mesh(g, loadedObject.material));
}