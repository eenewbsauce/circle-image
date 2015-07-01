var easyimg = require('easyimage');
var async = require('async');
var format = require('sprintf-js').sprintf;
var Q = require('q');
var fs = require('fs');
var path = require('path');

//var path = 'test.jpg';
var basePath = path.dirname(require.main.filename);
var baseParts = basePath.split('/');
var reducedPath = baseParts.splice(-1, 1);
var finalPath = reducedPath.join('/');
var outputTempFilePath = finalPath + '/uploads/temp_%d.png';
var outputFilePath = finalPath +'/uploads/circle_%d.png';
//var sizes = [150, 125, 100, 33];

exports.execute = function execute(imagePath, sizesArray) {
  getDimensions(imagePath).then(function success(dimensions) {
    var sortedSizes = sizesArray.sort(function(a, b){return b-a});
    if (dimensions.width > sortedSizes[0] && dimensions.height > sortedSizes[0] && dimensions.width === dimensions.height) {
      processImages(imagePath, sortedSizes).then(function success(image) {
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

function processImages(path, sizesArray) {
  var cropAndCircularize = function(size) {
    async.series([
      function(callback) {
        crop(path, size).then(function success(response){
          callback(null, response);
        }, function error(err) {
          callback(err, null);
        });
      },
      function(callback) {
        circularize(path, size).then(function success(response){
          callback(null, response);
        }, function error(err) {
          callback(err, null);
        });
      }
    ], function(err, results) {
      console.log(err);
      console.log(results);
    });
  }

  async.each(sizesArray, function(size) {
    console.log('processing image size: ' + size);
    cropAndCircularize(size);
  });
}

var crop = function crop(path, size) {
  console.log('cropping: ' + size);
  return easyimg.exec('convert '+path+' -resize ' +
    (size) + 'x' + (size) + '^  -gravity center -crop ' +
    (size + 2) + 'x' + (size + 2) + '+0+0 +repage ' + format(outputTempFilePath, size));//.then(function success(){
    //   fs.unlink(format(outputTempFilePath, size), function(err){
    //     if (err) return err;
    //    });
    // }, function error(err) {
    //   callback(err, null);
    // });
};

var circularize = function circularize(path, size) {
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
