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
  var cropAndCircularize = function(sz) {
    size = sz;
    async.series([
      crop,
      delay,
      circularize
    ]);
  };
  // var cb = function(size) {
  //   console.log('processed size: ' + size);
  // };

  //return async.each(sizes, function(size) {
    console.log('processing image size: ' + sizes[0]);
    cropAndCircularize(sizes[0]);
    //cb(size);
  //});
}

var delay = function delay(){
  var defer = Q.defer();
  setTimeout(function(){
    console.log("delay complete");
    defer.resolve("yay");
  }, 3000);
  return defer.promise;
};

var crop = function crop() {
  console.log('cropping: ' + size);
  var defer = Q.defer();
  easyimg.exec('convert '+path+' -resize ' +
    (size) + 'x' + (size) + '^  -gravity center -crop ' +
    (size + 2) + 'x' + (size + 2) + '+0+0 +repage ' + format(outputTempFilePath, size))
    .then(function(){
    //   fs.unlink(format(outputTempFilePath, size), function(err){
    //     if (err) defer.reject(err)
         defer.resolve('yay');
    //   });
    });
  return defer.promise;
};

var circularize = function circularize() {
  console.log('circularizing: ' + size);
  var radius = (size/2) - 1;
  var circleSize = format('%1$d,%1$d %1$d 0', radius);

  return easyimg.exec('convert ' + format(outputTempFilePath, size) + ' \\( -size ' + (size) + 'x' + (size) +
  ' xc:none -fill white -draw \'circle ' + circleSize + '\' \\) ' +
  '-compose copy_opacity -composite ' + format(outputFilePath, size));
};

function unlink(path) {
  // console.log('unlinking: ' + path)
  // return Q.fcall(fs.unlink(path, function(){console.log('unlinked: ' + path)}));
  var defer = Q.defer();
  console.log('unlinking: ' + path);

  fs.unlink(path, function(err) {
    console.log('unlinked: ' + path);

    if (err) defer.reject(err);
    defer.resolve("yay!");
  })

  return defer.promise;
  //console.log('unlinking: ' + path);
  //return Q.fcall(fs.unlinkSync(path));
  // var defer = Q.defer();
  //
  // console.log('unlinking: ' + path);
  //
  // fs.unlink(path, function (err) {
  //   if (err) {
  //     console.log("error in unlink");
  //     defer.reject(err);
  //   } else {
  //     console.log("successfully unlinked");
  //     defer.resolve();
  //   }
  // });
  //
  // return defer.promise;
}
