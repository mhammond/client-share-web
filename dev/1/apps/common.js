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

define([ "require", "jquery", "rdapi", "accounts",
         "jquery-ui-1.8.6.custom.min"],
function (require,   $,       rdapi,   accounts) {

  var common = function() {
    
  };
  common.prototype = {
    send: function(data) {
      dump("CALLED common send!");
      throw "oh no!";
    },

    getLogin: function(domain, callback) {
      accounts(function(accounts) {
        var result;
        accounts.forEach(function (account) {
          // protect against old style account data
          if (typeof(account.profile) === 'undefined') {
            return;
          }
          var acct = account.profile.accounts[0];
          if (!result && acct.domain === domain) {
            // Turn the nested object into a flat one with profile and info all in one.
            var retUser = {};
            for (var attr in account.profile) {
              if (account.profile.hasOwnProperty(attr)) retUser[attr] = account.profile[attr];
            }
            for (var attr in acct) {
              if (acct.hasOwnProperty(attr)) retUser[attr] = acct[attr];
            }
            delete retUser.accounts;
            result = {user: retUser};
          }
        });
        if (!result) {
          var url = 'http://linkdrop.caraveo.com:5000/dev/auth.html?domain=' + encodeURIComponent(domain);
          result = {login: {dialog: url}};
        }
        callback(result);
      });
    }
  }
  return new common();
});
