"use strict";

import $ from "jquery";
import config from "./config.json";

import {
    domLoad,
    isH5P
} from "./dom.js";

import decode, {
    encode
} from "./decode.js";

import MQ from "./lib/mathquillWrapper.js";

import {
    // setInput,
    separateInputfield,
} from "./inputfield_unit.js";

var mathQuillEditHandlerActive = true;
export var editor_fApp;
//TODO get rid of global vars

//TODO move to formulaapplet-editor to have access to refreshResultField
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
                        console.log('mathQuillEditHandler refreshResultFieldClone latex=' + latex);
                        refreshResultFieldClone(latex, fApp);
                    }
                } catch (error) {
                    console.error('ERROR in MQ.MathField: ' + error);
                }
            }
        }
    });
    return editorMf;
}

// var newLatex = 'new'; //TODO get rid of global vars

//TODO move to formulaapplet-editor to have access to refreshResultField
export async function prepareEditorApplet(fApp) {
    // *** editor ***
    await domLoad;
    // await initEditor();
    console.log('prepareEditorApplet: define editor_fApp_id');
    var editorMf = mathQuillifyEditor(fApp);
    console.log(editorMf);
    // editorMf provides commands like editorMf.latex('\\sqrt{2}') and var latextext = editorMf.latex();
    fApp.mathField = editorMf;
    console.log('refreshResultFieldClone editorMf.latex=' + editorMf.latex());
    refreshResultFieldClone(editorMf.latex(), fApp);
    $.event.trigger("refreshLatexEvent"); //adjust \cdot versus \times

    if (config.debug === 'true') {
        // if debug, show three fields
        $('.field-name-data_b64').css('display', '');
        $('.field-name-id').css('display', '');
        $('.field-name-selected_language').css('display', '');
    } else {
        $('.field-name-data_b64').css('display', 'none');
        $('.field-name-id').css('display', 'none');
        $('.field-name-selected_language').css('display', 'none');
    }
    if (config.htmloutput === 'true') {
        $('#html_output').css('display', '');
    } else {
        $('#html_output').css('display', 'none');
    }
    return fApp;
} // end of prepareEditorApplet

function refreshResultFieldClone(latex, fApp) {
    console.log("refreshResultFieldClone");
    latex = latex.replaceAll(config.unit_replacement, '\\unit{');
    var parts = separateInputfield(latex);
    var tex = parts.before + '{{result}}' + parts.after;
    var enc = encode(parts.tag);
    console.log(tex + ' enc=' + enc + ' -> ' + decode(enc));
    // latexHandler(tex, enc);
    // $(document).trigger('texevent');

    // H5P editor: send tex and enc using dispatchEvent and trigger('click')
    if (isH5P()) {
        var texinput = $('div.field.field-name-TEX_expression.text input')[0];
        if (typeof texinput !== 'undefined') {
            // value of TEX_expression field is set to EditorResult
            texinput.value = tex;
            // trigger InputEvent. EventListener see formulaapplet-editor.js
            texinput.dispatchEvent(new InputEvent('input', {
                bubbles: true
            }))
        }
    }
    // getHTML
    var html = '<p class="formula_applet" id="' + fApp.id;
    if (fApp.hasSolution) {
        html += '" data-b64="' + enc;
    }
    if (fApp.unitAuto) {
        html += '" mode="physics';
    }
    html += '">' + tex + '</p>';
    console.log(html);
    var out = $('textarea#html_output');
    if (typeof out !== 'undefined') {
        out.text(html);
    }
}