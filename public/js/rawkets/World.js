/**************************************************
** BASE GAME WORLD
**************************************************/

// Much of this is based on logic from WPilot

var util = r.Util;

r.namespace("World");
rawkets.World = function (options) {
	var self = this;

	self.roundStates = {
		WARMUP: 1, // Preparing round and waiting for players
		STARTING: 2, // Round is about to start, prepare players for battle
		RUNNING: 3, // Round has started, waiting for win scenario
		FINISHED: 4 // Round is over, reset everything for a new one
	};

	// Default values
	self.connection = options.connection || null;
	self.roundState = null;
	self.maxPlayers = 0;
	self.playerCount = 0;
	self.players = {};
	self.entityCount = 0;
	self.entities = {};
	self.debug = options.debug || false;
};

// Helper variable
var World = rawkets.World;

World.prototype.create = function(gameType) {
	var self = this;

	self.roundState = null;
	self.maxPlayers = gameType.maxPlayers;
	self.playerCount = 0;
	self.players = {};
	self.entityCount = 0;
	self.entities = {};
	self.dimensions = {width: gameType.dimensions.width, height: gameType.dimensions.height};
};

World.prototype.setState = function(worldState) {
	var self = this,
		world = worldState.state;

	// 1. Set general world state
	self.roundState = world.roundState;
	self.maxPlayers = world.maxPlayers;
	self.playerCount = world.playerCount;

	// 2. Add players to the world
	for (var i = 0; i < worldState.players.length; i++) {
		// 1. Create new player
		var playerRepresentation = worldState.players[i],
			player = new r.Player(playerRepresentation);

		// 2. Add player to the world
		self.players[player.id] = player;

		// 3. Add ship entity to world if player isn't dead
	}

	// 3. Add other entities to the world (powerups, etc)

};

// Update all game entities, perform collisions, and remove destroyed objects
World.prototype.update = function(timeDelta) {
	var self = this;	
};

// Process messages related to this game type
World.prototype.processMessage = function(msg, client) {
	var self = this,
		connectionStates = self.connection.connectionStates,
		typeIndexes = self.connection.typeIndexes,
		typeIndex = msg.typeIndex,
		args = msg.args;
	
	switch (typeIndex) {
		case typeIndexes.playerState:
			
			break;
		default:
			return false;
	}
};