/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */


var _Group = function() {
   this._tweens = {};
   this._tweensAddedDuringUpdate = {};
};

_Group.prototype = {
   getAll: function() {

      return Object.keys(this._tweens).map(function(tweenId) {
         return this._tweens[tweenId];
      }.bind(this));

   },

   removeAll: function() {

      this._tweens = {};

   },

   add: function(tween) {

      this._tweens[tween.getId()] = tween;
      this._tweensAddedDuringUpdate[tween.getId()] = tween;

   },

   remove: function(tween) {

      delete this._tweens[tween.getId()];
      delete this._tweensAddedDuringUpdate[tween.getId()];

   },

   update: function(time, preserve) {

      var tweenIds = Object.keys(this._tweens);

      if (tweenIds.length === 0) {
         return false;
      }

      time = time !== undefined ? time : TWEEN.now();

      // Tweens are updated in "batches". If you add a new tween during an update, then the
      // new tween will be updated in the next batch.
      // If you remove a tween during an update, it may or may not be updated. However,
      // if the removed tween was added during the current batch, then it will not be updated.
      while (tweenIds.length > 0) {
         this._tweensAddedDuringUpdate = {};

         for (var i = 0; i < tweenIds.length; i++) {

            var tween = this._tweens[tweenIds[i]];

            if (tween && tween.update(time) === false) {
               tween._isPlaying = false;

               if (!preserve) {
                  delete this._tweens[tweenIds[i]];
               }
            }
         }

         tweenIds = Object.keys(this._tweensAddedDuringUpdate);
      }

      return true;

   }
};

var TWEEN = new _Group();

TWEEN.Group = _Group;
TWEEN._nextId = 0;
TWEEN.nextId = function() {
   return TWEEN._nextId++;
};


// Include a performance.now polyfill.
// In node.js, use process.hrtime.
if (typeof(self) === 'undefined' && typeof(process) !== 'undefined' && process.hrtime) {
   TWEEN.now = function() {
      var time = process.hrtime();

      // Convert [seconds, nanoseconds] to milliseconds.
      return time[0] * 1000 + time[1] / 1000000;
   };
}
// In a browser, use self.performance.now if it is available.
else if (typeof(self) !== 'undefined' &&
   self.performance !== undefined &&
   self.performance.now !== undefined) {
   // This must be bound, because directly assigning this function
   // leads to an invocation exception in Chrome.
   TWEEN.now = self.performance.now.bind(self.performance);
}
// Use Date.now if it is available.
else if (Date.now !== undefined) {
   TWEEN.now = Date.now;
}
// Otherwise, use 'new Date().getTime()'.
else {
   TWEEN.now = function() {
      return new Date().getTime();
   };
}


TWEEN.Tween = function(object, group) {
   this._object = object;
   this._valuesStart = {};
   this._valuesEnd = {};
   this._valuesStartRepeat = {};
   this._duration = 1000;
   this._repeat = 0;
   this._repeatDelayTime = undefined;
   this._yoyo = false;
   this._isPlaying = false;
   this._reversed = false;
   this._delayTime = 0;
   this._startTime = null;
   this._easingFunction = TWEEN.Easing.Linear.None;
   this._interpolationFunction = TWEEN.Interpolation.Linear;
   this._chainedTweens = [];
   this._onStartCallback = null;
   this._onStartCallbackFired = false;
   this._onUpdateCallback = null;
   this._onRepeatCallback = null;
   this._onCompleteCallback = null;
   this._onStopCallback = null;
   this._group = group || TWEEN;
   this._id = TWEEN.nextId();

};

