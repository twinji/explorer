var WIDTH = screen.width, HEIGHT = screen.height, PI = Math.PI;
var canvas, c, overlay, o, overlay2, o2, background, b, hud;
var lastTime = window.performance.now(), delta, time, timeSpeed = 1;
var zoom, maxScaleFactor = 10, minScaleFactor = 1.1, scaleFactor = minScaleFactor;
var key, up = 38, down = 40, left = 37, right = 39, enter = 13, escape = 45;
var n = [[58, 0], [49, 1], [50, 2], [51, 3], [52, 4], [53, 5], [54, 6], [55, 7], [56, 8], [57, 9]];
var star, stars, sun, planet, planets, moon, satellite, transport, fleet, station, units, asteroidBelt, AB, KB;
var rogueAsteroids;
var selectionController, planetControl, cursor, chooseNumber;
var findingTarget = false;
var year = 2015, population, growthRate = 0.05;
var menus, miniMenu, sendMenu, buildMenu, menuControl, phase = 0;
var errorWindow;

function main() {
    canvas = document.getElementById("canvas");
    overlay = document.getElementById("overlay");
    overlay2 = document.getElementById("overlay2");
    background = document.getElementById("background");
    c = canvas.getContext("2d");
    o = overlay.getContext("2d");
    o2 = overlay2.getContext("2d");
    b = background.getContext("2d");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    overlay.width = WIDTH;
    overlay.height = 50;
    overlay2.width = WIDTH / 5;
    overlay2.height = HEIGHT;
    background.width = WIDTH;
    background.height = HEIGHT;
	c.font = "14px Arial";
    o.font = "14px Arial";
    o2.font = "10px Arial";
    
    key = [];
    document.addEventListener("keydown", function(e) {
        key[e.keyCode] = true;
        if (!findingTarget && !menus.active()) planetControl.optionScroll(e.keyCode);
        else if (menus.active()) menuControl.optionScroll(e.keyCode);
        else if (findingTarget && e.keyCode === enter) cursor.sendUnit(); 
    });
    document.addEventListener("keyup", function(e) {
        key[e.keyCode] = false;
    });
    
    init();
    
    var gameLoop = function() {
        var thisTime = window.performance.now();
        delta = (thisTime - lastTime) / 20;
        lastTime = thisTime;
        time = timeSpeed;//delta * timeSpeed;
        update();
        render();
        window.requestAnimationFrame(gameLoop, canvas);
    }
    window.requestAnimationFrame(gameLoop, canvas);
}

function init() {
    stars.create(0.1, 1, 88);
    AB = new asteroidBelt(250, 1.85, 0.4, 20);
    AB.create(400);
    KB = new asteroidBelt(490, 1.7, 0.4, 40);
    KB.create(500);
    
    planets.add(80, 2, "MERCURY", 0.9, "darkgrey", 0);
    planets.add(120, 3, "VENUS", 0.4, "darkkhaki", 0);
    planets.add(170, 4, "EARTH", 0.2, "dodgerblue", 100000);
        planets.planetsList[2].addMoon(11, 0.85, "MOON", 2, "lightgrey", 0);
    planets.add(210, 3, "MARS", 0.3, "darkorange", 0);
        planets.planetsList[3].addMoon(8, 0.4, "DEIMOS", 0.9, "grey", 0);
        planets.planetsList[3].addMoon(10, 0.8, "PHOBOS", 1.8, "darkgrey", 0);
    planets.add(295, 10, "JUPITER", 0.1, "darksalmon", 0);
        planets.planetsList[4].addMoon(20, 0.8, "EUROPA", 1.8, "cadetblue", 0);
        planets.planetsList[4].addMoon(17.5, 0.5, "IO", 1.3, "gold", 0);
        planets.planetsList[4].addMoon(22.5, 0.65, "GANYMEDE", 1.1, "purple", 0);
        planets.planetsList[4].addMoon(24.45, 0.725, "CALLISTO", 1.4, "grey", 0);
    planets.add(340, 8, "SATURN", 0.078, "burlywood", 0);
        planets.planetsList[5].addMoon(12.5, 0.725, "TITAN", 1.4, "darkcyan", 0);
        planets.planetsList[5].addMoon(14.95, 0.45, "ENCELADUS", 1.9, "white", 0);
    planets.add(380, 6, "URANUS", 0.058, "lightblue", 0);
    planets.add(416, 6, "NEPTUNE", 0.045, "blue", 0);
	planets.add(450, 0.7, "PLUTO", 0.023, "white", 0);
	    planets.planetsList[8].addMoon(5, 0.5, "CHARON", 1.0, "grey", 0);
    
    
    miniMenu = new menu(71, 12, "black");
    miniMenu.addOption("SEND", function() {
        menuControl.setArrayList(sendMenu.options);
        sendMenu.activate();
        miniMenu.deactivate();
    });
    miniMenu.addOption("BUILD", function() {
		menuControl.setArrayList(buildMenu.options);
		buildMenu.activate();
        miniMenu.deactivate();
    });
    miniMenu.addOption("STATUS", function() {
        miniMenu.deactivate();
    });
    
    
    sendMenu = new menu(81, 12, "black");
    sendMenu.addOption("SATELLITE", function() {
        findingTarget = true;
        cursor.setPos(planetControl.current);
        cursor.setUnit("satellite");
        sendMenu.deactivate();
    });
    sendMenu.addOption("TRANSPORT", function() {
        findingTarget = true;
        cursor.setPos(planetControl.current);
        cursor.setUnit("transport");
        sendMenu.deactivate();
    });
    sendMenu.addOption("FLEET", function() {
		findingTarget = true;
		cursor.setPos(planetControl.current);
		cursor.setUnit("fleet");
        sendMenu.deactivate();
    });
	
	buildMenu = new menu(81, 12, "black");
	buildMenu.addOption("SATELLITE", function() {
		buildMenu.deactivate();	
	});
	buildMenu.addOption("TRANSPORT", function() {
		buildMenu.deactivate();	
	});
	buildMenu.addOption("FLEET", function() {
		buildMenu.deactivate();	
	});
    
    
    planetControl = new selectionController(planets.planetsList, 2, right, left, function() {
        menuControl.setArrayList(miniMenu.options);
        miniMenu.activate();
    });
    menuControl = new selectionController(miniMenu.options, 0, down, up, function() {
        menuControl.current.actionFunction();
    });
}

