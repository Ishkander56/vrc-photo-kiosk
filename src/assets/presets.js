export const PRESETS = {
    default: {
        label: "Default",
        roles: {
            player: {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                red: 100,
                green: 100,
                blue: 100,
                opacity: 100,
                gblur: 0,
            },
            environment: {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                red: 100,
                green: 100,
                blue: 100,
                opacity: 100,
                gblur: 0,
            },
            ui: {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                red: 100,
                green: 100,
                blue: 100,
                opacity: 100,
                gblur: 0,
            },
        }
    },
	
	bright: {
        label: "Bright",
        roles: {
            player: {
                brightness: 120,
                contrast: 80,
            },
            environment: {
                brightness: 110,
                saturation: 80,
            },
        }
    },
	
	brighter: {
        label: "Brighter",
        roles: {
            player: {
                brightness: 140,
                contrast: 75,
            },
            environment: {
                brightness: 120,
                saturation: 75,
            },
        }
    },
	
	brightest: {
        label: "Brightest",
        roles: {
            player: {
                brightness: 160,
                contrast: 70,
            },
            environment: {
                brightness: 130,
                saturation: 70,
            },
        }
    },
	
	dark: {
        label: "Dark",
        roles: {
            environment: {
                brightness: 80,
                contrast: 120,
            },
            player: {
                brightness: 90,
                saturation: 80,
            },
        }
    },
	
	darker: {
        label: "Darker",
        roles: {
            environment: {
                brightness: 60,
                contrast: 140,
            },
            player: {
                brightness: 80,
                saturation: 75,
            },
        }
    },
	
	darkest: {
        label: "Darkest",
        roles: {
            environment: {
                brightness: 40,
                contrast: 160,
            },
            player: {
                brightness: 70,
                saturation: 70,
            },
        }
    },
	
	warm: {
        label: "Warm",
        roles: {
            environment: {
                contrast: 110,
				red: 110,
				green: 90,
				blue: 80,
            },
            player: {
                contrast: 105,
				red: 105,
				green: 95,
				blue: 95,
            },
        }
    },
	
	warmer: {
        label: "Warmer",
        roles: {
            environment: {
                contrast: 120,
				red: 120,
				green: 80,
				blue: 60,
            },
            player: {
                contrast: 110,
				red: 110,
				green: 90,
				blue: 80,
            },
        }
    },
	
	warmest: {
        label: "Warmest",
        roles: {
            environment: {
                contrast: 130,
				red: 130,
				green: 80,
				blue: 40,
            },
            player: {
                contrast: 120,
				red: 120,
				green: 80,
				blue: 60,
            },
        }
    },
	
	cool: {
        label: "Cool",
        roles: {
            environment: {
                contrast: 110,
				blue: 110,
				green: 90,
				red: 80,
            },
            player: {
                contrast: 105,
				blue: 105,
				green: 95,
				red: 95,
            },
        }
    },
	
	cooler: {
        label: "Cooler",
        roles: {
            environment: {
                contrast: 120,
				blue: 120,
				green: 80,
				red: 60,
            },
            player: {
                contrast: 110,
				blue: 110,
				green: 90,
				red: 80,
            },
        }
    },
	
	coolest: {
        label: "Coolest",
        roles: {
            environment: {
                contrast: 130,
				blue: 130,
				green: 80,
				red: 40,
            },
            player: {
                contrast: 120,
				blue: 120,
				green: 80,
				red: 60,
            },
        }
    },
	
	sepia: {
        label: "Sepia",
        roles: {
            player: {
                saturation: 10,
				brightness: 150,
				contrast: 120,
				red: 50,
				green: 27,
				blue: 17,
            },
            environment: {
                saturation: 10,
				brightness: 150,
				contrast: 120,
				red: 50,
				green: 27,
				blue: 17,
            },
            ui: {
                saturation: 10,
				brightness: 150,
				contrast: 120,
				red: 50,
				green: 27,
				blue: 17,
            },
        }
    },
	
	sepiab: {
        label: "Sepia (Bright)",
        roles: {
            player: {
                saturation: 10,
				brightness: 200,
				contrast: 150,
				red: 50,
				green: 27,
				blue: 17,
            },
            environment: {
                saturation: 10,
				brightness: 200,
				contrast: 150,
				red: 50,
				green: 27,
				blue: 17,
            },
            ui: {
                saturation: 10,
				brightness: 200,
				contrast: 150,
				red: 50,
				green: 27,
				blue: 17,
            },
        }
    },
	
	sepiad: {
        label: "Sepia (Dark)",
        roles: {
            player: {
                saturation: 10,
				brightness: 75,
				contrast: 150,
				red: 50,
				green: 27,
				blue: 17,
            },
            environment: {
                saturation: 10,
				brightness: 75,
				contrast: 150,
				red: 50,
				green: 27,
				blue: 17,
            },
            ui: {
                saturation: 10,
				brightness: 75,
				contrast: 150,
				red: 50,
				green: 27,
				blue: 17,
            },
        }
    },
	
	wackySpacer : {
		label: "⸻",
		roles: {
            player: {},
            environment: {},
            ui: {}, 
        }
	},
	
	otome: {
        label: "True Love",
        roles: {
            environment: {
                gblur: 10,
                brightness: 145,
				saturation: 120,
				red: 120,
				green: 80,
				blue: 90,
            },
			player: {
                brightness: 120,
                contrast: 104,
            },
        }
    },

    concussion: {
        label: "Concussion",
        roles: {
			environment: {
                gblur: 20,
                brightness: 90,
            },
            player: {
                saturation: 0,
                contrast: 120,
            },
        }
    },

    characteristic: {
        label: "Characteristic",
        roles: {
            environment: {
                brightness: 80,
                saturation: 120,
            },
            player: {
                contrast: 130,
            },
        }
    },
	
	amigara: {
        label: "The Enigma of Amigara Fault",
        roles: {
            environment: {
                brightness: 120,
				contrast: 120,
                saturation: 120,
				red: 90,
            },
            player: {
                brightness: 0,
				gblur: 3,
            },
			ui: {
                brightness: 0,
				gblur: 3,
            },
        }
    },
	
    fwo: {
        label: "Promised Land",
        roles: {
            player: {
                contrast: 120,
            },
            environment: {
                brightness: 90,
                blue: 110,
                green: 110,
            },
            ui: {
                saturation: 0,
                red: 200,
                green: 165,
                blue: 0,
            },
        }
    },
	
	randomSpacer : {
		label: "⸻",
		roles: {
            player: {},
            environment: {},
            ui: {}, 
        }
	},
	
	random: {
        label: "Random",
        roles: { // special hack
            player: {},
            environment: {},
            ui: {}, 
        }
    },
};