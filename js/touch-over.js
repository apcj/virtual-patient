(function() {
    var previous = [];

    function fireEvents(baseline, current, eventName) {
        for (var i = 0; i < current.length; i++) {
            var element = current[i];
            if (baseline.indexOf(element) === -1) {
//                console.log(element, eventName);
                var event = new MouseEvent(eventName);
                element.dispatchEvent(event);
            }
        }
    }

    function handleTouches(touches) {
        var elements = [];
        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            elements.push(document.elementFromPoint(touch.clientX, touch.clientY));
        }
        fireEvents(previous, elements, 'mouseover');
        fireEvents(elements, previous, 'mouseout');
        previous = elements;
    }

    document.body.addEventListener('touchstart', function(e) {
       handleTouches(e.touches);
    });
    document.body.addEventListener('touchmove', function(e) {
       handleTouches(e.touches);
    });
    document.body.addEventListener('touchend', function(e) {
       handleTouches([]);
    });
})();