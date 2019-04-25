var canvas;
var canvasContainer;

var outOfCanvas;
var onInterface;
var gameState;

var FPS = 30;
var frames = 0;

var TILE = 64;
var TILE_W = 60;
var TILE_H = 30;

var ROWS = 30;
var COLS = 30;
var TURN = 0.1;
var PIXEL_DENSITY;

var mousePosition;
var turnCounter;
var turns;
var time;
var deltaTime;
var lastMillis;
var pMouseIsPressed;
var interpolator;
var counter;
var restartDialog;

var PRE_TURNS = 10; //let the sim run x times before it gets visualized

//Ecology variables

//the file
var ECOLOGY_FILE = "ecology.csv";
//the table
var ecology;

var CITY_RESILIENCE = 15; //x turns before it turns into ruin
var DESERTIFICATION_LEVELS = 0;
var OASIFY_LEVELS = 3;
var FOREST_LEVELS = 6;
var DEFOREST_LEVELS = 8;
var REGROWTH_TIME = 50;
var WEED_POWER = 10;
var WETLAND_STRENGTH = 6;
var ANNIHILATION = 1; //
var ANNIHILATION_SIZE = ANNIHILATION * 6; //
var GLITCH_DURATION = 60;
var TRANSFORM_DURATION = 10;
var PLASTIC_FREQUENCY = 14; //every % ruins/concrete converted up to 16
var LOW_TRASH = 20; //to count for clean

//Disasters
var HEAT_WAVE_DURATION = 30; //in turns
var HEAT_WAVE_SEVERITY = 0.1; //chances of desertification over a dice roll of HEAT_WAVE_DURATION
var WILDFIRE_DURATION = 32;
var FLOOD_DURATION = 50;
var FLOOD_VIZ = 60;
var FLOOD_SEVERITY = 5; //chances of flooding on a dice roll of HEAT_WAVE_DURATION
var OIL_BREAKDOWN = 0.01;
var disasterCounter = 0;
var lastDisaster = 0;
var DISASTER_FREQUENCY_MIN = 500;
var DISASTER_FREQUENCY_MAX = 1000;
var seaLevelRise = 0;
var SEA_RISE = 2; //after how many floods

//corresponding to row in the table
var GRASS = 0;
var WATER = 1;
var CONCRETE = 2;
var WASTELAND = 3;
var FIRE = 4;
var GREEN_CUBE = 5;
var BURNED = 6;
var BURNED_FOREST = 7;
var RUIN = 8;
var BLACK_BURN = 9;
var CITY = 10;
var FOREST = 11;
var PLASTIC = 12;
var WEED = 13;
var BLACK_CUBE = 14;
var GLITCH_CITY = 15;
var GLITCH_CUBE = 16;
var STONE_CUBE = 17;
var BLUE_CUBE = 18;
var FLOOD = 19;
var WHITE_CUBE = 20;
var OIL = 21;
var WETLAND = 22;
var ROAD = 23;
var ROAD_CUBE = 24;

var id = [];

//as they appear in menu and right click sequence - the properties of the obj below
var cubeLabels = ["green", "blue", "stone", "white", "road", "glitch", "black"];
var cubeIndex = 0;
var currentCube = null; //reference to an object

var cubes = {
  fire: {
    id: FIRE,
    tile: null,
    sprite: "blocks_25", //the sprite
    buttonSprite: "fireButton"

  },

  green: {
    id: GREEN_CUBE,
    tile: null,
    sprite: "blocks_11",
    buttonSprite: "greenButton"
  },

  blue: {
    id: BLUE_CUBE,
    tile: null,
    sprite: "blocks_23",
    buttonSprite: "blueButton"
  },

  stone: {
    id: STONE_CUBE,
    tile: null,
    sprite: "blocks_33",
    buttonSprite: "stoneButton"
  },

  glitch: {
    id: GLITCH_CUBE,
    tile: null,
    sprite: "blocks_05",
    buttonSprite: "glitchButton"
  },

  black: {
    id: BLACK_CUBE,
    tile: null,
    sprite: "blocks_41",
    buttonSprite: "blackButton"
  },

  white: {
    id: WHITE_CUBE,
    tile: null,
    sprite: "blocks_56",
    buttonSprite: "whiteButton"
  },

  road: {
    id: ROAD_CUBE,
    tile: null,
    sprite: "roadCube",
    buttonSprite: "roadButton"
  }
};

//Terrain generation
var TERRAIN_NOISE_DETAIL = 0.2;
var CIVILIZATION_NOISE_DETAIL = 0.2;
var CIVILIZATION_OFFSET = 1000; //noise offset

var terrain;

//0-1 scale terrain gen
var terrainScale = [WATER, GRASS, GRASS];
var civilizationScale = [null, null, WASTELAND, CONCRETE, CONCRETE];

/////////GUI variables

var TITLE_W = 600;
var TITLE_H = 145;

var MARGIN = 20;
var MENU_Y = ROWS * TILE + MARGIN;

var zoomCounter = 0;
var scrollCounter;
var SCROLL_MARGIN = 8;
var SCROLL_SPEED = 1;

var MIN_ZOOM = 0.5;
var MAX_ZOOM = 2;
var ZOOM_DRAG = 40; //sensitivity

//where it starts the drag
var dragZoomPoint;
var viewZoom;
var previousZoom;

var buttons = [];
var buttonGroup;
var heatGroup;
var markerGroup;
var okButton;
var cancelButton;
//confirm dialog
var BOX_W = 300;
var BOX_H = 90;

var dragTile;
var dragPoint; //further correction to avoid false dnd on cube extended hit area
var scrollPoint;

//menu
var MENU_W = 100;
var BTN = 68; //tile as seen in GUI
var ICON = 80;
var RESTART_BTN = 56;
var MARKER = 40;
var buttonNormal;
var buttonRoll;
var buttonSelected;
var glitchButton, blackButton;

//top bar
var BAR_W = 800;
var BAR_H = 4;
var BAR_Y = 14;
var barY = -10;
var targetBarY = -10;
var BAR_BORDER = 1.5;
var BAR_SCALE = 200;

var CITY_COLOR_1, CITY_COLOR_2, RUIN_COLOR_1, RUIN_COLOR_2;

//text messages lots of var to prevent lots of calculations
var messages; //the queue
var currentMessage; //the final string
var messageWidth; //the calculated lenght in px
var messageIndex; //the substring index
var messageCounter; //the time before it disappears
var POST_DELAY = 0.06; //msg.length multiplier time before disappearing
var POST_DELAY_FIXED = 1;
var subMessage; //the substring of the current message
var subWidth; //the width of the substring

var MSG_SIZE = 24; //font size
var MSG_H = MSG_SIZE / 2;
var MSG_PADDING = 14;
var MSG_Y_OFFSET = 4;
var MSG_MARGIN = 26; //from bottom


var cameraMoved = true;
var titleImage;
var titleMask;
var titleNoise;
var noiseCount;

////// vars across session
var firstPlay = true;
var glitchUnlocked = false;
var blackUnlocked = false;

//////global game vars

var natural = 0;
var artificial = 0;
var nW = 0;
var aW = 0;

//resources are necessary to sustain cities
var resources = 0;
var transition;
var transitions = {};
var TRANSITION_FRAMES = 8;
var plasticCounter = 0;
var plastiglomerates = 0;
var heatWaveCounter = 0;
var wildFireCounter = 0;
var floodCounter = 0;
var floodViz = 0;
var plasticSequence;
var dissolve; //animation

//refs to current cube tiles
var stoneCubeTile, greenCubeTile, blueCubeTile, glitchCubeTile, blackCubeTile;
//the one currently hovering
var currentTile;
//graphics objects
var bg; //background image
var bgDisaster;
var overlay;
var graphics; //graphics container
var bgX = 0;
var bgY = 0;
var bgNoise = 0;
var bgA = 0;
var fps = FPS; //viz framerate with easing 
var NOISE_SHAKE = 50;
var glitchPreview = false; //freeze glitches

var BG_FLOOD;
var BG_HEAT;
var BG_FIRE;

//randomizing array
var shuffle4 = [0, 1, 2, 3];
var shuffle8 = [0, 1, 2, 3, 4, 5, 6, 7];

