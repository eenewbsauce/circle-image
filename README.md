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
images.execute('imagepath', imageSizes);
```
