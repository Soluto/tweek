using System.Collections.Generic;
using FSharpUtils.Newtonsoft;
using static FSharpUtils.Newtonsoft.JsonValue;

namespace Tweek.ApiService.SmokeTests.GetConfigurations.Models
{
    public class RulesBasedTestsContextProvider
    {
        public const string COMPARISON_OPERATORS_TEST_NAME_1 = "Get single key from comparison operators (1)";
        public const string COMPARISON_OPERATORS_TEST_NAME_2 = "Get single key from comparison operators (2)";
        public const string COMPARISON_OPERATORS_TEST_NAME_3 = "Get single key from comparison operators (3)";
        public const string COMPARISON_OPERATORS_TEST_NAME_4 = "Get single key from comparison operators (4)";

        public const string IN_OPERATOR_TEST_NAME_1 = "Get single key from in operator (1)";
        public const string IN_OPERATOR_TEST_NAME_2 = "Get single key from in operator (2)";
        public const string IN_OPERATOR_TEST_NAME_3 = "Get single key from in operator (3)";
        public const string IN_OPERATOR_TEST_NAME_4 = "Get single key from in operator (4)";

        public const string MULTI_CONDITONS_TEST_NAME_1 = "Get single key from multi conditions rules (1)";
        public const string MULTI_CONDITONS_TEST_NAME_2 = "Get single key from multi conditions rules (2)";
        public const string MULTI_CONDITONS_TEST_NAME_3 = "Get single key from multi conditions rules (3)";
        public const string MULTI_CONDITONS_TEST_NAME_4 = "Get single key from multi conditions rules (4)";

        public const string ARRAY_CONTAINS_TEST_NAME_1 = "Get single key from array contains rules (1)";
        public const string ARRAY_CONTAINS_TEST_NAME_2 = "Get single key from array contains rules (2)";
        public const string ARRAY_CONTAINS_TEST_NAME_3 = "Get single key from array contains rules (3)";

