class CraigslistQuery {

  /**
   * @param queryUrl - the url used to query
   * @param exclusionStrings {List<String>} a list of strings that is used to exclude results
   * */
  constructor(queryUrl, exclusionStrings) {
    this._queryUrl = queryUrl;
    this._exclusionFilters = exclusionStrings || [];
  }

  getQueryUrl() {
    return this._queryUrl;
  }

  getExclusionFilters() {
    return this._exclusionFilters;
  }
}

module.exports = CraigslistQuery;
