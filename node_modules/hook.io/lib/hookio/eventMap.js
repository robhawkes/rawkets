module['exports'] = {
  "*::getEvents": function(cb) {
    cb(null, this.getEvents());
  },
  "*::query": function (hook, cb) {
    this.query(hook, cb);
  },
  "*::install": function (hook, callback) {
    var self = this;
    self.emit('npm::installing', hook);
    npm.install(hook, function (err, result) {
      if (err) {
        return self.emit('npm::install::error', err);
      }
      self.emit('npm::installed', result);
    });
  },
  "connection::end": function (data) {
    var self = this;
    if(data.proposedRank >= self.proposedRank) {
      self.proposedRank = self.proposedRank - 1;
      self.emit('hook::rank::accepting', self.proposedRank);
    }
  },
  "hook::disconnected": function (data) {
    var self = this;
    self.clientCount = self.clientCount - 1;
    if(data.proposedRank >= self.proposedRank) {
      //self.proposedRank = self.proposedRank - 1;
      //console.log('my new proposedRank is ', self.proposedRank);
    }
  },
};