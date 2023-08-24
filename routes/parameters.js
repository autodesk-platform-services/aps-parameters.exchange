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
/// get different data of cost type
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
      diagnostic: 'failed to get the cost info'
    }));
  }
  return (res.status(200).json(parametersRes.body.results.filter((item)=>{return !item.isArchived})));
})



/////////////////////////////////////////////////////////////////////////////////////////////
/// get different data of cost type
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
      diagnostic: 'failed to get the cost info'
    }));
  }
  return (res.status(200).json(labelsRes.body.results));
})



/////////////////////////////////////////////////////////////////////////////////////////////
/// get different data of cost type
/////////////////////////////////////////////////////////////////////////////////////////////
router.get('/parameters/searches', jsonParser, async function (req, res) {
  const accountId = req.query.accountId;
  const collectionId = req.query.collectionId;
  if (!accountId || !collectionId) {
    console.error('ACC account id or collection id is not provide.');
    return (res.status(400).json({
      diagnostic: 'ACC account id or collection id is not provide.'
    }));
  }  

  let searchesUrl = config.parameters.URL.SEARCHES_URL.format(accountId, collectionId);
  let searchesRes = null;
  try {
    searchesRes = await apiClientCallAsync('GET', searchesUrl, req.oauth_token.access_token);
  } catch (err) {
    console.error(err)
    return (res.status(500).json({
      diagnostic: 'failed to get the saved searches info'
    }));
  }
  return (res.status(200).json(searchesRes.body.results));
})


// /////////////////////////////////////////////////////////////////////////////////////////////
// /// update cost data
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
    case 'saved-searches': {
      // parametersUrl = config.bim360Cost.URL.COSTITEM_URL.format(containerId, requestData.id);
      break;
    }
  };
  let costInfoRes = null;
  try {
    costInfoRes = await apiClientCallAsync('PATCH', parametersUrl, req.oauth_token.access_token, req.body.requestData);
  } catch (err) {
    console.error(err);
    return (res.status(500).json({
      diagnostic: 'failed to update the parameters info'
    }));
  }
  return (res.status(200).json(costInfoRes.body));
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
/// get read data for the input Id 
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
      requestUrl = config.parameters.URL.LABEL_URL.format(accountId, collectionId, valueId);
      tokenType = TokenType.THREELEGGED;
      break;

    }
    // case 'groupId':
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

    case 'metadata.categories':{
      requestUrl = config.parameters.URL.CATEGORIES_URL;
      tokenType = TokenType.THREELEGGED;
      break;
    }

    // case 'categoryBindingIds':
    // case 'metadata.categories': {
    //   requestUrl = config.parameters.URL.CATEGORIES_URL;
    //   tokenType = TokenType.THREELEGGED;
    //   break;
    // }

    case 'creatorId':
    case 'creator':
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

    // case 'contractId': {
    //   var containerId = req.query.costContainerId;
    //   if (!containerId) {
    //     console.error('input container id is not correct.');
    //     return (res.status(400).json({
    //       diagnostic: 'input container id is not correct'
    //     }));
    //   }
    //   requestUrl = config.bim360Cost.URL.CONTRACT_URL.format(containerId, valueId);
    //   tokenType = TokenType.THREELEGGED;
    //   break;
    // }

    // case 'parentId': 
    // case 'rootId':
    // case 'budgets':
    // case 'budget':
    // case 'budgetId':{
    //   var containerId = req.query.costContainerId;
    //   if(!containerId){  
    //     console.error('input container id is not correct.');
    //     return (res.status(400).json({
    //       diagnostic: 'input container id is not correct'
    //     }));
    //   }  
    //   requestUrl = config.bim360Cost.URL.BUDGET_URL.format(containerId, valueId);
    //   tokenType = TokenType.THREELEGGED;
    //   break;
    // }
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
  try {
    response = await apiClientCallAsync( 'GET',  requestUrl, token);
  } catch (err) {
    console.error( err );
    return (res.status(500).json({
      diagnostic: 'failed to get the real data for the id'
    }));
  }
  let detailRes = (response.body);
  // let result = null;
  // handle 'companyId' as a special case
  let companyInfo = {};
  if(typeId === 'companyId' ){
    for( let companyItem in detailRes ){
      if( detailRes[companyItem].member_group_id === valueId ){
        companyInfo.name = detailRes[companyItem].name;
        break;
      }
    }
    detailRes = companyInfo;
  }

  if(typeId === 'groupBindingId' || typeId === 'metadata.group'){
    detailRes = detailRes.results.find( (item) => {
      return item.bindingId === valueId
    })
  }

  if(typeId === 'specId' || typeId === 'metadata.categories'){
    detailRes = detailRes.results.find( (item) => {
      return item.id == valueId
    })
  }

  // if(typeId === 'metadata.labelIds'){
  //   detailRes.name = detailRes.name
  // }

  return (res.status(200).json(detailRes));
})


// /////////////////////////////////////////////////////////////////////////////////////////////
// /// update the custom attributes
// /////////////////////////////////////////////////////////////////////////////////////////////
// router.post('/cost/attribute',jsonParser, async function (req, res) {
//   const containerId = req.body.costContainerId;
//   const requestData = req.body.requestData;
//   if(!containerId || !requestData){  
//     console.error('containerId or requestData is not provided.');
//     return (res.status(400).json({
//       diagnostic: 'containerId or requestData is not provided in request body'
//     }));
//   }  
//   const parametersUrl = config.bim360Cost.URL.CUSTOM_ATTRIBUTE_URL.format(containerId);

//   let costInfoRes = null;
//   try {
//     costInfoRes = await apiClientCallAsync('POST', parametersUrl, req.oauth_token.access_token, requestData);
//   } catch (err) {
//     console.error(err)
//     return (res.status(500).json({
//       diagnostic: 'failed to update custom attribute'
//     }));
//   }
//   res.status(200).json(costInfoRes.body);
// })


module.exports = router