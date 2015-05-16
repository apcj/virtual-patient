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
        var paragraphs = sectionNotes.select('#list-notes').selectAll('p.note').data(notes);

        paragraphs.enter().append('p')
            .attr('class', 'note');

        paragraphs
            .classed('selected', function(note) { return note.selected; });

        paragraphs.exit().remove();

        var display = paragraphs.selectAll('span.display')
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
            .text(function(d) { return d.text; });

        display.exit().remove();

        var editButton = paragraphs.selectAll('span.note-button-edit')
            .data(function(note) { return note.editing ? [] : [note]; });

        editButton.enter()
            .append('span')
            .attr('class', 'note-button note-button-edit glyphicon glyphicon-pencil')
            .on('click', function(note) {
                note.editing = true;
                renderNotes();
            });

        editButton.exit().remove();

        var deleteButton = paragraphs.selectAll('span.note-button-delete')
            .data(function(note) { return note.editing ? [] : [note]; });

        deleteButton.enter()
            .append('span')
            .attr('class', 'note-button note-button-delete glyphicon glyphicon-remove')
            .on('click', function(note) {
                notes.splice(notes.indexOf(note), 1);
                renderNotes();
            });

        deleteButton.exit().remove();

        var editor = paragraphs.selectAll('textarea')
            .data(function(note) { return note.editing ? [note] : []; });

        editor.enter()
            .append('textarea')
            .attr('type', 'textarea')
            .attr('class', 'form-control')
            .on('blur', function(note) {
                note.text = this.value;
                note.editing = false;
                renderNotes();
            });

        editor
            .text(function(d) { return d.quotation; })
            .each(function() {
                this.focus();
            });

        editor.exit().remove();
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
                    notes.push({
                        quotation: quotationText,
                        text: quotationText
                    });
                    renderNotes();
                }
                draggingWords = false;
            });
    });
})();
