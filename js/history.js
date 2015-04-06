(function() {
    var allWords = [];
    var selectedWords = [];

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
            .call(drag);

        function computePointerPosition() {
            var e = d3.event.sourceEvent;
            if (e.touches) {
                return {
                    x: e.touches[0].pageX,
                    y: e.touches[0].pageY
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
                if (draggingWords) {
                    d3.selectAll('div.drag-words')
                        .style('left', position.x + 'px')
                        .style('top', position.y + 'px');
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
                d3.selectAll('div.drag-words').remove();
                draggingWords = false;
            });
    });
})();
