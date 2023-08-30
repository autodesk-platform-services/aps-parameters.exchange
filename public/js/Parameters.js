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


// Define method String.replaceAll 
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
  };
}


findEmbededJsonObject = function (rootObject, key, value) {
  for (let i in value) {
    const newKey = key + '.' + i;
    if ( value[i] != null && typeof value[i] === 'object') {
      findEmbededJsonObject(rootObject, newKey, value[i])
    } else {
      rootObject[newKey] = value[i];
      continue;
    }
  }
}

// the parameters table instance
var parametersTable = null

// the following 2 strings will be used to replace ',','\n' and ' '
const Enter_Replacement = '\xfe';
const Comma_Replacement = '\xfd';
const Space_Replacement = '\xff';

const REVIT_FAMILY_TYPE = "autodesk.revit.spec:familyType";
const Editable_String = "(Editable)";
const NotAvialableString = 'N/A';

// Data type
const DataType = {
  PARAMETERS   : 'parameters',
  LABELS: 'labels'
}

// columns that would be removed by "Row data"
const NotRelevantRowDataProperties = {
  [DataType.PARAMETERS]: [
    'metadata.pimPropDMBehavior',
    'metadata.pimPropBehavior'
  ],
  [DataType.LABELS]: [
  ]
};


// columns that would be removed by "Human readable form"
const NotRelevantReadableProperties = {
  [DataType.PARAMETERS]: [
    'id',
    'metadata.group.id',
    'metadata.pimPropDMBehavior',
    'metadata.pimPropBehavior'
  ],
  [DataType.LABELS]: [
    'id',
  ]
};


// ids which could be replaced by the real data
const IdProperties = {
  [DataType.PARAMETERS]: [
    'createdBy',
    'specId',
    'metadata.group',
    'metadata.categories',
    'metadata.specCategoryId',
    'metadata.labelIds'
  ],  
  [DataType.LABELS]: [
    'libraryId',
  ]
};


const HumanReadableTitleReplacement =
{
  'parameters':
  {
    'name': 'Parameter Name',
    'description': 'Description',
    'readOnly': 'Read only',
    'specId': 'Data Type',
    'createdBy': 'Creator',
    'createdAt': 'Date Created',

    'metadata.isHidden': 'Hidden',
    'metadata.isArchived':'Archived',
    'metadata.instanceTypeAssociation': 'Type or instance',
    'metadata.categories': 'Categories',
    'metadata.labelIds':'Labels',
    'metadata.group.bindingId': 'Properties palette group',
    'metadata.group': 'Properties palette group',
    'metadata.specCategoryId': 'Category'
  },
  'labels':{
    'name':'Name',
    'description':'Description'
  }
};


///////////////////////////////////////////////////
// Shared Parameters
class SharedParamtersConverter{
  constructor(){
  }

