var easyimg = require('easyimage');
var async = require('async');
var format = require('sprintf-js').sprintf;
var Q = require('q');
var fs = require('fs');

var path = 'test.jpg';
var outputTempFilePath = 'temp_%d.png';
var outputFilePath = 'circle_%d.png';
var sizes = [150, 125, 100, 33];
var size;

(function execute() {
  getDimensions().then(function success(dimensions) {
    if (dimensions.width > sizes[0] && dimensions.height > sizes[0] && dimensions.width === dimensions.height) {
      processImages().then(function success(image) {
        return image;
      }, function error(err) {
        console.log(err);
      });
    } else {
      return "image is too small to process";
    }
  }, function error(err) {
    console.log(err);
  });
}());

function getDimensions() {
  return easyimg.info(path).then(
    function(file) {
      return { width: file.width, height: file.height };
    }, function (err) {
      return err;
    }
  );
}

function processImages() {
  var cropAndCircularize = function(size) {
    //async([delay, delay, delay]);

    async.series([
      function(callback) {
        crop(size).then(function success(response){
          callback(null, response);
        }, function error(err) {
          callback(err, null);
        });
      },
      function(callback) {
        circularize(size).then(function success(response){
          callback(null, response);
        }, function error(err) {
          callback(err, null);
        });
      }
    ], function(err, results) {
      console.log(err);
      console.log(results);
    });

    // async.series({
    //   one: function(callback){
    //       setTimeout(function(){
    //           callback(null, 1);
    //       }, 10000);
    //   },
    //   two: function(callback){
    //     console.log('hit')
    //       setTimeout(function(){
    //           callback(null, 2);
    //       }, 100);
    //   }
    // }, function (err, results) {
    //   console.log(results);
    // });
  }

  async.each(sizes, function(size) {
    console.log('processing image size: ' + size);
    cropAndCircularize(size);
  });
}

var delay = function delay(){
  console.log("delay started");
  var defer = Q.defer();
  setTimeout(function(){
    console.log("delay complete");
    defer.resolve("yay");
  }, 1000);
  return defer.promise;
};

var crop = function crop(size) {
  console.log('cropping: ' + size);
  return easyimg.exec('convert '+path+' -resize ' +
    (size) + 'x' + (size) + '^  -gravity center -crop ' +
    (size + 2) + 'x' + (size + 2) + '+0+0 +repage ' + format(outputTempFilePath, size));//.then(function success(){
      // fs.unlink(format(outputTempFilePath, size), function(err){
      //   if (err) return err;
      //   callback(null, 'yay');
      //  });
    // }, function error(err) {
    //   callback(err, null);
    // });
};

var circularize = function circularize(size) {
  console.log('circularizing: ' + size);
  var radius = (size/2) - 1;
  var circleSize = format('%1$d,%1$d %1$d 0', radius);

  return easyimg.exec('convert ' + format(outputTempFilePath, size) + ' \\( -size ' + (size) + 'x' + (size) +
  ' xc:none -fill white -draw \'circle ' + circleSize + '\' \\) ' +
  '-compose copy_opacity -composite ' + format(outputFilePath, size));
};

function unlink(path) {
  var defer = Q.defer();
  console.log('unlinking: ' + path);

  fs.unlink(path, function(err) {
    console.log('unlinked: ' + path);

    if (err) defer.reject(err);
    defer.resolve("yay!");
  })

  return defer.promise;
}
