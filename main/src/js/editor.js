"use strict";

import $ from "jquery";
import config from "./config.json";

import {
    domLoad,
    isH5P
} from "./dom.js";

// import {
//   clickLanguage
// } from "./translate.js";

import {
    encode
} from "./decode.js";

import {
    findCorrespondingRightBracket
} from "./texParser.js";

import MQ from "./lib/mathquillWrapper.js";
// import {
//     get_editorFapp
// } from "./preparePage";

export async function initEditor() {
    await domLoad;
    $.event.trigger("clickLanguageEvent"); //TODO never received?
}

var mathQuillEditHandlerActive = true;
var editor_fApp;
//TODO get rid of global vars

function mathQuillifyEditor(fApp) {
    // make whole mathFieldSpan editable
    var mathFieldSpan = document.getElementById('math-field');
    if (!mathFieldSpan) throw new Error("Cannot find math-field. The math editor must provide one.");
    var editorMf = MQ.MathField(mathFieldSpan, {
        spaceBehavesLikeTab: true, // configurable
        handlers: {
            edit: function (mathField) { // useful event handlers
                try {
                    if (mathQuillEditHandlerActive) {
                        var latex = mathField.latex();
                        console.log('** mathQuillEditHandler latex=' + latex);
                        refreshResultField(latex, fApp);
                    }
                } catch (error) {
                    console.error('ERROR in MQ.MathField: ' + error);
                }
            }
        }
    });
    return editorMf;
}

// Start of waitForEditorFApp mechanism
//TODO get rid of global var
var try_counter = 0;
var try_counter_limit = 10;

//TODO better solution then waitForEditorFAppThenDo
function waitForEditorFAppThenDo(cont) {
    var EditorFAppDefined = false;
    try {
        EditorFAppDefined = (typeof editor_fApp !== 'undefined');
    } catch (error) {
        console.log(try_counter);
    }
    if (EditorFAppDefined) {
        // execute callback
        cont();
    } else {
        try_counter++;
        console.info(`waitForEditorFApp try_counter=${try_counter}`);
        if (try_counter < try_counter_limit) {
            setTimeout(function () {
                // recurse
                waitForEditorFAppThenDo(cont);
            }, 300);
        } else {
            console.error('waitForEditorFAppThenDo: Timeout');
        }
    }
}
// End of waitForEditorFApp mechanism


var newLatex = 'new'; //TODO get rid of global vars
export async function editorAction() { //replaces messageHandler
    var actionType = arguments[0];
    var data = arguments[1] || "dummy";
    waitForEditorFAppThenDo(function () {
        editorActionDefined(actionType, data)
    });
}

function editorActionDefined(actionType, data) {
    console.log('editorAction: ' + actionType + ' data=' + data);
    if (typeof editor_fApp !== 'undefined') {
        // H5P
        console.log('editor_fApp.id=' + editor_fApp.id);
        var editorMf = editor_fApp.mathField;
        if (actionType == 'idChanged') {
            var newId = data;
            console.info('*** idChanged data=' + newId);
            editor_fApp.id = newId;
            refreshResultField(editorMf.latex(), editor_fApp);
        }
        if (actionType == 'setInputFieldMouseover') {
            console.info('*** setInputFieldMouseover');
            var latex = setInput(editorMf);
            console.log(latex);
            editorMf.latex(latex.old);
            //TODO get rid of global vars
            newLatex = latex.new; //prepare for setInputField
        }

        // setInputFieldMouseover precedes setInputField
        // global var newLatex is renewed by function setInput() 
        if (actionType == 'setInputField') {
            console.info('*** setInputField');
            editorMf.latex(newLatex);
        }

        if (actionType == 'refresh') {
            console.info('*** refresh');
            try {
                refreshResultField(editor_fApp.mathField.latex(), editor_fApp);
            } catch (error) {
                console.error('ERROR: ' + error);
            }
        }

        if (actionType == 'setMode') {
            var auto_or_manu = data;
            console.info('*** setMode ' + auto_or_manu);
            if (auto_or_manu == 'auto') {
                editor_fApp.hasSolution = false;
                refreshResultField(editorMf.latex(), editor_fApp)
            }
            if (auto_or_manu == 'manu') {
                editor_fApp.hasSolution = true;
                refreshResultField(editorMf.latex(), editor_fApp)
            }
        }
    }

}