  static DbCategoryIdToTypeIdMap = new Map([
    ["-2006202", "autodesk.revit.category.family:abutmentFoundations-1.0.0"],
    ["-2006208", "autodesk.revit.category.family:abutmentFoundationTags-1.0.0"],
    ["-2006203", "autodesk.revit.category.family:abutmentPiles-1.0.0"],
    ["-2006209", "autodesk.revit.category.family:abutmentPileTags-1.0.0"],
    ["-2006204", "autodesk.revit.category.family:abutmentWalls-1.0.0"],
    ["-2006210", "autodesk.revit.category.family:abutmentWallTags-1.0.0"],
    ["-2001015", "autodesk.revit.category.family:alignmentsTags-1.0.0"],
    ["-2009663", "autodesk.revit.category.family:analyticalMemberTags-1.0.0"],
    ["-2000958", "autodesk.revit.category.family:analyticalOpeningTags-1.0.0"],
    ["-2000957", "autodesk.revit.category.family:analyticalPanelTags-1.0.0"],
    ["-2006205", "autodesk.revit.category.family:approachSlabs-1.0.0"],
    ["-2006211", "autodesk.revit.category.family:approachSlabTags-1.0.0"],
    ["-2005252", "autodesk.revit.category.family:areaLoadTags-1.0.0"],
    ["-2009005", "autodesk.revit.category.family:areaReinSpanSymbol-1.0.0"],
    ["-2009021", "autodesk.revit.category.family:areaReinTags-1.0.0"],
    ["-2005020", "autodesk.revit.category.family:areaTags-1.0.0"],
    ["-2000268", "autodesk.revit.category.family:assemblyTags-1.0.0"],
    ["-2001055", "autodesk.revit.category.family:audioVisualDevices-1.0.0"],
    ["-2001057", "autodesk.revit.category.family:audioVisualDeviceTags-1.0.0"],
    ["-2009649", "autodesk.revit.category.family:beamAnalyticalTags-1.0.0"],
    ["-2005130", "autodesk.revit.category.family:beamSystemTags-1.0.0"],
    ["-2005301", "autodesk.revit.category.family:boundaryConditions-1.0.0"],
    ["-2009650", "autodesk.revit.category.family:braceAnalyticalTags-1.0.0"],
    ["-2006130", "autodesk.revit.category.family:bridgeAbutments-1.0.0"],
    ["-2006170", "autodesk.revit.category.family:bridgeAbutmentTags-1.0.0"],
    ["-2006134", "autodesk.revit.category.family:bridgeArches-1.0.0"],
    ["-2006174", "autodesk.revit.category.family:bridgeArchTags-1.0.0"],
    ["-2006138", "autodesk.revit.category.family:bridgeBearings-1.0.0"],
    ["-2006178", "autodesk.revit.category.family:bridgeBearingTags-1.0.0"],
    ["-2006133", "autodesk.revit.category.family:bridgeCables-1.0.0"],
    ["-2006173", "autodesk.revit.category.family:bridgeCableTags-1.0.0"],
    ["-2006135", "autodesk.revit.category.family:bridgeDecks-1.0.0"],
    ["-2006175", "autodesk.revit.category.family:bridgeDeckTags-1.0.0"],
    ["-2006136", "autodesk.revit.category.family:bridgeFoundations-1.0.0"],
    ["-2006176", "autodesk.revit.category.family:bridgeFoundationTags-1.0.0"],
    ["-2006241", "autodesk.revit.category.family:bridgeFraming-1.0.0"],
    ["-2006245", "autodesk.revit.category.family:bridgeFramingCrossBracing-1.0.0"],
    ["-2006278", "autodesk.revit.category.family:bridgeFramingCrossBracingTags-1.0.0"],
    ["-2006246", "autodesk.revit.category.family:bridgeFramingDiaphragms-1.0.0"],
    ["-2006279", "autodesk.revit.category.family:bridgeFramingDiaphragmTags-1.0.0"],
    ["-2006243", "autodesk.revit.category.family:bridgeFramingTags-1.0.0"],
    ["-2006248", "autodesk.revit.category.family:bridgeFramingTrusses-1.0.0"],
    ["-2006281", "autodesk.revit.category.family:bridgeFramingTrussTags-1.0.0"],
    ["-2006137", "autodesk.revit.category.family:bridgeGirders-1.0.0"],
    ["-2006177", "autodesk.revit.category.family:bridgeGirderTags-1.0.0"],
    ["-2006131", "autodesk.revit.category.family:bridgePiers-1.0.0"],
    ["-2006171", "autodesk.revit.category.family:bridgePierTags-1.0.0"],
    ["-2006132", "autodesk.revit.category.family:bridgeTowers-1.0.0"],
    ["-2006172", "autodesk.revit.category.family:bridgeTowerTags-1.0.0"],
    ["-2008126", "autodesk.revit.category.family:cableTrayFitting-1.0.0"],
    ["-2008127", "autodesk.revit.category.family:cableTrayFittingTags-1.0.0"],
    ["-2008131", "autodesk.revit.category.family:cableTrayTags-1.0.0"],
    ["-2000538", "autodesk.revit.category.family:calloutHeads-1.0.0"],
    ["-2001000", "autodesk.revit.category.family:casework-1.0.0"],
    ["-2005001", "autodesk.revit.category.family:caseworkTags-1.0.0"],
    ["-2005002", "autodesk.revit.category.family:ceilingTags-1.0.0"],
    ["-2009651", "autodesk.revit.category.family:columnAnalyticalTags-1.0.0"],
    ["-2000100", "autodesk.revit.category.family:columns-1.0.0"],
    ["-2001063", "autodesk.revit.category.family:columnTags-1.0.0"],
    ["-2008081", "autodesk.revit.category.family:communicationDevices-1.0.0"],
    ["-2008082", "autodesk.revit.category.family:communicationDeviceTags-1.0.0"],
    ["-2008128", "autodesk.revit.category.family:conduitFitting-1.0.0"],
    ["-2008129", "autodesk.revit.category.family:conduitFittingTags-1.0.0"],
    ["-2008133", "autodesk.revit.category.family:conduitTags-1.0.0"],
    ["-2009060", "autodesk.revit.category.family:coupler-1.0.0"],
    ["-2009061", "autodesk.revit.category.family:couplerTags-1.0.0"],
    ["-2005032", "autodesk.revit.category.family:curtainWallMullionTags-1.0.0"],
    ["-2000170", "autodesk.revit.category.family:curtainWallPanels-1.0.0"],
    ["-2005012", "autodesk.revit.category.family:curtainWallPanelTags-1.0.0"],
    ["-2008083", "autodesk.revit.category.family:dataDevices-1.0.0"],
    ["-2008084", "autodesk.revit.category.family:dataDeviceTags-1.0.0"],
    ["-2002000", "autodesk.revit.category.family:detailComponents-1.0.0"],
    ["-2005028", "autodesk.revit.category.family:detailComponentTags-1.0.0"],
    ["-2008165", "autodesk.revit.category.family:divisionProfile-1.0.0"],
    ["-2000023", "autodesk.revit.category.family:doors-1.0.0"],
    ["-2000460", "autodesk.revit.category.family:doorTags-1.0.0"],
    ["-2008016", "autodesk.revit.category.family:ductAccessory-1.0.0"],
    ["-2008017", "autodesk.revit.category.family:ductAccessoryTags-1.0.0"],
    ["-2008010", "autodesk.revit.category.family:ductFitting-1.0.0"],
    ["-2008061", "autodesk.revit.category.family:ductFittingTags-1.0.0"],
    ["-2008153", "autodesk.revit.category.family:ductInsulationsTags-1.0.0"],
    ["-2008154", "autodesk.revit.category.family:ductLiningsTags-1.0.0"],
    ["-2008003", "autodesk.revit.category.family:ductTags-1.0.0"],
    ["-2008013", "autodesk.revit.category.family:ductTerminal-1.0.0"],
    ["-2008014", "autodesk.revit.category.family:ductTerminalTags-1.0.0"],
    ["-2001078", "autodesk.revit.category.family:electrical_AreaBasedLoads_Tags-1.0.0"],
    ["-2001102", "autodesk.revit.category.family:electricalConnectorTags-1.0.0"],
    ["-2001040", "autodesk.revit.category.family:electricalEquipment-1.0.0"],
    ["-2005003", "autodesk.revit.category.family:electricalEquipmentTags-1.0.0"],
    ["-2001060", "autodesk.revit.category.family:electricalFixtures-1.0.0"],
    ["-2005004", "autodesk.revit.category.family:electricalFixtureTags-1.0.0"],
    ["-2006045", "autodesk.revit.category.family:elevationMarks-1.0.0"],
    ["-2001370", "autodesk.revit.category.family:entourage-1.0.0"],
    ["-2001064", "autodesk.revit.category.family:entourageTags-1.0.0"],
    ["-2006271", "autodesk.revit.category.family:expansionJoints-1.0.0"],
    ["-2006273", "autodesk.revit.category.family:expansionJointTags-1.0.0"],
    ["-2008213", "autodesk.revit.category.family:fabricationContainmentTags-1.0.0"],
    ["-2008228", "autodesk.revit.category.family:fabricationDuctworkStiffeners-1.0.0"],
    ["-2008229", "autodesk.revit.category.family:fabricationDuctworkStiffenerTags-1.0.0"],
    ["-2008194", "autodesk.revit.category.family:fabricationDuctworkTags-1.0.0"],
    ["-2008204", "autodesk.revit.category.family:fabricationHangerTags-1.0.0"],
    ["-2008209", "autodesk.revit.category.family:fabricationPipeworkTags-1.0.0"],
    ["-2009022", "autodesk.revit.category.family:fabricReinforcementTags-1.0.0"],
    ["-2009028", "autodesk.revit.category.family:fabricReinSpanSymbol-1.0.0"],
    ["-2001062", "autodesk.revit.category.family:fasciaTags-1.0.0"],
    ["-2008085", "autodesk.revit.category.family:fireAlarmDevices-1.0.0"],
    ["-2008086", "autodesk.revit.category.family:fireAlarmDeviceTags-1.0.0"],
    ["-2001049", "autodesk.revit.category.family:fireProtection-1.0.0"],
    ["-2001051", "autodesk.revit.category.family:fireProtectionTags-1.0.0"],
    ["-2008004", "autodesk.revit.category.family:flexDuctTags-1.0.0"],
    ["-2008048", "autodesk.revit.category.family:flexPipeTags-1.0.0"],
    ["-2009652", "autodesk.revit.category.family:floorAnalyticalTags-1.0.0"],
    ["-2005026", "autodesk.revit.category.family:floorTags-1.0.0"],
    ["-2001043", "autodesk.revit.category.family:foodServiceEquipment-1.0.0"],
    ["-2001045", "autodesk.revit.category.family:foodServiceEquipmentTags-1.0.0"],
    ["-2005111", "autodesk.revit.category.family:footingSpanDirectionSymbol-1.0.0"],
    ["-2009656", "autodesk.revit.category.family:foundationSlabAnalyticalTags-1.0.0"],
    ["-2000080", "autodesk.revit.category.family:furniture-1.0.0"],
    ["-2001100", "autodesk.revit.category.family:furnitureSystems-1.0.0"],
    ["-2005007", "autodesk.revit.category.family:furnitureSystemTags-1.0.0"],
    ["-2005006", "autodesk.revit.category.family:furnitureTags-1.0.0"],
    ["-2000150", "autodesk.revit.category.family:genericAnnotation-1.0.0"],
    ["-2000151", "autodesk.revit.category.family:genericModel-1.0.0"],
    ["-2005013", "autodesk.revit.category.family:genericModelTags-1.0.0"],
    ["-2006040", "autodesk.revit.category.family:gridHeads-1.0.0"],
    ["-2001065", "autodesk.revit.category.family:gutterTags-1.0.0"],
    ["-2001066", "autodesk.revit.category.family:handrailTags-1.0.0"],
    ["-2001036", "autodesk.revit.category.family:hardscape-1.0.0"],
    ["-2001038", "autodesk.revit.category.family:hardscapeTags-1.0.0"],
    ["-2005255", "autodesk.revit.category.family:internalAreaLoadTags-1.0.0"],
    ["-2005254", "autodesk.revit.category.family:internalLineLoadTags-1.0.0"],
    ["-2005253", "autodesk.revit.category.family:internalPointLoadTags-1.0.0"],
    ["-2009654", "autodesk.revit.category.family:isolatedFoundationAnalyticalTags-1.0.0"],
    ["-2005029", "autodesk.revit.category.family:keynoteTags-1.0.0"],
    ["-2008114", "autodesk.revit.category.family:layoutPath_Bases-1.0.0"],
    ["-2008192", "autodesk.revit.category.family:layoutPathBase_Pipings-1.0.0"],
    ["-2006020", "autodesk.revit.category.family:levelHeads-1.0.0"],
    ["-2008087", "autodesk.revit.category.family:lightingDevices-1.0.0"],
    ["-2008088", "autodesk.revit.category.family:lightingDeviceTags-1.0.0"],
    ["-2001120", "autodesk.revit.category.family:lightingFixtures-1.0.0"],
    ["-2005008", "autodesk.revit.category.family:lightingFixtureTags-1.0.0"],
    ["-2005251", "autodesk.revit.category.family:lineLoadTags-1.0.0"],
    ["-2000955", "autodesk.revit.category.family:linkAnalyticalTags-1.0.0"],
    ["-2003400", "autodesk.revit.category.family:mass-1.0.0"],
    ["-2003410", "autodesk.revit.category.family:massAreaFaceTags-1.0.0"],
    ["-2003405", "autodesk.revit.category.family:massTags-1.0.0"],
    ["-2005027", "autodesk.revit.category.family:materialTags-1.0.0"],
    ["-2008232", "autodesk.revit.category.family:mechanicalControlDevices-1.0.0"],
    ["-2008233", "autodesk.revit.category.family:mechanicalControlDeviceTags-1.0.0"],
    ["-2001140", "autodesk.revit.category.family:mechanicalEquipment-1.0.0"],
    ["-2000986", "autodesk.revit.category.family:mechanicalEquipmentSetTags-1.0.0"],
    ["-2005009", "autodesk.revit.category.family:mechanicalEquipmentTags-1.0.0"],
    ["-2001046", "autodesk.revit.category.family:medicalEquipment-1.0.0"],
    ["-2001048", "autodesk.revit.category.family:medicalEquipmentTags-1.0.0"],
    ["-2008231", "autodesk.revit.category.family:mepAncillaryFraming-1.0.0"],
    ["-2008236", "autodesk.revit.category.family:mepAncillaryFramingTags-1.0.0"],
    ["-2000485", "autodesk.revit.category.family:mepSpaceTags-1.0.0"],
    ["-2001007", "autodesk.revit.category.family:mepSystemZoneTags-1.0.0"],
    ["-2001073", "autodesk.revit.category.family:modelGroupTags-1.0.0"],
    ["-2000956", "autodesk.revit.category.family:nodeAnalyticalTags-1.0.0"],
    ["-2008077", "autodesk.revit.category.family:nurseCallDevices-1.0.0"],
    ["-2008078", "autodesk.revit.category.family:nurseCallDeviceTags-1.0.0"],
    ["-2001067", "autodesk.revit.category.family:padTags-1.0.0"],
    ["-2001180", "autodesk.revit.category.family:parking-1.0.0"],
    ["-2005017", "autodesk.revit.category.family:parkingTags-1.0.0"],
    ["-2000270", "autodesk.revit.category.family:partTags-1.0.0"],
    ["-2000834", "autodesk.revit.category.family:pathOfTravelTags-1.0.0"],
    ["-2009010", "autodesk.revit.category.family:pathReinSpanSymbol-1.0.0"],
    ["-2009011", "autodesk.revit.category.family:pathReinTags-1.0.0"],
    ["-2006219", "autodesk.revit.category.family:pierCaps-1.0.0"],
    ["-2006220", "autodesk.revit.category.family:pierCapTags-1.0.0"],
    ["-2006221", "autodesk.revit.category.family:pierColumns-1.0.0"],
    ["-2006222", "autodesk.revit.category.family:pierColumnTags-1.0.0"],
    ["-2006225", "autodesk.revit.category.family:pierPiles-1.0.0"],
    ["-2006226", "autodesk.revit.category.family:pierPileTags-1.0.0"],
    ["-2006229", "autodesk.revit.category.family:pierWalls-1.0.0"],
    ["-2006230", "autodesk.revit.category.family:pierWallTags-1.0.0"],
    ["-2008055", "autodesk.revit.category.family:pipeAccessory-1.0.0"],
    ["-2008056", "autodesk.revit.category.family:pipeAccessoryTags-1.0.0"],
    ["-2008049", "autodesk.revit.category.family:pipeFitting-1.0.0"],
    ["-2008060", "autodesk.revit.category.family:pipeFittingTags-1.0.0"],
    ["-2008155", "autodesk.revit.category.family:pipeInsulationsTags-1.0.0"],
    ["-2008047", "autodesk.revit.category.family:pipeTags-1.0.0"],
    ["-2001360", "autodesk.revit.category.family:planting-1.0.0"],
    ["-2005021", "autodesk.revit.category.family:plantingTags-1.0.0"],
    ["-2008234", "autodesk.revit.category.family:plumbingEquipment-1.0.0"],
    ["-2008235", "autodesk.revit.category.family:plumbingEquipmentTags-1.0.0"],
    ["-2001160", "autodesk.revit.category.family:plumbingFixtures-1.0.0"],
    ["-2005010", "autodesk.revit.category.family:plumbingFixtureTags-1.0.0"],
    ["-2005250", "autodesk.revit.category.family:pointLoadTags-1.0.0"],
    ["-2003000", "autodesk.revit.category.family:profileFamilies-1.0.0"],
    ["-2000948", "autodesk.revit.category.family:railingSupport-1.0.0"],
    ["-2000949", "autodesk.revit.category.family:railingTermination-1.0.0"],
    ["-2001068", "autodesk.revit.category.family:rampTags-1.0.0"],
    ["-2009013", "autodesk.revit.category.family:rebarShape-1.0.0"],
    ["-2009020", "autodesk.revit.category.family:rebarTags-1.0.0"],
    ["-2000197", "autodesk.revit.category.family:referenceViewerSymbol-1.0.0"],
    ["-2006080", "autodesk.revit.category.family:revisionCloudTags-1.0.0"],
    ["-2000989", "autodesk.revit.category.family:riseDropSymbols-1.0.0"],
    ["-2001220", "autodesk.revit.category.family:roads-1.0.0"],
    ["-2001221", "autodesk.revit.category.family:roadTags-1.0.0"],
    ["-2001069", "autodesk.revit.category.family:roofSoffitTags-1.0.0"],
    ["-2000266", "autodesk.revit.category.family:roofTags-1.0.0"],
    ["-2000480", "autodesk.revit.category.family:roomTags-1.0.0"],
    ["-2001074", "autodesk.revit.category.family:rvtLinksTags-1.0.0"],
    ["-2000400", "autodesk.revit.category.family:sectionHeads-1.0.0"],
    ["-2008079", "autodesk.revit.category.family:securityDevices-1.0.0"],
    ["-2008080", "autodesk.revit.category.family:securityDeviceTags-1.0.0"],
    ["-2001058", "autodesk.revit.category.family:signage-1.0.0"],
    ["-2001061", "autodesk.revit.category.family:signageTags-1.0.0"],
    ["-2001260", "autodesk.revit.category.family:site-1.0.0"],
    ["-2001269", "autodesk.revit.category.family:sitePropertyLineSegmentTags-1.0.0"],
    ["-2001267", "autodesk.revit.category.family:sitePropertyTags-1.0.0"],
    ["-2005016", "autodesk.revit.category.family:siteTags-1.0.0"],
    ["-2001070", "autodesk.revit.category.family:slabEdgeTags-1.0.0"],
    ["-2005110", "autodesk.revit.category.family:spanDirectionSymbol-1.0.0"],
    ["-2001350", "autodesk.revit.category.family:specialityEquipment-1.0.0"],
    ["-2005014", "autodesk.revit.category.family:specialityEquipmentTags-1.0.0"],
    ["-2005100", "autodesk.revit.category.family:spotElevSymbols-1.0.0"],
    ["-2008099", "autodesk.revit.category.family:sprinklers-1.0.0"],
    ["-2008100", "autodesk.revit.category.family:sprinklerTags-1.0.0"],
    ["-2000941", "autodesk.revit.category.family:stairsLandingTags-1.0.0"],
    ["-2000126", "autodesk.revit.category.family:stairsRailing-1.0.0"],
    ["-2000127", "autodesk.revit.category.family:stairsRailingBaluster-1.0.0"],
    ["-2000133", "autodesk.revit.category.family:stairsRailingTags-1.0.0"],
    ["-2000940", "autodesk.revit.category.family:stairsRunTags-1.0.0"],
    ["-2000942", "autodesk.revit.category.family:stairsSupportTags-1.0.0"],
    ["-2005023", "autodesk.revit.category.family:stairsTags-1.0.0"],
    ["-2009057", "autodesk.revit.category.family:structConnectionAnchorTags-1.0.0"],
    ["-2009056", "autodesk.revit.category.family:structConnectionBoltTags-1.0.0"],
    ["-2009063","autodesk.revit.category.family:structConnectionHoleTags-1.0.0"],
    ["-2009055","autodesk.revit.category.family:structConnectionPlateTags-1.0.0"],
    ["-2009064","autodesk.revit.category.family:structConnectionProfilesTags-1.0.0"],
    ["-2009030", "autodesk.revit.category.family:structConnections-1.0.0"],
    ["-2009058","autodesk.revit.category.family:structConnectionShearStudTags-1.0.0"],
    ["-2006100","autodesk.revit.category.family:structConnectionSymbols-1.0.0"],
    ["-2009040", "autodesk.revit.category.family:structConnectionTags-1.0.0"],
    ["-2009059","autodesk.revit.category.family:structConnectionWeldTags-1.0.0"],
    ["-2006110","autodesk.revit.category.family:structuralBracePlanReps-1.0.0"],
    ["-2001330", "autodesk.revit.category.family:structuralColumns-1.0.0"],
    ["-2005018", "autodesk.revit.category.family:structuralColumnTags-1.0.0"],
    ["-2001300", "autodesk.revit.category.family:structuralFoundation-1.0.0"],
    ["-2005019","autodesk.revit.category.family:structuralFoundationTags-1.0.0"],
    ["-2001320", "autodesk.revit.category.family:structuralFraming-1.0.0"],
    ["-2005015","autodesk.revit.category.family:structuralFramingTags-1.0.0"],
    ["-2001354", "autodesk.revit.category.family:structuralStiffener-1.0.0"],
    ["-2001355","autodesk.revit.category.family:structuralStiffenerTags-1.0.0"],
    ["-2006274", "autodesk.revit.category.family:structuralTendons-1.0.0"],
    ["-2006276", "autodesk.revit.category.family:structuralTendonTags-1.0.0"],
    ["-2008075", "autodesk.revit.category.family:telephoneDevices-1.0.0"],
    ["-2008076", "autodesk.revit.category.family:telephoneDeviceTags-1.0.0"],
    ["-2001039", "autodesk.revit.category.family:temporaryStructure-1.0.0"],
    ["-2001042","autodesk.revit.category.family:temporaryStructureTags-1.0.0"],
    ["-2000280", "autodesk.revit.category.family:titleBlocks-1.0.0"],
    ["-2001103", "autodesk.revit.category.family:toposolidLinkTags-1.0.0"],
    ["-2001094", "autodesk.revit.category.family:toposolidTags-1.0.0"],
    ["-2001071", "autodesk.revit.category.family:topRailTags-1.0.0"],
    ["-2009600", "autodesk.revit.category.family:truss-1.0.0"],
    ["-2005030", "autodesk.revit.category.family:trussTags-1.0.0"],
    ["-2001052", "autodesk.revit.category.family:verticalCirculation-1.0.0"],
    ["-2001054","autodesk.revit.category.family:verticalCirculationTags-1.0.0"],
    ["-2006263", "autodesk.revit.category.family:vibrationDampers-1.0.0"],
    ["-2006264", "autodesk.revit.category.family:vibrationDamperTags-1.0.0"],
    ["-2006265", "autodesk.revit.category.family:vibrationIsolators-1.0.0"],
    ["-2006266","autodesk.revit.category.family:vibrationIsolatorTags-1.0.0"],
    ["-2006261", "autodesk.revit.category.family:vibrationManagement-1.0.0"],
    ["-2006282","autodesk.revit.category.family:vibrationManagementTags-1.0.0"],
    ["-2000515", "autodesk.revit.category.family:viewportLabel-1.0.0"],
    ["-2009653", "autodesk.revit.category.family:wallAnalyticalTags-1.0.0"],
    ["-2009655","autodesk.revit.category.family:wallFoundationAnalyticalTags-1.0.0"],
    ["-2001072", "autodesk.revit.category.family:wallSweepTags-1.0.0"],
    ["-2005011", "autodesk.revit.category.family:wallTags-1.0.0"],
    ["-2000014", "autodesk.revit.category.family:windows-1.0.0"],
    ["-2000450", "autodesk.revit.category.family:windowTags-1.0.0"],
    ["-2008057", "autodesk.revit.category.family:wireTags-1.0.0"],
    ["-2008074", "autodesk.revit.category.family:wireTickMarks-1.0.0"],
    ["-2008115", "autodesk.revit.category.family:zoneTags-1.0.0"],
  ]);


