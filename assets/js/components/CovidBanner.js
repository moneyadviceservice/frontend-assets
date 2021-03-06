define(['jquery', 'DoughBaseComponent'],
  function($, DoughBaseComponent) {
  'use strict';

  var CovidBanner,
      defaultConfig = {};

  CovidBanner = function($el, config) {
    CovidBanner.baseConstructor.call(this, $el, config, defaultConfig);

    this.closeBtn = this.$el.find('[data-dough-close]'); 
    this.hideClass = 'covid_banner--hidden'; 
    this.raisedClass = 'covid_banner--raised'; 
  };

  /**
  * Inherit from base module, for shared methods and interface
  */
  DoughBaseComponent.extend(CovidBanner);

  CovidBanner.componentName = 'CovidBanner';

  /**
  * @param {Promise} initialised
  */
  CovidBanner.prototype.init = function(initialised) {
    this._initialisedSuccess(initialised);
    this._setUpEvents(); 
  };

  CovidBanner.prototype._setUpEvents = function() {
    var _this = this; 

    this.closeBtn.click(function(e) {
      e.preventDefault(); 
      _this._setCookie(); 
      _this._hideBanner(); 
    }); 
  }; 

  CovidBanner.prototype._setCookie = function() {
    // check if the _covid_banner cookie exists
    var allCookies = document.cookie.replace(/ /g, '').split(';'); 
    var cookieExists = allCookies.some(function(item) {
      return item.indexOf('_covid_banner=') == 0; 
    }); 

    // if not then create it with a value of 'y'
    if (!cookieExists) {
      document.cookie = '_covid_banner=y';      
    }
  }; 

  CovidBanner.prototype._hideBanner = function() {
    this.$el.addClass(this.hideClass); 
  }; 

  /**
   * Public method imported in BackToTop.js to manage popup vertical position in article pages
   * @param {boolean} raised - set button raised state
   * @param {boolean} atSmallViewport - viewport width < 720px
   */
  CovidBanner.prototype._raisedCovidBanner = function(raised, atSmallViewport) {
    var raisedBanner = raised && atSmallViewport;
    // check if conditions are met
    if (raisedBanner) {
      this.$el.addClass(this.raisedClass)
    } else {
      this.$el.removeClass(this.raisedClass)
    };
  }

  return CovidBanner;
});
