/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Autodesk Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

const express = require('express');
const { HubsApi, ProjectsApi, FoldersApi, ItemsApi } = require('forge-apis');

const { OAuth } = require('./common/oauth');

var config = require('../config'); 
const { apiClientCallAsync } = require('./common/apiclient');

let router = express.Router();

router.get('/datamanagement', async (req, res) => {
    // The id querystring parameter contains what was selected on the UI tree, make sure it's valid
    const href = decodeURIComponent(req.query.id);
    if (href === '') {
        res.status(500).end();
        return;
    }

    // Get the access token
    const oauth = new OAuth(req.session);
    const internalToken = await oauth.getInternalToken();
    if (href === '#') {
        // If href is '#', it's the root tree node
        getHubs(oauth.getClient(), internalToken, res);
    } else {
        // Otherwise let's break it by '/'
        const params = href.split('/');
        const resourceName = params[params.length - 2];
        const accountId = params[params.length - 1].replace('b.','');
        switch (resourceName) {
            case 'hubs':
                getGroups(accountId, internalToken, res);
                break;
            case 'groups':
                const groupId = params.length>2? params[params.length - 3]:null;
                getCollections(accountId, groupId, internalToken, res);
                break;
            default:
                break;
        }

    }
});

async function getHubs(oauthClient, credentials, res) {
    const hubs = new HubsApi();
    const data = await hubs.getHubs({}, oauthClient, credentials);
    const treeNodes = (data.body.data.map((hub) => {
        if (hub.attributes.extension.type !== 'hubs:autodesk.bim360:Account')
            return null;
        else {
            return createTreeNode(
                hub.links.self.href,
                hub.attributes.name,
                'bim360Hubs',
                '',
                true
            );
        }
    }));
    res.json(treeNodes.filter(node => node !== null));
}

async function getGroups(accountId, credentials, res) {
    let groupsUrl = config.parameters.URL.PARAMETERS_GROUPS_URL.format(accountId);
    let groupsRes = null;
    try {
      groupsRes = await apiClientCallAsync('GET', groupsUrl, credentials.access_token);
    } catch (err) {
      console.error(err)
      return (res.status(500).json({
        diagnostic: 'failed to get the parameters groups info'
      }));
    }

    res.json(groupsRes.body.results.map((item) => {
        return createTreeNode(
            item.id +'/groups/'+ accountId, 
            item.title,
            'parametersGroups',
            '',
            true
        );
    }));
}


async function getCollections(accountId, groupId, credentials, res) {
    let collectionsUrl = config.parameters.URL.COLLECTIONS_URL.format(accountId, groupId);
    let collectionsRes = null;
    try {
      collectionsRes = await apiClientCallAsync('GET', collectionsUrl, credentials.access_token);
    } catch (err) {
      console.error(err)
      return (res.status(500).json({
        diagnostic: 'failed to get the parameters collection info'
      }));
    }

    res.json(collectionsRes.body.results.map((item) => {
        return createTreeNode(
            item.id+'/'+ groupId +'/collections/'+ accountId, 
            item.title,
            'parametersCollections',
            '',
            false
        );
    }));
}

// Format data for tree
function createTreeNode(_id, _text, _type, _cost_container, _children) {
    return { id: _id, text: _text, type: _type, cost_container:_cost_container, children: _children };
}

module.exports = router;