  static DbStringToSpecMap = new Map([
    ["NOOFPOLES", "autodesk.spec.aec:numberOfPoles-2.0.0"],
    ["NUMBER", "autodesk.spec.aec:number-2.0.0"],
    ["FIXTUREUNIT", "autodesk.spec.aec:number-2.0.0"],
    ["MATERIAL", "autodesk.spec.aec:material-1.0.0"],
    ["IMAGE", "autodesk.spec.reference:image-1.0.0"],
    ["MULTILINETEXT", "autodesk.spec.aec:multilineText-2.0.0"],
    ["LOADCLASSIFICATION", "autodesk.spec.aec.electrical:loadClassification-1.0.0"],
    ["URL", "autodesk.spec.string:url-2.0.0"],
    ["TEXT", "autodesk.spec:spec.string-2.0.0"],
    ["YESNO", "autodesk.spec:spec.bool-1.0.0"],
    ["INTEGER", "autodesk.spec:spec.int64-2.0.0"],
    ["FAMILYTYPE", "autodesk.revit.spec:familyType-1.0.0"],
    ["", ""],
    ["ELEMENTTYPE", "autodesk.revit.spec:elementType-1.0.0"],
    ["TIMEINTERVAL","autodesk.spec.aec:time-2.0.0"]
  ]);

