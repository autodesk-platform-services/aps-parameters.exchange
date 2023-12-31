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
var express = require('express'); 
var router = express.Router(); 

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json(); 
var config = require('../config'); 

const { apiClientCallAsync } = require('./common/apiclient');
const { OAuth } = require('./common/oauth');

const NotAvialableString = 'N/A';


/////////////////////////////////////////////////////////////////////////////
// Add String.format() method if it's not existing
if (!String.prototype.format) {
  String.prototype.format = function () {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function (match, number) {
          return typeof args[number] != 'undefined'
              ? args[number]
              : match
              ;
      });
  };
}


const TokenType = {
  TWOLEGGED: 0,
  THREELEGGED: 1,
  NOTOKEN: 2,
  NOT_SUPPORTED: 9
}


///////////////////////////////////////////////////////////////////////
/// Middleware for obtaining a token for each request.
///////////////////////////////////////////////////////////////////////
router.use(async (req, res, next) => {
  const oauth = new OAuth(req.session);
  req.oauth_client = oauth.getClient();
  req.oauth_token = await oauth.getInternalToken();  
  next();   
});


/////////////////////////////////////////////////////////////////////////////////////////////
/// get parameters in a collection
/////////////////////////////////////////////////////////////////////////////////////////////
router.get('/parameters/collections', jsonParser, async function (req, res) {
  const accountId = req.query.accountId;
  const groupId = req.query.groupId;
  const collectionId = req.query.collectionId;
  if (!accountId || !groupId || !collectionId) {
    console.error('ACC account id, group id or collection id is not provide.');
    return (res.status(400).json({
      diagnostic: 'ACC account id, group id or collection id is not provide.'
    }));
  }  

  let parametersUrl = config.parameters.URL.PARAMETERS_URL.format(accountId, groupId, collectionId);
  let parametersRes = null;
  try {
    parametersRes = await apiClientCallAsync('GET', parametersUrl, req.oauth_token.access_token);
  } catch (err) {
    console.error(err)
    return (res.status(500).json({
      diagnostic: 'failed to get the parameters info'
    }));
  }
  return (res.status(200).json(parametersRes.body.results.filter((item)=>{return !item.isArchived})));
})



/////////////////////////////////////////////////////////////////////////////////////////////
/// get all parameters labels
/////////////////////////////////////////////////////////////////////////////////////////////
router.get('/parameters/labels', jsonParser, async function (req, res) {
  const accountId = req.query.accountId;
  if (!accountId ) {
    console.error('ACC account id is not provide.');
    return (res.status(400).json({
      diagnostic: 'ACC account id is not provide.'
    }));
  }  

  let labelsUrl = config.parameters.URL.LABELS_URL.format(accountId);
  let labelsRes = null;
  try {
    labelsRes = await apiClientCallAsync('GET', labelsUrl, req.oauth_token.access_token);
  } catch (err) {
    console.error(err)
    return (res.status(500).json({
      diagnostic: 'failed to get the parameters label info'
    }));
  }
  return (res.status(200).json(labelsRes.body.results));
})



// /////////////////////////////////////////////////////////////////////////////////////////////
// /// update parameters data
// /////////////////////////////////////////////////////////////////////////////////////////////
router.post('/parameters/info', jsonParser, async function (req, res) {
  const accountId = req.body.accountId;
  const groupId = req.body.groupId;
  const collectionId = req.body.collectionId;
  const parametersType = req.body.parametersType;
  const requestData = req.body.requestData;
  if (!parametersType || !requestData || !accountId || !groupId || !collectionId ) {
    console.error('missing parameters in request body');
    return (res.status(400).json({
      diagnostic: 'missing parameters in request body'
    }));
  }

  let parametersUrl = null;
  switch (parametersType) {
    case 'parameters': {
      parametersUrl = config.parameters.URL.PARAMETERS_URL.format( accountId, groupId, collectionId );
      break;
    };
    case 'labels': {
      // parametersUrl = config.bim360Cost.URL.CONTRACT_URL.format(containerId, requestData.id);
      break;
    }
  };
  let parameterRes = null;
  try {
    parameterRes = await apiClientCallAsync('PATCH', parametersUrl, req.oauth_token.access_token, req.body.requestData);
  } catch (err) {
    console.error(err);
    return (res.status(500).json({
      diagnostic: 'failed to update the parameters info'
    }));
  }
  return (res.status(200).json(parameterRes.body));
})


