const { init: initClients } = require("../../utils/clients");
const permissions = ['keys-list', 'keys-read', 'keys-write', 'schemas-read', 'schemas-write', 'history', 'search', 'search-index', 'tags-read', 'tags-write'];
const { expect } = require('chai');

describe("app permissions test", () => {
    let clients;
    before(async () => {
        clients = await initClients();
    });
    const cases = [{
        name: "read_specific_key",
        requirePermission: "keys-read",
        action: async (client) => {
            await client.get('/api/keys/@integration_tests/some_key')
                .expect(200)
        }
    },
    {
        name: "read_specific_key",
        requirePermission: "keys-read",
        action: async (client) => {
            await client.get('/api/key?keyPath=%40integration_tests%2Fsome_key')
                .expect(200)
        }
    },
    {
        name: "read_manifests",
        requirePermission: "keys-read",
        action: async (client) => {
            await client.get('/api/manifests/@integration_tests/some_key')
                .expect(200)
        }
    },
    {
        name: "list_keys",
        requirePermission: "keys-list",
        action: async (client) => {
            await client.get('/api/keys')
                .expect(200)
        }
    },
    {
        name: "list_manifests",
        requirePermission: "keys-list",
        action: async (client) => {
            await client.get('/api/manifests')
                .expect(200)
        }
    },
    {
        name: "get_dependents",
        requirePermission: "keys-read",
        action: async (client) => {
            await client.get('/api/dependents/@integration_tests/some_key')
                .expect(200)
        }
    },
    {
        name: "get_dependents",
        requirePermission: "keys-read",
        action: async (client) => {
            await client.get('/api/dependents/@integration_tests/some_key')
                .expect(200)
        }
    },
    {
        name: "get_schemas",
        requirePermission: "schemas_read",
        action: async (client) => {
            await client.get('/api/schemas')
                .expect(200)
        }
    },
    {
        name: "search",
        requirePermission: "search",
        action: async (client) => {
            await client.get('/api/search')
                .expect(200)
        }
    },
    {
        name: "suggestions",
        requirePermission: "search",
        action: async (client) => {
            await client.get('/api/suggestions')
                .expect(200)
        }
    },
    {
        name: "search-index",
        requirePermission: "search-index",
        action: async (client) => {
            await client.get('/api/search-index')
                .expect(200)
        }
    }
    ];

    for (let permission of permissions) {
        it(`testing permission ${permission}`, async () => {
            
            const relevantCases = cases.filter(c => c.requirePermission === permission);
            const forbiddenCases = cases.filter(c => c.requirePermission !== permission);

            let response = await clients.authoring.post('/api/apps?author.name=test&author.email=test@soluto.com')
                .send({ name: 'my-app', permissions: [permission] })
                .expect(200);
            

            let { appId, appSecret } = response.body;

            let appClient = await clients.authoring.with(client =>
                client.set({ "x-client-id": appId, "x-client-secret": appSecret })
                    .unset("Authorization")
            );

            await Promise.all(relevantCases.map(x=> x.action(appClient)))
            
            await Promise.all(forbiddenCases.map(async x=> {
                        await x.action(appClient).then(()=>true, ex=> {
                            return expect(ex.message).to.contain("403");
                        })
                    }));
            
            
        }).timeout(6000);
    }


});