///////Sound stuff
var VOLUME = 0.5; //master multiplier
var VOLUME_OFFSCREEN = 0.1; //reducer for offscreen sounds
var sounds = {};

var messageFont;
//debugging
var debugMillis = 0;

function preload() {

  messageFont = loadFont('fonts/Mecha.ttf');

  BG_FLOOD = color(56, 78, 120, 10);
  BG_HEAT = color("#f4e0b710");
  BG_FIRE = color("#f2a86c10");

  CITY_COLOR_1 = color("#f2ecd8");
  CITY_COLOR_2 = color("#dbccb4");
  RUIN_COLOR_1 = color("#696774");
  RUIN_COLOR_2 = color("#476265");

  ecology = loadTable(ECOLOGY_FILE, "csv", "header");

  graphics = {};
  tileGraphics = {};

  for (var i = 1; i <= 56; i++) {
    var n = nf(i, 2, 0);
    tileGraphics["blocks_" + n] = loadImage("images/blocks_" + n + ".png");
  }

  for (var i = 1; i <= 56; i++) {
    var n = nf(i, 2, 0);
    //print(n);
    tileGraphics["ground_" + n] = loadImage("images/ground_" + n + ".png");
  }

  for (var i = 1; i <= 56; i++) {
    var n = nf(i, 2, 0);
    //print(n);
    tileGraphics["water_" + n] = loadImage("images/water_" + n + ".png");
  }

  for (var i = 1; i <= 72; i++) {
    var n = nf(i, 2, 0);
    //print(n);
    tileGraphics["buildings_" + n] = loadImage("images/buildings_" + n + ".png");
  }

  for (var i = 1; i <= 24; i++) {
    var n = nf(i, 2, 0);
    //print(n);
    tileGraphics["flooring_" + n] = loadImage("images/flooring_" + n + ".png");
  }

  for (var i = 1; i <= 40; i++) {
    var n = nf(i, 2, 0);
    //print(n);
    tileGraphics["plants_" + n] = loadImage("images/plants_" + n + ".png");
  }

  //plastiglomerate
  for (var i = 1; i <= 16; i++) {
    var n = nf(i, 2, 0);
    //print(n);
    tileGraphics["plastic_" + n] = loadImage("images/plastic_" + n + ".png");
  }

  //marsh
  for (var i = 1; i <= 14; i++) {
    var n = nf(i, 2, 0);
    //print(n);
    tileGraphics["wetland_" + n] = loadImage("images/wetland_" + n + ".png");
  }

  tileGraphics["blackButton"] = loadImage("images/blackButton.png");
  tileGraphics["greenButton"] = loadImage("images/greenButton.png");
  tileGraphics["blueButton"] = loadImage("images/blueButton.png");
  tileGraphics["stoneButton"] = loadImage("images/stoneButton.png");
  tileGraphics["fireButton"] = loadImage("images/fireButton.png");
  tileGraphics["glitchButton"] = loadImage("images/glitchButton.png");
  tileGraphics["whiteButton"] = loadImage("images/whiteButton.png");
  tileGraphics["roadButton"] = loadImage("images/roadButton.png");
  tileGraphics["roadCube"] = loadImage("images/roadCube.png");

  buttonSprite = loadImage("images/buttonNormal.png");
  buttonRoll = loadImage("images/buttonRoll.png");
  buttonSelected = loadImage("images/buttonSelected.png");

  titleImage = loadImage("images/title.png");
  titleMask = loadImage("images/titleMask.png");
  titleNoise = loadImage("images/noise.png");

  graphics.drop = loadImage("images/drop.png");
  graphics.tutorial = loadImage("images/tutorial.png");
  graphics.credits = loadImage("images/credits.png");
  graphics.restart = loadImage("images/restartBtn.png");
  graphics.restartRoll = loadImage("images/restartBtnRoll.png");

  graphics.fireIcon = loadImage("images/fireIcon.png");
  graphics.floodIcon = loadImage("images/floodIcon.png");
  graphics.droughtIcon = loadImage("images/droughtIcon.png");
  graphics.marker = loadImage("images/marker.png");
  graphics.markerRoll = loadImage("images/markerRoll.png");

  graphics.okBtn = loadImage("images/okBtn.png");
  graphics.okBtnRoll = loadImage("images/okBtnRoll.png");
  graphics.cancelBtn = loadImage("images/cancelBtn.png");
  graphics.cancelBtnRoll = loadImage("images/cancelBtnRoll.png");

  transitions = {};
  transitions["grass"] = loadAnimation("images/transitions/grass0000.png", "images/transitions/grass0007.png");
  transitions["tree"] = loadAnimation("images/transitions/tree0000.png", "images/transitions/tree0007.png");
  transitions["water"] = loadAnimation("images/transitions/water0000.png", "images/transitions/water0007.png");
  transitions["building"] = loadAnimation("images/transitions/building0000.png", "images/transitions/building0007.png");

  dissolve = loadAnimation("images/dissolve_01.png", "images/dissolve_08.png");
  dissolve.frameDelay = 3;

  sounds = {};

  sounds.bricks = [];
  for (var i = 1; i <= 13; i++) {
    sounds.bricks.push(loadSound("sounds/city" + i + ".mp3"));
  }

  sounds.fire = [];
  for (var i = 1; i <= 6; i++) {
    sounds.fire.push(loadSound("sounds/fire" + i + ".mp3"));
  }

  sounds.foliage = [];
  for (var i = 1; i <= 8; i++) {
    sounds.foliage.push(loadSound("sounds/foliage" + i + ".mp3"));
  }

  sounds.grass = [];
  for (var i = 1; i <= 9; i++) {
    sounds.grass.push(loadSound("sounds/grass" + i + ".mp3"));
  }

  sounds.water = [];
  for (var i = 1; i <= 8; i++) {
    sounds.water.push(loadSound("sounds/water" + i + ".mp3"));
  }

  sounds.weed = [];
  for (var i = 1; i <= 5; i++) {
    sounds.weed.push(loadSound("sounds/weed" + i + ".mp3"));
  }

  sounds.ruins = [];
  for (var i = 1; i <= 9; i++) {
    sounds.ruins.push(loadSound("sounds/ruins" + i + ".mp3"));
  }

  sounds.glitch = [];
  for (var i = 1; i <= 10; i++) {
    sounds.glitch.push(loadSound("sounds/glitch" + i + ".mp3"));
  }

  sounds.tones = [];
  for (var i = 1; i <= 8; i++) {
    sounds.tones.push(loadSound("sounds/tone" + i + ".mp3"));

  }


  sounds.annihilation = loadSound("sounds/annihilate.mp3");
  sounds.flood = loadSound("sounds/flood.mp3");
  sounds.heatWave = loadSound("sounds/heatwave.mp3");
  sounds.fireWave = loadSound("sounds/fireSound.mp3");

  var is_safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  if (is_safari) {
    print("Safari detected: using aac files");
    sounds.forestLoop = loadSound("sounds/forestLoop.aac");
    sounds.desertLoop = loadSound("sounds/desertLoop.aac");
    sounds.cityLoop = loadSound("sounds/cityLoop.aac");
  } else {
    print("Not safari");
    sounds.forestLoop = loadSound("sounds/forestLoop.ogg");
    sounds.desertLoop = loadSound("sounds/desertLoop.ogg");
    sounds.cityLoop = loadSound("sounds/cityLoop.ogg");
  }

  sounds.glitchBuzz = loadSound("sounds/glitchBuzz.mp3");

  sounds.theme = loadSound("sounds/theme2.mp3");
  sounds.opening = loadSound("sounds/opening.mp3");
}


function setup() {

  frameRate(FPS);

  canvasContainer = document.getElementById('canvasContainer');

  if (canvasContainer != null) {
    canvas = createCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
    canvas.parent("canvasContainer");
  } else
    canvas = createCanvas(windowWidth, windowHeight);

  PIXEL_DENSITY = pixelDensity();

  noStroke();
  noSmooth();

  canvas.elt.addEventListener("mouseout", function() {
    outOfCanvas = true;
  }, false);
  canvas.elt.addEventListener("mouseover", function() {
    outOfCanvas = false;
  }, false);

  id = [];

  //check tile types and ids from table
  for (var i = 0; i < ecology.getRowCount(); i++) {
    var row = ecology.getRow(i);
    var nid = row.getString("id");
    id[i] = nid;
  }

  //narrative reset
  for (var p in story) {
    if (story.hasOwnProperty(p)) {
      // Do things here
      story[p].state = 0;
      story[p].counter = 0;
    }
  }

  lastMillis = 0;
  counter = 0;

  gameState = "credits";

  //testing
  //startGame();

} //end setup


