using System.Collections.Generic;
using Tweek.Engine.Core.Context;
using Tweek.Engine.DataTypes;
using IdentityHashSet = System.Collections.Generic.HashSet<Tweek.Engine.DataTypes.Identity>;

namespace Tweek.Engine
{
    public interface ITweek
    {
        TweekValuesResult Calculate(
            ICollection<ConfigurationPath> pathQuery,
            IdentityHashSet identities, GetLoadedContextByIdentityType context,
            ConfigurationPath[] includeFixedPaths = null);
    }
}