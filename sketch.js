let ctx, canvas;
let interval;

window.onload = function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.fillStyle = '#aaa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateValue(source, target) {
    source = source.srcElement;
    target = `${source.id}-count`;
    document.getElementById(target).innerHTML = source.value;
}

function startSim() {
    console.log("Starting simulation...");
    clearInterval(interval);
    let size = document.getElementById('size').value;
    let empty = document.getElementById('empty-percentage').value;
    let populations = document.getElementById('populations').value;
    let unbiasedPopulation = document.getElementById('unbiased-toggle').checked;
    let outline = document.getElementById('outline-toggle').checked;
    let iterations = document.getElementById('iterations').value;
    let speed = document.getElementById('speed').value;
    runSim(size, empty/100, populations, unbiasedPopulation, outline, iterations, speed);
}

function runSim(size, empty, populations, unbiasedPopulation, outline, iterations, speed) {
    let sim = new Sim(size, empty, populations, unbiasedPopulation);
    sim.drawGrid();
    let i = 0;
    document.getElementById('play-arrow').innerHTML = "restart_alt";
    interval = setInterval(() => {
        if (sim.iterate() && i <= iterations) {
            sim.drawGrid();
            i++;
        } else {
            if (outline) {
                sim.drawFinal();
            }
            document.getElementById('play-arrow').innerHTML = "play_arrow";
            console.log("Done!");
            clearInterval(interval);
        }
    }, speed);
}