//fullscreened or whatever (only minor thing, menu doesn't get rearranged)
function windowResized() {

  if (canvasContainer != null)
    resizeCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
  else
    resizeCanvas(windowWidth, windowHeight);

  buildMenu();
}

//canvas size dependent
function buildMenu() {

  if (buttonGroup != null)
    buttonGroup.removeSprites();

  if (heatGroup != null)
    heatGroup.removeSprites();

  if (markerGroup != null)
    markerGroup.removeSprites();

  buttons = [];
  buttonGroup = new Group();
  heatGroup = new Group();
  markerGroup = new Group();

  var dy = round(height / (cubeLabels.length + 1));
  var dx = round((MENU_W - BTN) / 2);

  for (var i = 0; i < cubeLabels.length; i++) {
    var l = cubeLabels[i];
    var b = createSprite(dx, BTN / 2 + dy * i);
    b.label = l;
    b.cube = cubes[l];
    b.setCollider('rectangle', BTN / 2, BTN / 2, BTN, BTN);
    //b.debug = true;
    //override function
    b.draw = function() {


      if (this.targetX != null) {
        var dx = this.targetX - this.position.x;
        if (dx < 1) {
          this.position.x = this.targetX;
        } else
          this.position.x += dx / 4;
      }

      imageMode(CORNER);

      if (this.cube == currentCube)
        image(buttonSelected, 0, 0, BTN, BTN);
      else if (this.mouseIsOver)
        image(buttonRoll, 0, 0, BTN, BTN);
      else
        image(buttonSprite, 0, 0, BTN, BTN);

      var s = tileGraphics[this.cube.buttonSprite];
      image(s, 0, 0, BTN, BTN);
    }

    //override events
    b.onMouseOver = function() {
      if (this.visible)
        onInterface = true;
    };

    b.onMouseOut = function() {
      if (this.visible)
        onInterface = false;
    };

    b.onMousePressed = function() {


      if (this.visible && mouseWentDown(LEFT)) {
        if (this.cube == currentCube)
          currentCube = null;
        else
          selectCube(this.cube);
      }
    };

    b.onMouseReleased = function() {};

    //glitch and black activate later
    if (l == "black") {
      b.visible = false;
      blackButton = b;
      b.position.x = -BTN;
    }


    if (l == "glitch") {
      b.visible = false;
      glitchButton = b;
      b.position.x = -BTN;
    }


    buttonGroup.add(b);
    buttons.push(b);
  } //buttons

  //rect(width/2, height/2, BOX_W, BOX_H);

  //ok button
  okButton = createSprite(width / 2 - graphics.okBtn.width / 2 - 20, height / 2 + BOX_H / 5);

  okButton.setCollider('rectangle', 0, 0, graphics.okBtn.width / 2, graphics.okBtn.height / 2);

  //override functions
  okButton.draw = function() {
    if (this.mouseIsOver)
      image(graphics.okBtn, 0, 0, graphics.okBtn.width / 2, graphics.okBtn.height / 2);
    else
      image(graphics.okBtnRoll, 0, 0, graphics.okBtn.width / 2, graphics.okBtn.height / 2);
  };

  okButton.onMouseReleased = function() {
    if (restartDialog)
      startGame();
  };


  //cancel button
  cancelButton = createSprite(width / 2 + graphics.okBtn.width / 2 + 20, height / 2 + BOX_H / 5);
  cancelButton.setCollider('rectangle', 0, 0, graphics.cancelBtn.width / 2, graphics.cancelBtn.height / 2);

  //override functions
  cancelButton.draw = function() {
    if (this.mouseIsOver)
      image(graphics.cancelBtn, 0, 0, graphics.cancelBtn.width / 2, graphics.cancelBtn.height / 2);
    else
      image(graphics.cancelBtnRoll, 0, 0, graphics.cancelBtnRoll.width / 2, graphics.cancelBtnRoll.height / 2);
  };

  cancelButton.onMouseReleased = function() {
    if (restartDialog) {
      restartDialog = false;
      cancelButton.visible = false;
      okButton.visible = false;
    }
  };



  //restart button
  var b = createSprite(width - MENU_W / 2 - RESTART_BTN / 2, 10);

  b.setCollider('rectangle', RESTART_BTN / 2, RESTART_BTN / 2, RESTART_BTN, RESTART_BTN);
  //b.debug = true;

  //override functions
  b.draw = function() {
    imageMode(CORNER);
    if (this.mouseIsOver)
      image(graphics.restartRoll, 0, 0, RESTART_BTN, RESTART_BTN);
    else
      image(graphics.restart, 0, 0, RESTART_BTN, RESTART_BTN);
  }

  //override events
  b.onMouseOver = function() {
    if (this.visible) onInterface = true;
  };

  b.onMouseOut = function() {
    if (this.visible) onInterface = false;
  };

  b.onMousePressed = function() {
    if (this.visible)
      restartDialog = true;
  };

  buttonGroup.add(b);

}

function restartGame() {

  setupTitle();
  sounds.forestLoop.setVolume(0);
  sounds.cityLoop.setVolume(0);
  sounds.desertLoop.setVolume(0);

}

function startGame() {
  frameRate(FPS);

  frames = 0;
  gameState = "game";
  restartDialog = false;

  previousZoom = viewZoom = 0.5;

  scrollCounter = createVector(0, 0);
  turnCounter = 0;
  lastMillis = 0;
  zoomCounter = 0;
  messages = [];
  plasticCounter = 0;
  plastiglomerates = 0;
  nW = 0;
  aW = 0;
  seaLevelRise = 0;
  //wait longer for first disaster
  disasterCounter = random(DISASTER_FREQUENCY_MAX, DISASTER_FREQUENCY_MAX * 2);
  //it will activate after certain events
  lastDisaster = -1;

  terrain = [];

  cubeIndex = 0;
  currentCube = null; //reference to an object
  zoomCounter = 0;
  resources = 0;
  heatWaveCounter = 0;
  wildFireCounter = 0;
  floodCounter = 0;
  floodViz = 0;
  currentTile = null;
  deltaTime = 0;

  camera.position.x = 0;
  camera.position.y = 0 + TILE_H * ((ROWS) / 2); //-sqrt(height);

  //lil glitch
  mouseWentDown(LEFT);
  mouseWentDown(LEFT);

  //shuffle plastigromerate so they don't follow the same sequence
  //except for the first, that's always the same

  var sprString = ecology.getRow(PLASTIC).getString("sprite");
  var spr = sprString.split(",");

  plasticSequence = [];
  for (var i = 0; i < spr.length - 1; i++) {
    plasticSequence[i] = i + 1;
  }

  shuffle(plasticSequence, true);
  plasticSequence.unshift(0);

  noiseSeed(random(0, 100));

  //generate terrain
  for (var r = 0; r < ROWS; r++) {
    var row = [];
    for (var c = 0; c < COLS; c++) {
      var tile = createTile(r, c);
      row.push(tile);
    }
    terrain.push(row);
  }


  //cross reference neighbors
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      var tile = terrain[r][c];
      tile.neighbors4 = [];
      tile.neighbors8 = [];
      var pR = (r > 0) ? r - 1 : null;
      var pC = (c > 0) ? c - 1 : null;
      var nR = (r < ROWS - 1) ? r + 1 : null;
      var nC = (c < COLS - 1) ? c + 1 : null;

      //North neighbor
      if (pR !== null) {
        tile.N = terrain[pR][c];
        tile.neighbors4.push(terrain[pR][c]);
        tile.neighbors8.push(terrain[pR][c]);
      }

      //NE neighbor
      if (pR !== null && nC !== null) {
        tile.NE = terrain[pR][nC];
        tile.neighbors8.push(terrain[pR][nC]);
      }

      //East neighbor
      if (nC !== null) {
        tile.E = terrain[r][nC];
        tile.neighbors4.push(terrain[r][nC]);
        tile.neighbors8.push(terrain[r][nC]);
      }

      //SE neighbor
      if (nR !== null && nC !== null) {
        tile.SE = terrain[nR][nC];
        tile.neighbors8.push(terrain[nR][nC]);
      }

      //South neighbor
      if (nR !== null) {
        tile.S = terrain[nR][c];
        tile.neighbors4.push(terrain[nR][c]);
        tile.neighbors8.push(terrain[nR][c])
      }

      //SW neighbor
      if (nR !== null && pC !== null) {
        tile.SW = terrain[nR][pC];
        tile.neighbors8.push(terrain[nR][pC]);
      }

      //West neighbor
      if (pC !== null) {
        tile.W = terrain[r][pC];
        tile.neighbors4.push(terrain[r][pC]);
        tile.neighbors8.push(terrain[r][pC])
      }

      //NW neighbor
      if (pR !== null && pC !== null) {
        tile.NW = terrain[pR][pC];
        tile.neighbors8.push(terrain[pR][pC]);
      }

    }
  }

  mousePosition = createVector(0, 0);
  currentCube = null;

  time = 0;
  turns = 0;
  interpolator = 0;

  ////////
  buildMenu();


  sounds.forestLoop.loop();
  sounds.cityLoop.loop();
  sounds.desertLoop.loop();


  sounds.forestLoop.setVolume(0);
  sounds.cityLoop.setVolume(0);
  sounds.desertLoop.setVolume(0);

  for (var i = 0; i < sounds.tones.length; i++) {
    sounds.tones[i].setVolume(0.1);
  }

  bg = createGraphics(width + NOISE_SHAKE * 2, height + NOISE_SHAKE * 2);
  bgDisaster = createGraphics(width, height);
  overlay = createGraphics(width, height);

  terrain[floor(ROWS / 2) - 1][floor(COLS / 2) - 1].visible = true;


  if (glitchUnlocked) {
    glitchButton.visible = true;
    glitchButton.position.x = round((MENU_W - BTN) / 2);
  }


  if (blackUnlocked) {
    blackButton.visible = true;
    blackButton.position.x = round((MENU_W - BTN) / 2);
  }

  firstPlay = false;


  camera.off();
  sounds.opening.play();
  background(240);
}


