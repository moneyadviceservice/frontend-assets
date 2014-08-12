/**
 * Client side validation. Mirrors HTML5 validation API as much as possible.
 *
 * Supported types are:
 * - required
 * - minlength
 * - pattern
 * - min/max number range checking
 *
 * @param  {Object} $         jQuery
 * @return {Class}           Validation
 */
define(['jquery', 'DoughBaseComponent'], function($, DoughBaseComponent) {
  'use strict';

  var defaultConfig = {
    fieldSelector: 'input, textarea, select',
    attributeEmpty: 'data-dough-validation-empty',
    attributeInvalid: 'data-dough-validation-invalid',
    rowInvalidClass: 'is-errored',
    validationSummaryClass: 'validation-summary',
    validationSummaryListAttribute: 'data-dough-validation-summary-list',
    validationSummaryHiddenClass: 'validation-summary--hidden',
    validationSummaryErrorClass: 'validation-summary__error',
    inlineErrorClass: 'js-inline-error'
  },

  uiEvents = {
    'blur input, select, textarea': '_handleBlurEvent',
    'keyup input, textarea': '_handleChangeEvent',
    'change select': '_handleChangeEvent',
    'submit': '_handleSubmit'
  },

  /**
   * Call base constructor
   * @constructor
   */
  Validation = function($el, config) {
    this.uiEvents = uiEvents;
    Validation.baseConstructor.apply(this, arguments);
    this.config = $.extend(defaultConfig, this.config);
  };

  DoughBaseComponent.extend(Validation);

  Validation.prototype.init = function() {
    this.ATTRIBUTE_VALIDATORS = {
      'required': '_validateRequired',
      'pattern': '_validatePattern',
      'min': '_validateMin',
      'max': '_validateMax',
      'minlength': '_validateMinLength'
    };

    // If there's server erros on the page, we back off completely
    // There are a number of different types of errors that the server
    // generates, and this file will grow in complexity trying to keep up.
    if (this.$el.find('[' + this.config.validationSummaryListAttribute + ']').find('li').length > 0) {
      this._unbindUiEvents();
      this.enabled = false;
      return this;
    }

    this.$allFieldsOnPage = this.$el.find(this.config.fieldSelector);
    this.errors = [];
    this._prepareMarkup();

    this.enabled = true;

    return this;
  };

  /**
   * Register an error, to be used with both inline and validation summary
   * @param {Object} fieldValidity The validity object generated by _getFieldValidity()
   * @return {Validation}        Class instance
   */
  Validation.prototype.addError = function(fieldValidity) {
    var existingErrorIndex = this._getErrorIndexByID(fieldValidity.$field.attr('id'));
    if (existingErrorIndex === -1) {
      this.errors.push(fieldValidity);
    }
    else {
      this.errors[existingErrorIndex] = fieldValidity;
    }

    this._addAccessibility(fieldValidity.$field);
    this._sortErrorsByFieldDisplayOrder().refreshInlineErrors().refreshValidationSummary();

    return this;
  };

  /**
   * Remove an error
   * @param  {Object} fieldValidity Field Validity Object
   * @return {Validation}        Class instance
   */
  Validation.prototype.removeError = function(fieldValidity) {
    var existingErrorIndex = this._getErrorIndexByID(fieldValidity.$field.attr('id'));
    if (existingErrorIndex !== -1) {
      this.errors.splice(existingErrorIndex, 1);
    }

    this._removeAccessibility(fieldValidity.$field);
    this._sortErrorsByFieldDisplayOrder().refreshInlineErrors().refreshValidationSummary();

    return this;
  };

  /**
   * Refresh all the inline error messages
   * @return {Validation} Class instance
   */
  Validation.prototype.refreshInlineErrors = function() {
    $('.form__row').each($.proxy(function(i, o) {
      var $formRow = $(o),
          $errorContainer = $formRow.find('.' + this.config.inlineErrorClass),
          $inputs = $formRow.find(this.config.fieldSelector),
          errorHTML = "",
          rowHasErrors = false;

      $inputs.each($.proxy(function(_i, _o) {
        var $input = $(_o),
            inputID = $input.attr('id'),
            errorIndex = this._getErrorIndexByID(inputID);

        if (errorIndex > -1) {
          rowHasErrors = true;
          errorHTML += '<p id="' + this._getInlineErrorID(inputID) + '" class="' + this.config.validationSummaryErrorClass + '">' + (errorIndex + 1) + '. ' + this.errors[errorIndex].message + '</p>';
        }
      }, this));

      if (rowHasErrors) {
        $formRow.addClass(this.config.rowInvalidClass);
      }
      else {
        $formRow.removeClass(this.config.rowInvalidClass);
      }

      $errorContainer.html(errorHTML);

    }, this));

    return this;
  };

  /**
   * Loop through the errors and build the summary markup
   * @return {Validation} Class instance
   */
  Validation.prototype.refreshValidationSummary = function() {
    var fieldID,
        fieldValidity,
        summaryHTML = '';

    $.each(this.errors, $.proxy(function(errorIndex, fieldValidity) {
      fieldID = fieldValidity.$field.attr('id');
      summaryHTML += '<li class="' + this.config.validationSummaryErrorClass + '"><a href="#error-' + fieldID + '">' + fieldValidity.message + '</a></li>';
    }, this));

    this.$el.find('[' + this.config.validationSummaryListAttribute + ']').html(summaryHTML);

    if (this.errors.length < 1) {
      this._hideValidationSummary();
    }

    return this;
  };

  /**
   * Check a field's validity and update the errors array
   * @param  {jQuery} $field The field to validate
   * @return {Validation}        Class instance
   */
  Validation.prototype.checkFieldValidity = function($field) {
    var fieldValidity = this._getFieldValidity($field);

    if (fieldValidity.hasError) {
      this.addError(fieldValidity);
    }
    else {
      this.removeError(fieldValidity);
    }

    return this;
  };

  /**
   * Prepare the markup for both inline errors and the validation summary
   *
   * This will check to see if there's an inline error block rendered by the server
   * (in case it's picked up errors we don't support)
   *
   * It will also generate a fallback list if the server hasn't been configured.
   *
   * @private
   * @return {[type]} [description]
   */
  Validation.prototype._prepareMarkup = function() {
    var $validationSummary = this.$el.find('.' + this.config.validationSummaryClass);
    if (!$validationSummary.length) {
      this.$el.prepend('<div class="' + this.config.validationSummaryClass + ' ' + this.config.validationSummaryHiddenClass + '">\
          <ol ' + this.config.validationSummaryListAttribute + '></ol>\
        </div>');
    }

    $('.form__row').each($.proxy(function(i, o) {
      var $formRow = $(o),
          $existingInlineErrors = $formRow.find('.' + this.config.inlineErrorClass);

      if (!$existingInlineErrors.length) {
        $formRow.prepend($('<div class="' + this.config.inlineErrorClass + '" />'));
      }
    }, this));

    return this;
  };

  /**
   * Generate the ID to be used with the inline error blocks
   * These are used for the validation summary deeplinks, and
   * for the aria-describedby property on the field.
   *
   * @private
   * @param  {String} fieldID The field ID
   * @return {String}         The inline error ID
   */
  Validation.prototype._getInlineErrorID = function(fieldID) {
    return 'error-' + fieldID;
  };

  /**
   * Add the accessibility attributes to an invalid field
   * @private
   * @param {jQuery} $field jQuery field
   * @return {Validation}  Class instance
   */
  Validation.prototype._addAccessibility = function($field) {
    var existingDescribedBy = $field.attr('aria-describedby') || '',
        inlineErrorID = this._getInlineErrorID($field.attr('id'));

    $field.attr('aria-invalid', 'true');

    if (existingDescribedBy.indexOf(inlineErrorID) === -1) {
      $field.attr('aria-describedby', existingDescribedBy + ' ' + inlineErrorID);
    }

    return this;
  };

  /**
   * Remove aria attributes for a valid field
   * @param  {[type]} $field [description]
   * @return {[type]}               [description]
   */
  Validation.prototype._removeAccessibility = function($field) {
    var existingDescribedBy = $field.attr('aria-describedby') || '',
        inlineErrorID = this._getInlineErrorID($field.attr('id'));

    $field.removeAttr('aria-invalid');
    $field.attr('aria-describedby', existingDescribedBy.replace(inlineErrorID, ''));

    return this;
  };

  /**
   * Show the validation summary;
   *
   * @private
   * @return {[type]} [description]
   */
  Validation.prototype._showValidationSummary = function() {
    this.$el.find('.' + this.config.validationSummaryClass).removeClass(this.config.validationSummaryHiddenClass);
    return this;
  };

  /**
   * Hide the validation summary;
   *
   * @private
   * @return {[type]} [description]
   */
  Validation.prototype._hideValidationSummary = function() {
    this.$el.find('.' + this.config.validationSummaryClass).addClass(this.config.validationSummaryHiddenClass);
    return this;
  };

  /**
   * Check a field's validity
   *
   * @private
   * @param  {jQuery} $field The field to validate
   * @return {Object}        A hash containing status and the appropriate error message
   */
  Validation.prototype._getFieldValidity = function($field) {
    var fieldValidity = {
      errors: [],
      isEmpty: false,
      isInvalid: false,
      hasError: false,
      message: '',
      $field: $field
    };

    // Populate the field validity with an array of results from the various validators
    $.each(this.ATTRIBUTE_VALIDATORS, $.proxy(function(attributeSelector, handler) {
      var attr = $field.attr(attributeSelector);
      if (attr) {
        fieldValidity.errors.push(this[handler]($field, $field.val(), attr));
      }
    }, this));

    // Hoist up to top level for ease of access
    $.each(fieldValidity.errors, function(i, validatorResults) {
      if (validatorResults.isEmpty) {
        fieldValidity.isEmpty = true;
      }

      if (validatorResults.isInvalid) {
        fieldValidity.isInvalid = true;
      }
    });

    fieldValidity.hasError = fieldValidity.isEmpty || fieldValidity.isInvalid;

    // Check which message to use, empty should take prescedence
    if (fieldValidity.isInvalid) {
      fieldValidity.message = $field.attr(this.config.attributeInvalid) || $field.attr(this.config.attributeEmpty);
    }

    if (fieldValidity.isEmpty) {
      fieldValidity.message = $field.attr(this.config.attributeEmpty);
    }

    return fieldValidity;
  };

  /**
   * Basic required field validator, for non-empty
   *
   * @private
   * @param  {jQuery} $field   the field being checked
   * @param  {String} value    the field value
   * @param  {String} required Validation parameters
   * @return {Object}          Validity object
   */
  Validation.prototype._validateRequired = function($field, value, required) {
    var validity = { name: 'required' };
    if (value == '') {
      validity.isEmpty = true;
    }

    return validity;
  };

  /**
   * Regular expression validator
   *
   * @private
   * @param  {jQuery} $field   the field being checked
   * @param  {String} value    the field value
   * @param  {String} pattern Validation parameters
   * @return {Object}          Validity object
   */
  Validation.prototype._validatePattern = function($field, value, pattern) {
    var validity = { name: 'pattern' };
    if (!value.match(pattern)) {
      validity.isInvalid = true;
    }

    return validity;
  };

  /**
   * Check a number is above the minimum
   *
   * @private
   * @param  {jQuery} $field   the field being checked
   * @param  {String} value    the field value
   * @param  {String} min Validation parameters
   * @return {Object}          Validity object
   */
  Validation.prototype._validateMin = function($field, value, min) {
    var validity = { name: 'min' },
        valueAsNumber = Number(value);

    if (isNaN(valueAsNumber) || valueAsNumber < min) {
      validity.isInvalid = true;
    }

    return validity;
  };

  /**
   * Check a number is below the maximum
   *
   * @private
   * @param  {jQuery} $field   the field being checked
   * @param  {String} value    the field value
   * @param  {String} max Validation parameters
   * @return {Object}          Validity object
   */
  Validation.prototype._validateMax = function($field, value, max) {
    var validity = { name: 'max' },
        valueAsNumber = Number(value);

    if (isNaN(valueAsNumber) || valueAsNumber > max) {
      validity.isInvalid = true;
    }

    return validity;
  };

  /**
   * Ensure a minimum number of characters
   *
   * @private
   * @param  {jQuery} $field   the field being checked
   * @param  {String} value    the field value
   * @param  {String} minlength Validation parameters
   * @return {Object}          Validity object
   */
  Validation.prototype._validateMinLength = function($field, value, minlength) {
    var validity = { name: 'minlength' };
    // Check for more than 0 otherwise we clash with 'isEmpty'
    if (value.length > 0 && value.length < minlength) {
      validity.isInvalid = true;
    }

    return validity;
  };

  /**
   * Get the index in the error array according to the field ID
   *
   * @private
   * @param  {String} fieldID Field ID
   * @return {Integer}    Index in errors array
   */
  Validation.prototype._getErrorIndexByID = function(fieldID) {
    var matchedErrorIndex = -1;
    $.each(this.errors, $.proxy(function(index, fieldValidity) {
      var _fieldID = fieldValidity.$field.attr('id');
      if (_fieldID === fieldID) {
        matchedErrorIndex = index;
        return;
      }
    }, this));

    return matchedErrorIndex;
  };

  /**
   * Sort the errors so they are in line with the order the fields are displayed on the page
   * regardless of the order they were 'created'
   *
   * If the user fills in the form bottom-to-top, then the first error will still be the
   * first field on the page.
   *
   * @private
   * @return {Validation} Class Instance
   */
  Validation.prototype._sortErrorsByFieldDisplayOrder = function() {
    var sortedErrors = [];

    this.$allFieldsOnPage.each($.proxy(function(i, o) {
      var $field = $(o),
          fieldID = $field.attr('id'),
          fieldErrorIndex = this._getErrorIndexByID(fieldID);

      if (fieldErrorIndex !== -1) {
        sortedErrors.push(this.errors[fieldErrorIndex]);
      }
    }, this));

    this.errors = sortedErrors;
    return this;
  };

  /**
   * Inline errors are shown on input blur
   *
   * @private
   * @param  {Event} e BlurEvent
   * @return {void}
   */
  Validation.prototype._handleBlurEvent = function(e) {
    this.checkFieldValidity($(e.target));
  };

  /**
   * Error messages get corrected as the user types. Only do this if we can see an error exists.
   *
   * @private
   * @param  {Object} e ChangeEvent
   * @return {void}
   */
  Validation.prototype._handleChangeEvent = function(e) {
    var $field = $(e.target);

    if (this._getErrorIndexByID($field.attr('id')) > -1) {
      this.checkFieldValidity($field);
    }
  };

  /**
   * The validation summary is updated on form submit
   *
   * @private
   * @return {void}
   */
  Validation.prototype._handleSubmit = function(e) {
    this.$allFieldsOnPage.each($.proxy(function(i, field) {
      this.checkFieldValidity($(field));
    }, this));

    if (this.errors.length) {
      e.preventDefault();
      this._sortErrorsByFieldDisplayOrder().refreshValidationSummary()._showValidationSummary();
    }
  };


  return Validation;

});
