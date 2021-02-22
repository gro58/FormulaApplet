<?php
$title = 'Test Page - MathQuill2Tex2tree';
$liblist = "['tex_parser', 'mathquill', 'mathquillcss', 'translate', 'gf09css', 'hammer', 'vkbd', 'vkbdcss', 'prepare_page']";
$prefix="../"; 
include_once( $prefix . 'header.php' );
?>

<!-- <script src="./js/lib/tex_parser.js"></script> -->

<body>
  <p>MathQuill: <span id="editable-math"></span></p>
 <textarea id="latex" style="width:80%;vertical-align:top">\frac{d}{dx}\sqrt{x} = 3,5 \unit{\frac{km}{h}} </textarea><br />
 <button id="unit" class='button'>Insert Unit</button>
 <hr>
  <textarea id="tree2TEX" style="width:80%;vertical-align:top" class="formula_applet">tex2</textarea>
  <canvas id="treecanvas" width="600" height="300" style="
border: 1px solid #000000;
position: fixed;
right: 30px;
top: 30px;
transform: scale(1.05);
background-color: #ffffdf !important;">
</canvas>
<hr>
<p class="formula_applet" id="h6xv-s%h">4,5\unit{m}={{result}}</p>
<hr>
  <script>

function init(){
    console.log( 'init' );
    initTranslation();
    var eMath = $('#editable-math')[0]; latexSource = $('#latex'), tree2tex = $('#tree2TEX');
    var MQ = MathQuill.getInterface(2);
    mf = MQ.MathField(eMath, {handlers:{
        edit: function(){
          //mf -> latexSource
        latexSource.val(mf.latex());
        tree_output();
      }
    }});
    mf.latex(latexSource.val());

    latexSource.bind('keydown keypress', function() {
    var oldtext = latexSource.val();
    setTimeout(function() {
      var newtext = latexSource.val();
       //delete spaces
       newtext = newtext.replace(/\\\s/g, '');
      if(newtext !== oldtext) {
        //latexSource -> mf
        mf.latex(newtext);
      }
    });
  });
  unit_button = $('#unit');
  unit_button.click( function() {
      console.log('unit_button event');
      var temp = mf.latex();
      temp +='\\unit{ }';
      mf.latex(temp);
   });
}
var canvas = document.getElementById("treecanvas");

function tree_output(){
   var myTree =  parse(latexSource.val());
   paint_tree(myTree, canvas, 'TEX tree');
   var tex_1 = latexSource.val();
   var tex_2 = tree2TEX(myTree);
   tree2tex.val(tex_2);
   var temp = tex_1.replace(/\\cdot/g, '\\cdot ');
   tex_1 = temp.replace(/\\cdot  /g, '\\cdot ');
   var temp = tex_2.replace(/\\cdot/g, '\\cdot ');
   tex_2 = temp.replace(/\\cdot  /g, '\\cdot ');
   var equal = (tex_1 == tex_2);
    if (equal){
        $(tree2tex).removeClass('isNotEqual').addClass('isEqual');
    } else {
        $(tree2tex).removeClass('isEqual').addClass('isNotEqual');
    }

  var link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = "../css/gf09.css";
  document.getElementsByTagName("head")[0].appendChild(link);

 }

//  window.addEventListener('DOMContentLoaded', (event) => {
//     console.log('DOM fully loaded and parsed');
//     // waitfor_mathquill_and_if_ready_then_do( init );
//     init();
//  });

</script>

<?php include_once ($prefix . 'uses.php');?>
<?php include_once ($prefix . 'footer.php');?>