function setupTitle() {
  camera.position.x = width / 2;
  camera.position.y = height / 2;
  camera.zoom = 1;

  gameState = "title";
  noiseCount = 0;
  background(0);
  frameRate(60);
  sounds.theme.play();
}


//do it with a thresholded noise image and the negative mask
function drawTitle() {

  var TITLE = 1.5;
  var SPEED = 0.06;

  noiseCount += SPEED; //millis doesn't work well at the beginning i guess

  background(0);

  if (noiseCount < TITLE - SPEED) {

    var t = map(noiseCount, 0, TITLE, 1, 0);
    //t = sin(t * PI * 0.5);
    t = t * t * (3 - 2 * t);
    //t = 1 - cos(t * PI * 0.5)
    //t = t*t;

    image(titleNoise, width / 2 - TITLE_W / 2, height / 2 - TITLE_H / 2, TITLE_W, TITLE_H);
    filter(THRESHOLD, t);
    image(titleMask, width / 2 - TITLE_W / 2, height / 2 - TITLE_H / 2, TITLE_W, TITLE_H);

  } else {
    fill(255);
    rect(width / 2 - TITLE_W / 2 + 1, height / 2 - TITLE_H / 2 + 1, TITLE_W - 2, TITLE_H - 2);
    image(titleMask, width / 2 - TITLE_W / 2, height / 2 - TITLE_H / 2, TITLE_W, TITLE_H);

    if (noiseCount > sounds.theme.duration() + 1) {
      textSize(MSG_SIZE);
      textAlign(CENTER, BOTTOM);
      textFont(messageFont);
      fill(255);
      text("Click to Continue", width / 2, height - MSG_MARGIN);
    }

    if (mouseIsPressed) {
      counter = 0;
      gameState = "tutorial";
      //gameState = "game";
      //startGame();
    }
  }
}


function drawCredits() {
  background(0);
  var w = graphics.credits.width * 0.5;
  var h = graphics.credits.height * 0.5;

  image(graphics.credits, width / 2 - w / 2, height / 2 - h / 2, w, h);

  counter += deltaTime;

  var t = map(counter, 0, 2, 1, 0);
  t = constrain(t, 0, 1);
  //t = sin(t * PI * 0.5);
  t = t * t * (3 - 2 * t);
  //t = 1 - cos(t * PI * 0.5)
  //t = t*t;

  fill(0, 0, 0, map(t, 0, 1, 0, 255));
  rect(0, 0, width, height);

  if (counter > 4) {
    textSize(MSG_SIZE);
    textAlign(CENTER, BOTTOM);
    textFont(messageFont);
    fill(255);
    text("Click to Continue", width / 2, height - MSG_MARGIN);
  }

  if (mouseIsPressed && counter > 1) {
    setupTitle();
  }


}

//do it with a thresholded noise image and the negative mask
function drawTutorial() {
  background(0);
  var w = graphics.tutorial.width * 0.5;
  var h = graphics.tutorial.height * 0.5;

  image(graphics.tutorial, width / 2 - w / 2, height / 2 - h / 2, w, h);

  counter += deltaTime;

  var t = map(counter, 0, 2, 1, 0);
  t = constrain(t, 0, 1);
  //t = sin(t * PI * 0.5);
  t = t * t * (3 - 2 * t);
  //t = 1 - cos(t * PI * 0.5)
  //t = t*t;

  fill(0, 0, 0, map(t, 0, 1, 0, 255));
  rect(0, 0, width, height);

  if (counter > 4) {
    textSize(MSG_SIZE);
    textAlign(CENTER, BOTTOM);
    textFont(messageFont);
    fill(255);
    text("Click to Start", width / 2, height - MSG_MARGIN);
  }

  if (mouseIsPressed && counter > 1) {
    startGame();
  }

}