function update() {    
    planets.update();
    AB.update();
    KB.update();
    units.update();
    population = calculatePopulation();
    planetControl.update();
    menuControl.update();
    zoom.update();
    cursor.update();
    menus.update();
    errorWindow.update();
}

function render() {
    b.clearRect(0, 0, background.width, background.height);
    c.clearRect(0, 0, WIDTH, HEIGHT);
    o.clearRect(0, 0, overlay.width, overlay.height);
    o2.clearRect(0, 0, overlay2.width, overlay2.height);

    stars.render();
    sun.render();
    AB.render();
    KB.render();
    units.render();
    planets.render();
    hud.render();
    planetControl.render();
    menuControl.render();
    zoom.render();
    cursor.render();
    menus.render();
    errorWindow.render();
}

function pointDistance(x1, y1, x2, y2) {
	var diffX = x2 - x1;
	var diffY = y2 - y1;
	return Math.sqrt((diffX * diffX) + (diffY * diffY));
}

function pointDirection(x1, y1, x2, y2) {
    var angle = Math.atan2(x2 - x1, y2 - y1) - (PI / 2);
    if (angle < 0) angle += (2 * PI);
    return angle;
}

function angleDifference(angle1, angle2) {
    var diff = angle2 - angle1;
    while (diff < -PI) diff += (2 * PI);
    while (diff > PI) diff -= (2 * PI);
    return diff;
}

function calculateEarthYear() {
    var earth = planets.planetsList[2];
    var yearsAfter = (earth.rot / (2 * PI)).toFixed(0);
    var year = 2015 + yearsAfter;
    return year;
}

function calculatePopulation() {
    var p = 0;
    for (var i = 0; i < planets.planetsList.length; i++) {
        p += planets.planetsList[i].population;    
    }
    for (var i = 0; i < units.transports.length; i++) {
        p += units.transports[i].population;    
    }
	p = Math.max(0, p);
    return p;
}

function drawRings(x, y, a, radius, rot, num, color, alpha) {
    this.dir = 1;
    this.gap = 3 * alpha;
    a.save();  
    a.globalAlpha = ((1 - (scaleFactor / maxScaleFactor)) / 5) * alpha;
    a.lineCap = "round";
    a.strokeStyle = "white";
    a.lineWidth = 1 / scaleFactor;
    for (var i = 1; i <= num; i++) {
        this.dir *= -1;
        var start = (PI / num) * i;
        var end = start + PI;
        a.beginPath();
		a.strokeStyle = color;
        a.arc(x, y, radius + (i * this.gap), (start + rot) * this.dir, (end + rot) * this.dir, false);
        a.stroke();
        a.closePath();
    }
    a.restore();
}

function drawLineGlow(x, y, a, radius, num, color, alpha) {
    this.gap = 3 * alpha;
    a.save();  
    a.lineCap = "round";
    a.strokeStyle = "white";
    a.lineWidth = 1 / scaleFactor;
    for (var i = 1; i <= num; i++) {
		a.globalAlpha = alpha / i;
        a.beginPath();
		a.strokeStyle = color;
        a.arc(x, y, radius + (i * this.gap), 0, 2 * PI, false);
        a.stroke();
        a.closePath();
    }
    a.restore();
}