  static DbStringToElemTypeSpecMap = new Map([
    ["FAMILYSYMBOLTYPE", 1],
    ["DIVIDEDSURFACETYPE", 2],
    ["COMPONENTREPEATERTYPE", 3],
  ]);

  // convert to DB String from Spec ID
  static getDbString( apsSpecId){
    for( const [key, value ] of SharedParamtersConverter.DbStringToSpecMap ){
      if( value == apsSpecId )
        return key;
    }
    return apsSpecId;
  }

  // convert to Spec ID from DB String
  static getSpecId( dbStringId){
    return SharedParamtersConverter.DbStringToSpecMap.get(dbStringId);
  }

  // convert to DB Category Id from Spect Type ID
  static convertSpecTypeIdToDBCategoryId( typeId, name='' ){
    for( const [key, value ] of SharedParamtersConverter.DbCategoryIdToTypeIdMap ){
      if( value == typeId )
        return key;
    }
    return null;
  }
  
  // convert to Spec Type ID from DB Category
  static convertDBCategoryIdToSpecTypeId( dbString ){
    return SharedParamtersConverter.DbCategoryIdToTypeIdMap.get(dbString);
  }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Cost Table class that manage the operation to the table
class ParametersTable {
  constructor(tableId, accountId, groupId, collectionId, currentDataType, dataSet = []) {
    this.tableId = tableId;
    this.accountId = accountId;
    this.groupId = groupId;
    this.collectionId = collectionId;
    this.dataSet = dataSet;
    this.currentDataType = currentDataType;
    this.isHumanReadable = false;
    this.csvData = null;
    this.txtData = null;
    this.cachedInfo = {
      DataInfo: []
    }
  };


