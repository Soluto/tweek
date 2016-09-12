using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tweek.ApiService.Tests.Models
{
    public class TestContextProvider
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

        public static IEnumerable<object[]> COMPARISON_OPERATORS_TEST_CONTEXTS()
        {
            yield return new object[]{
                new TestContext
                {
                    TestName = COMPARISON_OPERATORS_TEST_NAME_4,
                    KeyName = "@tests/complex/comparison",
                    ExpectedValue = "value4",
                    Context = new Dictionary<string, string>
                    {
                        { "device.AgentVersion", "9.0.0.0" }
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = COMPARISON_OPERATORS_TEST_NAME_3,
                    KeyName = "@tests/complex/comparison",
                    ExpectedValue = "value3",
                    Context = new Dictionary<string, string>
                    {
                        { "device.DeviceOsVersion", "1.5.0.0" }
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = COMPARISON_OPERATORS_TEST_NAME_2,
                    KeyName = "@tests/complex/comparison",
                    ExpectedValue = "value2",
                    Context = new Dictionary<string, string>
                    {
                        { "device.AgentVersion", "4.9.0.0" }
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = COMPARISON_OPERATORS_TEST_NAME_1,
                    KeyName = "@tests/complex/comparison",
                    ExpectedValue = "value1"
                }};
        }

        public static IEnumerable<object[]> IN_OPERATOR_TEST_CONTEXTS()
        {
            yield return new object[]{
                new TestContext
                {
                    TestName = IN_OPERATOR_TEST_NAME_4,
                    KeyName = "@tests/complex/in",
                    ExpectedValue = "value4",
                    Context = new Dictionary<string, string>
                    {
                        { "device.CountryCode", "999" }
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = IN_OPERATOR_TEST_NAME_3,
                    KeyName = "@tests/complex/in",
                    ExpectedValue = "value3",
                    Context = new Dictionary<string, string>
                    {
                        { "device.AgentVersion", "4.1" }
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = IN_OPERATOR_TEST_NAME_2,
                    KeyName = "@tests/complex/in",
                    ExpectedValue = "value2",
                    Context = new Dictionary<string, string>
                    {
                        { "device.PartnerBrandId", "cellcom" }
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                   TestName = IN_OPERATOR_TEST_NAME_1,
                   KeyName = "@tests/complex/in",
                   ExpectedValue = "value1"
                }};
        }

        public static IEnumerable<object[]> MULTI_CONDITIONS_TEST_CONTEXTS()
        {
            yield return new object[]{
                new TestContext
                {
                    TestName = MULTI_CONDITONS_TEST_NAME_4,
                    KeyName = "@tests/rules/multi_conditions",
                    ExpectedValue = "value4",
                    Context = new Dictionary<string, string>
                    {
                        { "device.SubscriptionType", "HomeSupport" },
                        { "device.IsInGroup", "true" },
                        { "device.DeviceOsVersion", "2.1.0.0" },
                        { "device.AgentVersion", "3.0.0.4" },
                        { "device.DeviceType", "Laptop" },
                        { "device.DeviceVendor", "vendor3" },
                        { "device.CountryCode", "888" },
                        { "device.PartnerBrandId", "AsurionFriends" },
                        { "device.DeviceModel", "Samsung" }
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = MULTI_CONDITONS_TEST_NAME_3,
                    KeyName = "@tests/rules/multi_conditions",
                    ExpectedValue = "value3",
                    Context = new Dictionary<string, string>
                    {
                        { "device.DeviceOsType", "Android" },
                        { "device.PartnerBrandId", "cellcom" },
                        { "device.AgentVersion", "4.6.9.0" }
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = MULTI_CONDITONS_TEST_NAME_2,
                    KeyName = "@tests/rules/multi_conditions",
                    ExpectedValue = "value2",
                    Context = new Dictionary<string, string>
                    {
                        { "device.CountryCode", "887" },
                        { "device.DeviceOsVersion", "2.0.0.0" }
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = MULTI_CONDITONS_TEST_NAME_1,
                    KeyName = "@tests/rules/multi_conditions",
                    ExpectedValue = "value1"
                }};
        }
    }
}
