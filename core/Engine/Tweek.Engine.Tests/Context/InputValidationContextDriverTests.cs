using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using FSharpUtils.Newtonsoft;
using LanguageExt;
using Microsoft.Extensions.Logging;
using Xunit;
using static FSharpUtils.Newtonsoft.JsonValue;
using static LanguageExt.Prelude;
using static Tweek.Engine.Drivers.Context.InputValidationContextDriver;
using Tweek.Engine.Tests.TestDrivers;

namespace Engine.Drivers.UnitTests.Context
{
    public class InputValidationContextDriverTests
    {
        private readonly InMemoryContextDriver _child; 
        
        public InputValidationContextDriverTests()
        { 
            _child =  new InMemoryContextDriver(new Dictionary<Identity, Dictionary<string,JsonValue>>());
        }

        private IdentitySchemaProvider ExternalSchemaProvider  => 
            identityType => identityType == "dummy" ? Some(JsonValue.Parse(File.ReadAllText(@"Context/schema.json"))) : None; 

        private CustomTypeDefinitionProvider CustomTypeProviderWithVersion = x => x == "version" ? Some(new CustomTypeDefinition{
                Base = "string",
                Validation = new Regex(@".*?\..*?.6")
                }) : None;

    private InputValidationContextDriver CreateTarget(IdentitySchemaProvider schemaProvider,
        CustomTypeDefinitionProvider customTypesProvider = null,
        InputValidationContextDriver.Mode mode = InputValidationContextDriver.Mode.Strict,
        bool reportOnly = false) => new InputValidationContextDriver(_child, schemaProvider, customTypesProvider, mode, reportOnly);


    [Fact(DisplayName = "When appending context, if the given identity type does not have schema it should throw")]
        public async Task AppendContext_MissingIdentityType_Throws()
        {
            var identity = new Identity("dummy", "1");
            IdentitySchemaProvider schemaProvider = x => None; 
            var target = CreateTarget(schemaProvider, mode:Mode.Strict);
            await Assert.ThrowsAsync<ArgumentException>(() => target.AppendContext(identity, new Dictionary<string, JsonValue>()));
        }


        [Fact(DisplayName = "When appending context, if one property type does not match schema it should throw")]
        public async Task AppendContext_InvalidPropertyType_Throws()
        {
            var identity = new Identity("dummy", "1");
            var data = new Dictionary<string, JsonValue>();
            data.Add("BirthDate", NewString("undefined"));
            var target = CreateTarget(schemaProvider:ExternalSchemaProvider, mode: Mode.Strict);

            await Assert.ThrowsAsync<ArgumentException>(() => target.AppendContext(identity, data));
        }

        [Fact(DisplayName = "When appending context, if one property type not exist it should throw")]
        public async Task AppendContext_PropertyTypeNotExists_Throws()
        {
            var identity = new Identity("dummy", "1");
            var data = new Dictionary<string, JsonValue>();
            data.Add("Country", NewString("undefined"));
            data.Add("Invalid", NewString("undefined"));
            var target = CreateTarget(schemaProvider:ExternalSchemaProvider, mode: Mode.Strict);

            await Assert.ThrowsAsync<ArgumentException>(() => target.AppendContext(identity, data));
        }

        [Theory(DisplayName = "When appending context, if property match validation, it should call child context")]
        [MemberData(nameof(ValidContextData))]
        public async Task AppendContext_PropertyValid_CallChildContext(Dictionary<string, JsonValue> data)
        {
            var identity = new Identity("dummy", "1");
            var target = CreateTarget(schemaProvider:ExternalSchemaProvider, customTypesProvider:CustomTypeProviderWithVersion, mode: Mode.Strict);
            
            await target.AppendContext(identity, data);
            
            var result = await target.GetContext(identity);
            Assert.Equal(result,data);
        }

        [Theory(DisplayName = "When appending context, if property does not match validation, it should throw")]
        [MemberData(nameof(InvalidContextData))]
        public async Task AppendContext_PropertyInvalid_Throws(Dictionary<string, JsonValue> data)
        {
            var identity = new Identity("dummy", "1");
            var target = CreateTarget(schemaProvider:ExternalSchemaProvider, customTypesProvider:CustomTypeProviderWithVersion, mode: Mode.Strict);

            await Assert.ThrowsAsync<ArgumentException>(() => target.AppendContext(identity, data));
        }