  // get the required data for parameters table
  async fetchDataOfCurrentDataTypeAsync() {
    this.dataSet = [];

    let requestUrl = null;
    let requestData = {
      'accountId': this.accountId,
      'groupId': this.groupId,
      'collectionId': this.collectionId
    };

    switch (this.currentDataType) {
      case DataType.PARAMETERS:
        requestUrl = '/api/aps/parameters/collections';
        break;
      case DataType.LABELS:
        requestUrl = '/api/aps/parameters/labels';
        break;
      default:
        console.log(`failed to set current data set due to the wrong type.`);
        return;
    }
    try {
      this.dataSet = await apiClientAsync(requestUrl, requestData);
    } catch (err) {
      console.log(err);
    }
  };


  // prepare|customize the data to be displayed in the parameters table
  async polishDataOfCurrentDataTypeAsync() {
    if (this.dataSet.length === 0)
      return;

    try {
      await this.customizeProperties();
      this.removeNotRelevantColumns();
      if (this.IsHumanReadable) {
        await this.updateIdToHumanReadableData();
        this.humanReadableTitles();
      }
      // prepare to export CSV and TXT for parameters
      if(this.currentDataType == DataType.PARAMETERS){
        this.txtData = this.prepareTxtData();
        this.appendEditable();
        this.sortProperties();
        this.csvData = this.prepareCSVData();
      }
    }
    catch (err) {
      console.log(err);
    }
  };


  // raw data or human readable data
  set IsHumanReadable(isHumanReadable = fasle) {
    this.isHumanReadable = isHumanReadable;
  };

  get IsHumanReadable() {
    return this.isHumanReadable;
  }

  // get current data type 
  get CurrentDataType() {
    return this.currentDataType;
  }

  // set current data type
  set CurrentDataType(dataType = DataType.PARAMETERS) {
    this.currentDataType = dataType;
    switch (this.currentDataType) {
      case DataType.PARAMETERS: {
        this.tableId = '#parametersTable';
        break;
      }
      case DataType.LABELS: {
        this.tableId = '#labelsTable'
        break;
      }
    }
  };

  // current table id
  set CurrentTableId(newTableId) {
    this.tableId = newTableId;
  };


  // protected: remove not relevant properties to make it clear
  removeNotRelevantColumns = function () {
    if (this.IsHumanReadable) {
      NotRelevantReadableProperties[this.currentDataType].forEach((propertyName) => {
        this.removeColumns(propertyName)
      })
    } else {
      NotRelevantRowDataProperties[this.currentDataType].forEach((propertyName) => {
        this.removeColumns(propertyName)
      })
    }
  }


  sortProperties = function () {
  }


  // draw the table based on the current data
  drawCostTable() {
    let columns = [];
    if (this.dataSet.length !== 0) {
      for (var key in this.dataSet[0]) {
        columns.push({
          field: key,
          title: key,
          align: "center"
        })
      }
    }

    $(this.tableId).bootstrapTable('destroy');

    $(this.tableId).bootstrapTable({
      data: this.dataSet,
      editable: true,
      clickToSelect: true,
      cache: false,
      showToggle: false,
      showPaginationSwitch: false,
      pagination: true,
      pageList: [5, 10, 25, 50, 100],
      pageSize: 5,
      pageNumber: 1,
      uniqueId: 'id',
      striped: true,
      search: true,
      showRefresh: false,
      minimumCountColumns: 2,
      smartDisplay: true,
      columns: columns
    });
  };


