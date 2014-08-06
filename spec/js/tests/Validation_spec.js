describe('Validation', function() {

  'use strict';

  function focusInOut($input) {
    $input.focus().blur();
  }

  describe('Without Server Markup', function() {
    beforeEach(function(done) {
      var self = this;
      requirejs(
          ['jquery', 'Validation'],
          function($, Validation) {
            self.$html = $(window.__html__['test/fixtures/Validation/NoServerMarkup.html']).appendTo('body');
            self.component = self.$html.find('[data-dough-component="Validation"]');
            self.Validation = Validation;
            done();
          }, done);
    });

    afterEach(function() {
      this.$html.remove();
    });

    it('generates a fallback validation summary list', function() {
      var validation = new this.Validation(this.component).init();
      expect(validation.$el.find('.' + validation.config.validationSummaryClass).length).to.equal(1);
    });

    it('generates an inline message when does not exist', function() {
      var validation = new this.Validation(this.component).init();
      expect(validation.$el.find('.' + validation.config.inlineErrorClass).length).to.equal(1);
    });
  });

  describe('With existing Server Markup', function() {
    beforeEach(function(done) {
      var self = this;
      requirejs(
          ['jquery', 'Validation'],
          function($, Validation) {
            self.$html = $(window.__html__['test/fixtures/Validation/WithServerMarkup.html']).appendTo('body');
            self.component = self.$html.find('[data-dough-component="Validation"]');
            self.Validation = Validation;
            done();
          }, done);
    });

    afterEach(function() {
      this.$html.remove();
    });

    it('does not generate a fallback validation-summary', function() {
      var validation = new this.Validation(this.component).init();
      expect(validation.$el.find('.' + validation.config.validationSummaryClass).length).to.equal(1);
    });

    it('does not generate an inline message when exists already', function() {
      var validation = new this.Validation(this.component).init();
      expect(validation.$el.find('.' + validation.config.inlineErrorClass).length).to.equal(1);
    });
  });



  // Basic required field
  describe('with a required field', function() {
    beforeEach(function(done) {
      var self = this;
      requirejs(
          ['jquery', 'Validation'],
          function($, Validation) {
            self.$html = $(window.__html__['spec/js/fixtures/Validation/NonEmpty.html']).appendTo('body');
            self.component = self.$html.find('[data-dough-component="Validation"]');
            self.Validation = Validation;
            done();
          }, done);
    });

    afterEach(function() {
      this.$html.remove();
    });

    it('shows the correct inline error if left empty on blur', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeEmpty);

      focusInOut($input);

      expect(validation.$el.find('.' + validation.config.inlineErrorClass + ':contains("' + errorLookingFor + '")').length).to.equal(1);
    });

    it('adds the is-errored class to the parent form__row', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input');

      focusInOut($input);

      expect($input.parents('.form__row')).to.have.class(validation.config.rowInvalidClass);
    });

    it('shows the validation summary if left empty on submit', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummary = validation.$el.find('.' + validation.config.validationSummaryClass);

      validation.$el.submit();

      expect($validationSummary).to.not.have.class(validation.config.validationSummaryHiddenClass);
    });

    it('does not show the validation summary if the form has not been submitted', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummary = validation.$el.find('.' + validation.config.validationSummaryClass);

      expect($validationSummary).to.have.class(validation.config.validationSummaryHiddenClass);
    });

    it('adds the error to the validation summary list if left empty on submit', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeEmpty),
          $validationSummaryList = validation.$el.find('.' + validation.config.validationSummaryListClass);

      validation.$el.submit();

      expect($validationSummaryList.find('li')).to.have.text(errorLookingFor);
    });

    it('removes all relevant errors and error states if value corrected as the user types', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeEmpty),
          $validationSummaryList = validation.$el.find('.' + validation.config.validationSummaryListClass),
          $inlineError = validation.$el.find('.' + validation.config.inlineErrorClass);

      validation.$el.submit();
      $input.val('test').keyup();

      expect($input.parents('.form__row')).not.to.have.class(validation.config.rowInvalidClass);
      expect($validationSummaryList.filter(':contains("' + errorLookingFor + '")').length).to.equal(0);
      expect($inlineError.filter(':contains("' + errorLookingFor + '")').length).to.equal(0);
    });

    it('allows the form to submit if the value is filled in', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummaryList = validation.$el.find('.' + validation.config.validationSummaryListClass);

      $input.val('test');
      validation.$el.submit();

      expect($validationSummaryList.find('li').length).to.equal(0);
    });
  });



  // Minimum length check
  describe('MinLength', function() {
    beforeEach(function(done) {
      var self = this;
      requirejs(
          ['jquery', 'Validation'],
          function($, Validation) {
            self.$html = $(window.__html__['spec/js/fixtures/Validation/MinLength.html']).appendTo('body');
            self.component = self.$html.find('[data-dough-component="Validation"]');
            self.Validation = Validation;
            done();
          }, done);
    });

    afterEach(function() {
      this.$html.remove();
    });

    it('shows the correct inline error if not enough chars on blur', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeInvalid);

      $input.val('te');
      focusInOut($input);

      expect(validation.$el.find('.' + validation.config.inlineErrorClass + ':contains("' + errorLookingFor + '")').length).to.equal(1);
    });

    it('adds the is-errored class to the parent form__row', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input');

      $input.val('te');
      focusInOut($input);

      expect($input.parents('.form__row')).to.have.class(validation.config.rowInvalidClass);
    });

    it('shows the validation summary if not enough chars on submit', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummary = validation.$el.find('.' + validation.config.validationSummaryClass);

      $input.val('te');
      validation.$el.submit();

      expect($validationSummary).to.not.have.class(validation.config.validationSummaryHiddenClass);
    });

    it('does not show the validation summary if the form has not been submitted', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummary = validation.$el.find('.' + validation.config.validationSummaryClass);

      expect($validationSummary).to.have.class(validation.config.validationSummaryHiddenClass);
    });

    it('adds the error to the validation summary list if not enough chars on submit', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeInvalid),
          $validationSummaryList = validation.$el.find('.' + validation.config.validationSummaryListClass);

      $input.val('te');
      validation.$el.submit();

      expect($validationSummaryList.find('li')).to.have.text(errorLookingFor);
    });

    it('removes all relevant errors and error states if value corrected as the user types', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeInvalid),
          $validationSummaryList = validation.$el.find('.' + validation.config.validationSummaryListClass),
          $inlineError = validation.$el.find('.' + validation.config.inlineErrorClass);

      validation.$el.submit();
      $input.val('tested').keyup();

      expect($input.parents('.form__row')).not.to.have.class(validation.config.rowInvalidClass);
      expect($validationSummaryList.filter(':contains("' + errorLookingFor + '")').length).to.equal(0);
      expect($inlineError.filter(':contains("' + errorLookingFor + '")').length).to.equal(0);
    });

    it('allows the form to submit if the value is filled in', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummaryList = validation.$el.find('.' + validation.config.validationSummaryListClass);

      $input.val('tested');
      validation.$el.submit();

      expect($validationSummaryList.find('li').length).to.equal(0);
    });
  });


  // Regular expression check
  describe('RegExp', function() {
    beforeEach(function(done) {
      var self = this;
      requirejs(
          ['jquery', 'Validation'],
          function($, Validation) {
            self.$html = $(window.__html__['spec/js/fixtures/Validation/RegExp.html']).appendTo('body');
            self.component = self.$html.find('[data-dough-component="Validation"]');
            self.Validation = Validation;
            done();
          }, done);
    });

    afterEach(function() {
      this.$html.remove();
    });

    it('shows the correct inline error if the regexp does not match', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeInvalid);

      $input.val('test');
      focusInOut($input);

      expect(validation.$el.find('.' + validation.config.inlineErrorClass + ':contains("' + errorLookingFor + '")').length).to.equal(1);
    });

    it('adds the is-errored class to the parent form__row', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input');

      $input.val('test');
      focusInOut($input);

      expect($input.parents('.form__row')).to.have.class(validation.config.rowInvalidClass);
    });

    it('shows the validation summary if the regexp does not match on submit', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummary = validation.$el.find('.' + validation.config.validationSummaryClass);

      $input.val('test');
      validation.$el.submit();

      expect($validationSummary).to.not.have.class(validation.config.validationSummaryHiddenClass);
    });

    it('does not show the validation summary if the form has not been submitted', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummary = validation.$el.find('.' + validation.config.validationSummaryClass);

      expect($validationSummary).to.have.class(validation.config.validationSummaryHiddenClass);
    });

    it('adds the error to the validation summary list if invalid on submit', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeInvalid),
          $validationSummaryList = validation.$el.find('.' + validation.config.validationSummaryListClass);

      $input.val('test');
      validation.$el.submit();

      expect($validationSummaryList.find('li')).to.have.text(errorLookingFor);
    });

    it('removes all relevant errors and error states if value corrected as the user types', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeInvalid),
          $validationSummaryList = validation.$el.find('.' + validation.config.validationSummaryListClass),
          $inlineError = validation.$el.find('.' + validation.config.inlineErrorClass);

      validation.$el.submit();
      $input.val('test@tested.com').keyup();

      expect($input.parents('.form__row')).not.to.have.class(validation.config.rowInvalidClass);
      expect($validationSummaryList.filter(':contains("' + errorLookingFor + '")').length).to.equal(0);
      expect($inlineError.filter(':contains("' + errorLookingFor + '")').length).to.equal(0);
    });

    it('allows the form to submit if the value is filled in', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummaryList = validation.$el.find('.' + validation.config.validationSummaryListClass);

      $input.val('test@tested.com');
      validation.$el.submit();

      expect($validationSummaryList.find('li').length).to.equal(0);
    });
  });


  // Number range check
  describe('NumberRange', function() {
    beforeEach(function(done) {
      var self = this;
      requirejs(
          ['jquery', 'Validation'],
          function($, Validation) {
            self.$html = $(window.__html__['spec/js/fixtures/Validation/NumberRange.html']).appendTo('body');
            self.component = self.$html.find('[data-dough-component="Validation"]');
            self.Validation = Validation;
            done();
          }, done);
    });

    afterEach(function() {
      this.$html.remove();
    });

    it('shows the correct inline error if the number is too low', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeInvalid);

      $input.val('0');
      focusInOut($input);

      expect(validation.$el.find('.' + validation.config.inlineErrorClass + ':contains("' + errorLookingFor + '")').length).to.equal(1);
    });

    it('shows the correct inline error if the number is too high', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeInvalid);

      $input.val('6');
      focusInOut($input);

      expect(validation.$el.find('.' + validation.config.inlineErrorClass + ':contains("' + errorLookingFor + '")').length).to.equal(1);
    });

    it('shows the correct inline error if the value is not a number', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeInvalid);

      $input.val('test');
      focusInOut($input);

      expect(validation.$el.find('.' + validation.config.inlineErrorClass + ':contains("' + errorLookingFor + '")').length).to.equal(1);
    });

    it('adds the is-errored class to the parent form__row', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input');

      $input.val('0');
      focusInOut($input);

      expect($input.parents('.form__row')).to.have.class(validation.config.rowInvalidClass);
    });

    it('shows the validation summary if the number is too low on submit', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummary = validation.$el.find('.' + validation.config.validationSummaryClass);

      $input.val('0');
      validation.$el.submit();

      expect($validationSummary).to.not.have.class(validation.config.validationSummaryHiddenClass);
    });

    it('shows the validation summary if the number is too high on submit', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummary = validation.$el.find('.' + validation.config.validationSummaryClass);

      $input.val('6');
      validation.$el.submit();

      expect($validationSummary).to.not.have.class(validation.config.validationSummaryHiddenClass);
    });

    it('shows the validation summary if the value is not a number on submit', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummary = validation.$el.find('.' + validation.config.validationSummaryClass);

      $input.val('test');
      validation.$el.submit();

      expect($validationSummary).to.not.have.class(validation.config.validationSummaryHiddenClass);
    });

    it('does not show the validation summary if the form has not been submitted', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummary = validation.$el.find('.' + validation.config.validationSummaryClass);

      expect($validationSummary).to.have.class(validation.config.validationSummaryHiddenClass);
    });

    it('adds the error to the validation summary list if invalid on submit', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeInvalid),
          $validationSummaryList = validation.$el.find('.' + validation.config.validationSummaryListClass);

      $input.val('6');
      validation.$el.submit();

      expect($validationSummaryList.find('li')).to.have.text(errorLookingFor);
    });

    it('removes all relevant errors and error states if value corrected as the user types', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          errorLookingFor = $input.attr(validation.config.attributeInvalid),
          $validationSummaryList = validation.$el.find('.' + validation.config.validationSummaryListClass),
          $inlineError = validation.$el.find('.' + validation.config.inlineErrorClass);

      validation.$el.submit();
      $input.val('3').keyup();

      expect($input.parents('.form__row')).not.to.have.class(validation.config.rowInvalidClass);
      expect($validationSummaryList.filter(':contains("' + errorLookingFor + '")').length).to.equal(0);
      expect($inlineError.filter(':contains("' + errorLookingFor + '")').length).to.equal(0);
    });

    it('allows the form to submit if the value is filled in', function() {
      var validation = new this.Validation(this.component).init(),
          $input = validation.$el.find('#input'),
          $validationSummaryList = validation.$el.find('.' + validation.config.validationSummaryListClass);

      $input.val('3');
      validation.$el.submit();

      expect($validationSummaryList.find('li').length).to.equal(0);
    });
  });

});