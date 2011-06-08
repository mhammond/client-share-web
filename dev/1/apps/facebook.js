/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Raindrop.
 *
 * The Initial Developer of the Original Code is
 * Mozilla Messaging, Inc..
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * */

/*jslint plusplus: false, indent: 2 */
/*global define: false, location: true, window: false, alert: false,
  document: false, setTimeout: false, localStorage: false */
"use strict";

define([ "require", "jquery", "rdapi",
         "storage", "jschannel", "../apps/common",
         "jquery-ui-1.8.6.custom.min"],

function (require,   $,       rdapi,
          storage, jschannel, common) {

  function bindAppService() {
    // Bind the OWA messages
    try {
      var chan = Channel.build({window: window.parent, origin: "*", scope: "openwebapps_conduit"});
      chan.bind("confirm", function(t, data) {
        dump("channel.confirm with args: " + data + "!\n");
        common.send(t, data);
      });
      chan.bind("link.send", function(t, args) {
        dump("got link.send connection\n");
      });
      chan.bind("link.send.getCharacteristics", function(t, args) {
        // some if these need re-thinking.
        return {
            domain: 'facebook.com', // XXX - rethink - should be able to nuke this.
            type: 'facebook', // Also not needed???

            features: {
              //TODO: remove direct when old UI is no longer in use,
              //or remove it from use.
              //direct: true,
              subject: false,
              counter: true,
              medium: true
            },
            shareTypes: [{
              type: 'wall',
              name: 'my wall'
            }, {
              type: 'groupWall',
              name: 'group wall',
              showTo: true,
              toLabel: 'type in the name of the group'
            }],
            textLimit: 420,
            serviceUrl: 'http://facebook.com',
            revokeUrl: 'http://www.facebook.com/editapps.php?v=allowed',
            signOutUrl: 'http://facebook.com'
            /***
            accountLink: function (account) {
              return 'http://www.facebook.com/profile.php?id=' + account.userid;
            },
            overlays: {
              'widgets/AccountPanel': 'widgets/AccountPanelFaceBook'
            }
            ***/
        };
      });
      chan.bind("link.send.getLogin", function(t, args) {
        t.delayReturn(true); // we finish in the async callback.
        common.getLogin("facebook.com", function(result) {
            t.complete(result);
        });
      });
    } catch(e) {
      // thrown by jschannel...
      if (e !== 'target window is same as present window -- not allowed') {
        throw e;
      }
      console.log("ignoring error setting up channel - hopefully you are debugging!");
    }
  }
  bindAppService();
});