  // export data in parameters table to CSV file
  exportCSV() {
    let csvString = this.csvData.join("%0A");
    let a = document.createElement('a');
    a.href = 'data:attachment/csv,' + csvString;
    a.target = '_blank';
    a.download = this.currentDataType + (new Date()).getTime() + '.csv';
    document.body.appendChild(a);
    a.click();
  }



  // export data in parameters table to TXT file
  exportTxt() {
    let csvString = this.txtData;
    let a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvString);
    a.target = '_blank';
    a.download = this.currentDataType + (new Date()).getTime() + '.txt';
    document.body.appendChild(a);
    a.click();
  }


  // protected: adjust the value of some array|object properties
  customizeProperties = async function () {
    var keyList = [];
    for (var item of this.dataSet) {
      if (item['metadata'] != null) {
        item['metadata'].forEach((metadataItem) => { keyList.push(metadataItem.id) })
      }
    }

    const newKeyList = keyList.filter((item, index) => keyList.indexOf(item) === index);
    console.log(newKeyList)

    this.dataSet.forEach((rowData) => {

      for (var key of newKeyList) {
        let data = rowData['metadata'].find(item => { return (item.id == key) })
        if (data == null) {
          const itemId = "metadata." + key;
          rowData[itemId] = NotAvialableString;
          continue;
        }

        switch (key) {
          case 'categories': {
            let categoriesText = '';
            const categoriesCount = data.value.length;
            for (let i = 0; i < categoriesCount; ++i) {
              categoriesText += data.value[i].id;
              categoriesText += ';';
            }
            const itemId = "metadata.categories";
            rowData[itemId] = categoriesText;
          }
          case 'group': {
            const itemId = "metadata.group";
            if (data.value == null) {
              rowData[itemId] = "";
            } else {
              const groupBindingId = data.value.bindingId;
              rowData[itemId] = groupBindingId;
            }
            break;
          }
          case 'labelIds': {
            const itemId = "metadata.labelIds";
            if (data.value == null) {
              rowData[itemId] = "";
            } else {
              let labelIdsText = '';
              const labelsCount = data.value.length;
              for (let i = 0; i < labelsCount; ++i) {
                labelIdsText += data.value[i];
                labelIdsText += ';';
              }
              rowData[itemId] = labelIdsText;
            }
            break;
          }
          default: {
            const newKey = 'metadata.' + key;
            rowData[newKey] = data.value;
          }
        }
      }
    })

    this.removeColumns('metadata');
  };



  // protected: Append the string "Editable" to the property name if this could be edited
  appendEditable() {
    for (var key in this.dataSet[0]) {
      const editableProp = isTypeSupported(key, this.currentDataType)
      if (editableProp === TypeSupported.NOT_SUPPORTED) {
        continue;
      }
      let newKey = key + Editable_String;
      this.dataSet.forEach((row) => {
        row[newKey] = row[key];
        delete row[key];
      })
    }
  }


  // protected: change the title to be easily understood
  humanReadableTitles() {
    for (var key in this.dataSet[0]) {
      const readableKey = HumanReadableTitleReplacement[this.currentDataType][key];
      if (!readableKey)
        continue;
      this.dataSet.forEach((row) => {
        row[readableKey] = row[key];
        delete row[key];
      })
    }
  }


  // protected: convert Ids to readable data
  async updateIdToHumanReadableData() {
    await Promise.all(
      IdProperties[this.currentDataType].map(async (propertyName) => {
        try {
          await this.updateTableContent(propertyName);
        } catch (err) {
          console.log(err);
        }
      })
    )
    console.log("all the ids are updated to real content.");
  };


  // protected: update all the properties within this column to the real name
  async updateTableContent(keyName) {
    /// get the real data from the Id
    for (let i in this.dataSet) {
      if (keyName == null || this.dataSet[i][keyName] == null)
        continue;

      let idArray = this.dataSet[i][keyName].split(';');
      let textArray = [];

      // wait here until all the ids are converted.
      await Promise.all(
        idArray.map(async (id) => {
          const idWithoutSpace = id.split(' ').join('');
          if (idWithoutSpace === '')
            return;
          // Check if it's cached
          let dataCached = false;
          // const cacheCount = this.cachedInfo.DataInfo.length;
          for (let j in this.cachedInfo.DataInfo) {
            if (this.cachedInfo.DataInfo[j].Id === idWithoutSpace) {
              textArray.push(this.cachedInfo.DataInfo[j].Value);
              dataCached = true;
              break;
            }
          }
          if (!dataCached) {
            try {
              const realValue = await this.getContentFromId(keyName, idWithoutSpace);
              this.cachedInfo.DataInfo.push({ Id: idWithoutSpace, Value: realValue })
              textArray.push(realValue);
            }
            catch (err) {
              console.log("Failed to get data " + idWithoutSpace + " for " + keyName);
            }
          }
        })
      )
      this.dataSet[i][keyName] = textArray[0];
      for (let k = 1; k < textArray.length; k++) {
        this.dataSet[i][keyName] = this.dataSet[i][keyName] + ';' + textArray[k];
      }
    }
  }


  // protected: get the real data for the specified id
  async getContentFromId(propertyName, propertyId) {
    if (propertyName == null || propertyId == null) {
      console.log('input parameters is not valid.');
      return;
    }
    const requestUrl = '/api/aps/parameters/type/' + encodeURIComponent(propertyName) + '/id/' + encodeURIComponent(propertyId);
    const requestData = {
      'accountId': this.accountId,
      'collectionId': this.collectionId
    };
    try {
      const respBody = await apiClientAsync(requestUrl, requestData);
      return respBody.name;
    } catch (err) {
      console.error(err);
      return 'Not Found';
    }
  }



  // protected: update the parameter entity info
  async updateEntityInfo(requestData) {
    try {
      const requestUrl = '/api/aps/parameters/info';
      const requestBody = {
        'accountId': this.accountId,
        'groupId': this.groupId,
        'collectionId': this.collectionId,
        'parametersType': this.currentDataType,
        'requestData': requestData
      };
      return await apiClientAsync(requestUrl, requestBody, 'post');
    } catch (err) {
      console.error(err);
      return null;
    }
  }


  // protected: import the parameters info
  async importParameters(requestData) {
    try {
      const requestUrl = '/api/aps/parameters:import';
      const requestBody = {
        'accountId': this.accountId,
        'groupId': this.groupId,
        'collectionId': this.collectionId,
        'requestData': requestData
      };
      return await apiClientAsync(requestUrl, requestBody, 'post');
    } catch (err) {
      console.error(err);
      return null;
    }
  }



