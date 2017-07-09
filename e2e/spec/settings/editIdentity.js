/* global describe, before, after, it, browser */
import chai,{expect} from 'chai';
import tweekApiClient from '../../utils/tweekApiClient';
import PageObject from '../../utils/PageObject';
chai.use(require('chai-string'));

function addStringProperty(browser, propertyName){
    browser.setValue("*[data-comp=new-property-item] > input[type=text]:first-child", propertyName);
    browser.keys("Enter");
}

function addTypedProperty(browser, propertyName, propertyType){
    browser.setValue("*[data-comp=new-property-item] > input[type=text]:first-child", propertyName);
    browser.click("*[data-comp=ComboBox] > input");

    browser.keys("Enter");
}

function addNewIdentity(browser, identityType){
    browser.url(`/settings`);
    browser.waitForVisible(".side-menu");
    browser.click("*[data-comp=AddNewIdentity] button");
    browser.setValue("*[data-comp=AddNewIdentity] input", identityType);
    browser.keys("Enter");
}

function saveChanges(browser){
    browser.click("*[data-comp=save-button]");
}

function deleteCurrentIdentity(browser){
    browser.click("*[data-comp=delete-identity]");
}

function goToIdentityPage(browser, identityType){
    browser.url(`/settings/identities/${identityType}`);
    browser.waitForVisible(".identity-page");
}


describe('edit identity schema', () => {
    
    it('add new identity with simple property', ()=>{
        addNewIdentity(browser, "Device");
        expect(browser.getUrl()).to.endsWith("settings/identities/device");
        addStringProperty(browser, "Model");
        saveChanges(browser);
        browser.pause(8000);
        const schema = tweekApiClient.get("@tweek/schema/_");
        expect(schema).to.have.property("device").with.property("Model").that.deep.include({type:"string"});
        deleteCurrentIdentity(browser);
    });

    
    describe("editing existing identity", ()=>{
        const identityType = "session";
        beforeEach(function(){
            addNewIdentity(browser, identityType);
            addStringProperty(browser, "Group");
            saveChanges(browser);
        })

        afterEach(function(){
          goToIdentityPage(browser, identityType);
          deleteCurrentIdentity(browser);
        });

        it('add simple property and save', ()=>{
           //goToIdentityPage(browser, identityType);
        });
    })
});