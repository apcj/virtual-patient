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

        console.log(spans);

        p.selectAll('span.word')
            .call(drag);

        drag
            .on('dragstart', function(d) {
                console.log('dragstart');
                if (d.selected) return;
                selectedWords = [];
                selectedWords.push(d3.select(this).datum());
                updateSelectionClasses();
            })
            .on('drag', function() {
                var e = d3.event.sourceEvent;
                var hoverElement;
                var draggedElement = this;
                if (e.touches) {
                    hoverElement = document.elementFromPoint(e.touches[0].pageX, e.touches[0].pageY);
                } else {
                    hoverElement = document.elementFromPoint(e.clientX, e.clientY);
                }
                function findSequence(direction) {
                    var sequence = [];
                    sequence.push(d3.select(hoverElement).datum());
                    var element = hoverElement;
                    while (element[direction]) {
                        element = element[direction];
                        sequence.unshift(d3.select(element).datum());
                        if (draggedElement === element) {
                            return sequence;
                        }
                    }
                    return null;
                }
                if (hoverElement.parentElement === parent) {
                    selectedWords =
                        findSequence('previousElementSibling') ||
                        findSequence('nextElementSibling') ||
                        selectedWords;
                    updateSelectionClasses();
                }
            })
            .on('dragend', function() {
                console.log(selectedWords);
            });
    });
})();
