
var checkButtonPositions = function() {
    var breakingWidth = 770; // px
    var width = $(window).width();
    if (width <= breakingWidth) {
        $("#buttonsDiv").removeClass("row");
        document.getElementById("postCreated").style = "margin-top:1rem;";
        document.getElementById("spacing1").innerHTML = "<br>";
        document.getElementById("spacing2").innerHTML = "<br>";
    }
    else {
        $("#buttonsDiv").addClass("row");
        document.getElementById("postCreated").style = "margin-top:1rem; transform: translateY(50%);";
        document.getElementById("spacing1").innerHTML = "<br>";
        document.getElementById("spacing2").innerHTML = "<br>";
    }
};

$(window).bind("resize", function () {
    var width = $(this).width();
    checkButtonPositions();
    if (392 < width && width < 768) {
        $("#newPostButton").removeClass("btn-lg").removeClass("btn-sm");
    } else if (width >= 768) {
        $("#newPostButton").removeClass("btn-sm").addClass("btn-lg");
    } else {
        $("#newPostButton").removeClass("btn-lg").addClass("btn-sm");
    }
}).trigger('resize');

$("#advancedFeatures").on("show.bs.collapse", function () {
    $("#collapseIcon").addClass("fa-caret-down").removeClass("fa-caret-right");
});

$("#advancedFeatures").on("hide.bs.collapse", function () {
    $("#collapseIcon").removeClass("fa-caret-down").addClass("fa-caret-right");
});

$(window).scroll(function(){
    var currentVerticalPosition = $(window).scrollTop();
    var visible = $(window).height();
    const imageHeight = 980; // px
    var maximumScroll = imageHeight - visible;  
    if (maximumScroll > currentVerticalPosition) {
        $("body").css("background-position", "center -" + currentVerticalPosition + "px");
    } else {
        $("body").css("background-position", "center -" + maximumScroll + "px");
    }
}).trigger("scroll");

var generateMD5 = function(text) {
    return CryptoJS.MD5(text).toString();
}

var generateVerificationToken = function(text, password) {
    return generateMD5(text + generateMD5(password).toString()).toString();
}

var encrypt = function(text, password) {
    var iv = CryptoJS.lib.WordArray.random(16);
    var encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(generateMD5(password)), {iv: iv});
    return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
}

var decrypt = function(encryptedText, password, verificationToken) {
    try {
        var ciphertext = CryptoJS.enc.Base64.parse(encryptedText);
        var iv = ciphertext.clone();
        iv.sigBytes = 16;
        iv.clamp();
        ciphertext.words.splice(0, 4);
        ciphertext.sigBytes -= 16;
        var decrypted = CryptoJS.AES.decrypt({ciphertext: ciphertext}, CryptoJS.enc.Utf8.parse(generateMD5(password)), {iv: iv});
        var decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        
        return {success: true, text: decryptedText, verificationToken: generateVerificationToken(decryptedText, password)};
    }
    catch (e) {
        return {success: false};
    }
}

var loadingText = '<i class="fa fa-spinner fa-spin"></i>&nbsp;Creating the post...';
var normalText = 'Create';

var createPostButton = document.getElementById("createPostButton");

var enableAllElements = function() {
    var elements = [
        "text",
        "password",
        "syntax-highlighting",
        "delete-after-views",
        "delete-after-time",
        // "hide-time-of-creation",
        // "hide-number-of-views",
        "createPostButton"
    ];
    for (var i = 0; i < elements.length; i++) {
        document.getElementById(elements[i]).disabled = false;
    }
    createPostButton.innerHTML = normalText;
}

var disableAllElements = function() {
    var elements = [
        "text",
        "password",
        "syntax-highlighting",
        "delete-after-views",
        "delete-after-time",
        // "hide-time-of-creation",
        // "hide-number-of-views",
        "createPostButton"
    ];
    for (var i = 0; i < elements.length; i++) {
        document.getElementById(elements[i]).disabled = true;
    }
    createPostButton.innerHTML = loadingText;
}

