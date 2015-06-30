var easyimg = require('easyimage');
var async = require('async');
var format = require('sprintf-js').sprintf;
var Q = require('q');

var path = 'test.jpg';
var outputTempFilePath = 'temp_%d.png';
var outputFilePath = 'circle_%d.png';
var sizes = [150, 100, 125, 33];

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
    return async.series([
      crop(size),
      unlink(format(outputTempFilePath, size)),
      circularize(size),
      unlink(format(outputFilePath, size))
    ]);
  };
  var cb = function(size) {
    console.log('processed size: ' + size);
  };

  return async.eachSeries(sizes, function(size, cb) {
    console.log('processing image size: ' + size);
    cropAndCircularize(size);
    cb(size);
  });
}

function crop(size) {
  console.log('cropping: ' + size);
  return easyimg.exec('convert '+path+' -resize ' +
    (size) + 'x' + (size) + '^  -gravity center -crop ' +
    (size + 2) + 'x' + (size + 2) + '+0+0 +repage ' + format(outputTempFilePath, size));
}

function circularize(size) {
  console.log('circulizing: ' + size);
  var radius = (size/2) - 1;
  var circleSize = format('%1$d,%1$d %1$d 0', radius);

  return easyimg.exec('convert ' + format(outputTempFilePath, size) + ' \\( -size ' + (size) + 'x' + (size) +
  ' xc:none -fill white -draw \'circle ' + circleSize + '\' \\) ' +
  '-compose copy_opacity -composite ' + format(outputFilePath, size));
}

function unlink(path) {
  console.log('unlinking: ' + path);
  var defer = Q.defer();

  fs.unlink(path, function (err) {
    if (err) {
      console.log("error in unlink");
      defer.reject(err);
    } else {
      console.log("successfully unlinked");
      defer.resolve();
    }
  });

  return defer.promise;
}