function drawName(x, y, a, radius, name, population, string, alpha) {
    c.save();
    c.globalAlpha = 0.5 * alpha;
    
    c.fillStyle = "white";
    c.strokeStyle = "white";
    c.font = "6px Arial";
    c.lineWidth = 1 / scaleFactor;
    
    c.textBaseline = "bottom";
    c.fillText(string + name, x + radius + 18, y - 2);
    c.textBaseline = "top";
    c.fillText(population.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","), x + radius + 18, y + 2);
    
    c.beginPath();
    c.moveTo(x + radius, y);
    c.lineTo(x + radius + 57 + (string.length * 4), y);
    c.stroke();
    c.closePath();
    
    c.globalAlpha = 1;
    c.restore();
}

function drawLine(x1, y1, x2, y2, a) {
    a.save();
    a.globalAlpha = 0.4;
    a.strokeStyle = "white";
    a.lineWidth = 1 / scaleFactor;
    a.beginPath();
    a.moveTo(x1, y1);
    a.lineTo(x2, y2);
    a.stroke();
    a.closePath();
    a.globalAlpha = 1;
    a.restore();
}

errorWindow = {
    list: [],
    log: function(string) {
        this.list.push(new listing(string));
    },
    listing: function(string) {
        this.string = string;
        this.opacity = 1;
        this.update = function(i) {
            this.opacity -= 0.01;
            if (this.opacity <= 0) {
                errorWindow.list.splice(i, 1);
            }
        };
        this.render = function() {};
    },
    update: function() {for (var i = 0; i < this.list.length; i++) {this.list[i].update(i);}},
    render: function() {for (var i = 0; i < this.list.length; i++) {this.list[i].render();}} 
};

cursor = {
    x: null,
    y: null,
    origin: null,
    target: null,
    unit: null,
	snapRange: 40,
    radius: 4,
    velX: 0,
    velY: 0,
    speed: 4,
    friction: 0.8,
    setPos: function(obj) {
        this.origin = obj;
        this.x = obj.x;
        this.y = obj.y;
    },
    setUnit: function(unit) {
        this.unit = unit;
    },
	sendUnit: function() {
		if (this.target !== null && this.target !== undefined) {
			this.origin.send(this.unit, this.target);
            this.target = null;
            findingTarget = false;
		} else findingTarget = false;
	},
    update: function() {
        if (findingTarget) {
            if (key[up]) this.velY -= this.speed;
            if (key[down]) this.velY += this.speed;
            if (key[left]) this.velX -= this.speed;
            if (key[right]) this.velX += this.speed;
            this.velX *= this.friction;
            this.velY *= this.friction;
            this.x += this.velX;
            this.y += this.velY;
            
            for (var i = 0; i < planets.planetsList.length; i++) {
                if (planets.planetsList[i] !== this.origin) {
                    var p = planets.planetsList[i];
                } else continue;
				var dis = pointDistance(p.x, p.y, this.x, this.y);
                if (dis <= p.radius + this.snapRange) {
                    this.x += (p.x - this.x) / (this.speed + this.speed * 0.1);
                    this.y += (p.y - this.y) / (this.speed + this.speed * 0.1);
					this.radius += ((p.radius * 0.3) - this.radius) / (this.speed + this.speed * 0.1);
                    this.target = p;
                }
            }
			
			if (this.target !== null && this.target !== undefined) {
				if (pointDistance(this.x, this.y, this.target.x, this.target.y) > this.snapRange) {
					this.target = null;	
				}
			}
            
			this.x = Math.min(WIDTH, Math.max(0, this.x));
			this.y = Math.min(HEIGHT, Math.max(0, this.y));
        }
    },
    render: function() {
        if (findingTarget) {
            c.save();
            c.beginPath();
            c.globalAlpha = 1;
			c.fillStyle = "white";
            c.arc(this.x, this.y, this.radius, 0, 2 * PI, false);
			c.arc(this.origin.x, this.origin.y, this.origin.radius / 3, 0, 2 * PI, false);
            c.fill();
			c.closePath();
			c.beginPath();
			c.arc(this.x, this.y, 5, 0, 2 * PI, false);
            c.stroke();
            c.closePath();
            c.restore(); 
            
            for (var i = 0; i < planets.planetsList.length; i++) {
                if (planets.planetsList[i] !== this.origin) {
                    var p = planets.planetsList[i];
                } else continue;
				var dis = pointDistance(p.x, p.y, this.x, this.y);
                if (dis <= p.radius + 40) {
                    p.highlight();
                }
            }
        }
    }
};

