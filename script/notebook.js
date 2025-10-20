var Notebook = {
    name: _("Notebook"),

    init: function(options) {
        this.options = $.extend(
			this.options,
			options
		);

        this.tab = Header.addLocation(_("Notebook"), "notebook", Notebook);

        this.panel = $('<div>').attr('id', "notebookPanel")
			.addClass('location')
			.appendTo('div#locationSlider');
        
        new 
        
        new Button.Button({
            id: 'saveButton',
			text: _("Save Note"),
			click: Outside.gatherWood,
			width: '80px'
        }).appendTo('div#notebookPanel');
    }
}