function draw() {
  //time
  deltaTime = (millis() - lastMillis) / 1000;
  lastMillis = millis();
  time += deltaTime;

  //look at this sad state management
  if (gameState == "credits") {
    drawCredits();
  } else if (gameState == "title") {
    drawTitle();
  } else if (gameState == "tutorial") {
    drawTutorial();
  } else if (gameState == "game") {

    turnCounter += deltaTime;

    interpolator = map(turnCounter, 0, TURN, 0, 1);

    currentTile = getTileAtPosition(mousePosition.x, mousePosition.y);

    if (onInterface)
      currentTile = null;

    //draw background
    camera.off();

    background("#e9e9e9");

    //noise bg
    for (var i = 0; i < 700; i++) {
      bg.stroke(random(220, 240));
      bg.point(random(-NOISE_SHAKE, bg.width + NOISE_SHAKE), random(-NOISE_SHAKE, bg.height + NOISE_SHAKE));
    }

    bg.imageMode(CORNER);
    var bgX = random(-NOISE_SHAKE * 2, 0);
    var bgY = random(-NOISE_SHAKE * 2, 0);
    image(bg, bgX, bgY, width + NOISE_SHAKE * 2, height + NOISE_SHAKE * 2);


    if (floodViz > 0) {
      bgDisaster.fill(BG_FLOOD);
      bgDisaster.noStroke();
      bgDisaster.rect(0, 0, width, height);
      image(bgDisaster, 0, 0, width, height);

    } else if (wildFireCounter > 0) {
      bgDisaster.fill(BG_FIRE);
      bgDisaster.noStroke();
      bgDisaster.rect(0, 0, width, height);
      image(bgDisaster, 0, 0, width, height);

    } else if (heatWaveCounter > 0) {
      bgDisaster.fill(BG_HEAT);
      bgDisaster.noStroke();
      bgDisaster.rect(0, 0, width, height);
      image(bgDisaster, 0, 0, width, height);

    }

    camera.on();

    //camera movement
    zoomCounter--;

    if (keyWentDown("Q")) {
      viewZoom *= 2;
    } else if (keyWentDown("E")) {
      viewZoom /= 2;
    }

    //zoom is scale multiplier
    viewZoom = constrain(viewZoom, MIN_ZOOM, MAX_ZOOM);
    camera.zoom = viewZoom;

    //scroll if not moving
    if (pmouseX - mouseX != 0 || pmouseY - mouseY != 0) {
      scrollCounter = createVector(0, 0);
    }


    if (outOfCanvas) {
      scrollCounter = createVector(0, 0);
    }

    var previousCameraPosition = createVector(camera.position.x, camera.position.y);

    //scroll by drag
    if (scrollPoint != null && currentCube == null) {

      var dx = scrollPoint.x - mousePosition.x;
      var dy = scrollPoint.y - mousePosition.y;

      camera.position.x += (dx - (dx % TILE_W));
      camera.position.y += (dy - (dy % TILE_H));
    }

    if (keyDown(LEFT_ARROW) || keyDown("a"))
      camera.position.x -= TILE_W;

    if (keyDown(RIGHT_ARROW) || keyDown("d"))
      camera.position.x += TILE_W;

    if (keyDown(UP_ARROW) || keyDown("w"))
      camera.position.y -= TILE_H;

    if (keyDown(DOWN_ARROW) || keyDown("s"))
      camera.position.y += TILE_H;

    var M = 8;
    var top = (0 + 0 - M * 2) * TILE_H / 2 + (height / 2) / viewZoom;
    var bottom = (COLS + ROWS + M * 2) * TILE_H / 2 - (height / 2 - TILE_H * viewZoom) / viewZoom;

    var left = (0 - ROWS - M) * TILE_W / 2 + (width / 2) / viewZoom;
    var right = (COLS - 0 + M) * TILE_W / 2 - (width / 2 - TILE_W * viewZoom) / viewZoom;

    camera.position.y = constrain(camera.position.y, top, bottom);
    camera.position.x = constrain(camera.position.x, left, right);

    cameraMoved = (turns < 4 || previousCameraPosition.x != camera.position.x || previousCameraPosition.y != camera.position.y || previousZoom != viewZoom) ? true : false;

    //refresh visible
    if (cameraMoved) {
      for (var r = 0; r < ROWS; r++)
        for (var c = 0; c < COLS; c++) {
          var tile = terrain[r][c];
          tile.offScreen = tile.isOffScreen();
        }
    }


    //cheat codes
    if (keyWentDown("i")) {
      wildFireCounter = WILDFIRE_DURATION;
      bgDisaster.clear();
      diegeticSound(sounds.fireWave, 2);
    }

    if (keyWentDown("o")) {
      heatWaveCounter = HEAT_WAVE_DURATION;
      bgDisaster.clear();
      diegeticSound(sounds.heatWave, 1);
    }

    if (keyWentDown("p")) {
      floodCounter = FLOOD_DURATION / 2; //div/mult is extension
      floodViz = FLOOD_VIZ;
      bgDisaster.clear();
      diegeticSound(sounds.flood, 1);
    }

    if (keyWentDown("u")) {
      glitchButton.visible = true;
      glitchButton.targetX = round((MENU_W - BTN) / 2);
      blackButton.visible = true;
      blackButton.targetX = round((MENU_W - BTN) / 2);
      glitchUnlocked = blackUnlocked = true;
      targetBarY = BAR_Y;
    }

    /////////////////
    ///beginning turn
    if (turnCounter >= TURN) {
      interpolator = 0;
      turns++;

      //intro text
      if (turns == 50) {
        storyMessage(story.intro);
        storyMessage(story.intro2);
      }


      //turn
      for (var r = 0; r < ROWS; r++)
        for (var c = 0; c < COLS; c++) {

          terrain[r][c].turn++;
          if (terrain[r][c].turn >= terrain[r][c].turns) {
            terrain[r][c].turn = 0;
            terrain[r][c].evolve();

          }
        }

      natural = 0;
      artificial = 0;

      //officially change state and poll resources
      for (var r = 0; r < ROWS; r++)
        for (var c = 0; c < COLS; c++) {
          terrain[r][c].stateChange();
          var tile = terrain[r][c];
          if (tile.type == GRASS)
            natural += 0.5;
          if (tile.type == WETLAND)
            natural += 0.5;
          if (tile.type == WEED)
            natural += 0.5;
          if (tile.type == RUIN)
            natural += 0.5;
          if (tile.type == FOREST)
            natural++;

          if (tile.type == CITY) {
            artificial++;
          }
        }

      //poll the concrete
      story.trashscapes.counter = 0;

      //if net balance is negative it's unsustainable
      resources = natural - artificial;

      //poll the visible tile types
      var forest = 0;
      var desert = 0;
      var urban = 0;
      var trash = 0;

      for (var r = 0; r < ROWS; r++)
        for (var c = 0; c < COLS; c++) {
          var tile = terrain[r][c];
          if (!tile.offScreen) {
            if (tile.type == FOREST) //|| tile.type == GRASS || tile.type == WEED)
              forest++;
            else if (tile.type == WASTELAND || tile.type == CONCRETE)
              desert++;
            else if (tile.type == CITY)
              urban++;

            if (tile.type == CONCRETE) {
              story.trashscapes.counter++;
              trash++;
            }

            if (tile.type == OIL) {
              trash++;
            }
          }
        }


      //bad feedback needs to happen when city turns into crap
      if (messages.length == 0 && story.intro.state != 0) {
        if (story.badGrowth.counter > 60) {
          storyMessage(story.badGrowth3);
        } else if (story.badGrowth.counter > 40) {
          storyMessage(story.badGrowth2);
        } else if (story.badGrowth.counter > 10) {
          targetBarY = BAR_Y;
          storyMessage(story.badGrowth);
        }
      }

      //this feedback needs to happen after intro and not cued
      if (messages.length == 0 && story.intro.state != 0) {

        //good job
        if (artificial > 90) {
          glitchButton.visible = true;
          glitchButton.targetX = round((MENU_W - BTN) / 2);
          glitchUnlocked = true;

        } else if (artificial > 50 && story.stoneCube.state != 0) {
          storyMessage(story.cityGrowth);
          storyMessage(story.cityGrowth2);
          targetBarY = BAR_Y;
        } else if (artificial > 10) {
          storyMessage(story.stoneCube);
          storyMessage(story.stoneCube2);
        }
      }

      if (story.trashscapes.counter > 200 && turns > 1000) {
        storyMessage(story.trashscapes);
        targetBarY = BAR_Y;
      }

      if (urban == 0 && turns > 2000) {
        storyMessage(story.extinction);
      }

      if (trash < LOW_TRASH && forest > 150 && turns > 1500) {
        storyMessage(story.terraforming);
      }

      if (urban > 200 && turns > 1600) {
        storyMessage(story.end);
        storyMessage(story.end2);
        storyMessage(story.end3);
        storyMessage(story.end4);

        blackButton.visible = true;
        blackButton.targetX = round((MENU_W - BTN) / 2);
        blackUnlocked = true;
      }

      if (cameraMoved) {
        var fadeIn = mapLimit(turns, 0, PRE_TURNS, 0, 1);

        var v = mapLimit(urban, 0, 100, 0, VOLUME * viewZoom / 4) * fadeIn;
        sounds.cityLoop.setVolume(v);

        v = mapLimit(forest, 0, 100, 0, VOLUME * viewZoom / 2) * fadeIn;
        sounds.forestLoop.setVolume(v);

        v = mapLimit(desert, 0, 100, 0, VOLUME * viewZoom / 2) * fadeIn;
        sounds.desertLoop.setVolume(v);
      }

      //calculate the composition
      //print("Forest " + forest + " desert " + desert + " urban " + urban);

      //find the cubes and put them in temp vars
      cubes.stone.tile = null;
      cubes.green.tile = null;
      cubes.blue.tile = null;
      cubes.glitch.tile = null;
      cubes.black.tile = null;
      cubes.white.tile = null;

      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var tile = terrain[r][c];
          if (tile.type == STONE_CUBE)
            cubes.stone.tile = tile;
          if (tile.type == GREEN_CUBE)
            cubes.green.tile = tile;
          if (tile.type == BLUE_CUBE)
            cubes.blue.tile = tile;
          if (tile.type == GLITCH_CUBE)
            cubes.glitch.tile = tile;
          if (tile.type == BLACK_CUBE)
            cubes.black.tile = tile;
          if (tile.type == WHITE_CUBE)
            cubes.white.tile = tile;
        }
      }

      //resolved in the water and grass tile
      if (heatWaveCounter > 0) {
        heatWaveCounter--;
      }

      //disasters in progress
      if (wildFireCounter > 0) {
        wildFireCounter--;

        if (wildFireCounter == 0) {
          var endangered = [];
          for (var r = 0; r < ROWS; r++)
            for (var c = 0; c < COLS; c++) {
              if (terrain[r][c].type == FOREST || terrain[r][c].type == GRASS || terrain[r][c].type == WEED) {
                if (terrain[r][c].getNeighbors4(GRASS, FOREST).length > 0)
                  endangered.push(terrain[r][c]);
              }
            }

          if (endangered.length > 0)
            endangered[floor(random(0, endangered.length))].nextType = FIRE;
        }
      }

      if (floodCounter > 0) {
        floodCounter--;
      }

      if (floodViz > 0) {
        floodViz--;
      }

      glitchPreview = false;
      if (currentCube != null && currentTile != null) {
        if (currentTile.type == GLITCH_CITY) {
          if (currentCube.id == GREEN_CUBE || currentCube.id == BLUE_CUBE || currentCube.id == STONE_CUBE || currentCube.id == BLACK_CUBE) {
            diegeticSound(sounds.glitchBuzz, 0.3);
            glitchPreview = true;
          }
        }
      }

      //disaster trigger
      disasterCounter--;

      //I want the first disaster to be described
      if (disasterCounter < 0 && messages.length == 0) {
        var d = floor(random(0, 3));
        //0 1 2
        //avoid same disaster twice
        if (d != lastDisaster) {
          lastDisaster = d;
          disasterCounter = random(DISASTER_FREQUENCY_MIN, DISASTER_FREQUENCY_MAX);

          storyMessage(story.disaster);
          storyMessage(story.disaster2);

          if (d == 0) {
            wildFireCounter = WILDFIRE_DURATION;
            bgDisaster.clear();
            sounds.fireWave.play();
          }

          if (d == 1) {
            heatWaveCounter = HEAT_WAVE_DURATION;
            bgDisaster.clear();
            sounds.heatWave.play();
          }

          if (d == 2) {
            floodCounter = FLOOD_DURATION / 2; //div/mult is extension
            floodViz = FLOOD_VIZ;
            seaLevelRise++;
            bgDisaster.clear();
            sounds.flood.play();
          }
        }
      }

      turnCounter = 0;



    } //end turn


    ////////////////////
    //Drawing

    //mistery camera glitch
    if (frames > 1) {
      //draw terrain
      for (var r = 0; r < ROWS; r++)
        for (var c = 0; c < COLS; c++) {

          push();
          var x = (c - r) * TILE_W / 2;
          var y = (c + r) * TILE_H / 2;
          translate(x, y);

          terrain[r][c].draw();
          pop();
        }
    }

    frames++;

    //correction for moving out and repositioning
    if (dragPoint != null) {
      var dd = dist(dragPoint.x, dragPoint.y, mousePosition.x, mousePosition.y);
      if (dd > TILE_H / 2) {
        dragPoint = null;
      }
    }

    mousePosition.x = camera.position.x + (mouseX - width / 2) / camera.zoom;
    mousePosition.y = camera.position.y + (mouseY - height / 2) / camera.zoom;


    //heat is localized
    drawSprites(heatGroup);

    drawSprites(markerGroup);

    /////////////////////////////////////
    ///GUI

    camera.off();

    if (floodViz > 0) {
      overlay.clear();
      overlay.strokeWeight(viewZoom * 1.5)
      overlay.noSmooth();

      var a = map(floodViz, FLOOD_VIZ, 0, 0, PI);
      var q = sin(a) * 800;
      var dw = graphics.drop.width * viewZoom;
      var dh = graphics.drop.height * viewZoom;

      for (var i = 0; i < q; i++) {

        var px = random(-NOISE_SHAKE, overlay.width + NOISE_SHAKE);
        var py = random(-NOISE_SHAKE, overlay.height + NOISE_SHAKE);

        //var l = random(2, 4)*viewZoom;
        //overlay.line(px, py, px + l * 2, py + l);
        overlay.image(graphics.drop, px, py, dw, dh);
      }

      image(overlay, 0, 0, width, height);
    }

    //draw buttons
    drawSprites(buttonGroup);


    //draw resource bar

    //y
    barY += (targetBarY - barY) / 4;

    //bg
    fill(0);
    rectMode(CORNER);
    rect(width / 2 - BAR_W / 2 - BAR_BORDER, barY - BAR_BORDER, BAR_W + BAR_BORDER * 2, BAR_H + BAR_BORDER * 2);

    var barScale = max(natural, artificial);

    //the total nature can be around
    if (barScale < BAR_SCALE)
      barScale = BAR_SCALE;

    nW += (map(natural, 0, barScale, 0, BAR_W / 2) - nW) / 4;

    var aWDelta = (map(artificial, 0, barScale, 0, BAR_W / 2) - aW) / 4;
    aW += aWDelta;


    var aColor1 = CITY_COLOR_1;
    var aColor2 = CITY_COLOR_2;

    //change color when bar is decreasing
    if (aWDelta < -0.1) {
      aWDelta *= -1;
      var t = constrain(aWDelta, 0, 1);
      aColor1 = lerpColor(RUIN_COLOR_1, CITY_COLOR_1, t);
      aColor2 = lerpColor(RUIN_COLOR_2, CITY_COLOR_2, t);
    }

    fill("#9aca3e");
    rect(width / 2, barY, nW, BAR_H / 2);

    fill("#6ca541");
    rect(width / 2, barY + BAR_H / 2, nW, BAR_H / 2);

    fill(aColor1);
    rect(width / 2, barY, -aW, BAR_H);

    fill(aColor2);
    rect(width / 2, barY + BAR_H / 2, -aW, BAR_H / 2);


    //draw message
    if (messages.length > 0) {

      if (currentMessage != "") {
        textSize(MSG_SIZE);
        textAlign(LEFT, BOTTOM);
        textFont(messageFont);

        fill(0);
        rect(width / 2 - messageWidth / 2 - MSG_PADDING, height - MSG_MARGIN - MSG_H - MSG_PADDING * 2, subWidth + MSG_PADDING * 2, MSG_H + MSG_PADDING * 2)
          //rect(width / 2-200, height-MSG_MARGIN-MSG_H-MSG_PADDING*2, 400, MSG_H+MSG_PADDING*2)
        fill(255);
        text(subMessage, width / 2 - messageWidth / 2, height - MSG_MARGIN + MSG_Y_OFFSET - MSG_PADDING);
      }

      messageIndex++;

      if (subMessage != currentMessage) {
        if (messageIndex >= currentMessage.length - 1) {
          //end of the message
          subWidth = messageWidth;
          subMessage = currentMessage;
          messageCounter = (currentMessage.length + 3) * POST_DELAY + POST_DELAY_FIXED;
        } else {
          //styll typing
          subMessage = currentMessage.substring(0, messageIndex); //the substring of the current message
          subWidth = textWidth(subMessage);

          var s = floor(random(0, sounds.tones.length));
          if (!sounds.tones[s].isPlaying())
            sounds.tones[s].play();

        }
      } else {
        //done typing
        messageCounter -= deltaTime;
        //done with the wait
        if (messageCounter < 0) {
          //next
          if (messages.length > 0) {

            if (messages.length > 1) {
              messages.shift();
              textSize(MSG_SIZE);
              currentMessage = messages[0];
              messageWidth = textWidth(currentMessage); //the calculated lenght in px
            } else {
              messages = []; //to avoid null
              messages.length = 0;
            }


          } else
            currentMessage = "";

          messageIndex = 0; //the substring index
          subWidth = 0;
          subMessage = "";
        }
      }
    }

    fps += (frameRate() - fps) / 4;

    if (keyDown("f")) {
      fill(0);
      rect(22, 10, 50, 10);
      fill(255);
      textSize(10);
      text("FPS: " + round(fps) + "/" + FPS, 20, 20);

    }

    if (wildFireCounter > 0) {
      image(graphics.fireIcon, width - ICON - 10, height - 10 - ICON, ICON, ICON);
    } else if (floodViz > 0) {
      image(graphics.floodIcon, width - ICON - 10, height - 10 - ICON, ICON, ICON);
    } else if (heatWaveCounter > 0) {
      image(graphics.droughtIcon, width - ICON - 10, height - 10 - ICON, ICON, ICON);
    }



    //box
    if (restartDialog) {
      okButton.visible = true;
      cancelButton.visible = true;


      fill(0);
      rectMode(CENTER);
      rect(width / 2, height / 2, BOX_W, BOX_H);
      drawSprite(okButton);
      drawSprite(cancelButton);

      textSize(MSG_SIZE);
      textAlign(CENTER, CENTER);
      textFont(messageFont);
      fill(255);
      text("Create new scenario?", width / 2, height / 2 - BOX_H / 4);
    }

    pMouseIsPressed = mouseIsPressed;

    previousZoom = viewZoom;
  } //end gamestate game


} //end update