zoom = {
    x: 0,
    y: 0,
    update: function() {
        if (findingTarget) scaleFactor += ((minScaleFactor + 0.2) - scaleFactor) / 5;
        else if (menus.active()) scaleFactor += ((maxScaleFactor * 0.3) - scaleFactor) / 6;
        else {
            if (key[up]) scaleFactor += 0.15;
            if (key[down]) scaleFactor -= 0.15;      
        }
        var target = findingTarget? cursor:planetControl.current;
        this.x += (target.x - this.x) / 16;
        this.y += (target.y - this.y) / 16;
        scaleFactor = Math.min(maxScaleFactor, Math.max(minScaleFactor, scaleFactor));
    },
    render: function() {
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.translate(this.x, this.y);
        c.scale(scaleFactor, scaleFactor);
        c.translate(-this.x, -this.y);    
        
        b.setTransform(1, 0, 0, 1, 0, 0);
        b.translate(this.x, this.y);
        b.scale(scaleFactor * 0.95, scaleFactor * 0.95);
        b.translate(-this.x, -this.y);    
    }
};

menus = {
    menuList: [],
    active: function() {
        for (var i = 0; i < this.menuList.length; i++) {
            if (this.menuList[i].activated) { 
                return true;
                break;
            }
        }    
        return false;
    },
    deactivateAll: function() {
        for (var i = 0; i < this.menuList.length; i++) {
            this.menuList[i].deactivate();
        }    
    },
    update: function() {for (var i = 0; i < this.menuList.length; i++) {this.menuList[i].update();}},
    render: function() {for (var i = 0; i < this.menuList.length; i++) {this.menuList[i].render();}}
};

menu = function(width, blockHeight, color) {
    menus.menuList.push(this);
    this.x = null;
    this.y = null;
    this.origin = null;
    this.options = [];
	this.heading = "Menu";
    this.width = width;
    this.blockHeight = blockHeight;
    this.activated = false;
    this.activate = function() {
        this.origin = planetControl.current;
        this.activated = true;
    };
    this.deactivate = function() {
        this.origin = null;
        menuControl.currentOption = 0;
        this.activated = false;
    };
    this.getState = function() {return this.activated;},
    this.addOption = function(optionName, actionFunction) {
        var opt = {};
        opt.name = optionName;
        opt.actionFunction = function() {actionFunction()};
        this.options.push(opt);
    };
    this.update = function() {
        if (this.activated) {
            this.x = this.origin.x - this.width - this.origin.radius * 2;
            this.y = this.origin.y;
        }
    };
    this.render = function() {
        if (this.activated) {
            c.save();
			c.fillStyle = "white";
			c.font = "6px Arial";
			c.textBaseline = "middle";
			//c.fillText(this.heading, this.x, this.y - this.blockHeight);
            for (var i = 0; i < this.options.length; i++) {
                c.globalAlpha = i === menuControl.currentOption? 0.78:0.45;
                c.fillStyle = color;
                c.lineWidth = 1 / scaleFactor;
                c.fillRect(this.x, this.y + (this.blockHeight * i), this.width, this.blockHeight); 
                c.strokeStyle = "white"; 
                c.strokeRect(this.x, this.y + (this.blockHeight * i), this.width, this.blockHeight);  
                c.fillStyle = "white";
                c.fillText(this.options[i].name, this.x + 5, this.y + (this.blockHeight * (i + 1)) - this.blockHeight / 2);
            }
            c.restore();
        }
    }
};

selectionController = function(arrayList, currentOption, nextKey, prevKey, actionFunction) {
    this.list = arrayList;
    this.currentOption = currentOption;
    this.current = this.list[this.currentOption];
    this.setArrayList = function(arrayList) {
        this.list = arrayList;
    };
    this.optionSelect = function(index) {
        this.currentOption = index;
    };
    this.optionScroll = function(key) {
        switch(key) {
            case nextKey:
                this.currentOption++;
                break;
            case prevKey:
                this.currentOption--;
                break;
            case enter:
                actionFunction();
                break;
            default: break; 
        }
        if (this.currentOption > this.list.length - 1) this.currentOption -= this.list.length;
        if (this.currentOption < 0) this.currentOption += this.list.length;
        for (var i = 1; i <= this.list.length; i++) {
            if (n[i][0] === key) {
                this.currentOption = n[i][1] - 1;   
                break;
            }
        }
    };
    this.update = function() {
        this.currentOption = Math.min(this.list.length - 1, Math.max(0, this.currentOption));
        this.current = this.list[this.currentOption];
    };
    this.render = function() {
        
    };
};