  // protected: get the data cached to be exported to CSV later
  prepareCSVData() {

    let csvRows = [];
    let csvHeader = [];

    // Set the header of CSV
    for (var key in this.dataSet[0]) {
      csvHeader.push(key);
    }
    csvRows.push(csvHeader);

    // Set the row data of CSV
    this.dataSet.forEach((item) => {
      let csvRowTmp = [];
      for (key in item) {
        // TBD: special handle core.description property since it includes a rich text
        if (key.includes('description') && item[key] != null) {
          let tmpStr = item[key].replaceAll(',', Comma_Replacement).replaceAll('\n', Enter_Replacement).replaceAll(' ', Space_Replacement);
          csvRowTmp.push(tmpStr);
        } else {
          csvRowTmp.push(item[key] == null ? "" : item[key]);
        }
      }
      csvRows.push(csvRowTmp);
    })
    return csvRows;
  };

  prepareTxtData(){
    var sharedParamsTxt = "#This is a Revit shared parameter file.\n#Do not edit manually.\n*META VERSION	MINVERSION\nMETA\t2\t1\n";

    sharedParamsTxt += `*GROUP	ID	NAME\n`;
    sharedParamsTxt += `GROUP`+`\t`+`1`+`\t`+`NA`+'\n';
    sharedParamsTxt += `*PARAM	GUID	NAME	DATATYPE	DATACATEGORY	GROUP	VISIBLE	DESCRIPTION	USERMODIFIABLE	HIDEWHENNOVALUE\n`;

    // add all the parameters
    this.dataSet.forEach((item) => {
      var stringItem = 'PARAM';
      
      const paramsTemp = item.id.split(':');
      const id = paramsTemp[paramsTemp.length-1].split('-')[0];
      stringItem += '\t'+id;
      
      const name = item.name;
      stringItem += '\t'+name;

      const dataTypeTmp = item.specId.split('-')[0];
      let dataType =  SharedParamtersConverter.getDbString(item.specId);
      stringItem += '\t'+dataType;

      let dataCategory = item['metadata.specCategoryId'];
      if( dataTypeTmp == REVIT_FAMILY_TYPE ){
        dataCategory = SharedParamtersConverter.convertSpecTypeIdToDBCategoryId(dataCategory);
      }
      stringItem += '\t'+dataCategory;

      const group = 1;
      stringItem += '\t'+group;

      const visible = item['metadata.isHidden']?0:1;
      stringItem += '\t'+visible;

      const description = item['description'];
      stringItem += '\t'+description;


      const userModifiable = 0;
      stringItem += '\t'+userModifiable;

      const hideWhenNoValue = 1;
      stringItem += '\t'+hideWhenNoValue;

      sharedParamsTxt += stringItem+'\n';
    })

    return sharedParamsTxt;
  }


  // private: remove the specified column
  removeColumns(columnName) {
    this.dataSet.forEach((item) => {
      if (typeof item[columnName] != null) {
        delete item[columnName];
      }
    })
  }
}