var onCreatePostButtonClick = function() {
    var text = document.getElementById("text").value;
    var password = document.getElementById("password");
    var syntaxHighlighting = document.getElementById("syntax-highlighting");
    var deleteAfterViews = document.getElementById("delete-after-views");
    var deleteAfterTime = document.getElementById("delete-after-time");
    var hideTimeOfCreation = document.getElementById("hide-time-of-creation");
    var hideNumberOfViews = document.getElementById("hide-number-of-views");

    var linesCount = text.split(/\r\n|\r|\n/).length;

    if (!text) {
        return Swal.fire(
            "No Text",
            "The text box is empty. Please enter the text that you want to share!",
            "error"
        );
    }

    disableAllElements();

    var passwordProtected = false;
    var verificationToken = null;

    if (password.value) {
        passwordProtected = true;
        verificationToken = generateVerificationToken(text.value, password.value);
        var text = encrypt(text, password.value);
    }
    
    var deleteAfterViewsValue = parseInt(deleteAfterViews.value, 10);
    if (deleteAfterViewsValue && deleteAfterViewsValue < 1) {
        enableAllElements();
        return Swal.fire(
            "Invalid Value",
            "Please enter a valid positive integer value for number of views after which the post should be deleted.",
            "error"
        );
    }
    if (!deleteAfterViewsValue) {
        deleteAfterViewsValue = 0;
    }

    var deleteAfterTimeValue = parseInt(deleteAfterTime.value, 10);
    if (!deleteAfterTimeValue) {
        deleteAfterTimeValue = 0;
    }

    data = {
        "data": text,
        "passwordProtected": passwordProtected,
        "verificationToken": verificationToken,
        "syntaxHighlighting": syntaxHighlighting.value,
        "deleteAfterTime": deleteAfterTimeValue,
        "deleteAfterViews": deleteAfterViewsValue,
        "linesCount": linesCount,
        "hideTimeOfCreation": false, //hideTimeOfCreation.checked,
        "hideNumberOfViews": false //hideNumberOfViews.checked
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onerror = function() {
        enableAllElements();
    }
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var data = JSON.parse(this.responseText);

                if (data.success) {
                    document.getElementById("post-url").value = data.url;

                    document.getElementById("urlCopyButton").addEventListener("click", function() {
                        var urlCopyButton = this;
                        var postUrlElement = document.getElementById("post-url");

                        urlCopyButton.disabled = true;
                        postUrlElement.disabled = false;
                        
                        postUrlElement.select();
                        document.execCommand("copy");
                        postUrlElement.disabled = true;

                        var text = urlCopyButton.innerHTML;
                        urlCopyButton.innerHTML = "Copied to Clipboard!";
                        setTimeout(() => {
                            urlCopyButton.innerHTML = text;
                            urlCopyButton.disabled = false;
                        }, 1500);
                    })

                    var qrCodeUrl = data.qrCodeUrl;

                    document.getElementById("saveButtonDiv").innerHTML = `
                        <a class="btn btn-danger btn-block" id="saveButton" href="${qrCodeUrl}" download="qrCode.png">
                            <i class="fas fa-save"></i>&nbsp;Save QR Code
                        </a>`;

                    var viewButton = document.getElementById("viewButton");
                    viewButton.addEventListener("click", function() {
                        Swal.fire({
                            imageUrl: qrCodeUrl,
                            imageAlt: "Unable to load the QR Code."
                        });
                    });
                    viewButton.disabled = false;

                    document.getElementById("createPost").hidden = true;
                    document.getElementById("postCreated").hidden = false;
                }
                else {
                    enableAllElements();
                    return Swal.fire(
                        "An Unknown Error Occurred!",
                        "",
                        "error"
                    );
                }
            }
            else if (this.status == 429) {
                enableAllElements();
                return Swal.fire(
                    "Too Many Requests",
                    "We're getting too many requests from your IP Address! Please wait for a few seconds before creating another post.",
                    "error"
                );
            }
            else {
                enableAllElements();
                return Swal.fire(
                    "An Unknown Error Occurred!",
                    "",
                    "error"
                );
            }
        }
    };
    xhttp.open("POST", window.location.href + "/api/create-post", true);
    xhttp.send(JSON.stringify(data));
}

