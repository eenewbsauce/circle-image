Circle-Image
============
[![Build Status](http://jenkins.justsift.com:8080/buildStatus/icon?job=Circle-Image)](http://jenkins.justsift.com:8080/job/Circle-Image/)

Testing Jenkins

## Github
Pull request and issues tracked here: https://github.com/eenewbsauce/circle-image

## NPM
Official home on NPM: https://www.npmjs.com/package/circle-image

## Install Dependencies
circle-image is based on ImageMagick. You can install it one of the following ways:

On Ubuntu
```
$ apt-get install ImageMagick
```
On Mac OS X
```
$ brew install ImageMagick
```
On CentOS
```
$ yum install ImageMagick
```

## Installation

```bash
npm install circle-image --save
```

## Usage
Make sure you have a folder called "uploads" in the root of your node application (ie: app.js).
The image (imagepath) dimensions need to be larger than the biggest size specified in imageSizes below.

```javascript
var images = require('circle-image');
var imageSizes = [125, 100, 30];
//uniqueId param is used to identify a user
//so use the primary key or something guaranteed to be unique
images.execute('imagepath', uniqueId, imageSizes).then(function (paths) {
  //array of circularized image paths
  console.log(paths[0]); //circle_user_{uniqueId}_125.png
})
```
