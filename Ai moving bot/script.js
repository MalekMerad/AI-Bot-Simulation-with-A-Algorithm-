const mazeDisplay = document.getElementById("maze-container");

let height, width, selectedType, savedCords;
const spaceHeight = 45;
const spaceWidth = 45;

const waterSpace = {
    type: "water",
    Image: "<img src='sea.png' class='type-img'>",
    state: "unvisited",
    EnergyTaken: 15
};

const sandSpace = {
    type: "sand",
    Image: "<img src='technology.png' class='type-img'>",
    state: "unvisited",
    EnergyTaken: 20
};

const emptySpace = {
    type: "empty",
    Image: "<img src='street.png' class='type-img'>",
    state: "unvisited",
    EnergyTaken: 5
};

const wallSpace = {
    type: "wall",
    Image: "<img src='wall.png' class='type-img'>",
    state: "unvisited"
};

const grassSpace = {
    type: "grass",
    Image: "<img src='grass.png' class='type-img'>",
    state: "unvisited",
    EnergyTaken: 10
};

const finalSpace = {
    type: "final",
    Image: "<img src='gps.png' class='type-img'>",
    state: "unvisited"
};

const bot = {
    cordX: 0,
    cordY: 0,
    battery: 100,
    type: "bot",
    Image: "<img src='chatbot.png' class='type-img'>",
    path: []
};

const types = [emptySpace, sandSpace,waterSpace, wallSpace, grassSpace];

const continueButton = document.createElement("button");
const controlButtons = document.createElement("div");
continueButton.textContent = "Start simulation";
continueButton.classList.add("button-17");
const resetButton = document.createElement("button");
resetButton.textContent = "Reset maze";
resetButton.classList.add("button-17");
const title = document.createElement("h1");
title.textContent = "Maze Dimensions";
const mazeHeight = document.createElement("input");
const mazeWidth = document.createElement("input");
mazeHeight.classList.add("dimension-input");
mazeHeight.placeholder = "Maze Height";
mazeWidth.placeholder = "Maze Width";
mazeWidth.classList.add("dimension-input");
const DimensionsContainer = document.createElement("div");
DimensionsContainer.classList.add("Dimens-container");
const submitButton = document.createElement("button");
submitButton.textContent = "submit";
submitButton.classList.add("button-17");
DimensionsContainer.appendChild(title);
DimensionsContainer.appendChild(mazeHeight);
DimensionsContainer.appendChild(mazeWidth);
DimensionsContainer.appendChild(submitButton);
controlButtons.appendChild(continueButton);
controlButtons.appendChild(resetButton);

const batteryContainer = document.createElement("div");
batteryContainer.classList.add("battery")
const batteryLevel = document.createElement("div");
batteryLevel.classList.add("battery-level");
const batteryPercentage = document.createElement("p");
batteryContainer.appendChild(batteryLevel);
batteryLevel.appendChild(batteryPercentage);

batteryPercentage.textContent = `Battery: ${bot.battery}%`;
document.body.appendChild(batteryContainer);

controlButtons.classList.add("displa-btn");

const sideMenu = document.createElement("div");
const menuTitle = document.createElement("h1");
menuTitle.textContent = "Build Your maze";
sideMenu.classList.add("side-menu");
const typesList = document.createElement("ul");
typesList.classList.add("types-list");
typesList.appendChild(menuTitle);

types.forEach((type) => {
    const listItem = document.createElement("li");
    listItem.textContent = type.type;
    listItem.innerHTML = type.Image;
    listItem.addEventListener("click", () => {
        selectedType = type;
    });
    typesList.appendChild(listItem);
});

sideMenu.appendChild(typesList);

document.body.append(DimensionsContainer);

const getTypeOfSpace = () => {
    const index = Math.floor(Math.random() * types.length);
    return types[index];
};

