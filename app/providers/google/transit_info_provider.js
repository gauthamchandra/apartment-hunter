const Promise = global.Promise;

class TransitInfoProvider {
  constructor(mapsApiKey) {
    this._googleMapsClient = require('@google/maps').createClient({
      key: mapsApiKey,
      Promise: Promise
    });
  }

  getTransitTime(originLatLng, destLatLng) {
    return new Promise((resolve, reject) => {
      this._googleMapsClient.distanceMatrix({
        mode: 'transit',
        origins: [originLatLng],
        destinations: [destLatLng]
      }).asPromise().then(resp => {
        if (resp.status === 200) {
          let result = resp.json.rows[0].elements[0];

          if (result && result.status === 'OK') {
            resolve(resp.json.rows[0].elements[0].duration.value);
          }
          else {
            resolve(null);
          }
        }
        else {
          reject(resp.status);
        }
      }).catch(error => {
        console.error('Error when trying to determine transit time', error);
      });
    });
  }

  getLatLng(address) {
    return new Promise((resolve, reject) => {
      this._googleMapsClient.geocode({
        address: address
      }).asPromise().then(response => {
        let firstResult = response.json.results[0];

        if (firstResult) {
          resolve(firstResult.geometry.location);
        }
        else {
          resolve(null);
        }
      }).catch(error => {
        console.error('An error occurred with geocode request:', error);
        reject(error);
      });
    });
  }
}

module.exports = TransitInfoProvider;
