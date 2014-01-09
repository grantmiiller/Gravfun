(function() {
    "use strict";

    /* 
        Helpful Functions
    */

    function resetOrigin(ctx, height) {
        ctx.translate(0, height);
        ctx.scale(1, -1);
    }

    function minMaxRandom(min, max) {
        if(min < 1 || max < 1) {
            return Math.random() * (0.9 - 0.5) + 0.5;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /* Paul Irish's famous requestAnimFrame shim*/
    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame   ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
    })();


    var canvas = document.getElementById('gravity'),
        ctx = canvas.getContext('2d'),
        // World variable
        W = {
            x: canvas.width,
            y: canvas.height,
            airFriction: 0.001,
            groundFriction: 0.08,
            gravity: 1
        },

        balls = [],

        oldTime = null,

        stopper = null,

        TAU = Math.PI * 2;

    // Ball "class"
    function Ball(options) {
        this.x = options.x;
        this.y = options.y;
        this.radius = options.radius || 3;
        this.color = options.color || "#ff0000";
        // Bounce Rate
        this.br = options.br || 0.8;
        // Vertical Velocity
        this.yv = 0;
        // Horizontal Velocity
        this.xv = options.xv || 0;

        this.calculateVelocity = function(delta) {
            this.yv -= (W.gravity + W.airFriction);
            this.y += this.yv;

            if(this.xv > 0) {
                this.xv -= W.airFriction;                
            } else {
                this.xv += W.airFriction;
            }
            this.x += this.xv;

            if(this.x + this.radius >= W.x) {
                this.x = W.x - this.radius;
                this.xv *= -this.br
            } else if (this.x - this.radius <= 0) {
                this.x = this.radius;
                this.xv *= -this.br;
            }

            if(this.y - this.radius < 0) {

                if(this.xv > 0) {
                    this.xv -= W.groundFriction;
                    if(this.xv < 0)
                        this.xv = 0;               
                } else {
                    this.xv += W.groundFriction;
                    if(this.xv > 0)
                        this.xv = 0;
                }

                this.y = this.radius;
                this.yv *= -this.br; 
            }
        };

        this.draw = function() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, TAU, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        };
    }

    resetOrigin(ctx, W.y);

    init();

    function init() {
        makeBalls(2);

        oldTime = Date.now();
        step();
    }

    function step() {
        var newTime = Date.now();
        var delta = (newTime - oldTime) / 1000;
        calculateVelocity(delta);
        render();

        oldTime = newTime;
        stopper = window.requestAnimFrame(step);
    }

    function makeBalls(num) {
        for(var i = 0; i < num; i++) {
            balls.push(new Ball({
                x: minMaxRandom(4, W.x - 4),
                y: minMaxRandom(W.y / 2, W.y),
                xv: minMaxRandom(20, 40),
                br: minMaxRandom(0.5, 0.9),
                radius: minMaxRandom(3, 10)
            }));
        }
    }

    function calculateVelocity(delta) {
        for(var i = 0, len = balls.length; i < len; i++) {
            balls[i].calculateVelocity(delta);
        }
    }

    function render(delta) {
        ctx.clearRect(0, 0, W.x, W.y);

        for(var i = 0, len = balls.length; i < len; i++) {
            balls[i].draw();
        }
    }

    document.getElementById('stop').addEventListener('click', function() {
        window.cancelAnimationFrame(stopper);
    })
})();