hud = {
    displayPopulation: function() {
        o.save();
        o.textAlign = "center";
        o.fillStyle = "white";
        o.font = "10px Arial";
        o.fillText("T O T A L  P O P U L A T I O N", overlay.width / 2, overlay.height / 2 - 7);
        o.font = "24px Arial";
        o.fillText(population.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), overlay.width / 2, overlay.height - 10);
        o.fillText("", WIDTH / 2, HEIGHT - 5);
        o.restore();
    },
    displayYear: function() {
        o.save();
        o.textAlign = "right";
        o.fillStyle = "white";
        o.font = "21px Arial";
        o.fillText(year, overlay.width - 30, overlay.height * 0.6);
        o.restore();
    },
    displayPlanetStats: function() {
        o2.save();
        o2.font = "30px Arial";
        var current = !findingTarget? planetControl.current:cursor.target;
        var index = current !== null? current.index:0;
        var spacing = 23;
        if (current !== null) {
            var attributes = {
                "PLANET FROM SUN": index + (index === 1? "ST": index === 2? "ND": index === 3? "RD":"TH"),
                POPULATION: current.population,
                RESOURCES: 0,
                UNITS: 0
            };

            o2.fillStyle = current.color;
            o2.fillText(current.name, 30, 100);
            o2.globalAlpha = 0.45;
            o2.fillStyle = "white";
            o2.font = "15px Arial";

            var i = 1;
            for (var key in attributes) {
                var value = typeof attributes[key] === "number"? attributes[key].toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):attributes[key];
                o2.fillText(key + ": " + value, 30, 110 + (i * spacing));
                i++;
            }
        } else {
            o2.fillStyle = "grey";
            o2.fillText("DEEP SPACE", 30, 100);    
        }
        o2.restore();
    },
    render: function() {
        o.fillStyle = "rgba(0, 0, 0, 0.4)"
        o.fillRect(0, 0, overlay.width, overlay.height);
        
        this.displayPopulation();  
        this.displayYear();
        this.displayPlanetStats();
        planets.renderUI();
    }
};

chooseNumber = function() {
    
};

units = {
    satellites: [], transports: [], stations: [], fighters: [], miners: [],
    update: function() {
        for (var i = 0; i < this.satellites.length; i++) {this.satellites[i].update(i);}
        for (var i = 0; i < this.transports.length; i++) {this.transports[i].update(i);}
		for (var i = 0; i < this.stations.length; i++) {this.stations[i].update(i);}
        for (var i = 0; i < this.fighters.length; i++) {this.fighters[i].update();}
        for (var i = 0; i < this.miners.length; i++) {this.miners[i].update();}
    },
    render: function() {
        for (var i = 0; i < this.satellites.length; i++) {this.satellites[i].render();}
        for (var i = 0; i < this.transports.length; i++) {this.transports[i].render();}
		for (var i = 0; i < this.stations.length; i++) {this.stations[i].update(i);}
        for (var i = 0; i < this.fighters.length; i++) {this.fighters[i].render();}
        for (var i = 0; i < this.miners.length; i++) {this.miners[i].render();}
    }
};

satellite = function(origin, target) {
    units.satellites.push(this);
    this.disFromSun = origin.disFromSun;
    this.target = target;
    this.orbitDis = this.target.radius + 11;
    this.inOrbitOfTarget = false;
    this.rot = origin.rot;
    this.radius = 0.7;
    this.highlightRot = 1;
    this.opacity = 0;
    this.x = sun.x + this.disFromSun * Math.cos(this.rot);
    this.y = sun.y + this.disFromSun * Math.sin(this.rot);
    this.update = function(i) {   
        this.highlightRot += 0.05;
        var dis = pointDistance(this.x, this.y, this.target.x, target.y);
        if (Math.round(dis) > 30) {
            this.opacity += 0.1 * time;
        } else {
            this.opacity -= 0.1;
            
            if (!this.inOrbitOfTarget) {
                this.inOrbitOfTarget = true;
            }
        }
        if (!this.inOrbitOfTarget) {
            this.disFromSun += ((this.target.disFromSun + this.orbitDis) - this.disFromSun) / dis * time;
            this.rot += angleDifference(this.rot, this.target.rot) / dis * time;
            
            this.x = sun.x + this.disFromSun * Math.cos(this.rot);
            this.y = sun.y + this.disFromSun * Math.sin(this.rot);
        } else {
            if (!this.inOrbitOfTarget) {
                var x = this.target.x - this.x;
                var y = this.target.y - this.y;
                console.log(this.rot);
                this.rot = Math.atan2(-y, x);
                this.inOrbitOfTarget = true;
            }
            this.rot -= 0.01;
            this.opacity -= 0.1;
            this.x += ((this.target.x + this.orbitDis * Math.cos(this.rot)) - this.x) / 10;
            this.y += ((this.target.y + this.orbitDis * Math.sin(this.rot)) - this.y) / 10;
        }
        this.opacity = Math.min(1, Math.max(this.opacity, 0));
        if (this.rot >= (2 * PI)) this.rot -= (2 * PI);
    };
    this.render = function() {
        c.save();
        c.fillStyle = "white";
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * PI, false);
        c.closePath();
        c.fill();
        
        /*c.beginPath();
        c.strokeStyle = "rgba(255, 255, 255, 0.1)";
        c.lineWidth = 0.1;
        c.moveTo(this.x, this.y);
        c.lineTo(origin.x, origin.y);
        c.stroke();
        c.closePath();*/
        c.restore();
        
        drawRings(this.x, this.y, c, this.radius, this.highlightRot, 2, "white", this.opacity);
		drawName(this.x, this.y, c, this.radius, target.name, 0, "SATELLITE TO ", this.opacity);
    };
};

