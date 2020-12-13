// This is prepare_page.js

var prepare_page_exists = true;
var precision = 0.000001;
var activeMathfieldIndex = '';
var MQ = '';
var FAList = [];
var new_fa_id = 'x8rT3dkkS';
var result_mode = '';
class FA {
  constructor() {
    this.index = '';
    this.id = '';
    this.formula_applet = '';
    this.hasSolution = '';
    this.solution = '';
    this.mqEditableField = '';
    this.mathField = '';
    this.hammer = '';
    this.definitionset_list= [];
  }
}

// prepare_page() is called by glue.js
function prepare_page() {
  // dirty hack
  if (typeof (isWiki) === 'undefined') {
    isWiki = true;
  }
  console.log('isWiki=' + isWiki);
  // waits for MathQuill to load
  $("img.mod").remove();
  ($('<img class="mod">')).insertAfter($(".formula_applet"));
  $(document).ready(function () {
    mathQuillify();
    initTranslation();
  })

  $('body').on('keyup', function(ev) {
    var key = ev.originalEvent.key;
    // console.log(ev);
    // console.log(kev.key, kev.metaKey, kev.ctrlKey);
    if(key == 'Tab'){
      var fa = $(ev.target).parents('.formula_applet');
      var id = $(fa).attr('id');
      console.log(id);
      // for (var i = 0; i < FAList.length; i++){
      //   var fapp = FAList[i];
      //   fapp.formula_applet.click();
      // }
      fa.click();
    }
  });
  // testcreateReplacement();
}

// function isAndr() cannot be moved to glue.js because
// glue.js is executed but not stored at test.mathebuch-online.de/wiki

function isAndr() {
  return (navigator.userAgent.toUpperCase().indexOf('ANDROID') !== -1);
}

function keyboardEvent(cmd) {
  console.log('prepare_page activeMathfieldIndex=' + activeMathfieldIndex);
  var FApp = FAList[activeMathfieldIndex];
  var mf = FApp.mathField;
  // var fa = FApp.formula_applet;
  // var mqEditableField = FApp.mqEditableField;

  if (typeof mf !== 'undefined') {
    console.log(cmd);
    var endsWithSpace = false;
    if ((cmd.substr(cmd.length - 1)) == ' ') {
      endsWithSpace = true;
      // remove space from end of cmd
      cmd = cmd.substring(0, cmd.length - 1);
    }
    if (cmd.startsWith('#')) {
      // remove # from start of cmd
      cmd = cmd.substring(1);
      if (cmd == 'Enter') {
        editHandler(activeMathfieldIndex, 'enter');
      }
      else if(cmd == 'set_unit') {
        set_unit();
      }
      else if(cmd == 'erase_unit') {
        erase_unit();
      }
      else {
        mf.keystroke(cmd);
      }
    } else {
      // no #
      mf.typedText(cmd);
      // $(mqEditableField).click();
      // mf.typedText(' ');
      // mqEditableField.focus();
    }
    if (endsWithSpace) {
      mf.typedText(' ');
      mf.keystroke('Backspace');
    }
  }
}

function check_if_equal(id, a, b, ds_list) {
  console.log(a + ' ?=? ' + b);
  var equ = a + '=' + b;
  check_if_equality(id, equ, ds_list);
}

function check_if_equality(id, equ, ds_list) {
  var myTree = parse(equ);
  console.log(ds_list);
  // if(ds_list.length > 0){
    
  // }
  var almostOne = value(myTree);
  var dif = Math.abs(almostOne - 1);
  console.log('dif=' + dif);
  if (dif < precision) {
    $('#' + id).removeClass('mod_wrong').addClass('mod_ok');
  } else {
    $('#' + id).removeClass('mod_ok').addClass('mod_wrong');
  }
}

