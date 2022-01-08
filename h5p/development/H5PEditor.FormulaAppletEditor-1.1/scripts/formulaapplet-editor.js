/**
 * FormulaAppletEditor widget module
 *
 * @param {H5P.jQuery} $
 */


var H5P = H5P || {};
console.log('Here is formulaapplet-editor.js 1.1 (Docker)');

//TODO get rid of global variables
var selectionArray = [];

H5PEditor.widgets.formulaAppletEditor = H5PEditor.FormulaAppletEditor = (function ($) {

  /**
   * Creates and edits a FormulaApplet.
   *
   * @class H5PEditor.FormulaAppletEditor
   * @param {Object} parent
   * @param {Object} field
   * @param {Object} params
   * @param {function} setValue
   */
  function FormulaAppletEditor(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;

    this.changes = [];
  }

  // /**
  //  * Provide parent parameters 
  //  * @public
  //  * @param {H5P.jQuery} 
  //  */
  // FormulaAppletEditor.prototype.provideParentParams = function () {
  //   var self = this;
  //   return self.parent.params;
  // }

  /**
   * Append the field to the wrapper. 
   * @public
   * @param {H5P.jQuery} $wrapper
   */
  FormulaAppletEditor.prototype.appendTo = function ($wrapper) {
    var self = this;
    const id = ns.getNextFieldId(this.field);
    var params = self.parent.params;
    // params.TEX_expression = params.fa_applet;

    var hasSolution = (params.formulaAppletMode == 'manu');
    if (typeof params.id == 'undefined') {
      params.id = 'new_id';
    }
    var html = '<p class="formula_applet" id="' + params.id + '-edit"';
    if (params.formulaAppletPhysics == true) {
      html += ' mode="physics"';
    }
    var solution = '';
    if (hasSolution) {
      html += ' data-b64="' + params.data_b64 + '"';
      solution = H5Pbridge.decode(params.data_b64);
    }
    var temp = params.TEX_expression;
    if (typeof temp == 'undefined') {
      temp = '17 + {{result}} = 21';
    }
    temp = temp.replace(/{{result}}/g, '\\class{inputfield}{' + solution + '}');
    html += '>';
    var span = '<span id="math-field">' + temp + '</span>';
    html += span;
    html += '<\p>';
    var commit_number = H5Pbridge.getCommitNumber();
    html += '<p>commit number:' + commit_number + '</p>';

    console.log('Assembled html: ' + html);

    var fieldMarkup = H5PEditor.createFieldMarkup(this.field, html, id);
    self.$item = H5PEditor.$(fieldMarkup);
    self.$formulaApplet = self.$item.find('.formula_applet');

    self.config = {
      appendTo: self.$item[0],
      preferredFormat: 'hex',
      expression: self.getExpression(),
      change: function (expression) {
        self.setExpression(expression);
        console.log('change: ' + expression);
      },
      hide: function (expression) {
        // Need this to get expression if cancel is clicked
        self.setExpression(expression);
        console.log('hide: ' + expression);
      }
    };

    self.config.change('formula applet changed');
    $wrapper.append(self.$item);

    var $button = H5P.JoubelUI.createButton({
      title: 'set_input_field',
      text: 'Set input field',
      click: function (event) {
        event.preventDefault();
        console.log("H5Pbridge.editorAction setInputField");
        H5Pbridge.editorAction("setInputField");
      }
    });
    $button.attr('id', '#set-input-h5p');
    $wrapper.append($button);
    $button.on('mouseover', buttonMouseoverHandler);

    function buttonMouseoverHandler(ev) {
      ev.stopImmediatePropagation();
      ev.preventDefault();
      console.log("H5Pbridge.editorAction setInputFieldMouseover");
      H5Pbridge.editorAction("setInputFieldMouseover");
    };

    $(function () {
      //code that needs to be executed when DOM is ready, after manipulation, goes here
      var texinputparent = H5P.jQuery('div.field.field-name-TEX_expression.text input').parent();
      texinputparent.append('<br><br><textarea id="html-output" rows="4" cols="150" disabled>output</textarea>');
      texinputparent.append('<br><p id="data_b64_tricky"></p>');
      afterAppend(self);
      waitForMainThenDo(afterMainIsLoaded);
    });
  };

  async function afterMainIsLoaded() {
    // this code is executed if main is loaded
    console.log('MAIN is loaded');
    await H5Pbridge.preparePage();
    var id = getputId.get();
    console.log('getputId.get: id=' + id);
    // debugger;
    if (id !== 'nothingToDo') {
      console.log('H5Pbridge.editorAction idChanged with id=' + id);
      H5Pbridge.editorAction("idChanged", id);
      // var editorFapp = H5Pbridge.get_editorFapp();
      // editorFapp.id = id;
    }
    // H5Pbridge.editorAction("testAction", "dummy data");
    var elem = document.getElementById('new_id-edit');
    if (elem !== null) {
      console.log('change id of element "new_id-edit"');
      console.log(elem);
      H5P.jQuery(elem).attr('id', id)
      console.log(elem);
    }
    console.log('H5Pbridge.editorAction refresh');
    H5Pbridge.editorAction("refresh");
  }

  /**
   * Hide expression selector
   * @method hide
   */
  FormulaAppletEditor.prototype.hide = function () {
    // this.$formulaApplet.spectrum('hide');
  };
  /**
   * Save the expression
   *
   * @param {Object} expression
   */
  FormulaAppletEditor.prototype.setExpression = function (expression) {
    // Save the value, allow null
    this.params = (expression === null ? null : expression);
    this.setValue(this.field, this.params);

    this.changes.forEach(function (cb) {
      cb(this.params);
    })
  };

  FormulaAppletEditor.prototype.getExpression = function () {
    var isEmpty = (this.params === null || this.params === "");
    return isEmpty ? null : this.params;
  };

  FormulaAppletEditor.prototype.getparentParams = function () {
    var pp = this.parent.params;
    var isEmpty = (pp === null || pp === "");
    console.log('parent parameters:');
    console.log(pp);
    return isEmpty ? 'null' : pp;
  };

  /**
   * Validate the current values.
   */
  FormulaAppletEditor.prototype.validate = function () {
    this.hide();
    return (this.params !== undefined && this.params.length !== 0);
  };

  FormulaAppletEditor.prototype.remove = function () {};
  return FormulaAppletEditor;
})(H5P.jQuery);