const createMaze = () => {
    const maze = [];

    for (let i = 0; i < height; i++) {
        const row = [];
        for (let j = 0; j < width; j++) {
            const space = {
                cordX: i,
                cordY: j,
                type: emptySpace,
                EnergyTaken :emptySpace.EnergyTaken
            };
            row.push(space);
        }
        maze.push(row);
    }
    return maze;
};

const manhattan = (s1, s2) => {
    const x1 = s1.cordX !== undefined ? s1.cordX : s1.row;
    const y1 = s1.cordY !== undefined ? s1.cordY : s1.column;
    const x2 = s2.cordX !== undefined ? s2.cordX : s2.row;
    const y2 = s2.cordY !== undefined ? s2.cordY : s2.column;

    console.log(`s1 coordinates: X: ${x1}, Y: ${y1}`);
    console.log(`s2 coordinates: X: ${x2}, Y: ${y2}`);

    if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
        console.log(`Warning: Coordinates are undefined for s1: `, s1, `and s2: `, s2);
        return Infinity;
    }

    return Math.abs(x2 - x1) + Math.abs(y2 - y1) + 1;
};

let maze;
let neighborSpaces = []
let destination;
let path = [];

const nextStep = (space, spaceFinal, n) => {
    if (
        space &&
        space.type !== wallSpace &&
        space.state !== "visited"
    ) {
        if (space.cordX === undefined || space.cordY === undefined) {
            console.log(`Warning: CordX or CordY is undefined for space: `, space);
        }

        if (spaceFinal.row === undefined || spaceFinal.column === undefined) {
            console.log(`Warning: Row or Column is undefined for spaceFinal: `, spaceFinal);
        }

        // Check if the current space is water and one of its neighbors is water
        if (space.type === waterSpace) {
            const neighbors = [
                { x: space.cordX - 1, y: space.cordY },
                { x: space.cordX, y: space.cordY - 1 },
                { x: space.cordX, y: space.cordY + 1 },
                { x: space.cordX + 1, y: space.cordY }
            ];

            for (const neighbor of neighbors) {
                if (neighbor.x >= 0 && neighbor.x < height && neighbor.y >= 0 && neighbor.y < width) {
                    const neighborSpace = maze[neighbor.x][neighbor.y];
                    if (neighborSpace.type === waterSpace) {
                        neighborSpace.state = "visited"; 
                        /* If the neighbor is a water space it will be visited so I ensure 
                                        it wont be added as neighbor ever*/
                    }
                }
            }
        }
        const neighbor = {
            neighborNumber: n,
            distance: manhattan(space, spaceFinal),
        };
        neighborSpaces.push(neighbor);
        return true;
    }
    return false;
};


