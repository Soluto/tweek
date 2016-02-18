using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Context;

namespace Engine.Rules.ValueDistribution
{
    public delegate ValueDistributor MatcherValueDistributor(string valueDistribution);
    public delegate ConfigurationValue ValueDistributor(IdentityContext context);

}