async function afterAppend(obj) {
  console.log('afterAppend');

  // generate new id if necessary (new applet), and spread it
  try {
    var idField = getField('id');
    console.log('idField.value=' + idField.value);
    if (idField.value == 'new_id') {
      var newId = H5Pbridge.randomId(12);
      console.log('new_id -> ' + newId);
      idField.value = newId;
      idField.$input[0].value = newId;
      console.log('obj.parent.params.id=' + obj.parent.params.id);
      obj.parent.params.id = newId;
      console.log('obj.parent.params.id=' + obj.parent.params.id);
      // H5Pbridge.editorAction(["idChanged", newId]); //wait for main to be loaded
      console.log('getputId.put ' + newId);
      getputId.put(newId);
    } else {
      console.log('getputId.put nothingToDo');
      getputId.put('nothingToDo');
    }
  } catch (error) {
    console.error('ERROR: ' + error);
  }

  // htmloutput is updated by editor.js: showEditorResults
  // https://stackoverflow.com/questions/27541004/detect-paragraph-element-change-with-jquery
  // TODO use Mutation Observer instead of DOMSubtreeModified

  H5P.jQuery(document).on('DOMSubtreeModified', '#data_b64_tricky', function (ev) {
    // console.log('#data_b64_tricky: DOMSubtreeModified');
    var b64 = ev.target.innerHTML;
    // get DOM object by name
    var data_b64 = getField('data_b64');
    // synchronize DOM
    data_b64.$input[0].value = b64;
    // set value of data_b64 field
    obj.parent.params['data_b64'] = b64;
    console.log("obj.parent.params['data_b64']=" + obj.parent.params['data_b64']);
  });

  function getField(name) {
    var children = obj.parent.children;
    var result;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.field.name == name) {
        result = child;
        i = children.length; //short circuit
      }
    }
    return result;
  }

  // still afterAppend...
  console.log('obj.parent.params');
  console.log(obj.parent.params);
  console.log('obj.parent.params.TEX_expression=' + obj.parent.params.TEX_expression);

  // texinput is updated by editor.js: showEditorResults
  var texinput = H5P.jQuery('div.field.field-name-TEX_expression.text input')[0];
  texinput.addEventListener('input', updateTexinputEventHandler);

  function updateTexinputEventHandler(event) {
    obj.parent.params['TEX_expression'] = event.target.value;
    var msg;
    if (event.isTrusted) {
      msg = ' event caused by keyboard input';
      event.preventDefault();
    } else {
      msg = ' event caused by input to FormulaApplet';
      console.log(obj);
      console.log(obj.parent.params['data_b64']);
      //event caused by JavaScript, especially input to FormulaApplet: let event be captured
    }
    console.log('TEX_expression changed: ' + event.target.value + msg);
    //TODO update formulaAppletEditor widget
    // cannot update formulaAppletEditor widget , because editorMf and editorMf.latex() is not available
  }

  var checkbox = document.getElementById(getSelectorID('field-formulaappletphysics'));
  checkbox.addEventListener('change', function () {
    if (this.checked) {
      console.log("Physics Mode");
    } else {
      console.log("Math Mode");
    }
  });

  var formulaAppletMode = document.getElementById(getSelectorID('field-formulaappletmode'));
  formulaAppletMode.addEventListener('change', function (_e) {
    // mode=auto means hasSolution=false  mode=manu means hasSolution=true
    sendModeTofApp();
  });

  // first time at init
  sendModeTofApp();

  function sendModeTofApp() {
    var mode = obj.parent.params['formulaAppletMode'];
    console.log('H5Pbridge.editorAction setMode: ' + mode);
    H5Pbridge.editorAction('setMode', mode);
  }

  // hide field-name-id
  H5P.jQuery('.field-name-id').css('display', 'none');
  // hide field-name-data_b64
  H5P.jQuery('.field-name-data_b64').css('display', 'none');
  // console.log('make data_b64_tricky invisible');
  H5P.jQuery('#data_b64_tricky').css('display', 'none');
  var tex_expr = document.getElementById(getSelectorID('field-tex_expression'));
  // https://www.educba.com/jquery-disable-input/
  H5P.jQuery(tex_expr).attr('disabled', 'disabled');

} // end of afterAppend


