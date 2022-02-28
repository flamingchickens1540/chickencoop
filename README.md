# COOP

[![npm](https://img.shields.io/npm/v/chickencoop?style=for-the-badge)](https://www.npmjs.com/package/chickencoop)

Controller Operational Observation Program

---
COOP is a JavaScript program that lets you generate a button binding reference sheet for Xbox controllers.

## Usage

```
npx chickencoop -i /path/to/input -o /path/to/output

Options:
      --help     Show help                                             [boolean]
  -i, --input    The file to read from                       [string] [required]
  -o, --output   The file to write to                        [string] [required]
```

## Syntax

COOP will look for special lines in the input file. If your input file is a source code file, these lines can be added as comments.

```
coop:button(buttonName,text,controller)
```

### Button Name

This is the button's identifier, can be any of the following:

- `LJoystick`
- `RJoystick`

- `LBumper`
- `RBumper`

- `LTrigger`
- `RTrigger`

- `DPadUp`
- `DPadDown`
- `DPadLeft`
- `DPadRight`

- `A`
- `B`
- `X`
- `Y`

### Text

This will be the label text for the button. It can have spaces, but no commas or newlines

### Controller

Can be either `pilot` or `copilot`. `pilot` is the top controller in the diagram and `copilot` is the bottom one.

## Example

See https://github.com/flamingchickens1540/chickencoop/blob/main/example.pdf and https://github.com/flamingchickens1540/chickencoop/blob/main/example.txt
