var easyimg = require('easyimage');
var async = require('async');
var format = require('sprintf-js').sprintf;
var Q = require('q');
var fs = require('fs');
var path = require('path');

var basePath = path.dirname(require.main.filename);
var baseParts = basePath.split('/');
baseParts.splice(-1, 1);
var finalPath = baseParts.join('/');
console.log(finalPath);
var outputTempFilePath = finalPath + '/uploads/temp_user_%d_%d.png';
var outputFilePath = finalPath +'/uploads/circle_user_%d_%d.png';

exports.execute = function execute(imagePath, uniqueId, sizesArray) {
  var defer = Q.defer();
  getDimensions(imagePath).then(function success(dimensions) {
    var sortedSizes = sizesArray.sort(function(a, b){return b-a;});
    //if (dimensions.width > sortedSizes[0] && dimensions.height > sortedSizes[0] && dimensions.width === dimensions.height) {
    if (dimensions.width > sortedSizes[0] && dimensions.height > sortedSizes[0]) {
      if (dimensions.width !== dimensions.height) {
        squareUp(imagePath, sortedSizes[0], dimensions.width, dimensions.height).then(function success(response) {
          processImages(imagePath, uniqueId, sortedSizes).then(function success(paths) {
            defer.resolve(paths);
          }, function error(err) {
            defer.reject(err);
          });
        }, function error(err) {
          defer.reject('squaring image failed');
        });
      } else {
        processImages(imagePath, uniqueId, sortedSizes).then(function success(paths) {
          defer.resolve(paths);
        }, function error(err) {
          defer.reject(err);
        });
      }
    } else {
      defer.reject("Image is too small to process. Image must be larger than the biggest size in sizesArray");
    }
  }, function error(err) {
    defer.reject(err);
  });

  return defer.promise;
};

function getDimensions(path) {
  return easyimg.info(path).then(
    function(file) {
      return { width: file.width, height: file.height };
    }, function (err) {
      return err;
    }
  );
}

function processImages(path, uniqueId, sizesArray) {
  var defer = Q.defer();
  var paths = [];

  var resizeAndCircularize = function(size) {
    var defer = Q.defer();

    async.series([
      function(callback) {
        resize(path, uniqueId, size).then(function success(response){
          callback(null, response);
        }, function error(err) {
          callback(err, null);
        });
      },
      function(callback) {
        circularize(path, uniqueId, size).then(function success(response){
          callback(null, response);
        }, function error(err) {
          callback(err, null);
        });
      }
    ], function(err, results) {
      if (err) {
        console.log(err);
        defer.reject(err);
      } else {
        console.log(results);
        paths.push(results[1]);
        defer.resolve();
      }
    });

    return defer.promise;
  };

  async.each(sizesArray, function(size, callback) {
    console.log('processing image size: ' + size);
    resizeAndCircularize(size).then(function success () {
      callback();
    }, function error (err) {
      callback(err);
    });
  }, function (err) {
    if (err) defer.reject(err);
    defer.resolve(paths);
  });

  return defer.promise;
}

var squareUp = function squareUp(path, size, originalWidth, originalHeight) {
  console.log('square up image');
  return easyimg.crop({
    src: path,
    width: size,
    height: size,
    x: originalWidth/2,
    y: originalHeight/2
  }).then(function success (path) {
    return path;
  }, function error (err) {
    return err;
  });
};

var resize = function resize(path, uniqueId, size) {
  console.log('cropping: ' + size);
  var tempPath = format(outputTempFilePath, uniqueId, size);

  return easyimg.exec('convert ' + path + ' -resize ' +
    (size) + 'x' + (size) + '^  -gravity center -crop ' +
    (size + 2) + 'x' + (size + 2) + '+0+0 +repage ' + tempPath).then(function success () {
      return tempPath;
    }, function error (err) {
      return err;
    });
};

var circularize = function circularize(path, uniqueId, size) {
  console.log('circularizing: ' + size);
  var radius = (size/2) - 1;
  var circleSize = format('%1$d,%1$d %1$d 0', radius);
  var tempPath = format(outputTempFilePath, uniqueId, size);
  var finalPath = format(outputFilePath, uniqueId, size);

  return easyimg.exec('convert ' + tempPath + ' \\( -size ' + (size) + 'x' + (size) +
  ' xc:none -fill white -draw \'circle ' + circleSize + '\' \\) ' +
  '-compose copy_opacity -composite ' + finalPath).then(function success () {
    return finalPath;
  }, function error (err) {
    return err;
  });
};
