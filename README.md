Circle-Image
============

circle-image is based on ImageMagick. You can install it one of the following ways:

On Ubuntu
```
$ apt-get install imagemagick
```
On Mac OS X
```
$ brew install imagemagick
```
On CentOS
```
$ yum install imagemagick
```

## Installation

```bash
npm install circle-image --save
```

## Usage

```javascript
var images = require('circle-image');
var imageSizes = [125, 100, 30];
//uniqueId param is used to identify a user
//so user the primary key or something guaranteed to be unique
images.execute('imagepath', uniqueId, imageSizes).then(function (paths) {
  //array of circularized image paths
  console.log(paths);
})
```