        [Fact(DisplayName = "When appending context, if one property type not exist and mode is AllowUndefinedProperties it should not throw")]
        public async Task AppendContext_PropertyTypeNotExistsAndModeAllowUndefinedProperties_CallChildContext()
        {
            var identity = new Identity("dummy", "1");
            var data = new Dictionary<string, JsonValue>();
            data.Add("Country", NewString("undefined"));
            data.Add("Invalid", NewString("undefined"));
            var target = CreateTarget(schemaProvider:ExternalSchemaProvider, mode: Mode.AllowUndefinedProperties);
            
            await target.AppendContext(identity, data);

            var result = await target.GetContext(identity);
            Assert.Equal(result,data);
        }

        [Theory(DisplayName = "When appending context, if property does not match validation and mode is ReportOnly, it should not throw")]
        [MemberData(nameof(InvalidContextData))]
        public async Task AppendContext_PropertyInvalidAndModeReportOnly_CallChildContext(Dictionary<string, JsonValue> data)
        {
            var identity = new Identity("dummy", "1");

            var target = CreateTarget(schemaProvider:ExternalSchemaProvider, mode: Mode.AllowUndefinedProperties, reportOnly:true);

            await target.AppendContext(identity, data);
            var result = await target.GetContext(identity);
            Assert.Equal(result,data);
        }

        [Theory(DisplayName = "When appending context, fixed keys should pass validation")]
        [InlineData(Mode.Strict)]
        [InlineData(Mode.AllowUndefinedProperties)]
        public async Task AppendContext_AddingFixedKeys_ShouldPassValidation(Mode mode)
        {
            var identity = new Identity("dummy", "1");
            var data = new Dictionary<string, JsonValue>();
            data.Add("@fixed:my_key", NewString("undefined"));
            var target = CreateTarget(schemaProvider:ExternalSchemaProvider, mode: mode);
            await target.AppendContext(identity, data);
            var result = await target.GetContext(identity);
            Assert.Equal(result,data);
        }

        public static IEnumerable<object[]> ValidContextData()
        {   
            yield return new object[]
            {
                new Dictionary<string, JsonValue>
                {
                   ["Country"] = NewString("undefined"),
                }
            };

            yield return new object[]
            {
                new Dictionary<string, JsonValue>
                {
                    ["BirthDate"] = NewString("05/01/2017")
                }
            };

            yield return new object[]
            {
                new Dictionary<string, JsonValue>
                {
                    ["SomeNumber"] = NewNumber(5)
                }
            };

            yield return new object[]
            {
                new Dictionary<string, JsonValue>
                {
                    ["IsPremium"] = NewBoolean(true)
                }
            };

            yield return new object[]
            {
                new Dictionary<string, JsonValue>
                {
                    ["Gender"] = NewString("Male")
                }
            };

            yield return new object[]
            {
                new Dictionary<string, JsonValue>
                {
                    ["AgentVersion"] = NewString("1.34.6")
                }
            };
        }

        public static IEnumerable<object[]> InvalidContextData()
        {
            yield return new object[]
            {
                new Dictionary<string, JsonValue>
                {
                   ["Country"] = NewNumber(5)
                }
            };

            yield return new object[]
            {
                new Dictionary<string, JsonValue>
                {
                    ["BirthDate"] = NewString("sfsd17")
                }
            };

            yield return new object[]
            {
                new Dictionary<string, JsonValue>
                {
                    ["SomeNumber"] = NewString("sfsd17")
                }
            };

            yield return new object[]
            {
                new Dictionary<string, JsonValue>
                {
                    ["Gender"] = NewString("Omer")
                }
            };

            yield return new object[]
            {
                new Dictionary<string, JsonValue>
                {
                    ["IsPremium"] = NewString("Hello")
                }
            };

            yield return new object[]
            {
                new Dictionary<string, JsonValue>
                {
                    ["AgentVersion"] = NewString("134.6")
                }
            };
        }
    }
}