TWEEN.Tween.prototype = {
      getId: function() {
         return this._id;
      },

      isPlaying: function() {
         return this._isPlaying;
      },

      to: function(properties, duration) {

         this._valuesEnd = Object.create(properties);

         if (duration !== undefined) {
            this._duration = duration;
         }

         return this;

      },

      duration: function duration(d) {
         this._duration = d;
         return this;
      },

      start: function(time) {

         this._group.add(this);

         this._isPlaying = true;

         this._onStartCallbackFired = false;

         this._startTime = time !== undefined ? typeof time === 'string' ? TWEEN.now() + parseFloat(time) : time : TWEEN.now();
         this._startTime += this._delayTime;

         for (var property in this._valuesEnd) {

            // Check if an Array was provided as property value
            if (this._valuesEnd[property] instanceof Array) {

               if (this._valuesEnd[property].length === 0) {
                  continue;
               }

               // Create a local copy of the Array with the start value at the front
               this._valuesEnd[property] = [this._object[property]].concat(this._valuesEnd[property]);

            }

            // If `to()` specifies a property that doesn't exist in the source object,
            // we should not set that property in the object
            if (this._object[property] === undefined) {
               continue;
            }

            // Save the starting value.
            this._valuesStart[property] = this._object[property];

            if ((this._valuesStart[property] instanceof Array) === false) {
               this._valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
            }

            this._valuesStartRepeat[property] = this._valuesStart[property] || 0;

         }

         return this;

      },

      stop: function() {

         if (!this._isPlaying) {
            return this;
         }

         this._group.remove(this);
         this._isPlaying = false;

         if (this._onStopCallback !== null) {
            this._onStopCallback(this._object);
         }

         this.stopChainedTweens();
         return this;

      },

      end: function() {

         this.update(Infinity);
         return this;

      },

      stopChainedTweens: function() {

         for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
            this._chainedTweens[i].stop();
         }

      },

      group: function(group) {
         this._group = group;
         return this;
      },

      delay: function(amount) {

         this._delayTime = amount;
         return this;

      },

      repeat: function(times) {

         this._repeat = times;
         return this;

      },

      repeatDelay: function(amount) {

         this._repeatDelayTime = amount;
         return this;

      },

      yoyo: function(yoyo) {

         this._yoyo = yoyo;
         return this;

      },

      easing: function(easingFunction) {

         this._easingFunction = easingFunction;
         return this;

      },

      interpolation: function(interpolationFunction) {

         this._interpolationFunction = interpolationFunction;
         return this;

      },

      chain: function() {

         this._chainedTweens = arguments;
         return this;

      },

      onStart: function(callback) {

         this._onStartCallback = callback;
         return this;

      },

      onUpdate: function(callback) {

         this._onUpdateCallback = callback;
         return this;

      },

      onRepeat: function onRepeat(callback) {

         this._onRepeatCallback = callback;
         return this;

      },

      onComplete: function(callback) {

         this._onCompleteCallback = callback;
         return this;

      },

      onStop: function(callback) {

         this._onStopCallback = callback;
         return this;

      },

      update: function(time) {

            var property;
            var elapsed;
            var value;

            if (time < this._startTime) {
               return true;
            }

            if (this._onStartCallbackFired === false) {

               if (this._onStartCallback !== null) {
                  this._onStartCallback(this._object);
               }

               this._onStartCallbackFired = true;
            }

            elapsed = (time - this._startTime) / this._duration;
            elapsed = (this._duration === 0 || elapsed > 1) ? 1 : elapsed;

            value = this._easingFunction(elapsed);

            for (property in this._valuesEnd) {

               // Don't update properties that do not exist in the source object
               if (this._valuesStart[property] === undefined) {
                  continue;
               }

               var start = this._valuesStart[property] || 0;
               var end = this._valuesEnd[property];

               if (end instanceof Array) {

                  this._object[property] = this._interpolationFunction(end, value);

               } else {

                  // Parses relative end values with start as base (e.g.: +10, -3)
                  if (typeof(end) === 'string') {

                     if (end.charAt(0) === '+' || end.charAt(0) === '-') {
                        end = start + parseFloat(end);
                     } else {
                        end = parseFloat(end);
                     }
                  }

                  // Protect against non numeric properties.
                  if (typeof(end) === 'number') {
                     this._object[property] = start + (end - start) * value;
                  }

               }

            }

            if (this._onUpdateCallback !== null) {
               this._onUpdateCallback(this._object, elapsed);
            }

            if (elapsed === 1) {

               if (this._repeat > 0) {

                  if (isFinite(this._repeat)) {
                     this._repeat--;
                  }

                  // Reassign starting values, restart by making startTime = now
                  for (property in this._valuesStartRepeat) {

                     if (typeof(this._valuesEnd[property]) === 'string') {
                        this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
                     }

                     if (this._yoyo) {
                        var tmp = this._valuesStartRepeat[property];

                        this._valuesStartRepeat[property] = this._valuesEnd[property];
                        this._valuesEnd[property] = tmp;
                     }

                     this._valuesStart[property] = this._valuesStartRepeat[property];