const moveBot = (botLocation) => {
    console.log("\n--------------------------\n");
    console.log(`bot current location: X: ${botLocation.cordX} || Y: ${botLocation.cordY}`);
    const currentSpace = maze[botLocation.cordX][botLocation.cordY];
    currentSpace.state = "visited";

    if (botLocation.cordX === destination.row && botLocation.cordY === destination.column) {
        console.log("Destination reached!");
        return;
    }

    neighborSpaces = [];
     console.log(` the energy taken is : ${currentSpace.EnergyTaken}`);
    updateBattery(currentSpace.EnergyTaken); // Update the battery peracantage
    console.log(`current Bot Battery : ${bot.battery}`);

    if (bot.battery <= 20) {
        batteryContainer.style.backgroundColor = "red";
    }

    savedCords = botLocation; // Saving the bot currentPosition 

    if (bot.battery <= 0) {
        console.log("Bot is recharging...");
        setTimeout(() => {
            bot.battery = 100;
            batteryContainer.style.backgroundColor = "green";
            moveBot(savedCords);
        }, 2000);
        return;
    }

    if (botLocation.cordX - 1 >= 0) {
        if (nextStep(maze[botLocation.cordX - 1][botLocation.cordY], destination, 1)) {
            console.log(`the space 1 is added with the cords ${botLocation.cordX - 1} || ${botLocation.cordY}`);
        }
    } else {
        console.log(`enable to add neighobr 1 with cords X: ${botLocation.cordX - 1} Y: ${botLocation.cordY}`)
    }

    if (botLocation.cordY - 1 >= 0) {
        if (nextStep(maze[botLocation.cordX][botLocation.cordY - 1], destination, 2)) {
            console.log(`the space 2 is added with the cords ${botLocation.cordX} || ${botLocation.cordY - 1}`);
        }
    } else {
        console.log(`enable to add neighbor 2 with the cords X: ${botLocation.cordX} Y: ${botLocation.cordY - 1}`)
    }

    if (botLocation.cordY < width) {
        if (nextStep(maze[botLocation.cordX][botLocation.cordY + 1], destination, 3)) {
            console.log(`the space 3 is added with the cords X: ${botLocation.cordX} || Y: ${botLocation.cordY + 1}`);
        }
    } else {
        console.log(`enable to add the neighbor 3 with the cords X: ${botLocation.cordX} Y: ${botLocation.cordY + 1}`);
    }

    if (botLocation.cordX + 1 < height) {
        if (nextStep(maze[botLocation.cordX + 1][botLocation.cordY], destination, 4)) {
            console.log(`the space 4 is added with the cords ${botLocation.cordX + 1} || ${botLocation.cordY}`);
        }
    } else {
        console.log(`enable to add the neighbor 4 with the cords X: ${botLocation.cordX + 1} Y: ${botLocation.cordY}`);
    }

    if (neighborSpaces.length > 0) {

        console.log(`available neighbors : ${neighborSpaces.length}`);

        neighborSpaces.sort((a, b) => a.distance - b.distance);

        console.log("---------------------The current neighbors---------------")
        neighborSpaces.forEach((neighbor) => {
            console.log(`neighbor number ${neighbor.neighborNumber} current Distance ${neighbor.distance}\n`);
        })

        const nextSpaceNumber = neighborSpaces[0].neighborNumber;

        switch (nextSpaceNumber) {
            case 1:
                botLocation.cordX--;
                break;
            case 2:
                botLocation.cordY--;
                break;
            case 3:
                botLocation.cordY++;
                break;
            case 4:
                botLocation.cordX++;
                break;
        }

        bot.path.push({ cordX: botLocation.cordX, cordY: botLocation.cordY });
        displayMaze(); 
        setTimeout(()=>moveBot(botLocation),500);
    } else {
        console.log("No neighbors were located");
    }
};

const displayMatrice = () => {
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            const space = maze[i][j];
            console.log(
                `[${i}][${j}] - Type: ${space.type.type || space.type}, Coords: (${space.cordX}, ${space.cordY})
                 Energy Taken ${space.EnergyTaken}`
            );
        }
    }
};

const getSpaceType = (row, column) => {
    return maze[row][column].type;
};

const getRandomEmptySpace = () => {
    let row = -1,
        column = -1;
    do {
        row = Math.floor(Math.random() * height);
        column = Math.floor(Math.random() * width);
    } while (maze[row][column].type !== emptySpace);

    return { row, column };
};

const displayMaze = () => {
    mazeDisplay.innerHTML = "";

    for (let i = 0; i < height; i++) {
        const row = document.createElement("div");
        row.classList.add("maze-row");
        for (let j = 0; j < width; j++) {
            let space = document.createElement("div");
            space.classList.add("maze-space");
            space.style.width = spaceWidth + "px";
            space.style.height = spaceHeight + "px";

            const spaceType = getSpaceType(i, j);
            const spaceElement = document.createElement("div");

            spaceElement.innerHTML = spaceType.Image;

            space.appendChild(spaceElement);
            row.appendChild(space);

            space.addEventListener("click", () => {
                if (selectedType && spaceType.type === emptySpace.type) {
                    maze[i][j].type = selectedType;
                    maze[i][j].Image = selectedType.Image;
                    spaceElement.innerHTML = selectedType.Image;
                    displayMatrice();
                }
            });
        }
        mazeDisplay.appendChild(row);
    }

    maze.forEach((row, i) => {
        row.forEach((space, j) => {
            const spaceType = space.type;
            const spaceElement = mazeDisplay.children[i].children[j].children[0];

            if (spaceType.type === bot.type) {
                spaceType.Image = bot.Image;
            } else if (spaceType.type === finalSpace.type) {
                spaceElement.innerHTML = finalSpace.Image;
            }
        });
    });

    bot.path.forEach((coords) => {
        const { cordX, cordY } = coords;
        const spaceElement = mazeDisplay.children[cordX].children[cordY].children[0];
        spaceElement.style.backgroundColor = "orange";
    });
};

