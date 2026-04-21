const express = require("express");
const app = express();
app.use(express.static("public"));
const expressServer = app.listen(8080, () => {
  console.log("Server running at http://localhost:8080/");
});
const level1Arr = [
  { clue: "I start with A and keep doctors away", name: "Apple" },
  { clue: "I start with B and buzz around flowers", name: "Bee" },
  { clue: "I start with C and say 'meow'", name: "Cat" },
  { clue: "I start with D and love to bark", name: "Dog" },
  { clue: "I start with E and have big ears and a trunk", name: "Elephant" },
  { clue: "I start with F and have fins", name: "Fish" },
  { clue: "I start with G and love to climb trees", name: "Goat" },
  { clue: "I start with H and build dams in rivers", name: "Hippo" },
  { clue: "I start with I and can be cold and frozen", name: "Ice" },
  { clue: "I start with J and bounce very high", name: "Jelly" },
  { clue: "I start with K and am Australia's hopper", name: "Kangaroo" },
  { clue: "I start with L and roar loudly", name: "Lion" },
  { clue: "I start with M and love cheese", name: "Mouse" },
  { clue: "I start with N and go on your neck when it is cold", name: "Necklace" },
  { clue: "I start with O and live in the sea with eight arms", name: "Octopus" },
  { clue: "I start with P and can be a flying insect", name: "Penguin" },
  { clue: "I start with Q and am a bird that quacks", name: "Quail" },
  { clue: "I start with R and can be a jungle king", name: "Rabbit" },
  { clue: "I start with S and have a shell on my back", name: "Snail" },
  { clue: "I start with T and am a large reptile", name: "Tiger" },
  { clue: "I start with U and have feathers and can fly", name: "Unicorn" },
  { clue: "I start with V and have a colorful tail", name: "Vulture" },
  { clue: "I start with W and am a type of wild cat", name: "Wolf" },
  { clue: "I start with X and am a letter in the alphabet", name: "Xenon" },
  { clue: "I start with Y and am yellow", name: "Yak" },
  { clue: "I start with Z and I move in a zigzag", name: "Zebra" }
];

const level2Arr = [
  { clue: "What barks and loves to play fetch?", name: "Dog" },
  { clue: "What purrs and loves to chase things?", name: "Cat" },
  { clue: "What has two wheels and you ride it?", name: "Bicycle" },
  { clue: "What round thing do you kick or throw?", name: "Ball" },

  { clue: "What do you sit on?", name: "Chair" },
  { clue: "What do you put your food on?", name: "Table" },
  { clue: "Where do you sleep at night?", name: "Bed" },
  { clue: "What makes light when it is dark?", name: "Lamp" },
  { clue: "What do you wear on your feet?", name: "Shoes" },
  { clue: "What do you watch cartoons on?", name: "TV" },
  { clue: "What do you read to learn new things?", name: "Book" },
  { clue: "What do you lay your head on while sleeping?", name: "Pillow" },
  { clue: "What floats in the air and is colorful at parties?", name: "Balloon" },
  { clue: "What stuffed animal do you hug when you're feeling sleepy?", name: "Teddy Bear" },
  { clue: "What do you use to stay dry when it rains?", name: "Umbrella" },
  { clue: "What do you use to write or draw on paper?", name: "Pen" },
  { clue: "What tells you what time it is?", name: "Clock" },
  { clue: "What do you wear on your feet inside shoes?", name: "Socks" },
  { clue: "What do you drink from when you have juice or milk?", name: "Cup" },
  { clue: "What do you use to clean your teeth?", name: "Toothbrush" },
  { clue: "What do you use to cut paper or fabric?", name: "Scissors" },
  { clue: "What do you write in during school?", name: "Notebook" },
  { clue: "What do you carry your books and lunch in?", name: "Backpack" },
  { clue: "What do you use to unlock doors?", name: "Key" },
  { clue: "What do you use to cool yourself when it is hot?", name: "Fan" },
  { clue: "What do you use to sweep the floor?", name: "Broom" },
  { clue: "What do you use to eat soup?", name: "Spoon" },
  { clue: "What do you use to eat pasta or salad?", name: "Fork" },
  { clue: "What do you use to cut food?", name: "Knife" },
  { clue: "What do you use to call someone or text them?", name: "Phone" },
  { clue: "What do you use to play games or do school work online?", name: "Computer" },
  { clue: "What do you watch cartoons and movies on?", name: "Television" },
  { clue: "What do you wear on your head when riding a bike?", name: "Helmet" },
  { clue: "What do you wear on your hands when it is cold?", name: "Glove" },
  { clue: "What do you use to dig in the garden or sand?", name: "Shovel" },
  { clue: "What do you drink from when you are thirsty?", name: "Water Bottle" },
  { clue: "What do you use to comb your hair?", name: "Brush" },
  { clue: "What musical instrument has strings you pluck to make music?", name: "Guitar" },
  { clue: "What do you pop to make a loud sound at a party?", name: "Balloon" },
  { clue: "What helps you find places when you are traveling?", name: "Map" },
  { clue: "What do you use to attach papers together?", name: "Stapler" },
  { clue: "What do you use to write or draw that you can erase?", name: "Pencil" },
  { clue: "What do you use to see in the dark?", name: "Flashlight" }
];


