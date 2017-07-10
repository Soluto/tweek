/* global describe, before, after, it, browser */
import chai,{expect} from 'chai';
import tweekApiClient from '../../utils/tweekApiClient';
import PageObject from '../../utils/PageObject';
chai.use(require('chai-string'));

function addStringProperty(propertyName){
    browser.setValue("*[data-comp=new-property-item] > input[type=text]:first-child", propertyName);
    browser.keys("Enter");
}

function addTypedProperty(propertyName, propertyType){
    browser.setValue("*[data-comp=new-property-item] > input[type=text]:first-child", propertyName);
    browser.click("*[data-comp=new-property-item] *[data-comp=ComboBox] input");
    browser.click(`*[data-comp=new-property-item] *[data-label=${propertyType}] a`);
    browser.click("*[data-comp=new-property-item] [data-comp=add]");
}

function deleteProperty(propertyName){
    browser.click(`*[data-comp=property-item][data-property-name=${propertyName}] button[data-comp=remove]`);
}

function addNewIdentity(identityType){
    browser.url(`/settings`);
    browser.waitForVisible(".side-menu");
    browser.click("*[data-comp=AddNewIdentity] button");
    browser.setValue("*[data-comp=AddNewIdentity] input", identityType);
    browser.keys("Enter");
}

function saveChanges(){
    browser.click("*[data-comp=save-button]");
}

function deleteCurrentIdentity(){
    browser.click("*[data-comp=delete-identity]");
}

function goToIdentityPage(identityType){
    browser.url(`/settings/identities/${identityType}`);
    browser.waitForVisible(".identity-page");
}

describe('edit identity schema', () => {
    
    it('add new identity with simple property', ()=>{
        addNewIdentity("Device");
        expect(browser.getUrl()).to.endsWith("settings/identities/device");
        addStringProperty("Model");
        saveChanges();
        tweekApiClient.waitForKeyToEqual("@tweek/schema/device", {Model:{"type":"string"}});
        deleteCurrentIdentity();
    });

    
    describe("editing existing identity", ()=>{
        beforeEach(()=>{
            addNewIdentity("session");
            addStringProperty("Group");
            saveChanges();
        })

        afterEach(()=>{
          goToIdentityPage("session");
          deleteCurrentIdentity();
        });

        it('add simple property and save', ()=>{
           goToIdentityPage("session");
           addTypedProperty("Age", "number");
           saveChanges();
           tweekApiClient.waitForKeyToEqual("@tweek/schema/session", {"Age": {type:"number"}, "Group": {type: "string"}});
        });

        it('delete property and save', ()=>{
           goToIdentityPage("session");
           deleteProperty("Group");
           saveChanges();
           tweekApiClient.waitForKeyToEqual("@tweek/schema/session", {});
        });
    })
});