function editHandler(index) {
  var fa = $(".formula_applet")[index];
  // var index = $(".formula_applet").index($('#' + id));
  var mf = FAList[index].mathField;
  var mf_container = MQ.StaticMath(FAList[index].formula_applet);
  // console.log(fa);
  var solution = FAList[index].solution;
  var hasSolution = FAList[index].hasSolution;
  var id = FAList[index].id; // name of formula_applet
  var ds_list = FAList[index].definitionset_list;
  // console.log(id + ' index=' + index + ' hasSolution=' + hasSolution + ' mode=' + entermode);
  if (hasSolution) {
    // out = mf.latex() + ' ' + solution;
    check_if_equal(id, mf.latex(), solution, ds_list);
  } else {
    // out = mf_container.latex();
    check_if_equality(id, mf_container.latex(), ds_list);
  }
  // document.getElementById('output').innerHTML = out;
};

// function storeSolution(sol, ind) {
//   console.log(ind + ' solution: ' + sol);
//   FAList[ind].solution = sol;
// }

var editor_mf = '';

function mathQuillify() {
  MQ = MathQuill.getInterface(2);
  vkbd_init();
  $(".formula_applet").each(function () {
    var FApp = new FA();
    var index = $(".formula_applet").index(this);
    FApp.index = index;
    FApp.id = $(this).attr('id') // name of formula_applet
    var def = $(this).attr('def');
    if (typeof def !== 'undefined'){
      FApp.definitionset_list = unify_definitionsets(def);
      console.log(FApp.definitionset_list);
    } 
    var isEditor = (FApp.id.toLowerCase() == 'editor');
    // console.log('isEditor=' + isEditor);
    FApp.formula_applet = this;
    $(this).click(function () {
      $(".formula_applet").removeClass('selected');
      $(this).addClass('selected');
      // var id = $(this).attr('id');
      // activeMathfieldIndex = $(".formula_applet").index($('#' + id));
      activeMathfieldIndex = FApp.index;
      // console.log(activeMathfieldIndex);
    });
    FAList[index] = FApp;

    if (isEditor) {
      // *** editor ***
      // var eraseclass = '';

      console.log('init editor');
      prepend();
      // make whole mathFieldSpan editable
      var mathFieldSpan = document.getElementById('math-field');
      MQ = MathQuill.getInterface(2);
      editor_mf = MQ.MathField(mathFieldSpan, {
        spaceBehavesLikeTab: true, // configurable
        handlers: {
          edit: function () { // useful event handlers
            show_editor_results(editor_edithandler(editor_mf.latex()));
          }
        }
      });
      FApp.mathField = editor_mf;
      // console.log(editor_mf);

      var mqEditableField = $('#editor').find('.mq-editable-field')[0];
      // console.log(mqEditableField);

      // show output-codes before first edit
      // show_editor_results(editor_edithandler(editor_mf.latex()));
      set_input_event();
      set_unit_event();
      erase_unit_event();

      // $('#random-id').click(function (ev) {
      $('#random-id').on('mousedown', function (ev) {
        ev.preventDefault();
        console.log('random-id');
        var r_id = makeid(8);
        // console.log(r_id);
        document.getElementById('fa_name').value = r_id;
        new_fa_id = r_id;
        show_editor_results(editor_edithandler(editor_mf.latex()));
      });

      $('#fa_name').on('input', function (ev) {
        var fa_name = ev.target.value;
        console.log('fa_name=' + fa_name);
        // avoid XSS
        fa_name = fa_name.replace(/</g, '');
        fa_name = fa_name.replace(/>/g, '');
        fa_name = fa_name.replace(/"/g, '');
        fa_name = fa_name.replace(/'/g, '');
        fa_name = fa_name.replace(/&/g, '');
        fa_name = fa_name.replace(/ /g, '_');
        console.log(fa_name);
        if (fa_name !== '') {
          new_fa_id = fa_name;
        }
      });

      $('input[type="radio"]').on('click', function (ev) {
        result_mode = ev.target.id;
        if (result_mode == 'auto') {
          $('span.mq-class.inputfield').prop('contentEditable', 'false');

        }
        if (result_mode == 'manu') {
          $('span.mq-class.inputfield').prop('contentEditable', 'true');

        }
        console.log(result_mode);
        $('#set-input').mousedown();
      });
      $('#random-id').mousedown();
      $('input[type="radio"]#manu').click();
    } else {
      //******************
      // *** no editor ***
      MQ.StaticMath(this);
      if ($(this).attr('data-b64') !== undefined) {
        FApp.hasSolution = true;
        var zip = $(this).attr('data-b64');
        // storeSolution(decode(zip), index);
        FAList[index].solution = decode(zip);

        // base64_zip_decode(zip, function (decoded) {
        //   // storeSolution(decoded, index);
        // });
      } else {
        FApp.hasSolution = false;
      };
      var mqEditableField = $(this).find('.mq-editable-field')[0];
      var mf = MQ.MathField(mqEditableField, {});
      mf.config({
        handlers: {
          edit: function () {
            mqEditableField.focus();
            console.log('edit ' + index);
            editHandler(index);
          },
          enter: function () {
            editHandler(index);
          },
          // select: function () {
          //   console.log('select ' + index);
          // }
        }
      });
      FApp.mathField = mf;
      // console.log(index);
      // console.log(FApp);
    }
    FApp.mqEditableField = mqEditableField;
    // $(mqEditableField).on('focus blur select', function(ev){  
    //   console.log(ev.target);
    // });
    FApp.hammer = new Hammer(mqEditableField);
    FApp.hammer.on("doubletap", function (ev) {
      console.log(index + ' ' + ev.type);
      vkbd_show();
    });
    FApp.hammer.on("press", function (ev) {
      console.log(index + ' ' + ev.type);
      // vkbd_show();
    });
  });
  // prepend();
}

function unify_definitionsets(def){
  console.log(def);
  def = def.replace(/\s/g, "");
  console.log(def);
  var ds_list = def.split("&&");
  for(var i=0; i < ds_list.length; i++){
    var ds = ds_list[i];
    var result = '';
    if (ds.indexOf('>') > -1){
      var temp = ds.split('>');
      result = temp[0] + '-' + temp[1];
    }
    if (ds.indexOf('<') > -1){
      var temp = ds.split('<');
      result = temp[1] + '-' + temp[0];
    }
    ds_list[i] = result;
    console.log(result);
  }
  return ds_list;
}

function get_selection(mf, eraseClass) {
  // typeOf mf = mathField
  console.log(mf);
  var ori = mf.latex();
  console.log('ori=' + ori);
  // erase class{inputfield}
  var erased = ori;
  if (eraseClass) {
    erased = erase_class(ori);
  }
  console.log(erased);
  var replacement = createReplacement(ori);
  if (ori.indexOf(replacement) == -1) {
    // replacement has to be done before erase of class{...
    // Do replacement!
    mf.typedText(replacement);
    // erase class{inputfield}
    var replaced_and_erased = mf.latex();
    if (eraseClass) {
      replaced_and_erased = erase_class(replaced_and_erased);
    }
    // console.log(replaced_and_erased);
    var pre_selected = '?';
    var selected = '?';
    var post_selected = '?';
    var pos = replaced_and_erased.indexOf(replacement);
    pre_selected = replaced_and_erased.substring(0, pos);
    // selected = replacement
    post_selected = replaced_and_erased.substring(pos + replacement.length);
    // Delete pre_selected from beginning of erased
    // and delete post_selected from end of erased
    var check = erased.substr(0, pre_selected.length);
    if (check !== pre_selected) {
      console.log('Something went wrong with replacement of input field');
    }
    erased = erased.substring(pre_selected.length);
    check = erased.substring(erased.length - post_selected.length);
    if (check !== post_selected) {
      console.log('Something went wrong with replacement of input field');
    }
    selected = erased.substring(0, erased.length - post_selected.length);
    console.log('selected=' + selected);
    console.log('selected.length=' + selected.length);
    return [pre_selected, selected, post_selected, ori];
    //   $('#editor').innerHTML = 'BliBlaBlu';
  }

}

function set_input_event() {
  $('#set-input').on('mousedown', function (ev) {
    ev.preventDefault();
    set_input();
  });
}

function set_input() {
  var temp = get_selection(editor_mf, true);
  var pre_selected = temp[0];
  var selected = temp[1];
  var post_selected = temp[2];
  var ori = temp[3];
  if (selected.length > 0) {
    var new_latex = pre_selected + '\\class{inputfield}{' + selected + '}' + post_selected;
    console.log(new_latex);
    editor_mf.latex(new_latex);
  } else {
    ori = ori.replace('class{', '\\class{inputfield}{');
    console.log(ori);
    editor_mf.latex(ori);
  }
}

function set_unit_event() {
  $('#set-unit').on('mousedown', function (ev) {
    ev.preventDefault();
    set_unit();
  });
}

function set_unit() {
  console.log('activeMathfieldIndex=' + activeMathfieldIndex);
  var mf = FAList[activeMathfieldIndex].mathField;
  // erase class inputfield = false
  var temp = get_selection(mf, false);
  var pre_selected = temp[0];
  var selected = temp[1];
  var post_selected = temp[2];
  var ori = temp[3];
  if (selected.length > 0) {
    var new_latex = pre_selected + '\\textcolor{blue}{' + selected + '}' + post_selected;
    new_latex = new_latex.replace('class{', '\\class{inputfield}{');
    console.log(new_latex);
    mf.latex(new_latex);
  } else {
    ori = ori.replace('class{', '\\class{inputfield}{');
    console.log(ori);
    mf.latex(ori);
  }
}

function erase_unit_event() {
  console.log('init erase unit button');
  $('#erase-unit').on('mousedown', function (ev) {
    ev.preventDefault();
    erase_unit();
  });
}

function erase_unit(){
  console.log('erase-unit');
  var ori = editor_mf.latex();
  var temp = separate_class(ori, '\\textcolor{blue}{');
  // console.log(temp);
  if (temp[1].length > 0) {
    var textcolor_erased = temp[0] + temp[1] + temp[2];
  } else {
    var textcolor_erased = ori;
  }
  textcolor_erased = textcolor_erased.replace('class{', '\\class{inputfield}{');
  console.log(textcolor_erased);
  editor_mf.latex(textcolor_erased);
}

function separate_class(latex, class_tag) {
  var before_tag = '';
  var tag = '';
  var after_tag = '';
  var pos = latex.indexOf(class_tag); //)
  if (pos > -1) {
    before_tag = latex.substring(0, pos);
    var rest = latex.substring(pos + class_tag.length - 1);
    // rest starts with {
    var temp = find_corresponding_right_bracket(rest, '{');
    // temp = [left_pos, bra.length, right_pos, rightbra.length]
    if (temp[0] !== 0 || temp[1] !== 1 || temp[3] !== 1) {
      console.log('Something went wront at separate_class()');
    }
    tag = rest.substring(1, temp[2]);
    after_tag = rest.substring(temp[2] + 1);
  } else {
    before_tag = '';
    tag = '';
    after_tag = latex;
  }
  console.log([before_tag, tag, after_tag]);
  return [before_tag, tag, after_tag];
}

function editor_edithandler(latex) {
  $('#output-code-0').text(latex);
  return separate_class(latex, 'class{');
}

function erase_class(latex) {
  // latex = 'abc+class{def}+ghi';
  // temp = ['abc+', 'def', '+ghi'];
  var temp = editor_edithandler(latex);
  return temp[0] + temp[1] + temp[2];
}

function show_editor_results(parts) {
  var result = '<p class="formula_applet"';
  var wikiresult = '<f_app';
  console.log(new_fa_id);
  var common_result = ' id="' + new_fa_id;
  if (result_mode == 'manu') {
    common_result += '" data-b64="' + encode(parts[1]);
  }
  common_result += '">';
  common_result += parts[0];
  result += common_result;
  wikiresult += common_result;
  result += '\\MathQuillMathField{}';
  wikiresult += '{{result}}';
  common_result = parts[2];
  result += common_result + '</p>';
  wikiresult += common_result + '</f_app>';

  $('#output-code-1').text(parts[1]);
  $('#output-code-2').text(result);
  $('#output-code-3').text(wikiresult);
  var out = $('textarea#wiki-text');
  if (out.length > 0) {
    out.text(wikiresult + String.fromCharCode(13, 10) + String.fromCharCode(13, 10) + result);
  }
}

function prepend() {
  var before = $('div#ed_before');
  // console.log('before.length=' + before.length);
  if (before.length == 0) {
    var ed = $('.formula_applet#editor');
    ed.before('<p id="mode_select">');
    $('p#mode_select').append('  <h3><span class="mw-headline" id="Mode">Mode</span></h3>');
    $('p#mode_select').append('  <input type="radio" id="auto" name="select_mode" checked />');
    $('p#mode_select').append('  <label for="auto"><span></span>Automatic (left side of equation will be compared to right side)</label>');
    $('p#mode_select').append('  <br/>');
    $('p#mode_select').append('  <input type="radio" id="manu" name="select_mode" />');
    $('p#mode_select').append('  <label for="manu"><span></span>Manual (input will be compared with given solution)</label>');
    ed.before('<p id="input_id">');
    $('p#input_id').append('  <label for="fa_name">Id of Formula Applet (4 to 20 characters)</label>');
    $('p#input_id').append('  <input type="text" id="fa_name" name="fa_bla_name" required minlength="4" maxlength="20" size="10">');
    $('p#input_id').append('  <button type="button" class="problemeditor" id="random-id">Random ID</button>');
    // ed.after('<p id="output-code-3"></p>');
    ed.after('<hr /><textarea id="wiki-text" rows=4 cols=150></textarea>');
    ed.after('<button type="button" class="problemeditor" id="set-unit">Unit</button>' + '<button type="button" class="problemeditor" id="erase-unit">Erase Unit</button>');
    ed.after('<p><span class="tr" key="uses">dummy</span></p>');
    ed.after('<button type="button" class="problemeditor" id="set-input">Set input field</button>');
  }
}

function makeid(length) {
  var result = '';
  // var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_+-!%_+-!%_+-!%';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_+-!%';
  var numOfChars = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * numOfChars));

  }
  // result = '"' + result + '"';
  return result;
}

function createReplacement(latexstring) {
  const separators = '∀µ∉ö∋∐∔∝∤∮∱∸∺∽≀';
  var i = 0;
  sep = '';
  do {
    var sep = separators[i];
    var found = (latexstring.indexOf(sep) > -1);
    var cont = found;
    i++;
    if (i > separators.length) {
      cont = false;
      sep = 'no replacement char found';
    }
  } while (cont)
  return sep;
}

function testcreateReplacement() {
  console.log('replacement=' + createReplacement('test'));
  console.log('replacement=' + createReplacement('leider∀µ∉ö∋∐∔∝∤∮∱∸∺∽≀verloren'));
  console.log('replacement=' + createReplacement('b∀µ∉ö∋∐∝∤∮∱∸∺∽≀'));
  console.log('replacement=' + createReplacement('∀µ∉ö∋∐∔∝∤∮∱∸m∽≀'));
  console.log('replacement=' + createReplacement('∉∀µ ö∋∐∔∤∮∱∸∺∽≀knurr∝'));
  console.log('replacement=' + createReplacement('∀aµ∉öb∋∐∔∝c∤d∱∸∺∽≀'));
}