export async function prepareEditorApplet(fApp) {
    // *** editor ***
    await initEditor();
    console.log('prepareEditorApplet, define editor_fApp');
    var editorMf = mathQuillifyEditor(fApp);
    // editorMf provides commands like editorMf.latex('\\sqrt{2}') and var latextext = editorMf.latex();
    fApp.mathField = editorMf;
    console.log('editorMf.latex=' + editorMf.latex());
    refreshResultField(editorMf.latex(), fApp);
    $.event.trigger("refreshLatexEvent"); //adjust \cdot versus \times

    $('#set-input-d, #set-input-e').on('mousedown', ev => {
        ev.preventDefault();
        var newLatex = setInput(editorMf).new;
        editorMf.latex(newLatex);
    });

    $('#set-unit-d, #set-unit-e').on('mousedown', ev => {
        ev.preventDefault();
        setUnit(editorMf);
    });
    $('#erase-unit-d, #erase-unit-e').on('mousedown', ev => {
        ev.preventDefault();
        eraseUnit(editorMf);
    });
    $('#random-id-d, #random-id-e').on('mousedown', ev => {
        ev.preventDefault();
        changeId(randomId(8));
    });

    $('#fa_name').on('input', ev => {
        // console.log(ev);
        console.log('fa_name input: ' + ev.target.value);
        changeId(ev.target.value);
    });

    var old_id = 'start';
    //TODO get rid of global vars
    function changeId(id) {
        id = id.replace(/</g, '');
        id = id.replace(/>/g, '');
        id = id.replace(/"/g, '');
        id = id.replace(/'/g, '');
        id = id.replace(/&/g, '');
        id = id.replace(/ /g, '_');
        if (4 <= id.length && id.length <= 20) {
            // id meets the conditions
            if (old_id !== id) {
                console.log(old_id + ' -> ' + id);
                fApp.id = id;
                if (!isH5P()) {
                    $('#fa_name').val(id);
                }
                old_id = id;
                // update HTML
                refreshResultField(editorMf.latex(), fApp)
            }
        }
    }

    $('input[type="radio"]').on('click', ev => {
        var resultMode = ev.target.id;
        if (resultMode == 'auto') {
            // $('p#editor span.mq-class.inputfield').prop('contentEditable', 'false');
            $('p.edit span.mq-class.inputfield').prop('contentEditable', 'false');
            fApp.hasSolution = false;
            // autoMode.set(true);
            refreshResultField(editorMf.latex(), fApp)
        }
        if (resultMode == 'manu') {
            // $('p#editor span.mq-class.inputfield').prop('contentEditable', 'true');
            $('p.edit span.mq-class.inputfield').prop('contentEditable', 'true');
            // autoMode.set(false);
            fApp.hasSolution = true;
            refreshResultField(editorMf.latex(), fApp)
        }
    });

    if (!isH5P()) {
        // generate a new random ID
        changeId(randomId(8));
        $('input[type="radio"]#auto').trigger('click');
    }
    editor_fApp = fApp;
} // end of prepareEditorApplet

function getSelection(mf, options) {
    // if options.erase is undefined, erase defaults to false
    var erase = options.erase || false;
    console.log('getSelection: erase=' + erase);
    // typof mf = mathField
    var ori = mf.latex();
    console.log('ori= ' + ori);
    var erased = ori;
    if (erase) {
        erased = eraseInputfieldClass(ori);
    }
    var replacementCharacter = createreplacementCharacter(ori);
    if (ori.indexOf(replacementCharacter) == -1) {
        // replacement has to be done before erase of class{...
        // Do replacement!
        mathQuillEditHandlerActive = false;
        mf.typedText(replacementCharacter);
        mathQuillEditHandlerActive = true;
        // erase class{inputfield}
        var replacedAndErased = mf.latex();
        if (erase) {
            replacedAndErased = eraseInputfieldClass(replacedAndErased);
        }
        console.log('replacedAndErased= ' + replacedAndErased);
        var preSelected = '?';
        var selected = '?';
        var postSelected = '?';
        var pos = replacedAndErased.indexOf(replacementCharacter);
        preSelected = replacedAndErased.substring(0, pos);
        // selected = replacement
        postSelected = replacedAndErased.substring(pos + replacementCharacter.length);
        // Delete preSelected from beginning of erased
        // and delete postSelected from end of erased
        var check = erased.substr(0, preSelected.length);
        if (check !== preSelected) {
            console.error('Something went wrong with replacement of input field', check, preSelected);
        }
        erased = erased.substring(preSelected.length);
        check = erased.substring(erased.length - postSelected.length);
        if (check !== postSelected) {
            console.error('Something went wrong with replacement of input field', check, postSelected);
        }
        selected = erased.substring(0, erased.length - postSelected.length);
        //TODO use object syntax instead of array syntax
        var result = [preSelected, selected, postSelected, ori];
        return result;
    }
}

function setInput(editorMf) {
    var temp = getSelection(editorMf, {
        erase: true
    });
    var preSelected = temp[0];
    var selected = temp[1];
    var postSelected = temp[2];
    var result = {};
    result['old'] = temp[3];
    var newLatex = temp[3];
    if (selected.length > 0) {
        newLatex = preSelected + '\\class{inputfield}{' + selected + '}' + postSelected;
    } else {
        newLatex = sanitizeInputfieldTag(newLatex);
    }
    result['new'] = newLatex;
    return result;
}

function getPositionOfUnitTags(latex, unitTag) {
    // get position of exising unit tags
    var pos = 0;
    var startOfUnitTags = [];
    var endOfUnitTags = [];
    do {
        pos = latex.indexOf(unitTag, pos);
        if (pos >= 0) {
            var rest = latex.substr(pos + unitTag.length - 1);
            var bracket = findCorrespondingRightBracket(rest, '{');
            var posRightBracket = pos + unitTag.length + bracket.rightPos;
            startOfUnitTags.push(pos);
            endOfUnitTags.push(posRightBracket);
            //posRightBracket points to char right of the right bracket
            pos++;
        }
    } while (pos >= 0)
    return {
        sofUnitTags: startOfUnitTags,
        eofUnitTags: endOfUnitTags
    };
}

export function setUnit(mf) {
    var i, k;
    var unitTag = config.unit_replacement;
    // erase class inputfield = false
    var temp = getSelection(mf, {
        erase: false
    });
    var preSelected = temp[0];
    var selected = temp[1];
    var postSelected = temp[2];
    var ori = temp[3];

    var start = preSelected.length;
    var end = start + selected.length;
    var selectpattern = '.'.repeat(ori.length).split(''); // split: transform from string to array
    for (k = start; k < end; k++) {
        selectpattern[k] = 's';
    }

    var posn = getPositionOfUnitTags(ori, unitTag);
    var startOfUnitTags = posn.sofUnitTags;
    var endOfUnitTags = posn.eofUnitTags;
    var pattern = '.'.repeat(ori.length).split(''); // split: transform from string to array
    for (i = 0; i < startOfUnitTags.length; i++) {
        for (k = startOfUnitTags[i]; k < endOfUnitTags[i]; k++) {
            pattern[k] = '#';
        }
    }
    // inspect selection start
    for (i = 0; i < startOfUnitTags.length; i++) {
        if (startOfUnitTags[i] < start && start <= endOfUnitTags[i]) {
            // move start leftwards
            start = startOfUnitTags[i];
            // short circuit:
            i = startOfUnitTags.length;
        }
    }
    // inspect selection end
    for (i = 0; i < startOfUnitTags.length; i++) {
        if (startOfUnitTags[i] <= end && end <= endOfUnitTags[i]) {
            // move end rightwards
            end = endOfUnitTags[i];
            // short circuit:
            i = startOfUnitTags.length;
        }
    }
    // debug
    selectpattern = '.'.repeat(ori.length).split(''); // split: transform from string to array
    for (k = start; k < end; k++) {
        selectpattern[k] = 's';
    }

    // delete unittags inside selection
    var ori_array = ori.split('');
    for (i = 0; i < startOfUnitTags.length; i++) {
        if (start <= startOfUnitTags[i] && endOfUnitTags[i] <= end) {
            for (k = startOfUnitTags[i]; k < startOfUnitTags[i] + unitTag.length; k++) {
                ori_array[k] = '§';
            }
            ori_array[endOfUnitTags[i] - 1] = '§';
        }
    }
    ori = ori_array.join('');

    if (selected.length > 0) {
        // new calculation necessary
        preSelected = ori.substring(0, start);
        selected = ori.substring(start, end);
        postSelected = ori.substring(end);
        var newLatex = preSelected + unitTag + selected + '}' + postSelected;
        // newLatex = newLatex.replace(/\xA7/g, '');
        newLatex = newLatex.replace(/§/g, '');
    } else {
        newLatex = ori.replace(/§/g, '');
    }
    mf.latex(sanitizeInputfieldTag(newLatex));
}

export function sanitizeInputfieldTag(latex) {
    var result;
    if (typeof latex === 'undefined') {
        result = '';
    } else {
        // first make shorter
        result = latex.replace('\\class{inputfield}{', '\\class{');
        // then make longer again
        result = result.replace('\\class{', '\\class{inputfield}{');
        return result;
    }
}

export function eraseUnit(mf) {
    var unitTag = '\\textcolor{blue}{';
    var temp = getSelection(mf, {
        erase: false
    });
    var ori = temp[3];
    // get position of unittags
    var posn = getPositionOfUnitTags(ori, unitTag);
    var startOfUnitTags = posn.sofUnitTags;
    var endOfUnitTags = posn.eofUnitTags;

    // delete unittag outside cursor (or left boundary of selection)
    var cursorpos = temp[0].length;
    var ori_array = ori.split('');
    for (var i = 0; i < startOfUnitTags.length; i++) {
        if (startOfUnitTags[i] <= cursorpos && cursorpos <= endOfUnitTags[i]) {
            for (var k = startOfUnitTags[i]; k < startOfUnitTags[i] + unitTag.length; k++) {
                ori_array[k] = '§';
            }
            ori_array[endOfUnitTags[i] - 1] = '§';
        }
    }
    ori = ori_array.join('');
    ori = ori.replace(/§/g, '');
    // restore selection-checked mf
    mf.latex(sanitizeInputfieldTag(ori));
}

/**
 * 
 * @param {string} latex string containing latex code
 * @returns {object} object consisting of three strings: before, tag, after
 * @example result = separateInputfield("bli\\class{inputfield}{bla}blu"), then
 * @example result.before = "bli", result.tag = "bla", result.after = "blu"
 * @example result = separateInputfield("string_without_inputfield"), then
 * @example result.before = "", result.tag = "", result.after = "string_without_inputfield"
 */
function separateInputfield(latex) {
    var beforeTag, tag, afterTag;
    var classTag = '\\class{inputfield}{';
    var pos = latex.indexOf(classTag);
    if (pos > -1) {
        beforeTag = latex.substring(0, pos);
        var rest = latex.substring(pos + classTag.length - 1);
        // rest starts with {
        var bracket = findCorrespondingRightBracket(rest, '{');
        if (bracket.leftPos !== 0 || bracket.bracketLength !== 1 || bracket.rightBracketLength !== 1) {
            console.error('Something went wront at separateInputfield()', bracket);
        }
        tag = rest.substring(1, bracket.rightPos);
        afterTag = rest.substring(bracket.rightPos + 1);
    } else {
        beforeTag = '';
        tag = '';
        afterTag = latex;
    }
    var result = {
        before: beforeTag,
        tag: tag,
        after: afterTag
    };
    console.info(latex);
    console.info(beforeTag + '|' + tag + '|' + afterTag);
    return result;
}

function eraseInputfieldClass(latex) {
    // latex = 'abc\\class{inputfield}{def}ghi';
    // temp = {before: 'abc+', tag: 'def', after: 'ghi'};
    // return 'abcdefghi';
    var temp = separateInputfield(latex);
    return temp.before + temp.tag + temp.after;
}

function refreshResultField(latex, fApp) {
    var parts = separateInputfield(latex);
    showEditorResults(parts, fApp);
}

function showEditorResults(parts, fApp) {
    var tex = parts.before + '{{result}}' + parts.after;
    tex = tex.replace(/\\textcolor{blue}{/g, '\\unit{');
    // $(document).trigger('texevent');

    // maybe H5P editor
    var texinput = $('div.field.field-name-TEX_expression.text input')[0];
    if (typeof texinput !== 'undefined') {
        // value of TEX_expression field is set to EditorResult
        texinput.value = tex;
        // trigger InputEvent. EventListener see formulaapplet-editor.js
        texinput.dispatchEvent(new InputEvent('input', {
            bubbles: true
        }))
    } else {
        console.log('no TEX_expression found - probably no H5P');
    }
    console.log('parts.tag=' + parts.tag);
    // var b64 = $('div.field.field-name-data_b64.text input')[0];
    // if (typeof b64 !== 'undefined') {
    //     // value of data_b64 field is set to encoded solution
    //     b64.value = parts.tag;
    //     // trigger InputEvent. EventListener see formulaapplet-editor.js
    //     b64.dispatchEvent(new InputEvent('input', {
    //         bubbles: true
    //     }))
    // } else {
    //     console.log('no solution field found - probably no H5P');
    // }
    // maybe html editor
    var out = $('textarea#html-output');
    if (typeof out !== 'undefined') {
        out.text(getHTML(tex, parts.tag, fApp));
    }
}

function getHTML(tex, tag, fApp) {
    var result = '<p class="formula_applet"';
    // var editable = $('p#editor span.mq-class.inputfield').prop('contentEditable');
    var common_result = ' id="' + fApp.id;
    if (fApp.hasSolution) {
        var enc = encode(tag);
        common_result += '" data-b64="' + enc;
        if (isH5P()) {
            var $b64 = $('#data_b64_click');
            // console.log($b64);
            // console.log($b64.length);
            if ($b64.length > 0) {
                // H5P editor
                console.log('data_b64_click: set value=' + enc + ' and trigger click event ');
                $b64.text(enc);
                // console.log($b64);
                $b64.trigger("click");
            }
        }
    }
    common_result += '">';
    common_result += tex;
    result += common_result + '</p>';
    return result;
}

export function randomId(length) {
    var result = 'fa';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    var numOfChars = characters.length;
    for (var i = 2; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * numOfChars));
    }
    // result = '"' + result + '"';
    return result;
}

function createreplacementCharacter(latexstring) {
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
            sep = 'no replacementCharacter char found';
        }
    } while (cont)
    return sep;
}