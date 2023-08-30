# aps-parameters.exchange
[![Node.js](https://img.shields.io/badge/Node.js-14.0-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-6.0-blue.svg)](https://www.npmjs.com/)
![Platforms](https://img.shields.io/badge/Web-Windows%20%7C%20MacOS%20%7C%20Linux-lightgray.svg)
[![Data-Management](https://img.shields.io/badge/Data%20Management-v1-green.svg)](http://developer.autodesk.com/)

[![Parameters](https://img.shields.io/badge/Parameters%20-v1-green.svg)](http://developer.autodesk.com/)

[![MIT](https://img.shields.io/badge/License-MIT-blue.svg)](http://opensource.org/licenses/MIT)
[![Level](https://img.shields.io/badge/Level-Intermediate-blue.svg)](http://developer.autodesk.com/)


## Description
This sample demonstrates displaying and exchanging parameters in the following ways:
1. Display Parameters properties and lable information either in **Raw data** and **Human readable form**.
2. Export Parameters properties to a **Shared Parameters** txt file, and also import Parameters properties from a **Shared Parameters** txt file.
3. Export Parameters properties either in **Raw data** and **Human readable form** to a CSV file, and also import Parameters properties from a locally stored CSV file(based on **Raw data**).

## Thumbnail
![thumbnail](/thumbnail.png)  

# Web App Setup

## Prerequisites

1. **APS Account**: Learn how to create a APS Account, activate subscription and create an app at [this tutorial](http://learnforge.autodesk.io/#/account/). 
2. **ACC Account**: must be Account Admin to add the app integration. [Learn about provisioning](https://aps.autodesk.com/blog/bim-360-docs-provisioning-forge-apps). 
3. **Node.js**: basic knowledge with [**Node.js**](https://nodejs.org/en/).
4. **JavaScript** basic knowledge with **jQuery**

For using this sample, you need an Autodesk developer credentials. Visit the [APS Developer Portal](https://developer.autodesk.com), sign up for an account, then [create an app](https://developer.autodesk.com/myapps/create). For this new app, use **http://localhost:3000/api/aps/callback/oauth** as Callback URL. Finally take note of the **Client ID** and **Client Secret**.

## Running locally

Install [NodeJS](https://nodejs.org), version 8 or newer.

Clone this project or download it (this `nodejs` branch only). It's recommended to install [GitHub desktop](https://desktop.github.com/). To clone it via command line, use the following (**Terminal** on MacOSX/Linux, **Git Shell** on Windows):

    git clone https://github.com/Autodesk-Platform-Services/aps-parameters.exchange

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
1. Make sure to be the Account Admin for the ACC hub.
- **Operate with App after setup**
1. Select a Parameters Collection under an ACC account, all the parameters will be listed either in **Raw data** and **Human readable form**.
2. Click **Execute** button to generate a Shared Parameters txt file by exporting to txt.
3. Click **Execute** button to import ACC Parameters from a local Shared Parameters txt file.
4. Click **Execute** button to export ACC Parameters either in **Raw data** and **Human readable form** to a CSV file.
5. Click **Execute** button to update ACC Parameters by importing from a locally stored CSV file(based on **Raw data**).


## Deployment

To deploy this application to Heroku, the **Callback URL** for APS must use your `.herokuapp.com` address. After clicking on the button below, at the Heroku Create New App page, set your Client ID, Secret and Callback URL for APS.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Autodesk-Platform-Services/aps-parameters.exchange)

## Limitation
1. To convert between Shared Parameters and Parameters Service, there is a map maintain the relationship, but this is not always updated to latest, the new parameters may not be able to converted. 

## Tips & Tricks
1. Not all the properties could be updated, only these marked as **Editable** are supported.
2. To import properties from CSV file, the suggested way is to export a CSV file of **raw data** first, update the editable properties within the file, then import it back to ACC Parameters.

## Troubleshooting
1. **Cannot see my ACC account**: Make sure to provision the APS App Client ID within the ACC account, [learn more here](https://aps.autodesk.com/blog/bim-360-docs-provisioning-forge-apps). This requires the Account Admin permission.
 
## Further Reading
**Document**:
- [Data Management API](https://developer.autodesk.com/en/docs/data/v2/overview/)
- [Parameters API](https://aps.autodesk.com/en/docs/parameters/v1/overview)


**Blogs**:
- [APS Blog](https://aps.autodesk.com/blog)
- [Field of View](https://fieldofviewblog.wordpress.com/), a BIM focused blog

## License
This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

## Written by
Zhong Wu [@johnonsoftware](https://twitter.com/johnonsoftware), [Autodesk Partner Development](http://aps.autodesk.com)