createPostButton.addEventListener("click", onCreatePostButtonClick);

// Languages list from ace.js library's website. (https://ace.c9.io/)

var languages = {
    ABAP:        ["abap"],
    ABC:         ["abc"],
    ActionScript:["as"],
    ADA:         ["ada|adb"],
    Alda:        ["alda"],
    Apache_Conf: ["^htaccess|^htgroups|^htpasswd|^conf|htaccess|htgroups|htpasswd"],
    Apex:        ["apex|cls|trigger|tgr"],
    AQL:         ["aql"],
    AsciiDoc:    ["asciidoc|adoc"],
    ASL:         ["dsl|asl"],
    Assembly_x86:["asm|a"],
    AutoHotKey:  ["ahk"],
    BatchFile:   ["bat|cmd"],
    C_Cpp:       ["cpp|c|cc|cxx|h|hh|hpp|ino"],
    C9Search:    ["c9search_results"],
    Cirru:       ["cirru|cr"],
    Clojure:     ["clj|cljs"],
    Cobol:       ["CBL|COB"],
    coffee:      ["coffee|cf|cson|^Cakefile"],
    ColdFusion:  ["cfm"],
    Crystal:     ["cr"],
    CSharp:      ["cs"],
    Csound_Document: ["csd"],
    Csound_Orchestra: ["orc"],
    Csound_Score: ["sco"],
    CSS:         ["css"],
    Curly:       ["curly"],
    D:           ["d|di"],
    Dart:        ["dart"],
    Diff:        ["diff|patch"],
    Dockerfile:  ["^Dockerfile"],
    Dot:         ["dot"],
    Drools:      ["drl"],
    Edifact:     ["edi"],
    Eiffel:      ["e|ge"],
    EJS:         ["ejs"],
    Elixir:      ["ex|exs"],
    Elm:         ["elm"],
    Erlang:      ["erl|hrl"],
    Forth:       ["frt|fs|ldr|fth|4th"],
    Fortran:     ["f|f90"],
    FSharp:      ["fsi|fs|ml|mli|fsx|fsscript"],
    FSL:         ["fsl"],
    FTL:         ["ftl"],
    Gcode:       ["gcode"],
    Gherkin:     ["feature"],
    Gitignore:   ["^.gitignore"],
    Glsl:        ["glsl|frag|vert"],
    Gobstones:   ["gbs"],
    golang:      ["go"],
    GraphQLSchema: ["gql"],
    Groovy:      ["groovy"],
    HAML:        ["haml"],
    Handlebars:  ["hbs|handlebars|tpl|mustache"],
    Haskell:     ["hs"],
    Haskell_Cabal: ["cabal"],
    haXe:        ["hx"],
    Hjson:       ["hjson"],
    HTML:        ["html|htm|xhtml|vue|we|wpy"],
    HTML_Elixir: ["eex|html.eex"],
    HTML_Ruby:   ["erb|rhtml|html.erb"],
    INI:         ["ini|conf|cfg|prefs"],
    Io:          ["io"],
    Jack:        ["jack"],
    Jade:        ["jade|pug"],
    Java:        ["java"],
    JavaScript:  ["js|jsm|jsx"],
    JSON:        ["json"],
    JSON5:       ["json5"],
    JSONiq:      ["jq"],
    JSP:         ["jsp"],
    JSSM:        ["jssm|jssm_state"],
    JSX:         ["jsx"],
    Julia:       ["jl"],
    Kotlin:      ["kt|kts"],
    LaTeX:       ["tex|latex|ltx|bib"],
    LESS:        ["less"],
    Liquid:      ["liquid"],
    Lisp:        ["lisp"],
    LiveScript:  ["ls"],
    LogiQL:      ["logic|lql"],
    LSL:         ["lsl"],
    Lua:         ["lua"],
    LuaPage:     ["lp"],
    Lucene:      ["lucene"],
    Makefile:    ["^Makefile|^GNUmakefile|^makefile|^OCamlMakefile|make"],
    Markdown:    ["md|markdown"],
    Mask:        ["mask"],
    MATLAB:      ["matlab"],
    Maze:        ["mz"],
    MediaWiki:   ["wiki|mediawiki"],
    MEL:         ["mel"],
    MIXAL:       ["mixal"],
    MUSHCode:    ["mc|mush"],
    MySQL:       ["mysql"],
    Nginx:       ["nginx|conf"],
    Nim:         ["nim"],
    Nix:         ["nix"],
    NSIS:        ["nsi|nsh"],
    Nunjucks:    ["nunjucks|nunjs|nj|njk"],
    ObjectiveC:  ["m|mm"],
    OCaml:       ["ml|mli"],
    Pascal:      ["pas|p"],
    Perl:        ["pl|pm"],
    Perl6:       ["p6|pl6|pm6"],
    pgSQL:       ["pgsql"],
    PHP:         ["php|inc|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp|module"],
    PHP_Laravel_blade: ["blade.php"],
    Pig:         ["pig"],
    Powershell:  ["ps1"],
    Praat:       ["praat|praatscript|psc|proc"],
    Prisma:      ["prisma"],
    Prolog:      ["plg|prolog"],
    Properties:  ["properties"],
    Protobuf:    ["proto"],
    Puppet:      ["epp|pp"],
    Python:      ["py"],
    QML:         ["qml"],
    R:           ["r"],
    Razor:       ["cshtml|asp"],
    RDoc:        ["Rd"],
    Red:         ["red|reds"],
    RHTML:       ["Rhtml"],
    RST:         ["rst"],
    Ruby:        ["rb|ru|gemspec|rake|^Guardfile|^Rakefile|^Gemfile"],
    Rust:        ["rs"],
    SASS:        ["sass"],
    SCAD:        ["scad"],
    Scala:       ["scala|sbt"],
    Scheme:      ["scm|sm|rkt|oak|scheme"],
    SCSS:        ["scss"],
    SH:          ["sh|bash|^.bashrc"],
    SJS:         ["sjs"],
    Slim:        ["slim|skim"],
    Smarty:      ["smarty|tpl"],
    snippets:    ["snippets"],
    Soy_Template:["soy"],
    Space:       ["space"],
    SQL:         ["sql"],
    SQLServer:   ["sqlserver"],
    Stylus:      ["styl|stylus"],
    SVG:         ["svg"],
    Swift:       ["swift"],
    Tcl:         ["tcl"],
    Terraform:   ["tf", "tfvars", "terragrunt"],
    Tex:         ["tex"],
    Text:        ["txt"],
    Textile:     ["textile"],
    Toml:        ["toml"],
    TSX:         ["tsx"],
    Twig:        ["latte|twig|swig"],
    Typescript:  ["ts|typescript|str"],
    Vala:        ["vala"],
    VBScript:    ["vbs|vb"],
    Velocity:    ["vm"],
    Verilog:     ["v|vh|sv|svh"],
    VHDL:        ["vhd|vhdl"],
    Visualforce: ["vfp|component|page"],
    Wollok:      ["wlk|wpgm|wtest"],
    XML:         ["xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml"],
    XQuery:      ["xq"],
    YAML:        ["yaml|yml"],
    Zeek:        ["zeek|bro"],
    Django:      ["html"]
};

var namesToChange = {
    ObjectiveC: "Objective-C",
    CSharp: "C#",
    golang: "Go",
    C_Cpp: "C and C++",
    Csound_Document: "Csound Document",
    Csound_Orchestra: "Csound",
    Csound_Score: "Csound Score",
    coffee: "CoffeeScript",
    HTML_Ruby: "HTML (Ruby)",
    HTML_Elixir: "HTML (Elixir)",
    FTL: "FreeMarker",
    PHP_Laravel_blade: "PHP (Blade Template)",
    Perl6: "Perl 6",
    AutoHotKey: "AutoHotkey / AutoIt"
};

optGroup = document.getElementById("programming-languages-opt");

for (var name in languages) {
    var data = languages[name];
    var displayName = (namesToChange[name] || name).replace(/_/g, " ");
    var filename = name.toLowerCase();

    var element = document.createElement("option");
    element.value = filename;
    element.innerHTML = displayName;
    optGroup.appendChild(element);
}