function selectCube(c) {
  currentCube = c;
  //print("SELECTED " + c.label);
}



function createTile(r, c) {

  //generate terrain
  var n = noise(r * TERRAIN_NOISE_DETAIL, c * TERRAIN_NOISE_DETAIL);
  var ind = floor(map(n, 0, 1, 0, terrainScale.length));

  var terrain = terrainScale[ind];

  //generate civilization/pollution patterns  
  n = noise(r * CIVILIZATION_NOISE_DETAIL + CIVILIZATION_OFFSET, c * CIVILIZATION_NOISE_DETAIL + CIVILIZATION_OFFSET);
  ind = floor(map(n, 0, 1, 0, civilizationScale.length));

  var civilization = civilizationScale[ind];

  //make terrain by default
  var type = terrain;
  var stage = 0;

  //wasteland + grass = wasteland
  if (terrain == GRASS && civilization == WASTELAND)
    type = WASTELAND;

  if (terrain == GRASS && civilization == CONCRETE) {
    type = CONCRETE;
  }

  var newTile = new Tile(type, r, c);
  newTile.n = n;
  //get type from index
  newTile.id = id[type];
  newTile.stage = stage;

  newTile.transition = ecology.getRow(type).getString("transition");
  
  var sprString = ecology.getRow(type).getString("sprite");
  //sprString = sprString.replace(/\s+/g, '');
  var spr = sprString.split(",");

  if (spr.length == 1) {
    newTile.sprite = [];
    newTile.sprite[0] = spr[0];
    newTile.frame = 0;
  } else {
    newTile.sprite = spr;
    newTile.frame = floor(random(0, spr.length));
    //print(newTile.frame);
  }

  //save pixel coord, tile center
  newTile.x = (c - r) * TILE_W / 2 + TILE_W / 2;
  newTile.y = (c + r) * TILE_H / 2 + TILE_H * 1.5;

  if (type == WATER)
    newTile.changeType(type);

  return newTile;
}