const socketio = require("socket.io");
const io = socketio(expressServer);

let users = [];
let roomno = 1;

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);
  socket.emit("welcome");

  socket.on("add", (user) => {
    socket.user = user;
    users.push(socket);

    if (users.length < 2) {
      socket.emit("wait", "Waiting for an opponent...");
    } else {
      const p1 = users.shift();
      const p2 = users.shift();

      console.log(`Match Found: ${p1.user} vs ${p2.user}`);
      p1.emit("match_found", p2.user);
      p2.emit("match_found", p1.user);

      const room = roomno++;
      p1.join(room);
      p2.join(room);

      // Score sharing
      p1.on("score", (data) => p2.emit("oscore", data));
      p2.on("score", (data) => p1.emit("oscore", data));

      // Generate unique question indices
      const totalQuestions = Math.min(p1.level || 5, p2.level || 5); // fallback to level 1 count
      const levelArr = (totalQuestions === 5) ? level1Arr : level2Arr;
      const n = levelArr.length;

      // Generate unique question indices
      const usedCorrectIndices = new Set();
      while (usedCorrectIndices.size < totalQuestions) {
        usedCorrectIndices.add(Math.floor(Math.random() * n));
      }
      const correctIndices = [...usedCorrectIndices];

      for (let x = 0; x <= totalQuestions; x++) {
        setTimeout(() => {
          if (x === totalQuestions) {
            p1.emit("result");
            p2.emit("result");
          } else {
            const correctIndex = correctIndices[x];
            let optionIndices = new Set([correctIndex]);
            while (optionIndices.size < 4) {
              optionIndices.add(Math.floor(Math.random() * n));
            }
            const options = [...optionIndices].map(i => levelArr[i].name);
            const clue = levelArr[correctIndex].clue;

            io.to(room).emit("quiz", { clue, options });
          }
        }, x * 10000);
      }
    }
  });

  // Level selection
  socket.on("level", (data) => {
    socket.level = data;
  });

  // Handle when a player explicitly leaves
  socket.on("exit_game", (username) => {
    console.log(`${username} has exited the game.`);

    const opponent = users.find(u => u.user !== username); // Find opponent
    if (opponent) {
      // Notify the opponent that the challenger ran away
      opponent.emit("challenger_left", "Your Challenger Ran Away, You Won!");
    }

    // Remove player from the game
    users = users.filter(s => s !== socket);
  });

  // Handle unexpected disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user}`);
    users = users.filter(s => s !== socket);

    // If opponent exists, notify them
    const opponent = users.find(u => u.user !== socket.user);
    if (opponent) {
      opponent.emit("challenger_left", "Your Challenger Ran Away, You Won!");
    }
  });
});