// Start of waitForMain mechanism
//TODO get rid of global var
var try_counter = 0;
var try_counter_limit = 10;

function waitForMainThenDo(cont) {
  var mainIsLoaded = false;
  try {
    mainIsLoaded = H5Pbridge.mainIsLoaded();
  } catch (error) {
    console.log(try_counter);
    console.log(H5Pbridge);
  }
  if (mainIsLoaded) {
    // execute callback
    cont();
  } else {
    try_counter++;
    console.info(`waitFarMain try_counter=${try_counter}`);
    if (try_counter < try_counter_limit) {
      setTimeout(function () {
        // recurse
        waitForMainThenDo(cont);
      }, 300);
    } else {
      console.error('waitForMainThenDo: Timeout');
      // optimistic approach
      afterMainIsLoaded();
    }
  }
}
// End of waitForMain mechanism


function getSelectorID(selectorName) {
  var result = '';
  H5P.jQuery('select').each(function () {
    var haystack = (this.id).toLowerCase();
    var needle = selectorName.toLowerCase();
    if (haystack.startsWith(needle)) {
      result = this.id;
    }
  });
  if (result == '') {
    H5P.jQuery('input').each(function () {
      var haystack = (this.id).toLowerCase();
      var needle = selectorName.toLowerCase();
      if (haystack.startsWith(needle)) {
        result = this.id;
      }
    });
  }
  return result;

}

//TODO get rid of global vars
const getputId = {
  idStore: '',
  get: function () {
    return idStore;
  },
  put: function (id) {
    idStore = id
  }
};