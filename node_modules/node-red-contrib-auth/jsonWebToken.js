// If you use this as a template, update the copyright with your own name.

// Sample Node-RED node file


module.exports = function(RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");
    // Statics go here.
    // var session = require('client-sessions');
    var jwt = require('jsonwebtoken');

    // The main node definition - most things happen in here
    function JsonWebToken(config) {
        // Create a RED node
        RED.nodes.createNode(this, config);

        console.log("config = ", config);
        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // this.status({fill:"red",shape:"ring",text:"disconnected"});

        // Store local copies of the node configuration (as defined in the .html)
        // this.topic = config.topic;
        // Retrieve the config node
        // console.log(config);
        node.config = RED.nodes.getNode(config.tokenconfig);
        node.on('input', function(msg) {
            if (node.config) {
                node.secret = node.config.secret;
                try {
                    // If there's no token present, encode the payload and add a token.
                    if (!msg.token) {
                        if (!msg.payload) {
                            msg.error = {
                                "message": "No token or payload present",
                                "code": "nothing-to-do"
                            }
                        } else {
                            var token = jwt.sign(msg.payload, node.secret);
                            msg.token = token;
                        }
                        node.send(msg);
                    }
                    else {
                        // otherwise, decode the token in msg.token and place the data in the msg.token.
                        jwt.verify(msg.token, node.secret, function(err, decoded) {
                            if (!err) {
                                msg.token = decoded;
                                node.send(msg);
                            }
                            else {
                                node.error(err);
                                msg.error = err;
                                node.send(msg);
                            }
                        });
    
                    }
                }
                catch (e) {
                    node.error("error" + e);
                    msg.error = {
                        "message": e,
                        "code": "general"
                    }
                    node.send(msg);
                }
            } else {
                node.error("Unable to get config");
                msg.error = {
                    "message": "Unable to get config node",
                    "code": "bad-configuration"
                }
                node.send(msg)
            }
        });
        
        // node.on("close", function() {
        // Called when the node is shutdown - eg on redeploy.
        // Allows ports to be closed, connections dropped etc.
        // eg: node.client.disconnect();
        // });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("JsonWebToken", JsonWebToken);


    // Register the configuration node
    function JsonWebTokenConfig(n) {
        RED.nodes.createNode(this, n);
        this.name = n.name;
        this.secret = n.secret;
        console.log("Secret = ", n.secret);
        // console.error("Config in confignode is ", n);
    }
    RED.nodes.registerType("JsonWebToken_config", JsonWebTokenConfig);


};