        public static IEnumerable<object[]> COMPARISON_OPERATORS_TEST_CONTEXTS()
        {
            yield return new object[]{
                new TestContext
                {
                    TestName = COMPARISON_OPERATORS_TEST_NAME_4,
                    KeyName = "smoke_tests/rule_based_keys/comparison",
                    ExpectedValue = "value4",
                    Context = new Dictionary<string, JsonValue>
                    {
                        ["device.AgentVersion"] = NewString("9.0.0.0")
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = COMPARISON_OPERATORS_TEST_NAME_3,
                    KeyName = "smoke_tests/rule_based_keys/comparison",
                    ExpectedValue = "value3",
                    Context = new Dictionary<string, JsonValue>
                    {
                        ["device.DeviceOsVersion"] = NewString("1.5.0.0")
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = COMPARISON_OPERATORS_TEST_NAME_2,
                    KeyName = "smoke_tests/rule_based_keys/comparison",
                    ExpectedValue = "value2",
                    Context = new Dictionary<string, JsonValue>
                    {
                        ["device.AgentVersion"] = NewString("4.9.0.0")
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = COMPARISON_OPERATORS_TEST_NAME_1,
                    KeyName = "smoke_tests/rule_based_keys/comparison",
                    ExpectedValue = "value1"
                }};
        }

        public static IEnumerable<object[]> IN_OPERATOR_TEST_CONTEXTS()
        {
            yield return new object[]{
                new TestContext
                {
                    TestName = IN_OPERATOR_TEST_NAME_4,
                    KeyName = "smoke_tests/rule_based_keys/in",
                    ExpectedValue = "value4",
                    Context = new Dictionary<string, JsonValue>
                    {
                        ["device.CountryCode"] = NewString("999")
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = IN_OPERATOR_TEST_NAME_3,
                    KeyName = "smoke_tests/rule_based_keys/in",
                    ExpectedValue = "value3",
                    Context = new Dictionary<string, JsonValue>
                    {
                        ["device.AgentVersion"] =  NewString("4.1")
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = IN_OPERATOR_TEST_NAME_2,
                    KeyName = "smoke_tests/rule_based_keys/in",
                    ExpectedValue = "value2",
                    Context = new Dictionary<string, JsonValue>
                    {
                        ["device.PartnerBrandId"] = NewString("cellcom") 
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                   TestName = IN_OPERATOR_TEST_NAME_1,
                   KeyName = "smoke_tests/rule_based_keys/in",
                   ExpectedValue = "value1"
                }};
        }

        public static IEnumerable<object[]> MULTI_CONDITIONS_TEST_CONTEXTS()
        {
            yield return new object[]{
                new TestContext
                {
                    TestName = MULTI_CONDITONS_TEST_NAME_4,
                    KeyName = "smoke_tests/rule_based_keys/multi_conditions",
                    ExpectedValue = "value4",
                    Context = new Dictionary<string, JsonValue>
                    {
                        { "device.SubscriptionType", NewString("HomeSupport") },
                        { "device.IsInGroup", NewBoolean(true) },
                        { "device.DeviceOsVersion", NewString("2.1.0.0") },
                        { "device.AgentVersion", NewString("3.0.0.4") },
                        { "device.DeviceType", NewString("Laptop") },
                        { "device.DeviceVendor", NewString("vendor3") },
                        { "device.CountryCode", NewString("888") },
                        { "device.PartnerBrandId", NewString("AsurionFriends") },
                        { "device.DeviceModel", NewString("Samsung") }
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = MULTI_CONDITONS_TEST_NAME_3,
                    KeyName = "smoke_tests/rule_based_keys/multi_conditions",
                    ExpectedValue = "value3",
                    Context = new Dictionary<string, JsonValue>
                    {
                        { "device.DeviceOsType", NewString("Android") },
                        { "device.PartnerBrandId", NewString("cellcom") },
                        { "device.AgentVersion", NewString("4.6.9.0") }
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = MULTI_CONDITONS_TEST_NAME_2,
                    KeyName = "smoke_tests/rule_based_keys/multi_conditions",
                    ExpectedValue = "value2",
                    Context = new Dictionary<string, JsonValue>
                    {
                        { "device.CountryCode", NewString("887") },
                        { "device.DeviceOsVersion", NewString("2.0.0.0") }
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = MULTI_CONDITONS_TEST_NAME_1,
                    KeyName = "smoke_tests/rule_based_keys/multi_conditions",
                    ExpectedValue = "value1"
                }};
        }

        public static IEnumerable<object[]> ARRAY_CONTAINS_TEST_CONTEXTS()
        {
            yield return new object[]{
                new TestContext
                {
                    TestName = ARRAY_CONTAINS_TEST_NAME_1,
                    KeyName = "smoke_tests/rule_based_keys/array_contains",
                    ExpectedValue = "some value",
                    Context = new Dictionary<string, JsonValue>
                    {
                        { "user.SiblingNames", NewArray(new JsonValue[] { NewString("abe"), NewString("mark") }) }
                    }
                }};
                
            yield return new object[]{
                new TestContext
                {
                    TestName = ARRAY_CONTAINS_TEST_NAME_1,
                    KeyName = "smoke_tests/rule_based_keys/array_contains",
                    ExpectedValue = "some value",
                    Context = new Dictionary<string, JsonValue>
                    {
                        { "user.SiblingNames", NewArray(new JsonValue[] { NewString("abe"), NewString("mark") }) }
                    }
                }};

            yield return new object[]{
            new TestContext
            {
                TestName = ARRAY_CONTAINS_TEST_NAME_2,
                KeyName = "smoke_tests/rule_based_keys/array_contains",
                ExpectedValue = "some default value",
                Context = new Dictionary<string, JsonValue>
                {
                    { "user.SiblingNames", NewArray(new JsonValue[] { NewString("asbe"), NewString("mark") }) }
                }
            }};

            yield return new object[]{
                new TestContext
                {
                    TestName = ARRAY_CONTAINS_TEST_NAME_3,
                    KeyName = "smoke_tests/rule_based_keys/array_contains",
                    ExpectedValue = "some default value"
                }};
        }
    }
}
