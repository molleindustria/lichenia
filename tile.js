function Tile(type, r, c) {
  this.type = type;
  this.nextType = type;
  this.previousType = type;
  this.r = r;
  this.c = c;
  this.col = 0;
  this.actions = [];
  //stage is a reusable variable to time a type change
  this.stage = 0;
  this.nextStage = -1;
  this.previousStage = -1;
  this.frame = 0;
  this.turn = 0;
  this.turns = 0;
  this.spill = 0;
  //state is a reusable variable string
  this.state = "";
  this.baseSprite = null;
  this.transition = "";
  this.transitionFrame = 0;
  this.visible = false;

  this.draw = function() {
      var y = 0;


      if (this.visible) {

        if (this.baseSprite != null) {
          image(tileGraphics[this.baseSprite], 0, 0, TILE, TILE);

          if (this.type == GREEN_CUBE || this.type == BLUE_CUBE || this.type == STONE_CUBE || this.type == GLITCH_CUBE || this.type == BLACK_CUBE || this.type == WHITE_CUBE)
            y = floor(map(sin(time), 0, 1, 10, 20));
        }

        if (this.unglitchedSprite != null) {
          image(tileGraphics[this.unglitchedSprite], 0, 0, TILE, TILE);
        }


        //figure this out for preview
        var action = "";
        //it meeee
        if (this == currentTile && currentCube != null) {
          action = ecology.getRow(this.type).getString(id[currentCube.id]);
        }

        //draw the actual tile
        if (action == "" && this.sprite != "") {

          if (this.frame >= this.sprite.length)
            this.frame = 0;

          //case 1: no transition -> draw the tile
          //also fps is lagging
          if (this.transition == "") {
            this.transitionFrame = TRANSITION_FRAMES;
            image(tileGraphics[this.sprite[this.frame]], 0, -y, TILE, TILE);
          } else {

            //there is a transition

            //case 2: the old type is tall and had a transition -> draw the new first and fade the old out out
            if (this.previousTall && this.previousTransition != "") {

              image(tileGraphics[this.sprite[this.frame]], 0, -y, TILE, TILE);

              if (this.transitionFrame < TRANSITION_FRAMES && this.previousSprite != null) {

                var frame = transitions[this.previousTransition].getImageAt(TRANSITION_FRAMES - 1 - this.transitionFrame);

                //old one to be masked
                var maskedSprite = this.previousSprite.get();
                maskedSprite.mask(frame);

                image(maskedSprite, 0, -y, TILE, TILE);

                this.transitionFrame++; // -= deltaTime / TURN;

              }

            } //case 3: the new type is tall (or both short) -> draw the old first and fade in
            else {

              //transition in progress
              if (this.transitionFrame < TRANSITION_FRAMES && this.previousSprite != null && this.transition != null) {

                //draw previous first  
                image(this.previousSprite, 0, -y, TILE, TILE);

                //var f = floor(map(this.transition, 1, 0, 0, transition.getLastFrame()));
                if (transitions[this.transition] == null) {
                  return;
                }

                var frame = transitions[this.transition].getImageAt(this.transitionFrame);

                //new one to be masked
                var maskedSprite = tileGraphics[this.sprite[this.frame]].get();
                maskedSprite.mask(frame);

                image(maskedSprite, 0, -y, TILE, TILE);

                this.transitionFrame++; // -= deltaTime / TURN;

              } else {
                //end of transition draw normal
                image(tileGraphics[this.sprite[this.frame]], 0, -y, TILE, TILE);
              }

            }

          } //end transition


          if (this == currentTile && currentCube != null) {
            tint(0, 80); // 
            image(tileGraphics[currentCube.sprite], 0, -y, TILE, TILE);
            //blend(tileGraphics[currentCube.sprite], 0, 0, TILE, TILE, 0, 0, TILE, TILE, SCREEN);

          }
        } else {
          //if valid position draw cube on the top
          if (action != "") {
            image(tileGraphics[currentCube.sprite], 0, 0, TILE, TILE);
          }


        }
      } else {
        if (random(100) < 50) {
          //invisible make it appear organically
          var n = this.neighbors8[floor(random(0, this.neighbors8.length))];
          if (n.visible)
            this.visible = true;
        }
      }

      if (this.dissolve > 0) {
        animation(dissolve, TILE_W / 2, TILE_H);
        this.dissolve--;
      }

    } //end draw

  this.changeType = function(_t) {
    this.previousType = this.type;
    this.type = _t;
    this.nextType = _t;
    this.turn = 0;

    this.turns = ecology.getRow(_t).getNum("time");

    var action = ecology.getRow(_t).getString("evolution");
    this.actions = split(action, ",");


    if (this.sprite[this.frame] != null)
      this.previousSprite = tileGraphics[this.sprite[this.frame]]; //make a copy of the img

    this.transitionFrame = 0;
    //flag for transition drawing order
    this.previousTall = this.tall;
    this.previousTransition = this.transition;
    this.tall = (this.type == WATER || this.type == FOREST || this.type == BURNED_FOREST || this.type == CITY || this.type == CONCRETE || this.type == RUIN);

    this.transition = ecology.getRow(_t).getString("transition");

    var spr = ecology.getRow(_t).getString("sprite").split(",");

    if (spr.length == 1) {
      this.sprite = [];
      this.sprite[0] = spr[0];
      this.frame = 0;
    } else if (this.nextFrame != null) {
      this.sprite = spr;
      this.frame = this.nextFrame;
    } else {
      this.sprite = spr;
      this.frame = floor(random(0, spr.length));
    }


    this.id = id[_t];
    //if moving toward a path change
    this.path = null;

    //ugly exception
    if (this.previousType != OIL) {
      var fx = ecology.getRow(_t).getString("sound");

      if (!this.isOffScreen())
        randomSound(fx, 1);
      else
        randomSound(fx, VOLUME_OFFSCREEN);
    }
  }

  this.stateChange = function() {

    if (this.nextType != this.type) {
      this.changeType(this.nextType);

      this.previousStage = this.stage;


      //stage can be passed
      if (this.nextStage != -1) {
        this.stage = this.nextStage;
        this.nextStage = -1;
      } else
        this.stage = 0;
    }


  }

  this.evolve = function() {

    if (this.actions != null)
      for (var a = 0; a < this.actions.length; a++) {

        switch (this.actions[a]) {

          //spread in 4 directions
          case "spread4":
            if (this.N != null)
              this.N.receive(this.type);

            if (this.S != null)
              this.S.receive(this.type);

            if (this.W != null)
              this.W.receive(this.type);

            if (this.E != null)
              this.E.receive(this.type);

            break;

            //spread in one random direction
          case "spread1":

            var n = this.neighbors4[floor(random(0, this.neighbors4.length))];
            n.receive(this.type);

            break;

            //spread in 2 non repeated random directions
          case "spread2":
            shuffle(this.neighbors4, true);

            if (this.neighbors4.length > 0) {
              var n = this.neighbors4[shuffle4[0]];
              n.receive(this.type);
            }

            if (this.neighbors4.length > 1) {
              n = this.neighbors4[shuffle4[1]];
              n.receive(this.type);
            }

            break;


          case "spread3":
            shuffle(this.neighbors4, true);

            if (this.neighbors4.length > 0) {
              var n = this.neighbors4[0];
              n.receive(this.type);
            }

            if (this.neighbors4.length > 1) {
              n = this.neighbors4[shuffle4[1]];
              n.receive(this.type);
            }

            if (this.neighbors4.length > 2) {
              n = this.neighbors4[shuffle4[2]];
              n.receive(this.type);
            }

            break;


          case "extinguish":
            this.stage++;

            if (this.stage >= 8) {
              if (this.previousType == FOREST) {
                this.nextType = BURNED_FOREST;

              } else if (this.previousType == RUIN) {
                plasticCounter++;

                if (plasticCounter % PLASTIC_FREQUENCY == 0 && plastiglomerates < 16 && turns > 500) {
                  this.nextType = PLASTIC;

                  if (plastiglomerates == 0)
                    storyMessage(story.plastigromerate);

                  //the sequence is shuffled
                  var index = plasticSequence[plastiglomerates];

                  //create an area around the plastic
                  var area = this.getNeighbors8Except(PLASTIC, WATER, OIL);

                  for (var i = 0; i < area.length; i++) {
                    area[i].nextType = GRASS;
                  }

                  this.addMarker(plastics[index]);


                  this.nextFrame = index;
                  plastiglomerates++;

                } else
                  this.nextType = BURNED;

              } else {
                this.nextType = BURNED;
              }
            }

            break;

            //black cube slowly destroy stuff around it
          case "annihilate":

            if (this.stage % ANNIHILATION == 0 && this.stage < ANNIHILATION_SIZE) {
              var targets = getCircle(this.c, this.r, this.stage / ANNIHILATION);

              if (!this.isOffScreen())
                diegeticSound(sounds.annihilation, 2);
              else
                diegeticSound(sounds.annihilation, 1);


              for (var i = 0; i < targets.length; i++) {
                for (var j = 0; j < targets[i].neighbors4.length; j++) {
                  var t = targets[i].neighbors4[j];
                  if (t.type != BLACK_CUBE && t.type != GREEN_CUBE && t.type != BLUE_CUBE && t.type != STONE_CUBE && t.type != GLITCH_CUBE && t.type != PLASTIC) {
                    if (t.type == FOREST || t.type == GRASS)
                      t.nextType = FIRE;
                    else
                      t.nextType = BLACK_BURN;

                  }
                }
              }
            }

            //remove
            if (this.stage > ANNIHILATION_SIZE) {
              this.nextType = BLACK_BURN;
              this.baseSprite = null;
              //this.dissolveCube();
            }
            this.stage++;

            break;

            //blackburn turns into wasteland
          case "fade":
            this.stage++;
            if (this.stage > 20 && random(0, 100) < 10) {
              this.nextType = WASTELAND;
            }

            break;


            //burned ground regrows
          case "regrowth":
            this.stage++;

            if (this.stage > random(REGROWTH_TIME, REGROWTH_TIME * 2))
              this.nextType = GRASS;
            break;

          case "regrowthForest":
            this.stage++;

            if (this.stage > random(REGROWTH_TIME, REGROWTH_TIME * 2))
              this.nextType = BURNED;
            break;

            //water spills
          case "spill":
            //spill is accumulation
            if (this.spill > 0) {
              //get non water 
              var goodN = this.getNeighbors8Except(BLUE_CUBE, GREEN_CUBE);

              if (goodN.length > 0) {
                var dest = goodN[floor(random(0, goodN.length))];

                //not water -> turn into water
                if (dest.type != WATER && dest.nextType != WATER) {
                  dest.nextType = WATER;
                  this.spill--;
                  if (this.movedWater != "") {
                    dest.movedWater = this.movedWater;
                  }
                } else if (dest.spill == 0) {
                  if (dest.nextType != WATER)
                    dest.spill = 1;

                  dest.spill = 1;
                  this.spill--;
                  if (this.movedWater != "") {
                    dest.movedWater = this.movedWater;
                  }
                }
              }
            }

            break;

          case "flooding":
            if (floodCounter > 0) {
              var endangered = this.getNeighbors8Except(WATER, FLOOD, WETLAND);

              if (endangered.length > 0) {
                if (random(FLOOD_DURATION) < FLOOD_SEVERITY) {
                  var tgt = endangered[floor(random(0, endangered.length))];

                  if (this.getNeighbors8Except(WATER).length > 4 || seaLevelRise < SEA_RISE || seaLevelRise > SEA_RISE + 2) //flood is temporary
                    tgt.nextType = FLOOD;
                  else
                    tgt.nextType = WATER;

                }
              }
            }

            break;

            //grass grows a bit
          case "hurricane":
            if (floodCounter > 0) {
              if (floor(random(60)) < this.getNeighbors8(GRASS, FOREST).length) //less green neigh -> more
                this.nextType = GRASS;
            }
            break;


          case "dry":

            this.stage++;
            if (this.stage > FLOOD_DURATION) {

              //city leaves crap
              if (this.previousType == CITY || this.previousType == CONCRETE) {
                this.nextType = CONCRETE;
              } else
                this.nextType = this.previousType;
            }

            break;

          case "spring":
            var goodN = this.getNeighbors8(WATER);
            if (goodN.length > 0) {
              var dest = goodN[floor(random(0, goodN.length))];
              if (dest.stage == 0)
                dest.stage = 1;
            }

            break;

            //blue cube finds the closest water and brings it next to it
          case "soak":
            var SOAK_SPEED = 6;
            //unfortunately I can't use the turns because it messes the framerate
            this.stage++;

            if (this.stage % SOAK_SPEED == 0) {
              //this.stage = 0;

              var goodN = [];
              var trySelf = false;

              //if no path is defined, find the closest destination
              if (this.path == null) {
                //makeGrid with all water sources and oil which will be purified
                var terrainGrid = makeGrid([], [WATER, OIL]);

                //remove the waters that have not been already moved by this cube
                for (var i = 0; i < ROWS; i++) {
                  for (var j = 0; j < COLS; j++) {
                    if (terrain[i][j].movedWater == (this.r + "-" + this.c))
                    //not a goal then
                      terrainGrid[i][j] = 0;

                  }
                }

                this.path = findShortestPath([this.r, this.c], terrainGrid, true);
              }

              //find the actual tile
              if (this.path != false) {
                var closestWater = pathToTile(this.r, this.c, this.path)

                if (closestWater != null) {
                  //start with the tile underneath
                  if (trySelf) {
                    this.previousType = WATER;
                    closestWater.nextType = WASTELAND;
                    this.path = null;
                  } else { //otherwise find a closeby one
                    var goodN = this.getNeighbors8Except(WATER, GREEN_CUBE);
                    //flood non waters
                    if (goodN.length > 0) {
                      var dest = goodN[floor(random(0, goodN.length))];
                      dest.nextType = WATER;
                      dest.spill = closestWater.spill;
                      closestWater.nextType = WASTELAND;
                      this.path = null;
                      dest.movedWater = (this.r + "-" + this.c);
                    } //try spill
                    else { //flood waters, they will spill
                      var goodN = this.getNeighbors8(WATER);
                      if (goodN.length > 0) {
                        var dest = goodN[floor(random(0, goodN.length))];
                        //if(dest.stage == 0) {
                        if (dest.spill == 0) {
                          dest.spill = 1;
                          closestWater.nextType = WASTELAND;
                          this.path = null;
                          dest.movedWater = (this.r + "-" + this.c);
                        } //else no success
                      }

                    }
                  }
                  //
                }
              }
            }

            if (this.stage > SOAK_SPEED * 20) {
              this.nextType = WATER;
              this.baseSprite = null;
              this.dissolveCube();
            }
            break;

            //green cube keeps growing weed
          case "growWeed":
            this.stage++;

            if (this.stage % WEED_POWER == 0) {
              var n = this.neighbors4[floor(random(0, this.neighbors4.length))];

              var taken = n.receive(WEED);
              if (taken) {
                n.nextStage = WEED_POWER; //random(4, 8));
              }
            }

            if (this.stage > WEED_POWER * 10) {
              this.nextType = GRASS;
              this.baseSprite = null;
              this.dissolveCube(); //trigger anim
            }

            break;

            //inert weed turns to grass slowly
          case "weedToGrass":
            if (this.stage == -1) {
              if (random(100) < 5)
                this.nextType = GRASS;
            }
            break;

          case "spreadWeed":

            if (this.stage > 1) {

              //take ruins first
              var con = this.getNeighbors8(CONCRETE);

              if (con.length > 0) {
                var c = con[floor(random(0, con.length))];
                c.nextStage = this.stage - 1;
                c.nextType = RUIN;
                //this.nextStage = 1;
              } else {
                //spread
                //check weed neigh
                var n = this.neighbors4[floor(random(0, this.neighbors4.length))];

                //check it's spreading out / not going back
                if (n.getNeighbors4(WEED).length <= 1) {

                  var taken = n.receive(WEED);
                  //pass stage
                  if (taken) {

                    n.nextStage = this.stage - 1;
                    //sticks more on city and dead city
                    //if (n.type != CONCRETE && n.type != CITY)
                    //this.nextStage = 1;
                  }
                }
              }
            }

            break;


          case "wetlandDeath":
            var goodN = this.getNeighbors8(WATER);
            if (goodN.length <= 0) {
              this.nextType = WASTELAND;
            }
            break;

            //wetland grows on coast
          case "growCoast":

            if (this.stage < WETLAND_STRENGTH) {
              var goodN = this.getNeighbors8Except(WATER, WETLAND, CITY);

              if (goodN.length > 0) {
                //get one an check if coastal
                var n = goodN[floor(random(0, goodN.length))];
                var nN = n.getNeighbors8(WATER);

                if (nN.length >= 1) {
                  this.stage++;
                  n.nextType = WETLAND;
                  n.nextStage = this.stage + 1;
                }
              }
            }
            break;

            //UNUSED: edge spreads on the tiles that are the same type AND are on an edge
          case "spreadEdge":

            //<6 still looking to spread
            if (this.stage < 6) {
              //current type
              var cType = terrain[this.r][this.c].previousType;
              //find edge type
              var eType;

              for (var n = 0; n < this.neighbors4.length; n++) {
                if (this.neighbors4[n].type != cType && this.neighbors4[n].type != EDGE) {
                  eType = this.neighbors4[n].type;
                }
              }

              //there is an edge
              if (eType != null) {

                //find all the n of the current type
                var goodN = this.getNeighbors8(cType);
                //check if they have the same edge
                var edgeN = [];
                for (var n = 0; n < goodN.length; n++) {
                  var nN;

                  nN = goodN[n].getNeighbors4Except(cType, EDGE);

                  //they do
                  if (nN.length > 0) {
                    edgeN.push(goodN[n]);
                  }
                }
                //print((this.stage+1)+"stage");
                for (var n = 0; n < edgeN.length; n++) {
                  edgeN[n].nextType = EDGE;
                  edgeN[n].nextStage = this.stage + edgeN.length;
                }

                this.stage = 10;

              } //no edge
              else {
                //wither outside edge
                if (this.stage < 0) {
                  this.stage--;
                  if (this.stage < -3)
                    this.nextType = this.previousType;
                }

                if (this.path == null) {

                  //find any terrain that is not this one
                  var dest = [];
                  for (var d = 0; d < id.length; d++)
                    if (d != EDGE && d != this.previousType)
                      dest.push(d);

                  var terrainGrid = makeGrid([terrain[this.r][this.c].previousType], dest);
                  this.path = findShortestPath([this.r, this.c], terrainGrid);
                  this.stage = -1;
                } else {
                  //there is a path, follow
                  //there is a path make next move

                  var move = this.path[0];
                  if (move == "North")
                    this.N.receive(this.type);
                  if (move == "South")
                    this.S.receive(this.type);
                  if (move == "West")
                    this.W.receive(this.type);
                  if (move == "East")
                    this.E.receive(this.type);

                  //move
                  if (this.path.length > 1) {
                    this.path.shift();
                    //disable pathfinding here
                    //this.stage = 10;
                  }
                }
              }
            }

            break;

          case "random":
            this.frame += floor(random(1, this.sprite.length - 1));
            this.frame = this.frame % this.sprite.length;
            break;

          case "glitchEvolution":

            if (!glitchPreview) {
              this.frame = floor(random(0, this.sprite.length));
            } else {
              this.frame = turns % 3;
            }


            if (this.contagion != null) {

              //wait
              var n = this.getNeighbors8(GLITCH_CITY);

              //spread to the next glitches
              for (var i = 0; i < n.length; i++) {

                //already contracted
                n[i].contagion = this.contagion;
              }
              //change this
              this.nextType = this.contagion;
              this.contagion = null;
            }


            //don't disappear before it moves
            if (this.stage >= 0) {
              this.stage++;
            }

            if (this.stage >= GLITCH_DURATION) {
              //transform
              if (this.previousType == WASTELAND)
                this.nextType = GRASS;
              else if (this.previousType == GRASS || this.previousType == WEED)
                this.nextType = FOREST;
              else if (this.previousType == CONCRETE || this.previousType == RUIN)
                this.nextType = CITY;
              else if (this.previousType == WATER)
                this.nextType = GRASS;
              else if (this.previousType == OIL)
                this.nextType = WATER;
              else
                this.nextType = WASTELAND;

              this.baseSprite = null;
            }

            break;

          case "glitchAttraction":

            if (cubes.white.tile != null) { // && this.stuck != -1) {
              if (random(100) < 60) //speed
              {
                //find next position
                var nc = this.c;
                var nr = this.r;

                if (this.c < cubes.white.tile.c)
                  nc++;
                else if (this.c > cubes.white.tile.c)
                  nc--;

                if (this.r < cubes.white.tile.r)
                  nr++;
                else if (this.r > cubes.white.tile.r)
                  nr--;

                if (nc != this.c || nr != this.r) {
                  if (terrain[nr][nc].nextType != GLITCH_CITY && terrain[nr][nc].contagion == null) {
                    var taken = terrain[nr][nc].receive(GLITCH_CITY);
                    if (taken & this.stage < 0) {
                      //first move start disappearing
                      this.stage = 0;
                    }
                  }
                }
              }
            }
            break;

            //white cube disappears if touched
          case "touched":

            if (this.getNeighbors4(GLITCH_CITY).length > 0) {
              this.nextType = GLITCH_CITY;
              this.baseSprite = null;
            } else if (this.getNeighbors4(CITY).length > 0) {
              this.nextType = CITY;
              this.life = CITY_RESILIENCE;
              this.baseSprite = null;
            }

            break;

            //alternates between previous state and glitch
          case "glitch":

            if (random(100) < 50) {
              if (this.unglitchedSprite != null)
                this.sprite = this.unglitchedSprite;
              this.frame = 0;
            } else {
              if (!this.isOffScreen())
                randomSound("glitch", 1);
              else
                randomSound("glitch", VOLUME_OFFSCREEN);

              this.sprite = ecology.getRow(GLITCH_CITY).getString("sprite").split(",");
              this.frame += floor(random(1, this.sprite.length - 1));
              this.frame = this.frame % this.sprite.length;
            }
            break;


          case "cycle":
            if (this.f == null) {
              this.f = floor(random(0, this.sprite.length));
              //this.f = 0;
              this.frame = this.f;
            }

            this.frame++;

            if (this.frame >= this.sprite.length)
              this.frame = 0;

            break;

            //concrete turns into ruins if surrounded by grass forest etc
          case "rewild":

            var livingN = this.getNeighbors8(WEED, GRASS, FOREST, RUIN);
            if (livingN.length >= 4) {
              this.nextType = RUIN;

            }

            break;

            //concrete turns into city if surrounded
          case "renovate":
            if (resources > 0) {
              var livingN = this.getNeighbors8(CITY, ROAD);
              if (livingN.length > 4) {
                this.nextType = CITY;
              }
            }
            break;

            //grass turns into forest if surrounded by grass
          case "grow":

            var score = 0;

            for (var n = 0; n < this.neighbors8.length; n++) {
              var neigh = this.neighbors8[n];

              if (neigh.type == GRASS)
                score++;

              //weed cube proximity = big bonus for trees but not for oasification
              if (neigh.type == WEED || neigh.type == GREEN_CUBE)
                score += 3;

              if (neigh.type == WASTELAND || neigh.type == CONCRETE)
                score--;
            }

            if (score > FOREST_LEVELS) {
              this.stage++;
            }

            if (this.stage > random(10, 30)) {
              this.nextType = FOREST;
            }

            break;


          case "deforest":

            var score = 0;

            for (var n = 0; n < this.neighbors8.length; n++) {
              var neigh = this.neighbors8[n];

              if (neigh.type == FOREST)
                score += 2;

              if (neigh.type == GRASS)
                score++;

              //allow for parks
              if (neigh.type == CITY)
                score++;

              //grass is neutral

              if (neigh.type == WASTELAND || neigh.type == CONCRETE)
                score--;
            }

            if (score < DEFOREST_LEVELS) {
              this.stage--;
            }

            if (this.stage < random(-10, -30)) {
              this.nextType = GRASS;
            }
            break;


            //wasteland is taken over if next to 2+ grass
          case "oasify":

            var score = 0;

            for (var n = 0; n < this.neighbors8.length; n++) {
              var neigh = this.neighbors8[n];
              //clean water
              if (neigh.type == WATER)
                score += 4;

              if (neigh.type == WASTELAND || neigh.type == CONCRETE)
                score--;
            }

            if (score > OASIFY_LEVELS) {
              this.stage++;
            }


            if (score > random(5, 10))
              this.nextType = GRASS;

            break;

            //grass desertify edges with heat wave, too subtle add visual feedback?
          case "heatWave":
            if (heatWaveCounter > 0 && this.previousType != WASTELAND) {
              var n = this.getNeighbors4(WASTELAND);

              if (n.length > 2) {
                var r = random(HEAT_WAVE_DURATION);

                if (r < HEAT_WAVE_SEVERITY / 20) {
                  this.nextType = WASTELAND;
                  this.heatEffect();
                }
              }
            }

            break;


            //desertify water with heat wave, too subtle?
          case "drought":
            if (heatWaveCounter > 0) {
              var n = this.getNeighbors4(WATER, WETLAND);

              if (n.length <= 2)
                if (random(HEAT_WAVE_DURATION) < HEAT_WAVE_DURATION / 20) {
                  //if (random(HEAT_WAVE_DURATION) < HEAT_WAVE_SEVERITY)
                  this.nextType = WASTELAND;
                  this.heatEffect();
                }
            }

            break;

            //grass is taken over if next to shitty stuff
          case "desertify":

            var score = 0;

            for (var n = 0; n < this.neighbors8.length; n++) {
              var neigh = this.neighbors8[n];
              //dirty water
              if (neigh.type == WATER)
                score += 3;

              if (neigh.type == FOREST)
                score += 1;

              if (neigh.type == GRASS)
                score++;

              //allow for parks
              if (neigh.type == CITY)
                score++;

              if (neigh.type == WASTELAND || neigh.type == CONCRETE)
                score--;
            }

            //
            if (score < DESERTIFICATION_LEVELS) {
              this.stage--;
            }

            //print("desertify score "+score);  

            if (this.stage < random(-10, -20))
              this.nextType = WASTELAND;

            break;

            //unused
          case "average":

            var sameN = this.getNeighbors8(this.type);

            for (var n = 0; n < sameN.length; n++) {
              if (sameN[n].stage < this.stage) {
                this.stage--;
                sameN[n].stage++;
              }
              if (sameN[n].stage > this.stage) {
                this.stage++;
                sameN[n].stage--;
              }
            }

            break;


            //stone cube creates / relocates city
          case "createCity":

            //find a distant city
            var distantCities = [];
            var found = false;

            for (var r = 0; r < ROWS && !found; r++) {
              for (var c = 0; c < COLS && !found; c++) {
                var tile = terrain[r][c];
                if (tile.type == CITY) {
                  //found only if it distant
                  if ((Math.abs(c - this.c) + Math.abs(r - this.r)) > 4) {
                    distantCities.push(tile);
                    found = true;
                  }
                }
              }
            }


            //the only city is closeby create a city locally
            var n = this.neighbors8[floor(random(0, this.neighbors8.length))];
            var created = n.receive(CITY);

            //if created disappear a distant one: stone cube doesn't grow it just relocates
            if (created && distantCities.length > 0) {
              var t = distantCities[floor(random(0, distantCities.length))];
              t.nextType = WASTELAND;
            }

            this.stage++;
            //you get 10 attempts and disappear
            if (this.stage > 10) {
              this.nextType = CITY;
              this.life = CITY_RESILIENCE;
              this.baseSprite = null;
            }
            break;


            //like stone cube 
          case "createGlitchCity":

            this.stage++;
            if (this.stage > 4) {
              this.nextType = GLITCH_CITY;
              this.baseSprite = null;
              this.nextStage = -2;

            } else {
              var n = this.neighbors8[floor(random(0, this.neighbors8.length))];
              var res = n.receive(GLITCH_CITY);

              if (res) //first glitch city last until it moves
                n.nextStage = -2;
            }
            break;


          case "glitchSpread":

            //spread on cities
            if (this.spread) {
              var nSpread = this.getNeighbors4(CITY);
              this.spread = false;

              for (var n = 0; n < nSpread.length; n++) {
                nSpread[n].nextType = GLITCH_CITY;
                nSpread[n].spread = true;
                nSpread[n].nextStage = -10;

              }
            }


            break;


            //the city declines if there are not enough resources
            //ie fertile land
          case "cityDecline":
            //if resources are negative cities are unsustainable and decline
            //the first to decline are the ones that are not attracted by the cube
            //and isolated
            if (resources < 0) {

              var edgeN = this.getNeighbors8(CITY, WATER);

              if (this.life == null)
                this.life = CITY_RESILIENCE;

              //leave the 5+neigh alone
              this.life -= max(5 - edgeN.length, 0);

              if (this.life < 0 && random(100) < 30) {
                this.nextType = CONCRETE;
                resources++;
                story.badGrowth.counter++;

              }
            }
            break;

            //stone city attracted to stone cube
          case "cityAttraction":

            if (cubes.white.tile != null && this.stage != -1) {
              if (random(100) < 20) //speed
              {
                //find next position
                var nc = this.c;
                var nr = this.r;

                if (this.c < cubes.white.tile.c)
                  nc++;
                else if (this.c > cubes.white.tile.c)
                  nc--;

                if (this.r < cubes.white.tile.r)
                  nr++;
                else if (this.r > cubes.white.tile.r)
                  nr--;

                if (nc != this.c || nr != this.r) {

                  if (terrain[nr][nc].nextType != CITY)
                    if (terrain[nr][nc].receive(CITY)) {

                    } else
                      this.stage = -1;
                }

              }
            }

            break;



            //concrete ruin creates sludge (oil)
          case "leak":

            var targets = this.getNeighbors4(WATER, OIL);

            if (targets.length > 0)
              if (random(100) < 1) {
                var n = targets[floor(random(0, targets.length))];

                if (n.type == WATER) {
                  n.nextType = OIL;

                  n.nextStage = 5;
                } else
                  n.stage = 5;
                //reinforce pollution

              }
            break;

            //oil spreads on water
          case "oilSpill":

            if (this.stage > 0) {
              var targets = this.getNeighbors4(WATER);

              if (targets.length > 0)
                if (random(100) < 1) {
                  var n = targets[floor(random(0, targets.length))];
                  n.nextType = OIL;
                  n.nextStage = this.stage - 1;
                }
            }
            break;

          case "breakDown":

            this.stage -= OIL_BREAKDOWN;

            if (this.stage < 0) {
              this.nextType = WATER;


            }

            break;

            //oil desertifies land
          case "pollute":

            var targets = this.getNeighbors4(GRASS, FOREST);

            if (targets.length > 0)
              if (random(100) < 10) {
                var n = targets[floor(random(0, targets.length))];
                n.nextType = WASTELAND;
              }

            break;

            //road moves to tile type
          case "connect":

            //state 0 = active / just deployed
            if (this.state == 0) {

              //find city
              //if no path is defined, find the closest destination
              if (this.path == null) {
                //makeGrid
                var terrainGrid = makeGrid([GRASS, WASTELAND, FOREST, WEED, WETLAND, ROAD], [CITY]);
                this.path = findShortestPath([this.r, this.c], terrainGrid);
              }

              //there is a path make next move
              if (this.path.length > 0) {

                var move = this.path[0];

                var t = null
                if (move == "North")
                  t = this.N;
                if (move == "South")
                  t = this.S;
                if (move == "West")
                  t = this.W;
                if (move == "East")
                  t = this.E;

                if (t != null) {
                  //intersection with another road 
                  if (t.type == ROAD) {
                    this.state = 1;
                  }
                  //don't absorb the target
                  else if (this.path.length > 1) {
                    if (t.receive(this.type)) {
                      this.state = 1; //if you can take it stop pathfinding
                    }
                  }

                }

              } else {
                //no path, make a square
                this.state = 1;
              }
            }


            break;

            //road is converted into canal or forest
          case "convert":

            if (this.conversion != null) {
              print(this.type + "Converting to " + this.conversion);

              //spread the same time (flood fill)
              var targets = this.getNeighbors8(this.type);

              for (var i = 0; i < targets.length; i++) {

                targets[i].conversion = this.conversion;
                if (this.conversion == FOREST)
                  this.nextStage = 20; //prevent immediate death
              }

              if (messages.length == 0) {
                if (this.conversion == WATER && story.convertCanal.state == 0) {
                  story.convertCanal.counter++;
                  if (story.convertCanal.counter > 6)
                    storyMessage(story.convertCanal);
                }

                if (this.conversion == FOREST && story.convertForest.state == 0) {
                  story.convertForest.counter++;
                  if (story.convertForest.counter > 6) {
                    storyMessage(story.convertForest);
                    storyMessage(story.convertForest2);
                  }
                }
              }

              this.nextType = this.conversion;
              this.conversion = null;

            }


            break;


            //city develops along road if resources allow it
          case "growAlongRoad":

            //if (resources > 0) {
            var targets = this.getNeighbors8(ROAD);

            if (targets.length > 0) {
              //randomize one
              var t = targets[floor(random(0, targets.length))];

              var roadside = t.getNeighbors8Except(ROAD);

              if (roadside.length > 0) {
                var r = roadside[floor(random(0, roadside.length))];
                r.receive(CITY);

              }
            }
            //}

            break;


            //ruin eventually turns into grass
          case "decay":
            this.stage++;
            if (this.stage > 2) {
              plasticCounter++;
              if (plasticCounter % PLASTIC_FREQUENCY == 0 && plastiglomerates < 16 && turns > 500) {
                this.nextType = PLASTIC;

                if (plastiglomerates == 0)
                  storyMessage(story.plastigromerate);

                //the sequence is shuffled
                var index = plasticSequence[plastiglomerates];

                this.addMarker(plastics[index]);
                this.nextFrame = index;

                //create an area around the plastic
                var area = this.getNeighbors8Except(PLASTIC, WATER, OIL);

                for (var i = 0; i < area.length; i++) {
                  //if(area[i].c<=this.c && area[i].r<=this.r)
                  //area[i].nextType = PLASTIC_AREA;
                  area[i].nextType = GRASS;
                }

                plastiglomerates++;

              } else
                this.nextType = GRASS;
            }
            break;

        } //end switch

      } //end actions 
  }

  //get neighbors8 by type
  this.getNeighbors8 = function() {
    var res = [];

    for (var n = 0; n < this.neighbors8.length; n++) {
      if (this.neighbors8[n].type == arguments[0] || this.neighbors8[n].type == arguments[1] || this.neighbors8[n].type == arguments[2] || this.neighbors8[n].type == arguments[3])
        res.push(this.neighbors8[n]);
    }
    return res;
  }

  //get neighbors8 excluding a type
  this.getNeighbors8Except = function() {
    var res = [];

    for (var n = 0; n < this.neighbors8.length; n++) {
      if (this.neighbors8[n].type != arguments[0] && this.neighbors8[n].type != arguments[1] && this.neighbors8[n].type != arguments[2] && this.neighbors8[n].type != arguments[3])
        res.push(this.neighbors8[n]);
    }
    return res;
  }

  this.getNeighborByDirection = function(d) {

    var res = null;
    if (d == 0 && this.E != null)
      res = this.E;

    if (d == 1 && this.SE != null)
      res = this.SE;

    if (d == 2 && this.S != null)
      res = this.S;

    if (d == 3 && this.SW != null)
      res = this.SW;

    if (d == 4 && this.W != null)
      res = this.W;

    if (d == 5 && this.NW != null)
      res = this.NW;

    if (d == 6 && this.N != null)
      res = this.N;

    if (d == 7 && this.NE != null)
      res = this.NE;

    return res;
  }

  //get neighbors4 by type
  this.getNeighbors4 = function() {
    var res = [];

    for (var n = 0; n < this.neighbors4.length; n++) {
      if (this.neighbors4[n].type == arguments[0] || this.neighbors4[n].type == arguments[1] || this.neighbors4[n].type == arguments[2] || this.neighbors4[n].type == arguments[3]) {
        res.push(this.neighbors4[n]);
      }
    }
    return res;
  }

  //get neighbors4 by type
  this.getNeighbors4Except = function() {
    var res = [];

    for (var n = 0; n < this.neighbors4.length; n++) {
      if (this.neighbors4[n].type != arguments[0] && this.neighbors4[n].type != arguments[1] && this.neighbors4[n].type != arguments[2] && this.neighbors4[n].type != arguments[3])
        if (this.neighbors4[n].nextType != arguments[0] && this.neighbors4[n].nextType != arguments[1] && this.neighbors4[n].nextType != arguments[2] && this.neighbors4[n].nextType != arguments[3]) {
          res.push(this.neighbors4[n]);
        }
    }
    return res;
  }

  this.receive = function(otherType, instant) {

    var result = false;
    var action = ecology.getRow(this.type).getString(id[otherType]);

    switch (action) {
      //take ove current
      case "take":
        this.nextType = otherType;
        result = true;
        break;


      case "takeGlitch":
        this.nextType = otherType;

        this.spread = true;
        result = true;

        break;

        //destroys city but doesn't take it over
      case "damage":
        this.nextType = CONCRETE;
        break;

      case "move":

        //destroy all the previous cubes
        for (var r = 0; r < ROWS; r++)
          for (var c = 0; c < COLS; c++) {
            //is concrete
            if (terrain[r][c].type == otherType) {
              terrain[r][c].nextType = terrain[r][c].previousType;

            }
          }

        this.nextType = otherType;
        result = true;
        break;

      case "moveStone":

        //destroy all the previous cubes
        for (var r = 0; r < ROWS; r++)
          for (var c = 0; c < COLS; c++) {
            //is stone
            if (terrain[r][c].type == otherType) {
              terrain[r][c].baseSprite = null;
              terrain[r][c].nextType = terrain[r][c].previousType;
              //is city reset the competition
            }

          }


        this.baseSprite = "flooring_22";
        this.nextType = otherType;
        result = true;

        if (story.intro.state != 0) {
          //wait for next move to avoid overlaps
          if (story.stoneCube.state == 0) {
            storyMessage(story.stoneCube);
            storyMessage(story.stoneCube2);
          }

        }

        break;

      case "moveBlack":

        //destroy all the previous cubes turn weed into grass
        for (var r = 0; r < ROWS; r++)
          for (var c = 0; c < COLS; c++) {
            //is concrete
            if (terrain[r][c].type == BLACK_CUBE) {
              terrain[r][c].changeType(WASTELAND);
              terrain[r][c].baseSprite = null;
            }
          }

        this.baseSprite = "ground_30";
        this.changeType(BLACK_CUBE);
        this.stage = 0;
        result = true;

        break;



      case "moveWhite":

        //destroy all the previous cubes turn weed into grass
        for (var r = 0; r < ROWS; r++)
          for (var c = 0; c < COLS; c++) {
            //is concrete
            if (terrain[r][c].type == WHITE_CUBE) {
              terrain[r][c].changeType(terrain[r][c].previousType);
              terrain[r][c].baseSprite = null;
            }
            if (terrain[r][c].type == CITY || terrain[r][c].type == GLITCH_CITY) {
              terrain[r][c].stage = 1;
            }

            terrain[r][c].contagion = null;
          }

        this.baseSprite = this.sprite[this.frame];
        this.changeType(WHITE_CUBE);
        //this.changeType(ROAD);

        result = true;

        //don't mention lichenia before introducing it
        if (messages.length == 0 && story.stoneCube2.state == -1) {
          storyMessage(story.whiteCube);
          storyMessage(story.whiteCube2);
        }


        break;


      case "moveRoad":

        this.changeType(ROAD);
        result = true;

        if (messages.length == 0) { // && story.stoneCube2.state == -1) {
        }

        break;

      case "moveGreen":

        //destroy all the previous cubes turn weed into grass
        for (var r = 0; r < ROWS; r++)
          for (var c = 0; c < COLS; c++) {
            //is concrete
            if (terrain[r][c].type == GREEN_CUBE) {
              terrain[r][c].changeType(terrain[r][c].previousType);
              terrain[r][c].baseSprite = null;
            }

            if (terrain[r][c].type == WEED || terrain[r][c].nextType == WEED) {
              terrain[r][c].stage = -1;
            }
          }

        this.baseSprite = this.sprite[this.frame];
        this.changeType(GREEN_CUBE);
        result = true;

        if (story.intro.state != 0) {
          //print(messages.length);
          if (story.greenCube.state == 0 && messages.length == 0) {
            storyMessage(story.greenCube);
            storyMessage(story.greenCube2);
          }

          if (story.greenCube2.state != 0 && messages.length == 0) {
            storyMessage(story.greenCube3);
          }
        }

        break;

        //move blue or green on road, convert them to canals or forest
      case "convertToWater":
        this.conversion = WATER;
        break;

      case "convertToForest":
        this.conversion = FOREST;
        break;


      case "createWetland":

        //destroy all the previous cubes 
        for (var r = 0; r < ROWS; r++)
          for (var c = 0; c < COLS; c++) {
            //is concrete
            if (terrain[r][c].type == GREEN_CUBE) {
              terrain[r][c].changeType(terrain[r][c].previousType);
              terrain[r][c].baseSprite = null;

            }
          }

        //find the closest land
        var found = null;

        for (var r = 0; r < 10 && found == null; r++) {
          var targets = getCircle(this.c, this.r, r);
          for (var i = 0; i < targets.length; i++) {
            //found land
            if (targets[i].type != WATER && targets[i].type != OIL && targets[i].type != WETLAND) {
              found = targets[i];
            }
          }
        }

        if (found) {
          found.changeType(WETLAND);
          result = true;
          this.dissolveCube();

          if (messages.length == 0) {
            storyMessage(story.wetlands);
          }
        }

        break;



      case "moveOnGlitch":
        //remove previous
        if (cubes.glitch.tile != null) {
          cubes.glitch.tile.nextType = terrain[r][c].previousType;
          cubes.glitch.tile.baseSprite = null;
        }

        if (currentCube != null) {
          //creates a variable that creates a chain reaction
          //awkward but
          if (currentCube.id == STONE_CUBE) {
            this.contagion = CITY;
          } else if (currentCube.id == GREEN_CUBE) {
            this.contagion = GRASS;
          } else if (currentCube.id == BLACK_CUBE) {
            this.contagion = BLACK_BURN;
          } else if (currentCube.id == WHITE_CUBE) {
            this.contagion = WASTELAND;
          } else if (currentCube.id == BLUE_CUBE) {
            this.contagion = WATER;
          }
        }

        result = true;

        break;


      case "moveGlitch":

        if (cubes.glitch.tile != null) {
          cubes.glitch.tile.nextType = terrain[r][c].previousType;
          cubes.glitch.tile.baseSprite = null;
        }

        if (this.type == CITY)
          this.conversion = GLITCH_CITY;
        else {

          this.baseSprite = this.sprite[this.frame];
          this.nextType = GLITCH_CUBE;

        }

        result = true;

        if (story.intro.state != 0) {
          if (story.glitchCube.state == 0 && messages.length == 0) {
            storyMessage(story.glitchCube);
            storyMessage(story.glitchCube2);
          }
        }

        break;


      case "moveBlue":
        //var count = 0;

        //destroy all the previous cubes and unmark the water
        for (var r = 0; r < ROWS; r++)
          for (var c = 0; c < COLS; c++) {
            terrain[r][c].movedWater = "";

            if (terrain[r][c].type == BLUE_CUBE && messages.length == 0) {
              terrain[r][c].nextType = terrain[r][c].previousType;
              terrain[r][c].baseSprite = null;
            }
          }

        this.baseSprite = "blocks_18";
        this.nextType = BLUE_CUBE;
        result = true;

        if (story.intro.state != 0) {
          if (story.blueCube.state == 0 && messages.length == 0) {
            storyMessage(story.blueCube);
            storyMessage(story.blueCube2);
          }

          if (story.blueCube2.state != 0 && messages.length == 0) {
            storyMessage(story.blueCube3);
          }
        }

        break;

        //turn into ruin tile grassy ruins
      case "toRuin":
        this.nextType = RUIN;
        result = true;
        break;

      case "activate":
        result = true;
        break;
    }

    if (instant)
      this.stateChange();

    return result;
  }

  this.addMarker = function(msg) {

    if (this.marker != null)
      this.marker.remove();

    //if there is a message marker shows up
    var m = createSprite(this.x + TILE_W / 2 - MARKER / 2 - 10, this.y - TILE_H);
    m.message = msg;

    m.draw = function() {

      var s = map(sin(time), 0, 1, -30, -20);

      //override my shit since it doesn't fucking work
      if (mousePosition.x > this.position.x - TILE_W / 2 && mousePosition.x < this.position.x + TILE_W / 2 &&
        mousePosition.y > this.position.y - MARKER && mousePosition.y < this.position.y + MARKER / 2 + TILE_H) {
        image(graphics.markerRoll, 0, s, MARKER, MARKER);

        messageCounter = 0;

        if (mouseWentDown(LEFT)) {
          newMessage(this.message);
          this.remove();
        }


      } else {
        image(graphics.marker, 0, s, MARKER, MARKER);
      }
    }

    markerGroup.add(m);
    this.marker = m;

  }


  this.isOffScreen = function() {
    var dx = abs(camera.position.x - this.x);
    var dy = abs(camera.position.y - this.y);

    return (dy * camera.zoom > height / 2) || (dx * camera.zoom > width / 2);
  }

  this.dissolveCube = function() {
    //dissolve
    this.dissolve = dissolve.getLastFrame() * dissolve.frameDelay;
  }

  this.heatEffect = function() {

    for (var i = 0; i < 10; i++) {
      var dy, my;
      var dx = random(-TILE_W, TILE_W);

      //max y to look iso
      if (dx < 0)
        my = map(dx, -TILE_W, 0, 0, TILE_H);
      else
        my = map(dx, 0, TILE_W, 0, TILE_H);

      var dy = random(-my, my);

      var s = createSprite(this.x + dx, this.y + dy);
      //s.velocity.x = random(-5, 5);
      s.velocity.y = random(0, -1);
      //s.addImage(heat);
      s.life = floor(random(20, 40));
      s.pix = floor(random(1, 4));

      s.draw = function() {
        //stroke(floor(random(220, 240)));
        stroke(255);
        point(0, 0);
        if (this.pix > 1)
          point(0, 1);
        if (this.pix > 2)
          point(0, 2);

        this.velocity.y -= 0.1;
      }

      heatGroup.add(s);
    }

  }

}