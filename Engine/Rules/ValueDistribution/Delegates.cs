using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Context;
using Engine.Core.DataTypes;

namespace Engine.Rules.ValueDistribution
{
    public delegate ValueDistributor ValueDistributorParser(string valueDistribution);

    public delegate ConfigurationValue ValueDistributor(params object[] units);

    public static class Creation
    {
        public static ValueDistributor Parser(string schema)
        {
            return (units) => new ConfigurationValue(ValueDistribution.CalculateValue(schema, units));
        }
    }
}