// /////////////////////////////////////////////////////////////////////////////////////////////
// /// import parameters data
// /////////////////////////////////////////////////////////////////////////////////////////////
router.post('/parameters:import', jsonParser, async function (req, res) {
  const accountId = req.body.accountId;
  const groupId = req.body.groupId;
  const collectionId = req.body.collectionId;
  const requestData = req.body.requestData;
  if ( !requestData || !accountId || !groupId || !collectionId ) {
    console.error('missing parameters in request body');
    return (res.status(400).json({
      diagnostic: 'missing parameters in request body'
    }));
  }

  let parametersUrl = config.parameters.URL.PARAMETERS_URL.format( accountId, groupId, collectionId );

  let parametersInfoRes = null;
  try {
    parametersInfoRes = await apiClientCallAsync('POST', parametersUrl, req.oauth_token.access_token, req.body.requestData);
  } catch (err) {
    console.error(err);
    return (res.status(500).json({
      diagnostic: 'failed to create the parameters info'
    }));
  }
  return (res.status(200).json(parametersInfoRes.body));
})



/////////////////////////////////////////////////////////////////////////////////////////////
/// find real data for the input Id
/////////////////////////////////////////////////////////////////////////////////////////////
router.get('/parameters/type/:typeId/id/:valueId', jsonParser, async function(req, res){
  const typeId = req.params.typeId;
  const valueId = req.params.valueId;
  let requestUrl = null;
  let tokenType = TokenType.TWOLEGGED;

  switch (typeId) {
    case 'metadata.labelIds':{
      const accountId = req.query.accountId;
      const collectionId = req.query.collectionId;
      requestUrl = config.parameters.URL.LABEL_URL.format(accountId, valueId);
      tokenType = TokenType.THREELEGGED;
      break;
    }
    case 'metadata.group': {
      requestUrl = config.parameters.URL.GROUPS_URL;
      tokenType = TokenType.THREELEGGED;
      break;
    }
    case 'specId':{
      if (valueId === config.parameters.RevitFamilyTypeId) {
        return (res.status(200).json({ name: config.parameters.RevitFamilyType }));
      }
      requestUrl = config.parameters.URL.SPECS_URL;
      tokenType = TokenType.THREELEGGED;
      break;
    }
    case 'metadata.specCategoryId':
    case 'metadata.categories':{
      if (valueId === NotAvialableString) {
        return (res.status(200).json({ name: NotAvialableString }));
      }
      requestUrl = config.parameters.URL.CATEGORIES_URL;
      tokenType = TokenType.THREELEGGED;
      break;
    }
    case 'creatorId':
    case 'creator':
    case 'createdBy':
    case 'changedBy':
    case 'contactId':
    case 'signedBy':
    case 'recipients':
    case 'ownerId': {
      const accountId = req.query.accountId;
      requestUrl = config.accountv1.URL.USER_URL.format(accountId, valueId);
      tokenType = TokenType.TWOLEGGED;
      break;
    }
  }
  let token = null;
  if( tokenType === TokenType.TWOLEGGED ){
    const oauth = new OAuth(req.session);
    const oauth_client = oauth.get2LeggedClient(); 
    const oauth_token = await oauth_client.authenticate();
    token = oauth_token.access_token;
  }else if(tokenType === TokenType.THREELEGGED ){
    token = req.oauth_token.access_token;
  }else{
    token = null;
  }
  let response = null;
  let itemList = [];
  let resInfo = {};
  
  // Get the item list or the item info 
  try {
    // Find all results if it has multiple pages
    while(requestUrl) {
      response = await apiClientCallAsync('GET', requestUrl, token);
      if( !response.body || !response.body.pagination )
        break;
      itemList = itemList.concat(response.body.results);
      requestUrl = response.body.pagination.nextUrl;
    }
  } catch (err) {
    console.error( err );
    return (res.status(500).json({
      diagnostic: 'failed to get the real data for the id'
    }));
  }

  // Set the resInfo  with the item info.
  switch (typeId) {
    case 'groupBindingId':
    case 'metadata.group':
      resInfo = itemList.find((item) => {
        return item.bindingId === valueId
      })
      break;

    case 'specId':
    case 'metadata.categories':
    case 'metadata.specCategoryId':
      resInfo = itemList.find((item) => {
        return item.id == valueId
      })
      break;

    case 'createdBy':
      resInfo = response.body;
      break;

    case 'metadata.labelIds':
      resInfo.name = response.body.name;
      break;
  }

  return (res.status(200).json(resInfo));
})


module.exports = router