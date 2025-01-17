import $ from 'jquery';

import {Base} from '../Base';

export const ConfigurationEditorTab = Base.extend({
  selector: '.configuration_editor_tab',

  inputPropertyNames: function() {
    return this.$el.find('.input').map(function() {
      return $(this).data('inputPropertyName');
    }).get();
  },

  visibleInputPropertyNames: function() {
    return this.$el.find('.input:not(.input-hidden_via_binding)').map(function() {
      return $(this).data('inputPropertyName');
    }).get();
  },

  inputLabels: function() {
    return this.$el.find('.input').map(function() {
      return $(this).data('labelText');
    }).get();
  },

  inlineHelpTexts: function() {
    return this.$el.find('.input').map(function() {
      return $(this).data('inlineHelpText');
    }).get();
  }
});
