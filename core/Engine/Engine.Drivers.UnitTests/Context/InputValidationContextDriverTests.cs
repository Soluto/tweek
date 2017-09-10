using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Engine.DataTypes;
using Engine.Drivers.Context;
using FSharpUtils.Newtonsoft;
using LanguageExt;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using static FSharpUtils.Newtonsoft.JsonValue;

namespace Engine.Drivers.UnitTests.Context
{
    public class InputValidationContextDriverTests
    {
        private InputValidationContextDriver _target; 
        private readonly Mock<IContextDriver> _child; 
        private readonly Mock<InputValidationContextDriver.IdentitySchemaProvider> _schemaProvider;
        private readonly Mock<InputValidationContextDriver.CustomTypeDefinitionProvider> _customTypeProvider;
        private readonly Mock<ILogger<InputValidationContextDriver>> _logger;

        public InputValidationContextDriverTests()
        { 
            _child = new Mock<IContextDriver>();
            _schemaProvider = new Mock<InputValidationContextDriver.IdentitySchemaProvider>();
            _customTypeProvider = new Mock<InputValidationContextDriver.CustomTypeDefinitionProvider>();
            _logger = new Mock<ILogger<InputValidationContextDriver>>();
            CreateTarget(InputValidationContextDriver.Mode.Strict);
        }

        private void CreateTarget(InputValidationContextDriver.Mode mode, bool reportOnly = false)
        {
            _target = new InputValidationContextDriver(_child.Object, _logger.Object, _schemaProvider.Object, _customTypeProvider.Object, mode, reportOnly);
        }

        [Fact(DisplayName = "When appending context, if the given identity type does not have schema it should throw")]
        public async Task AppendContext_MissingIdentityType_Throws()
        {
            var identity = new Identity("dummy", "1");

            _schemaProvider.Setup(f => f("dummy")).Returns(Option<JsonValue>.None);

            await Assert.ThrowsAsync<ArgumentException>(() => _target.AppendContext(identity, new Dictionary<string, JsonValue>()));
        }

        [Fact(DisplayName = "When appending context, if one property type does not match schema it should throw")]
        public async Task AppendContext_InvalidPropertyType_Throws()
        {
            var identity = new Identity("dummy", "1");
            var data = new Dictionary<string, JsonValue>();
            data.Add("BirthDate", NewString("undefined"));

            var schmea = File.ReadAllText(@"Context/schema.json");

            _schemaProvider.Setup(f => f("dummy")).Returns(Option<JsonValue>.Some(JsonValue.Parse(schmea)));

            await Assert.ThrowsAsync<ArgumentException>(() => _target.AppendContext(identity, data));
        }

        [Fact(DisplayName = "When appending context, if one property type not exist it should throw")]
        public async Task AppendContext_PropertyTypeNotExists_Throws()
        {
            var identity = new Identity("dummy", "1");
            var data = new Dictionary<string, JsonValue>();
            data.Add("Country", NewString("undefined"));
            data.Add("Invalid", NewString("undefined"));

            var schmea = File.ReadAllText(@"Context/schema.json");

            _schemaProvider.Setup(f => f("dummy")).Returns(Option<JsonValue>.Some(JsonValue.Parse(schmea)));

            await Assert.ThrowsAsync<ArgumentException>(() => _target.AppendContext(identity, data));
        }

        [Theory(DisplayName = "When appending context, if property match validation, it should call child context")]
        [MemberData(nameof(ValidContextData))]
        public async Task AppendContext_PropertyValid_CallChildContext(Dictionary<string, JsonValue> data)
        {
            var identity = new Identity("dummy", "1");

            var schmea = File.ReadAllText(@"Context/schema.json");
        
            _child.Setup(c => c.AppendContext(identity, data)).Returns(Task.CompletedTask);
        
            _schemaProvider.Setup(f => f("dummy")).Returns(Option<JsonValue>.Some(JsonValue.Parse(schmea)));

            _customTypeProvider.Setup(f => f("version")).Returns(new CustomTypeDefinition{
                Base = "string",
                Validation = new Regex(@".*?\..*?.6")
                });

            await _target.AppendContext(identity, data);

            _child.VerifyAll();
        }

        [Theory(DisplayName = "When appending context, if property does not match validation, it should throw")]
        [MemberData(nameof(InvalidContextData))]
        public async Task AppendContext_PropertyInvalid_Throws(Dictionary<string, JsonValue> data)
        {
            var identity = new Identity("dummy", "1");

            var schmea = File.ReadAllText(@"Context/schema.json");
        
            _child.Setup(c => c.AppendContext(identity, data)).Returns(Task.CompletedTask);
        
            _schemaProvider.Setup(f => f("dummy")).Returns(Option<JsonValue>.Some(JsonValue.Parse(schmea)));
            _customTypeProvider.Setup(f => f("version")).Returns(new CustomTypeDefinition{
                Base = "string",
                Validation = new Regex(@".*?\..*?.6")
                });

            await Assert.ThrowsAsync<ArgumentException>(() => _target.AppendContext(identity, data));
        }

        [Fact(DisplayName = "When appending context, if one property type not exist and mode is AllowUndefinedProperties it should not throw")]
        public async Task AppendContext_PropertyTypeNotExistsAndModeAllowUndefinedProperties_CallChildContext()
        {
            CreateTarget(InputValidationContextDriver.Mode.AllowUndefinedProperties);
            var identity = new Identity("dummy", "1");
            var data = new Dictionary<string, JsonValue>();
            data.Add("Country", NewString("undefined"));
            data.Add("Invalid", NewString("undefined"));
            _child.Setup(c => c.AppendContext(identity, data)).Returns(Task.CompletedTask);

            var schmea = File.ReadAllText(@"Context/schema.json");

            _schemaProvider.Setup(f => f("dummy")).Returns(Option<JsonValue>.Some(JsonValue.Parse(schmea)));

            await _target.AppendContext(identity, data);

            _child.VerifyAll();
        }

        [Theory(DisplayName = "When appending context, if property does not match validation and mode is ReportOnly, it should not throw")]
        [MemberData(nameof(InvalidContextData))]
        public async Task AppendContext_PropertyInvalidAndModeReportOnly_CallChildContext(Dictionary<string, JsonValue> data)
        {
            CreateTarget(InputValidationContextDriver.Mode.Strict, true);
            var identity = new Identity("dummy", "1");

            var schmea = File.ReadAllText(@"Context/schema.json");
        
            _child.Setup(c => c.AppendContext(identity, data)).Returns(Task.CompletedTask);
            
            _schemaProvider.Setup(f => f("dummy")).Returns(Option<JsonValue>.Some(JsonValue.Parse(schmea)));
            _customTypeProvider.Setup(f => f("version")).Returns(new CustomTypeDefinition{
                Base = "string",
                Validation = new Regex(@".*?\..*?.6")
                });

            await _target.AppendContext(identity, data);

            _child.VerifyAll();
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
                    ["AgentVersion"] = NewString("134.6")
                }
            };
        }
    }
}