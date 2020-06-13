




// Get reference to Canvas
var canvas = document.getElenentById('canvas');
// Get reference to Canvas Context

var context = canvas.getContext('2d');
// Initialize loading variables

var loading_screen = document.getElementById('loading');



var load_counter = 0;
// Initialize images for layers
var background = new Image();
var clouds = new Image();
var floaties_1 = new Image();
var floaties_2 = new Image();
var shadows = new Image();
var mask = new Image();
var humans = new Image();
var floaties_3 = new Image();
// Create a tist of layer objects
var layer_list = [
      {
         'image': background,
         'src': './backsky.png',
         'z_index': -2.25,
         'position': { x: 0, y: 0 },
         'blend': null,
         'opacity': 1
},
      {
         'image': clouds,
         'src': './moonshad.png',
         'z_index': -2,
         'position': { x: 0, y: 0 },
         'blend': null,
         'opacity': 1
},
      {
         'image': floaties_1,
         'src': './moon.png',
         'z_index': -1.5,
         'position': { x: 0, y: 0 },
         'blend': null,
         'opacity': 1
},
      {
         'image': background,
         'src': './name.png',
         'z_index': -1,
         'position': { x: 0, y: 0 },
         'blend': null,
         'opacity': 1
},
      {
         'image': background,
         'src': './box.png',
         'z_index': 0,
         'position': { x: 0, y: 0 },
         'blend': null,
         'opacity': 1
},
      {
         'image': background,
         'src': './skyshad.png',
         'z_index': 1,
         'position': { x: 0, y: 0 },
         'blend': null,
         'opacity': 1
},
      {
         'image': background,
         'src': './sky.png',
         'z_index': 1.25,
         'position': { x: 0, y: 0 },
         'blend': null,
         'opacity': 1
},
layer_list.forEach(function(layer, index) {
         layer.image.onload - function() {
            load_counter + 1;
            if (load_counter >= layer_list.length) {
               hideLoading;
               requestAnimationFrame(drawCanvas);
            }
         }

         layer.image.src = layer.src;
      });

function hideLoading() {
         loading_screqen.classList.add('hidden')
};


function drawCanvas() {
         // clear whatever is in the canvas
         context.clearRect(0, 0, canvas.width, canvas.height);
         // Loop through each tayer and draw it to the canvas

         TWEEN.update();


         // Calcutate how much the canvas should rotate
         var rotate_x = (pointer.y - 0.15) + (motion.y - 1.2);
         var rotate_y = (pointer.x 0.15) + (motion.x 1.2);
         var transform_string = "rotateX(" + rotate_x + "deg) rotateY(" + rotate_y + "deg)";
         // Actually rotate the canvas canvas.style.transform = transform_string;






         layer_list.forEach(function(layer, index) {
            layer.position = get0ffset(layer);
            if (layer.blend) {
               context.globalComposite0peration = layer.blend;
            } else {
               context.globalCompositeOperation 'normal';
            }
            context.globalAlpha = layer.opacity;
            context.drawImage(layer.image, layer.position.x, layer.position.y);
         });
         requestAnimationFrame(drawCanvas);
}

function get0ffset(layer) {
         var touch_offset_x = pointer.x layer.z_index;
         var touch_offset_y = pointer.y layer.z_index;
         var offset { x: touch_offset_x, y: touch_offset_y };
         return offset;
}
var moving = false;

var pointer_initial = {
         x = 0,
         y = 0
      };
var pointer = {
         x = 0,
         y = 0
      };
canvas.addEventListener('touchstart', pointerStart);
canvas.addEventListener('mousedown', pointerStart);

function pointerStart(event) {
         {
            moving = true;
            if (event.type === 'touchstart') {
               pointer_initial.x = event.touches[0].clientX;
               pointer_initial.y = event.touches[0].clientY;
            } else if (event.type === 'mousedown') {
               pointer_initial.x = event.clientX;
               pointer_initial.y = event.clientY;
            }
         }

         window.addEventListener('touchmove', pointerMove);
         window.addEventListener('mousenove', pointerMove);

         function pointerMove(event) {
            event.preventDefault();
            if (moving === true) {
               var current_x = 0;
               var current_y = 0;
               if (event.type === 'touchmove') {
                  current_x - event.touches[0].clientX;
                  current_y = event.touches[0].clientY;
               } else if (event.type = 'mousemove') {
                  current_x = event.clientX;
                  current_y = event.clientY;
               }
               pointer.x = current_x - pointer_initial.x;
               pointer.y = current_y - pointer_initial.y;
            }
         }
         canvas.addEventListener('touchnove',function(event) {
            event.preventDefault();
         });
         canvas.addEventListener('mousenove', function(event) {
            event.preventDefault();
         })
         window.addEventListener('touchhend', function(event) {
            endGesture();
         })
         window.addEventListener('mouseup', function(event) {
            endGesture();
         });

         function endGesture() {
            moving = false;
            TWEEN.removeAll();
            var pointer_tween = new TWEEN.Tween(pointer).to({ x: 0, y: 0 }, 300).easing(TWEEN.Easing.Back.Out).start();

            //// MOTION CONTROLS//// // Initialize variables for motion-based parallax
            var notion_initial {
                  x: null,
                  y: null
                  var notion = { x: 0, y: 0 };
                  // Listen to gyroscope events
                  window.addEventListener('deviceorientation', function(event)( // if this is the first time through
                        if (!motion_initial.x && !motion_initial.y) {
                           motion_initial.x = event.beta;
                           motion_initial.y = event.gamma;
                           if (window.orientation === 0) {
                              motion.x = event.gama - motion_initial.y;
                              motion.y = event.beta - motion_initial.x;
                           } else if (window.orientation === 90) {
                              motion.x = event.beta - motion_initial.x;
                              motion.y = -event.gama + motion_initial.y;
                           } else if (window.orientation === -90) {
                              motion.x = -event.beta + motion_initial.x;
                              motion.y = event.gama - motion_initial.y;
                           } else {
                              motion.x = -event.gama + motion_initial.x;
                              motion.y = -event.beta + motion_initial.y;
                           }
                        }); window.addEventListener('orientationchange'.function(event) {
                        motion_initial.x = 0;
                        motion_initial.y = 0;
                     })