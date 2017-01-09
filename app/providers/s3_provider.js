const s3 = require('s3')
    , rootRelativeRequire = require('rfr')
    , es6BindAll = require('es6bindall');

class S3Provider {
  constructor(accessKey, secret, region) {
    this.client = s3.createClient({
      s3Options: {
        accessKeyId: accessKey,
        secretAccessKey: secret,
        region: region
      }
    });

    es6BindAll(this, ['downloadFile']);
  }

  /**
   * Downloads a file from S3
   *
   * @returns Promise
   * */
  downloadFile(bucket, fileNameToDownload, fileNameToSaveAs) {
    return new Promise((resolve, reject) => {
      var download = this.client.downloadFile({
        localFile: fileNameToSaveAs,
        s3Params: {
          Bucket: bucket,
          Key: fileNameToDownload
        }
      });

      download.on('error', error => {
        reject(error);
      });

      download.on('end', () => {
        resolve();
      });
    });
  }
}

module.exports = S3Provider;