function keyPressed() {
  if (gameState == "game" && keyCode === ESCAPE)
    restartGame();
}



function mousePressed() {

  if (gameState == "game") {

    //not holding cube it may be a start drag
    if (mouseButton == LEFT && mouseX > MENU_W && currentCube == null) {
      scrollPoint = createVector(mousePosition.x, mousePosition.y);
    }

    if (mouseButton == LEFT) {

      if (mouseX < MENU_W) {} else if (currentTile != null && currentCube == null) {

        //pick up cube 
        for (var i = 0; i < cubeLabels.length; i++) {
          if (currentTile == cubes[cubeLabels[i]].tile) {
            //selectCube(cubes[cubeLabels[i]]);
            currentTile.nextType = currentTile.previousType;
            currentTile.baseSprite = null;
            currentCube = cubes[cubeLabels[i]];
            dragTile = currentTile;
            dragPoint = createVector(mousePosition.x, mousePosition.y);
          }
        }
      }
    } else if (mouseButton == RIGHT) {
      var cancelCube = false;
      //if on a cube remove
      if (currentTile != null) {

        for (var i = 0; i < cubeLabels.length; i++) {
          if (currentTile == cubes[cubeLabels[i]].tile) {
            currentTile.nextType = currentTile.previousType;
            currentTile.baseSprite = null;
            cancelCube = true;
          }
        }

        currentCube = null;
      }

      if (!cancelCube)
      //change zoom
      {
        viewZoom *= 2;
        if (viewZoom > MAX_ZOOM)
          viewZoom = MIN_ZOOM;
      }


      dragZoomPoint = createVector(mouseX, mouseY);

    }
  }
}


function mouseReleased() {
  if (gameState == "game") {

    if (mouseButton == LEFT) {

      scrollPoint = null;

      if (mouseX < MENU_W) {} else {
        //drop cube
        if (currentTile != null && currentCube != null && dragTile != currentTile) {
          var dragException = false;

          if (dragPoint != null) {
            var dd = dist(dragPoint.x, dragPoint.y, mousePosition.x, mousePosition.y);
            if (dd < TILE_H / 2)
              dragException = true;
          }

          if (!dragException) {
            var planted = dropCube(currentTile, currentCube.id);

            if (planted)
              currentCube = null;
          }

        } else if (currentTile == null && currentCube != null) //drop cube outside of the frame
        {
          currentCube = null;
        }

        dragTile = null;
      }
    }
    dragPoint = null;
  }
  if (mouseButton == RIGHT) {
    dragZoomPoint = null;
  }
}


function dropCube(tile, c) {

  if (tile === null)
    return;

  var res = tile.receive(c, true);
  return res;
}

function getTile(c, r) {

  if (r >= 0 && r < ROWS && c >= 0 && c < COLS)
    return terrain[r][c];
  else
    return false;
}

function getTileAtPosition(x, y) {

  var cubeHit = null;

  //go through the active cubes and check their extended hit box
  for (var i = 0; i < cubeLabels.length; i++) {
    if (cubes[cubeLabels[i]].tile != null) {
      var t = cubes[cubeLabels[i]].tile;
      var tx = (t.c - t.r) * TILE_W / 2;
      var ty = (t.c + t.r) * TILE_H / 2;
      if (x > tx && x < tx + TILE_W && y < ty + TILE && y > ty - TILE_H / 2)
        cubeHit = t;

    }
  }

  var c, r;

  if (cubeHit == null) {
    c = floor((y - TILE_H / 2) / TILE_H + (x - TILE_W) / TILE_W);
    r = floor((y - TILE_H) / TILE_H - (x - TILE_W / 2) / TILE_W);
  } else {
    c = cubeHit.c;
    r = cubeHit.r;
  }


  if (r >= 0 && r < ROWS && c >= 0 && c < COLS)
    return terrain[r][c];

}


function diegeticSound(s, vol) {

  var vol = map(viewZoom, MIN_ZOOM, MAX_ZOOM, vol * VOLUME / 4, vol * VOLUME);
  s.play(0, 1, vol);
}

function randomSound(type, vol) {

  if (type != "" && turns > PRE_TURNS)
    if (sounds[type] != null) {
      var s = floor(random(0, sounds[type].length));

      var vol = map(viewZoom, MIN_ZOOM, MAX_ZOOM, vol * VOLUME / 4, vol * VOLUME);

      if (!sounds[type][s].isPlaying())
        sounds[type][s].play(0, 1, vol);
    }

}


function shadeColor(color, percent) {
  var f = parseInt(color.slice(1), 16),
    t = percent < 0 ? 0 : 255,
    p = percent < 0 ? percent * -1 : percent,
    R = f >> 16,
    G = f >> 8 & 0x00FF,
    B = f & 0x0000FF;
  return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}


//manhattan distance
function mDist(x0, y0, x1, y1) {
  return abs(x1 - x0) + abs(y1 - y0);
}

function createMatrix0(R, C) {
  var m = [];

  for (var r = 0; r < R; r++) {
    var row = [];
    for (var c = 0; c < C; c++) {
      row.push(0);
    }
    m.push(row);
  }

  return m;
}