submitButton.addEventListener("click", () => {
    height = parseInt(mazeHeight.value);
    width = parseInt(mazeWidth.value);
    DimensionsContainer.style.left = -500 + "px";
    maze = createMaze();

    document.body.appendChild(sideMenu);
    document.body.appendChild(controlButtons);
    displayMatrice();
    displayMaze();
});

resetButton.addEventListener("click", () => {
    path = [];
    batteryContainer.style.display = "none";
    bot.battery = 100;
    sideMenu.style.left = "0";
    mazeDisplay.innerHTML = "";
    maze = createMaze();
    displayMatrice();
    displayMaze();
});

continueButton.addEventListener("click", () => {
    console.log("\n\n================New Simulation================ ")
    sideMenu.style.left = "-500px";
    batteryContainer.style.display = "block";
    maze.forEach((row, i) => {
        row.forEach((space, j) => {
            const spaceType = space.type;
            const spaceElement = mazeDisplay.children[i].children[j].children[0];

            if (spaceType.type !== emptySpace.type) {
                maze[i][j].type = spaceType;
            }
        });
    });

    destination = getRandomEmptySpace();
    maze[destination.row][destination.column].type = finalSpace;

    const botCoords = getRandomEmptySpace();
    savedCords = botCoords;
    bot.cordX = botCoords.row;
    bot.cordY = botCoords.column;
    maze[botCoords.row][botCoords.column].type = bot;

    bot.path = [];
    bot.battery = 100;
    console.log("\n------------ the final matrice of the maze ----------------------\n");
    displayMatrice();
    displayMaze();
    moveBot(bot);
});

const updateBattery = (percentage) => {
    console.log(`Received percentage: ${percentage}`);
    
    if (!isNaN(percentage)) {
        const energyTaken = percentage;
        bot.battery -= energyTaken;
        batteryPercentage.textContent = `Battery: ${bot.battery}%`;
    } else {
        console.error(`Error: EnergyTaken is not a valid number - ${percentage}`);
    }
};

const randomButton = document.createElement("button");
randomButton.classList.add("button-17");
controlButtons.appendChild(randomButton);
randomButton.textContent = "Generate random maze";

randomButton.addEventListener("click",()=>{
    maze = createRandomMaze();
    displayMatrice();
    displayMaze();
})

const createRandomMaze = () => {
    const maze = [];

    for (let i = 0; i < height; i++) {
        const row = [];
        for (let j = 0; j < width; j++) {
            let space;
            const rand = Math.random() * 100; // Random number between 0 and 100

            if (rand <= 70) {
                space = {
                    cordX: i,
                    cordY: j,
                    type: emptySpace,
                    EnergyTaken: emptySpace.EnergyTaken,
                };
            } else {
                // Choose a random index from the types array (excluding emptySpace)
                const randomIndex = Math.floor(Math.random() * (types.length - 1)) + 1;
                space = {
                    cordX: i,
                    cordY: j,
                    type: types[randomIndex],
                    EnergyTaken: types[randomIndex].EnergyTaken,
                };
            }

            row.push(space);
        }
        maze.push(row);
    }
    return maze;
};