transport = function(origin, target, population) {
    units.transports.push(this);
    this.disFromSun = origin.disFromSun;
	this.target = target;
    this.rot = origin.rot;
    this.radius = 0.3;
    this.population = population > 100? 100:population;
    this.highlightRot = 0;
    this.opacity = 0;
    this.x = sun.x + this.disFromSun * Math.cos(this.rot);
    this.y = sun.y + this.disFromSun * Math.sin(this.rot);
    origin.population -= this.population;
    this.update = function(i) {   
		var dis = pointDistance(this.x, this.y, this.target.x, target.y);
        this.disFromSun += (this.target.disFromSun - this.disFromSun) / dis * time;
        this.rot += angleDifference(this.rot, this.target.rot) / dis * time;
        this.highlightRot += 0.05;
        if (this.rot >= (2 * PI)) {
            this.rot = this.rot % (2 * PI);
        }
        
        this.x = sun.x + this.disFromSun * Math.cos(this.rot);
        this.y = sun.y + this.disFromSun * Math.sin(this.rot);
        
        if (pointDistance(this.x, this.y, this.target.x, this.target.y) < this.target.radius) {
            this.opacity -= 0.1 * time;
            if (this.opacity <= 0) {
                this.target.population += this.population;
                units.transports.splice(i, 1); 
            }
        } else this.opacity += 0.1 * time;
        this.opacity = Math.min(1, Math.max(this.opacity, 0));
    };
    this.render = function() {
        c.save();
        c.fillStyle = "red";
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * PI, false);
        c.closePath();
        c.fill();
        c.restore();
        
        drawRings(this.x, this.y, c, this.radius, this.highlightRot, 2, "white", this.opacity);
		drawName(this.x, this.y, c, this.radius, target.name, this.population, "TRANSPORT TO ", this.opacity);
    };
};

fleet = function(origin, target, population) {
    units.transports.push(this);
    this.disFromSun = origin.disFromSun;
	this.target = target;
    this.rot = origin.rot;
    this.radius = 0.3;
    this.population = population > 10000? 10000:population;
    this.highlightRot = 0;
    this.opacity = 0;
    this.x = sun.x + this.disFromSun * Math.cos(this.rot);
    this.y = sun.y + this.disFromSun * Math.sin(this.rot);
    origin.population -= this.population;
    this.update = function(i) {   
		var dis = pointDistance(this.x, this.y, this.target.x, target.y);
        this.disFromSun += (this.target.disFromSun - this.disFromSun) / dis * time;
        this.rot += angleDifference(this.rot, this.target.rot) / dis * time;
        this.highlightRot += 0.05;
        if (this.rot >= (2 * PI)) {
            this.rot = this.rot % (2 * PI);
        }
        
        this.x = sun.x + this.disFromSun * Math.cos(this.rot);
        this.y = sun.y + this.disFromSun * Math.sin(this.rot);
        
        if (pointDistance(this.x, this.y, this.target.x, this.target.y) < this.target.radius) {
            this.opacity -= 0.1 * time;
            if (this.opacity <= 0) {
                this.target.population += this.population;
                units.transports.splice(i, 1); 
            }
        } else this.opacity += 0.1 * time;
        this.opacity = Math.min(1, Math.max(this.opacity, 0));
    };
    this.render = function() {
        c.save();
        c.fillStyle = "red";
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * PI, false);
        c.closePath();
        c.fill();
        c.restore();
        
        drawRings(this.x, this.y, c, this.radius, this.highlightRot, 2, "white", this.opacity);
		drawName(this.x, this.y, c, this.radius, target.name, this.population, "TRANSPORT TO ", this.opacity);
    };
};

station = function() {
	units.stations.push(this);
};

stars = {
    starsList: [],
    create: function(minRadius, maxRadius, number) {
        var posX, posY, radius;
        for (var i = 0; i < number; i++) {
            posX = Math.random() * WIDTH;
            posY = Math.random() * HEIGHT;
            radius = minRadius + (Math.random() * (maxRadius - minRadius));
            this.starsList.push(new star(posX, posY, radius)); 
        }
    },
    render: function() {
        for (var i = 0; i < this.starsList.length; i++) {
            this.starsList[i].render();
        }
    }
};

star = function(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.alpha = Math.random() * 0.85;
    this.render = function() {
        b.globalAlpha = this.alpha;
        b.fillStyle = "white";
        b.beginPath();
        b.arc(this.x, this.y, this.radius / scaleFactor, 0, 2 * PI, false);
        b.closePath();
        b.fill();
        b.globalAlpha = 1;
    }
};