//take path and position return tile
function pathToTile(r, c, path) {

  for (var i = 0; i < path.length; i++) {
    var move = path[i];

    if (move == "North")
      r--;
    if (move == "South")
      r++;
    if (move == "West")
      c--;
    if (move == "East")
      c++;
  }

  if (r >= 0 && r < ROWS && c >= 0 && c < COLS)
    return terrain[r][c];
  else
    return null;

}

//take move and position returns tile
function moveToTile(r, c, move) {
  var nR = r;
  var nC = c;
  if (move == "North")
    nR = r - 1;
  if (move == "South")
    nR = r + 1;
  if (move == "West")
    nC = c - 1;
  if (move == "East")
    nC = c + 1;

  if (nR >= 0 && nR < ROWS && nC >= 0 && nC < COLS) {
    return terrain[nR][nC];
  } else
    return null;
}

function reversePath(p) {
  var rev = [];
  for (var i = p.length - 1; i >= 0; i--) {
    if (p[i] == "North")
      rev.push("South");
    if (p[i] == "South")
      rev.push("North");
    if (p[i] == "West")
      rev.push("East");
    if (p[i] == "East")
      rev.push("West");

  }

  return rev;

}

function makeGrid(walkableTypes, goals) {

  var grid = [];

  for (var i = 0; i < ROWS; i++) {
    grid[i] = [];
    for (var j = 0; j < COLS; j++) {

      //default unwalkable
      grid[i][j] = 1;

      //goal is not an array but a tile
      if (Array.isArray(goals) == false) {

        if (goals.r != null && goals.c != null) {
          if (i == goals.r && j == goals.c) {
            grid[i][j] = 2;
          }
        } else
          print("ERROR IN MAKEGRID GOALS!")
      } else {
        //if tile type is among the goals set 2
        for (var g = 0; g < goals.length; g++)
          if (terrain[i][j].type == goals[g]) {
            grid[i][j] = 2;
          }
      }

      //all valid
      if (walkableTypes.length == 0 && grid[i][j] != 2) {
        grid[i][j] = 0;
      } else {
        //if tile type is among the walkable set 0
        for (var w = 0; w < walkableTypes.length; w++)
          if (terrain[i][j].type == walkableTypes[w]) {
            grid[i][j] = 0;
          }
      }
    }
  }

  return grid;
}

function normalizeAngle(a) {
  a = a % 360;
  if (a < 0)
    a += 360;
  return a;
}

//assumes 100
function randomWeighted(weights) {
  var result = 0;
  var total = 0;
  var randVal = random(0, 100 + 1);

  for (result = 0; result < weights.length; result++) {
    total += weights[result];
    if (total >= randVal) break;
  }
  return result;
}

function angleDistance(alpha, beta) {
  var phi = Math.abs(beta - alpha) % 360; // This is either the distance or 360 - distance
  var distance = phi > 180 ? 360 - phi : phi;
  return distance;
}


//map+constraint
function mapLimit(v, a1, b1, a2, b2) {
  var m = map(v, a1, b1, a2, b2);
  return constrain(m, a2, b2)
}


//using the midpoint circle algo grabs the tiles at a certain radius
function getCircle(x0, y0, radius) {
  var x = radius;
  var y = 0;
  var radiusError = 1 - x;
  var tiles = [];

  while (x >= y) {

    var t;

    t = getTile(x + x0, y + y0);
    if (t != false) tiles.push(t);

    t = getTile(y + x0, x + y0);
    if (t != false) tiles.push(t);

    t = getTile(-x + x0, y + y0);
    if (t != false) tiles.push(t);

    t = getTile(-y + x0, x + y0);
    if (t != false) tiles.push(t);

    t = getTile(-x + x0, -y + y0);
    if (t != false) tiles.push(t);

    t = getTile(-y + x0, -x + y0);
    if (t != false) tiles.push(t);

    t = getTile(x + x0, -y + y0);
    if (t != false) tiles.push(t);

    t = getTile(y + x0, -x + y0);
    if (t != false) tiles.push(t);

    y++;

    if (radiusError < 0) {
      radiusError += 2 * y + 1;
    } else {
      x--;
      radiusError += 2 * (y - x + 1);
    }
  }

  return tiles;
};

//
function storyMessage(obj) {
  if (obj.state == 0) {
    obj.state = -1;
    newMessage(obj.msg);
  }

}

function newMessage(msg) {

  //no messages currently
  if (messages.length == 0) {

    textSize(MSG_SIZE);
    textAlign(LEFT, BOTTOM);
    textFont(messageFont);

    currentMessage = messages[0] = msg;
    messageWidth = textWidth(currentMessage); //the calculated lenght in px
    messageIndex = 0; //the substring index
    subWidth = 0;
    subMessage = "";
  } else //queue it
  {
    messages.push(msg);
  }
}

////////////////////////////
////////////////////////////
///Breadth first pathfinding
////////////////////////////
////////////////////////////

// Start location will be in the following format:
// [distanceFromTop, distanceFromLeft]
var findShortestPath = function(startCoordinates, _grid, includeGoal) {
  var distanceFromTop = startCoordinates[0];
  var distanceFromLeft = startCoordinates[1];

  //since it's destructive clone grid
  var grid = [];

  for (var i = 0; i < _grid.length; i++)
    grid[i] = _grid[i].slice(0);

  // Each "location" will store its coordinates
  // and the shortest path required to arrive there
  var location = {
    distanceFromTop: distanceFromTop,
    distanceFromLeft: distanceFromLeft,
    path: [],
    status: 'Start'
  };

  // Initialize the queue with the start location already inside
  var queue = [location];

  // Loop through the grid searching for the goal
  while (queue.length > 0) {
    // Take the first location off the queue
    var currentLocation = queue.shift();

    // Explore North
    var newLocation = exploreInDirection(currentLocation, 'North', grid);
    if (newLocation.status === 'Goal') {
      if (includeGoal == true) queue.push(newLocation);
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore East
    var newLocation = exploreInDirection(currentLocation, 'East', grid);
    if (newLocation.status === 'Goal') {
      if (includeGoal == true) queue.push(newLocation);
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore South
    var newLocation = exploreInDirection(currentLocation, 'South', grid);
    if (newLocation.status === 'Goal') {
      if (includeGoal == true) queue.push(newLocation);
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore West
    var newLocation = exploreInDirection(currentLocation, 'West', grid);
    if (newLocation.status === 'Goal') {
      if (includeGoal == true) queue.push(newLocation);
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }
  }

  // No valid path found
  return false;

};


// This function will check a location's status
// (a location is "valid" if it is on the grid, is not an "obstacle",
// and has not yet been visited by our algorithm)
// Returns "Valid", "Invalid", "Blocked", or "Goal"
var locationStatus = function(location, grid) {
  var gridSize = grid.length;
  var dft = location.distanceFromTop;
  var dfl = location.distanceFromLeft;

  if (location.distanceFromLeft < 0 ||
    location.distanceFromLeft >= gridSize ||
    location.distanceFromTop < 0 ||
    location.distanceFromTop >= gridSize) {

    // location is not on the grid--return false
    return 'Invalid';
  } else if (grid[dft][dfl] === 2) {
    return 'Goal';
  } else if (grid[dft][dfl] !== 0) {
    // location is either an obstacle or has been visited
    return 'Blocked';
  } else {
    return 'Valid';
  }
};


// Explores the grid from the given location in the given
// direction
var exploreInDirection = function(currentLocation, direction, grid) {
  var newPath = currentLocation.path.slice();
  newPath.push(direction);

  var dft = currentLocation.distanceFromTop;
  var dfl = currentLocation.distanceFromLeft;

  if (direction === 'North') {
    dft -= 1;
  } else if (direction === 'East') {
    dfl += 1;
  } else if (direction === 'South') {
    dft += 1;
  } else if (direction === 'West') {
    dfl -= 1;
  }

  var newLocation = {
    distanceFromTop: dft,
    distanceFromLeft: dfl,
    path: newPath,
    status: 'Unknown'
  };
  newLocation.status = locationStatus(newLocation, grid);

  // If this new location is valid, mark it as 'Visited'
  if (newLocation.status === 'Valid') {
    grid[newLocation.distanceFromTop][newLocation.distanceFromLeft] = 'Visited';
  }

  return newLocation;
};

//disable right click
document.oncontextmenu = function() {
  return false;
}