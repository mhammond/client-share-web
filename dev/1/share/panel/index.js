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

/*jslint plusplus: false, indent: 2, nomen: false */
/*global require: false, define: false, location: true, window: false, alert: false,
  document: false, setTimeout: false, localStorage: false, parent: false,
  console: false */
"use strict";

/*
 Refactor cleanup:

 * lastSelectionMatch
 * oauth failure in addAccount.js

*/

define([ "require", "jquery", "blade/object", "blade/fn",
        "blade/jig", "blade/url", "dispatch",
         "storage",  "widgets/ServicePanel", "widgets/TabButton",
         "widgets/AddAccount", "less", "osTheme", "jquery-ui-1.8.7.min",
         "jquery.textOverflow", "jschannel",
         ],
function (require,   $,        object,         fn,
          jig,         url,        dispatch,
          storage,   ServicePanel,           TabButton,
          AddAccount,           less,   osTheme) {

  var onFirstShareState = null,
    accountPanels = {},
    store = storage(),
    SHARE_DONE = 0,
    SHARE_START = 1,
    SHARE_ERROR = 2,
    okStatusIds = {
      statusSettings: true,
      statusSharing: true,
      statusShared: true
    },
    // If it has been more than a day,
    // refresh the UI, record a timestamp for it.
    refreshStamp = (new Date()).getTime(),
    //1 day.
    refreshInterval = 1 * 24 * 60 * 60 * 1000,

    options, bodyDom, sendData, tabButtonsDom,
    servicePanelsDom,
    owaservices = [], // A list of {app, iframe, channel, characteristics}
    owaservicesbyid = {}; // A map version of the above

  //Start processing of less files right away.
  require(['text!style/' + osTheme + '.css', 'text!style.css'],
    function (osText, styleText) {
    (new less.Parser()).parse(osText + styleText, function (err, css) {
      if (err) {
        if (typeof console !== 'undefined' && console.error) {
          console.error(err);
        }
      } else {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.textContent = css.toCSS();
        document.head.appendChild(style);
        document.body.style.visibility = 'visible';
      }
    });
  });

  function checkBase64Preview() {
    //Ask extension to generate base64 data if none available.
    //Useful for sending previews in email.
    var preview = options.previews && options.previews[0];
    if (preview && preview.http_url && !preview.base64) {
      dispatch.pub('generateBase64Preview', preview.http_url);
    }
  }

  function hide() {
    dispatch.pub('hide');
  }
  window.hideShare = hide;

  function close() {
    dispatch.pub('close');
  }
  //For debug tab purpose, make it global.
  window.closeShare = close;

  function updateChromeStatus(status, statusId, message) {
    dispatch.pub('updateStatus', [status, statusId, message, options.url]);
  }
  window.updateChromeStatus = updateChromeStatus;

  function _showStatus(statusId, shouldCloseOrMessage) {
    if (shouldCloseOrMessage === true) {
      setTimeout(function () {
        dispatch.pub('success', {
          username: sendData.username,
          userid: sendData.userid,
          url: options.url,
          service: owaservicesbyid[sendData.appid].app.manifest.name
        });
        $('div.status').addClass('hidden');
      }, 2000);
    } else if (shouldCloseOrMessage) {
      $('#' + statusId + 'Message').text(shouldCloseOrMessage);
    }

    //Tell the extension that the size of the content may have changed.
    dispatch.pub('sizeToContent');
  }

  dispatch.sub('openwebapp-installed', function(data) {
    location.reload();
  });

  dispatch.sub('openwebapp-uninstalled', function(data) {
    location.reload();
  });

  function showStatus(statusId, shouldCloseOrMessage) {
    $('div.status').addClass('hidden');
    $('#clickBlock').removeClass('hidden');
    $('#' + statusId).removeClass('hidden');

    if (!okStatusIds[statusId]) {
      updateChromeStatus(SHARE_ERROR, statusId, shouldCloseOrMessage);
    }
    _showStatus(statusId, shouldCloseOrMessage);
  }
  //Make it globally visible for debug purposes
  window.showStatus = showStatus;

  function resetStatusDisplay() {
    $('#clickBlock').addClass('hidden');
    $('div.status').addClass('hidden');
  }

  function cancelStatus() {
    // clear any existing status
    updateChromeStatus(SHARE_DONE);
    resetStatusDisplay();
  }

  function shareStateUpdate(shareState) {
    var now = (new Date()).getTime(),
        status;
    if (now - refreshStamp > refreshInterval) {
      //Force contact with the server via the true argument.
      location.reload(true);
    } else {

      options = shareState.options;
      // TODO: figure out if we can avoid this call if this is just
      // an error update.
      checkBase64Preview();

      if (onFirstShareState) {
        onFirstShareState();
        onFirstShareState = null;
      } else {
        dispatch.pub('optionsChanged', options);

        // just a status update.
        status = null;
        if (shareState && shareState.status) {
          // remove the status number
          status = shareState.status.slice(1);
        }
        if (status && status[0]) {
          _showStatus.apply(null, status);
        } else {
          //clear all status, but if settings config needs to be shown, show it.
          cancelStatus();
/* XXX - what is this doing??
          accounts(
            function (accts) {
              if (!accts || !accts.length) {
                tabButtonsDom.eq(0).click();
              }
            }, function (err) {
              tabButtonsDom.eq(0).click();
            }
          );
***/
        }

        //Tell the extension that the size of the content may have changed.
        dispatch.pub('sizeToContent');
      }
    }
  }
  dispatch.sub('shareState', shareStateUpdate);

  function showStatusShared() {
    // if no sendData, we're in debug mode, default to twitter to show the
    // panel for debugging
    var svcRec = owaservicesbyid[sendData.appid],
        siteName = options.siteName,
        url = options.url || "",
        doubleSlashIndex = url.indexOf("//") + 2;
    $('#statusShared').empty().append(jig('#sharedTemplate', {
      domain: siteName || url.slice(doubleSlashIndex, url.indexOf("/", doubleSlashIndex)),
      service: svcRec.app.manifest.name,
      href: svcRec.app.url
    })).find('.shareTitle').textOverflow(null, true);
    showStatus('statusShared', true);
  }
  //Make it globally visible for debug purposes
  window.showStatusShared = showStatusShared;

  function handleCaptcha(detail, error) {
    $('#captchaImage').attr('src', detail.imageurl);
    if (error) {
      $('#captchaMsg').text(error.message);
    }
    $('#captchaSound').attr('src', detail.audiourl);
    showStatus('statusCaptcha', false);
  }
  window.handleCaptcha = handleCaptcha;

  function reAuth() {
    //Save form state so their message can be recovered after
    //binding accounts.
    for (var prop in accountPanels) {
      if (accountPanels.hasOwnProperty(prop)) {
        accountPanels[prop].saveData();
      }
    }
    showStatus('statusAuth');
  }

  // This method assumes the sendData object has already been set up.
  // You probably want sendMessage, not this call.
  function callSendApi() {
    var data = object.create(sendData);
    //For now strip out the bitly placeholder since the backend does
    //not support it. This is being tracked in:
    //https://bugzilla.mozilla.org/show_bug.cgi?id=653277
    if (data.message) {
      data.message = data.message.replace(/http\:\/\/bit\.ly\/XXXXXX/, '');
    }
    // XXX - this needs lots of work - the values we work with are specific
    // to the F1 backend implementation and not really suitable as a general
    // api.
    var svcRec = owaservicesbyid[sendData.appid];
    var channel = svcRec.channel;
    channel.call({
      method: "confirm",
      params: sendData,
      success: function() {
        dump("send success!")
        var prop;
        // {'message': u'Status is a duplicate.', 'provider': u'twitter.com'}
        store.set('lastSelection', sendData.appid);
        showStatusShared();
        //Be sure to delete sessionRestore data
        for (prop in accountPanels) {
          if (accountPanels.hasOwnProperty(prop)) {
            accountPanels[prop].clearSavedData();
          }
        }
        // notify on successful send for components that want to do
        // work, like save any new contacts.
        dispatch.pub('sendComplete', sendData);
      },
      error: function(error, message) {
        dump("SEND FAILURE: " + error + "/" + message + "\n");
        if (error === 'authentication') {
          reAuth();
        } else if (error === 'captcha') {
          handleCaptcha(message[0], message[1]);
        } else if (error === 'http_error') {
          var status = message;
          if (status === 403) {
            //header error will be "CSRF" if missing CSRF token. This usually
            //means we lost all our cookies, or the server lost our session.
            //We could get more granular, to try to distinguish CSRF missing
            //token from just missing other cookine info, but in practice,
            //it is hard to see how that might happen -- either all the cookies
            //are gone or they are all there.
            //var headerError = xhr.getResponseHeader('X-Error');
            reAuth();
          } else if (status === 503) {
            dispatch.pub('serverErrorPossibleRetry');
          } else if (status === 0) {
            showStatus('statusServerError');
          } else {
            showStatus('statusError', message); // XXX - need better default msg??
          }
        } else {
          showStatus('statusError', message);
        }
      }
    });
  }

  function sendMessage(data) {
    showStatus('statusSharing');

    sendData = data;
    var svcRec = owaservicesbyid[data.appid];

    // get any shortener prefs before trying to send.
    store.get('shortenPrefs', function (shortenPrefs) {
          var svcConfig = svcRec.characteristics,
              shortenData;

          // hide the panel now, but only if the extension can show status
          // itself (0.7.7 or greater)
          updateChromeStatus(SHARE_START);
          hide();

          //First see if a bitly URL is needed.
          if (svcConfig.shorten && shortenPrefs) {
            shortenData = {
              format: 'json',
              longUrl: sendData.link
            };

            // Unpack the user prefs
            shortenPrefs = JSON.parse(shortenPrefs);

            if (shortenPrefs) {
              object.mixin(shortenData, shortenPrefs, true);
            }

            // Make sure the server does not try to shorten.
            delete sendData.shorten;

            $.ajax({
              url: 'http://api.bitly.com/v3/shorten',
              type: 'GET',
              data: shortenData,
              dataType: 'json',
              success: function (json) {
                sendData.shorturl = json.data.url;
                callSendApi();
              },
              error: function (xhr, textStatus, errorThrown) {
                showStatus('statusShortenerError', errorThrown);
              }
            });
          } else {
            callSendApi();
          }
    });
  }

  /**
   * Shows the accounts after any AccountPanel overlays have been loaded.
   */
  function displayAccounts(panelOverlayMap) {
    var lastSelectionMatch = 0,
        tabsDom = $('#tabs'),
        tabContentDom = $('#tabContent'),
        tabFragment = document.createDocumentFragment(),
        fragment = document.createDocumentFragment(),
        i = 0;

    $('#shareui').removeClass('hidden');

    store.get('lastSelection', function (lastSelection) {
      store.get('accountAdded', function (accountAdded) {

        var asyncCount = 0,
            asyncConstructionDone = false,
            accountPanel;

        // Finishes account creation. Actually runs *after* the work done
        // below this function. Need a function callback since AccountPanel
        // construction is async.
        function finishCreate() {
          asyncCount -= 1;

          // Could still be waiting for other async creations. If so, wait.
          if (asyncCount > 0 || !asyncConstructionDone) {
            return;
          }

          var addButton, addAccountWidget;

          // Add tab button for add account
          addButton = new TabButton({
            target: 'addAccount',
            title: 'Add Account',
            name: '+'
          }, tabFragment);

          // Add the AddAccount UI to the DOM/tab list.
          addAccountWidget = new AddAccount({
            id: 'addAccount', owaservices: owaservices
          }, fragment);

          // add the tabs and tab contents now
          tabsDom.append(tabFragment);
          tabContentDom.append(fragment);


          // Get a handle on the DOM elements used for tab selection.
          tabButtonsDom = $('.widgets-TabButton');
          servicePanelsDom = $('.servicePanel');

          checkBase64Preview();

          //If no matching accounts match the last selection clear it.
          if (lastSelectionMatch < 0 && !accountAdded && lastSelection) {
            store.remove('lastSelection');
            lastSelectionMatch = 0;
          }

          // which domain was last active?
          // TODO in new tabs world.
          //$("#accounts").accordion({ active: lastSelectionMatch });
          tabButtonsDom.eq(0).click();

          //Reset the just added state now that accounts have been configured one time.
          if (accountAdded) {
            store.remove('accountAdded');
          }

          //Inform extension the content size has changed, but use a delay,
          //to allow any reflow/adjustments.
          setTimeout(function () {
            dispatch.pub('sizeToContent');
          }, 100);
        }

        //Figure out what accounts we do have
        owaservices.forEach(function (thisSvc, index) {
          var appid = thisSvc.app.app,
              tabId = "ServicePanel" + index,
              PanelCtor;

          //Make sure to see if there is a match for last selection
          if (appid === lastSelection) {
            lastSelectionMatch = i;
          }

          if (accountPanels[appid]) {
            dump("EEEK - no concept of multiple accts per service!\n");
            // accountPanels[appid].addService(thisSvc);
          } else {
            /// XXX - need the OWA icon helper!!
            var icon;
            for (var z in thisSvc.app.manifest.icons) {
              icon = thisSvc.app.app + thisSvc.app.manifest.icons[z];
              break;
            }
            // Add a tab button for the service.
            tabsDom.append(new TabButton({
              target: tabId,
              type: appid,
              title: thisSvc.app.manifest.name,
              serviceIcon: icon
            }, tabFragment));

            // Get the contructor function for the panel.
            PanelCtor = require('widgets/ServicePanel');
            accountPanel = new PanelCtor({
              options: options,
              owaservice: thisSvc
            }, fragment);

            // if an async creation, then wait until all are created before
            // proceeding with UI construction.
            if (accountPanel.asyncCreate) {
              asyncCount += 1;
              accountPanel.asyncCreate.then(finishCreate);
            }

            accountPanel.node.setAttribute("id", tabId);
            accountPanels[appid] = accountPanel;
          }

          i++;
        });

        asyncConstructionDone = true;

        // The async creation could have finished if all the data values
        // for the account panels were already cached. If so, then finish
        // out the UI construction.
        if (!asyncCount) {
          finishCreate();
        }
      });
    });
  }

  function updateAccounts() {
    var panelOverlays = [],
        panelOverlayMap = {},
        //Only do one overlay request per app/service. This can be removed
        //when requirejs is updated to 0.23.0 or later.
        processedApps = {};

/***
    //Collect any UI overrides used for AccountPanel based on the services
    //the user has configured.
    owaservices.forEach(function (owaservice) {
      // may have failed to offer login info, or may be logged out - skip them
      if (!owaservice.login || !owaservice.login.user) {
        return;
      }
      var key = owaservice.app,
          account = owaservice.login.user,
          overlays = owaservice.characteristics.overlays,
          overlay = overlays && overlays['widgets/AccountPanel'];
      if (overlay && !processedApps[key]) {
        panelOverlays.push(overlay);
        panelOverlayMap[key] = overlay;
        processedApps[key] = true;
      }
    });
***/
    if (panelOverlays.length) {
      require(panelOverlays, function () {
        dispatch.pub('optionsChanged', options);
      });
    } else {
      dispatch.pub('optionsChanged', options);
    }
  }

  // Set up initialization work for the first share state passing.
  onFirstShareState = function () {
    // Wait until DOM ready to start the DOM work.
    $(function () {

      //Listen to sendMessage events from the AccountPanels
      dispatch.sub('sendMessage', function (data) {
        sendMessage(data);
      });

      dispatch.sub('logout', function (appid) {
        var svcRec = owaservicesbyid[appid];
        svcRec.channel.call({
          method: "link.send.logout",
          success: function(result) {
            dump("logout worked\n");
            location.reload();
          },
          error: function(err, message) {
            dump("failed to logout: " + err + ": " + message + "\n");
            // may as well update the accounts anyway incase it really did work!
            location.reload();
          }
        });
      });

      // Listen for 503 errors, could be a retry call, but for
      // now, just show server error until better feedback is
      // worked out in https://bugzilla.mozilla.org/show_bug.cgi?id=642653
      dispatch.sub('serverErrorPossibleRetry', function () {
        showStatus('statusServerBusy');
      });

      bodyDom = $('body');
      bodyDom
        .delegate('.widgets-TabButton', 'click', function (evt) {
          evt.preventDefault();

          //Switch Tabs
          // Ack - the click event seems to come from the img rather than the anchor?
          var node = evt.target.nodeName==='A' ? evt.target : evt.target.parentNode,
              target = node.href.split('#')[1];

          tabButtonsDom.removeClass('selected');
          $(node).addClass('selected');

          servicePanelsDom.addClass('hidden');
          $('#' + target).removeClass('hidden');

          setTimeout(function () {
            dispatch.pub('sizeToContent');
          }, 15);
        })
        .delegate('#statusAuthButton, .statusErrorButton', 'click', function (evt) {
          cancelStatus();
        })
        .delegate('.statusErrorCloseButton', 'click', function (evt) {
          cancelStatus();
        })
        .delegate('.statusResetErrorButton', 'click', function (evt) {
          location.reload();
        })
        .delegate('.settingsLink', 'click', function (evt) {
          evt.preventDefault();
          dispatch.pub('openPrefs');
        })
        .delegate('.close', 'click', function (evt) {
          evt.preventDefault();
          close();
        });

      $('#authOkButton').click(function (evt) {
        // just incase the service doesn't detect the logout automatically
        // (ie, incase it returns the stale user info), force a logout.
        var svcRec = owaservicesbyid[sendData.appid];
        // apparently must create the window here, before we do the channel
        // stuff to avoid it being blocked.
        var win = window.open("",
          "ffshareOAuth",
          "dialog=yes, modal=yes, width=900, height=500, scrollbars=yes");
        svcRec.channel.call({
          method: 'link.send.logout',
          success: function() {
            _fetchLoginInfo(svcRec, function() {
              if (!svcRec.login || !svcRec.login.login || !svcRec.login.login.dialog) {
                dump("Eeek - didn't get a login URL back from the service\n");
                showStatus('statusOAuthFailed');
                win.close();
                return;
              }
              var url = svcRec.app.app + svcRec.login.login.dialog;
              win.location = url;
              win.focus();
            });
          },
          error: function(err, message) {
            dump("Service logout failed: " + err + "/" + message + "\n");
            showStatus('statusOAuthFailed');
            win.close();
          }
        });
        return false;
      });

      $('#captchaButton').click(function (evt) {
        cancelStatus();
        $('#clickBlock').removeClass('hidden');
        sendData.HumanVerification = $('#captcha').attr('value');
        sendData.HumanVerificationImage = $('#captchaImage').attr('src');
        sendMessage(sendData);
      });

      //Only bother with localStorage enabled storage.
      if (storage.type === 'memory') {
        showStatus('statusEnableLocalStorage');
        return;
      }

    });
  };

  function _fetchLoginInfo(svcRec, callback) {
    var ch = svcRec.channel;
    ch.call({
      method: "link.send.getLogin",
      success: function(result) {
        svcRec.login = result;
        callback();
      },
      error: function(err, message) {
        dump("failed to get owa login info: " + err + ": " + message + "\n");
        svcRec.login = null;
        callback();
      }
    });
  };

  /* Not used, and not clear exactly when we need to do this! */
  function _deleteOldServices() {
    // first the channels
    while (owaservices.length) {
      var svcRec = owaservices.pop();
      svcRec.channel.destroy();
      if (svcRec.subAcctsChanged) {
        dispatch.unsub(svcRec.subAcctsChanged);
      }
    }
    owaservicesbyid = {};
    $("#frame-garage").empty();// this will remove iframes from DOM
  };

  function _createChannels(requestMethod, requestArguments) {
    // XX we shouldn't be creating all the channels at once
    owaservices.forEach(function(svcRec, i) {
      try {
        var chan = Channel.build({
            window: svcRec.iframe.contentWindow,
            origin: svcRec.app.url,
            scope: "openwebapps_conduit"
        });

        chan.call({
            method: requestMethod,
            params: requestArguments,
            success: function() {}, /* perhaps record the fact that it worked? */
            error: (function() {return function(error, message) {
              // XXX - what is this error handler trying to do???
              var messageData = {cmd:"error", error:error, msg:message};
              var msg = document.createEvent("MessageEvent");
              msg.initMessageEvent("message", // type
                                   true, true, // bubble, cancelable
                                   JSON.stringify(messageData),  // data
                                   "resource://openwebapps/service", "", window); // origin, source
              document.dispatchEvent(msg);
            }}())
        });
        svcRec.channel = chan;
        // and listen for "Account changed" events coming back from it.
        // (We do this once per app as each one may have a different origin)
        svcRec.subAcctsChanged = dispatch.sub('accountsChanged',
                                              function () {
                                                location.reload();
                                              },
                                              window,
                                              svcRec.app.app);

      } catch (e) {
        dump("Warning: unable to create channel to " + svcRec.app.url + ": " + e + "\n");
      }
    });
  };

  window.addEventListener("message", function(evt) {
    // Make sure we only act on messages from "ourself" (actually, they come
    // from OWA, but it sets the origin to our window...)
    if (window.location.href.indexOf(evt.origin) === 0) {
      var message = evt.data, topic, data;
      try {
        // Only some messages are valid JSON, only care about the ones
        // that are.
        message = JSON.parse(message);
      } catch (e) {
        dump("share panel ignoring non-json message");
        return;
      }
      if (message.cmd === "setup") {
        // Sent by OWA after it has created the iframes.
        message.serviceList.forEach(function(svc, index) {
          var svcRec = {app: svc,
                        iframe: document.getElementById("svc-frame-" + index)
          }
          owaservices.push(svcRec);
          owaservicesbyid[svc.app] = svcRec;
        });
        displayAccounts();
        var requestMethod = message.method;
        var requestArgs = message.args;
      /* XXX - strange - don't get the start_channels even though OWA's
        services.js sends this immediately after 'setup'!!!
      } else if (message.cmd === "start_channels") {
      *****/
        _createChannels(requestMethod, requestArgs);
        // use the newly created channels to get the characteristics for
        // each owa service.
        owaservices.forEach(function(thisSvc) {
          var ch = thisSvc.channel;
          ch.call({
            method: "link.send.getCharacteristics",
            success: function(result) {
              thisSvc.characteristics = result;
              _fetchLoginInfo(thisSvc, function() {
                dispatch.pub('optionsChanged', options);
              });
            },
            error: function(err) {
              dump("failed to get owa characteristics: " + err + "\n");
              _fetchLoginInfo(thisSvc, function() {
                dispatch.pub('optionsChanged', options);
              });
            }
          });
        });
      }
    }
  }, false);

  // Trigger a call for the first share state.
  dispatch.pub('panelReady', null);
});
