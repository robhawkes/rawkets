/*
Input.js is MIT-licensed software
Copyright (c) 2011 Jon Buckley
*/

(function() {
  // Holds all of the physical device to USB enumeration mappings
  var keymapBlob = {
    '45e' : { /* Microsoft */
      '28e' : { /* Xbox 360 controller */
        'Mac' : {
          'axes' : {
            'Left_Stick_X': 0,
            'Left_Stick_Y': 1,
            'Right_Stick_X': 2,
            'Right_Stick_Y': 3,
            'Left_Trigger_2': [4, -1, 1],
            'Right_Trigger_2': [5, -1, 1]
          },
          'buttons' : {
            'A_Button': 0,
            'B_Button': 1,
            'X_Button': 2,
            'Y_Button': 3,
            'Left_Trigger_1': 4,
            'Right_Trigger_1': 5,
            'Left_Stick_Button': 6,
            'Right_Stick_Button': 7,
            'Start_Button': 8,
            'Back_Button': 9,
            'Home_Button': 10,
            'Pad_Up': 11,
            'Pad_Down': 12,
            'Pad_Left': 13,
            'Pad_Right': 14
          }
        },
        "Win": {
          "axes": {
            "Left_Stick_X": 0,
            "Left_Stick_Y": 1,
            "Right_Stick_X": 3,
            "Right_Stick_Y": 4,
            "Pad_Left": [5, 0, -1],
            "Pad_Right": [5, 0, 1],
            "Pad_Up": [6, 0, -1],
            "Pad_Down": [6, 0, 1],
            "Left_Trigger_2": [2, 0, 1],
            "Right_Trigger_2": [2, 0, -1]
          },
          "buttons": {
            "A_Button": 0,
            "B_Button": 1,
            "X_Button": 2,
            "Y_Button": 3,
            "Left_Trigger_1": 4,
            "Right_Trigger_1": 5,
            "Back_Button": 6,
            "Start_Button": 7,
            "Left_Stick_Button": 8,
            "Right_Stick_Button": 9
          }
        }
      }
    },
    "54c": { /* Sony */
      "268": { /* PS3 Controller */
        "Mac": {
          "axes": {
            "Left_Stick_X": 0,
            "Left_Stick_Y": 1,
            "Right_Stick_X": 2,
            "Right_Stick_Y": 3
          },
          "buttons": {
            "Back_Button": 0,
            "Left_Stick_Button": 1,
            "Right_Stick_Button": 2,
            "Start_Button": 3,
            "Pad_Up": 4,
            "Pad_Down": 6,
            "Pad_Right": 5,
            "Pad_Left": 7,
            "Left_Trigger_2": 8,
            "Right_Trigger_2": 9,
            "Left_Trigger_1": 10,
            "Right_Trigger_1": 11,
            "Y_Button": 12,
            "B_Button": 13,
            "A_Button": 14,
            "X_Button": 15,
            "Home_Button": 16
          }
        }
      }
    },
    "46d": { /* Logitech */
      "c242": { /* Chillstream */
        "Win": {
          "axes": {
            "Left_Stick_X": 0,
            "Left_Stick_Y": 1,
            "Right_Stick_Y": 4,
            "Right_Stick_X": 3,
            "Left_Trigger_2": [2, 0, 1],
            "Right_Trigger_2": [2, -1, 0],
            "Pad_Left": [5, -1, 0],
            "Pad_Right": [5, 0, 1],
            "Pad_Up": [6, -1, 0],
            "Pad_Down": [6, 0, 1]
          },
          "buttons": {
            "A_Button": 0,
            "X_Button": 2,
            "B_Button": 1,
            "Y_Button": 3,
            "Left_Trigger_1": 4,
            "Right_Trigger_1": 5,
            "Back_Button": 6,
            "Start_Button": 7,
            "Left_Stick_Button": 8,
            "Right_Stick_Button": 9
          }
        }
      },
      "c216": { /* Dual Action */
        "Mac": {
          "axes": {
            "Left_Stick_X": 1,
            "Left_Stick_Y": 2,
            "Right_Stick_X": 3,
            "Right_Stick_Y": 4,
            "Pad_Left": [1, 0, -1],
            "Pad_Right": [1, 0, 1],
            "Pad_Up": [2, 0, -1],
            "Pad_Down": [2, 0, 1]
          },
          "buttons": {
            "X_Button": 0,
            "A_Button": 1,
            "B_Button": 2,
            "Y_Button": 3,
            "Left_Trigger_1": 4,
            "Right_Trigger_1": 5,
            "Left_Trigger_2": 6,
            "Right_Trigger_2": 7,
            "Back_Button": 8,
            "Start_Button": 9,
            "Left_Stick_Button": 10,
            "Right_Stick_Button": 11
          }
        }
      }
    },
    "40b": {
      "6533": { /* USB 2A4K GamePad */
        "Mac": {
          "axes": {
            "Pad_Left": [0, 0, -1],
            "Pad_Right": [0, 0, 1],
            "Pad_Up": [1, 0, -1],
            "Pad_Down": [1, 0, 1]
          },
          "buttons": {
            "A_Button": 0,
            "B_Button": 1,
            "X_Button": 2,
            "Y_Button": 3
          }
        }
      }
    },
    "Firefox": {
      "Fake Gamepad": {
        "Mac": {
          "axes": {

          },
          "buttons": {
            'A_Button' : 0,
            'B_Button' : 1,
            'X_Button' : 2,
            'Y_Button' : 3,
            'Pad_Up' : 4,
            'Pad_Down': 5,
            'Pad_Left': 6,
            'Pad_Right': 7
          }
        }
      }
    }
  };

  // Our ideal gamepad that we present to the developer
  var ImaginaryGamepad = {
    'axes' : [
      'Left_Stick_X',
      'Left_Stick_Y',
      'Right_Stick_X',
      'Right_Stick_Y'
    ],
    'buttons' : [
      'A_Button',
      'B_Button',
      'X_Button',
      'Y_Button',
      'Left_Stick_Button',
      'Right_Stick_Button',
      'Start_Button',
      'Back_Button',
      'Home_Button',
      'Pad_Up',
      'Pad_Down',
      'Pad_Left',
      'Pad_Right',
      'Left_Trigger_1',
      'Right_Trigger_1',
      'Left_Trigger_2',
      'Right_Trigger_2'
    ]
  };

  var osList = ['Win', 'Mac', 'Linux'];
  function detectOS() {
    for (var i in osList) {
      if (navigator.platform.indexOf(osList[i]) !== -1) {
        return osList[i];
      }
    }
    return 'Unknown';
  }

  function map(value, istart, istop, ostart, ostop) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
  };

  // Map imaginary device action to physical device action
  function mapAxisToAxis(device, keymap, axes, prop) {
    Object.defineProperty(axes, prop, {
      enumerable: true,
      get: function() { return device.axes[keymap.axes[prop]]; }
    });
  }

  function mapAxisToButton(device, keymap, axes, prop) {
    Object.defineProperty(axes, prop, {
      enumerable: true,
      get: function() { return 0; }
    });
  }

  function mapButtonToButton(device, keymap, buttons, prop) {
    Object.defineProperty(buttons, prop, {
      enumerable: true,
      get: function() { return device.buttons[keymap.buttons[prop]]; }
    });
  }

  function mapButtonToAxis(device, keymap, buttons, prop) {
    var transform = keymap.axes[prop] instanceof Array;

    Object.defineProperty(buttons, prop, {
      enumerable: true,
      get: function() {
        if (transform) {
          return map(device.axes[keymap.axes[prop][0]], keymap.axes[prop][1], keymap.axes[prop][2], 0, 1);
        } else {
          return device.axes[keymap.axes[prop]];
        }
      }
    });
  }

  function mapZero(type, prop) {
    Object.defineProperty(type, prop, {
      enumerable: true,
      get: function() { return 0; }
    });
  }

  var Input = window.Input = {};
  var Device = Input.Device = function(domGamepad) {
    if (!domGamepad) {
      throw "You didn't pass a valid gamepad to the constructor";
    }

    var device = domGamepad,
        usbVendor = domGamepad.id.split('-')[0],
        usbDevice = domGamepad.id.split('-')[1],
        os = detectOS(),
        keymap = keymapBlob,
        axes = this.axes = {},
        buttons = this.buttons = {};

    if (keymap && keymap[usbVendor] && keymap[usbVendor][usbDevice] && keymap[usbVendor][usbDevice][os]) {
      keymap = keymap[usbVendor][usbDevice][os];
    } else {
      throw "A physical device layout for " + usbVendor + "-" + usbDevice + "-" + os + " isn't available";
    }

    // Wire the axes and buttons up
    for (var a in ImaginaryGamepad.axes) {
      if (keymap.axes[ImaginaryGamepad.axes[a]] !== undefined) {
        mapAxisToAxis(device, keymap, axes, ImaginaryGamepad.axes[a]);
      } else if (keymap.buttons[ImaginaryGamepad.axes[a]] !== undefined) {
        mapAxisToButton(device, keymap, axes, ImaginaryGamepad.axes[a]);
      } else {
        mapZero(axes, ImaginaryGamepad.axes[a]);
      }
    }

    for (var b in ImaginaryGamepad.buttons) {
      if (keymap.buttons[ImaginaryGamepad.buttons[b]] !== undefined) {
        mapButtonToButton(device, keymap, buttons, ImaginaryGamepad.buttons[b]);
      } else if (keymap.axes[ImaginaryGamepad.buttons[b]] !== undefined) {
        mapButtonToAxis(device, keymap, buttons, ImaginaryGamepad.buttons[b]);
      } else {
        mapZero(buttons, ImaginaryGamepad.buttons[b]);
      }
    }

    // Add some useful properties from the DOMGamepad object
    Object.defineProperty(this, "connected", {
      enumerable: true,
      get: function() { return device.connected; }
    });

    Object.defineProperty(this, "id", {
      enumerable: true,
      get: function() { return device.id; }
    });

    Object.defineProperty(this, "index", {
      enumerable: true,
      get: function() { return device.index; }
    });
  };
}());
