class SyndicationInfo {
  constructor(feedItem) {
    if (!feedItem || !(typeof feedItem.meta === 'object')) {
      throw new Error('Meta information is not available!');
    }

    this.updatePeriod = this.getUpdatePeriodInMillis(feedItem.meta['syn:updateperiod']['#']);
    this.updateFrequency = parseInt(feedItem.meta['syn:updatefrequency']['#'], 0) || 1;
    this.updatebase = new Date(feedItem.meta['syn:updatebase']['#']);
  }

  /**
   * @return {DateTime} of when the current data can be considered stale. It is used to indicate 
   *                    when the RSS feed is scheduled to be updated 
   * */
  getExpirationDate() {
    return new Date(this.updateBase.getTime() + (this.updatePeriod * this.updateFrequency));
  }

  /**
   * The RSS feed spec defines the update period in strings that either
   * - 'hourly'
   * - 'daily'
   * - 'weekly'
   * - 'monthly'
   * - 'yearly'
   *   
   * @return that time in milliseconds. If the string is falsy, it returns the value for
   * 'daily' as per spec.
   * */
  getUpdatePeriodInMillis(updatePeriodString) {
    const HOUR = 1000 * 60 * 60;

    updatePeriodString = updatePeriodString || '';

    switch(updatePeriodString) {
      case 'hourly':
        return HOUR;
        break;
      case 'weekly':
        return HOUR * 24 * 7;
        break;
      case 'monthly':
        return HOUR * 24 * 7 * 4;
        break;
      case 'yearly':
        return HOUR * 24 * 365.25; 
      case 'daily':
      default:
        return HOUR;
    }
  }
}

module.exports = SyndicationInfo;
