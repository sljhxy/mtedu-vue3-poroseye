
import tinymce from "tinymce/tinymce";
// import url from '../../../tinymce/formulas/index';
tinymce.PluginManager.add('kityformula-editor', function(editor, url) {

    // var baseURL = process.env.VITE_APP_BASE_API.editorUrl +'/tinymce/formulas/kityFormula.html';
    
    var baseURL = '/tinymce/formulas/kityformula-editor/kityFormula.html';
    editor.on('dblclick',function(){
        var sel=editor.selection.getContent();
        var path=/\<img(.*?)src="data:image\/png;base64,[A-Za-z0-9+/=]*"(.*?)data-latex="(.*?)" \/>/g;
        var path2=/data-latex="(.*?)"/g;

        if(sel.search(path)==0){
            sel.replace(path2,function($0,$1){
                var param=encodeURIComponent($1);
                openDialog(param);
                return $0;
            });
        };
    });

    var openDialog = function(param) {
        return editor.windowManager.openUrl({
            title: '插入公式',
            size: 'large',
            width: 785,
            height: 475,
            url:param?baseURL+"?c="+param:baseURL,
            buttons: [
                {
                    type: 'cancel',
                    text: 'Close'
                },
                {
                    type: 'custom',
                    text: 'Save',
                    name: 'save',
                    primary: true
                },
            ],
            onAction: function (api, details) {
                switch (details.name) {
                    case 'save':
                        api.sendMessage("save");
                        break;
                    default:
                        break;
                };
            }
        });
    };

    
    editor.ui.registry.addButton('kityformula-editor', {
        text: '公式',
        tooltip: '插入公式',
        onAction: function() {
            openDialog();
        }
    });
    editor.ui.registry.addMenuItem('kityformula-editor', {
        text: '公式',
        onAction: function() {
            openDialog();
        }
    });
    return {
        getMetadata: function() {
            return  {
                name: "公式",
                url: "http://hgcserver.gitee.io",
            };
        }
    };
});


// import api from '@/api/editor.js'
// tinymce.PluginManager.add('formulas', function(editor, url) {
//     var pluginName='公式';
//   //配置文件引入路径,根据自己项目来,我这里引入的api.editorUrl=http://192.168.1.171/apib
//   //需要说明的是iframe1所代表的页面地址在线下跑的时候需能够访问，否则访问不了会默认展示至项目首页
//     var iframe1 = process.env.VITE_APP_BASE_API.editorUrl + 'tinymce/formulas/formulas.html';
//     var openDialog = function () {
//         return editor.windowManager.openUrl({
//                 title: pluginName,
//                 size: 'large',
//                 url:iframe1,
//                 buttons: [
//                     {
//                             type: 'cancel',
//                             text: 'Close'
//                     },
//                       // {
//                       //  type: 'custom',
//                       //  text: 'Save',
//                       //  name: 'save',
//                       //  primary: true
//                       // },
//                 ],
//         });
//     };

//     // 注册一个工具栏按钮名称
//     editor.ui.registry.addButton('formulas', {
//         text: pluginName,
//         onAction: function () {
//                 openDialog();
//         }
//     });

//     // 注册一个菜单项名称 menu/menubar
//     editor.ui.registry.addMenuItem('formulas', {
//         text: pluginName,
//         onAction: function() {
//                 openDialog();
//         }
//     });

//     return {
//         getMetadata: function () {
//                 return  {
//                       //插件名和链接会显示在“帮助”→“插件”→“已安装的插件”中
//                     name: "Example plugin",//插件名称
//                     url: "http://exampleplugindocsurl.com", //作者网址
//                 };
//         }
//     };
// });