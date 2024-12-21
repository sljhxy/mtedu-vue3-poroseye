(function(global) {
const getSktType = (name) => {
  return /select$/.test(name);
};
const splitObj = {
  "forecolor": true,
  "backcolor": true,
  tpLetterspacing: true,
  tpIconlists: true,
  tpColumns: true,
  table: true
};
const menubarObj = {
  title: {
    file: {
      zh_CN: "\u6587\u4EF6",
      en_US: "File"
    },
    edit: {
      zh_CN: "\u7F16\u8F91",
      en_US: "Edit"
    },
    view: {
      zh_CN: "\u67E5\u770B",
      en_US: "View"
    },
    insert: {
      zh_CN: "\u63D2\u5165",
      en_US: "Insert"
    },
    format: {
      zh_CN: "\u683C\u5F0F",
      en_US: "Format"
    },
    table: {
      zh_CN: "\u8868\u683C",
      en_US: "Table"
    },
    tools: {
      zh_CN: "\u5DE5\u5177",
      en_US: "Tools"
    },
    help: {
      zh_CN: "\u5E2E\u52A9",
      en_US: "Help"
    }
  },
  items: {
    code: "tools",
    spellchecker: "tools",
    spellcheckerlanguage: "tools",
    wordcount: "tools",
    image: "insert",
    link: "insert",
    media: "insert",
    hr: "insert",
    template: "insert",
    codesample: "insert",
    charmap: "insert",
    inserttable: "table",
    emoticons: "insert",
    pagebreak: "insert",
    nonbreaking: "insert",
    anchor: "insert",
    toc: "insert",
    insertdatetime: "insert",
    bold: "format",
    italic: "format",
    underline: "format",
    strikethrough: "format",
    blockquote: "format",
    subscript: "format",
    superscript: "format",
    removeformat: "format",
    formatselect: "format",
    fontselect: "format",
    fontsizes: "format",
    forecolor: "format",
    backcolor: "format",
    fontformats: "format",
    blockformats: "format",
    codeformat: "format",
    align: "format",
    table: "table",
    lineheight: "format",
    help: "help"
  }
};
const menubarTitle = {
  file: true,
  view: true,
  edit: true
};
const getToolbarGroups = (toolbar) => {
  let toolbar_groups = [];
  let toolbarList = toolbar.split("|");
  toolbarList.forEach((item) => {
    let toolbarItem = item.split(" ");
    let toolbarGroup = [];
    toolbarItem.forEach((cItem) => {
      cItem && toolbarGroup.push({ isSelect: getSktType(cItem), name: cItem });
      cItem && menubarObj.items[cItem] && (menubarTitle[menubarObj.items[cItem]] = true);
    });
    toolbarGroup.length > 0 && toolbar_groups.push(toolbarGroup);
  });
  return toolbar_groups;
};
const getMenubarGroups = (menubar) => {
  let menubar_groups = [];
  let menubarList = menubar.split("|");
  menubarList.forEach((item) => {
    let menubarItem = item.split(" ");
    let menubarGroup = [];
    menubarItem.forEach((cItem) => {
      cItem && menubarGroup.push({ isSelect: getSktType(cItem), name: cItem });
    });
    menubar_groups.push(menubarGroup);
  });
  return menubar_groups;
};
const getStyle = () => {
return `.skt-tox-tinymce{

border: 1px solid #ccc;
border-radius: 0;
box-shadow: none;
box-sizing: border-box;
display: flex;
flex-direction: column;
font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;
overflow: hidden;
position: relative;
visibility: inherit!important;
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: normal;
-webkit-tap-highlight-color: transparent;
text-decoration: none;
text-shadow: none;
text-transform: none;
vertical-align: initial;
white-space: normal;
  height: 200px;
}

.skt-tox-editor-container{
display: flex;
flex: 1 1 auto;
flex-direction: column;
overflow: hidden;
}
.skt-tox-editor-header{
box-shadow: none;
transition: box-shadow .5s;
  z-index: 1;
}
.skt-tox-anchorbar{
display: flex;
flex: 0 0 auto;
border-top: 1px solid #ccc;
}
.skt-tox-tinymce .skt-tox-statusbar{
align-items: center;
background-color: #fff;
border-top: 1px solid #ccc;
color: rgba(34,47,62,.7);
display: flex;
flex: 0 0 auto;
font-size: 12px;
font-weight: 400;
height: 18px;
overflow: hidden;
padding: 0 8px;
position: relative;
text-transform: uppercase;

}
.skt-tox-tinymce .skt-tox-toolbar,.skt-tox-tinymce .skt-tox-menubar{
background:url("data:image/svg+xml;charset=utf8,%3Csvg height='39px' viewBox='0 0 40 39px' width='40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='38px' width='100' height='1' fill='%23cccccc'/%3E%3C/svg%3E") left 0 top 0 #fff;
background-color: #fff;
display: flex;
flex: 0 0 auto;
flex-shrink: 0;
flex-wrap: wrap;
padding: 0 0;

}
.skt-tox-mbtn{
align-items: center;
background: 0 0;
border: 0;
border-radius: 3px;
box-shadow: none;
color: #222f3e;
display: flex;
flex: 0 0 auto;
font-size: 14px;
font-style: normal;
font-weight: 400;
height: 34px;
justify-content: center;
margin: 2px 0 3px 0;
outline: 0;
overflow: hidden;
padding: 0 4px;
text-transform: none;
width: auto;
}
.skt-tox-mbtn__select-label {
cursor: default;
font-weight: 400;
margin: 0 4px;
}
.skt-tox-tbtn.skt-tox-split-button{
border: 0;
border-radius: 3px;
box-sizing: border-box;
display: flex;
width: 50px;
margin: 2px 0 3px 0;
overflow: hidden;
}
.skt-tox-split-button .skt-tox-tbtn__select-chevron{
margin-left: 5px;

}
.skt-tox-toolbar__group{
border-right:1px solid #ccc;
align-items: center;
display: flex;
flex-wrap: wrap;
margin: 0 0;
padding: 0 4px 0 4px;
}
.skt-tox-toolbar__group:last-child {
border-right: 0px;
}
.skt-tox-sidebar-wrap-box{
display: flex;
flex: 0 0 auto;
flex-direction: column;
flex-shrink: 0;
height: 100%;
overflow: hidden;
position: relative;
width: 100%;
}
.skt-tox-sidebar-wrap-box p{
height: 16px;
width: calc(100% - 40px);
margin: 5px 20px;
}
.skt-tox-sidebar-wrap-box p:first-child{
width: calc(100% - 74px)!important;
margin-top: 20px;
margin-left: 54px!important;
}

.skt-tox-sidebar-wrap-box p:nth-child(3n+2){
width: 90%;
margin-right:8%;
}
.skt-tox-sidebar-wrap-box p:nth-child(3n+3){
width: calc(100% - 74px);
margin-left: 54px
}
.skt-tox-sidebar-wrap-box p:nth-child(3n+1){
width: 75%;
margin-right:8%;
}
.skt-tox-sidebar-wrap-box p:last-child{
width: 65%!important;
margin-left: 20px;
}
.skt-tox-tbtn{
align-items: center;
background: 0 0;
border: 0;
border-radius: 3px;
box-shadow: none;
color: #222f3e;
display: flex;
flex: 0 0 auto;
font-size: 14px;
font-style: normal;
font-weight: 400;
height: 34px;
justify-content: center;
margin: 2px 0 3px 0;
outline: 0;
overflow: hidden;
padding: 0;
text-transform: none;
width: 34px;
}
.skt-tox-tbtn--select{
margin: 2px 0 3px 0;
padding: 0 4px;
padding-right: 3px;
width: auto;
}
.skt-tox-tbtn__select-label{ 
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
width: 7em;
font-weight: 400;
margin: 0 4px;
}
.skt-tox-tbtn__select-chevron{
align-items: center;
display: flex;
justify-content: center;
width: 10px;
height: 14px;
}
.skt-tox-icon {
display: inline-block;
width: 24px;
height: 24px;
}

@-webkit-keyframes skeleton-ani {
0% {
left: -90%
}

to {
left: 120%
}
}

@keyframes skeleton-ani {
0% {
left: -90%
}

to {
left: 120%
}
}
.skt{
display: none;
width: 100%;
top:0;
position: absolute;
z-index: 99;
background: #fff;
}
.skt.skt-loading{
display: block;
}
.skt-loading .skeleton {
position: relative;
overflow: hidden;
border: none !important;
border-radius: 5px;
background-color: rgba(0, 0, 0, 0) !important;
background-image: none !important;
pointer-events: none;
}

.skt-loading .skeleton:after {
content: "";
position: absolute;
left: 0;
top: 0;
z-index: 9;
width: 100%;
height: 100%;
background-color: #ebf1f8;
display: block
}

.skt-loading .skeleton:not(.not-round):after {
border-radius: 4px
}
.skt-loading .tox-tbtn__select-chevron{
display: inline-block;
width: 8px;
height: 18px;
}
.skt-loading .tox-icon { display: inline-block; width: 24px; height: 24px;}
.skt-loading .skeleton:not(.not-before):before {
position: absolute;
top: 0;
width: 30%;
height: 100%;
content: "";
background: -webkit-gradient(linear, left top, right top, color-stop(0, hsla(0, 0%, 100%, 0)), color-stop(50%, hsla(0, 0%, 100%, .3)), to(hsla(0, 0%, 100%, 0)));
background: -o-linear-gradient(left, hsla(0, 0%, 100%, 0) 0, hsla(0, 0%, 100%, .3) 50%, hsla(0, 0%, 100%, 0) 100%);
background: linear-gradient(90deg, hsla(0, 0%, 100%, 0) 0, hsla(0, 0%, 100%, .3) 50%, hsla(0, 0%, 100%, 0));
-webkit-transform: skewX(-45deg);
-ms-transform: skewX(-45deg);
transform: skewX(-45deg);
z-index: 99;
-webkit-animation: skeleton-ani 1s ease infinite;
animation: skeleton-ani 1s ease infinite;
display: block
}
.skt-loading .skeleton.badge:after {
background-color: #f8fafc
}`;
};
const createSkeleton = (opt) => {
if (!document.querySelector("style#skt-tox-style")) {
let style = document.createElement("style");
style.type = "text/css";
style.id = "skt-tox-style";
try {
  style.appendChild(document.createTextNode(getStyle()));
} catch (ex) {
  style.styleSheet.cssText = getStyle();
}
let head = document.getElementsByTagName("head")[0];
head.appendChild(style);
}
let toolbar_groups = [];
if (typeof opt.toolbar === "string") {
toolbar_groups = getToolbarGroups(opt.toolbar);
} else if (Array.isArray(opt.toolbar)) {
opt.toolbar.forEach((ele) => {
  toolbar_groups.push(...getToolbarGroups(ele));
});
}
let menubar_groups = [];
if (opt.menubar === false)
;
else if (typeof opt.menubar === "string") {
menubar_groups = getMenubarGroups(opt.menubar);
} else {
for (let key in menubarObj.title) {
  menubarTitle[key] && menubar_groups.push(menubarObj.title[key][opt.language || "en_US"]);
}
}
let height = opt.min_height || opt.height || 200;
let placeholderList = [];
let placeholderLen = height - 150;
for (let i = 0; i < placeholderLen; i += 50)
placeholderList.push("1");
let sktSelector = opt.selector ? document.querySelector(opt.selector).parentNode : opt.target.parentNode;
let sktDom = document.createElement("div");
sktDom.className = "skt skt-loading";
sktDom.innerHTML = createTemplate({ selector: opt.selector, toolbar: toolbar_groups, menubar: menubar_groups, branding: opt.branding === false ? false : true, placeholderList, height });
sktSelector.style.position = "relative";
sktSelector.style.minHeight = height + "px";
sktSelector.append(sktDom);
return sktDom;
};
const createMenubarTemplate = (data) => {
let strHtml = "";
data.forEach((item) => {
strHtml += '<button  class="skt-tox-mbtn skt-tox-mbtn--select"><span class="skt-tox-mbtn__select-label skeleton">' + item + "</span></button>\n";
});
return strHtml;
};
const createToolbarTemplate = (data) => {
let strHtml = "";
data.forEach((item) => {
strHtml += '<div class="skt-tox-toolbar__group">\n';
item.forEach((ele) => {
  strHtml += '<button class="skt-tox-tbtn ' + (ele.isSelect ? " skt-tox-tbtn--select" : "") + (splitObj[ele.name] ? " skt-tox-split-button" : "") + '"><span class="' + (ele.isSelect ? "skt-tox-tbtn__select-label skt-tox-tbtn--select" : "skt-tox-icon tox-tbtn__icon-wrap") + ' skeleton">' + ele.name + "</span>" + (ele.isSelect || splitObj[ele.name] ? '<div class="skt-tox-tbtn__select-chevron skeleton"></div>' : "") + "</button>\n";
});
strHtml += "</div>\n";
});
return strHtml;
};
const createWrapBoxTemplate = (data) => {
let strHtml = "";
data.forEach((item) => {
strHtml += '<p class="skeleton"></p>\n';
});
return strHtml;
};
const createTemplate = (sktData) => {
return `
<div class="skt-tox-tinymce"  style="height: ${sktData.height}px" >
<div class="skt-tox-editor-container">
<div class="skt-tox-editor-header">
<div  class="skt-tox-menubar">
${createMenubarTemplate(sktData.menubar)} 
</div>
<div class="skt-tox-toolbar-overlord">
<div class="skt-tox-toolbar">
${createToolbarTemplate(sktData.toolbar)}
</div>
</div>
<div class="skt-tox-anchorbar"></div>
</div>
<div class="skt-tox-sidebar-wrap-box">

<p  class="skeleton"> &nbsp; </p>
${createWrapBoxTemplate(sktData.placeholderList)}
<p class="skeleton"> </p>
</div>
</div> 
<div class="skt-tox-statusbar">
<div class="skeleton">
PP
</div> 
${sktData.branding ? '<span class="skeleton" style="margin-left: calc(100% - 120px)">Powered by Five </span>' : ""}
</div>
</div>`;
};

global.createSkeleton = createSkeleton;
}(window));