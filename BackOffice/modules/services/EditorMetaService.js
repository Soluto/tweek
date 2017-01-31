import R from 'ramda';
import { types, enumType, initializeTypes } from './TypesService';
import { boolAllowedValue, fromEnum } from './EditorMetaAllowedValuesService';

export default class EditorMetaService {

  static _instance;

  static get instance() {
    if (!EditorMetaService._instance) {
      EditorMetaService._instance = new EditorMetaService();
    }

    return EditorMetaService._instance;
  }

  static async initialize() {
    const initPromise = initializeTypes();

    initPromise.then(() => EditorMetaService.instance._initializeMeta());

    return initPromise;
  }

  getFieldMeta(field) {
    if (field === '') return { type: 'empty' };

    try {
      const [identity, property] = field.split('.');

      const fieldMeta = this.meta.fields[identity][property];
      if (!fieldMeta) {
        throw 'unsupported field meta: ' + field;
      }

      return fieldMeta;
    }
    catch (exp) {
      console.log('error occurd getting field meta', exp.message);
      return { type: 'string' };
    }
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

  _initializeMeta() {
    this.meta = {
      identities: {
        device: {},
        technician: {},
      },
      fields: {
        device: {
          '@@id': {
            multipleValues: true,
            description: "device id",
            ...types.string,
          },
          PartnerBrandId: {
            multipleValues: true,
            description: "The name of the partner",
            ...types.string,
          },
          DeviceOsType: {
            multipleValues: true,
            description: "Device operation system name",
            ...enumType('string'),
            allowedValues: fromEnum('Android', 'Ios'),
          },
          SubscriptionType: {
            multipleValues: true,
            description: "The home tier subscription of the device",
            ...enumType('string'),
            allowedValues: fromEnum('Evaluation', 'Free', 'Insurance', 'InsuranceAndSupport', 'HomeSupport', 'DefaultFree'),
          },
          AgentVersion: {
            multipleValues: true,
            defaultValue: '1.0.0.0',
            ...types.version
          },
          DeviceOsVersion: {
            multipleValues: true,
            ...types.version
          },
          DeviceVendor: {
            multipleValues: true,
            description: "Device vendor",
            ...types.string,
          },
          CountryCode: {
            multipleValues: true,
            description: "Country code",
            type: "string",
          },
          DeviceModel: {
            multipleValues: true,
            description: "device model",
            ...types.string,
          },
          InstallationSource: {
            multipleValues: true,
            description: "Installation source",
            ...types.string,
          },
          IsInGroup: {
            multipleValues: true,
            description: "Is in group",
            defaultValue: false,
            ...types.bool,
            allowedValues: boolAllowedValue,
          },
          CreatedAt: {
            multipleValues: true,
            description: "Created at",
            ...types.string,
          },
          EngagementLevel: {
            multipleValues: true,
            description: "Engagement Level",
            ...types.string,
          },
          DeviceType: {
            multipleValues: true,
            description: "Device type",
            ...enumType('string'),
            allowedValues: fromEnum('Unknown',
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
      },
    };
    
    EditorMetaService.isLoaded = true;
  }
}
