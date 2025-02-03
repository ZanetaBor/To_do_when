const colors = require('colors');
const parseArgs = require('minimist');
const fs = require('fs');

// Parse command line arguments
const command = parseArgs(process.argv.slice(2, 3));
delete command._;
console.log(command);


const handleTasks = (option, title) => {

    //import the contents of a file
    const data = fs.readFileSync('tasks.json');
    let tasks = JSON.parse(data);
    console.log(tasks);

    // if task.title exist
    if (option == "add" || option == "remove") {
        const isExist = tasks.find(task => task.title === title) ? true : false;
        if (option == "add" && isExist) {
            return console.log("The task exists");
        } else if (option == "remove" && !isExist) {
            return console.log("The task is not exists");
        }
    }

    let dataJSON = " "
    switch (option) {
        case "add":
            
            dataJSON = JSON.stringify({
                id: Date.now(), 
                title: title, 
                dateAdded: new Date().toISOString(), 
                completed: false 
            });
            tasks.push({ dataJSON })
            fs.writeFileSync('tasks.json', dataJSON);
            console.log(`Task added: ${title}`.white.bgGreen);
            break;

        case "remove":
            const indexToRemove = tasks.findIndex(task => task.title === title);
            if (indexToRemove === -1) {
                console.log("The task is not exists".white.bgRed);
            } else {
                const removedTask = tasks[indexToRemove];
                tasks.splice(indexToRemove, 1);

                // Update ID
                tasks.forEach((task, index) => {
                    task.id = index + 1;
                });

                const dataJSON = JSON.stringify(tasks);
                fs.writeFileSync('tasks.json', dataJSON);
                console.log(`Task deleted: ${removedTask.title}`.white.bgGreen);
            }     
            break;

        case "list":
            if (tasks.length > 0) {
                console.log(`Number of tasks on the list:: ${tasks.length}.`.white.bgBlue);
                tasks.forEach(task => {
                    return console.log(`- ${task.title}`)
                });
            } else {
                console.log("You have no more tasks to do".white.bgBlue);
            }
            break;
        default:
            console.log("Invalid option");
    }
}

// Function execute app.js file.
const handleCommand = ({ add, remove, list }) => {
    if (add) {
        if (typeof add !== "string") {
            return console.log("text require".red)
        }
        handleTasks("add", add);
    } else if (remove) {
        handleTasks("remove", remove);
    } else if (list || list === " ") {
        handleTasks("list", null);
    } else {
        console.log("wrong commend".white.bgRed);
    }
}
handleCommand(command);