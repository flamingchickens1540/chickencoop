#!/usr/bin/env node


const fs = require("fs");

const { createCanvas, loadImage } = require("canvas");
const canvas = createCanvas(780, 800, "pdf");
const ctx:CanvasRenderingContext2D = canvas.getContext("2d");

const colors = require('colors/safe');

const yargs = require('yargs');

const argv = yargs
                .scriptName("npx chickencoop")
                .usage('$0 [--error-on-warnings] -i /path/to/input -o /path/to/output.pdf ')
                .option('input', {
                    alias : 'i',
                    describe: 'The file to read from',
                    type: 'string', /* array | boolean | string */
                    nargs: 1,
                    demand: true
                })
                .option('output', {
                    alias : 'o',
                    describe: 'The file to write to',
                    type: 'string', /* array | boolean | string */
                    nargs: 1,
                    demand: true
                })
				.option('error', {
					alias: 'error-on-warnings',
					describe: 'Will cause the program to exit with error code 1 instead of giving a warning',
					type: 'boolean'
				})
                .example("$0 -i input.txt -o output.pdf")
                .showHelpOnFail(false, "Specify --help for available options")
                .argv

class Point {
	x: number
	y: number
	private copilotY:number;
	
	constructor(x:number, y:number) {
		this.x = x
		this.y = y
		this.copilotY = y+400;
	}

	static fromArray(coordinates: number[]):Point {
		return new Point(coordinates[0], coordinates[1])
	}


	public getY(pilot:boolean):number {
		if (pilot) {
			return this.y
		} else {
			return this.copilotY
		}
	}
}
class Button {
	name: string
	points: Point[] = []
	text: {
		alignment: CanvasTextAlign,
		color: string
		anchor: Point
		maxWidth:number
	}
	private lock={
		pilot: false,
		copilot: false
	}

	constructor(name:string, points:number[][], textAlignment:CanvasTextAlign, textColor:string, maxWidth:number, textAnchor:[number, number]) {
		this.name = name
		points.forEach((point) => {
			this.points.push(Point.fromArray(point))
		})
		this.text = {
			alignment: textAlignment,
			color: textColor,
			anchor: Point.fromArray(textAnchor),
			maxWidth: maxWidth
		}
	}


	private checkLocks(pilot: boolean) {
		if (pilot) {
			if (this.lock.pilot) {
				console.warn(colors.yellow(`Binding for ${this.name} on Pilot has been registered twice!`))
				if (argv.error) {
					process.exit(1)
				}
				return true
			}
			this.lock.pilot = true
		} else {
			if (this.lock.copilot) {
				console.warn(colors.yellow(`Binding for ${this.name} on Copilot has been registered twice!`))
				if (argv.error) {
					process.exit(1)
				}
				return true
			} else {
				this.lock.copilot = true
			}
			
		}
		return false
	}
	public draw(label:string, pilot:boolean):void {
		if (!this.checkLocks(pilot)) {
			let lineEnd = this.drawText(label, pilot);
			this.drawLines(lineEnd, pilot)
		}
		
	}

	private drawText(label:string, pilot:boolean):Point {
		let text = this.name + ": " + label;
		let textX = this.text.anchor.x
		let textY =  this.text.anchor.getY(pilot)
		let maxWidth = this.text.maxWidth

		ctx.textAlign = this.text.alignment
		ctx.fillStyle = this.text.color

		ctx.fillText(text, textX,textY, maxWidth);


		let measuredWidth = Math.min(ctx.measureText(text).width, maxWidth)
		if (this.text.alignment == "left") {
			return new Point(textX+measuredWidth+5, textY)
		} else {
			return new Point(textX-measuredWidth-5, textY)
		}
	}

	private drawLines(labelLocation:Point, pilot:boolean) {
		ctx.beginPath();
		ctx.moveTo(labelLocation.x, labelLocation.y);

		this.points.forEach(point => {
			ctx.lineTo(point.x, point.getY(pilot));
		})
		ctx.stroke();
	}

}

let locations = {
	LJoystick: new Button("LJoy", [[280, 120]], "left", "black", 230, [10, 120]),
	RJoystick: new Button("RJoy", [[500, 230],[463, 195]], "right", "black", 250, [770,230]),

	LBumper: new Button("LB", [[270, 65]], "left", "black", 240, [10, 65]),
	RBumper: new Button("RB", [[530, 65],[530, 67]], "right", "black", 230, [770, 65]),

	LTrigger: new Button("LT", [[280, 40], [280, 62]], "left", "black", 250, [10,40]),
	RTrigger: new Button("RT", [[520, 40], [520, 65]], "right", "black", 240, [770,40]),

	A: new Button("A", [[539, 160]], "right", "#7b8e4a", 190, [770, 160]),
	B: new Button("B", [[568, 130]], "right", "#ca452f", 190, [770, 130]),
	Y: new Button("Y", [[538, 100]], "right", "#de9f08", 190, [770, 100]),
	X: new Button("X", [[500, 190],[495, 140]], "right", "#5d72c0", 190, [770, 190]),

	DPadUp:   new Button("DPad Up",   [[340,170]], "left", "black", 270, [10,170]),
	DPadDown: new Button("DPad Down", [[340,220]], "left", "black", 270, [10,220]),
	DPadLeft: new Button("DPad Left", [[315, 195]], "left", "black", 270, [10,195]),
	DPadRight: new Button("DPad Right", [[365, 245],[365, 195]], "left", "black", 270, [10,245]),

	Back: new Button("Back", [[360, 15],[360, 122]], "left", "black", 330, [10, 15]),
	Start: new Button("Start", [[447, 15],[447, 122]], "right", "black", 300, [770, 15]),
};

class CoopMatch {
	button: Button
	buttonName: string
	label: string
	pilot: boolean
	constructor(annotation:RegExpMatchArray) {
		this.buttonName = annotation[1]
		this.button = locations[this.buttonName]
		this.label = annotation[2]
		this.pilot = (annotation[3].toString() == "pilot")
	}

	public draw():void {
		if (!this.button) {
			console.error(colors.yellow("Could not find button '%s'"), this.buttonName)
			if (argv.error) {
				process.exit(1)
			}
		} else {
			this.button.draw(this.label, this.pilot)
		}
	}
}

function initCanvas() {
	loadImage(require('path').join(__dirname,"assets/background.png")).then((image) => {
		ctx.drawImage(image, 10, 10, 780, 800);
		ctx.font = "15px Arial";
		ctx.textBaseline = "middle"
        let file:string;
        try {
            file = fs.readFileSync(argv.input).toString();
        } catch {
            console.error(colors.red("Path does not exist."))
			process.exit(1)
        }
		const matches = file.matchAll(
			/coop:button\(([^,\n]+),([^,\n]+),(pilot|copilot)\)/g
		);
		for (let match of matches) {
			new CoopMatch(match).draw()
		}
		exportPDF();
	});
}


function exportPDF() {
	fs.writeFileSync(argv.output, canvas.toBuffer());
}

initCanvas();