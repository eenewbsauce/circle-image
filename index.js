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
var outputTempFilePath = finalPath + '/uploads/temp_user_%d_%d.png';
var outputFilePath = finalPath +'/uploads/circle_user_%d_%d.png';
//var sizes = [150, 125, 100, 33];

exports.execute = function execute(imagePath, uniqueId, sizesArray) {
  var defer = Q.defer();
  getDimensions(imagePath).then(function success(dimensions) {
    var sortedSizes = sizesArray.sort(function(a, b){return b-a});
    if (dimensions.width > sortedSizes[0] && dimensions.height > sortedSizes[0] && dimensions.width === dimensions.height) {
      processImages(imagePath, uniqueId, sortedSizes).then(function success(paths) {
        defer.resolve(paths);
      }, function error(err) {
        defer.reject(err);
      });
    } else {
      defer.reject("image is too small to process");
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

  var cropAndCircularize = function(size) {
    async.series([
      function(callback) {
        crop(path, uniqueId, size).then(function success(response){
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
      console.log(err);
      console.log(results);
      paths.push(results[0]);
    });
  }

  async.each(sizesArray, function(size) {
    console.log('processing image size: ' + size);
    cropAndCircularize(size);
  }, function (err) {
    if (err) defer.reject(err)
    defer.resolve(paths);
  });

  return defer.promise;
}

var crop = function crop(path, uniqueId, size) {
  console.log('cropping: ' + size);
  var tempPath = format(outputTempFilePath, uniqueId, size);
  var finalPath = format(outputFilePath, uniqueId, size);

  return easyimg.exec('convert ' + tempPath + ' -resize ' +
    (size) + 'x' + (size) + '^  -gravity center -crop ' +
    (size + 2) + 'x' + (size + 2) + '+0+0 +repage ' + finalPath).then(function success () {
      return finalPath;
    }, function error (err) {
      return err;
    });
};

var circularize = function circularize(path, uniqueId, size) {
  console.log('circularizing: ' + size);
  var radius = (size/2) - 1;
  var circleSize = format('%1$d,%1$d %1$d 0', radius);
  var finalPath = format(outputTempFilePath, uniqueId, size);

  return easyimg.exec('convert ' + finalPath + ' \\( -size ' + (size) + 'x' + (size) +
  ' xc:none -fill white -draw \'circle ' + circleSize + '\' \\) ' +
  '-compose copy_opacity -composite ' + finalPath).then(function success () {
    return finalPath;
  }, function error (err) {
    return err;
  });
};