sun = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    glowRadius: 640,
    radius: 50,
	drawGoldiZone: true,
	goldiPos: 170,
	goldiWidth: 45,
    render: function() {
        var g = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.glowRadius);
		g.addColorStop(0, "rgba(255, 215, 75, 1)");
        g.addColorStop(0, "rgba(255, 179, 39, 1)");
        g.addColorStop(0.1, "rgba(255, 175, 35, 0.72)");
        g.addColorStop(0.35, "rgba(255, 135, 115, 0.23)");
        g.addColorStop(0.6, "rgba(42, 20, 96, 0.12)");
        g.addColorStop(0.73, "rgba(32, 20, 96, 0.07)");
        g.addColorStop(1, "transparent");
        
        c.fillStyle = g;
        c.beginPath();
        c.arc(this.x, this.y, this.glowRadius, 0, 2 * PI, false);
		c.fill();
        c.closePath();
		
		drawLineGlow(this.x, this.y, c, this.radius, 5, "yellow", 0.5);
        
        c.fillStyle = "rgba(255, 215, 75, 1)";
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * PI, false);
        c.closePath();
        c.fill();
		
		if (this.drawGoldiZone) {
			c.globalAlpha = 0.075;
			c.strokeStyle = "white";
			c.lineWidth = this.goldiWidth;
			c.beginPath();
			c.arc(this.x, this.y, this.goldiPos, 0, 2 * PI, false);
			c.closePath();
			c.stroke();
			c.lineWidth = 1;
			c.textAlign = "center";
			c.fillStyle = "white";
			c.textAlign = "left";
			c.globalAlpha = 1;
		}
    }  
};

planets = {
    planetsList: [],
    add: function(disFromSun, radius, name, speed, color, population) {
        this.planetsList.push(new planet(disFromSun, radius, name, speed, color, population));
    },
	remove: function(num) { 
        this.planetsList.splice(num, 1);
	},
    update: function() {
        for (var i = 0; i < this.planetsList.length; i++) {
            this.planetsList[i].update();
        }
    },
    render: function() {
        for (var i = 0; i < this.planetsList.length; i++) {this.planetsList[i].render();}
    },
    renderUI: function() {
        for (var i = 0; i < this.planetsList.length; i++) {
            var p = this.planetsList[i];
            var radius;
            if (p === planetControl.current) {
                radius = p.radius * 2;
                o.lineWidth = 2;
                o.strokeStyle = "rgba(255, 255, 255, 0.175)";
                o.beginPath();
                o.arc(40 + (i * 50), overlay.height / 2, radius / 2 + 6, 0, 2 * PI, false);
                o.stroke();
                o.closePath();
            } else radius = p.radius;
            
            o.fillStyle = p.color;
            o.beginPath();
            o.arc(40 + (i * 50), overlay.height / 2, radius / 2, 0, 2 * PI, false);
            o.fill();
            o.closePath();
        }
    }
};

planet = function(disFromSun, radius, name, speed, color, population) {
	this.index = planets.planetsList.length + 1;
    this.disFromSun = disFromSun;
    this.radius = radius;
    this.name = name;
    this.speed = speed;
    this.color = color;
    this.population = population;
    this.rot = Math.random() * (2 * PI);
	
    this.x = sun.x + this.disFromSun * Math.cos(this.rot);
    this.y = sun.y + this.disFromSun * Math.sin(this.rot);
	
	this.hoverOffset = 15;
    
    this.send = function(unit, target) {
        
        var left = 2;
        if (Math.round(this.population) > left) {
            if (unit === "transport") {
                var passengerAmount = parseInt(prompt("NUMBER OF PASSENGERS:", ""));
                if (!isNaN(passengerAmount) && passengerAmount > 0) {
                    passengerAmount = Math.min(this.population - left, Math.max(passengerAmount, 1));
                    new transport(this, target, passengerAmount);
                }
            }
            else if (unit === "satellite") {
                new satellite(this, target);
            }
        }
    };
    
	this.highlightRot = 0;
    this.opacity = 0;
	this.highlight = function(cause) {
        this.opacity += 0.075;
        this.highlightRot += 0.05;
        drawRings(this.x, this.y, c, this.radius, this.highlightRot, 4, "white", this.opacity);
        drawName(this.x, this.y, c, this.radius, this.name, this.population, "", this.opacity);
        if (findingTarget && this === planetControl.current) {
            drawLine(this.x, this.y, cursor.x, cursor.y, c);
        }
	}
    this.trailLength = 8;
	this.trailGap = 23;
	this.trailCounter = 0;
	this.trailArray = [];
	this.trail = function(x, y, color) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.counter = 1;
		this.update = function() {
			this.counter -= 0.002 * Math.abs(time);
			this.counter = Math.max(this.counter, 0);
		};
		this.render = function() {
			c.save();
			c.globalAlpha = this.counter;
			c.fillStyle = this.color;
			c.fillRect(this.x - 1 / scaleFactor, this.y - 1 / scaleFactor, 2 / scaleFactor, 2 / scaleFactor);
			c.globalAlpha = 1;
			c.restore();
		};
	}
    this.moons = [];
    this.addMoon = function(disFromPlanet, radius, type, speed, color, pop) {
        this.moons.push(new moon(this, disFromPlanet, radius, type, speed, color, pop));
    };
	this.clearTrails = function() {
		for (var i = 0; i < this.trailArray.length; i++) {
			if (this.trailArray[i].counter <= 0) {
				this.trailArray.splice(i, 1);
			}
		}
	}
    this.update = function() {   
        this.opacity -= 0.01 * time;
        this.opacity = Math.min(1, Math.max(this.opacity, 0));
        
        this.rot -= 0.01 * speed * time;
        this.x = sun.x + this.disFromSun * Math.cos(this.rot);
        this.y = sun.y + this.disFromSun * Math.sin(this.rot);
        
        if (this.rot <= 0) {
            this.rot += (2 * PI);
            if (this.name === "EARTH") {
                year++;    
            }
        }
		this.clearTrails();
		
        for (var i = 0; i < this.moons.length; i++) {
            this.moons[i].update();    
        }
		for (var i = 0; i < this.trailArray.length; i++) {
			this.trailArray[i].update();	
		}
        
        if (this.population >= 2) {
            this.population += (this.population * 0.0001) * time;   
        }
		
		this.population = Math.max(0, this.population);
        
		this.trailCounter += 1 * Math.abs(time);
		if (this.trailCounter >= this.trailGap) {
        	this.trailArray.push(new this.trail(this.x, this.y, this.color));
			this.trailCounter = 0;
		}
    };
    this.render = function() {
		for (var i = 0; i < this.trailArray.length; i++) {
			this.trailArray[i].render();	
		}
		
        c.save();
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * PI, false);
        c.closePath();
        c.fill();
        c.restore();

        for (var i = 0; i < this.moons.length; i++) {
            this.moons[i].render();    
        }
        
        if (this === planetControl.current) this.highlight();
    };
};

