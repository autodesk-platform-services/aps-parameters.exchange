# aps-parameters.exchange.csv
[![Node.js](https://img.shields.io/badge/Node.js-14.0-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-6.0-blue.svg)](https://www.npmjs.com/)
![Platforms](https://img.shields.io/badge/Web-Windows%20%7C%20MacOS%20%7C%20Linux-lightgray.svg)
[![Data-Management](https://img.shields.io/badge/Data%20Management-v1-green.svg)](http://developer.autodesk.com/)

[![Parameters](https://img.shields.io/badge/Parameters%20360-v1-green.svg)](http://developer.autodesk.com/)

[![MIT](https://img.shields.io/badge/License-MIT-blue.svg)](http://opensource.org/licenses/MIT)
[![Level](https://img.shields.io/badge/Level-Intermediate-blue.svg)](http://developer.autodesk.com/)


## Description
This sample demonstrates exchanging parameters, labels, saved searches between ACC Parameters and .CSV file using Parameters API. It includes 3 main tasks:
1. Display Parameters properties either in **Raw data** and **Human readable form**.
2. Export Parameters properties either in **Raw data** and **Human readable form** to a CSV file.
3. Import Parameters properties from a locally stored CSV file(based on **Raw data**).


## Thumbnail
![thumbnail](/thumbnail.png)  

## Demonstration
[![https://youtu.be/X6mFX_yqhTI](http://img.youtube.com/vi/X6mFX_yqhTI/0.jpg)](https://youtu.be/X6mFX_yqhTI "Display and exchange Parameters information with CSV file")


## Live Demo
[https://bim360cost-exchange.herokuapp.com/](https://bim360cost-exchange.herokuapp.com/)


# Web App Setup

## Prerequisites

1. **APS Account**: Learn how to create a APS Account, activate subscription and create an app at [this tutorial](http://learnforge.autodesk.io/#/account/). 
2. **BIM 360 Account**: must be Account Admin to add the app integration. [Learn about provisioning](https://aps.autodesk.com/blog/bim-360-docs-provisioning-forge-apps). 
3. **BIM 360 Cost Management**: Create BIM 360 project, activate Cost Management module, setup project to create **Budget Code Template** for Cost Management according to [the guide](https://help.autodesk.com/view/BIM360D/ENU/?guid=BIM360D_Cost_Management_getting_started_with_cost_management_html)
4. **Node.js**: basic knowledge with [**Node.js**](https://nodejs.org/en/).
5. **JavaScript** basic knowledge with **jQuery**

For using this sample, you need an Autodesk developer credentials. Visit the [APS Developer Portal](https://developer.autodesk.com), sign up for an account, then [create an app](https://developer.autodesk.com/myapps/create). For this new app, use **http://localhost:3000/api/aps/callback/oauth** as Callback URL. Finally take note of the **Client ID** and **Client Secret**.


## Running locally

Install [NodeJS](https://nodejs.org), version 8 or newer.

Clone this project or download it (this `nodejs` branch only). It's recommended to install [GitHub desktop](https://desktop.github.com/). To clone it via command line, use the following (**Terminal** on MacOSX/Linux, **Git Shell** on Windows):

    git clone https://github.com/Autodesk-Platform-Services/aps-parameters.exchange.csv

Install the required packages using `npm install`.


**Environment variables**

Set the enviroment variables with your client ID & secret and finally start it. Via command line, navigate to the folder where this repository was cloned and use the following:

Mac OSX/Linux (Terminal)

    npm install
    export APS_CLIENT_ID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>>
    export APS_CLIENT_SECRET=<<YOUR CLIENT SECRET>>
    export APS_CALLBACK_URL=<<YOUR CALLBACK URL>>

    npm start

Windows (use **Node.js command line** from Start menu)

    npm install
    set APS_CLIENT_ID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>>
    set APS_CLIENT_SECRET=<<YOUR CLIENT SECRET>>
    set APS_CALLBACK_URL=<<YOUR CALLBACK URL>>

    npm start

**Note.**
environment variable examples:
- APS_CALLBACK_URL: `http://localhost:3000/api/aps/callback/oauth`

## Using the app

Open the browser: [http://localhost:3000](http://localhost:3000). 

**Please watch the [Video](https://youtu.be/X6mFX_yqhTI) for the detail setup and usage, or follow the steps:**

- **Setup the app before using the App**
1. Make sure to [Create BIM360 project, activate Cost Management module, setup project for Cost Management](https://help.autodesk.com/view/BIM360D/ENU/?guid=BIM360D_Cost_Management_getting_started_with_cost_management_html).


- **Operate with App after setup**
1. Select a project and display BIM 360 Cost properties either in **Raw data** and **Human readable form**.
2. Click **Export** button to export BIM 360 Cost properties either in **Raw data** and **Human readable form** to a CSV file.
3. Click **Import** button to update BIM 360 Cost properties from a locally stored CSV file(based on **Raw data**).

## Deployment

To deploy this application to Heroku, the **Callback URL** for APS must use your `.herokuapp.com` address. After clicking on the button below, at the Heroku Create New App page, set your Client ID, Secret and Callback URL for APS.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Autodesk-Platform-Services/aps-parameters.exchange.csv)


## Limitation
- BIM 360 Cost Management module needs to be activated to use this App, due to the current limitation of BIM 360 API, user needs to activate & setup cost project manually. Please check [Create BIM360 project, activate Cost Management module, setup project for Cost Management](https://help.autodesk.com/view/BIM360D/ENU/?guid=BIM360D_Cost_Management_getting_started_with_cost_management_html) for details.


## Known issues
1. The 'scopeOfWork' property contain rich text which may includes '**\n**' and '**,**', but the 2 characters are reserved for special usage while parsing CSV file, to avoid the issue, I use the following 2 characters as replacement for 'scopeOfWork' property.
```js
        const Enter_Replacement = '\xfe';
        const Comma_Replacement = '\xfd';
```
## Tips & Tricks
1. Not all the properties could be updated, only these marked as **Editable** are supported.
2. To import properties from CSV file, the suggested way is to export a CSV file of **raw data** first, update the editable properties within the file, then import it back to BIM 360 cost module.

## Troubleshooting
1. **Cannot see my BIM 360 projects**: Make sure to provision the APS App Client ID within the BIM 360 Account, [learn more here](https://aps.autodesk.com/blog/bim-360-docs-provisioning-forge-apps). This requires the Account Admin permission.
 
## Further Reading
**Document**:
- [Data Management API](https://developer.autodesk.com/en/docs/data/v2/overview/)
- [BIM 360 API](https://developer.autodesk.com/en/docs/bim360/v1/overview/) and [App Provisioning](https://aps.autodesk.com/blog/bim-360-docs-provisioning-forge-apps)

**Tutorials**:
- [View BIM 360 Models](http://learnforge.autodesk.io/#/tutorials/viewhubmodels)

**Blogs**:
- [APS Blog](https://aps.autodesk.com/categories/bim-360-api)
- [Field of View](https://fieldofviewblog.wordpress.com/), a BIM focused blog

## License
This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

## Written by
Zhong Wu [@johnonsoftware](https://twitter.com/johnonsoftware), [Autodesk Partner Development](http://aps.autodesk.com)
