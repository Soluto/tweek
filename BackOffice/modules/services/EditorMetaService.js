import R from 'ramda';
import { types, defaultValue, description, multipleValues } from './MetaHelpers';

export default class EditorMetaService {

  static _instance;
  static get instance() {
    if (!EditorMetaService._instance) {
      EditorMetaService._instance = new EditorMetaService();
      EditorMetaService._instance.init();
    }

    return EditorMetaService._instance;
  }

  _meta = {};

  init() {
    this.meta = {
      identities: {
        device: {},
        technician: {},
      },
      fields: {
        device: {
          '@@id': multipleValues(true)(description('device id')(types.String)),
          PartnerBrandId: defaultValue('AsurionFriends')(description('The name of the partner')(types.String)),
          DeviceOsType: defaultValue('Android')(types.Enum('Android', 'Ios')),
          SubscriptionType: types.Enum('Evaluation', 'Free', 'Insurance', 'InsuranceAndSupport', 'HomeSupport', 'DefaultFree'),
          AgentVersion: defaultValue('1.0.0.0')(types.Version),
          DeviceVendor: types.String,
          CountryCode: types.String,
          DeviceModel: types.String,
          InstallationSource: types.String,
          DeviceOsVersion: types.Version,
          IsInGroup: defaultValue(false)(types.Bool),
          DeviceType: types.Enum('Unknown',
            'Desktop',
            'Laptop',
            'Tablet',
            'Mobile',
            'WinServer',
            'Car',
            'Television',
            'PrinterFax',
            'Bike',
            'ChildItem',
            'KitchenAppliance',
            'CleaningAppliance',
            'VideoGamingDevice',
            'HomeTheaterDevice',
            'Computer',
            'Other'
          ),
        },
      },
    };
  }

  getFieldMeta(field) {
    if (field === '') return types.Empty;
    const [identity, property] = field.split('.');

    const fieldMeta = this.meta.fields[identity][property];
    if (!fieldMeta) {
      console.log('unsupported property name', property);
      return types.String;
    }

    return fieldMeta;
  }

  getKeyMeta(key) {

  }

  getIdentities() {
    return Object.keys(this.meta.identities);
  }

  getSuggestions({ type, query }) {
    if (type === 'MatcherProperty') {
      return R.reduce(R.concat, [])(R.keys(this.meta.identities).map(identity => R.toPairs(this.meta.fields[identity]).map(([field, meta]) => ({ label: `${field}`, value: `${identity}.${field}`, meta })))
      );
    }
    else {
      return [];
    }
  }

}
