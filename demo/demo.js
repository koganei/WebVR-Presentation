(function() {
  var mesh, camera, scene, renderer, renderCanvas;
  var vrHMD, vrHMDSensor;

  window.addEventListener("load", function() {

    if (navigator.getVRDevices) { // Chrome: promise
      navigator.getVRDevices().then(vrDeviceCallback);

    } else if (navigator.mozGetVRDevices) { // FF: callback
      navigator.mozGetVRDevices(vrDeviceCallback);

    }
  }, false);

  var vrDeviceCallback = function(vrdevs) {

    var isHMD =  function(device) {
      return device instanceof HMDVRDevice;
    };

    var isSensorOfHMD = function(hmd, device) {
      return device instanceof PositionSensorVRDevice &&
        device.hardwareUnitId === hmd.hardwareUnitId;
    };

    var hmds = vrdevs.filter(isHMD); // hmds = [HMDVRDevice]

    // for each hmd, we find its sensors
    var sensors = hmds.map(function(hmd) {
      return vrdevs.filter(function(device) {
        return isSensorOfHMD(hmd, device);
      });
    }); // sensors = [PositionSensorVRDevice]

    vrHMD = hmds[0];
    vrHMDSensor = sensors[0][0];

    console.log(vrHMD);
    console.log(vrHMDSensor);

    initScene();
    initRenderer();
    render();
  };

  function initScene() {
    camera = new THREE.PerspectiveCamera(60, 1280 / 800, 0.001, 10);
    camera.position.z = 2;
    scene = new THREE.Scene();
    var geometry = new THREE.IcosahedronGeometry(1, 1);
    var material = new THREE.MeshNormalMaterial();
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -2;
    scene.add(mesh);
  }

  function initRenderer() {
    renderCanvas = document.getElementById("render-canvas");
    renderer = new THREE.WebGLRenderer({
      canvas: renderCanvas
    });
    renderer.setClearColor(0x555555);
    renderer.setSize(1280, 800, false);
    vrrenderer = new THREE.VRRenderer(renderer, vrHMD);
  }

  function render() {
    requestAnimationFrame(render);
    mesh.rotation.y += 0.01;
    var state = vrHMDSensor.getState();

    camera.quaternion.set(state.orientation.x,
      state.orientation.y,
      state.orientation.z,
      state.orientation.w);

    if(state.position) camera.position.set(state.position.x,
          state.position.y,
          state.position.z);

    vrrenderer.render(scene, camera);
  }

  window.addEventListener("keypress", function(e) {
    if (e.charCode == 'f'.charCodeAt(0)) {
      if (renderCanvas.mozRequestFullScreen) {
        renderCanvas.mozRequestFullScreen({
          vrDisplay: vrHMD
        });
      } else if (renderCanvas.webkitRequestFullscreen) {
        renderCanvas.webkitRequestFullscreen({
          vrDisplay: vrHMD
        });
      }
    }
  }, false);

}());
