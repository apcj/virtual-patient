(function() {
    var allWords = [];
    var selectedWords = [];

    var notes = [];

    var sectionNotes = d3.select('#section-notes');

    function updateSelectionClasses() {
        allWords.forEach(function(d) {
            d.selected = false;
        });
        selectedWords.forEach(function(d) {
            if (d) {
                d.selected = true;
            }
        });
        d3.selectAll('#section-history span')
            .classed('selected', function(d) { return d.selected; });
    }

    function renderNotes() {
        var rows = sectionNotes.select('#list-notes').selectAll('div.note').data(notes);

        rows.enter().append('div')
            .attr('class', 'note');

        rows
            .classed('selected', function(note) { return note.selected; });

        rows.exit().remove();

        var display = rows.selectAll('span.display')
            .data(function(note) { return note.editing ? [] : [note]; });

        display.enter()
            .append('span')
            .attr('class', 'display')
            .on('click', function(note) {
                notes.forEach(function(note) { note.selected = false; });
                note.selected = true;
                renderNotes();
            });

        display
            .text(function(d) { return d.content; });

        display.exit().remove();

        var editButton = rows.selectAll('span.note-button-edit')
            .data(function(note) { return note.editing ? [] : [note]; });

        editButton.enter()
            .append('span')
            .attr('class', 'note-button note-button-edit glyphicon glyphicon-pencil')
            .on('click', function(note) {
                notes.forEach(function(note) {
                    note.editing = false;
                    note.selected = false;
                });
                note.editing = true;
                renderNotes();
            });

        editButton.exit().remove();

        var deleteButton = rows.selectAll('span.note-button-delete')
            .data(function(note) { return note.editing ? [] : [note]; });

        deleteButton.enter()
            .append('span')
            .attr('class', 'note-button note-button-delete glyphicon glyphicon-remove')
            .on('click', function(note) {
                notes.splice(notes.indexOf(note), 1);
                renderNotes();
            });

        deleteButton.exit().remove();

        var contentEditor = rows.selectAll('textarea.content')
            .data(function(note) { return note.editing ? [note] : []; });

        contentEditor.enter()
            .append('textarea')
            .attr('type', 'textarea')
            .attr('class', 'form-control content');

        contentEditor
            .text(function(d) { return d.content; })
            .each(function() {
                this.focus();
            });

        contentEditor.exit().remove();

        var reasonDescription = rows.selectAll('span.reason.description')
            .data(function(note) { return note.editing ? [note] : []; });

        reasonDescription.enter()
            .append('span')
            .attr('class', 'reason description')
            .text('This is important because:');

        reasonDescription.exit().remove();

        var reasonEditor = rows.selectAll('textarea.reason')
            .data(function(note) { return note.editing ? [note] : []; });

        reasonEditor.enter()
            .append('textarea')
            .attr('type', 'textarea')
            .attr('class', 'form-control reason');

        reasonEditor
            .text(function(d) { return d.reason; })
            .each(function() {
                this.focus();
            });

        reasonEditor.exit().remove();

        var saveButton = rows.selectAll('button.save')
            .data(function(note) { return note.editing ? [note] : []; });

        saveButton.enter()
            .append('button')
            .attr('class', 'btn btn-default btn-primary save')
            .text('Save')
            .on('click', function(note) {
                var row = d3.select(this.parentElement)
                note.content = row.select('textarea.content').node().value;
                note.reason = row.select('textarea.reason').node().value;
                note.editing = false;
                renderNotes();
            });

        saveButton.exit().remove();
    }

    d3.selectAll('#section-history p').each(function() {
        var parent = this;
        var text = parent.innerText;
        var words = text.split(/(\s+)/).map(function(word) {
            return {
                text: word
            };
        });
        allWords = allWords.concat(words);
        var p = d3.select(parent);
        p.text('');

        var drag = d3.behavior.drag();

        var spans = p.selectAll('span').data(words);
        spans.enter().append('span')
            .attr('class', function(d) { return /^\s+$/.test(d.text) ? 'space' : 'word' })
            .text(function(d) { return d.text; });

        p.selectAll('span.word')
            .on('mouseover', function() {
                console.log('mouse over!');
            })
            .call(drag);

        function computePointerPosition() {
            var e = d3.event.sourceEvent;
            if (e.touches) {
                return {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
            }
            return {
                x: e.clientX,
                y: e.clientY
            };
        }
        var draggingWords = false;
        drag
            .on('dragstart', function(d) {
                if (d.selected) {
                    d3.select('body').append('div')
                        .attr('class', 'drag-words')
                        .text(selectedWords.map(function(d) { return d.text; }).join(''));
                    draggingWords = true;
                } else {
                    selectedWords = [d3.select(this).datum()];
                    updateSelectionClasses();
                }
            })
            .on('drag', function() {
                var position = computePointerPosition();
                var hoverElement = document.elementFromPoint(position.x, position.y);
                sectionNotes
                    .classed('hover', draggingWords && sectionNotes.node().contains(hoverElement));
                if (draggingWords) {
                    d3.selectAll('div.drag-words')
                        .style('left', (position.x + 10) + 'px')
                        .style('top',  (position.y + 10) + 'px');
                } else {
                    var draggedElement = this;
                    function findSequence(direction, reverse) {
                        var sequence = [d3.select(hoverElement).datum()];
                        var element = hoverElement;
                        while (element[direction]) {
                            element = element[direction];
                            sequence.push(d3.select(element).datum());
                            if (draggedElement === element) {
                                return reverse ? sequence.reverse() : sequence;
                            }
                        }
                        return null;
                    }
                    if (hoverElement.parentElement === parent) {
                        selectedWords =
                            findSequence('previousElementSibling', true) ||
                            findSequence('nextElementSibling', false) ||
                            selectedWords;
                        updateSelectionClasses();
                    }
                }
            })
            .on('dragend', function() {
                if (draggingWords && sectionNotes.classed('hover')) {
                    var dragHandle = d3.selectAll('div.drag-words');
                    var quotationText = dragHandle.text();
                    dragHandle.remove();
                    sectionNotes.classed('hover', false);
                    notes.forEach(function(note) {
                        note.editing = false;
                        note.selected = false;
                    });
                    notes.push({
                        quotation: quotationText,
                        content: quotationText,
                        editing: true
                    });
                    renderNotes();
                }
                draggingWords = false;
            });
    });

    renderNotes();
})();
