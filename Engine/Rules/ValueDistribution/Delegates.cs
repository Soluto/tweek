using Engine.DataTypes;

namespace Engine.Rules.ValueDistribution
{
    public delegate ValueDistributor ValueDistributorParser(string valueDistribution);

    public delegate ConfigurationValue ValueDistributor(params object[] units);

    public static class Creation
    {
        public static ValueDistributor Parser(string schema)
        {
            var valueDistributor = ValueDistribution.compile_ext(schema);
            return units => new ConfigurationValue(valueDistributor(units));
        }
    }
}
