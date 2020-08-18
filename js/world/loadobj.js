let loadOBJMesh = function(name, path, onObj) {
    let mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath("./res/models/" + path + "/");

    mtlLoader.load(name + ".mtl", function(materials) {
        materials.preload();

        let objLoader = new THREE.OBJLoader();
        objLoader.setPath("./res/models/" + path + "/");
        objLoader.setMaterials(materials);

        objLoader.load(name + ".obj", function(object) {
            object.name = name;
            object.position.set(0, 0, 0);
            object.scale.set(20, 20, 20);

            for(let i = 0; i < object.children; i++) {
                object.children[i].geometry.computeBoundingBox();
            }

            onObj(object);
        });
    });
}