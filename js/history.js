$(function () {
    $('#list-notes').sortable({
        helper: function(event, item) {
            return $(item).clone();
        },
        receive: function(event, ui) {
            ui.helper.removeAttr('style');
        }
    });

    $('#section-history').find('p').draggable({
        helper: 'clone',
        appendTo: $('.container-fluid'),
        connectToSortable: '#list-notes'
    });
});