// Event while DOM tree is ready
$(document).ready(function () {

  // Show|Hide the message for import operation
  $('input:radio[name="exportOrImport"]').click(function () {
    var checkValue = $('input:radio[name="exportOrImport"]:checked').val();
    if (checkValue === 'import') {
      $('#importParameters').show();
    } else {
      $('#importParameters').hide();
    }
  });

  // Show|Hide the message for import operation
  $('input:radio[name="exchangeSharedParameters"]').click(function () {
    var checkValue = $('input:radio[name="exchangeSharedParameters"]:checked').val();
    if (checkValue === 'import') {
      $('#importSharedParameters').show();
    } else {
      $('#importSharedParameters').hide();
    }
  });


  $('#executeCSV').click(function () {
    exporting = $('input[name="exportOrImport"]:checked').val() === 'export';
    // Export the current table
    if (exporting) {
      if( !parametersTable || !parametersTable.csvData ){
        alert('Please get the data first.')
        return;
      }
      parametersTable.exportCSV();
    } else {
      // Import data from selected CSV file
      var fileUpload = document.getElementById("inputCsvFile");
      var regex = /^([a-zA-Z0-9\s_\\.\-:\(\)])+(.csv|.txt)$/;
      if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
          var reader = new FileReader();
          reader.onload = async function (e) {
            if(!parametersTable) {
              alert('please select one collection!');
              return;
            }

            $('#executeCSV').hide();
            $('.importInProgress').show();
        
            var rows = e.target.result.split("\n");
            const keys = rows[0].split(',');
            var jsonArray = [];
            for (var i = 1; i < rows.length; i++) {
              var jsonData = {};
              jsonData['metadata'] = [];
              var cells = rows[i].split(",");
              if (cells.length > 1) {
                for (var j = 0; j < cells.length; j++) {

                  // Remove '(Editable)' from the title
                  let newKey = keys[j].split(Editable_String).join('').split('\r').join('');

                  // always keep 'id' in the request body.
                  if( newKey === 'id'){
                    jsonData['id'] = cells[j];
                    continue;
                  }
                  const typeSupported = isTypeSupported(newKey, parametersTable.CurrentDataType);
                  if(typeSupported == TypeSupported.NOT_SUPPORTED)
                    continue;

                  // only use the last part of the parameter
                  const params = newKey.split('.');
                  newKey = params[params.length-1];
                  if (typeSupported === TypeSupported.STRING) {

                    const value = cells[j].replaceAll(Comma_Replacement,',').replaceAll( Enter_Replacement, '\n',).replaceAll(Space_Replacement,' ').split('\r').join('');
                    if(  newKey == 'instanceTypeAssociation'  ){
                      let itemData = { "id": newKey, "value": value }
                      jsonData['metadata'].push(itemData);
                    }else if(newKey == 'group'){
                      let itemData = { "id": "groupBindingId", "value": value }
                      jsonData['metadata'].push(itemData);

                    }else{
                      jsonData[newKey] = value;
                    }
                    continue;
                  }
                  if (typeSupported === TypeSupported.NUMBER) {
                    jsonData[newKey] = parseFloat(cells[j]);
                    // jsonData[newKey] = parseInt(cells[j]);
                    continue;
                  }
                  if(typeSupported === TypeSupported.BOOL){
                    if(  newKey == 'isHidden' || newKey == 'isArchived'  ){
                      let itemData = { "id": newKey, "value": cells[j].toLowerCase() === 'true' }
                      jsonData['metadata'].push( itemData);
                    }else{
                      jsonData[newKey] = (cells[j].toLowerCase() === 'true' ) ;
                    }
                    continue;
                  }
                }
              }
              jsonArray.push( jsonData );
            }
            try {
              await parametersTable.updateEntityInfo(jsonArray);
            } catch (err) {
              console.log(err);
            }

            $('#executeCSV').show();
            $('.importInProgress').hide();
        
            $('#btnRefresh').click();
          }
          reader.readAsText(fileUpload.files[0]);
        } else {
          alert("This browser does not support HTML5.");
        }
      } else {
        alert("Please upload a valid CSV file.");
      }
    }
  });


  $('#executeTXT').click(function () {
    exporting = $('input[name="exchangeSharedParameters"]:checked').val() === 'export';
    // Export the current table
    if (exporting) {
      if( !parametersTable || !parametersTable.txtData ){
        alert('Please get the data first.')
        return;
      }
      parametersTable.exportTxt();
    } else {
      // Import data from selected CSV file
      var fileUpload = document.getElementById("inputTxtFile");
      var regex = /^([a-zA-Z0-9\s_\\.\-:\(\)])+(.csv|.txt)$/;
      if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
          var reader = new FileReader();
          reader.onload = async function (e) {
            if(!parametersTable) {
              alert('please select one collection!');
              return;
            }

            $('#executeTXT').hide();
            $('.importSharedParametersInProgress').show();
        
            var rows = e.target.result.split("\n");
            
            // const keys = rows[0].split('\t');

            var jsonArray = [];
            for (var i = 1; i < rows.length; i++) {
              var jsonData = {};
              var cells = rows[i].split("\t");
              if( cells[0] !== 'PARAM')
                continue;

              if (cells.length > 1) {

                jsonData.id = cells[1].split('-').join('');
                jsonData.name = cells[2];
                let specId = SharedParamtersConverter.getSpecId(cells[3]);
                if( specId == null){
                  jsonData.dataTypeId = cells[3];
                }else if( specId.split('-')[0] == REVIT_FAMILY_TYPE ){
                  jsonData.dataTypeId = SharedParamtersConverter.convertDBCategoryIdToSpecTypeId( cells[4]);
                }else{
                  jsonData.dataTypeId = specId;
                }
                jsonData.readOnly = cells[5] == 1 ? true : false;

                // for (var j = 0; j < cells.length; j++) {

                //   // Remove '(Editable)' from the title
                //   let newKey = keys[j].split(Editable_String).join('').split('\r').join('');

                //   // always keep 'id' in the request body.
                //   if( newKey === 'id'){
                //     jsonData['id'] = cells[j];
                //     continue;
                //   }
                //   const typeSupported = isTypeSupported(newKey, parametersTable.CurrentDataType);
                //   if(typeSupported == TypeSupported.NOT_SUPPORTED)
                //     continue;

                //   // only use the last part of the parameter
                //   const params = newKey.split('.');
                //   newKey = params[params.length-1];
                //   if (typeSupported === TypeSupported.STRING) {

                //     const value = cells[j].replaceAll(Comma_Replacement,',').replaceAll( Enter_Replacement, '\n',).replaceAll(Space_Replacement,' ').split('\r').join('');
                //     if(  newKey == 'instanceTypeAssociation'  ){
                //       let itemData = { "id": newKey, "value": value }
                //       jsonData['metadata'].push(itemData);
                //     }else if(newKey == 'group'){
                //       let itemData = { "id": "groupBindingId", "value": value }
                //       jsonData['metadata'].push(itemData);

                //     }else{
                //       jsonData[newKey] = value;
                //     }
                //     continue;
                //   }
                //   if (typeSupported === TypeSupported.NUMBER) {
                //     jsonData[newKey] = parseFloat(cells[j]);
                //     // jsonData[newKey] = parseInt(cells[j]);
                //     continue;
                //   }
                //   if(typeSupported === TypeSupported.BOOL){
                //     if(  newKey == 'isHidden' || newKey == 'isArchived'  ){
                //       let itemData = { "id": newKey, "value": cells[j].toLowerCase() === 'true' }
                //       jsonData['metadata'].push( itemData);
                //     }else{
                //       jsonData[newKey] = (cells[j].toLowerCase() === 'true' ) ;
                //     }

                //     continue;
                //   }
                // }
              }
              jsonArray.push( jsonData );
            }
            try {
              await parametersTable.importParameters(jsonArray);
            } catch (err) {
              console.log(err);
            }

            $('#executeTXT').show();
            $('.importSharedParametersInProgress').hide();
        
            $('#btnRefresh').click();
          }
          reader.readAsText(fileUpload.files[0]);
        } else {
          alert("This browser does not support HTML5.");
        }
      } else {
        alert("Please upload a valid Txt file.");
      }
    }
  });


  $('#btnRefresh').click(async () => {
    $('.clsInProgress').show();
    $('.clsResult').hide();

    // get the active tab
    const activeTab = $("ul#parametersTableTabs li.active").children()[0].hash;
    switch( activeTab ){
      case '#parameters':{
        parametersTable.CurrentDataType = DataType.PARAMETERS;
        break;
      }

      case '#labels':{
        parametersTable.CurrentDataType = DataType.LABELS;
        break; 
      }
    }

    parametersTable.IsHumanReadable = $('input[name="dataTypeToDisplay"]:checked').val() === 'humanReadable';
    try{
      await parametersTable.fetchDataOfCurrentDataTypeAsync();
      await parametersTable.polishDataOfCurrentDataTypeAsync();
      parametersTable.drawCostTable();  
    }catch(err){
      console.log(err);
    }

    $('.clsInProgress').hide();
    $('.clsResult').show();
  })

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    if( e.target.text ==  'PARAMETERS'){
      $('#exchangeParamsGroup').show();
      $('#exchangeSharedParamsGroup').show();
    }else{
      $('#exchangeParamsGroup').hide();
      $('#exchangeSharedParamsGroup').hide();
    }
    $('#btnRefresh').click();
  });
});


/// string properties that can be updated
const SupportedStringTypes = {
  'parameters': [
    'description',
    'metadata.instanceTypeAssociation',
    'metadata.group',
  ],
  'labels': [
  ]
}


/// numeric properties that can be updated
const SupportedNumberTypes = {
  'parameters': [
  ],
  'labels': [
  ]
}


/// numeric properties that can be updated
const SupportedBoolTypes = {
  'parameters': [
    'metadata.isHidden',
    'metadata.isArchived',
  ],
  'labels': [
  ]
}


/// data type that is supported to be updated
const TypeSupported = {
  NUMBER: 0,
  STRING: 1,
  CUSTOM_ATTRIBUTE: 2,
  BOOL:3,
  NOT_SUPPORTED: 9
}


// check if the property is supported to be updated
function isTypeSupported(propertyName, parametersType='parameters' ) {
  for (var key in SupportedNumberTypes[parametersType]) {
    if (propertyName === SupportedNumberTypes[parametersType][key])
      return TypeSupported.NUMBER;
  }

  for (var key in SupportedBoolTypes[parametersType]) {
    if (propertyName === SupportedBoolTypes[parametersType][key])
      return TypeSupported.BOOL;
  }

  for (var key in SupportedStringTypes[parametersType]) {
    if (propertyName === SupportedStringTypes[parametersType][key])
      return TypeSupported.STRING;
  }
  return TypeSupported.NOT_SUPPORTED;
}


// helper function for Request
function apiClientAsync( requestUrl, requestData=null, requestMethod='get' ) {
  let def = $.Deferred();

  if( requestMethod == 'post' ){
    requestData = JSON.stringify(requestData);
  }

  jQuery.ajax({
    url: requestUrl,
    contentType: 'application/json',
    type: requestMethod,
    dataType: 'json',
    data: requestData,
    success: function (res) {
      def.resolve(res);
    },
    error: function (err) {
      console.error('request failed:');
      def.reject(err)
    }
  });
  return def.promise();
}
