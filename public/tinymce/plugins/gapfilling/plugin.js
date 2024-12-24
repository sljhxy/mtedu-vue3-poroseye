tinymce.PluginManager.add('gapfilling', function(editor) {
  editor.ui.registry.addButton('gapfilling', {
    text: '插入填空',
    onAction: function () {
      const uuid = 'gap_' + new Date().getTime();
      const count = editor.getContent().match(/<span class="gapfilling-span/g)?.length || 0;
      const number = count + 1;
      editor.insertContent(`<span class="gapfilling-span ${uuid}">${number}</span>`);
    }
  });
});
