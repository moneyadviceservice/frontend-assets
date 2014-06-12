/**
 * Renders a list of items into a dropdown, for use in situations where a native <select> isn't
 * semantically appropriate eg. to show / hide panels
 */
define(['jquery', 'MASModule'], function ($, MASModule) {
  'use strict';

  var itemSelector = '.js-dropdown-list__item',
      DropdownList,
      activeClass = 'is-active',
      inactiveClass = 'is-inactive',
      uiEvents = {
        'click .js-dropdown-list__item': '_handleClickEvent'
      };

  /**
   * Dropdown list
   * @constructor
   */
  DropdownList = function () {
    this.uiEvents = uiEvents;
    DropdownList.baseConstructor.apply(this, arguments);
    this.$panel = this.$el.find('.js-dropdown-list__panel').addClass(inactiveClass);
  };

  MASModule.extend(DropdownList);


  DropdownList.prototype.init = function(initialised) {
    var $first;
    $first = this.$panel.find(itemSelector).first();
    if ($first.length) {
      this._selectItem($first);
      this._initialisedSuccess(initialised);
    } else {
      this._initialisedFailure(initialised);
    }
  };

  /**
   * Select a trigger
   * @param {jQuery} $el
   * @private
   */
  DropdownList.prototype._selectItem = function ($el) {
    this.$selected = $el.addClass(activeClass).removeClass(inactiveClass).attr('aria-selected', true);
    this.$selected.length && this.$panel.css('top', -1 * this.$selected.position().top);
    return this;
  };

  /**
   * Deselect a trigger
   * @param {jQuery} $el
   * @private
   */
  DropdownList.prototype._deSelectItem = function ($el) {
    $el.removeClass(activeClass).addClass(inactiveClass).attr('aria-selected', false);
    return this;
  };

  /**
   * Show / hide and position the panel so the selected item remains stationary
   * @returns {DropdownList}
   * @private
   */
  DropdownList.prototype._togglePanel = function () {
    this.$panel.toggleClass(activeClass).toggleClass(inactiveClass);
    if (this.$panel.hasClass(activeClass)) {
      this.$panel.css('top', -1 * this.$selected.position().top);
    } else {
      this.$panel.css('top', 0);
    }
    return this;
  };

  /**
   * Handle a click on a trigger
   * @returns {DropdownList}
   * @private
   */
  DropdownList.prototype._handleClickEvent = function (e) {
    if (!$(e.currentTarget).hasClass(activeClass)) {
      this._deSelectItem(this.$el.find(itemSelector + '.is-active'));
      this._selectItem($(e.currentTarget));
    }
    this._togglePanel();
  };

  return DropdownList;

});