import Keymap from './keymap.js'

export default function Keyboard() {
    var canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    var context = canvas.getContext('2d');
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        getCurrentKeyboard().resize();
    }
    window.addEventListener('resize',resize);
    var isMouseDown = false;
    var previousNote = 0;
    window.addEventListener('mousedown',function(e) {
        previousNote = pressNote(getCurrentKeyboard().hit(e.clientX,e.clientY));
        isMouseDown = true;
    });
    window.addEventListener('mousemove',function(e) {
        if (isMouseDown) {
            var currentNote = pressNote(getCurrentKeyboard().hit(e.clientX,e.clientY));
            if (currentNote != previousNote) {
                releaseNote(previousNote);
                previousNote = currentNote;
            }
        }
    });
    window.addEventListener('mouseup',function(e) {
        releaseNote(previousNote);
        previousNote = releaseNote(getCurrentKeyboard().hit(e.clientX,e.clientY));
        isMouseDown = false;
    });
    window.addEventListener('keydown', function(e) {
        var note = alphanumeric.hit(e.keyCode);
        if (note !== -1)
            pressNote(note);
    });
    window.addEventListener('keyup', function(e) {
        var note = alphanumeric.hit(e.keyCode);
        if (note !== -1)
            releaseNote(note);
    });
    var oldTouchNotes = [];
    function handleTouch(e) {
        e.preventDefault();
        var newTouchNotes = [];
        for (var touch in e.touches) {
            if (!isNaN(touch)) {
                var currentNote = pressNote(getCurrentKeyboard().hit(e.touches[touch].clientX,e.touches[touch].clientY));
                for (var note in oldTouchNotes) {
                    if (oldTouchNotes[note] == currentNote) {
                        oldTouchNotes.splice(note, 1);
                    }
                }
                newTouchNotes.push(currentNote);
            }
        }
        for (note in oldTouchNotes) {
            releaseNote(oldTouchNotes[note]);
        }
        oldTouchNotes = newTouchNotes;
    }
    window.addEventListener('touchmove', handleTouch, {passive: false});
    window.addEventListener('touchstart', handleTouch, {passive: false});
    window.addEventListener('touchend', handleTouch, {passive: false});
    window.addEventListener('touchcancel', handleTouch, {passive: false});
    
    var currentKeyboard = 'isomorphic';
    
    function getCurrentKeyboard() {
        if (currentKeyboard == 'piano')
            return piano;
        else if (currentKeyboard == 'isomorphic')
            return isomorphic;
    }
    
    var piano = new function(){
        //All measurements are relative to
        //the size of 12 keys on a keyboard
        //I.E.: C thru B is length of 1.0f
        //Thanks to http://www.quadibloc.com/other/cnv05.htm for measurements
        var whiteWidths = [23,24,23,24,23,23,24];
        var blackWidths = [14,14,14,14,14,13,14,13,14,13,14,13];
        var whiteOffsets = [0];
        var blackOffsets = [0];
        for (var i in whiteWidths) {
            whiteWidths[i] /= 164;
            if (i != 0) {
                whiteOffsets[i] = whiteOffsets[i-1] + whiteWidths[i-1];
            }
        }
        for (var i in blackWidths) {
            blackWidths[i] /= 164;
            if (i != 0) {
                blackOffsets[i] = blackOffsets[i-1] + blackWidths[i-1];
            }
        }
        
        //offset of the keyboard from the center
        //measured in px
        //TODO: try to keep offsetY near 0.
        var offsetX = 0;
        var offsetY = 0;
        //size (pixels) of 12 key segment.
        var stretchX = 800;
        var stretchY = 400;
        //amount the upper rows are moved to
        //the right, and vice versa.
        //measured relative to 12 key segment
        //i.e.: skew=1; means one keyboard up
        //is one octave down.
        var skew = -1;
        //length of the black key relative to
        //the length of the white keys.
        //measured in percentile (0 to 1)
        var blackKeyLength = 0.6;
        //various key info 
        var keyInfo = [
            { name: "C",  color: "white", borderColor: "black", borderWidth: 2, nameColor: "black"},
            { name: "C#", color: "black", borderColor: "black", borderWidth: 2, nameColor: "white"},
            { name: "D",  color: "white", borderColor: "black", borderWidth: 2, nameColor: "black"},
            { name: "D#", color: "black", borderColor: "black", borderWidth: 2, nameColor: "white"},
            { name: "E",  color: "white", borderColor: "black", borderWidth: 2, nameColor: "black"},
            { name: "F",  color: "white", borderColor: "black", borderWidth: 2, nameColor: "black"},
            { name: "F#", color: "black", borderColor: "black", borderWidth: 2, nameColor: "white"},
            { name: "G",  color: "white", borderColor: "black", borderWidth: 2, nameColor: "black"},
            { name: "G#", color: "black", borderColor: "black", borderWidth: 2, nameColor: "white"},
            { name: "A",  color: "white", borderColor: "black", borderWidth: 2, nameColor: "black"},
            { name: "A#", color: "black", borderColor: "black", borderWidth: 2, nameColor: "white"},
            { name: "B",  color: "white", borderColor: "black", borderWidth: 2, nameColor: "black"}
        ]
        
        function drawKeyboard() {
            //only need to draw enough segments to fill the canvas.
            var currentOctave = 4;
            var top = -canvas.height/2;
            var bottom = -top;
            var currentOffsetY = offsetY;
            var currentOffsetX = offsetX;
            while (currentOffsetY < top) {
                currentOffsetY+=stretchY;
                currentOffsetX-=skew*stretchX;
            }
            while (currentOffsetY >= top) {
                currentOffsetY-=stretchY;
                currentOffsetX+=skew*stretchX;
            }
            while (currentOffsetY <= bottom) {
                drawKeyboardRow(currentOffsetX,currentOffsetY+canvas.height/2,currentOctave);
                currentOffsetY+=stretchY;
                currentOffsetX-=skew*stretchX;
            }
        }
        /**
         * draws one row of the keyboard
         * at the given offset from the top center.
         */
        function drawKeyboardRow(x,y,o) {
            var currentOctave = o; //C4
            var left = -canvas.width/2;
            var right = -left;
            var currentOffset = x;
            while (currentOffset < left) {
                currentOffset+=stretchX;
                currentOctave++;
            }
            while (currentOffset >= left) {
                currentOffset-=stretchX;
                currentOctave--;
            }
            while (currentOffset <= right) {
                drawKeyboardSegment(currentOffset+canvas.width/2,y,currentOctave)
                currentOffset+=stretchX;
                currentOctave++;
            }
            
        }
        /**
         * draws one 12-key segment of the keyboard
         * at the given offset from the top left corner
         */
        function drawKeyboardSegment(x,y,o) {
            //white notes broken into 7ths,
            //for each white key
            var keyValue = [0,2,4,5,7,9,11];
            for (var i = 0; i < 7; i++) {
                var key = keyInfo[keyValue[i]];
                var p = key.borderWidth/2;
                context.beginPath();
                context.rect(x+whiteOffsets[i]*stretchX+p, y+p, whiteWidths[i]*stretchX-2*p, stretchY-2*p);
                context.fillStyle = key.color;
                context.fill();
                context.lineWidth = key.borderWidth;
                context.strokeStyle = key.borderColor;
                context.stroke();
                context.font = Math.floor(stretchX/7/5)+'pt Calibri';
                context.textBaseline = 'bottom';
                context.textAlign = 'center';
                context.fillStyle = key.borderColor;
                context.fillText(key.name+o, x+(whiteOffsets[i]+whiteWidths[i]/2)*stretchX,y+stretchY);
            }
            //black keys broken into 12ths
            var blackWidth = stretchX/12;
            //and they have a unique height
            var blackHeight = stretchY*blackKeyLength;
            //but they only exist on certain 12ths:
            var isBlack = [0,1,0,1,0,0,1,0,1,0,1,0];
            //for every key on keyboard
            for (var i = 0; i < 12; i++) {
                if (isBlack[i]) {
                    var key = keyInfo[i];
                    //draw the key
                    context.fillStyle = keyInfo[i].color;
                    context.fillRect(x+blackOffsets[i]*stretchX, y, blackWidths[i]*stretchX, blackHeight);
                    
                    context.font = Math.floor(stretchX/7/5)+'pt Calibri';
                    context.textBaseline = 'bottom';
                    context.textAlign = 'center';
                    context.fillStyle = key.nameColor;
                    context.fillText(key.name+o, x+(blackOffsets[i]+blackWidths[i]/2)*stretchX,y+blackHeight);
                }
            }
        }
        
        function fixSkewRow() {
            var topOfSkewRow = -stretchY/2;
            while (offsetY > topOfSkewRow) {
                offsetY -= stretchY;
                offsetX += stretchX*skew;
            }
            while (offsetY <= topOfSkewRow) {
                offsetY += stretchY;
                offsetX -= stretchX*skew;
            }
        }
        
        function animate() {
            fixSkewRow();
            context.clearRect(0,0,canvas.width,canvas.height);
            drawKeyboard();
        }
        this.__animate = function() {
            animate();
        }
    }();
    
    var isomorphic = new function(){
        var offsetX = 400;
        var offsetY = 300;
        
        var ruleA = 2;
        var ruleB = -5;
        
        var isHorizontal = true;
        
        var stretchXY = 60;
        
        var drawList = [];
        
        var change = {};
        
        function fixKeyboard() {
            stretchXY = 60;
            drawList = [];
            var currentX = 0;
            var currentY = 0;
            var currentMidiValue = 60; //C4
            var left = -canvas.width/2-stretchXY*.66;
            var right = -left;
            var top = -canvas.height/2-stretchXY*.66;
            var bottom = -top;
            left -= offsetX;
            right -= offsetX;
            top -= offsetY;
            bottom -= offsetY;
            
            if (isHorizontal) {
                //fix vertically
                var movement = 2*stretchXY*Math.sqrt(3)/2;
                change = {
                    x: {
                        x: movement,
                        y: 0,
                        o: ruleA
                    },
                    y: {
                        x: movement*Math.cos(Math.PI/3),
                        y: movement*Math.sin(Math.PI/3),
                        o: ruleB
                    }
                }
                
                
                while (currentY < top) {
                    currentX += change.y.x;
                    currentY += change.y.y;
                    currentMidiValue += change.y.o;
                }
                while (currentY > top) {
                    currentX -= change.y.x;
                    currentY -= change.y.y;
                    currentMidiValue -= change.y.o;
                }
                
                while (currentX < left) {
                    currentX += change.x.x;
                    currentY += change.x.y;
                    currentMidiValue += change.x.o;
                }
                while (currentX > left) {
                    currentX -= change.x.x;
                    currentY -= change.x.y;
                    currentMidiValue -= change.x.o;
                }
                //each row
                var shiftLeftThisIteration = true;
                while (currentY < movement+bottom) {
                    //each column in that row
                    var tempX = currentX;
                    var tempY = currentY;
                    var tempO = currentMidiValue;
                    while(tempX < movement+right) {
                        drawList.push( {
                            x: tempX,
                            y: tempY,
                            o: tempO
                        } );
                        tempX += change.x.x;
                        tempY += change.x.y;
                        tempO += change.x.o;
                    }
                    currentX += change.y.x;
                    currentY += change.y.y;
                    currentMidiValue += change.y.o;
                    if (shiftLeftThisIteration) {
                        currentX -= change.x.x;
                        currentY -= change.x.y;
                        currentMidiValue -= change.x.o;
                    }
                    shiftLeftThisIteration = !shiftLeftThisIteration;
                }
            }
        }
        
        this.hit = function(x,y) {
            x -= canvas.width/2+offsetX;
            y -= canvas.height/2+offsetY;
            var currentX = 0;
            var currentY = 0;
            var currentMidiValue = 60;
                while (currentY < y) {
                    currentX += change.y.x;
                    currentY += change.y.y;
                    currentMidiValue += change.y.o;
                }
                while (currentY > y) {
                    currentX -= change.y.x;
                    currentY -= change.y.y;
                    currentMidiValue -= change.y.o;
                }
                //row above or at cursor
                
                while (currentX < x) {
                    currentX += change.x.x;
                    currentY += change.x.y;
                    currentMidiValue += change.x.o;
                }
                while (currentX > x) {
                    currentX -= change.x.x;
                    currentY -= change.x.y;
                    currentMidiValue -= change.x.o;
                }
                var pt = [ //potential targets
                    {
                        x: currentX,
                        y: currentY,
                        o: currentMidiValue,
                        d: 0
                    },{
                        x: currentX + change.x.x,
                        y: currentY + change.x.y,
                        o: currentMidiValue + change.x.o,
                        d: 0
                    },{
                        x: currentX + change.y.x,
                        y: currentY + change.y.y,
                        o: currentMidiValue + change.y.o,
                        d: 0
                    },{
                        x: currentX - change.x.x,
                        y: currentY - change.x.y,
                        o: currentMidiValue - change.x.o,
                        d: 0
                    },{
                        x: currentX - change.y.x,
                        y: currentY - change.y.y,
                        o: currentMidiValue - change.y.o,
                        d: 0
                    },{
                        x: currentX - change.x.x + change.y.x,
                        y: currentY - change.x.y + change.y.y,
                        o: currentMidiValue - change.x.o + change.y.o,
                        d: 0
                    },{
                        x: currentX - change.y.x + change.x.x,
                        y: currentY - change.y.y + change.x.y,
                        o: currentMidiValue - change.y.o + change.x.o,
                        d: 0
                    }
                ];
                var closest = pt[0];
                for (var i = 0; i < pt.length; i++) {
                    pt[i].d = Math.sqrt(Math.pow(pt[i].x-x,2)+Math.pow(pt[i].y-y,2));
                    if (pt[i].d < closest.d) closest = pt[i];
                }
            return closest.o;
        }
        this.noteOn = function(o) {
            notesHeld[o] = true;
            repaint();
        }
        this.noteOff = function(o) {
            notesHeld[o] = false;
            repaint();
        }
        function drawKeyboard() {
            for (var i in drawList) {
                var j = drawList[i];
                drawKey(j.x,j.y,j.o);
            }
        }
        var noteStyles = [
            {
                normal: {backgroundColor: "#077"},
                active: {backgroundColor: "#0EE"}
            },{
                normal: {backgroundColor: "#057"},
                active: {backgroundColor: "#0AF"}
            },{
                normal: {backgroundColor: "#077"},
                active: {backgroundColor: "#0EE"}
            },{
                normal: {backgroundColor: "#057"},
                active: {backgroundColor: "#0AF"}
            },{
                normal: {backgroundColor: "#077"},
                active: {backgroundColor: "#0EE"}
            },{
                normal: {backgroundColor: "#077"},
                active: {backgroundColor: "#0EE"}
            },{
                normal: {backgroundColor: "#057"},
                active: {backgroundColor: "#0AF"}
            },{
                normal: {backgroundColor: "#077"},
                active: {backgroundColor: "#0EE"}
            },{
                normal: {backgroundColor: "#057"},
                active: {backgroundColor: "#0AF"}
            },{
                normal: {backgroundColor: "#077"},
                active: {backgroundColor: "#0EE"}
            },{
                normal: {backgroundColor: "#057"},
                active: {backgroundColor: "#0AF"}
            },{
                normal: {backgroundColor: "#077"},
                active: {backgroundColor: "#0EE"}
            }
        ];
        var notesHeld = [];
        function drawKey(x,y,o) {
            x = offsetX+x+canvas.width/2;
            y = offsetY+y+canvas.height/2;
            context.beginPath();
            pathHexagon(x,y,0.95);
            context.fillStyle = noteStyles[o%12].normal.backgroundColor;
            if (notesHeld[o] == true)
                context.fillStyle = noteStyles[o%12].active.backgroundColor;
            context.strokeStyle = 'black';
            context.lineWidth = stretchXY/20;
            context.fill();
            context.beginPath();
            pathHexagon(x,y,.95);
            context.stroke();
            context.fill();
            context.fillStyle = "white";
            context.textBaseline = "middle";
            context.textAlign = "center";
            context.font = stretchXY*.8+'px Calibri';
            context.fillText(o, x, y);
        }
        
        function pathHexagon(x,y,scale) {
            var r = (isHorizontal ? 0 : Math.PI/2)+Math.PI/6;
            context.moveTo(x+scale*stretchXY*Math.cos(r),y+scale*stretchXY*Math.sin(r));
            for (var i = 0; i < 5; i++) {
                r+=Math.PI/3;
                context.lineTo(x+scale*stretchXY*Math.cos(r),y+scale*stretchXY*Math.sin(r));
            }
            context.closePath();
        }
        fixKeyboard();
        var paintQueued = false;
        var paintWaiting = false;
        function repaint() {
            if (paintQueued) {
                paintWaiting = true;
                return;
            }
            paintQueued = true;
            requestAnimationFrame(function() {
                drawKeyboard();
                if (paintWaiting) {
                    setTimeout(repaint,0);
                    paintWaiting = false;
                }
                paintQueued = false;
            });
        }
        this.__animate = function() {
            drawKeyboard();
        }
        this.resize = function() {
            fixKeyboard();
            drawKeyboard();
        }
        
    }();
    
    var alphanumeric = new function() {
        //Keymap object is important here!
        this.hit = function(key) {
            if (Keymap[key] == undefined) return -1;
            return 45+2*Keymap[key].x-5*Keymap[key].y;
        }
    }
    
    
    function repaint() {
        requestAnimationFrame(function() {isomorphic.__animate();});
    }
    repaint();
    
    
    
    
    var notesPressed = [];
    for (var i =0; i < 128; i++) notesPressed.push(false);
    function pressNote(o) {
        if (!notesPressed[o]) {
            notesPressed[o] = true;
            getCurrentKeyboard().noteOn(o);
            listenerList[0].noteOn(o);
        }
        return o;
    }
    function releaseNote(o) {
        if (notesPressed[o]) {
            notesPressed[o] = false;
            getCurrentKeyboard().noteOff(o);
            listenerList[0].noteOff(o);
        }
        return o;
    }
    
    
    
    var listenerList = [];
    /** Adds a note listener, which should implement `noteOn` and `noteOff` */
    this.addNoteListener = function(listener) {
        listenerList.push(listener);
    }
    this.removeNoteListener = function(listener) {
        listenerList.splice(indexOf(listener),1);
    }
    resize();
}