moon = function(host, disFromPlanet, radius, name, speed, color, population) {
    this.host = host;
    this.disFromPlanet = disFromPlanet;
    this.radius = radius;
    this.name = name;
    this.speed = speed;
    this.color = color;
    this.population = population;
    this.x = sun.x - this.disFromSun;
    this.y = sun.y;
    this.rot = 0;
    this.trailLength = 8;
    this.alpha = 0;
    this.bounds = 1;
    this.update = function() {
        this.rot -= 0.01 * speed * time;
        this.x = this.host.x + this.disFromPlanet * Math.cos(this.rot);
        this.y = this.host.y + this.disFromPlanet * Math.sin(this.rot);
    };
    this.render = function() {
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * PI, false);
        c.closePath();
        c.fill();
        
        if (scaleFactor === maxScaleFactor && planetControl.current === this.host) {
            this.alpha += 0.1;
        } else this.alpha -= 0.1;
        
        this.alpha = Math.min(1, Math.max(0, this.alpha));
        
        c.save();
        c.globalAlpha = this.alpha;
        c.font = "2.8px Arial";
        c.textBaseline = "top";
        c.textAlign = "center";
        c.fillStyle = "rgba(255, 255, 255, 0.45)";
        c.fillText(this.name, this.x, this.y + 1);
        c.globalAlpha = 1;
        c.restore();
    };
};

asteroidBelt = function(disFromSun, maxSize, minSize, beltWidth) {
	this.asteroids = [];
	this.disFromSun = disFromSun;
	this.maxSize = maxSize;
	this.minSize = minSize;
    this.create = function(num) {
        for (var i = 0; i < num; i++) {
            this.asteroids.push(new this.asteroid(this.disFromSun, this.maxSize, this.minSize));	
        }
	};
	this.asteroid = function(disFromSun, maxSize, minSize) {
        this.x = null;
        this.y = null;
        this.offset = (Math.random() - Math.random()) * beltWidth;
		this.disFromSun = disFromSun + this.offset;
        this.angle = ((2 * PI)) * Math.random();
		this.size = minSize + (Math.random() * (maxSize - minSize));
		this.update = function() {
			this.angle -= Math.abs(0.0005 * this.size) * time;
            this.x = sun.x + this.disFromSun * Math.cos(this.angle);
            this.y = sun.y + this.disFromSun * Math.sin(this.angle);
		};
		this.render = function() {
            c.save();
			c.beginPath();
            c.fillStyle = "dimgrey";
            c.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
            c.closePath();
            c.restore();
		};
	};
    this.update = function() {
        for (var i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].update();   
        }
    };
    this.render = function() {
        for (var i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].render();   
        }
    };
};

rogueAsteroids = function() {
    this.asteroidList = [];
    this.rogueAsteroid = function(x, y, target) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.radius = Math.abs(Math.random * 2);
    }
};