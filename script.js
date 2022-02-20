#!/usr/bin/env node

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const canvas = createCanvas(780, 800, "pdf");
const ctx = canvas.getContext("2d");

locations = {
	//"Location": [[[X, Y]...], "textAlign", "textColor", [labelStartOffsetX, labelStartOffsetY]],

	LJoystick: [
		[
			[80, 115],
			[80, 120],
			[280, 120],
		],
		"left",
		"black",
		[-70, -10],
	],
	RJoystick: [
		[
			[700, 225],
			[700, 230],
			[500, 230],
			[463, 195],
		],
		"right",
		"black",
		[60, -10],
	],

	LBumper: [
		[
			[360, 35],
			[360, 40],
			[300, 61],
		],
		"right",
		"black",
		[20, -10],
	],
	RBumper: [
		[
			[440, 35],
			[440, 40],
			[500, 64],
		],
		"left",
		"black",
		[-20, -10],
	],

	LTrigger: [
		[
			[60, 55],
			[60, 60],
			[275, 63],
		],
		"left",
		"black",
		[-50, -10],
	],
	RTrigger: [
		[
			[700, 60],
			[520, 64],
		],
		"right",
		"black",
		[50, -10],
	],

	DPadUp: [
		[
			[80, 165],
			[80, 170],
			[340, 170],
		],
		"left",
		"black",
		[-70, -10],
	],
	DPadDown: [
		[
			[80, 270],
			[80, 275],
			[290, 275],
			[340, 220],
		],
		"left",
		"black",
		[-70, -10],
	],

	DPadLeft: [
		[
			[80, 200],
			[80, 205],
			[300, 205],
			[315, 195],
		],
		"left",
		"black",
		[-70, -10],
	],
	DPadRight: [
		[
			[80, 235],
			[80, 240],
			[290, 240],
			[365, 195],
		],
		"left",
		"black",
		[-70, -10],
	],

	A: [
		[
			[680, 155],
			[680, 160],
			[538, 160],
		],
		"right",
		"#7b8e4a",
		[70, -5],
	],
	B: [
		[
			[680, 125],
			[680, 130],
			[568, 130],
		],
		"right",
		"#ca452f",
		[70, -5],
	],

	Y: [
		[
			[680, 95],
			[680, 100],
			[538, 100],
		],
		"right",
		"#de9f08",
		[70, -5],
	],
	X: [
		[
			[680, 185],
			[680, 190],
			[500, 190],
			[495, 140],
		],
		"right",
		"#5d72c0",
		[70, -5],
	],
};

function drawLines(pointList, pilot) {
	let lineStartX = pointList[0][0];
	var lineStartY = getYCoord(pointList[0][1], pilot);

	ctx.beginPath();
	ctx.moveTo(lineStartX, lineStartY);

	for (var i = 1; i < pointList.length; i++) {
		ctx.lineTo(pointList[i][0], getYCoord(pointList[i][1], pilot));
	}

	ctx.stroke();
}

function getYCoord(point, pilot) {
	if (pilot) {
		return point;
	} else {
		return point + 400;
	}
}

function addButton(locationName, text, pilot) {
	var location = locations[locationName];

	drawLines(location[0], pilot);

	let textX = location[0][0][0] + location[3][0];
	let textY = getYCoord(location[0][0][1], pilot) + location[3][1];

	ctx.textAlign = location[1];
	ctx.fillStyle = location[2];
	ctx.fillText(locationName + ": " + text, textX, textY);
}

function initCanvas() {
	loadImage("./background.png").then((image) => {
		ctx.drawImage(image, 10, 10, 780, 800);
		ctx.font = "15px Arial";
		const path = process.argv[2]
        let file;
        try {
            file = fs.readFileSync(path).toString();
        } catch {
            console.log("Usage: npx package /path/to/file")
            console.log("Path does not exist.")
            return
        }

		const matches = file.matchAll(
			/coop:button\((LJoystick|LBumper|RJoystick|RBumper|LTrigger|RTrigger|DPadUp|DPadDown|DPadLeft|DPadRight|B|A|X|Y),([^,\n]+),(pilot|copilot)\)/g
		);
		for (let match of matches) {
			addButton(match[1], match[2], (match[3]=="pilot"));
		}
		exportPDF();
	});
}


function exportPDF() {
	fs.writeFileSync("COOP.pdf", canvas.toBuffer());
}

initCanvas();
